pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract MockERC20Token is StandardToken {
  string public constant name = "Mock 20";
  string public constant symbol = "M20";
  uint8 public constant decimals = 8;
  uint256 internal constant INITIAL_SUPPLY = 1000000;

  function MockERC20Token() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}
