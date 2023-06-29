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

    function play(JKPLibrary.Options newChoice) external payable upgrated {

    }

    modifier upgrated() {
        require(msg.sender == owner, "You do not have permission");
        _;
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        require(newImplementation != address(0), "Empty address is not permitted");
        joKenPo = IJoKenPo(newImplementation);
    }
}