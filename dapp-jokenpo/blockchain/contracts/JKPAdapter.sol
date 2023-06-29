// SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.17;

import './IJoKenPo.sol';
 
contract JKPAdapter {

    IJoKenPo private joKenPo;
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        require(newImplementation != address(0), "Empty address is not permitted");
        joKenPo = IJoKenPo(newImplementation);
    }
}