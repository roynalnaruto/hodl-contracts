pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../common/ERC677Interface.sol";

contract MockERC677Token is StandardToken {
  string public constant name = "Mock 677";
  string public constant symbol = "M677";
  uint8 public constant decimals = 8;
  uint256 internal constant INITIAL_SUPPLY = 1000000;

  function MockERC677Token() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }

  function transferAndCall(address _receiver, uint256 _amount, bytes32 _data)
           public
           returns (bool _success)
  {
    transfer(_receiver, _amount);
    require(ERC677Interface(_receiver).tokenFallback(msg.sender, _amount, _data));
    _success = true;
  }
}
