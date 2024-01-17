// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket {

    using Counter for Counters.Counter;
    Counters.Counter uint private _itemIds;
    Counters.Counter uint private _itemsSold;

    address payable owner;
    uint public listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
    }

    mapping (uint => MarketItem) public marketItem; // itemId => MarketItem

    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint indexed tokenId,
        address seller,
        uint price
    );

    function createMarketItem(address nftContract, uint tokenId, uint price)  public payable {
        require(price > 0, "Price cannot be 0");
        require(msg.value == listingPrice, "Value must be equal to listing price");

        _itemIds.increment();
        uint itemId = _itemIds.current();
        marketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, price);
    }
}
