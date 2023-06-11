// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract HelloWorld {

    int8 private _age = 34;

    function getAge() public view returns(int8) {
        return _age;
    }

    function setAge(int8 newAge) public {
        _age = newAge;
    }
}