const a = require('awaiting');

const Hodl = artifacts.require('MockHodl.sol');
const Token20 = artifacts.require('MockERC20Token.sol');
const Token677 = artifacts.require('MockERC677Token.sol');

const {
  getCurrentTimestamp,
  randomAddress,
} = require('./helpers');

const bN = web3.toBigNumber;
const LOCKED_UNTIL = bN(getCurrentTimestamp() + 40000000);
const LOCKED_UNTIL_VALID = bN(getCurrentTimestamp() + 31537000); // just more than a year
const LOCKED_UNTIL_INVALID = bN(getCurrentTimestamp() + 31535000); // just less than a year

contract('Hodl', function (accounts) {
  let hodlContracts;
  let addresses = {};
  let erc20Token;
  let erc677Token;

  before(async function () {
    addresses.hodlers = [accounts[1], accounts[2]];
    addresses.factory = accounts[3];
    await setupHodl();
    await setupTokens();
  });

  const setupHodl = async function () {
    const hodl = await Hodl.new(addresses.hodlers[0], { from: addresses.factory });
    const secondHodl = await Hodl.new(addresses.hodlers[1], { from: addresses.factory });

    hodlContracts = {};
    hodlContracts.first = Hodl.at(hodl.address);
    hodlContracts.second = Hodl.at(secondHodl.address);

    await hodlContracts.second.set_eth_locked(LOCKED_UNTIL);
  };

  const setupTokens = async function () {
    erc20Token = await Token20.new();
    erc677Token = await Token677.new();
    await hodlContracts.first.set_token_locked(erc20Token.address, LOCKED_UNTIL_VALID);
  }

  describe('initialization', function () {
    it('[initialized]: read correct variables set in constructor', async function () {
      assert.deepEqual(await hodlContracts.first.hodler.call(), addresses.hodlers[0]);
      assert.deepEqual(await hodlContracts.first.factory.call(), addresses.factory);

      assert.deepEqual(await hodlContracts.second.hodler.call(), addresses.hodlers[1]);
      assert.deepEqual(await hodlContracts.second.factory.call(), addresses.factory);
    });
  });

  describe('if_eth_not_locked', function () {
    it('[eth is not locked]: return true', async function () {
      assert.deepEqual(await hodlContracts.first.test_if_eth_not_locked.call(), true);
    });
    it('[eth is locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.second.test_if_eth_not_locked.call()));
    });
  });

  describe('if_token_not_locked', function () {
    it('[token is not locked]: return true', async function () {
      assert.deepEqual(await hodlContracts.second.test_if_token_not_locked.call(erc20Token.address), true);
      assert.deepEqual(await hodlContracts.first.test_if_token_not_locked.call(erc677Token.address), true);
    });
    it('[token is locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_if_token_not_locked.call(erc20Token.address)));
    });
  });

  describe('if_valid_lockup_time', function () {
    it('[not valid times]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_if_valid_lockup_time.call(LOCKED_UNTIL_INVALID)));
    });
    it('[valid times]: return true', async function () {
      assert.deepEqual(await hodlContracts.first.test_if_valid_lockup_time.call(LOCKED_UNTIL_VALID), true);
    });
  });

  describe('if_from_hodler', function () {
    it('[not from hodler]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_if_from_hodler.call({ from: addresses.hodlers[1] })));
      assert.ok(await a.failure(hodlContracts.first.test_if_from_hodler.call({ from: randomAddress() })));
      assert.ok(await a.failure(hodlContracts.second.test_if_from_hodler.call({ from: addresses.hodlers[0] })));
      assert.ok(await a.failure(hodlContracts.second.test_if_from_hodler.call({ from: randomAddress() })));
    });
    it('[from hodler]: return true', async function () {
      assert.deepEqual(await hodlContracts.first.test_if_from_hodler.call({ from: addresses.hodlers[0] }), true);
      assert.deepEqual(await hodlContracts.second.test_if_from_hodler.call({ from: addresses.hodlers[1] }), true);
    });
  });

  describe('if_called_by_hodler', function () {
    it('[not called by hodler]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_if_called_by_hodler.call(addresses.hodlers[1])));
      assert.ok(await a.failure(hodlContracts.second.test_if_called_by_hodler.call(addresses.hodlers[0])));
    });
    it('[called by hodler]: return true', async function () {
      assert.deepEqual(await hodlContracts.first.test_if_called_by_hodler.call(addresses.hodlers[0]), true);
      assert.deepEqual(await hodlContracts.second.test_if_called_by_hodler.call(addresses.hodlers[1]), true);
    });
  });

  describe('if_valid_eth_balance', function () {
    it('[balance < 20 eth, invalid eth balance]: throw', async function () {
      await hodlContracts.first.sendTransaction({ from: addresses.hodlers[0], value: web3.toWei('19.99', 'ether') });
      assert.ok(await a.failure(hodlContracts.first.test_if_valid_eth_balance.call()));
    });
    it('[balance = 20 eth, invalid]: throw', async function () {
      await hodlContracts.first.sendTransaction({ from: addresses.hodlers[0], value: web3.toWei('0.01', 'ether') });
      assert.deepEqual(await web3.eth.getBalance(hodlContracts.first.address), bN(web3.toWei('20', 'ether')));
      assert.ok(await a.failure(hodlContracts.first.test_if_valid_eth_balance.call()));
    });
    it('[balance > 20 eth, valid]: return true', async function () {
      await hodlContracts.first.sendTransaction({ from: addresses.hodlers[0], value: web3.toWei('0.01', 'ether') });
      assert.deepEqual(await hodlContracts.first.test_if_valid_eth_balance.call(), true);
    });
  });

  describe('if_valid_token_balance', function () {
    it('[balance < 2000 tokens, invalid]: throw', async function () {
      assert.isBelow(await erc20Token.balanceOf(hodlContracts.first.address), bN(2000));
      assert.ok(await a.failure(hodlContracts.first.test_if_valid_token_balance.call(erc20Token.address)));
    });
    it('[balance = 2000 tokens, invalid]: throw', async function () {
      await erc20Token.transfer(hodlContracts.first.address, 2000, { from: accounts[0] });
      assert.deepEqual(await erc20Token.balanceOf(hodlContracts.first.address), bN(2000));
      assert.ok(await a.failure(hodlContracts.first.test_if_valid_token_balance.call(erc20Token.address)));
    });
    it('[balance > 2000 tokens, valid]: return true', async function () {
      await erc20Token.transfer(hodlContracts.first.address, 1, { from: accounts[0] });
      assert.isAbove(await erc20Token.balanceOf(hodlContracts.first.address), bN(2000));
      assert.deepEqual(await hodlContracts.first.test_if_valid_token_balance.call(erc20Token.address), true);
    });
  });

  describe('can_unlock_eth', function () {
    it('[eth is locked, now < locked_until]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.second.test_can_unlock_eth.call()));
    });
    it('[eth is not locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_can_unlock_eth.call()));
    });
    it('[eth locked and now > locked_until]: return true', async function () {
      const lockedUntil = getCurrentTimestamp() - 1000;
      assert.deepEqual(await hodlContracts.first.set_eth_locked.call(lockedUntil), true);
      await hodlContracts.first.set_eth_locked(lockedUntil);
      assert.deepEqual(await hodlContracts.first.test_can_unlock_eth.call(), true);
    });
  });

  describe('can_unlock_token', function () {
    before(async function () {
      const lockedUntil = getCurrentTimestamp() - 1000;
      await hodlContracts.first.set_token_locked(erc677Token.address, lockedUntil);
    });
    it('[token is locked, now < locked_until]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.test_can_unlock_token.call(erc20Token.address)));
    });
    it('[token is not locked]: throw', async function () {
      const temporaryToken = await Token20.new({ from: accounts[5] });
      await temporaryToken.transfer(hodlContracts.first.address, 2001, { from: accounts[5] });
      assert.ok(await a.failure(hodlContracts.first.test_can_unlock_token.call(temporaryToken.address)));
    });
    it('[token locked and now > locked_until]: return true', async function () {
      assert.deepEqual(await hodlContracts.first.test_can_unlock_token.call(erc677Token.address), true);
    });
  });

  describe('lockEth | getEthLockedUntil', function () {
    before(async function () {
      await setupHodl();
      await setupTokens();
      await hodlContracts.first.sendTransaction({ from: addresses.hodlers[0], value: web3.toWei('15', 'ether') });
    });
    it('[all valid inputs, but, ETH balance is less than minimum required to lock]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.lockEth.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[0] })));
      await hodlContracts.first.sendTransaction({ from: addresses.hodlers[0], value: web3.toWei('10', 'ether') });
    });
    it('[called by hodler, valid time, already locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.second.lockEth.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[1] })));
    });
    it('[called by hodler, invalid time, not yet locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.lockEth.call(LOCKED_UNTIL_INVALID, { from: addresses.hodlers[0] })));
    });
    it('[not called by hodler, valid time, not yet locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.lockEth.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[1] })));
    });
    it('[everything valid, lock]: success', async function () {
      assert.deepEqual(await hodlContracts.first.lockEth.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[0] }), true);
      await hodlContracts.first.lockEth(LOCKED_UNTIL_VALID, { from: addresses.hodlers[0] });
    });
    it('[non-hodler tries to read locked_up_until]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.getEthLockedUntil.call({ from: addresses.hodlers[1] })));
      assert.ok(await a.failure(hodlContracts.second.getEthLockedUntil.call({ from: addresses.hodlers[0] })));
    });
    it('[hodler reads locked_up_until]: return correct value', async function () {
      assert.deepEqual(await hodlContracts.first.getEthLockedUntil.call({ from: addresses.hodlers[0] }), LOCKED_UNTIL_VALID);
      assert.deepEqual(await hodlContracts.second.getEthLockedUntil.call({ from: addresses.hodlers[1] }), LOCKED_UNTIL);
    });
  });
});
