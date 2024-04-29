const { getAddress, stringToHex } = require('viem');

module.exports = [
  getAddress('0xf9727f92B837077a2e5e36AdA036E44182e89769'),
  getAddress('0x5474a96cF90eCf2dFc64D91F9ae8eed1bB7CbC04'),
  1000000000000000000n,
  getAddress('0x0000000000000000000000000000000000001010'),
  1n * 24n * 60n * 60n,
  stringToHex('3744799c-61ec-46eb-bf77-4fc15831d60a'),
];
