pragma solidity ^0.4.15;

import "./Hodl.sol";

contract HodlFactory {
  address public daddy_hodler;

  function HodlFactory() public {
    daddy_hodler = msg.sender;
  }

  function birthOfHodler()
           public
           returns (address _new_hodl_at)
  {
    Hodl new_hodl = new Hodl(msg.sender);
    _new_hodl_at = address(new_hodl);
  }
}
