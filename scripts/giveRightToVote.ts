import { Contract, ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
// production env
import * as dotenv from 'dotenv';
dotenv.config();

// only for demo - > always use input_val
// const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  const parameter = process.argv.slice(2);
//   console.log("Deploying Ballot contract");
//   console.log("Proposals: ");
//   proposals.forEach((element, index) => {
//     console.log(`Proposal N. ${index + 1}: ${element}`);
//   });
  // bug shown up if direct init factory >> no signer
  const contractAddress = parameter[0];
  const voterAddress = parameter[1];

  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  console.log(`using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`wallet balance ${balance}`);
  if (balance < 0.01){
    throw new Error("not enough ether, change another wallet")
  }

  // starting point
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = ballotFactory.attach(contractAddress) as Ballot;
  
  // give voting rights
  const tx = await ballotContract.giveRightToVote(voterAddress);
  console.log(tx)
  

  // delegating votes 
  
  // casting votes

  // querying results
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});