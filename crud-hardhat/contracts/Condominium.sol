// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Condominium {
    address public manager; //Ownable
    mapping (uint16 => bool) public residences; // unidade => true
    mapping (address => uint16) public residents; // wallet => unidade (1101) (2505)
    mapping (address => bool) public counselors; // conselheiro => true

    constructor() {
        manager = msg.sender;

        for (uint8 i = 1; i <= 2; i++) { //os blocos
            for (uint8 j = 1; j <= 5; j++) { //os andares
                for (uint8 k = 1; k <= 5; k++) { //as unidades
                    residences[(i * 1000) + (j * 100) + k] = true;
                }
            }
        }
    }
}
