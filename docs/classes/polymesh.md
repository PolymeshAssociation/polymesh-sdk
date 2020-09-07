# Class: Polymesh

Main entry point of the Polymesh SDK

## Hierarchy

* **Polymesh**

## Index

### Properties

* [claims](polymesh.md#claims)
* [governance](polymesh.md#governance)

### Accessors

* [_polkadotApi](polymesh.md#_polkadotapi)

### Methods

* [getAccountBalance](polymesh.md#getaccountbalance)
* [getIdentity](polymesh.md#getidentity)
* [getLatestBlock](polymesh.md#getlatestblock)
* [getMySigningKeys](polymesh.md#getmysigningkeys)
* [getNetworkProperties](polymesh.md#getnetworkproperties)
* [getSecurityToken](polymesh.md#getsecuritytoken)
* [getSecurityTokens](polymesh.md#getsecuritytokens)
* [getTickerReservation](polymesh.md#gettickerreservation)
* [getTickerReservations](polymesh.md#gettickerreservations)
* [getTransactionFees](polymesh.md#gettransactionfees)
* [getTransactionHistory](polymesh.md#gettransactionhistory)
* [getTreasuryAddress](polymesh.md#gettreasuryaddress)
* [getTreasuryBalance](polymesh.md#gettreasurybalance)
* [isIdentityValid](polymesh.md#isidentityvalid)
* [isTickerAvailable](polymesh.md#istickeravailable)
* [onConnectionError](polymesh.md#onconnectionerror)
* [onDisconnect](polymesh.md#ondisconnect)
* [registerIdentity](polymesh.md#registeridentity)
* [removeMySigningKeys](polymesh.md#removemysigningkeys)
* [reserveTicker](polymesh.md#reserveticker)
* [transferPolyX](polymesh.md#transferpolyx)
* [connect](polymesh.md#static-connect)

## Properties

###  claims

• **claims**: *[Claims](claims.md)*

*Defined in [src/Polymesh.ts:82](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L82)*

___

###  governance

• **governance**: *[Governance](governance.md)*

*Defined in [src/Polymesh.ts:81](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L81)*

## Accessors

###  _polkadotApi

• **get _polkadotApi**(): *ApiPromise*

*Defined in [src/Polymesh.ts:702](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L702)*

Polkadot client

**Returns:** *ApiPromise*

## Methods

###  getAccountBalance

▸ **getAccountBalance**(`args?`: undefined | object): *Promise‹[AccountBalance](../interfaces/accountbalance.md)›*

*Defined in [src/Polymesh.ts:239](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L239)*

Get the free/locked POLYX balance of an account

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[AccountBalance](../interfaces/accountbalance.md)›*

▸ **getAccountBalance**(`callback`: [SubCallback](../globals.md#subcallback)‹[AccountBalance](../interfaces/accountbalance.md)›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:240](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L240)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹[AccountBalance](../interfaces/accountbalance.md)› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

▸ **getAccountBalance**(`args`: object, `callback`: [SubCallback](../globals.md#subcallback)‹[AccountBalance](../interfaces/accountbalance.md)›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:241](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L241)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`accountId` | string |

▪ **callback**: *[SubCallback](../globals.md#subcallback)‹[AccountBalance](../interfaces/accountbalance.md)›*

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  getIdentity

▸ **getIdentity**(`args?`: undefined | object): *Promise‹[Identity](identity.md)›*

*Defined in [src/Polymesh.ts:385](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L385)*

Create an identity instance from a DID. If no DID is passed, the current identity is returned

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[Identity](identity.md)›*

___

###  getLatestBlock

▸ **getLatestBlock**(): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:693](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L693)*

Retrieve the number of the latest block in the chain

**Returns:** *Promise‹BigNumber›*

___

###  getMySigningKeys

▸ **getMySigningKeys**(): *Promise‹[Signer](../interfaces/signer.md)[]›*

*Defined in [src/Polymesh.ts:658](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L658)*

Get the list of signing keys related to the current identity

**`note`** can be subscribed to

**Returns:** *Promise‹[Signer](../interfaces/signer.md)[]›*

▸ **getMySigningKeys**(`callback`: [SubCallback](../globals.md#subcallback)‹[Signer](../interfaces/signer.md)[]›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:659](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L659)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹[Signer](../interfaces/signer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  getNetworkProperties

▸ **getNetworkProperties**(): *Promise‹[NetworkProperties](../interfaces/networkproperties.md)›*

*Defined in [src/Polymesh.ts:518](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L518)*

Retrieve information for the current network

**Returns:** *Promise‹[NetworkProperties](../interfaces/networkproperties.md)›*

___

###  getSecurityToken

▸ **getSecurityToken**(`args`: object): *Promise‹[SecurityToken](securitytoken.md)›*

*Defined in [src/Polymesh.ts:492](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L492)*

Retrieve a Security Token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[SecurityToken](securitytoken.md)›*

___

###  getSecurityTokens

▸ **getSecurityTokens**(`args?`: undefined | object): *Promise‹[SecurityToken](securitytoken.md)[]›*

*Defined in [src/Polymesh.ts:456](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L456)*

Retrieve all the Security Tokens owned by an identity

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[SecurityToken](securitytoken.md)[]›*

___

###  getTickerReservation

▸ **getTickerReservation**(`args`: object): *Promise‹[TickerReservation](tickerreservation.md)›*

*Defined in [src/Polymesh.ts:359](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L359)*

Retrieve a Ticker Reservation

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[TickerReservation](tickerreservation.md)›*

___

###  getTickerReservations

▸ **getTickerReservations**(`args?`: undefined | object): *Promise‹[TickerReservation](tickerreservation.md)[]›*

*Defined in [src/Polymesh.ts:321](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L321)*

Retrieve all the ticker reservations currently owned by an identity. This doesn't include tokens that
  have already been launched

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[TickerReservation](tickerreservation.md)[]›*

___

###  getTransactionFees

▸ **getTransactionFees**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:406](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L406)*

Retrieve the protocol fees associated with running a specific transaction

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")  |

**Returns:** *Promise‹BigNumber›*

___

###  getTransactionHistory

▸ **getTransactionHistory**(`filters`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[ExtrinsicData](../interfaces/extrinsicdata.md)››*

*Defined in [src/Polymesh.ts:546](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L546)*

Retrieve a list of transactions. Can be filtered using parameters

**Parameters:**

▪`Default value`  **filters**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`address?` | undefined &#124; string | account that signed the transaction |
`blockId?` | undefined &#124; number | - |
`orderBy?` | TransactionOrderByInput | - |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`success?` | undefined &#124; false &#124; true | whether the transaction was successful or not |
`tag?` | TxTag | tag associated with the transaction |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[ExtrinsicData](../interfaces/extrinsicdata.md)››*

___

###  getTreasuryAddress

▸ **getTreasuryAddress**(): *string*

*Defined in [src/Polymesh.ts:413](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L413)*

Get the treasury wallet address

**Returns:** *string*

___

###  getTreasuryBalance

▸ **getTreasuryBalance**(): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:634](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L634)*

Get the Treasury POLYX balance

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **getTreasuryBalance**(`callback`: [SubCallback](../globals.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:635](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L635)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  isIdentityValid

▸ **isIdentityValid**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:395](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L395)*

Return whether the supplied identity/DID exists

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`identity` | [Identity](identity.md) &#124; string |

**Returns:** *Promise‹boolean›*

___

###  isTickerAvailable

▸ **isTickerAvailable**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:291](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L291)*

Check if a ticker hasn't been reserved

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹boolean›*

▸ **isTickerAvailable**(`args`: object, `callback`: [SubCallback](../globals.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:292](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L292)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../globals.md#subcallback)‹boolean›*

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  onConnectionError

▸ **onConnectionError**(`callback`: function): *function*

*Defined in [src/Polymesh.ts:422](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L422)*

Handle connection errors

**Parameters:**

▪ **callback**: *function*

▸ (...`args`: unknown[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | unknown[] |

**Returns:** *function*

an unsubscribe callback

▸ (): *void*

___

###  onDisconnect

▸ **onDisconnect**(`callback`: function): *function*

*Defined in [src/Polymesh.ts:439](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L439)*

Handle disconnection

**Parameters:**

▪ **callback**: *function*

▸ (...`args`: unknown[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | unknown[] |

**Returns:** *function*

an unsubscribe callback

▸ (): *void*

___

###  registerIdentity

▸ **registerIdentity**(`args`: [RegisterIdentityParams](../interfaces/registeridentityparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[Identity](identity.md)››*

*Defined in [src/Polymesh.ts:686](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L686)*

Register an Identity

**`note`** must be a CDD provider

**Parameters:**

Name | Type |
------ | ------ |
`args` | [RegisterIdentityParams](../interfaces/registeridentityparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[Identity](identity.md)››*

___

###  removeMySigningKeys

▸ **removeMySigningKeys**(`args`: object): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:677](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L677)*

Remove a list of signing keys associated with the current identity

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`signers` | [Signer](../interfaces/signer.md)[] |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

###  reserveTicker

▸ **reserveTicker**(`args`: [ReserveTickerParams](../interfaces/reservetickerparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[TickerReservation](tickerreservation.md)››*

*Defined in [src/Polymesh.ts:282](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L282)*

Reserve a ticker symbol to later use in the creation of a Security Token.
The ticker will expire after a set amount of time, after which other users can reserve it

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ReserveTickerParams](../interfaces/reservetickerparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[TickerReservation](tickerreservation.md)››*

___

###  transferPolyX

▸ **transferPolyX**(`args`: [TransferPolyXParams](../interfaces/transferpolyxparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:228](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L228)*

Transfer an amount of POLYX to a specified account

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferPolyXParams](../interfaces/transferpolyxparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

### `Static` connect

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.md)›*

*Defined in [src/Polymesh.ts:97](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L97)*

Create the instance and connect to the Polymesh node

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.md)›*

*Defined in [src/Polymesh.ts:99](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L99)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.md)›*

*Defined in [src/Polymesh.ts:105](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L105)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/connectparamsbase.md)): *Promise‹[Polymesh](polymesh.md)›*

*Defined in [src/Polymesh.ts:107](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Polymesh.ts#L107)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/connectparamsbase.md) |

**Returns:** *Promise‹[Polymesh](polymesh.md)›*
