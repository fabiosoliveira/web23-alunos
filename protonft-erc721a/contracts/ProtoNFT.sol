// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "erc721a/contracts/ERC721A.sol";

contract ProtoNFT is ERC721A {

    address payable private _owner;

    constructor() ERC721A("ProtoNFT", "PNFT") {
        _owner = payable(msg.sender);
    }

    function  mint(uint256 quantity) public payable {
        require(msg.value >= 0.01 ether * quantity, "Insufficient payment");
        _mint(msg.sender, quantity);
    }

    function burn(uint256 tokenId) external {
        super._burn(tokenId);
    }

    function withdraw() external {
        require(msg.sender == _owner, "You do not have permission");
        uint256 amount = address(this).balance;
        (bool success,) = _owner.call{value: amount}("");
        require(success == true, "Failed to withdraw");
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://www.fabio.com.br/nfts/";
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A) returns (string memory) {
        return string.concat(super.tokenURI(tokenId), ".json");
    }
}
