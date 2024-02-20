// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
//import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./INFTCollection.sol";

contract Destripe is ERC721Holder, Ownable {
    INFTCollection public nftCollection;
    IERC20 public acceptedToken;

    uint public monthlyAmount = 0.001 ether;
    uint private constant thirtyDaysInSeconds = 30 * 24 * 60 * 60;

    struct Customer {
        uint tokenId;
        uint nextPayment;
        uint index;
    }

    mapping(address => Customer) public payments; //customer address => payment info
    address[] public customers; //customer addresses

    event Paid(address indexed customer, uint date, uint amount);
    event Granted(address indexed customer, uint tokenId, uint date);
    event Revoked(address indexed customer, uint tokenId, uint date);
    event Removed(address indexed customer, uint tokenId, uint date);

    constructor(address tokenAddress, address nftAddress) Ownable(msg.sender) {
        acceptedToken = IERC20(tokenAddress);
        nftCollection = INFTCollection(nftAddress);
    }

    function getCustomers() external view returns (address[] memory) {
        return customers;
    }

    function setMonthlyAmount(uint newAmount) external onlyOwner {
        monthlyAmount = newAmount;
    }

    function removeCustomer(address customer) external onlyOwner {
        uint tokenId = payments[customer].tokenId;
        nftCollection.burn(tokenId);

        delete customers[payments[customer].index];
        delete payments[customer];

        emit Removed(customer, tokenId, block.timestamp);
    }

    function pay(address customer) external onlyOwner {
        bool thirtyDaysHavePassed = payments[customer].nextPayment <=
            block.timestamp;
        bool firstPayment = payments[customer].nextPayment == 0;
        bool hasAmount = acceptedToken.balanceOf(customer) >= monthlyAmount;
        bool hasAllowance = acceptedToken.allowance(customer, address(this)) >=
            monthlyAmount;

        if (
            (thirtyDaysHavePassed || firstPayment) &&
            (!hasAmount || !hasAllowance)
        ) {
            if (!firstPayment) {
                nftCollection.safeTransferFrom(
                    customer,
                    address(this),
                    payments[customer].tokenId
                );

                emit Revoked(
                    customer,
                    payments[customer].tokenId,
                    block.timestamp
                );
                return;
            } else revert("Insufficient balance and/or allowance.");
        }

        if (firstPayment) {
            nftCollection.mint(customer);
            payments[customer].tokenId = nftCollection.getLastTokenId();
            payments[customer].index = customers.length;
            customers.push(customer);

            emit Granted(customer, payments[customer].tokenId, block.timestamp);
        }

        if (thirtyDaysHavePassed || firstPayment) {
            acceptedToken.transferFrom(customer, address(this), monthlyAmount);

            if (firstPayment)
                payments[customer].nextPayment = block.timestamp + thirtyDaysInSeconds;
            else payments[customer].nextPayment += thirtyDaysInSeconds;

            emit Paid(customer, block.timestamp, monthlyAmount);

            if (
                payments[customer].nextPayment > block.timestamp &&
                nftCollection.ownerOf(payments[customer].tokenId) != customer
            ) {
                nftCollection.safeTransferFrom(
                    address(this),
                    customer,
                    payments[customer].tokenId
                );

                emit Granted(
                    customer,
                    payments[customer].tokenId,
                    block.timestamp
                );
            }
        }
    }
}