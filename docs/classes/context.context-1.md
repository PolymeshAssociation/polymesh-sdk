# Class: Context

Context in which the SDK is being used

- Holds the current low level API
- Holds the current keyring pair
- Holds the current Identity

## Hierarchy

* **Context**

## Index

### Properties

* [currentPair](context.context-1.md#optional-currentpair)
* [polymeshApi](context.context-1.md#polymeshapi)

### Accessors

* [middlewareApi](context.context-1.md#middlewareapi)

### Methods

* [accountBalance](context.context-1.md#accountbalance)
* [getAccounts](context.context-1.md#getaccounts)
* [getCurrentIdentity](context.context-1.md#getcurrentidentity)
* [getCurrentPair](context.context-1.md#getcurrentpair)
* [getInvalidDids](context.context-1.md#getinvaliddids)
* [getSigningKeys](context.context-1.md#getsigningkeys)
* [getTransactionArguments](context.context-1.md#gettransactionarguments)
* [getTransactionFees](context.context-1.md#gettransactionfees)
* [setPair](context.context-1.md#setpair)
* [create](context.context-1.md#static-create)

## Properties

### `Optional` currentPair

• **currentPair**? : *[KeyringPair](../interfaces/types.keyringpair.md)*

*Defined in [src/context/index.ts:71](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L71)*

___

###  polymeshApi

• **polymeshApi**: *ApiPromise*

*Defined in [src/context/index.ts:69](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L69)*

## Accessors

###  middlewareApi

• **get middlewareApi**(): *ApolloClient‹NormalizedCacheObject›*

*Defined in [src/context/index.ts:554](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L554)*

Retrieve the middleware client

**`throws`** if credentials are not set

**Returns:** *ApolloClient‹NormalizedCacheObject›*

## Methods

###  accountBalance

▸ **accountBalance**(`accountId?`: undefined | string): *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

*Defined in [src/context/index.ts:234](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L234)*

Retrieve the account level POLYX balance

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`accountId?` | undefined &#124; string |

**Returns:** *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

▸ **accountBalance**(`accountId`: string | undefined, `callback`: [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/context/index.ts:235](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L235)*

Retrieve the account level POLYX balance

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`accountId` | string &#124; undefined |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getAccounts

▸ **getAccounts**(): *Array‹AccountData›*

*Defined in [src/context/index.ts:186](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L186)*

Retrieve a list of addresses associated with the account

**Returns:** *Array‹AccountData›*

___

###  getCurrentIdentity

▸ **getCurrentIdentity**(): *[Identity](api_entities_identity.identity.md)*

*Defined in [src/context/index.ts:293](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L293)*

Retrieve current Identity

**`throws`** if there is no identity associated to the current account (or there is no current account associated to the SDK instance)

**Returns:** *[Identity](api_entities_identity.identity.md)*

___

###  getCurrentPair

▸ **getCurrentPair**(): *[KeyringPair](../interfaces/types.keyringpair.md)*

*Defined in [src/context/index.ts:311](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L311)*

Retrieve current Keyring Pair

**`throws`** if there is no account associated to the SDK instance

**Returns:** *[KeyringPair](../interfaces/types.keyringpair.md)*

___

###  getInvalidDids

▸ **getInvalidDids**(`identities`: (string | [Identity](api_entities_identity.identity.md)‹›)[]): *Promise‹string[]›*

*Defined in [src/context/index.ts:326](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L326)*

Check whether identities exist

**Parameters:**

Name | Type |
------ | ------ |
`identities` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] |

**Returns:** *Promise‹string[]›*

___

###  getSigningKeys

▸ **getSigningKeys**(): *Promise‹[Signer](../interfaces/types.signer.md)[]›*

*Defined in [src/context/index.ts:524](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L524)*

Retrieve the list of signing keys related to the account

**`note`** can be subscribed to

**Returns:** *Promise‹[Signer](../interfaces/types.signer.md)[]›*

▸ **getSigningKeys**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/context/index.ts:525](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L525)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getTransactionArguments

▸ **getTransactionArguments**(`args`: object): *[TransactionArgument](../modules/types.md#transactionargument)[]*

*Defined in [src/context/index.ts:376](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L376)*

Retrieve the types of arguments that a certain transaction requires to be run

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | tag associated with the transaction that will be executed if the proposal passes  |

**Returns:** *[TransactionArgument](../modules/types.md#transactionargument)[]*

___

###  getTransactionFees

▸ **getTransactionFees**(`tag`: TxTag): *Promise‹BigNumber›*

*Defined in [src/context/index.ts:349](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L349)*

Retrieve the protocol fees associated with running a specific transaction

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")  |

**Returns:** *Promise‹BigNumber›*

___

###  setPair

▸ **setPair**(`address`: string): *Promise‹void›*

*Defined in [src/context/index.ts:196](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L196)*

Set a pair as the current account keyring pair

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |

**Returns:** *Promise‹void›*

___

### `Static` create

▸ **create**(`params`: object): *Promise‹[Context](context.context-1.md)›*

*Defined in [src/context/index.ts:105](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L105)*

Create the Context instance

**Parameters:**

▪ **params**: *object*

Name | Type |
------ | ------ |
`middlewareApi` | ApolloClient‹NormalizedCacheObject› &#124; null |
`polymeshApi` | ApiPromise |
`seed` | string |

**Returns:** *Promise‹[Context](context.context-1.md)›*

▸ **create**(`params`: object): *Promise‹[Context](context.context-1.md)›*

*Defined in [src/context/index.ts:111](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L111)*

Create the Context instance

**Parameters:**

▪ **params**: *object*

Name | Type |
------ | ------ |
`keyring` | [CommonKeyring](../modules/types.md#commonkeyring) |
`middlewareApi` | ApolloClient‹NormalizedCacheObject› &#124; null |
`polymeshApi` | ApiPromise |

**Returns:** *Promise‹[Context](context.context-1.md)›*

▸ **create**(`params`: object): *Promise‹[Context](context.context-1.md)›*

*Defined in [src/context/index.ts:117](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L117)*

Create the Context instance

**Parameters:**

▪ **params**: *object*

Name | Type |
------ | ------ |
`middlewareApi` | ApolloClient‹NormalizedCacheObject› &#124; null |
`polymeshApi` | ApiPromise |
`uri` | string |

**Returns:** *Promise‹[Context](context.context-1.md)›*

▸ **create**(`params`: object): *Promise‹[Context](context.context-1.md)›*

*Defined in [src/context/index.ts:123](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/context/index.ts#L123)*

Create the Context instance

**Parameters:**

▪ **params**: *object*

Name | Type |
------ | ------ |
`middlewareApi` | ApolloClient‹NormalizedCacheObject› &#124; null |
`polymeshApi` | ApiPromise |

**Returns:** *Promise‹[Context](context.context-1.md)›*
