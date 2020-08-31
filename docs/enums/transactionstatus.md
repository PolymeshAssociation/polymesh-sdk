# Enumeration: TransactionStatus

## Index

### Enumeration members

* [Aborted](transactionstatus.md#aborted)
* [Failed](transactionstatus.md#failed)
* [Idle](transactionstatus.md#idle)
* [Rejected](transactionstatus.md#rejected)
* [Running](transactionstatus.md#running)
* [Succeeded](transactionstatus.md#succeeded)
* [Unapproved](transactionstatus.md#unapproved)

## Enumeration members

###  Aborted

• **Aborted**: = "Aborted"

*Defined in [src/types/index.ts:37](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L37)*

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

___

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L32)*

the transaction's execution failed due to a revert

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L12)*

the transaction is prepped to run

___

###  Rejected

• **Rejected**: = "Rejected"

*Defined in [src/types/index.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L24)*

the transaction was rejected by the signer

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:20](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L20)*

the transaction is being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L28)*

the transaction was run successfully

___

###  Unapproved

• **Unapproved**: = "Unapproved"

*Defined in [src/types/index.ts:16](https://github.com/PolymathNetwork/polymesh-sdk/blob/b7c3540/src/types/index.ts#L16)*

the transaction is waiting for the user's signature
