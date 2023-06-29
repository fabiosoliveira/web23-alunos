// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.17;

import './IJoKenPo.sol';
import './JKPLibrary.sol';
 
contract JKPAdapter {

    IJoKenPo private joKenPo;
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    function getAddress() external view returns (address) {
        return address(joKenPo);
    }

    function getResult() external view upgrated returns (string memory) {
        return joKenPo.getResult();
    }

    function getBid() external view returns (uint256) {
        return joKenPo.getBid();
    }

    function getCommission() external view returns (uint8) {
        return joKenPo.getCommission();
    }

    function setBid(uint256 newBid) external restricted {
        joKenPo.setBid(newBid);
    }

    function setCommission(uint8 newCommission) external restricted {
        joKenPo.setCommission(newCommission);
    }

    function getBalance() external view returns (uint256) {
        return joKenPo.getBalance();
    }

    function play(JKPLibrary.Options newChoice) external payable upgrated {
        joKenPo.play{value: msg.value}(newChoice);
    }

    function getLeaderboard() external view returns (JKPLibrary.Player[] memory) {
        return joKenPo.getLeaderboard();
    }

    function upgrade(address newImplementation) external restricted {
        require(address(0) != newImplementation, "The address is required");
        joKenPo = IJoKenPo(newImplementation);
    }

    modifier restricted(){
        require(msg.sender == owner, "You do not have permission");
        _;
    }

    modifier upgrated() {
        require(address(joKenPo) != address(0), "You must upgrade first");
        _;
    }
}