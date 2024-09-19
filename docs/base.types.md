# Module: base/types

## Table of contents

### Enumerations

- [PayingAccountType](../wiki/base.types.PayingAccountType)
- [TransactionArgumentType](../wiki/base.types.TransactionArgumentType)
- [TransactionStatus](../wiki/base.types.TransactionStatus)

### Interfaces

- [ArrayTransactionArgument](../wiki/base.types.ArrayTransactionArgument)
- [ComplexTransactionArgument](../wiki/base.types.ComplexTransactionArgument)
- [PayingAccountFees](../wiki/base.types.PayingAccountFees)
- [PlainTransactionArgument](../wiki/base.types.PlainTransactionArgument)
- [SimpleEnumTransactionArgument](../wiki/base.types.SimpleEnumTransactionArgument)
- [TransactionPayload](../wiki/base.types.TransactionPayload)

### Type Aliases

- [MapTxData](../wiki/base.types#maptxdata)
- [PayingAccount](../wiki/base.types#payingaccount)
- [PolymeshError](../wiki/base.types#polymesherror)
- [PolymeshTransaction](../wiki/base.types#polymeshtransaction)
- [PolymeshTransactionBatch](../wiki/base.types#polymeshtransactionbatch)
- [TransactionArgument](../wiki/base.types#transactionargument)

## Type Aliases

### MapTxData

Ƭ **MapTxData**\<`ArgsArray`\>: \{ [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData\<ArgsArray[K]\> : never }

Apply the [TxData](../wiki/api.procedures.types.TxData) type to all args in an array

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ArgsArray` | extends `unknown`[][] |

#### Defined in

[base/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L17)

___

### PayingAccount

Ƭ **PayingAccount**: \{ `account`: [`Account`](../wiki/api.entities.Account.Account) ; `allowance`: `BigNumber` ; `type`: [`Subsidy`](../wiki/base.types.PayingAccountType#subsidy)  } \| \{ `account`: [`Account`](../wiki/api.entities.Account.Account) ; `type`: [`Caller`](../wiki/base.types.PayingAccountType#caller) \| [`Other`](../wiki/base.types.PayingAccountType#other) \| [`MultiSigCreator`](../wiki/base.types.PayingAccountType#multisigcreator)  }

Data representing the Account responsible for paying fees for a transaction

#### Defined in

[base/types.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L137)

___

### PolymeshError

Ƭ **PolymeshError**: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)

#### Defined in

[base/types.ts:219](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L219)

___

### PolymeshTransaction

Ƭ **PolymeshTransaction**\<`ReturnValue`, `TransformedReturnValue`, `Args`\>: [`PolymeshTransaction`](../wiki/base.PolymeshTransaction.PolymeshTransaction)\<`ReturnValue`, `TransformedReturnValue`, `Args`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValue` | `unknown` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` | extends `unknown`[] \| [] = `unknown`[] |

#### Defined in

[base/types.ts:209](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L209)

___

### PolymeshTransactionBatch

Ƭ **PolymeshTransactionBatch**\<`ReturnValue`, `TransformedReturnValue`, `Args`\>: [`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)\<`ReturnValue`, `TransformedReturnValue`, `Args`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValue` | `unknown` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` | extends `unknown`[][] = `unknown`[][] |

#### Defined in

[base/types.ts:214](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L214)

___

### TransactionArgument

Ƭ **TransactionArgument**: \{ `_rawType`: `TypeDef` ; `name`: `string` ; `optional`: `boolean`  } & [`PlainTransactionArgument`](../wiki/base.types.PlainTransactionArgument) \| [`ArrayTransactionArgument`](../wiki/base.types.ArrayTransactionArgument) \| [`SimpleEnumTransactionArgument`](../wiki/base.types.SimpleEnumTransactionArgument) \| [`ComplexTransactionArgument`](../wiki/base.types.ComplexTransactionArgument)

#### Defined in

[base/types.ts:99](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L99)
