# Class: Network

[api/client/Network](../wiki/api.client.Network).Network

Handles all Network related functionality, including querying for historical events from middleware

## Table of contents

### Methods

- [getEventByIndexedArgs](../wiki/api.client.Network.Network#geteventbyindexedargs)
- [getEventsByIndexedArgs](../wiki/api.client.Network.Network#geteventsbyindexedargs)
- [getLatestBlock](../wiki/api.client.Network.Network#getlatestblock)
- [getMiddlewareLag](../wiki/api.client.Network.Network#getmiddlewarelag)
- [getMiddlewareMetadata](../wiki/api.client.Network.Network#getmiddlewaremetadata)
- [getNetworkProperties](../wiki/api.client.Network.Network#getnetworkproperties)
- [getProtocolFees](../wiki/api.client.Network.Network#getprotocolfees)
- [getSs58Format](../wiki/api.client.Network.Network#getss58format)
- [getTransactionByHash](../wiki/api.client.Network.Network#gettransactionbyhash)
- [getTreasuryAccount](../wiki/api.client.Network.Network#gettreasuryaccount)
- [getTreasuryBalance](../wiki/api.client.Network.Network#gettreasurybalance)
- [getVersion](../wiki/api.client.Network.Network#getversion)
- [submitTransaction](../wiki/api.client.Network.Network#submittransaction)
- [supportsConfidentialAssets](../wiki/api.client.Network.Network#supportsconfidentialassets)
- [supportsSubscription](../wiki/api.client.Network.Network#supportssubscription)
- [transferPolyx](../wiki/api.client.Network.Network#transferpolyx)

## Methods

### getEventByIndexedArgs

▸ **getEventByIndexedArgs**(`opts`): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve a single event by any of its indexed arguments. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.eventArg0?` | `string` | event parameter value to filter by in position 0 |
| `opts.eventArg1?` | `string` | event parameter value to filter by in position 1 |
| `opts.eventArg2?` | `string` | event parameter value to filter by in position 2 |
| `opts.eventId` | [`EventIdEnum`](../wiki/types.EventIdEnum) | type of the event to fetch |
| `opts.moduleId` | [`ModuleIdEnum`](../wiki/types.ModuleIdEnum) | type of the module to fetch |

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/client/Network.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L170)

___

### getEventsByIndexedArgs

▸ **getEventsByIndexedArgs**(`opts`): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)[]\>

Retrieve a list of events. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.eventArg0?` | `string` | event parameter value to filter by in position 0 |
| `opts.eventArg1?` | `string` | event parameter value to filter by in position 1 |
| `opts.eventArg2?` | `string` | event parameter value to filter by in position 2 |
| `opts.eventId` | [`EventIdEnum`](../wiki/types.EventIdEnum) | type of the event to fetch |
| `opts.moduleId` | [`ModuleIdEnum`](../wiki/types.ModuleIdEnum) | type of the module to fetch |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)[]\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/client/Network.ts:356](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L356)

___

### getLatestBlock

▸ **getLatestBlock**(): `Promise`\<`BigNumber`\>

Retrieve the number of the latest finalized block in the chain

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/client/Network.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L61)

___

### getMiddlewareLag

▸ **getMiddlewareLag**(): `Promise`\<`BigNumber`\>

Get the number of blocks the middleware needs to process to be synced with chain.
The lag can be around somewhere upto 15 blocks, but this can increase if the block size being processed by the Middleware is too large.
If the lag is too large, its recommended to check the indexer health to make sure the Middleware is processing the blocks.

#### Returns

`Promise`\<`BigNumber`\>

**`Note`**

uses the middleware V2

#### Defined in

[api/client/Network.ts:508](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L508)

___

### getMiddlewareMetadata

▸ **getMiddlewareMetadata**(): `Promise`\<``null`` \| [`MiddlewareMetadata`](../wiki/api.client.types.MiddlewareMetadata)\>

Retrieve middleware metadata.
Returns null if middleware is disabled

#### Returns

`Promise`\<``null`` \| [`MiddlewareMetadata`](../wiki/api.client.types.MiddlewareMetadata)\>

**`Note`**

uses the middleware V2

#### Defined in

[api/client/Network.ts:497](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L497)

___

### getNetworkProperties

▸ **getNetworkProperties**(): `Promise`\<[`NetworkProperties`](../wiki/api.client.types.NetworkProperties)\>

Retrieve information for the current network

#### Returns

`Promise`\<[`NetworkProperties`](../wiki/api.client.types.NetworkProperties)\>

#### Defined in

[api/client/Network.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L82)

___

### getProtocolFees

▸ **getProtocolFees**(`args`): `Promise`\<[`ProtocolFees`](../wiki/api.client.types.ProtocolFees)[]\>

Retrieve the protocol fees associated with running specific transactions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.tags` | [`TxTag`](../wiki/generated.types#txtag)[] | list of transaction tags (e.g. [TxTags.asset.CreateAsset, TxTags.asset.RegisterUniqueTicker] or ["asset.createAsset", "asset.registerTicker"]) |

#### Returns

`Promise`\<[`ProtocolFees`](../wiki/api.client.types.ProtocolFees)[]\>

#### Defined in

[api/client/Network.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L108)

___

### getSs58Format

▸ **getSs58Format**(): `BigNumber`

Retrieve the chain's SS58 format

#### Returns

`BigNumber`

#### Defined in

[api/client/Network.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L75)

___

### getTransactionByHash

▸ **getTransactionByHash**(`opts`): `Promise`\<``null`` \| [`ExtrinsicDataWithFees`](../wiki/api.client.types.ExtrinsicDataWithFees)\>

Retrieve a transaction by hash

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.txHash` | `string` | hash of the transaction |

#### Returns

`Promise`\<``null`` \| [`ExtrinsicDataWithFees`](../wiki/api.client.types.ExtrinsicDataWithFees)\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/client/Network.ts:405](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L405)

___

### getTreasuryAccount

▸ **getTreasuryAccount**(): [`Account`](../wiki/api.entities.Account.Account)

Get the treasury wallet address

#### Returns

[`Account`](../wiki/api.entities.Account.Account)

#### Defined in

[api/client/Network.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L115)

___

### getTreasuryBalance

▸ **getTreasuryBalance**(): `Promise`\<`BigNumber`\>

Get the Treasury POLYX balance

#### Returns

`Promise`\<`BigNumber`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/client/Network.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L128)

▸ **getTreasuryBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`BigNumber`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/client/Network.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L129)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

Fetch the current network version (e.g. 3.1.0)

#### Returns

`Promise`\<`string`\>

#### Defined in

[api/client/Network.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L68)

___

### submitTransaction

▸ **submitTransaction**(`txPayload`, `signature`): `Promise`\<[`SubmissionDetails`](../wiki/api.client.types.SubmissionDetails)\>

Submits a transaction payload with its signature to the chain. `signature` should be hex encoded

#### Parameters

| Name | Type |
| :------ | :------ |
| `txPayload` | [`TransactionPayloadInput`](../wiki/base.types#transactionpayloadinput) |
| `signature` | `string` |

#### Returns

`Promise`\<[`SubmissionDetails`](../wiki/api.client.types.SubmissionDetails)\>

**`Throws`**

if the signature is not hex encoded

#### Defined in

[api/client/Network.ts:209](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L209)

___

### supportsConfidentialAssets

▸ **supportsConfidentialAssets**(): `boolean`

Returns whether or not the connected chain node as support for confidential assets

#### Returns

`boolean`

#### Defined in

[api/client/Network.ts:525](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L525)

___

### supportsSubscription

▸ **supportsSubscription**(): `boolean`

Returns if functions can be subscribed.

#### Returns

`boolean`

`true` if connected over ws(s)://, otherwise `false`

#### Defined in

[api/client/Network.ts:541](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L541)

___

### transferPolyx

▸ **transferPolyx**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Transfer an amount of POLYX to a specified Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`TransferPolyxParams`](../wiki/api.procedures.types.TransferPolyxParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [transferPolyx.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Network.ts:155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Network.ts#L155)
