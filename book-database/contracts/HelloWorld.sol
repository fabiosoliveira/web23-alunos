// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HelloWorld {
	string public message = "Hello World!";

	function setMessage(string memory newMessage) public {
		message = newMessage;
	}
}
