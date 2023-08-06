import { Contract, ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
// production env
import * as dotenv from 'dotenv';
 dotenv.config();

    async function main() {
    const parameter = process.argv.slice(2);
    const contractAddress = parameter[0];
    

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
    
    // init voterAddresses - first elem is contract_address
    const voterAddresses: string[] = [];
    for (let index = 1; index < parameter.length; index++) {
        {
            voterAddresses.push(parameter[index]);
        }
    }
console.log (ballotContract.voters);
  // give voting rights
  for (let index = 0; index < voterAddresses.length; index++) {
    try {
        if (voterAddresses[index] in ballotContract.voters){
            continue
        }
        else {
      const tx = await ballotContract.giveRightToVote(voterAddresses[index]);
      console.log(`Give voting rights transaction for address ${voterAddresses[index]}:`, tx.hash);
    }} catch (error) {
      console.error(`Error while giving voting rights to address ${voterAddresses[index]}:`, error);
      return
    }
  }

  // format update
  // delegating votes -  final voter give rights to the second final voter
  
    const delegateAddress = voterAddresses[voterAddresses.length - 1];
    const voter_test_delegate_address = voterAddresses[voterAddresses.length - 2];

    try {
        const tx = await ballotContract.delegate(delegateAddress, { from: voter_test_delegate_address });
        console.log(`After delegation, the delegateAddress becomes [receiver]: ${delegateAddress}`);
        console.log(`After delegation, the voter_test_delegate_address becomes [giver]: ${voter_test_delegate_address}`);
        console.log(`Checking the transaction after delegation operation >> ${tx}`);
      } catch (error) {
        console.error('Error while delegating votes:', error);
        return
      }

      
    // might not require to know specific proposal been included
    // voting process >> first voter voter proposal 1, other all vote proposal 2
    // const proposals = [];
    // const inputDeployLength = 3; // pre-determined
    // for (let index = 0; index < inputDeployLength; index++) {
    // const proposal = await ballotContract.proposals(index);
    // proposals.push(proposal);
    // };
    // voting process >> first voter votes for proposal 1, all others vote for proposal 2
  for (let index = 0; index < voterAddresses.length; index++) {
    try {
      if (index == 0) {
        const votingForOne = voterAddresses[index];
        await ballotContract.vote(1, { from: votingForOne }); // Vote for proposal 0
      } else {
        await ballotContract.vote(2, { from: voterAddresses[index] });
      }
    } catch (error) {
      console.error(`Error while voting for address ${voterAddresses[index]}:`, error);
      return
    }
  }
  try {
    await ballotContract.winningProposal();
    // checking result
    const winner = await ballotContract.winnerName;
    console.log(`Winner proposal is ${winner}`);
  } catch (error) {
    console.error('Error while calculating the winning proposal:', error);
    return
  }
}



main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});