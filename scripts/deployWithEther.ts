import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
// production env
import * as dotenv from 'dotenv';
dotenv.config();

// only for demo - > always use input_val
// const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  const proposals = process.argv.slice(2);
//   console.log("Deploying Ballot contract");
//   console.log("Proposals: ");
//   proposals.forEach((element, index) => {
//     console.log(`Proposal N. ${index + 1}: ${element}`);
//   });
  // bug shown up if direct init factory >> no signer
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);


  const lastBlock = await provider.getBlock("latest");
  console.log({lastBlock});

  console.log(`using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`wallet balance ${balance}`);
  if (balance < 0.01){
    throw new Error("not enough ether, change another wallet")
  }

  // starting point
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = await ballotFactory.deploy(
    proposals.map(ethers.encodeBytes32String)
  );
  await ballotContract.waitForDeployment();
  const address = await ballotContract.getAddress();
  console.log(`Contract deployed at address ${address}`);
  
  for (let index = 0; index < proposals.length;index++){ 
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log ({index,name,proposal}); // console log shown in terminal

  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});