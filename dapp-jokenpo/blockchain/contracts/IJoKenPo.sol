// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IJoKenPo {
    enum Options {
        NONE,
        ROCK,
        PAPER,
        SCISSORS
    }

    struct Player {
        address wallet;
        uint32 wins;
    }

    function getResult() external view returns (string memory);

    function getBid() external view returns (uint256);

    function getCommission() external view returns (uint8);

    function setBid(uint256 newBid) external;

    function setCommission(uint8 newCommission) external;

    function getBalance() external view returns (uint256);

    function play(Options newChoice) external payable;

    function getLeaderboard() external view returns (Player[] memory);
}
