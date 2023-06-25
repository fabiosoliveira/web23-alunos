// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProtoCoin is ERC20 {

    address immutable _owner;
    uint private _mintAmount = 0;
    uint64 private _minDelay = 60 * 60 * 24; // 1 day in seconds

    mapping(address => uint256) private nextMin;

    constructor() ERC20("New ProtoCoin", "NPC") {
        _owner = msg.sender;
        _mint(msg.sender, 10000000 * 10 ** 18);
    }

    function mint(address to) public restricted {
        require(_mintAmount > 0, "Minting is not enabled.");
        require(block.timestamp > nextMin[to], "You cannot mint twice in a row.");
        _mint(to, _mintAmount);

        nextMin[to] = block.timestamp + _minDelay;
    }

    function setMintAmount(uint256 newAmount) public restricted {
        _mintAmount = newAmount;
    }

    function setMintDelay(uint64 delayInSeconds) public restricted {
        _minDelay = delayInSeconds;
    }

    modifier restricted() {
        require(msg.sender == _owner, "You do not haver permission.");
        _;
    }
}