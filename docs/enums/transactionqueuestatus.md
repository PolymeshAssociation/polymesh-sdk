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

*Defined in [src/types/index.ts:54](https://github.com/PolymathNetwork/polymesh-sdk/blob/555a252/src/types/index.ts#L54)*

a critical transaction's execution failed.
This might mean the transaction was rejected,
failed due to a revert or never entered a block

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:44](https://github.com/PolymathNetwork/polymesh-sdk/blob/555a252/src/types/index.ts#L44)*

the queue is prepped to run

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:48](https://github.com/PolymathNetwork/polymesh-sdk/blob/555a252/src/types/index.ts#L48)*

transactions in the queue are being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:59](https://github.com/PolymathNetwork/polymesh-sdk/blob/555a252/src/types/index.ts#L59)*

the queue finished running all of its transactions. Non-critical transactions
might still have failed
