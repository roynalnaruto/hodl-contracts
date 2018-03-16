pragma solidity ^0.4.15;

import "./Hodl.sol";

contract HodlFactory {
  address public daddy_hodler;
  address[] public hodlers;
  uint256 public eth_count;
  mapping(address => uint256) public hodl_tokens_count;
  mapping(address => bool) public hodl_contracts;

  modifier is_from_hodl_contracts() {
    require(hodl_contracts[msg.sender] == true);
    _;
  }

  function HodlFactory() public {
    daddy_hodler = msg.sender;
    eth_count = 0;
  }

  function getHodlers()
           public
           constant
           returns (address[] _hodlers)
  {
    _hodlers = hodlers;
  }

  function isHodlContractValid(address _hodl_contract)
           public
           constant
           returns (bool _is_valid)
  {
    _is_valid = hodl_contracts[_hodl_contract];
  }

  function birthOfHodler()
           public
           returns (address _new_hodl_at)
  {
    Hodl new_hodl = new Hodl(msg.sender);
    hodlers.push(msg.sender);
    _new_hodl_at = address(new_hodl);
    hodl_contracts[_new_hodl_at] = true;
  }
}
