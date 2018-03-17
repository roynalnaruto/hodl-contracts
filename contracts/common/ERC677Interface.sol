pragma solidity ^0.4.15;

contract ERC677Interface {
  function tokenFallback(address _from, uint256 _amount, bytes32 _data) public returns (bool _success);
}
