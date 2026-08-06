[@polymeshassociation/polymesh-sdk](../wiki/README) / base/utils

# base/utils

## Functions

### dispatchErrorToMessage()

> **dispatchErrorToMessage**(`error`): `string`

Defined in: [base/utils.ts:154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/utils.ts#L154)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `DispatchError` \| `SpRuntimeDispatchError` |

#### Returns

`string`

***

### handleTransactionSubmissionError()

> **handleTransactionSubmissionError**(`err`): [`PolymeshError`](../wiki/base.PolymeshError#polymesherror)

Defined in: [base/utils.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/utils.ts#L185)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `Error` |

#### Returns

[`PolymeshError`](../wiki/base.PolymeshError#polymesherror)

***

### processType()

> **processType**(`rawType`, `name`): [`TransactionArgument`](../wiki/base.types#transactionargument)

Defined in: [base/utils.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/base/utils.ts#L66)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `rawType` | `TypeDef` |
| `name` | `string` |

#### Returns

[`TransactionArgument`](../wiki/base.types#transactionargument)
