# Class: PolymeshTransactionBatch<ReturnValue, TransformedReturnValue, Args\>

[base/PolymeshTransactionBatch](../wiki/base.PolymeshTransactionBatch).PolymeshTransactionBatch

Wrapper class for a batch of Polymesh Transactions

## Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValue` | `ReturnValue` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` | extends `unknown`[][] = `unknown`[][] |

## Hierarchy

- [`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase)<`ReturnValue`, `TransformedReturnValue`\>

  ↳ **`PolymeshTransactionBatch`**

## Table of contents

### Properties

- [blockHash](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#blockhash)
- [blockNumber](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#blocknumber)
- [error](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#error)
- [receipt](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#receipt)
- [status](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#status)
- [txHash](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#txhash)
- [txIndex](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#txindex)

### Accessors

- [isSuccess](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#issuccess)
- [result](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#result)
- [transactions](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#transactions)

### Methods

- [getTotalFees](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#gettotalfees)
- [onProcessedByMiddleware](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#onprocessedbymiddleware)
- [onStatusChange](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#onstatuschange)
- [run](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#run)
- [splitTransactions](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#splittransactions)
- [supportsSubsidy](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch#supportssubsidy)

## Properties

### blockHash

• `Optional` **blockHash**: `string`

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[blockHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blockhash)

#### Defined in

[base/PolymeshTransactionBase.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L90)

___

### blockNumber

• `Optional` **blockNumber**: `BigNumber`

number of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[blockNumber](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blocknumber)

#### Defined in

[base/PolymeshTransactionBase.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L95)

___

### error

• `Optional` **error**: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[error](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#error)

#### Defined in

[base/PolymeshTransactionBase.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L70)

___

### receipt

• `Optional` **receipt**: `ISubmittableResult`

stores the transaction receipt (if successful)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[receipt](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#receipt)

#### Defined in

[base/PolymeshTransactionBase.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L75)

___

### status

• **status**: [`TransactionStatus`](../wiki/types.TransactionStatus) = `TransactionStatus.Idle`

current status of the transaction

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[status](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#status)

#### Defined in

[base/PolymeshTransactionBase.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L65)

___

### txHash

• `Optional` **txHash**: `string`

transaction hash (status: `Running`, `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[txHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txhash)

#### Defined in

[base/PolymeshTransactionBase.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L80)

___

### txIndex

• `Optional` **txIndex**: `BigNumber`

transaction index within its block (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[txIndex](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txindex)

#### Defined in

[base/PolymeshTransactionBase.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/base/PolymeshTransactionBase.ts#L85)

## Accessors

### isSuccess

• `get` **isSuccess**(): `boolean`

returns true if transaction has completed successfully

#### Returns

`boolean`

#### Inherited from

PolymeshTransactionBase.isSuccess

___

### result

• `get` **result**(): `TransformedReturnValue`

returns the transaction result - this is the same value as the Promise run returns

**`Note`**

 it is generally preferable to `await` the `Promise` returned by [transaction.run()](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#run) instead of reading this property

**`Throws`**

 if the [transaction.isSuccess](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#issuccess) property is false — be sure to check that before accessing!

#### Returns

`TransformedReturnValue`

#### Inherited from

PolymeshTransactionBase.result

___

### transactions

• `get` **transactions**(): [`MapTxData`](../wiki/types#maptxdata)<`Args`\>

transactions in the batch with their respective arguments

#### Returns

[`MapTxData`](../wiki/types#maptxdata)<`Args`\>

## Methods

### getTotalFees

▸ **getTotalFees**(): `Promise`<[`PayingAccountFees`](../wiki/types.PayingAccountFees)\>

Retrieve a breakdown of the fees required to run this transaction, as well as the Account responsible for paying them

**`Note`**

 these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
  chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)

#### Returns

`Promise`<[`PayingAccountFees`](../wiki/types.PayingAccountFees)\>

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[getTotalFees](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#gettotalfees)

___

### onProcessedByMiddleware

▸ **onProcessedByMiddleware**(`listener`): [`UnsubCallback`](../wiki/types#unsubcallback)

Subscribe to the results of this transaction being processed by the indexing service (and as such, available to the middleware)

**`Note`**

 this event will be fired even if the queue fails

**`Throws`**

 if the middleware wasn't enabled when instantiating the SDK client

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`err?`: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)) => `void` | callback function that will be called whenever the middleware is updated with the latest data.   If there is an error (timeout or middleware offline) it will be passed to this callback |

#### Returns

[`UnsubCallback`](../wiki/types#unsubcallback)

unsubscribe function

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[onProcessedByMiddleware](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onprocessedbymiddleware)

___

### onStatusChange

▸ **onStatusChange**(`listener`): [`UnsubCallback`](../wiki/types#unsubcallback)

Subscribe to status changes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`transaction`: [`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`ReturnValue`, `TransformedReturnValue`\>) => `void` | callback function that will be called whenever the status changes |

#### Returns

[`UnsubCallback`](../wiki/types#unsubcallback)

unsubscribe function

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[onStatusChange](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onstatuschange)

___

### run

▸ **run**(): `Promise`<`TransformedReturnValue`\>

Run the transaction, update its status and return a result if applicable.
  Certain transactions create Entities on the blockchain, and those Entities are returned
  for convenience. For example, when running a transaction that creates an Asset, the Asset itself
  is returned

#### Returns

`Promise`<`TransformedReturnValue`\>

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[run](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#run)

___

### splitTransactions

▸ **splitTransactions**(): ([`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)<`void`, `void`, `unknown`[]\> \| [`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)<`ReturnValue`, `TransformedReturnValue`, `unknown`[]\>)[]

Splits this batch into its individual transactions to be run separately. This is useful if the caller is being subsidized,
  since batches cannot be run by subsidized Accounts

**`Note`**

 the transactions returned by this method must be run in the same order they appear in the array to guarantee the same behavior. If run out of order,
  an error will be thrown. The result that would be obtained by running the batch is returned by running the last transaction in the array

**`Example`**

 ```typescript
const createAssetTx = await sdk.assets.createAsset(...);

let ticker: string;

if (isPolymeshTransactionBatch<Asset>(createAssetTx)) {
  const transactions = createAssetTx.splitTransactions();

  for (let i = 0; i < length; i += 1) {
    const result = await transactions[i].run();

    if (isAsset(result)) {
      ({ticker} = result)
    }
  }
} else {
  ({ ticker } = await createAssetTx.run());
}

console.log(`New Asset created! Ticker: ${ticker}`);
```

#### Returns

([`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)<`void`, `void`, `unknown`[]\> \| [`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)<`ReturnValue`, `TransformedReturnValue`, `unknown`[]\>)[]

___

### supportsSubsidy

▸ **supportsSubsidy**(): `boolean`

**`Note`**

 batches can't be subsidized. If the caller is subsidized, they should use `splitTransactions` and
  run each transaction separately

#### Returns

`boolean`

#### Overrides

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[supportsSubsidy](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#supportssubsidy)
