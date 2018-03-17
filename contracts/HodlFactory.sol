pragma solidity ^0.4.15;

import "./Hodl.sol";

contract HodlFactory {
  address public daddy_hodler;
  address[] public hodlers;
  mapping(address => bool) public hodl_contracts;
  uint256 public hodl_eth_count;
  mapping(address => uint256) public hodl_tokens_count;

  modifier if_from_hodl_contracts() {
    require(hodl_contracts[msg.sender] == true);
    _;
  }

  modifier if_eth_unlock_valid(uint256 _amount) {
    require(_amount <= hodl_eth_count);
    _;
  }

  modifier if_token_unlock_valid(address _token_address, uint256 _amount) {
    require(_amount <= hodl_tokens_count[_token_address]);
    _;
  }

  // ------------------------------------ CONSTRUCTOR ------------------------------------ //
  function HodlFactory() public {
    daddy_hodler = msg.sender;
    hodl_eth_count = 0;
  }

  // ------------------------------------ PUBLIC CONSTANT ------------------------------------ //
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

  function getEthCount()
           public
           constant
           returns (uint256 _amount)
  {
    _amount = hodl_eth_count;
  }

  function getTokenCount(address _token_address)
           public
           constant
           returns (uint256 _amount)
  {
    _amount = hodl_tokens_count[_token_address];
  }

  // ------------------------------------ PUBLIC ------------------------------------ //
  function birthOfHodler()
           public
           returns (address _new_hodl_at)
  {
    Hodl new_hodl = new Hodl(msg.sender);
    hodlers.push(msg.sender);
    _new_hodl_at = address(new_hodl);
    hodl_contracts[_new_hodl_at] = true;
  }

  function addedEth(uint256 _amount)
           if_from_hodl_contracts()
           public
           returns (bool _success)
  {
    hodl_eth_count += _amount;
    _success = true;
  }

  function unlockedEth(uint256 _amount)
           if_from_hodl_contracts()
           if_eth_unlock_valid(_amount)
           public
           returns (bool _success)
  {
    hodl_eth_count -= _amount;
    _success = true;
  }

  function addedToken(address _token_address, uint256 _amount)
           if_from_hodl_contracts()
           public
           returns (bool _success)
  {
    if (hodl_tokens_count[_token_address] > 0) {
      hodl_tokens_count[_token_address] += _amount;
    } else {
      hodl_tokens_count[_token_address] = _amount;
    }
    _success = true;
  }

  function unlockedToken(address _token_address, uint256 _amount)
           if_from_hodl_contracts()
           if_token_unlock_valid(_token_address, _amount)
           public
           returns (bool _success)
  {
    hodl_tokens_count[_token_address] -= _amount;
    _success = true;
  }
}
