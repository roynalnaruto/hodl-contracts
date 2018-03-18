pragma solidity ^0.4.15;

import "../HodlFactory.sol";

contract MockHodlFactory is HodlFactory {

  function MockHodlFactory() public HodlFactory() {}

  function test_if_from_hodl_contracts()
           if_from_hodl_contracts()
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = true;
  }

  function test_if_eth_unlock_valid(uint256 _amount)
           if_eth_unlock_valid(_amount)
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = true;
  }

  function test_if_token_unlock_valid(address _token_address, uint256 _amount)
           if_token_unlock_valid(_token_address, _amount)
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = true;
  }

  function set_eth_count(uint256 _amount)
           public
           returns (bool _success)
  {
    hodl_eth_count = _amount;
    _success = true;
  }

  function set_token_count(address _token_address, uint256 _amount)
           public
           returns (bool _success)
  {
    hodl_tokens_count[_token_address] = _amount;
    _success = true;
  }
}
