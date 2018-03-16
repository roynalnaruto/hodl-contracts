pragma solidity ^0.4.15;

import "../Hodl.sol";

contract MockHodl is Hodl {

  function MockHodl(address _hodler) public Hodl(_hodler) {}

  function test_if_not_locked()
           if_not_locked()
           public
           constant
           returns (bool _not_locked)
  {
    _not_locked = true;
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

  function set_locked(uint256 _locked_up_until)
           public
           returns (bool _success)
  {
    _success = internal_lock(_locked_up_until);
  }
}
