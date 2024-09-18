# Enumeration: TransactionStatus

[types](../wiki/types).TransactionStatus

## Table of contents

### Enumeration Members

- [Aborted](../wiki/types.TransactionStatus#aborted)
- [Failed](../wiki/types.TransactionStatus#failed)
- [Idle](../wiki/types.TransactionStatus#idle)
- [Rejected](../wiki/types.TransactionStatus#rejected)
- [Running](../wiki/types.TransactionStatus#running)
- [Succeeded](../wiki/types.TransactionStatus#succeeded)
- [Unapproved](../wiki/types.TransactionStatus#unapproved)

## Enumeration Members

### Aborted

• **Aborted** = ``"Aborted"``

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

#### Defined in

[types/index.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L93)

___

### Failed

• **Failed** = ``"Failed"``

the transaction's execution failed due to a an on-chain validation error, insufficient balance for fees, or other such reasons

#### Defined in

[types/index.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L88)

___

### Idle

• **Idle** = ``"Idle"``

the transaction is prepped to run

#### Defined in

[types/index.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L68)

___

### Rejected

• **Rejected** = ``"Rejected"``

the transaction was rejected by the signer

#### Defined in

[types/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L80)

___

### Running

• **Running** = ``"Running"``

the transaction is being executed

#### Defined in

[types/index.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L76)

___

### Succeeded

• **Succeeded** = ``"Succeeded"``

the transaction was run successfully

#### Defined in

[types/index.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L84)

___

### Unapproved

• **Unapproved** = ``"Unapproved"``

the transaction is waiting for the user's signature

#### Defined in

[types/index.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L72)
