import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";


const MINT_VALUE = ethers.parseUnits("2"); 
const hre = require("hardhat");


async function main() {
    const [deployer, acc1, acc2] = await ethers.getSigners();
    const contractFactory = new MyToken__factory(deployer);
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Token contract deployed at ${contractAddress} \n`);


    // Mint some tokens
    const mintTx = await contract.mint(acc1.address, MINT_VALUE);
    await mintTx.wait();
    console.log(
        `Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.address}`);
    const balanceBN = await contract.balanceOf(acc1.address);
    console.log(
    `Account ${acc1.address} has ${balanceBN.toString()} decimal units of MyToken\n`);
    

    // Check the voting power
    const votes = await contract.getVotes(acc1.address);
    console.log(
        `Account ${acc1.address} has ${votes.toString()} units of voting power before selfdelegate\n`
        );

    // Self delegate
    const delegateTx = await contract.connect(acc1).delegate(acc1.address);
    await delegateTx.wait();


    // Check the voting power
    const votesAfter = await contract.getVotes(acc1.address);
    console.log(`Account ${acc1.address} has ${votesAfter.toString()} units of voting power after self delegating\n`
     );

    // Transfers tokens
    const makeTransfer = await contract.connect(acc1).transfer(acc2.address, MINT_VALUE / 2n);
    await makeTransfer.wait();

    // Checks voting power
    const votes1AfterTransfer = await contract.getVotes(acc1.address);
    console.log(`Account ${acc1.address} has ${votes1AfterTransfer.toString()} units of voting power after transfering\n`)

    const votes2AfterTransfer = await contract.getVotes(acc2.address);
    console.log(`Account ${acc2.address} has ${votes2AfterTransfer.toString()} units of voting power after self delegating\n`)

    // Delegating tokens for account2
    const delegate2 = await contract.connect(acc1).delegate(acc2.address);
    await delegate2.wait();
    const votingPower2 = await contract.getVotes(acc2.address);
    console.log(`Account ${acc2.address} has ${votingPower2.toString()} power of votes\n`);

    // Check past voting power
    const lastBLock = await ethers.provider.getBlock("latest");
    const lastBLockNumber = lastBLock?.number ?? 0;

    for (let index = lastBLockNumber - 1; index > 0; index--) {
        const pastVotes = await contract.getPastVotes(acc1.address, index);
        console.log(`Account ${acc1.address} had ${pastVotes.toString()} units of voting power at block ${index}\n`);
    }


    }

main().catch((error) => {
    console.error(error); 
    process.exitCode = 1
})