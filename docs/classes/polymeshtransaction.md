# Class: PolymeshTransaction ‹**Args, Values**›

Wrapper class for a Polymesh Transaction

## Type parameters

▪ **Args**: *unknown[]*

▪ **Values**: *unknown[]*

## Hierarchy

* **PolymeshTransaction**

## Index

### Properties

* [args](polymeshtransaction.md#args)
* [blockHash](polymeshtransaction.md#optional-blockhash)
* [error](polymeshtransaction.md#optional-error)
* [isCritical](polymeshtransaction.md#iscritical)
* [receipt](polymeshtransaction.md#optional-receipt)
* [status](polymeshtransaction.md#status)
* [txHash](polymeshtransaction.md#optional-txhash)

### Accessors

* [tag](polymeshtransaction.md#tag)

### Methods

* [getFees](polymeshtransaction.md#getfees)
* [onStatusChange](polymeshtransaction.md#onstatuschange)
* [run](polymeshtransaction.md#run)

## Properties

###  args

• **args**: *MapMaybePostTransactionValue‹Args›*

*Defined in [src/base/PolymeshTransaction.ts:67](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L67)*

arguments arguments for the transaction. Available after the transaction starts running
(may be Post Transaction Values from a previous transaction in the queue that haven't resolved yet)

___

### `Optional` blockHash

• **blockHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:56](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L56)*

hash of the block where this transaction resides (status: `Succeeded`, `Failed`)

___

### `Optional` error

• **error**? : *[PolymeshError](polymesherror.md)*

*Defined in [src/base/PolymeshTransaction.ts:41](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L41)*

stores errors thrown while running the transaction (status: `Failed`, `Aborted`)

___

###  isCritical

• **isCritical**: *boolean*

*Defined in [src/base/PolymeshTransaction.ts:61](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L61)*

whether this tx failing makes the entire tx queue fail or not

___

### `Optional` receipt

• **receipt**? : *ISubmittableResult*

*Defined in [src/base/PolymeshTransaction.ts:46](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L46)*

stores the transaction receipt (if successful)

___

###  status

• **status**: *[TransactionStatus](../enums/transactionstatus.md)* = TransactionStatus.Idle

*Defined in [src/base/PolymeshTransaction.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L36)*

current status of the transaction

___

### `Optional` txHash

• **txHash**? : *undefined | string*

*Defined in [src/base/PolymeshTransaction.ts:51](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L51)*

transaction hash (status: `Running`, `Succeeded`, `Failed`)

## Accessors

###  tag

• **get tag**(): *TxTag*

*Defined in [src/base/PolymeshTransaction.ts:243](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L243)*

type of transaction represented by this instance for display purposes.
If the transaction isn't defined at design time, the tag won't be set (will be empty string) until the transaction is about to be run

**Returns:** *TxTag*

## Methods

###  getFees

▸ **getFees**(): *Promise‹[Fees](../interfaces/fees.md) | null›*

*Defined in [src/base/PolymeshTransaction.ts:203](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L203)*

Get all (protocol and gas) fees associated with this transaction. Returns null
if the transaction is not ready yet (this can happen if it depends on the execution of a
previous transaction in the queue)

**Returns:** *Promise‹[Fees](../interfaces/fees.md) | null›*

___

###  onStatusChange

▸ **onStatusChange**(`listener`: function): *function*

*Defined in [src/base/PolymeshTransaction.ts:190](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L190)*

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

*Defined in [src/base/PolymeshTransaction.ts:149](https://github.com/PolymathNetwork/polymesh-sdk/blob/9ab6f40/src/base/PolymeshTransaction.ts#L149)*

Run the poly transaction and update the transaction status

**Returns:** *Promise‹void›*
