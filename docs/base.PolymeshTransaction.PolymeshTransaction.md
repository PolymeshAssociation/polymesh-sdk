# Class: PolymeshTransaction\<ReturnValue, TransformedReturnValue, Args\>

[base/PolymeshTransaction](../wiki/base.PolymeshTransaction).PolymeshTransaction

Wrapper class for a Polymesh Transaction

## Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValue` | `ReturnValue` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` | extends `unknown`[] \| [] = `unknown`[] |

## Hierarchy

- [`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase)\<`ReturnValue`, `TransformedReturnValue`\>

  ↳ **`PolymeshTransaction`**

## Table of contents

### Properties

- [args](../wiki/base.PolymeshTransaction.PolymeshTransaction#args)
- [blockHash](../wiki/base.PolymeshTransaction.PolymeshTransaction#blockhash)
- [blockNumber](../wiki/base.PolymeshTransaction.PolymeshTransaction#blocknumber)
- [error](../wiki/base.PolymeshTransaction.PolymeshTransaction#error)
- [multiSig](../wiki/base.PolymeshTransaction.PolymeshTransaction#multisig)
- [receipt](../wiki/base.PolymeshTransaction.PolymeshTransaction#receipt)
- [status](../wiki/base.PolymeshTransaction.PolymeshTransaction#status)
- [tag](../wiki/base.PolymeshTransaction.PolymeshTransaction#tag)
- [txHash](../wiki/base.PolymeshTransaction.PolymeshTransaction#txhash)
- [txIndex](../wiki/base.PolymeshTransaction.PolymeshTransaction#txindex)

### Accessors

- [isSuccess](../wiki/base.PolymeshTransaction.PolymeshTransaction#issuccess)
- [result](../wiki/base.PolymeshTransaction.PolymeshTransaction#result)

### Methods

- [getProtocolFees](../wiki/base.PolymeshTransaction.PolymeshTransaction#getprotocolfees)
- [getTotalFees](../wiki/base.PolymeshTransaction.PolymeshTransaction#gettotalfees)
- [onProcessedByMiddleware](../wiki/base.PolymeshTransaction.PolymeshTransaction#onprocessedbymiddleware)
- [onStatusChange](../wiki/base.PolymeshTransaction.PolymeshTransaction#onstatuschange)
- [run](../wiki/base.PolymeshTransaction.PolymeshTransaction#run)
- [runAsProposal](../wiki/base.PolymeshTransaction.PolymeshTransaction#runasproposal)
- [supportsSubsidy](../wiki/base.PolymeshTransaction.PolymeshTransaction#supportssubsidy)
- [toSignablePayload](../wiki/base.PolymeshTransaction.PolymeshTransaction#tosignablepayload)

## Properties

### args

• **args**: `Args`

arguments for the transaction in SCALE format (polkadot.js Codec)

#### Defined in

[base/PolymeshTransaction.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransaction.ts#L40)

___

### blockHash

• `Optional` **blockHash**: `string`

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[blockHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blockhash)

#### Defined in

[base/PolymeshTransactionBase.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L106)

___

### blockNumber

• `Optional` **blockNumber**: `BigNumber`

number of the block where this transaction resides (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[blockNumber](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#blocknumber)

#### Defined in

[base/PolymeshTransactionBase.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L111)

___

### error

• `Optional` **error**: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[error](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#error)

#### Defined in

[base/PolymeshTransactionBase.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L86)

___

### multiSig

• **multiSig**: ``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

This will be set if the signingAddress is a MultiSig signer, otherwise `null`

When set it indicates the transaction will be wrapped as a proposal for the MultiSig,
meaning `.runAsProposal` should be used instead of `.run`

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[multiSig](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#multisig)

#### Defined in

[base/PolymeshTransactionBase.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L119)

___

### receipt

• `Optional` **receipt**: `ISubmittableResult`

stores the transaction receipt (if successful)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[receipt](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#receipt)

#### Defined in

[base/PolymeshTransactionBase.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L91)

___

### status

• **status**: [`TransactionStatus`](../wiki/base.types.TransactionStatus) = `TransactionStatus.Idle`

current status of the transaction

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[status](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#status)

#### Defined in

[base/PolymeshTransactionBase.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L81)

___

### tag

• **tag**: [`TxTag`](../wiki/generated.types#txtag)

type of transaction represented by this instance (mostly for display purposes)

#### Defined in

[base/PolymeshTransaction.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransaction.ts#L45)

___

### txHash

• `Optional` **txHash**: `string`

transaction hash (status: `Running`, `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[txHash](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txhash)

#### Defined in

[base/PolymeshTransactionBase.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L96)

___

### txIndex

• `Optional` **txIndex**: `BigNumber`

transaction index within its block (status: `Succeeded`, `Failed`)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[txIndex](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#txindex)

#### Defined in

[base/PolymeshTransactionBase.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L101)

## Accessors

### isSuccess

• `get` **isSuccess**(): `boolean`

returns true if transaction has completed successfully

#### Returns

`boolean`

#### Inherited from

PolymeshTransactionBase.isSuccess

#### Defined in

[base/PolymeshTransactionBase.ts:903](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L903)

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

#### Inherited from

PolymeshTransactionBase.result

#### Defined in

[base/PolymeshTransactionBase.ts:819](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L819)

## Methods

### getProtocolFees

▸ **getProtocolFees**(): `Promise`\<`BigNumber`\>

Return this transaction's protocol fees. These are extra fees charged for
  specific operations on the chain. Not to be confused with network fees (which
  depend on the complexity of the operation), protocol fees are set by governance and/or
  chain upgrades

#### Returns

`Promise`\<`BigNumber`\>

#### Overrides

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[getProtocolFees](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#getprotocolfees)

#### Defined in

[base/PolymeshTransaction.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransaction.ts#L108)

___

### getTotalFees

▸ **getTotalFees**(): `Promise`\<[`PayingAccountFees`](../wiki/base.types.PayingAccountFees)\>

Retrieve a breakdown of the fees required to run this transaction, as well as the Account responsible for paying them

#### Returns

`Promise`\<[`PayingAccountFees`](../wiki/base.types.PayingAccountFees)\>

**`Note`**

these values might be inaccurate if the transaction is run at a later time. This can be due to a governance vote or other
  chain related factors (like modifications to a specific subsidizer relationship or a chain upgrade)

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[getTotalFees](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#gettotalfees)

#### Defined in

[base/PolymeshTransactionBase.ts:537](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L537)

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

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[onProcessedByMiddleware](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onprocessedbymiddleware)

#### Defined in

[base/PolymeshTransactionBase.ts:577](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L577)

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

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[onStatusChange](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#onstatuschange)

#### Defined in

[base/PolymeshTransactionBase.ts:519](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L519)

___

### run

▸ **run**(): `Promise`\<`TransformedReturnValue`\>

Run the transaction, update its status and return a result if applicable.
  Certain transactions create Entities on the blockchain, and those Entities are returned
  for convenience. For example, when running a transaction that creates an Asset, the Asset itself
  is returned

#### Returns

`Promise`\<`TransformedReturnValue`\>

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[run](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#run)

#### Defined in

[base/PolymeshTransactionBase.ts:270](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L270)

___

### runAsProposal

▸ **runAsProposal**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

Run the transaction as a multiSig proposal

#### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[runAsProposal](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#runasproposal)

#### Defined in

[base/PolymeshTransactionBase.ts:228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L228)

___

### supportsSubsidy

▸ **supportsSubsidy**(): `boolean`

Return whether the transaction can be subsidized. If the result is false
  AND the caller is being subsidized by a third party, the transaction can't be executed and trying
  to do so will result in an error

#### Returns

`boolean`

**`Note`**

this depends on the type of transaction itself (e.g. `staking.bond` can't be subsidized, but `asset.createAsset` can)

#### Overrides

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[supportsSubsidy](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#supportssubsidy)

#### Defined in

[base/PolymeshTransaction.ts:131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransaction.ts#L131)

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

#### Inherited from

[PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase).[toSignablePayload](../wiki/base.PolymeshTransactionBase.PolymeshTransactionBase#tosignablepayload)

#### Defined in

[base/PolymeshTransactionBase.ts:840](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/PolymeshTransactionBase.ts#L840)
