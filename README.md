# HODL [WIP]

Contract that allows users to HODL their tokens. [WIP]

### steps

1. Install dependencies
  `npm i`

2. Compile and run tests
  `truffle compile`
  `truffle test`


### interface [WIP]

##### HodlFactory

`birthOfHodler({ from: hodler_address })`

##### Hodl

`addEth({ from: hodler_address, value: eth_to_add })`

`lockEth(uint256 lock_until, { from: hodler_address })`

`addERC20(address erc20_token_address, uint256 amount, { from: hodler_address })`

`lockToken(address token_address, uint256 lock_until, { from: hodler_address })`
