# Class: TransactionQueue ‹**ReturnType, TransactionArgs**›

Class to manage procedural transaction queues

## Type parameters

▪ **ReturnType**

▪ **TransactionArgs**: *unknown[][]*

## Hierarchy

* **TransactionQueue**

## Index

### Constructors

* [constructor](_src_base_transactionqueue_.transactionqueue.md#constructor)

### Properties

* [error](_src_base_transactionqueue_.transactionqueue.md#optional-error)
* [status](_src_base_transactionqueue_.transactionqueue.md#status)
* [transactions](_src_base_transactionqueue_.transactionqueue.md#transactions)

### Methods

* [getMinFees](_src_base_transactionqueue_.transactionqueue.md#getminfees)
* [onStatusChange](_src_base_transactionqueue_.transactionqueue.md#onstatuschange)
* [onTransactionStatusChange](_src_base_transactionqueue_.transactionqueue.md#ontransactionstatuschange)
* [run](_src_base_transactionqueue_.transactionqueue.md#run)

## Constructors

###  constructor

\+ **new TransactionQueue**(`transactions`: TransactionSpecArray‹TransactionArgs›, `returnValue`: [MaybePostTransactionValue](../modules/_src_types_internal_.md#maybeposttransactionvalue)‹ReturnType›, `context`: [Context](_src_context_index_.context.md)): *[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)*

*Defined in [src/base/TransactionQueue.ts:72](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L72)*

Create a transaction queue

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`transactions` | TransactionSpecArray‹TransactionArgs› | list of transactions to be run in this queue |
`returnValue` | [MaybePostTransactionValue](../modules/_src_types_internal_.md#maybeposttransactionvalue)‹ReturnType› | value that will be returned by the queue after it is run. It can be a [[PostTransactionValue]] |
`context` | [Context](_src_context_index_.context.md) | - |

**Returns:** *[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)*

## Properties

### `Optional` error

• **error**? : *[PolymeshError](_src_base_polymesherror_.polymesherror.md)*

*Defined in [src/base/TransactionQueue.ts:46](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L46)*

optional error information

___

###  status

• **status**: *[TransactionQueueStatus](../enums/_src_types_index_.transactionqueuestatus.md)* = TransactionQueueStatus.Idle

*Defined in [src/base/TransactionQueue.ts:41](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L41)*

status of the queue

___

###  transactions

• **transactions**: *PolymeshTransactionArray‹TransactionArgs›*

*Defined in [src/base/TransactionQueue.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L36)*

transactions that will be run in the queue

## Methods

###  getMinFees

▸ **getMinFees**(): *Promise‹[Fees](../interfaces/_src_types_index_.fees.md)›*

*Defined in [src/base/TransactionQueue.ts:170](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L170)*

Retrieves a lower bound of the fees required to execute this transaction queue.
  Transaction fees can be higher at execution time for two reasons:

- One or more transactions (or arguments) depend on the result of another transaction in the queue.
  This means fees can't be calculated for said transaction until previous transactions in the queue have run
- Protocol fees may vary between when this value is fetched and when the transaction is actually executed because of a
  governance vote

**Returns:** *Promise‹[Fees](../interfaces/_src_types_index_.fees.md)›*

___

###  onStatusChange

▸ **onStatusChange**(`listener`: function): *function*

*Defined in [src/base/TransactionQueue.ts:192](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L192)*

Subscribe to status changes on the Transaction Queue

**Parameters:**

▪ **listener**: *function*

callback function that will be called whenever the Transaction Queue's status changes

▸ (`transactionQueue`: this): *void*

**Parameters:**

Name | Type |
------ | ------ |
`transactionQueue` | this |

**Returns:** *function*

unsubscribe function

▸ (): *void*

___

###  onTransactionStatusChange

▸ **onTransactionStatusChange**‹**TxArgs**, **Values**›(`listener`: function): *function*

*Defined in [src/base/TransactionQueue.ts:207](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L207)*

Subscribe to status changes on individual transactions

**Type parameters:**

▪ **TxArgs**: *unknown[]*

▪ **Values**: *unknown[]*

**Parameters:**

▪ **listener**: *function*

callback function that will be called whenever the individual transaction's status changes

▸ (`transaction`: [PolymeshTransaction](_src_base_polymeshtransaction_.polymeshtransaction.md)‹TxArgs, Values›, `transactionQueue`: this): *void*

**Parameters:**

Name | Type |
------ | ------ |
`transaction` | [PolymeshTransaction](_src_base_polymeshtransaction_.polymeshtransaction.md)‹TxArgs, Values› |
`transactionQueue` | this |

**Returns:** *function*

unsubscribe function

▸ (): *void*

___

###  run

▸ **run**(): *Promise‹ReturnType›*

*Defined in [src/base/TransactionQueue.ts:109](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/TransactionQueue.ts#L109)*

Run the transactions in the queue in sequential order. If a transaction fails or the user refuses to sign it, one of two things can happen:

1) If `transaction.isCritical === true`, the entire queue fails and the corresponding error is stored in `this.error` as well as thrown
2) Otherwise, the queue continues executing and the error is stored in `transaction.error`

**Returns:** *Promise‹ReturnType›*
