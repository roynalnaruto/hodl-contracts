const a = require('awaiting');

const HodlFactory = artifacts.require('MockHodlFactory.sol');
const Hodl = artifacts.require('MockHodl.sol');

const bN = web3.toBigNumber;

contract('HodlFactory', function (accounts) {
  let hodlFactory;
  let secondHodlFactory;
  let hodl;
  let secondHodl;
  let thirdHodl;

  before(async function () {
    await setupHodlFactory();
  });

  const setupHodlFactory = async function () {
    hodlFactory = await HodlFactory.new({ from: accounts[0] });
    secondHodlFactory = await HodlFactory.new({ from: accounts[1] });
  };

  const initializeHodlContracts = async function () {
    const hodl = await hodlFactory.birthOfHodler.call({ from: accounts[4] });
    await hodlFactory.birthOfHodler({ from: accounts[4] });

    const secondHodl = await hodlFactory.birthOfHodler.call({ from: accounts[5] });
    await hodlFactory.birthOfHodler({ from: accounts[5] });

    const thirdHodl = await secondHodlFactory.birthOfHodler.call({ from: accounts[6] });
    await secondHodlFactory.birthOfHodler({ from: accounts[6] });
    return ([hodl, secondHodl, thirdHodl]);
  };

  describe('initialization', function () {
    it('[initialized]: read correct variables set in constructor', async function () {
      assert.deepEqual(await hodlFactory.daddy_hodler.call(), accounts[0]);
      assert.deepEqual(await secondHodlFactory.daddy_hodler.call(), accounts[1]);

      assert.deepEqual(await hodlFactory.eth_count.call(), bN(0));
      assert.deepEqual(await secondHodlFactory.eth_count.call(), bN(0));
    });
  });

  describe('birthOfHodler', function () {
    before(async function () {
      const hodlContractAddresses = await initializeHodlContracts();
      hodl = hodlContractAddresses[0];
      secondHodl = hodlContractAddresses[1];
      thirdHodl = hodlContractAddresses[2];
    });
    it('[new hodl contract]: read correct variables from HodlFactory', async function () {
      const factoryHodlers = await hodlFactory.getHodlers.call();
      const secondFactoryHodlers = await secondHodlFactory.getHodlers.call();

      assert.deepEqual(factoryHodlers.length, 2);
      assert.deepEqual(factoryHodlers[0], accounts[4]);
      assert.deepEqual(factoryHodlers[1], accounts[5]);
      assert.deepEqual(await hodlFactory.isHodlContractValid.call(hodl), true);
      assert.deepEqual(await hodlFactory.isHodlContractValid.call(secondHodl), true);
      assert.deepEqual(await hodlFactory.isHodlContractValid.call(thirdHodl), false);

      assert.deepEqual(secondFactoryHodlers.length, 1);
      assert.deepEqual(secondFactoryHodlers[0], accounts[6]);
      assert.deepEqual(await secondHodlFactory.isHodlContractValid.call(thirdHodl), true);
      assert.deepEqual(await secondHodlFactory.isHodlContractValid.call(hodl), false);
      assert.deepEqual(await secondHodlFactory.isHodlContractValid.call(secondHodl), false);
    });
  });

  describe('is_from_hodl_contracts', function () {
    it('[not called from a valid hodl_contract]: throw', async function () {
      assert.ok(await a.failure(hodlFactory.test_is_from_hodl_contracts.call({ from: thirdHodl })));
      assert.ok(await a.failure(secondHodlFactory.test_is_from_hodl_contracts.call({ from: hodl })));
      assert.ok(await a.failure(secondHodlFactory.test_is_from_hodl_contracts.call({ from: secondHodl })));
    });
    it('[called from a valid hodl_contract]: return true', async function () {
      assert.deepEqual(await hodlFactory.test_is_from_hodl_contracts.call({ from: hodl }), true);
      assert.deepEqual(await hodlFactory.test_is_from_hodl_contracts.call({ from: secondHodl }), true);
      assert.deepEqual(await secondHodlFactory.test_is_from_hodl_contracts.call({ from: thirdHodl }), true);
    });
  });
});
