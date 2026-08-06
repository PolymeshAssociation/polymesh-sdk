[@polymeshassociation/polymesh-sdk](../wiki/README) / base/PolymeshTransactionBatch

# base/PolymeshTransactionBatch

## Classes

### PolymeshTransactionBatch

Defined in: [base/PolymeshTransactionBatch.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBatch.ts#L22)

Wrapper class for a batch of Polymesh Transactions

#### Extends

- [`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase)\<`ReturnValue`, `TransformedReturnValue`\>

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ReturnValue` | - |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` *extends* `unknown`[][] | `unknown`[][] |

#### Properties

##### blockHash?

> `optional` **blockHash?**: `string`

Defined in: [base/PolymeshTransactionBase.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L108)

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`blockHash`](../wiki/base.PolymeshTransactionBase#blockhash)

##### blockNumber?

> `optional` **blockNumber?**: `BigNumber`

Defined in: [base/PolymeshTransactionBase.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L113)

number of the block where this transaction resides (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`blockNumber`](../wiki/base.PolymeshTransactionBase#blocknumber)

##### error?

> `optional` **error?**: [`PolymeshError`](../wiki/base.PolymeshError#polymesherror)

Defined in: [base/PolymeshTransactionBase.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L88)

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`error`](../wiki/base.PolymeshTransactionBase#error)

##### multiSig

> **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig) \| `null`

Defined in: [base/PolymeshTransactionBase.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L121)

This will be set if the signingAddress is a MultiSig signer, otherwise `null`

When set it indicates the transaction will be wrapped as a proposal for the MultiSig,
meaning `.runAsProposal` should be used instead of `.run`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`multiSig`](../wiki/base.PolymeshTransactionBase#multisig)

##### receipt?

> `optional` **receipt?**: `ISubmittableResult`

Defined in: [base/PolymeshTransactionBase.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L93)

stores the transaction receipt (if successful)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`receipt`](../wiki/base.PolymeshTransactionBase#receipt)

##### status

> **status**: [`TransactionStatus`](../wiki/base.types#transactionstatus) = `TransactionStatus.Idle`

Defined in: [base/PolymeshTransactionBase.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L83)

current status of the transaction

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`status`](../wiki/base.PolymeshTransactionBase#status)

##### txHash?

> `optional` **txHash?**: `string`

Defined in: [base/PolymeshTransactionBase.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L98)

transaction hash (status: `Running`, `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`txHash`](../wiki/base.PolymeshTransactionBase#txhash)

##### txIndex?

> `optional` **txIndex?**: `BigNumber`

Defined in: [base/PolymeshTransactionBase.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L103)

transaction index within its block (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`txIndex`](../wiki/base.PolymeshTransactionBase#txindex)

#### Accessors

##### isSuccess

###### Get Signature

> **get** **isSuccess**(): `boolean`

Defined in: [base/PolymeshTransactionBase.ts:963](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L963)

returns true if transaction has completed successfully

###### Returns

`boolean`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`isSuccess`](../wiki/base.PolymeshTransactionBase#issuccess)

##### result

###### Get Signature

> **get** **result**(): `TransformedReturnValue`

Defined in: [base/PolymeshTransactionBase.ts:874](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L874)

returns the transaction result - this is the same value as the Promise run returns

###### Note

it is generally preferable to `await` the `Promise` returned by [transaction.run()](../wiki/base.PolymeshTransactionBase#run) instead of reading this property

###### Throws

if the [transaction.isSuccess](../wiki/base.PolymeshTransactionBase#issuccess) property is false — be sure to check that before accessing!

###### Returns

`TransformedReturnValue`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`result`](../wiki/base.PolymeshTransactionBase#result)

##### transactions

###### Get Signature

> **get** **transactions**(): [`MapTxData`](../wiki/base.types#maptxdata)\<`Args`\>

Defined in: [base/PolymeshTransactionBatch.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBatch.ts#L78)

transactions in the batch with their respective arguments

###### Returns

[`MapTxData`](../wiki/base.types#maptxdata)\<`Args`\>

#### Methods

##### getTotalFees()

> **getTotalFees**(`asProposal?`): `Promise`\<[`PayingAccountFees`](../wiki/base.types#payingaccountfees)\>

Defined in: [base/PolymeshTransactionBase.ts:597](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L597)

Retrieve a breakdown of the fees required to run this transaction, as well as the Account responsible for paying them

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `asProposal` | `boolean` | `true` | When `true` (default), treats the transaction as a MultiSig proposal if the signing account is a MultiSig signer. When `false`, treats the transaction as a direct transaction from the signing account, ignoring the MultiSig. |

###### Returns

`Promise`\<[`PayingAccountFees`](../wiki/base.types#payingaccountfees)\>

###### Note

these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
  chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`getTotalFees`](../wiki/base.PolymeshTransactionBase#gettotalfees)

##### onProcessedByMiddleware()

> **onProcessedByMiddleware**(`listener`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Defined in: [base/PolymeshTransactionBase.ts:637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L637)

Subscribe to the results of this transaction being processed by the indexing service (and as such, available to the middleware)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`err?`) => `void` | callback function that will be called whenever the middleware is updated with the latest data. If there is an error (timeout or middleware offline) it will be passed to this callback |

###### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

unsubscribe function

###### Note

this event will be fired even if the queue fails

###### Throws

if the middleware wasn't enabled when instantiating the SDK client

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`onProcessedByMiddleware`](../wiki/base.PolymeshTransactionBase#onprocessedbymiddleware)

##### onStatusChange()

> **onStatusChange**(`listener`): [`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

Defined in: [base/PolymeshTransactionBase.ts:576](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L576)

Subscribe to status changes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`transaction`) => `void` | callback function that will be called whenever the status changes |

###### Returns

[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)

unsubscribe function

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`onStatusChange`](../wiki/base.PolymeshTransactionBase#onstatuschange)

##### run()

> **run**(): `Promise`\<`TransformedReturnValue`\>

Defined in: [base/PolymeshTransactionBase.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L286)

Run the transaction, update its status and return a result if applicable.
  Certain transactions create Entities on the blockchain, and those Entities are returned
  for convenience. For example, when running a transaction that creates an Asset, the Asset itself
  is returned

###### Returns

`Promise`\<`TransformedReturnValue`\>

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`run`](../wiki/base.PolymeshTransactionBase#run)

##### runAsProposal()

> **runAsProposal**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)\>

Defined in: [base/PolymeshTransactionBase.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L239)

Run the transaction as a multiSig proposal

###### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)\>

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`runAsProposal`](../wiki/base.PolymeshTransactionBase#runasproposal)

##### splitTransactions()

> **splitTransactions**(): ([`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`void`, `void`, `unknown`[]\> \| [`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`ReturnValue`, `TransformedReturnValue`, `unknown`[]\>)[]

Defined in: [base/PolymeshTransactionBatch.ts:204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBatch.ts#L204)

Splits this batch into its individual transactions to be run separately. This is useful if the caller is being subsidized,
  since batches cannot be run by subsidized Accounts

###### Returns

([`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`void`, `void`, `unknown`[]\> \| [`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`ReturnValue`, `TransformedReturnValue`, `unknown`[]\>)[]

###### Note

the transactions returned by this method must be run in the same order they appear in the array to guarantee the same behavior. If run out of order,
  an error will be thrown. The result that would be obtained by running the batch is returned by running the last transaction in the array

###### Example

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

##### supportsSubsidy()

> **supportsSubsidy**(): `boolean`

Defined in: [base/PolymeshTransactionBatch.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBatch.ts#L135)

###### Returns

`boolean`

###### Note

batch can only be subsidized if -
  1. Number of transactions in the batch are not more than 7
  2. Every transaction in the batch can be subsidized

###### Overrides

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`supportsSubsidy`](../wiki/base.PolymeshTransactionBase#supportssubsidy)

##### toSignablePayload()

> **toSignablePayload**(`metadata?`, `asProposal?`): `Promise`\<[`TransactionPayload`](../wiki/base.types#transactionpayload)\>

Defined in: [base/PolymeshTransactionBase.ts:899](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/PolymeshTransactionBase.ts#L899)

Returns a representation intended for offline signers.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `metadata` | `Record`\<`string`, `string`\> | `{}` | Additional information attached to the payload, such as IDs or memos about the transaction |
| `asProposal` | `boolean` | `true` | When `true` (default), treats the transaction as a MultiSig proposal if the signing account is a MultiSig signer. When `false`, treats the transaction as a direct transaction from the signing account, ignoring the MultiSig. |

###### Returns

`Promise`\<[`TransactionPayload`](../wiki/base.types#transactionpayload)\>

###### Note

Usually `.run()` should be preferred due to is simplicity.

###### Note

When using this method, details like account nonces, and transaction mortality require extra consideration. Generating a payload for offline sign implies asynchronicity. If using this API, be sure each procedure is created with the correct nonce, accounting for in flight transactions, and the lifetime is sufficient.

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`toSignablePayload`](../wiki/base.PolymeshTransactionBase#tosignablepayload)
