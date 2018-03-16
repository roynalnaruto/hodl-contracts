const a = require('awaiting');

const Hodl = artifacts.require('MockHodl.sol');

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

  before(async function () {
    addresses.hodlers = [accounts[1], accounts[2]];
    addresses.factory = accounts[3];
    await setupHodl();
  });

  const setupHodl = async function () {
    const hodl = await Hodl.new(addresses.hodlers[0], { from: addresses.factory });
    const secondHodl = await Hodl.new(addresses.hodlers[1], { from: addresses.factory });

    hodlContracts = {};
    hodlContracts.first = Hodl.at(hodl.address);
    hodlContracts.second = Hodl.at(secondHodl.address);

    await hodlContracts.second.set_locked(LOCKED_UNTIL);
  };

  describe('initialization', function () {
    it('[initialized]: read correct variables set in constructor', async function () {
      assert.deepEqual(await hodlContracts.first.hodler.call(), addresses.hodlers[0]);
      assert.deepEqual(await hodlContracts.first.factory.call(), addresses.factory);

      assert.deepEqual(await hodlContracts.second.hodler.call(), addresses.hodlers[1]);
      assert.deepEqual(await hodlContracts.second.factory.call(), addresses.factory);
    });
  });

  describe('if_not_locked', function () {
    it('[contract is not locked]', async function () {
      assert.deepEqual(await hodlContracts.first.test_if_not_locked.call(), true);
      assert.ok(await a.failure(hodlContracts.second.test_if_not_locked.call()));
    })
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

  describe('lock | getLockedUntil', function () {
    it('[called by hodler, valid time, already locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.second.lock.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[1] })));
    });
    it('[called by hodler, invalid time, not yet locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.lock.call(LOCKED_UNTIL_INVALID, { from: addresses.hodlers[0] })));
    });
    it('[not called by hodler, valid time, not yet locked]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.lock.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[1] })));
    });
    it('[all valid inputs]: lock, return true', async function () {
      assert.deepEqual(await hodlContracts.first.lock.call(LOCKED_UNTIL_VALID, { from: addresses.hodlers[0] }), true);
      await hodlContracts.first.lock(LOCKED_UNTIL_VALID, { from: addresses.hodlers[0] });
    });
    it('[non-hodler tries to read locked_up_until]: throw', async function () {
      assert.ok(await a.failure(hodlContracts.first.getLockedUntil.call({ from: addresses.hodlers[1] })));
      assert.ok(await a.failure(hodlContracts.second.getLockedUntil.call({ from: addresses.hodlers[0] })));
    });
    it('[hodler reads locked_up_until]: return correct value', async function () {
      assert.deepEqual(await hodlContracts.first.getLockedUntil.call({ from: addresses.hodlers[0] }), LOCKED_UNTIL_VALID);
      assert.deepEqual(await hodlContracts.second.getLockedUntil.call({ from: addresses.hodlers[1] }), LOCKED_UNTIL);
    });
  });
});
