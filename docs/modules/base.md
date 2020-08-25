# Module: base

## Index

### References

* [Entity](base.md#entity)
* [Namespace](base.md#namespace)
* [PolymeshError](base.md#polymesherror)
* [PolymeshTransaction](base.md#polymeshtransaction)
* [TransactionQueue](base.md#transactionqueue)

### Enumerations

* [Event](../enums/base.event.md)
* [Events](../enums/base.events.md)

### Classes

* [Entity](../classes/base.entity.md)
* [Namespace](../classes/base.namespace.md)
* [PolymeshError](../classes/base.polymesherror.md)
* [PolymeshTransaction](../classes/base.polymeshtransaction.md)
* [TransactionQueue](../classes/base.transactionqueue.md)

### Interfaces

* [AddTransactionOpts](../interfaces/base.addtransactionopts.md)

### Type aliases

* [PolymeshError](base.md#polymesherror)
* [PolymeshTransaction](base.md#polymeshtransaction)
* [PolymeshTransactionArray](base.md#polymeshtransactionarray)
* [TransactionQueue](base.md#transactionqueue)
* [TransactionSpecArray](base.md#transactionspecarray)

### Object literals

* [ErrorMessagesPerCode](base.md#const-errormessagespercode)

## References

###  Entity

• **Entity**:

___

###  Namespace

• **Namespace**:

___

###  PolymeshError

• **PolymeshError**:

___

###  PolymeshTransaction

• **PolymeshTransaction**:

___

###  TransactionQueue

• **TransactionQueue**:

## Type aliases

###  PolymeshError

Ƭ **PolymeshError**: *InstanceType‹typeof PolymeshErrorClass›*

*Defined in [src/base/types.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/types.ts#L7)*

___

###  PolymeshTransaction

Ƭ **PolymeshTransaction**: *InstanceType‹typeof PolymeshTransactionClass›*

*Defined in [src/base/types.ts:5](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/types.ts#L5)*

___

###  PolymeshTransactionArray

Ƭ **PolymeshTransactionArray**: *object*

*Defined in [src/base/TransactionQueue.ts:14](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/TransactionQueue.ts#L14)*

#### Type declaration:

___

###  TransactionQueue

Ƭ **TransactionQueue**: *InstanceType‹typeof TransactionQueueClass›*

*Defined in [src/base/types.ts:6](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/types.ts#L6)*

___

###  TransactionSpecArray

Ƭ **TransactionSpecArray**: *object*

*Defined in [src/base/TransactionQueue.ts:20](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/TransactionQueue.ts#L20)*

#### Type declaration:

## Object literals

### `Const` ErrorMessagesPerCode

### ▪ **ErrorMessagesPerCode**: *object*

*Defined in [src/base/PolymeshError.ts:3](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/PolymeshError.ts#L3)*

###  [ErrorCode.TransactionAborted]

• **[ErrorCode.TransactionAborted]**: *string* = "The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)"

*Defined in [src/base/PolymeshError.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/PolymeshError.ts#L7)*

###  [ErrorCode.TransactionRejectedByUser]

• **[ErrorCode.TransactionRejectedByUser]**: *string* = "The user canceled the transaction signature"

*Defined in [src/base/PolymeshError.ts:9](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/PolymeshError.ts#L9)*

###  [ErrorCode.TransactionReverted]

• **[ErrorCode.TransactionReverted]**: *string* = "The transaction execution reverted due to an error"

*Defined in [src/base/PolymeshError.ts:6](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/PolymeshError.ts#L6)*
