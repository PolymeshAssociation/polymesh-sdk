# Class: PolymeshTransactionBase\<ReturnValue, TransformedReturnValue\>

[base/PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase).PolymeshTransactionBase

Wrapper class for a Polymesh Transaction

## Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValue` | `void` |
| `TransformedReturnValue` | `ReturnValue` |

## Hierarchy

- **`PolymeshTransactionBase`**

  ↳ [`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)

  ↳ [`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)

## Table of contents

### Properties

- [blockHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blockhash)
- [blockNumber](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blocknumber)
- [error](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#error)
- [receipt](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#receipt)
- [status](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#status)
- [txHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txhash)
- [txIndex](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txindex)

### Accessors

- [isSuccess](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#issuccess)
- [result](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#result)

### Methods

- [getProtocolFees](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#getprotocolfees)
- [getTotalFees](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#gettotalfees)
- [onProcessedByMiddleware](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onprocessedbymiddleware)
- [onStatusChange](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onstatuschange)
- [run](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#run)
- [supportsSubsidy](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#supportssubsidy)
- [toSignablePayload](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#tosignablepayload)

## Properties

### blockHash

• `Optional` **blockHash**: `string`

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Defined in

[base/PolymeshTransactionBase.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L96)

___

### blockNumber

• `Optional` **blockNumber**: `BigNumber`

number of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Defined in

[base/PolymeshTransactionBase.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L101)

___

### error

• `Optional` **error**: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

#### Defined in

[base/PolymeshTransactionBase.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L76)

___

### receipt

• `Optional` **receipt**: `ISubmittableResult`

stores the transaction receipt (if successful)

#### Defined in

[base/PolymeshTransactionBase.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L81)

___

### status

• **status**: [`TransactionStatus`](../wiki/base.types.TransactionStatus) = `TransactionStatus.Idle`

current status of the transaction

#### Defined in

[base/PolymeshTransactionBase.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L71)

___

### txHash

• `Optional` **txHash**: `string`

transaction hash (status: `Running`, `Succeeded`, `Failed`)

#### Defined in

[base/PolymeshTransactionBase.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L86)

___

### txIndex

• `Optional` **txIndex**: `BigNumber`

transaction index within its block (status: `Succeeded`, `Failed`)

#### Defined in

[base/PolymeshTransactionBase.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L91)

## Accessors

### isSuccess

• `get` **isSuccess**(): `boolean`

returns true if transaction has completed successfully

#### Returns

`boolean`

#### Defined in

[base/PolymeshTransactionBase.ts:801](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L801)

___

### result

• `get` **result**(): `TransformedReturnValue`

returns the transaction result - this is the same value as the Promise run returns

#### Returns

`TransformedReturnValue`

**`Note`**

it is generally preferable to `await` the `Promise` returned by [transaction.run()](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#run) instead of reading this property

**`Throws`**

if the [transaction.isSuccess](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#issuccess) property is false — be sure to check that before accessing!

#### Defined in

[base/PolymeshTransactionBase.ts:718](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L718)

## Methods

### getProtocolFees

▸ `Abstract` **getProtocolFees**(): `Promise`\<`BigNumber`\>

Return this transaction's protocol fees. These are extra fees charged for
  specific operations on the chain. Not to be confused with network fees (which
  depend on the complexity of the operation), protocol fees are set by governance and/or
  chain upgrades

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[base/PolymeshTransactionBase.ts:646](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L646)

___

### getTotalFees

▸ **getTotalFees**(): `Promise`\<[`PayingAccountFees`](../wiki/base.types.PayingAccountFees)\>

Retrieve a breakdown of the fees required to run this transaction, as well as the Account responsible for paying them

#### Returns

`Promise`\<[`PayingAccountFees`](../wiki/base.types.PayingAccountFees)\>

**`Note`**

these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
  chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)

#### Defined in

[base/PolymeshTransactionBase.ts:438](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L438)

___

### onProcessedByMiddleware

▸ **onProcessedByMiddleware**(`listener`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Subscribe to the results of this transaction being processed by the indexing service (and as such, available to the middleware)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`err?`: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)) => `void` | callback function that will be called whenever the middleware is updated with the latest data. If there is an error (timeout or middleware offline) it will be passed to this callback |

#### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

unsubscribe function

**`Note`**

this event will be fired even if the queue fails

**`Throws`**

if the middleware wasn't enabled when instantiating the SDK client

#### Defined in

[base/PolymeshTransactionBase.ts:478](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L478)

___

### onStatusChange

▸ **onStatusChange**(`listener`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Subscribe to status changes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`transaction`: [`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`ReturnValue`, `TransformedReturnValue`\>) => `void` | callback function that will be called whenever the status changes |

#### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

unsubscribe function

#### Defined in

[base/PolymeshTransactionBase.ts:420](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L420)

___

### run

▸ **run**(): `Promise`\<`TransformedReturnValue`\>

Run the transaction, update its status and return a result if applicable.
  Certain transactions create Entities on the blockchain, and those Entities are returned
  for convenience. For example, when running a transaction that creates an Asset, the Asset itself
  is returned

#### Returns

`Promise`\<`TransformedReturnValue`\>

#### Defined in

[base/PolymeshTransactionBase.ts:195](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L195)

___

### supportsSubsidy

▸ `Abstract` **supportsSubsidy**(): `boolean`

Return whether the transaction can be subsidized. If the result is false
  AND the caller is being subsidized by a third party, the transaction can't be executed and trying
  to do so will result in an error

#### Returns

`boolean`

**`Note`**

this depends on the type of transaction itself (e.g. `staking.bond` can't be subsidized, but `asset.createAsset` can)

#### Defined in

[base/PolymeshTransactionBase.ts:616](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L616)

___

### toSignablePayload

▸ **toSignablePayload**(`metadata?`): `Promise`\<[`TransactionPayload`](../wiki/base.types.TransactionPayload)\>

Returns a representation intended for offline signers.

#### Parameters

| Name | Type |
| :------ | :------ |
| `metadata` | `Record`\<`string`, `string`\> |

#### Returns

`Promise`\<[`TransactionPayload`](../wiki/base.types.TransactionPayload)\>

**`Note`**

Usually `.run()` should be preferred due to is simplicity.

**`Note`**

When using this method, details like account nonces, and transaction mortality require extra consideration. Generating a payload for offline sign implies asynchronicity. If using this API, be sure each procedure is created with the correct nonce, accounting for in flight transactions, and the lifetime is sufficient.

#### Defined in

[base/PolymeshTransactionBase.ts:739](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/PolymeshTransactionBase.ts#L739)
