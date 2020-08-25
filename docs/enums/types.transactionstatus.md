# Enumeration: TransactionStatus

## Index

### Enumeration members

* [Aborted](types.transactionstatus.md#aborted)
* [Failed](types.transactionstatus.md#failed)
* [Idle](types.transactionstatus.md#idle)
* [Rejected](types.transactionstatus.md#rejected)
* [Running](types.transactionstatus.md#running)
* [Succeeded](types.transactionstatus.md#succeeded)
* [Unapproved](types.transactionstatus.md#unapproved)

## Enumeration members

###  Aborted

• **Aborted**: = "Aborted"

*Defined in [src/types/index.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L36)*

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

___

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:31](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L31)*

the transaction's execution failed due to a revert

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L11)*

the transaction is prepped to run

___

###  Rejected

• **Rejected**: = "Rejected"

*Defined in [src/types/index.ts:23](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L23)*

the transaction was rejected by the signer

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L19)*

the transaction is being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L27)*

the transaction was run successfully

___

###  Unapproved

• **Unapproved**: = "Unapproved"

*Defined in [src/types/index.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/types/index.ts#L15)*

the transaction is waiting for the user's signature
