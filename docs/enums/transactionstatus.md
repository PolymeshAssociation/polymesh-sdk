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

*Defined in [src/types/index.ts:38](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L38)*

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

___

###  Failed

• **Failed**: = "Failed"

*Defined in [src/types/index.ts:33](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L33)*

the transaction's execution failed due to a revert

___

###  Idle

• **Idle**: = "Idle"

*Defined in [src/types/index.ts:13](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L13)*

the transaction is prepped to run

___

###  Rejected

• **Rejected**: = "Rejected"

*Defined in [src/types/index.ts:25](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L25)*

the transaction was rejected by the signer

___

###  Running

• **Running**: = "Running"

*Defined in [src/types/index.ts:21](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L21)*

the transaction is being executed

___

###  Succeeded

• **Succeeded**: = "Succeeded"

*Defined in [src/types/index.ts:29](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L29)*

the transaction was run successfully

___

###  Unapproved

• **Unapproved**: = "Unapproved"

*Defined in [src/types/index.ts:17](https://github.com/PolymathNetwork/polymesh-sdk/blob/59d9411/src/types/index.ts#L17)*

the transaction is waiting for the user's signature
