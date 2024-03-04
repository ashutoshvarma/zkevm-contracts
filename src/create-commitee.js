/* eslint-disable no-console */
const hre = require('hardhat');

const DAC_CONTRACT_ADDRESS = '0x0454CBD42C046A56FF99E667658ab8167e176cB3';
const MEMBERS = [
    {
        address: '0xbDf4375ebbdee3faDe7912C1D188D0E12630849E',
        url: 'http://dac-node-1.zkevm.svc.cluster.local:8444/',
    },
    {
        address: '0xfF76e19cD574121eF2D63C59772091d9546BB1ff',
        url: 'http://dac-node-2.zkevm.svc.cluster.local:8444/',
    },
    {
        address: '0xF342D69fa0633CB67431cc6F4391f6A645BDcDEE',
        url: 'http://dac-node-3.zkevm.svc.cluster.local:8444/',
    },
].sort((a, b) => {
    if (hre.ethers.toBigInt(a.address) > hre.ethers.toBigInt(b.address)) {
        return 1;
    }
    return -1;
});

async function main() {
    const { ethers } = hre;
    const deployer = ethers.HDNodeWallet.fromMnemonic(
        ethers.Mnemonic.fromPhrase(process.env.MNEMONIC),
        "m/44'/60'/0'/0/0",
    ).connect(ethers.provider);

    const PolygonDataCommitee = await ethers.getContractAt('PolygonDataCommittee', DAC_CONTRACT_ADDRESS, deployer);

    const requiredAmountOfSignatures = MEMBERS.length;
    const urls = MEMBERS.map((m) => m.url);
    const addrBytes = MEMBERS.reduce((acc, curr) => acc + curr.address.slice(2), '0x');
    console.log('New Commitee Details:');
    console.log(`\trequiredAmountOfSignatures=${requiredAmountOfSignatures}`);
    console.log(`\turls=${urls}`);
    console.log(`\taddrBytes=${addrBytes}`);

    const setupTx = await PolygonDataCommitee.setupCommittee(requiredAmountOfSignatures, urls, addrBytes);
    console.log(`Setting up committee with ${MEMBERS.length} members...`);
    await setupTx.wait();

    const committeeHash = await PolygonDataCommitee.committeeHash();
    console.log(`Committee updated, new committee hash - ${committeeHash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
