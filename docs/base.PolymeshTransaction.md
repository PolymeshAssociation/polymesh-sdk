[@polymeshassociation/polymesh-sdk](../wiki/README) / base/PolymeshTransaction

# base/PolymeshTransaction

## Classes

### PolymeshTransaction

Defined in: [base/PolymeshTransaction.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransaction.ts#L14)

Wrapper class for a Polymesh Transaction

#### Extends

- [`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase)\<`ReturnValue`, `TransformedReturnValue`\>

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ReturnValue` | - |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` *extends* `unknown`[] \| \[\] | `unknown`[] |

#### Properties

##### args

> **args**: `Args`

Defined in: [base/PolymeshTransaction.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransaction.ts#L40)

arguments for the transaction in SCALE format (polkadot.js Codec)

##### blockHash?

> `optional` **blockHash?**: `string`

Defined in: [base/PolymeshTransactionBase.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L108)

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`blockHash`](../wiki/base.PolymeshTransactionBase#blockhash)

##### blockNumber?

> `optional` **blockNumber?**: `BigNumber`

Defined in: [base/PolymeshTransactionBase.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L113)

number of the block where this transaction resides (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`blockNumber`](../wiki/base.PolymeshTransactionBase#blocknumber)

##### error?

> `optional` **error?**: [`PolymeshError`](../wiki/base.PolymeshError#polymesherror)

Defined in: [base/PolymeshTransactionBase.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L88)

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`error`](../wiki/base.PolymeshTransactionBase#error)

##### multiSig

> **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig) \| `null`

Defined in: [base/PolymeshTransactionBase.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L121)

This will be set if the signingAddress is a MultiSig signer, otherwise `null`

When set it indicates the transaction will be wrapped as a proposal for the MultiSig,
meaning `.runAsProposal` should be used instead of `.run`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`multiSig`](../wiki/base.PolymeshTransactionBase#multisig)

##### receipt?

> `optional` **receipt?**: `ISubmittableResult`

Defined in: [base/PolymeshTransactionBase.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L93)

stores the transaction receipt (if successful)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`receipt`](../wiki/base.PolymeshTransactionBase#receipt)

##### status

> **status**: [`TransactionStatus`](../wiki/base.types#transactionstatus) = `TransactionStatus.Idle`

Defined in: [base/PolymeshTransactionBase.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L83)

current status of the transaction

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`status`](../wiki/base.PolymeshTransactionBase#status)

##### tag

> **tag**: `TxTag`

Defined in: [base/PolymeshTransaction.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransaction.ts#L45)

type of transaction represented by this instance (mostly for display purposes)

##### txHash?

> `optional` **txHash?**: `string`

Defined in: [base/PolymeshTransactionBase.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L98)

transaction hash (status: `Running`, `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`txHash`](../wiki/base.PolymeshTransactionBase#txhash)

##### txIndex?

> `optional` **txIndex?**: `BigNumber`

Defined in: [base/PolymeshTransactionBase.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L103)

transaction index within its block (status: `Succeeded`, `Failed`)

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`txIndex`](../wiki/base.PolymeshTransactionBase#txindex)

#### Accessors

##### isSuccess

###### Get Signature

> **get** **isSuccess**(): `boolean`

Defined in: [base/PolymeshTransactionBase.ts:963](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L963)

returns true if transaction has completed successfully

###### Returns

`boolean`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`isSuccess`](../wiki/base.PolymeshTransactionBase#issuccess)

##### result

###### Get Signature

> **get** **result**(): `TransformedReturnValue`

Defined in: [base/PolymeshTransactionBase.ts:874](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L874)

returns the transaction result - this is the same value as the Promise run returns

###### Note

it is generally preferable to `await` the `Promise` returned by [transaction.run()](../wiki/base.PolymeshTransactionBase#run) instead of reading this property

###### Throws

if the [transaction.isSuccess](../wiki/base.PolymeshTransactionBase#issuccess) property is false — be sure to check that before accessing!

###### Returns

`TransformedReturnValue`

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`result`](../wiki/base.PolymeshTransactionBase#result)

#### Methods

##### getProtocolFees()

> **getProtocolFees**(): `Promise`\<`BigNumber`\>

Defined in: [base/PolymeshTransaction.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransaction.ts#L120)

Return this transaction's protocol fees. These are extra fees charged for
  specific operations on the chain. Not to be confused with network fees (which
  depend on the complexity of the operation), protocol fees are set by governance and/or
  chain upgrades

###### Returns

`Promise`\<`BigNumber`\>

###### Overrides

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`getProtocolFees`](../wiki/base.PolymeshTransactionBase#getprotocolfees)

##### getTotalFees()

> **getTotalFees**(`asProposal?`): `Promise`\<[`PayingAccountFees`](../wiki/base.types#payingaccountfees)\>

Defined in: [base/PolymeshTransactionBase.ts:597](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L597)

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

Defined in: [base/PolymeshTransactionBase.ts:637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L637)

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

Defined in: [base/PolymeshTransactionBase.ts:576](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L576)

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

Defined in: [base/PolymeshTransactionBase.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L286)

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

Defined in: [base/PolymeshTransactionBase.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L239)

Run the transaction as a multiSig proposal

###### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)\>

###### Inherited from

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`runAsProposal`](../wiki/base.PolymeshTransactionBase#runasproposal)

##### supportsSubsidy()

> **supportsSubsidy**(): `boolean`

Defined in: [base/PolymeshTransaction.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransaction.ts#L145)

Return whether the transaction can be subsidized. If the result is false
  AND the caller is being subsidized by a third party, the transaction can't be executed and trying
  to do so will result in an error

###### Returns

`boolean`

###### Note

this depends on the type of transaction itself (e.g. `staking.bond` can't be subsidized, but `asset.createAsset` can)

###### Overrides

[`PolymeshTransactionBase`](../wiki/base.PolymeshTransactionBase#abstract-polymeshtransactionbase).[`supportsSubsidy`](../wiki/base.PolymeshTransactionBase#supportssubsidy)

##### toSignablePayload()

> **toSignablePayload**(`metadata?`, `asProposal?`): `Promise`\<[`TransactionPayload`](../wiki/base.types#transactionpayload)\>

Defined in: [base/PolymeshTransactionBase.ts:899](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/PolymeshTransactionBase.ts#L899)

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
