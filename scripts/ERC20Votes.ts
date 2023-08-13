import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";


const MINT_VALUE =ethers.parseUnits("1"); 
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
    `Account ${acc1.address} has ${balanceBN.toString()} decimal units of MyToken\n`
    );

    // Give voting tokens
    

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
    }

main().catch((error) => {
    console.error(error); 
    process.exitCode = 1
})