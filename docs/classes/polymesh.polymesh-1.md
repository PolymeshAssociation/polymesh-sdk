# Class: Polymesh

Main entry point of the Polymesh SDK

## Hierarchy

* **Polymesh**

## Index

### Properties

* [governance](polymesh.polymesh-1.md#governance)

### Accessors

* [_polkadotApi](polymesh.polymesh-1.md#_polkadotapi)

### Methods

* [addClaims](polymesh.polymesh-1.md#addclaims)
* [editClaims](polymesh.polymesh-1.md#editclaims)
* [getAccountBalance](polymesh.polymesh-1.md#getaccountbalance)
* [getIdentitiesWithClaims](polymesh.polymesh-1.md#getidentitieswithclaims)
* [getIdentity](polymesh.polymesh-1.md#getidentity)
* [getIssuedClaims](polymesh.polymesh-1.md#getissuedclaims)
* [getMySigningKeys](polymesh.polymesh-1.md#getmysigningkeys)
* [getNetworkProperties](polymesh.polymesh-1.md#getnetworkproperties)
* [getSecurityToken](polymesh.polymesh-1.md#getsecuritytoken)
* [getSecurityTokens](polymesh.polymesh-1.md#getsecuritytokens)
* [getTickerReservation](polymesh.polymesh-1.md#gettickerreservation)
* [getTickerReservations](polymesh.polymesh-1.md#gettickerreservations)
* [getTransactionFees](polymesh.polymesh-1.md#gettransactionfees)
* [getTransactionHistory](polymesh.polymesh-1.md#gettransactionhistory)
* [getTreasuryAddress](polymesh.polymesh-1.md#gettreasuryaddress)
* [getTreasuryBalance](polymesh.polymesh-1.md#gettreasurybalance)
* [isIdentityValid](polymesh.polymesh-1.md#isidentityvalid)
* [isTickerAvailable](polymesh.polymesh-1.md#istickeravailable)
* [onConnectionError](polymesh.polymesh-1.md#onconnectionerror)
* [onDisconnect](polymesh.polymesh-1.md#ondisconnect)
* [removeMySigningKeys](polymesh.polymesh-1.md#removemysigningkeys)
* [reserveTicker](polymesh.polymesh-1.md#reserveticker)
* [revokeClaims](polymesh.polymesh-1.md#revokeclaims)
* [transferPolyX](polymesh.polymesh-1.md#transferpolyx)
* [connect](polymesh.polymesh-1.md#static-connect)

## Properties

###  governance

• **governance**: *[Governance](governance.governance-1.md)*

*Defined in [src/Polymesh.ts:89](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L89)*

## Accessors

###  _polkadotApi

• **get _polkadotApi**(): *ApiPromise*

*Defined in [src/Polymesh.ts:783](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L783)*

Polkadot client

**Returns:** *ApiPromise*

## Methods

###  addClaims

▸ **addClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:413](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L413)*

Add claims to identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  editClaims

▸ **editClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:422](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L422)*

Edit claims associated to identities (only the expiry date can be modified)

* @param args.claims - array of claims to be edited

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  getAccountBalance

▸ **getAccountBalance**(`args?`: undefined | object): *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

*Defined in [src/Polymesh.ts:230](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L230)*

Get the free/locked POLYX balance of an account

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

▸ **getAccountBalance**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:231](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L231)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

▸ **getAccountBalance**(`args`: object, `callback`: [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:232](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L232)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`accountId` | string |

▪ **callback**: *[SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)›*

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getIdentitiesWithClaims

▸ **getIdentitiesWithClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityWithClaims](../interfaces/types.identitywithclaims.md)››*

*Defined in [src/Polymesh.ts:568](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L568)*

Retrieve a list of identities with claims associated to them. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`claimTypes?` | [ClaimType](../enums/types.claimtype.md)[] | types of the claims to fetch. Defaults to any type |
`scope?` | undefined &#124; string | scope of the claims to fetch. Defaults to any scope |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`targets?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] | identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets |
`trustedClaimIssuers?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] | identity IDs of claim issuers. Defaults to all claim issuers |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityWithClaims](../interfaces/types.identitywithclaims.md)››*

___

###  getIdentity

▸ **getIdentity**(`args?`: undefined | object): *[Identity](api_entities_identity.identity.md)*

*Defined in [src/Polymesh.ts:376](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L376)*

Create an identity instance from a DID. If no DID is passed, the current identity is returned

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *[Identity](api_entities_identity.identity.md)*

___

###  getIssuedClaims

▸ **getIssuedClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

*Defined in [src/Polymesh.ts:538](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L538)*

Retrieve all claims issued by the current identity

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type |
------ | ------ |
`size?` | undefined &#124; number |
`start?` | undefined &#124; number |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

___

###  getMySigningKeys

▸ **getMySigningKeys**(): *Promise‹[Signer](../interfaces/types.signer.md)[]›*

*Defined in [src/Polymesh.ts:755](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L755)*

Get the list of signing keys related to the current identity

**`note`** can be subscribed to

**Returns:** *Promise‹[Signer](../interfaces/types.signer.md)[]›*

▸ **getMySigningKeys**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:756](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L756)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getNetworkProperties

▸ **getNetworkProperties**(): *Promise‹[NetworkProperties](../interfaces/types.networkproperties.md)›*

*Defined in [src/Polymesh.ts:615](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L615)*

Retrieve information for the current network

**Returns:** *Promise‹[NetworkProperties](../interfaces/types.networkproperties.md)›*

___

###  getSecurityToken

▸ **getSecurityToken**(`args`: object): *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›*

*Defined in [src/Polymesh.ts:512](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L512)*

Retrieve a Security Token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›*

___

###  getSecurityTokens

▸ **getSecurityTokens**(`args?`: undefined | object): *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)[]›*

*Defined in [src/Polymesh.ts:476](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L476)*

Retrieve all the Security Tokens owned by an identity

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)[]›*

___

###  getTickerReservation

▸ **getTickerReservation**(`args`: object): *Promise‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)›*

*Defined in [src/Polymesh.ts:350](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L350)*

Retrieve a Ticker Reservation

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)›*

___

###  getTickerReservations

▸ **getTickerReservations**(`args?`: undefined | object): *Promise‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)[]›*

*Defined in [src/Polymesh.ts:312](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L312)*

Retrieve all the ticker reservations currently owned by an identity. This doesn't include tokens that
  have already been launched

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)[]›*

___

###  getTransactionFees

▸ **getTransactionFees**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:397](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L397)*

Retrieve the protocol fees associated with running a specific transaction

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")  |

**Returns:** *Promise‹BigNumber›*

___

###  getTransactionHistory

▸ **getTransactionHistory**(`filters`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ExtrinsicData](../interfaces/types.extrinsicdata.md)››*

*Defined in [src/Polymesh.ts:643](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L643)*

Retrieve a list of transactions. Can be filtered using parameters

**Parameters:**

▪`Default value`  **filters**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`address?` | undefined &#124; string | account that signed the transaction |
`blockId?` | undefined &#124; number | - |
`orderBy?` | [TransactionOrderByInput](../modules/middleware.md#transactionorderbyinput) | - |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`success?` | undefined &#124; false &#124; true | whether the transaction was successful or not |
`tag?` | TxTag | tag associated with the transaction |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ExtrinsicData](../interfaces/types.extrinsicdata.md)››*

___

###  getTreasuryAddress

▸ **getTreasuryAddress**(): *string*

*Defined in [src/Polymesh.ts:404](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L404)*

Get the treasury wallet address

**Returns:** *string*

___

###  getTreasuryBalance

▸ **getTreasuryBalance**(): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:731](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L731)*

Get the Treasury POLYX balance

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **getTreasuryBalance**(`callback`: [SubCallback](../modules/types.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:732](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L732)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  isIdentityValid

▸ **isIdentityValid**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:386](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L386)*

Return whether the supplied identity/DID exists

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`identity` | [Identity](api_entities_identity.identity.md) &#124; string |

**Returns:** *Promise‹boolean›*

___

###  isTickerAvailable

▸ **isTickerAvailable**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:282](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L282)*

Check if a ticker hasn't been reserved

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹boolean›*

▸ **isTickerAvailable**(`args`: object, `callback`: [SubCallback](../modules/types.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:283](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L283)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../modules/types.md#subcallback)‹boolean›*

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  onConnectionError

▸ **onConnectionError**(`callback`: function): *function*

*Defined in [src/Polymesh.ts:442](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L442)*

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

*Defined in [src/Polymesh.ts:459](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L459)*

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

###  removeMySigningKeys

▸ **removeMySigningKeys**(`args`: object): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:774](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L774)*

Remove a list of signing keys associated with the current identity

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`signers` | [Signer](../interfaces/types.signer.md)[] |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  reserveTicker

▸ **reserveTicker**(`args`: [ReserveTickerParams](../interfaces/api_procedures.reservetickerparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)››*

*Defined in [src/Polymesh.ts:273](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L273)*

Reserve a ticker symbol to later use in the creation of a Security Token.
The ticker will expire after a set amount of time, after which other users can reserve it

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ReserveTickerParams](../interfaces/api_procedures.reservetickerparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)››*

___

###  revokeClaims

▸ **revokeClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:431](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L431)*

Revoke claims from identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/api_procedures.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  transferPolyX

▸ **transferPolyX**(`args`: [TransferPolyXParams](../interfaces/api_procedures.transferpolyxparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:219](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L219)*

Transfer an amount of POLYX to a specified account

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferPolyXParams](../interfaces/api_procedures.transferpolyxparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

### `Static` connect

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

*Defined in [src/Polymesh.ts:103](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L103)*

Create the instance and connect to the Polymesh node

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

*Defined in [src/Polymesh.ts:105](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L105)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object): *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

*Defined in [src/Polymesh.ts:111](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L111)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) & object |

**Returns:** *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

▸ **connect**(`params`: [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md)): *Promise‹[Polymesh](polymesh.polymesh-1.md)›*

*Defined in [src/Polymesh.ts:113](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/Polymesh.ts#L113)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | [ConnectParamsBase](../interfaces/polymesh.connectparamsbase.md) |

**Returns:** *Promise‹[Polymesh](polymesh.polymesh-1.md)›*
