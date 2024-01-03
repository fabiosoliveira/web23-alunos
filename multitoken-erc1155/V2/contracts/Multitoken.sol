// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract Multitoken is Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable {

    uint public constant NFT_0 = 0;
    uint public constant NFT_1 = 1;
    uint public constant NFT_2 = 2;

    uint public tokenPrice;
    uint public maxSupply;

    string public constant BASE_URL = "ipfs://QmZymW65mbp4MD35FSb4K9Y4vLMVAZEtWnygwU24X4MD8T/";

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) initializer public {
        __ERC1155_init(BASE_URL);
        __ERC1155Burnable_init();
        __Ownable_init(initialOwner);
        __ERC1155Supply_init();
        tokenPrice = 0.01 ether;
        maxSupply = 50;
    }

    function mint(uint256 id) external payable {
        require(id < 3, "This token does not exist");
        require(msg.value >= tokenPrice, "Insufficient payment");
        require(totalSupply(id) < maxSupply, "Max supply reached");

        _mint(msg.sender, id, 1, "");
    }

    function uri(uint256 id) public pure override returns (string memory) {
        require(id < 3, "This token does not exist");
        return string.concat(BASE_URL, Strings.toString(id), ".json");
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
    {
        super._update(from, to, ids, values);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        address payable recipient = payable(owner());
        (bool success, ) = recipient.call{value: amount}("");
        require(success == true, "Failed to withdraw");
    }
}
