const crypto = require('crypto');
const util = require('ethereumjs-util');

function randomBytes32() {
  return `0x${crypto.randomBytes(32).toString('hex')}`;
}

function randomBytes32s(n) {
  return new Array(n).fill().map(randomBytes32);
}

function randomAddress() {
  return `0x${crypto.randomBytes(20).toString('hex')}`;
}

function randomAddresses(n) {
  return new Array(n).fill().map(randomAddress);
}

function randomBigNumber(bN, range = 10000000) {
  return bN(Math.floor(Math.random() * range));
}

function randomBigNumbers(bN, n) {
  return new Array(n).fill().map(() => randomBigNumber(bN));
}

function someBigNumbers(web3, start, count) {
  return new Array(count).fill().map(() => web3.toBigNumber(start++));
}

function indexRange(start, end) {
  return new Array(end - start).fill().map(() => start++);
}

function encodeHash(hash) {
  return `0x${multihash.decode(hash).toString('hex')}`;
}

function decodeHash(hexHash) {
  const parsedHash = hexHash.indexOf('0x') === 0 ? hexHash.substr(2) : hexHash;
  return multihash.encode(parsedHash);
}

function isNonZeroAddress(web3, address) {
  return address !== zeroAddress && web3.isAddress(address);
}

function paddedAddress(web3, text, n = 64) {
  const hex = web3.toHex(text).slice(2);
  const zeroes = n - hex.length;
  return `0x${new Array(zeroes).fill(0).join('')}${hex}`;
}

function paddedHex(web3, text, n = 64) {
  const hex = web3.toHex(text);
  const zeroes = (n + 2) - hex.length;
  return `${hex}${new Array(zeroes).fill(0).join('')}`;
}

const zeroAddress = '0x0000000000000000000000000000000000000000';
const zeroString = '0x0000000000000000000000000000000000000000000000000000000000000000';

function watchEvent(event, method, ...params) {
  return new Promise((resolve) => {
    const ev = event({});
    ev.watch((e, { args }) => {
      ev.stopWatching();
      resolve(args);
    });
    method(...params);
  });
}

function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function getCurrentBlock() {
  return web3.eth.blockNumber;
}

function intToBytes32(b) {
  return util.bufferToHex(util.setLengthLeft(b, 32));
}

function generateMultiples(web3, base, count) {
  let start = 1;
  return new Array(count).fill().map(() => web3.toBigNumber(base * (start++)));
}

function timeIsRecent(timestamp, maxTimeLag = 10) {
  const timeElapsed = getCurrentTimestamp() - timestamp.toNumber();
  return timeElapsed < maxTimeLag && timeElapsed >= 0;
}

module.exports = {
  randomBytes32,
  randomBytes32s,
  randomAddress,
  randomAddresses,
  randomBigNumber,
  randomBigNumbers,
  zeroAddress,
  zeroString,
  isNonZeroAddress,
  paddedHex,
  paddedAddress,
  watchEvent,
  getCurrentTimestamp,
  getCurrentBlock,
  intToBytes32,
  someBigNumbers,
  indexRange,
  encodeHash,
  decodeHash,
  generateMultiples,
  timeIsRecent,
};
