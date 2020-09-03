# Enumeration: TransactionQueueStatus

## Index

### Enumeration members

* [Failed](transactionqueuestatus.md#failed)
* [Idle](transactionqueuestatus.md#idle)
* [Running](transactionqueuestatus.md#running)
* [Succeeded](transactionqueuestatus.md#succeeded)

## Enumeration members

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/91d79c8/src/types/index.ts#L55)*

a critical transaction's execution failed.
This might mean the transaction was rejected,
failed due to a revert or never entered a block

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:45](https://github.com/PolymathNetwork/polymesh-sdk/blob/91d79c8/src/types/index.ts#L45)*

the queue is prepped to run

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/91d79c8/src/types/index.ts#L49)*

transactions in the queue are being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:60](https://github.com/PolymathNetwork/polymesh-sdk/blob/91d79c8/src/types/index.ts#L60)*

the queue finished running all of its transactions. Non-critical transactions
might still have failed
