// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import './JKPLibrary.sol';

interface IJoKenPo {
    
    function getResult() external view returns (string memory);

    function getBid() external view returns (uint256);

    function getCommission() external view returns (uint8);

    function setBid(uint256 newBid) external;

    function setCommission(uint8 newCommission) external;

    function getBalance() external view returns (uint256);

    function play(JKPLibrary.Options newChoice) external payable;

    function getLeaderboard() external view returns (JKPLibrary.Player[] memory);
}
