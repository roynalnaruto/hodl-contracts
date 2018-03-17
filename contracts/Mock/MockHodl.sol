pragma solidity ^0.4.15;

import "../Hodl.sol";

contract MockHodl is Hodl {

  function MockHodl(address _hodler) public Hodl(_hodler) {}

  function test_if_eth_not_locked()
           if_eth_not_locked()
           public
           constant
           returns (bool _eth_not_locked)
  {
    _eth_not_locked = true;
  }

  function test_if_token_not_locked(address _token_address)
           if_token_not_locked(_token_address)
           public
           constant
           returns (bool _token_not_locked)
  {
    _token_not_locked = true;
  }

  function test_if_valid_lockup_time(uint256 _until)
           if_valid_lockup_time(_until)
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = true;
  }

  function test_if_from_hodler()
           if_from_hodler()
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function test_if_called_by_hodler(address _from)
           if_called_by_hodler(_from)
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function test_if_valid_eth_balance()
           if_valid_eth_balance()
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function test_if_valid_token_balance(address _token_address)
           if_valid_token_balance(_token_address)
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function test_if_eth_balances_match()
           if_eth_balances_match()
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function test_if_token_balances_match(address _token_address)
           if_token_balances_match(_token_address)
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function set_eth_locked(uint256 _eth_locked_up_until)
           public
           returns (bool _success)
  {
    _success = internal_lock_eth(_eth_locked_up_until);
  }

  function set_token_locked(address _token_address, uint256 _token_locked_up_until)
           public
           returns (bool _success)
  {
    _success = internal_lock_token(_token_address, _token_locked_up_until);
  }

  // fallback function to allow sending ether
  function () public payable {}
}
