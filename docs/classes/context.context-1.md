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
* [issuedClaims](context.context-1.md#issuedclaims)
* [queryMiddleware](context.context-1.md#querymiddleware)
* [setPair](context.context-1.md#setpair)
* [create](context.context-1.md#static-create)

## Properties

### `Optional` currentPair

• **currentPair**? : *[KeyringPair](../interfaces/types.keyringpair.md)*

*Defined in [src/context/index.ts:80](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L80)*

___

###  polymeshApi

• **polymeshApi**: *ApiPromise*

*Defined in [src/context/index.ts:78](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L78)*

## Accessors

###  middlewareApi

• **get middlewareApi**(): *ApolloClient‹NormalizedCacheObject›*

*Defined in [src/context/index.ts:627](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L627)*

Retrieve the middleware client

**`throws`** if credentials are not set

**Returns:** *ApolloClient‹NormalizedCacheObject›*

## Methods

###  accountBalance

▸ **accountBalance**(`accountId?`: undefined | string): *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

*Defined in [src/context/index.ts:243](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L243)*

Retrieve the account level POLYX balance

**`note`** can be subscribed to

**Parameters:**

Name | Type |
------ | ------ |
`accountId?` | undefined &#124; string |

**Returns:** *Promise‹[AccountBalance](../interfaces/types.accountbalance.md)›*

▸ **accountBalance**(`accountId`: string | undefined, `callback`: [SubCallback](../modules/types.md#subcallback)‹[AccountBalance](../interfaces/types.accountbalance.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/context/index.ts:244](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L244)*

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

▸ **getAccounts**(): *Array‹[AccountData](../interfaces/context.accountdata.md)›*

*Defined in [src/context/index.ts:195](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L195)*

Retrieve a list of addresses associated with the account

**Returns:** *Array‹[AccountData](../interfaces/context.accountdata.md)›*

___

###  getCurrentIdentity

▸ **getCurrentIdentity**(): *[Identity](api_entities_identity.identity.md)*

*Defined in [src/context/index.ts:302](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L302)*

Retrieve current Identity

**`throws`** if there is no identity associated to the current account (or there is no current account associated to the SDK instance)

**Returns:** *[Identity](api_entities_identity.identity.md)*

___

###  getCurrentPair

▸ **getCurrentPair**(): *[KeyringPair](../interfaces/types.keyringpair.md)*

*Defined in [src/context/index.ts:320](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L320)*

Retrieve current Keyring Pair

**`throws`** if there is no account associated to the SDK instance

**Returns:** *[KeyringPair](../interfaces/types.keyringpair.md)*

___

###  getInvalidDids

▸ **getInvalidDids**(`identities`: (string | [Identity](api_entities_identity.identity.md)‹›)[]): *Promise‹string[]›*

*Defined in [src/context/index.ts:335](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L335)*

Check whether identities exist

**Parameters:**

Name | Type |
------ | ------ |
`identities` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] |

**Returns:** *Promise‹string[]›*

___

###  getSigningKeys

▸ **getSigningKeys**(): *Promise‹[Signer](../interfaces/types.signer.md)[]›*

*Defined in [src/context/index.ts:533](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L533)*

Retrieve the list of signing keys related to the account

**`note`** can be subscribed to

**Returns:** *Promise‹[Signer](../interfaces/types.signer.md)[]›*

▸ **getSigningKeys**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/context/index.ts:534](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L534)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[Signer](../interfaces/types.signer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getTransactionArguments

▸ **getTransactionArguments**(`args`: object): *[TransactionArgument](../modules/types.md#transactionargument)[]*

*Defined in [src/context/index.ts:385](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L385)*

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

*Defined in [src/context/index.ts:358](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L358)*

Retrieve the protocol fees associated with running a specific transaction

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | transaction tag (i.e. TxTags.asset.CreateAsset or "asset.createAsset")  |

**Returns:** *Promise‹BigNumber›*

___

###  issuedClaims

▸ **issuedClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

*Defined in [src/context/index.ts:567](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L567)*

Retrieve a list of claims. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`claimTypes?` | [ClaimType](../enums/types.claimtype.md)[] | types of the claims to fetch. Defaults to any type |
`includeExpired?` | undefined &#124; false &#124; true | - |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`targets?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] | identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets |
`trustedClaimIssuers?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] | identity IDs of claim issuers. Defaults to all claim issuers |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

___

###  queryMiddleware

▸ **queryMiddleware**‹**Result**›(`query`: [GraphqlQuery](../interfaces/types.graphqlquery.md)‹unknown›): *Promise‹ApolloQueryResult‹Result››*

*Defined in [src/context/index.ts:644](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L644)*

**Type parameters:**

▪ **Result**: *Partial‹[Query](../modules/middleware.md#query)›*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`query` | [GraphqlQuery](../interfaces/types.graphqlquery.md)‹unknown› |   |

**Returns:** *Promise‹ApolloQueryResult‹Result››*

___

###  setPair

▸ **setPair**(`address`: string): *Promise‹void›*

*Defined in [src/context/index.ts:205](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L205)*

Set a pair as the current account keyring pair

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |

**Returns:** *Promise‹void›*

___

### `Static` create

▸ **create**(`params`: object): *Promise‹[Context](context.context-1.md)›*

*Defined in [src/context/index.ts:114](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L114)*

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

*Defined in [src/context/index.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L120)*

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

*Defined in [src/context/index.ts:126](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L126)*

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

*Defined in [src/context/index.ts:132](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/context/index.ts#L132)*

Create the Context instance

**Parameters:**

▪ **params**: *object*

Name | Type |
------ | ------ |
`middlewareApi` | ApolloClient‹NormalizedCacheObject› &#124; null |
`polymeshApi` | ApiPromise |

**Returns:** *Promise‹[Context](context.context-1.md)›*
