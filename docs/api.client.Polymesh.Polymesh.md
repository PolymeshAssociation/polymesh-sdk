# Class: Polymesh

[api/client/Polymesh](../wiki/api.client.Polymesh).Polymesh

Main entry point of the Polymesh SDK

## Table of contents

### Properties

- [accountManagement](../wiki/api.client.Polymesh.Polymesh#accountmanagement)
- [assets](../wiki/api.client.Polymesh.Polymesh#assets)
- [claims](../wiki/api.client.Polymesh.Polymesh#claims)
- [identities](../wiki/api.client.Polymesh.Polymesh#identities)
- [network](../wiki/api.client.Polymesh.Polymesh#network)
- [settlements](../wiki/api.client.Polymesh.Polymesh#settlements)

### Accessors

- [\_middlewareApiV2](../wiki/api.client.Polymesh.Polymesh#_middlewareapiv2)
- [\_polkadotApi](../wiki/api.client.Polymesh.Polymesh#_polkadotapi)
- [\_signingAddress](../wiki/api.client.Polymesh.Polymesh#_signingaddress)

### Methods

- [createTransactionBatch](../wiki/api.client.Polymesh.Polymesh#createtransactionbatch)
- [disconnect](../wiki/api.client.Polymesh.Polymesh#disconnect)
- [getSigningIdentity](../wiki/api.client.Polymesh.Polymesh#getsigningidentity)
- [onConnectionError](../wiki/api.client.Polymesh.Polymesh#onconnectionerror)
- [onDisconnect](../wiki/api.client.Polymesh.Polymesh#ondisconnect)
- [setSigningAccount](../wiki/api.client.Polymesh.Polymesh#setsigningaccount)
- [setSigningManager](../wiki/api.client.Polymesh.Polymesh#setsigningmanager)
- [connect](../wiki/api.client.Polymesh.Polymesh#connect)

## Properties

### accountManagement

• **accountManagement**: [`AccountManagement`](../wiki/api.client.AccountManagement.AccountManagement)

A set of methods for managing a Polymesh Identity's Accounts and their permissions

#### Defined in

[api/client/Polymesh.ts:104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L104)

___

### assets

• **assets**: [`Assets`](../wiki/api.client.Assets.Assets)

A set of methods for interacting with Assets

#### Defined in

[api/client/Polymesh.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L112)

___

### claims

• **claims**: [`Claims`](../wiki/api.client.Claims.Claims)

A set of methods to deal with Claims

#### Defined in

[api/client/Polymesh.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L92)

___

### identities

• **identities**: [`Identities`](../wiki/api.client.Identities.Identities)

A set of methods for interacting with Polymesh Identities.

#### Defined in

[api/client/Polymesh.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L108)

___

### network

• **network**: [`Network`](../wiki/api.client.Network.Network)

A set of methods to interact with the Polymesh network. This includes transferring POLYX, reading network properties and querying for historical events

#### Defined in

[api/client/Polymesh.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L96)

___

### settlements

• **settlements**: [`Settlements`](../wiki/api.client.Settlements.Settlements)

A set of methods for exchanging Assets

#### Defined in

[api/client/Polymesh.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L100)

## Accessors

### \_middlewareApiV2

• `get` **_middlewareApiV2**(): `ApolloClient`<`NormalizedCacheObject`\>

MiddlewareV2 client

#### Returns

`ApolloClient`<`NormalizedCacheObject`\>

___

### \_polkadotApi

• `get` **_polkadotApi**(): `ApiPromise`

Polkadot client

#### Returns

`ApiPromise`

___

### \_signingAddress

• `get` **_signingAddress**(): `string`

signing address (to manually submit transactions with the polkadot API)

#### Returns

`string`

## Methods

### createTransactionBatch

▸ **createTransactionBatch**<`ReturnValues`\>(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`ReturnValues`, `ReturnValues`\>\>

Create a batch transaction from a list of separate transactions. The list can contain batch transactions as well.
  The result of running this transaction will be an array of the results of each transaction in the list, in the same order.
  Transactions with no return value will produce `undefined` in the resulting array

**`Example`**

 Batching 3 ticker reservation transactions

```typescript
const tx1 = await sdk.assets.reserveTicker({ ticker: 'FOO' });
const tx2 = await sdk.assets.reserveTicker({ ticker: 'BAR' });
const tx3 = await sdk.assets.reserveTicker({ ticker: 'BAZ' });

const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const });

const [res1, res2, res3] = await batch.run();
```

**`Example`**

 Specifying the signer account for the whole batch

```typescript
const batch = sdk.createTransactionBatch({ transactions: [tx1, tx2, tx3] as const }, { signingAccount: 'someAddress' });

const [res1, res2, res3] = await batch.run();
```

**`Note`**

 it is mandatory to use the `as const` type assertion when passing in the transaction array to the method in order to get the correct types
  for the results of running the batch

**`Note`**

 if a signing Account is not specified, the default one will be used (the one returned by `sdk.accountManagement.getSigningAccount()`)

**`Note`**

 all fees in the resulting batch must be paid by the calling Account, regardless of any exceptions that would normally be made for
  the individual transactions (such as subsidies or accepting invitations to join an Identity)

**`Note`**

 this method is of type [CreateTransactionBatchProcedureMethod](../wiki/types.CreateTransactionBatchProcedureMethod), which means you can call [createTransactionBatch.checkAuthorization](../wiki/types.CreateTransactionBatchProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValues` | extends readonly `unknown`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`ReturnValues`, `ReturnValues`\>\>

___

### disconnect

▸ **disconnect**(): `Promise`<`void`\>

Disconnect the client and close all open connections and subscriptions

**`Note`**

 the SDK will become unusable after this operation. It will throw an error when attempting to
  access any chain or middleware data. If you wish to continue using the SDK, you must
  create a new instance by calling [connect](../wiki/api.client.Polymesh.Polymesh#connect)

#### Returns

`Promise`<`void`\>

___

### getSigningIdentity

▸ **getSigningIdentity**(): `Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to the signing Account (null if there is none)

**`Throws`**

 if there is no signing Account associated to the SDK

#### Returns

`Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### onConnectionError

▸ **onConnectionError**(`callback`): [`UnsubCallback`](../wiki/types#unsubcallback)

Handle connection errors

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (...`args`: `unknown`[]) => `unknown` |

#### Returns

[`UnsubCallback`](../wiki/types#unsubcallback)

an unsubscribe callback

___

### onDisconnect

▸ **onDisconnect**(`callback`): [`UnsubCallback`](../wiki/types#unsubcallback)

Handle disconnection

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (...`args`: `unknown`[]) => `unknown` |

#### Returns

[`UnsubCallback`](../wiki/types#unsubcallback)

an unsubscribe callback

___

### setSigningAccount

▸ **setSigningAccount**(`signer`): `Promise`<`void`\>

Set the SDK's signing Account to the provided one

**`Throws`**

 if the passed Account is not present in the Signing Manager (or there is no Signing Manager)

#### Parameters

| Name | Type |
| :------ | :------ |
| `signer` | `string` \| [`Account`](../wiki/api.entities.Account.Account) |

#### Returns

`Promise`<`void`\>

___

### setSigningManager

▸ **setSigningManager**(`signingManager`): `Promise`<`void`\>

Set the SDK's Signing Manager to the provided one.

**`Note`**

 Pass `null` to unset the current signing manager

#### Parameters

| Name | Type |
| :------ | :------ |
| `signingManager` | ``null`` \| `SigningManager` |

#### Returns

`Promise`<`void`\>

___

### connect

▸ `Static` **connect**(`params`): `Promise`<[`Polymesh`](../wiki/api.client.Polymesh.Polymesh)\>

Create an SDK instance and connect to a Polymesh node

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ConnectParams`](../wiki/api.client.Polymesh.ConnectParams) |

#### Returns

`Promise`<[`Polymesh`](../wiki/api.client.Polymesh.Polymesh)\>
