import { ethers } from "ethers";
import * as dotenv from 'dotenv';
dotenv.config();
import{ MyToken, MyToken__factory, TokenizedBallot, TokenizedBallot__factory} from "../typechain-types";

function setupProvider() {
    const provider = new ethers.AlchemyProvider(
      "sepolia",
      process.env.ALCHEMY_API_KEY ?? ""
    );
    return provider;
  }

  const PROPOSAL_NAMES = ["Chocolate", "Mango", "Mint", "Cookies"];
  const endTime = 
  
  async function main() {
    const provider = setupProvider();
    const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC ?? "", provider);
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
    }

    console.log("Deploying ERC20 contract");
    const MyERC20ContractFactory = new MyToken__factory();
    const MyERC20Contract_ = await MyERC20ContractFactory.deploy();
    await MyERC20Contract_.waitForDeployment();


    console.log("Deploying TokenBallot contract");
    const contractfactory_ = new TokenizedBallot__factory(wallet);
    const tokenizedContract = await contractfactory_.deploy(
        PROPOSAL_NAMES.map(ethers.encodeBytes32String),
        MyERC20Contract_.getAddress(),
        lastBlock?.number ?? 0,
        endTime
      
    );
    await tokenizedContract.waitForDeployment();


    const tokenizedAddress = await tokenizedContract.getAddress();
    console.log(`Contract deployed at address ${tokenizedAddress}`);
  }
  
  main().catch((error) => {
    console.error(error); 
    process.exitCode = 1
});