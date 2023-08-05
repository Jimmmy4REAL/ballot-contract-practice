import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return bytes32Array;
}

async function deployContract() {
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.waitForDeployment();
  return ballotContract;
}

// testing start

describe("Ballot", async () => {
  let ballotContract: Ballot;

  beforeEach(async () => {
    ballotContract = await loadFixture(deployContract);
  });

  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.decodeBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });
  
    it("has zero votes for all proposals", async () => {
        for (let index = 0; index < PROPOSALS.length; index++) {
            const proposal = await ballotContract.proposals(index);
            expect(proposal.voteCount).to.eq(0n) 
    }
});
    it("sets the deployer address as chairperson", async () => {
      // This test checks if the deployer address is set as the chairperson.
      const accounts = await ethers.getSigners();
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.equal(accounts[0].address);
    });
    });
    it("sets the voting weight for the chairperson as 1", async () => {
        const accounts = await ethers.getSigners();
        const chairpersonVoter = await ballotContract.voters(accounts[0].address);
        expect(chairpersonVoter.weight).to.eq(1)

    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    let ballotContract: Ballot;

    it("gives right to vote for another address", async () => {
        const accounts = await ethers.getSigners();
        const voterAddress = accounts[1].address;
  
        await ballotContract.giveRightToVote(voterAddress);
        // check if voter equal to one
        const voter = await ballotContract.voters(voterAddress);
        expect(voter.weight).to.eq(1);
    });
    it("can not give right to vote for someone that has voted", async () => {
        // This test checks if the chairperson cannot give voting rights to an address that has already voted.
        const accounts = await ethers.getSigners();
        const voterAddress = accounts[1].address;
  
        await ballotContract.vote(0, { from: voterAddress }); // Vote for a proposal
        await expect(ballotContract.giveRightToVote(voterAddress)).to.be.revertedWith(
          "The voter already voted."
        );
      });


    it("can not give right to vote for someone that has already voting rights", async () => {
      // This test checks if the chairperson cannot give voting rights to an address that already has voting rights.
      const accounts = await ethers.getSigners();
      const voterAddress = accounts[1].address;

      await ballotContract.giveRightToVote(voterAddress); // Give voting rights first time
      await expect(ballotContract.giveRightToVote(voterAddress)).to.be.revertedWith(
        "Voter already has voting rights."
      );
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    let ballotContract: Ballot;
    it("should register the vote", async () => {
      // This test checks if the voter can register their vote.
      const accounts = await ethers.getSigners();
      const voterAddress = accounts[1].address;

      await ballotContract.giveRightToVote(voterAddress); // Give voting rights
      await ballotContract.vote(0, { from: voterAddress }); // Vote for proposal 0

      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.eq(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    let ballotContract: Ballot;
    it("should transfer voting power", async () => {
      // This test checks if the voter can delegate their voting power to another address.
      const accounts = await ethers.getSigners();
      const voterAddress = accounts[1].address;
      const delegateAddress = accounts[2].address;

      await ballotContract.giveRightToVote(voterAddress); // Give voting rights
      await ballotContract.delegate(delegateAddress, { from: voterAddress });

      const voter = await ballotContract.voters(voterAddress);
      const delegate = await ballotContract.voters(delegateAddress);
      expect(voter.weight).to.eq(0);
      expect(delegate.weight).to.eq(2); // Voter's weight (1) + Delegate's weight (1)
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    let ballotContract: Ballot;
    it("should revert", async () => {
      // This test checks if an account other than the chairperson cannot give voting rights.
      const accounts = await ethers.getSigners();
      const voterAddress = accounts[1].address;

      await expect(ballotContract.connect(accounts[1]).giveRightToVote(voterAddress)).to.be.revertedWith(
        "Only chairperson can give right to vote."
      );
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    // TODO
    it("should transfer voting power", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      throw Error("Not implemented");
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      throw Error("Not implemented");
    });
});
