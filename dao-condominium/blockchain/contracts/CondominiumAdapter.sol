// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {CondominiumLib as Lib} from './CondominiumLib.sol';
import './ICondominium.sol';

contract CondominiumAdapter {

    ICondominium private implementation;
    address public immutable owner;

    constructor(){
        owner = msg.sender;
    }

    modifier upgraded(){
        require(address(implementation) != address(0), "You must upgrade first");
        _;
    }

    function getAddress() external view returns (address) {
        return address(implementation);
    }
    
    function upgrade(address newImplementation) external{
        require(owner == msg.sender, "You do not have permission");
        implementation = ICondominium(newImplementation);
    }

    function addResident(address resident, uint16 residenceId) external upgraded {
        return implementation.addResident(resident, residenceId);
    }

    function removeResident(address resident) external upgraded {
        return implementation.removeResident(resident);
    }

    function setCounselor(address resident, bool isEntering) external upgraded {
        return implementation.setCounselor(resident, isEntering);
    }

    function addTopic(string memory title, string memory description, Lib.Category category, uint amount, address responsible) external upgraded {
        return implementation.addTopic(title, description, category, amount, responsible);
    }

    function editTopic(string memory topicToEdit, string memory description, uint amount, address responsible) external upgraded {
        return implementation.editTopic(topicToEdit, description, amount, responsible);
    }

    function removeTopic(string memory title) external upgraded {
        return implementation.removeTopic(title);
    }

    function openVoting(string memory title) external upgraded {
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external upgraded {
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external upgraded {
        return implementation.closeVoting(title);
    }

    function payQuota(uint16 residenceId) external payable upgraded {
        return implementation.payQuota{value: msg.value}(residenceId);
    }

    function transfer(string memory topic, uint amount) external upgraded {
        return implementation.transfer(topic, amount);
    }
}
