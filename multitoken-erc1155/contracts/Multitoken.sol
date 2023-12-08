// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/String.sol";

contract Multitoken is ERC1155, ERC1155Burnable {

    uint public constant NFT_0 = 0;
    uint public constant NFT_1 = 1;
    uint public constant NFT_2 = 2;

    uint[] public currentSupply = [50, 50, 50];

    uint public tokenPrice = 0.01 ether;

    string public constant BASE_URL = "https://www.fabio.com.br/tokens/";

    address payable public immutable owner;

    constructor() ERC1155(BASE_URL) {
        owner = payable(msg.sender);
    }

    function mint(uint256 id) external payable {
        require(id < 3, "This token does not exist");
        require(msg.value >= tokenPrice, "Insuficient payment");
        require(currentSupply[id] > 0, "Max supply reached");

        _mint(msg.sender, id, 1, "");
        currentSupply[id]--;
    }

    function uri(uint256 id) public pure override returns (string memory) {
        return string.concat(BASE_URL, Strings.toString(id), ".json");
    }

    function withdraw() external {
        require(msg.sender == owner, "You do not have permission");

        uint256 amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success == true, "Failed to withdraw");
    }
}
