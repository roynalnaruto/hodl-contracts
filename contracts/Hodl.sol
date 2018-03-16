pragma solidity ^0.4.15;

contract Hodl {
  address public hodler;
  uint256 public locked_up_until;
  bool public locked;

  modifier if_not_locked() {
    require(locked == false);
    _;
  }

  function Hodl(address _hodler) public {
    hodler = _hodler;
    locked = false;
  }
}
