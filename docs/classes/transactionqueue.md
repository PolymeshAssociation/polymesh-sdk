# Class: TransactionQueue ‹**ReturnType, TransactionArgs**›

Class to manage procedural transaction queues

## Type parameters

▪ **ReturnType**

▪ **TransactionArgs**: *unknown[][]*

## Hierarchy

* **TransactionQueue**

## Index

### Constructors

* [constructor](transactionqueue.md#constructor)

### Properties

* [error](transactionqueue.md#optional-error)
* [status](transactionqueue.md#status)
* [transactions](transactionqueue.md#transactions)

### Methods

* [getMinFees](transactionqueue.md#getminfees)
* [onStatusChange](transactionqueue.md#onstatuschange)
* [onTransactionStatusChange](transactionqueue.md#ontransactionstatuschange)
* [run](transactionqueue.md#run)

## Constructors

###  constructor

\+ **new TransactionQueue**(`transactions`: [TransactionSpecArray](../globals.md#transactionspecarray)‹TransactionArgs›, `returnValue`: MaybePostTransactionValue‹ReturnType›, `context`: Context): *[TransactionQueue](transactionqueue.md)*

*Defined in [src/base/TransactionQueue.ts:78](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L78)*

Create a transaction queue

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`transactions` | [TransactionSpecArray](../globals.md#transactionspecarray)‹TransactionArgs› | list of transactions to be run in this queue |
`returnValue` | MaybePostTransactionValue‹ReturnType› | value that will be returned by the queue after it is run. It can be a [[PostTransactionValue]] |
`context` | Context | - |

**Returns:** *[TransactionQueue](transactionqueue.md)*

## Properties

### `Optional` error

• **error**? : *[PolymeshError](polymesherror.md)*

*Defined in [src/base/TransactionQueue.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L52)*

optional error information

___

###  status

• **status**: *[TransactionQueueStatus](../enums/transactionqueuestatus.md)* = TransactionQueueStatus.Idle

*Defined in [src/base/TransactionQueue.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L47)*

status of the queue

___

###  transactions

• **transactions**: *PolymeshTransactionArray‹TransactionArgs›*

*Defined in [src/base/TransactionQueue.ts:42](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L42)*

transactions that will be run in the queue

## Methods

###  getMinFees

▸ **getMinFees**(): *Promise‹[Fees](../interfaces/fees.md)›*

*Defined in [src/base/TransactionQueue.ts:176](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L176)*

Retrieves a lower bound of the fees required to execute this transaction queue.
  Transaction fees can be higher at execution time for two reasons:

- One or more transactions (or arguments) depend on the result of another transaction in the queue.
  This means fees can't be calculated for said transaction until previous transactions in the queue have run
- Protocol fees may vary between when this value is fetched and when the transaction is actually executed because of a
  governance vote

**Returns:** *Promise‹[Fees](../interfaces/fees.md)›*

___

###  onStatusChange

▸ **onStatusChange**(`listener`: function): *function*

*Defined in [src/base/TransactionQueue.ts:198](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L198)*

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

*Defined in [src/base/TransactionQueue.ts:213](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L213)*

Subscribe to status changes on individual transactions

**Type parameters:**

▪ **TxArgs**: *unknown[]*

▪ **Values**: *unknown[]*

**Parameters:**

▪ **listener**: *function*

callback function that will be called whenever the individual transaction's status changes

▸ (`transaction`: [PolymeshTransaction](polymeshtransaction.md)‹TxArgs, Values›, `transactionQueue`: this): *void*

**Parameters:**

Name | Type |
------ | ------ |
`transaction` | [PolymeshTransaction](polymeshtransaction.md)‹TxArgs, Values› |
`transactionQueue` | this |

**Returns:** *function*

unsubscribe function

▸ (): *void*

___

###  run

▸ **run**(): *Promise‹ReturnType›*

*Defined in [src/base/TransactionQueue.ts:115](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/TransactionQueue.ts#L115)*

Run the transactions in the queue in sequential order. If a transaction fails or the user refuses to sign it, one of two things can happen:

1) If `transaction.isCritical === true`, the entire queue fails and the corresponding error is stored in `this.error` as well as thrown
2) Otherwise, the queue continues executing and the error is stored in `transaction.error`

**Returns:** *Promise‹ReturnType›*
