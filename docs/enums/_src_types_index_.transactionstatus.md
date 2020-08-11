# Enumeration: TransactionStatus

## Index

### Enumeration members

* [Aborted](_src_types_index_.transactionstatus.md#aborted)
* [Failed](_src_types_index_.transactionstatus.md#failed)
* [Idle](_src_types_index_.transactionstatus.md#idle)
* [Rejected](_src_types_index_.transactionstatus.md#rejected)
* [Running](_src_types_index_.transactionstatus.md#running)
* [Succeeded](_src_types_index_.transactionstatus.md#succeeded)
* [Unapproved](_src_types_index_.transactionstatus.md#unapproved)

## Enumeration members

###  Aborted

• **Aborted**: = "Aborted"

*Defined in [src/types/index.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L36)*

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

___

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:31](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L31)*

the transaction's execution failed due to a revert

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L11)*

the transaction is prepped to run

___

###  Rejected

• **Rejected**: = "Rejected"

*Defined in [src/types/index.ts:23](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L23)*

the transaction was rejected by the signer

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L19)*

the transaction is being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L27)*

the transaction was run successfully

___

###  Unapproved

• **Unapproved**: = "Unapproved"

*Defined in [src/types/index.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/index.ts#L15)*

the transaction is waiting for the user's signature
