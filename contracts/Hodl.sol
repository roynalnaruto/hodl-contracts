pragma solidity ^0.4.15;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./HodlFactory.sol";

contract Hodl {
  address public hodler;
  address public factory;
  uint256 internal eth_locked_up_until;
  bool internal eth_locked;
  uint256 internal n_eth;
  mapping(address => bool) internal tokens_locked;
  mapping(address => uint256) internal tokens_locked_up_until;
  mapping(address => uint256) internal n_tokens;

  event ReceivedEther(uint256 amount);
  event ReceivedToken(address token, uint256 amount, bytes32 data);

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

  modifier if_eth_balances_match() {
    require(n_eth == this.balance);
    _;
  }

  modifier if_token_balances_match(address _token_address) {
    uint256 _token_balance = ERC20(_token_address).balanceOf(this);
    if (_token_balance > 0) {
      require(_token_balance == n_tokens[_token_address]);
    } else {
      require(n_tokens[_token_address] == 0);
    }
    _;
  }

  // ------------------------------------ CONSTRUCTOR ------------------------------------ //
  function Hodl(address _hodler) public {
    hodler = _hodler;
    factory = msg.sender;
    eth_locked = false;
    n_eth = 0;
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

  function internal_add_eth(uint256 _amount)
           internal
           returns (bool _success)
  {
    n_eth += _amount;
    _success = true;
  }

  function internal_add_token(address _token_address, uint256 _amount)
           internal
           returns (bool _success)
  {
    if (n_tokens[_token_address] > 0) {
      n_tokens[_token_address] += _amount;
    } else {
      n_tokens[_token_address] = _amount;
    }
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
           if_eth_balances_match()
           public
           payable
           returns (bool _success)
  {
    require(msg.value > 0);
    _success = internal_add_eth(msg.value);
    ReceivedEther(msg.value);
  }

  function addERC20(address _token_address, uint256 _amount)
           if_from_hodler()
           if_token_not_locked(_token_address)
           if_token_balances_match(_token_address)
           public
           returns (bool _success)
  {
    require(_amount > 0);
    require(ERC20(_token_address).allowance(msg.sender, this) > _amount);
    require(ERC20(_token_address).transferFrom(msg.sender, this, _amount));
    _success = internal_add_token(_token_address, _amount);
    ReceivedToken(_token_address, _amount, "");
  }

  function tokenFallback(address _from, uint256 _amount, bytes32 _data)
           if_called_by_hodler(_from)
           if_token_not_locked(msg.sender)
           if_token_balances_match(msg.sender)
           public
           returns (bool _success)
  {
    require(_amount > 0);
    _success = internal_add_token(msg.sender, _amount);
    ReceivedToken(msg.sender, _amount, _data);
  }
}
