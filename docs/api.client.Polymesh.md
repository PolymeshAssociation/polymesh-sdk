[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Polymesh

# api/client/Polymesh

## Classes

### Polymesh

Defined in: [api/client/Polymesh.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L88)

Main entry point of the Polymesh SDK

#### Properties

##### accountManagement

> **accountManagement**: [`AccountManagement`](../wiki/api.client.AccountManagement#accountmanagement)

Defined in: [api/client/Polymesh.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L112)

A set of methods for managing a Polymesh Identity's Accounts and their permissions

##### assets

> **assets**: [`Assets`](../wiki/api.client.Assets#assets)

Defined in: [api/client/Polymesh.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L120)

A set of methods for interacting with Assets

##### claims

> **claims**: [`Claims`](../wiki/api.client.Claims#claims)

Defined in: [api/client/Polymesh.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L96)

A set of methods to deal with Claims

##### identities

> **identities**: [`Identities`](../wiki/api.client.Identities#identities)

Defined in: [api/client/Polymesh.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L116)

A set of methods for interacting with Polymesh Identities.

##### network

> **network**: [`Network`](../wiki/api.client.Network#network)

Defined in: [api/client/Polymesh.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L100)

A set of methods to interact with the Polymesh network. This includes transferring POLYX, reading network properties and querying for historical events

##### settlements

> **settlements**: [`Settlements`](../wiki/api.client.Settlements#settlements)

Defined in: [api/client/Polymesh.ts:104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L104)

A set of methods for exchanging Assets

##### staking

> **staking**: [`Staking`](../wiki/api.client.Staking#staking)

Defined in: [api/client/Polymesh.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L108)

A set of methods for staking POLYX

#### Accessors

##### \_middlewareApiV2

###### Get Signature

> **get** **\_middlewareApiV2**(): `ApolloClient`\<`NormalizedCacheObject`\>

Defined in: [api/client/Polymesh.ts:355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L355)

MiddlewareV2 client

###### Returns

`ApolloClient`\<`NormalizedCacheObject`\>

##### \_polkadotApi

###### Get Signature

> **get** **\_polkadotApi**(): `ApiPromise`

Defined in: [api/client/Polymesh.ts:339](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L339)

Polkadot client

###### Returns

`ApiPromise`

##### \_signingAddress

###### Get Signature

> **get** **\_signingAddress**(): `string`

Defined in: [api/client/Polymesh.ts:347](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L347)

signing address (to manually submit transactions with the polkadot API)

###### Returns

`string`

#### Methods

##### createTransactionBatch()

> **createTransactionBatch**\<`ReturnValues`\>(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`ReturnValues`, `ReturnValues`\>\>

Defined in: [api/client/Polymesh.ts:332](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L332)

Create a batch transaction from a list of separate transactions. The list can contain batch transactions as well.
  The result of running this transaction will be an array of the results of each transaction in the list, in the same order.
  Transactions with no return value will produce `undefined` in the resulting array

###### Type Parameters

| Type Parameter |
| ------ |
| `ReturnValues` *extends* readonly `unknown`[] |

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types#createtransactionbatchparams)\<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`ReturnValues`, `ReturnValues`\>\>

###### Examples

**Batching 3 ticker reservation transactions**

```typescript
const tx1 = await sdk.assets.reserveTicker({ ticker: 'FOO' });
const tx2 = await sdk.assets.reserveTicker({ ticker: 'BAR' });
const tx3 = await sdk.assets.reserveTicker({ ticker: 'BAZ' });

const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const });

const [res1, res2, res3] = await batch.run();
```

**Specifying the signer account for the whole batch**

```typescript
const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const }, { signingAccount: 'someAddress' });

const [res1, res2, res3] = await batch.run();
```

###### Note

it is mandatory to use the `as const` type assertion when passing in the transaction array to the method in order to get the correct types
  for the results of running the batch

###### Note

if a signing Account is not specified, the default one will be used (the one returned by `sdk.accountManagement.getSigningAccount()`)

###### Note

all fees in the resulting batch must be paid by the calling Account, regardless of any exceptions that would normally be made for
  the individual transactions (such as subsidies or accepting invitations to join an Identity)

###### Note

this method is of type [CreateTransactionBatchProcedureMethod](../wiki/api.procedures.types#createtransactionbatchproceduremethod), which means you can call [createTransactionBatch.checkAuthorization](../wiki/api.procedures.types#checkauthorization) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [api/client/Polymesh.ts:277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L277)

Disconnect the client and close all open connections and subscriptions

###### Returns

`Promise`\<`void`\>

###### Note

the SDK will become unusable after this operation. It will throw an error when attempting to
  access any chain or middleware data. If you wish to continue using the SDK, you must
  create a new instance by calling [connect](../wiki/#connect)

##### getSigningIdentity()

> **getSigningIdentity**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/client/Polymesh.ts:232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L232)

Retrieve the Identity associated to the signing Account (null if there is none)

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

###### Throws

if there is no signing Account associated to the SDK

##### onConnectionError()

> **onConnectionError**(`callback`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Defined in: [api/client/Polymesh.ts:241](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L241)

Handle connection errors

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `callback` | (...`args`) => `unknown` |

###### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

an unsubscribe callback

##### onDisconnect()

> **onDisconnect**(`callback`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Defined in: [api/client/Polymesh.ts:258](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L258)

Handle disconnection

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `callback` | (...`args`) => `unknown` |

###### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

an unsubscribe callback

##### setSigningAccount()

> **setSigningAccount**(`signer`): `void`

Defined in: [api/client/Polymesh.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L286)

Set the SDK's signing Account to the provided one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `signer` | `string` \| [`Account`](../wiki/api.entities.Account#account) |

###### Returns

`void`

###### Throws

if the passed Account is not present in the Signing Manager (or there is no Signing Manager)

##### setSigningManager()

> **setSigningManager**(`signingManager`): `Promise`\<`void`\>

Defined in: [api/client/Polymesh.ts:295](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L295)

Set the SDK's Signing Manager to the provided one.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `signingManager` | `SigningManager` \| `null` |

###### Returns

`Promise`\<`void`\>

###### Note

Pass `null` to unset the current signing manager

##### connect()

> `static` **connect**(`params`): `Promise`\<[`Polymesh`](../wiki/#polymesh)\>

Defined in: [api/client/Polymesh.ts:154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L154)

Create an SDK instance and connect to a Polymesh node

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `params` | [`ConnectParams`](../wiki/#connectparams) |

###### Returns

`Promise`\<[`Polymesh`](../wiki/#polymesh)\>

## Interfaces

### ConnectParams

Defined in: [api/client/Polymesh.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L37)

#### Properties

##### middlewareV2?

> `optional` **middlewareV2?**: [`MiddlewareConfig`](../wiki/api.client.types#middlewareconfig)

Defined in: [api/client/Polymesh.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L51)

Allows for historical data to be queried. Required for some methods to work

##### nodeUrl

> **nodeUrl**: `string`

Defined in: [api/client/Polymesh.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L43)

The websocket or http URL for the Polymesh node to connect to

###### Note

subscription features are not available if an http URL is provided

##### polkadot?

> `optional` **polkadot?**: [`PolkadotConfig`](../wiki/api.client.types#polkadotconfig)

Defined in: [api/client/Polymesh.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L55)

Advanced options that will be used with the underling polkadot.js instance

##### signingManager?

> `optional` **signingManager?**: `SigningManager`

Defined in: [api/client/Polymesh.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Polymesh.ts#L47)

Handles signing of transactions. Required to be set before submitting transactions
