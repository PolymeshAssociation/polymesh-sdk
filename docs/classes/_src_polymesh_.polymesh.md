# Class: Polymesh

Main entry point of the Polymesh SDK

## Hierarchy

* **Polymesh**

## Index

### Properties

* [governance](_src_polymesh_.polymesh.md#governance)

### Accessors

* [_polkadotApi](_src_polymesh_.polymesh.md#_polkadotapi)

### Methods

* [addClaims](_src_polymesh_.polymesh.md#addclaims)
* [editClaims](_src_polymesh_.polymesh.md#editclaims)
* [getAccountBalance](_src_polymesh_.polymesh.md#getaccountbalance)
* [getIdentitiesWithClaims](_src_polymesh_.polymesh.md#getidentitieswithclaims)
* [getIdentity](_src_polymesh_.polymesh.md#getidentity)
* [getIssuedClaims](_src_polymesh_.polymesh.md#getissuedclaims)
* [getMySigningKeys](_src_polymesh_.polymesh.md#getmysigningkeys)
* [getNetworkProperties](_src_polymesh_.polymesh.md#getnetworkproperties)
* [getSecurityToken](_src_polymesh_.polymesh.md#getsecuritytoken)
* [getSecurityTokens](_src_polymesh_.polymesh.md#getsecuritytokens)
* [getTickerReservation](_src_polymesh_.polymesh.md#gettickerreservation)
* [getTickerReservations](_src_polymesh_.polymesh.md#gettickerreservations)
* [getTransactionFees](_src_polymesh_.polymesh.md#gettransactionfees)
* [getTreasuryAddress](_src_polymesh_.polymesh.md#gettreasuryaddress)
* [getTreasuryBalance](_src_polymesh_.polymesh.md#gettreasurybalance)
* [isIdentityValid](_src_polymesh_.polymesh.md#isidentityvalid)
* [isTickerAvailable](_src_polymesh_.polymesh.md#istickeravailable)
* [onConnectionError](_src_polymesh_.polymesh.md#onconnectionerror)
* [onDisconnect](_src_polymesh_.polymesh.md#ondisconnect)
* [reserveTicker](_src_polymesh_.polymesh.md#reserveticker)
* [revokeClaims](_src_polymesh_.polymesh.md#revokeclaims)
* [transferPolyX](_src_polymesh_.polymesh.md#transferpolyx)
* [connect](_src_polymesh_.polymesh.md#static-connect)

## Properties

###  governance

• **governance**: *[Governance](_src_governance_.governance.md)*

*Defined in [src/Polymesh.ts:85](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L85)*

## Accessors

###  _polkadotApi

• **get _polkadotApi**(): *ApiPromise*

*Defined in [src/Polymesh.ts:761](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L761)*

Polkadot client

**Returns:** *ApiPromise*

## Methods

###  addClaims

▸ **addClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:420](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L420)*

Add claims to identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

###  editClaims

▸ **editClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:429](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L429)*

Edit claims associated to identities (only the expiry date can be modified)

* @param args.claims - array of claims to be edited

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

###  getAccountBalance

▸ **getAccountBalance**(`args?`: undefined | object): *Promise‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)›*

*Defined in [src/Polymesh.ts:237](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L237)*

Get the free/locked POLYX balance of an account

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)›*

▸ **getAccountBalance**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:238](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L238)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

▸ **getAccountBalance**(`args`: object, `callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:239](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L239)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`accountId` | string |

▪ **callback**: *[SubCallback](../modules/_src_types_index_.md#subcallback)‹[AccountBalance](../interfaces/_src_types_index_.accountbalance.md)›*

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  getIdentitiesWithClaims

▸ **getIdentitiesWithClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityWithClaims](../interfaces/_src_types_index_.identitywithclaims.md)››*

*Defined in [src/Polymesh.ts:614](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L614)*

Retrieve a list of identities with claims associated to them. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`claimTypes?` | [ClaimType](../enums/_src_types_index_.claimtype.md)[] | types of the claims to fetch. Defaults to any type |
`scope?` | undefined &#124; string | scope of the claims to fetch. Defaults to any scope |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`targets?` | (string &#124; [Identity](_src_api_entities_identity_index_.identity.md)‹›)[] | identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets |
`trustedClaimIssuers?` | (string &#124; [Identity](_src_api_entities_identity_index_.identity.md)‹›)[] | identity IDs of claim issuers. Defaults to all claim issuers |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityWithClaims](../interfaces/_src_types_index_.identitywithclaims.md)››*

___

###  getIdentity

▸ **getIdentity**(`args?`: undefined | object): *[Identity](_src_api_entities_identity_index_.identity.md)*

*Defined in [src/Polymesh.ts:383](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L383)*

Create an identity instance from a DID. If no DID is passed, the current identity is returned

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *[Identity](_src_api_entities_identity_index_.identity.md)*

___

###  getIssuedClaims

▸ **getIssuedClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[ClaimData](../interfaces/_src_types_index_.claimdata.md)››*

*Defined in [src/Polymesh.ts:544](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L544)*

Retrieve all claims issued by the current identity

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type |
------ | ------ |
`size?` | undefined &#124; number |
`start?` | undefined &#124; number |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[ClaimData](../interfaces/_src_types_index_.claimdata.md)››*

___

###  getMySigningKeys

▸ **getMySigningKeys**(): *Promise‹[Signer](../interfaces/_src_types_index_.signer.md)[]›*

*Defined in [src/Polymesh.ts:740](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L740)*

Get the list of signing keys related to the current identity

**`note`** can be subscribed to

**Returns:** *Promise‹[Signer](../interfaces/_src_types_index_.signer.md)[]›*

▸ **getMySigningKeys**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[Signer](../interfaces/_src_types_index_.signer.md)[]›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:741](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L741)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[Signer](../interfaces/_src_types_index_.signer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  getNetworkProperties

▸ **getNetworkProperties**(): *Promise‹[NetworkProperties](../interfaces/_src_types_index_.networkproperties.md)›*

*Defined in [src/Polymesh.ts:692](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L692)*

Retrieve information for the current network

**Returns:** *Promise‹[NetworkProperties](../interfaces/_src_types_index_.networkproperties.md)›*

___

###  getSecurityToken

▸ **getSecurityToken**(`args`: object): *Promise‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›*

*Defined in [src/Polymesh.ts:518](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L518)*

Retrieve a Security Token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›*

___

###  getSecurityTokens

▸ **getSecurityTokens**(`args?`: undefined | object): *Promise‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)[]›*

*Defined in [src/Polymesh.ts:483](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L483)*

Retrieve all the Security Tokens owned by an identity

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)[]›*

___

###  getTickerReservation

▸ **getTickerReservation**(`args`: object): *Promise‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)›*

*Defined in [src/Polymesh.ts:357](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L357)*

Retrieve a Ticker Reservation

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`ticker` | string | Security Token ticker  |

**Returns:** *Promise‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)›*

___

###  getTickerReservations

▸ **getTickerReservations**(`args?`: undefined | object): *Promise‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)[]›*

*Defined in [src/Polymesh.ts:319](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L319)*

Retrieve all the ticker reservations currently owned by an identity. This includes
Security Tokens that have already been launched

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)[]›*

___

###  getTransactionFees

▸ **getTransactionFees**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:404](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L404)*

Retrieve the protocol fees associated with running a specific transaction

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")  |

**Returns:** *Promise‹BigNumber›*

___

###  getTreasuryAddress

▸ **getTreasuryAddress**(): *string*

*Defined in [src/Polymesh.ts:411](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L411)*

Get the treasury wallet address

**Returns:** *string*

___

###  getTreasuryBalance

▸ **getTreasuryBalance**(): *Promise‹BigNumber›*

*Defined in [src/Polymesh.ts:716](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L716)*

Get the Treasury POLYX balance

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **getTreasuryBalance**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:717](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L717)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  isIdentityValid

▸ **isIdentityValid**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:393](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L393)*

Return whether the supplied identity/DID exists

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`identity` | [Identity](_src_api_entities_identity_index_.identity.md) &#124; string |

**Returns:** *Promise‹boolean›*

___

###  isTickerAvailable

▸ **isTickerAvailable**(`args`: object): *Promise‹boolean›*

*Defined in [src/Polymesh.ts:289](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L289)*

Check if a ticker hasn't been reserved

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹boolean›*

▸ **isTickerAvailable**(`args`: object, `callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Polymesh.ts:290](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L290)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../modules/_src_types_index_.md#subcallback)‹boolean›*

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  onConnectionError

▸ **onConnectionError**(`callback`: function): *function*

*Defined in [src/Polymesh.ts:449](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L449)*

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

*Defined in [src/Polymesh.ts:466](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L466)*

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

###  reserveTicker

▸ **reserveTicker**(`args`: [ReserveTickerParams](../interfaces/_src_api_procedures_reserveticker_.reservetickerparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)››*

*Defined in [src/Polymesh.ts:280](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L280)*

Reserve a ticker symbol to later use in the creation of a Security Token.
The ticker will expire after a set amount of time, after which other users can reserve it

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ReserveTickerParams](../interfaces/_src_api_procedures_reserveticker_.reservetickerparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)››*

___

###  revokeClaims

▸ **revokeClaims**(`args`: Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:438](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L438)*

Revoke claims from identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../modules/_src_api_procedures_modifyclaims_.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

###  transferPolyX

▸ **transferPolyX**(`args`: [TransferPolyXParams](../interfaces/_src_api_procedures_transferpolyx_.transferpolyxparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/Polymesh.ts:215](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L215)*

Transfer an amount of POLYX to a specified account

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferPolyXParams](../interfaces/_src_api_procedures_transferpolyx_.transferpolyxparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

### `Static` connect

▸ **connect**(`params`: ConnectParamsBase & object): *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

*Defined in [src/Polymesh.ts:99](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L99)*

Create the instance and connect to the Polymesh node

**Parameters:**

Name | Type |
------ | ------ |
`params` | ConnectParamsBase & object |

**Returns:** *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

▸ **connect**(`params`: ConnectParamsBase & object): *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

*Defined in [src/Polymesh.ts:101](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L101)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | ConnectParamsBase & object |

**Returns:** *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

▸ **connect**(`params`: ConnectParamsBase & object): *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

*Defined in [src/Polymesh.ts:107](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L107)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | ConnectParamsBase & object |

**Returns:** *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

▸ **connect**(`params`: ConnectParamsBase): *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*

*Defined in [src/Polymesh.ts:109](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Polymesh.ts#L109)*

**Parameters:**

Name | Type |
------ | ------ |
`params` | ConnectParamsBase |

**Returns:** *Promise‹[Polymesh](_src_polymesh_.polymesh.md)›*
