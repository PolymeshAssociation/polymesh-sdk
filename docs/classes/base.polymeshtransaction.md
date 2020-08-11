# Class: PolymeshTransaction ‹**Args, Values**›

Wrapper class for a Polymesh Transaction

## Type parameters

▪ **Args**: *unknown[]*

▪ **Values**: *unknown[]*

## Hierarchy

* **PolymeshTransaction**

## Index

### Properties

* [args](base.polymeshtransaction.md#args)
* [blockHash](base.polymeshtransaction.md#optional-blockhash)
* [error](base.polymeshtransaction.md#optional-error)
* [isCritical](base.polymeshtransaction.md#iscritical)
* [receipt](base.polymeshtransaction.md#optional-receipt)
* [status](base.polymeshtransaction.md#status)
* [txHash](base.polymeshtransaction.md#optional-txhash)

### Accessors

* [tag](base.polymeshtransaction.md#tag)

### Methods

* [getFees](base.polymeshtransaction.md#getfees)
* [onStatusChange](base.polymeshtransaction.md#onstatuschange)
* [run](base.polymeshtransaction.md#run)

## Properties

###  args

• **args**: *[MapMaybePostTransactionValue](../modules/types.md#mapmaybeposttransactionvalue)‹Args›*

*Defined in [src/base/PolymeshTransaction.ts:64](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L64)*

arguments arguments for the transaction. Available after the transaction starts running
(may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)

___

### `Optional` blockHash

• **blockHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L53)*

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

___

### `Optional` error

• **error**? : *[PolymeshError](../modules/base.md#polymesherror)*

*Defined in [src/base/PolymeshTransaction.ts:38](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L38)*

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

___

###  isCritical

• **isCritical**: *boolean*

*Defined in [src/base/PolymeshTransaction.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L58)*

whether this tx failing makes the entire tx queue fail or not

___

### `Optional` receipt

• **receipt**? : *ISubmittableResult*

*Defined in [src/base/PolymeshTransaction.ts:43](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L43)*

stores the transaction receipt (if successful)

___

###  status

• **status**: *[TransactionStatus](../enums/types.transactionstatus.md)* = TransactionStatus.Idle

*Defined in [src/base/PolymeshTransaction.ts:33](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L33)*

current status of the transaction

___

### `Optional` txHash

• **txHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:48](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L48)*

transaction hash (status: `Running`, `Succeeded`, `Failed`)

## Accessors

###  tag

• **get tag**(): *TxTag*

*Defined in [src/base/PolymeshTransaction.ts:240](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L240)*

type of transaction represented by this instance for display purposes.
If the transaction isn't defined at design time, the tag won't be set (will be empty string) until the transaction is about to be run

**Returns:** *TxTag*

## Methods

###  getFees

▸ **getFees**(): *Promise‹[Fees](../interfaces/types.fees.md) | null›*

*Defined in [src/base/PolymeshTransaction.ts:200](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L200)*

Get all (protocol and gas) fees associated with this transaction. Returns null
if the transaction is not ready yet (this can happen if it depends on the execution of a
previous transaction in the queue)

**Returns:** *Promise‹[Fees](../interfaces/types.fees.md) | null›*

___

###  onStatusChange

▸ **onStatusChange**(`listener`: function): *function*

*Defined in [src/base/PolymeshTransaction.ts:187](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L187)*

Subscribe to status changes

**Parameters:**

▪ **listener**: *function*

callback function that will be called whenever the status changes

▸ (`transaction`: this): *void*

**Parameters:**

Name | Type |
------ | ------ |
`transaction` | this |

**Returns:** *function*

unsubscribe function

▸ (): *void*

___

###  run

▸ **run**(): *Promise‹void›*

*Defined in [src/base/PolymeshTransaction.ts:146](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/PolymeshTransaction.ts#L146)*

Run the poly transaction and update the transaction status

**Returns:** *Promise‹void›*
