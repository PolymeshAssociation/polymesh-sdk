# Enumeration: TransactionQueueStatus

## Index

### Enumeration members

* [Failed](types.transactionqueuestatus.md#failed)
* [Idle](types.transactionqueuestatus.md#idle)
* [Running](types.transactionqueuestatus.md#running)
* [Succeeded](types.transactionqueuestatus.md#succeeded)

## Enumeration members

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L53)*

a critical transaction's execution failed.
This might mean the transaction was rejected,
failed due to a revert or never entered a block

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:43](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L43)*

the queue is prepped to run

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L47)*

transactions in the queue are being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L58)*

the queue finished running all of its transactions. Non-critical transactions
might still have failed
