pragma solidity ^0.4.15;

import "./HodlFactory.sol";

contract Hodl {
  address public hodler;
  address public factory;
  uint256 internal locked_up_until;
  bool internal locked;

  modifier if_not_locked() {
    require(locked == false);
    _;
  }

  modifier if_valid_lockup_time(uint256 _until) {
    require(_until > now + 1 years);
    _;
  }

  modifier if_from_hodler() {
    require(msg.sender == hodler);
    _;
  }

  function factory_contract()
           private
           constant
           returns (HodlFactory _hodl_factory)
  {
    _hodl_factory = HodlFactory(factory);
  }

  function Hodl(address _hodler) public {
    hodler = _hodler;
    locked = false;
    factory = msg.sender;
  }

  function internal_lock(uint256 _locked_up_until)
           internal
           returns (bool _success)
  {
    locked_up_until = _locked_up_until;
    locked = true;
    _success = true;
  }

  function lock(uint256 _locked_up_until)
           if_valid_lockup_time(_locked_up_until)
           if_not_locked()
           if_from_hodler()
           public
           returns (bool _success)
  {
    _success = internal_lock(_locked_up_until);
  }

  function getLockedUntil()
           if_from_hodler()
           public
           constant
           returns (uint256 _locked_up_until)
  {
    _locked_up_until = locked_up_until;
  }
}
