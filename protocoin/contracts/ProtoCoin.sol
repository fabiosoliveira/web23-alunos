// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract ProtoCoin {

	string public name = "ProtoCoin";
	string public symbol = "PRC";
	uint8 public decimal = 18;
	uint256 public totalSuply = 1000 * 10 ** decimal;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	mapping(address => uint256) private _balances;

	constructor() {
		_balances[msg.sender] = totalSuply;
	}

	function balanceOf(address _owner) public view returns (uint256 balance) {
		return _balances[_owner];
	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(balanceOf(msg.sender) >= _value, "Insufficient balance");
		_balances[msg.sender] -= _value;
		_balances[_to] += _value;

		emit Transfer(msg.sender, _to, _value);
		
		return true;
	}
}
