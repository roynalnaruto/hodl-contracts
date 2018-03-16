pragma solidity ^0.4.15;

import "../HodlFactory.sol";

contract MockHodlFactory is HodlFactory {

  function MockHodlFactory() public HodlFactory() {}

  function test_is_from_hodl_contracts()
           is_from_hodl_contracts()
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = true;
  }
}
