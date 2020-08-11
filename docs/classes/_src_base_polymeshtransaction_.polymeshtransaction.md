# Class: PolymeshTransaction ‹**Args, Values**›

Wrapper class for a Polymesh Transaction

## Type parameters

▪ **Args**: *unknown[]*

▪ **Values**: *unknown[]*

## Hierarchy

* **PolymeshTransaction**

## Index

### Properties

* [args](_src_base_polymeshtransaction_.polymeshtransaction.md#args)
* [blockHash](_src_base_polymeshtransaction_.polymeshtransaction.md#optional-blockhash)
* [error](_src_base_polymeshtransaction_.polymeshtransaction.md#optional-error)
* [isCritical](_src_base_polymeshtransaction_.polymeshtransaction.md#iscritical)
* [receipt](_src_base_polymeshtransaction_.polymeshtransaction.md#optional-receipt)
* [status](_src_base_polymeshtransaction_.polymeshtransaction.md#status)
* [txHash](_src_base_polymeshtransaction_.polymeshtransaction.md#optional-txhash)

### Accessors

* [tag](_src_base_polymeshtransaction_.polymeshtransaction.md#tag)

### Methods

* [getFees](_src_base_polymeshtransaction_.polymeshtransaction.md#getfees)
* [onStatusChange](_src_base_polymeshtransaction_.polymeshtransaction.md#onstatuschange)
* [run](_src_base_polymeshtransaction_.polymeshtransaction.md#run)

## Properties

###  args

• **args**: *[MapMaybePostTransactionValue](../modules/_src_types_internal_.md#mapmaybeposttransactionvalue)‹Args›*

*Defined in [src/base/PolymeshTransaction.ts:64](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L64)*

arguments arguments for the transaction. Available after the transaction starts running
(may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)

___

### `Optional` blockHash

• **blockHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L53)*

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

___

### `Optional` error

• **error**? : *[PolymeshError](_src_base_polymesherror_.polymesherror.md)*

*Defined in [src/base/PolymeshTransaction.ts:38](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L38)*

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

___

###  isCritical

• **isCritical**: *boolean*

*Defined in [src/base/PolymeshTransaction.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L58)*

whether this tx failing makes the entire tx queue fail or not

___

### `Optional` receipt

• **receipt**? : *ISubmittableResult*

*Defined in [src/base/PolymeshTransaction.ts:43](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L43)*

stores the transaction receipt (if successful)

___

###  status

• **status**: *[TransactionStatus](../enums/_src_types_index_.transactionstatus.md)* = TransactionStatus.Idle

*Defined in [src/base/PolymeshTransaction.ts:33](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L33)*

current status of the transaction

___

### `Optional` txHash

• **txHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:48](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L48)*

transaction hash (status: `Running`, `Succeeded`, `Failed`)

## Accessors

###  tag

• **get tag**(): *TxTag*

*Defined in [src/base/PolymeshTransaction.ts:240](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L240)*

type of transaction represented by this instance for display purposes.
If the transaction isn't defined at design time, the tag won't be set (will be empty string) until the transaction is about to be run

**Returns:** *TxTag*

## Methods

###  getFees

▸ **getFees**(): *Promise‹[Fees](../interfaces/_src_types_index_.fees.md) | null›*

*Defined in [src/base/PolymeshTransaction.ts:200](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L200)*

Get all (protocol and gas) fees associated with this transaction. Returns null
if the transaction is not ready yet (this can happen if it depends on the execution of a
previous transaction in the queue)

**Returns:** *Promise‹[Fees](../interfaces/_src_types_index_.fees.md) | null›*

___

###  onStatusChange

▸ **onStatusChange**(`listener`: function): *function*

*Defined in [src/base/PolymeshTransaction.ts:187](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L187)*

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

*Defined in [src/base/PolymeshTransaction.ts:146](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/PolymeshTransaction.ts#L146)*

Run the poly transaction and update the transaction status

**Returns:** *Promise‹void›*
