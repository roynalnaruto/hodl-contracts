pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./HodlFactory.sol";

contract Hodl {
  address public hodler;
  address public factory;
  uint256 internal eth_locked_up_until;
  bool internal eth_locked;
  mapping(address => bool) internal tokens_locked;
  mapping(address => uint256) internal tokens_locked_up_until;

  event ReceiveEth(uint256 amount);
  event ReceiveToken(address token, uint256 amount, bytes32 data);
  event UnlockAndTransferEth(uint256 amount);
  event UnlockAndTransferToken(address token, uint256 amount);

  modifier if_eth_not_locked() {
    require(eth_locked == false);
    _;
  }

  modifier if_token_not_locked(address _token_address) {
    require(tokens_locked[_token_address] != true);
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

  modifier if_called_by_hodler(address _from) {
    require(_from == hodler);
    _;
  }

  modifier if_valid_eth_balance() {
    require(this.balance > 20 ether);
    _;
  }

  modifier if_valid_token_balance(address _token_address) {
    require(ERC20(_token_address).balanceOf(this) > 2000);
    _;
  }

  modifier can_unlock_eth() {
    require(eth_locked);
    require(now > eth_locked_up_until);
    _;
  }

  modifier can_unlock_token(address _token_address) {
    require(tokens_locked[_token_address]);
    require(now > tokens_locked_up_until[_token_address]);
    _;
  }

  // ------------------------------------ CONSTRUCTOR ------------------------------------ //
  function Hodl(address _hodler) public {
    hodler = _hodler;
    factory = msg.sender;
    eth_locked = false;
  }

  // ------------------------------------ PRIVATE ------------------------------------ //
  function factory_contract()
           private
           constant
           returns (HodlFactory _hodl_factory)
  {
    _hodl_factory = HodlFactory(factory);
  }

  // ------------------------------------ INTERNAL ------------------------------------ //
  function internal_lock_eth(uint256 _eth_locked_up_until)
           internal
           returns (bool _success)
  {
    eth_locked_up_until = _eth_locked_up_until;
    eth_locked = true;
    _success = true;
  }

  function internal_lock_token(address _token_address, uint256 _token_locked_up_until)
           internal
           returns (bool _success)
  {
    tokens_locked_up_until[_token_address] = _token_locked_up_until;
    tokens_locked[_token_address] = true;
    _success = true;
  }

  function internal_unlock_eth()
           internal
           returns (bool _success)
  {
    eth_locked_up_until = 0;
    eth_locked = false;
    _success = true;
  }

  function internal_unlock_token(address _token_address)
           internal
           returns (bool _success)
  {
    tokens_locked_up_until[_token_address] = 0;
    tokens_locked[_token_address] = false;
    _success = true;
  }

  // ------------------------------------ PUBLIC CONSTANT ------------------------------------ //
  function getEthLockedUntil()
           if_from_hodler()
           public
           constant
           returns (uint256 _eth_locked_up_until)
  {
    _eth_locked_up_until = eth_locked_up_until;
  }

  function getTokenLockedUntil(address _token_address)
           if_from_hodler()
           public
           constant
           returns (uint256 _token_locked_up_until)
  {
    _token_locked_up_until = tokens_locked_up_until[_token_address];
  }

  // ------------------------------------ PUBLIC ------------------------------------ //
  function lockEth(uint256 _eth_locked_up_until)
           if_valid_lockup_time(_eth_locked_up_until)
           if_eth_not_locked()
           if_from_hodler()
           if_valid_eth_balance()
           public
           returns (bool _success)
  {
    _success = internal_lock_eth(_eth_locked_up_until);
  }

  function lockToken(address _token_address, uint256 _token_locked_up_until)
           if_valid_lockup_time(_token_locked_up_until)
           if_token_not_locked(_token_address)
           if_from_hodler()
           if_valid_token_balance(_token_address)
           public
           returns (bool _success)
  {
    _success = internal_lock_token(_token_address, _token_locked_up_until);
  }

  function addEth()
           if_from_hodler()
           if_eth_not_locked()
           public
           payable
           returns (bool _success)
  {
    require(msg.value > 0);
    _success = factory_contract().addedEth(msg.value);
    require(_success);
    ReceiveEth(msg.value);
  }

  function addERC20(address _token_address, uint256 _amount)
           if_from_hodler()
           if_token_not_locked(_token_address)
           public
           returns (bool _success)
  {
    require(_amount > 0);
    require(ERC20(_token_address).allowance(msg.sender, this) >= _amount);
    require(ERC20(_token_address).transferFrom(msg.sender, this, _amount));
    _success = factory_contract().addedToken(_token_address, _amount);
    require(_success);
    ReceiveToken(_token_address, _amount, "");
  }

  function tokenFallback(address _from, uint256 _amount, bytes32 _data)
           if_called_by_hodler(_from)
           if_token_not_locked(msg.sender)
           public
           returns (bool _success)
  {
    require(_amount > 0);
    _success = factory_contract().addedToken(msg.sender, _amount);
    require(_success);
    ReceiveToken(msg.sender, _amount, _data);
  }

  function unlockEth()
           can_unlock_eth()
           if_from_hodler()
           public
           returns (bool _success)
  {
    uint256 _amount = this.balance;
    require(internal_unlock_eth());
    _success = factory_contract().unlockedEth(_amount);
    require(_success);
    hodler.transfer(_amount);
    UnlockAndTransferEth(_amount);
  }

  function unlockToken(address _token_address)
           can_unlock_token(_token_address)
           if_from_hodler()
           public
           returns (bool _success)
  {
    uint256 _amount = ERC20(_token_address).balanceOf(this);
    require(internal_unlock_token(_token_address));
    _success = factory_contract().unlockedToken(_token_address, _amount);
    require(_success);
    require(ERC20(_token_address).transfer(hodler, _amount));
    UnlockAndTransferToken(_token_address, _amount);
  }
}
