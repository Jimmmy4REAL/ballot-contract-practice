// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot  {
    IMyToken tokenContract;

    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    mapping(address => uint256) votingPowerSpent;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    uint256 public targetBlockNumber;
    uint256 public endDate;
    bool public hasEnded;

    /// Create a new ballot to choose one of `proposalNames`.
    /// Choses a `_targetBlockNumber`from where to count the votes.
    /// Decides end of the voting.
    constructor(bytes32[] memory proposalNames, address _tokenContract, uint256 _targetBlockNumber, uint256 _endVoting) {
        require(_targetBlockNumber < block.timestamp);
        require(_endVoting > block.timestamp);
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;
        endDate = block.timestamp + _endVoting;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal, uint256 amount) external {
        require(votingPower(msg.sender) >= amount, "Trying to vote more than allowed");
        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;

    }

    function votingPower(address account) public view returns (uint256) {
        return tokenContract.getPastVotes(account, targetBlockNumber) - votingPowerSpent[account];

    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        if (block.timestamp == endDate) {
            winnerName_ = proposals[winningProposal()].name;
            hasEnded == true;
        }
    }

    // Function to querry on chain
    function votingEnded() public view returns (bool) {
        return hasEnded;
    }
} 