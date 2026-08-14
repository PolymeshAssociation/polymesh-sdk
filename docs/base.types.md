[@polymeshassociation/polymesh-sdk](../wiki/README) / base/types

# base/types

## Enumerations

### PayingAccountType

Defined in: [base/types.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L120)

Type of relationship between a paying account and a beneficiary

#### Enumeration Members

##### Caller

> **Caller**: `"Caller"`

Defined in: [base/types.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L134)

the caller Account is responsible of paying the fees

##### MultiSigCreator

> **MultiSigCreator**: `"MultiSigCreator"`

Defined in: [base/types.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L138)

The creator of the MultiSig is responsible for paying the fees

##### Other

> **Other**: `"Other"`

Defined in: [base/types.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L130)

the paying Account is paying for a specific transaction because of
  chain-specific constraints (e.g. the caller is accepting an invitation to an Identity
  and cannot have any funds to pay for it by definition)

##### Subsidy

> **Subsidy**: `"Subsidy"`

Defined in: [base/types.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L124)

the paying Account is currently subsidizing the caller

***

### TransactionArgumentType

Defined in: [base/types.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L60)

#### Enumeration Members

##### Address

> **Address**: `"Address"`

Defined in: [base/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L62)

##### Array

> **Array**: `"Array"`

Defined in: [base/types.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L68)

##### Balance

> **Balance**: `"Balance"`

Defined in: [base/types.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L66)

##### Boolean

> **Boolean**: `"Boolean"`

Defined in: [base/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L64)

##### Date

> **Date**: `"Date"`

Defined in: [base/types.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L67)

##### Did

> **Did**: `"Did"`

Defined in: [base/types.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L61)

##### Null

> **Null**: `"Null"`

Defined in: [base/types.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L74)

##### Number

> **Number**: `"Number"`

Defined in: [base/types.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L65)

##### Object

> **Object**: `"Object"`

Defined in: [base/types.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L72)

##### RichEnum

> **RichEnum**: `"RichEnum"`

Defined in: [base/types.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L71)

##### SimpleEnum

> **SimpleEnum**: `"SimpleEnum"`

Defined in: [base/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L70)

##### Text

> **Text**: `"Text"`

Defined in: [base/types.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L63)

##### Tuple

> **Tuple**: `"Tuple"`

Defined in: [base/types.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L69)

##### Unknown

> **Unknown**: `"Unknown"`

Defined in: [base/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L73)

***

### TransactionStatus

Defined in: [base/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L20)

#### Enumeration Members

##### Aborted

> **Aborted**: `"Aborted"`

Defined in: [base/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L57)

the transaction couldn't be broadcast. It was either dropped, usurped or invalidated
see https://github.com/paritytech/substrate/blob/master/primitives/transaction-pool/src/pool.rs#L58-L110

##### Failed

> **Failed**: `"Failed"`

Defined in: [base/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L52)

the transaction's execution failed due to a an on-chain validation error, insufficient balance for fees, or other such reasons

##### Future

> **Future**: `"Future"`

Defined in: [base/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L40)

the transaction is scheduled for the future

##### Idle

> **Idle**: `"Idle"`

Defined in: [base/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L24)

the transaction is prepped to run

##### InBlock

> **InBlock**: `"InBlock"`

Defined in: [base/types.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L36)

the transaction is in a block

##### Rejected

> **Rejected**: `"Rejected"`

Defined in: [base/types.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L44)

the transaction was rejected by the signer

##### Running

> **Running**: `"Running"`

Defined in: [base/types.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L32)

the transaction is being executed

##### Succeeded

> **Succeeded**: `"Succeeded"`

Defined in: [base/types.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L48)

the transaction was run successfully

##### Unapproved

> **Unapproved**: `"Unapproved"`

Defined in: [base/types.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L28)

the transaction is waiting for the user's signature

## Interfaces

### ArrayTransactionArgument

Defined in: [base/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L88)

#### Properties

##### internal

> **internal**: [`TransactionArgument`](../wiki/#transactionargument)

Defined in: [base/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L90)

##### type

> **type**: [`Array`](../wiki/#array)

Defined in: [base/types.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L89)

***

### ComplexTransactionArgument

Defined in: [base/types.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L98)

#### Properties

##### internal

> **internal**: [`TransactionArgument`](../wiki/#transactionargument)[]

Defined in: [base/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L103)

##### type

> **type**: [`Tuple`](../wiki/#tuple) \| [`RichEnum`](../wiki/#richenum) \| [`Object`](../wiki/#object)

Defined in: [base/types.ts:99](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L99)

***

### PayingAccountFees

Defined in: [base/types.ts:165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L165)

Breakdown of the fees that will be paid by a specific Account for a transaction, along
  with data associated to the Paying account

#### Properties

##### fees

> **fees**: [`Fees`](../wiki/api.client.types#fees)

Defined in: [base/types.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L169)

fees that will be paid by the Account

##### payingAccountData

> **payingAccountData**: [`PayingAccount`](../wiki/#payingaccount) & `object`

Defined in: [base/types.ts:173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L173)

data related to the Account responsible of paying for the transaction

###### Type Declaration

###### balance

> **balance**: `BigNumber`

free balance of the Account

***

### PlainTransactionArgument

Defined in: [base/types.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L77)

#### Properties

##### type

> **type**: [`Did`](../wiki/#did) \| [`Address`](../wiki/#address) \| [`Text`](../wiki/#text) \| [`Boolean`](../wiki/#boolean) \| [`Number`](../wiki/#number) \| [`Balance`](../wiki/#balance) \| [`Date`](../wiki/#date) \| [`Unknown`](../wiki/#unknown) \| [`Null`](../wiki/#null)

Defined in: [base/types.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L78)

***

### SimpleEnumTransactionArgument

Defined in: [base/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L93)

#### Properties

##### internal

> **internal**: `string`[]

Defined in: [base/types.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L95)

##### type

> **type**: [`SimpleEnum`](../wiki/#simpleenum)

Defined in: [base/types.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L94)

***

### TransactionPayload

Defined in: [base/types.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L184)

Unsigned transaction data in JSON a format

#### Properties

##### metadata

> `readonly` **metadata**: `Record`\<`string`, `string`\>

Defined in: [base/types.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L210)

Additional information attached to the payload, such as IDs or memos about the transaction.

###### Note

this is not chain data. Its for convenience for attaching a trace ID

##### method

> `readonly` **method**: `` `0x${string}` ``

Defined in: [base/types.ts:203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L203)

A hex representation of the core extrinsic information. i.e. the extrinsic and args, but does not contain information about who is to sign the transaction.

##### multiSig

> `readonly` **multiSig**: `string` \| `null`

Defined in: [base/types.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L218)

The address of the MultiSig if the transaction is a proposal.

Will be set only if the signing account is a MultiSig signer, the transaction is not approving or rejecting an existing proposal,

###### Note

`asProposal: false` will force this to be null, even if the signing account is a MultiSig signer

##### payload

> `readonly` **payload**: `SignerPayloadJSON`

Defined in: [base/types.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L190)

This is what a Polkadot signer ".signPayload" method expects

###### Note

this field is recommended to be passed in with the signature when submitting a signed transaction

##### rawPayload

> `readonly` **rawPayload**: `SignerPayloadRaw`

Defined in: [base/types.ts:198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L198)

An alternative representation of the payload for which Polkadot signers providing ".signRaw" expect.

###### Note

using the field `payload` is generally recommended. The raw version is included so any polkadot compliant signer can sign.

###### Note

`signRaw` typically returns just the signature. However signatures must be prefixed with a byte to indicate the type. For ed25519 signatures prepend a zero byte (`0x00`), for sr25519 `0x01` byte to indicate sr25519 if the signer implementation does not already do so.

## Type Aliases

### MapTxData

> **MapTxData**\<`ArgsArray`\> = `{ [K in keyof ArgsArray]: ArgsArray[K] extends unknown[] ? TxData<ArgsArray[K]> : never }`

Defined in: [base/types.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L16)

Apply the [TxData](../wiki/api.procedures.types#txdata) type to all args in an array

#### Type Parameters

| Type Parameter |
| ------ |
| `ArgsArray` *extends* `unknown`[][] |

***

### PayingAccount

> **PayingAccount** = \{ `account`: [`Account`](../wiki/api.entities.Account#account); `allowance`: `BigNumber`; `type`: [`Subsidy`](../wiki/#subsidy); \} \| \{ `account`: [`Account`](../wiki/api.entities.Account#account); `type`: [`Caller`](../wiki/#caller) \| [`Other`](../wiki/#other) \| [`MultiSigCreator`](../wiki/#multisigcreator); \}

Defined in: [base/types.ts:144](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L144)

Data representing the Account responsible for paying fees for a transaction

#### Union Members

##### Type Literal

\{ `account`: [`Account`](../wiki/api.entities.Account#account); `allowance`: `BigNumber`; `type`: [`Subsidy`](../wiki/#subsidy); \}

###### account

> **account**: [`Account`](../wiki/api.entities.Account#account)

Account that pays for the transaction

###### allowance

> **allowance**: `BigNumber`

total amount that can be paid for

###### type

> **type**: [`Subsidy`](../wiki/#subsidy)

***

##### Type Literal

\{ `account`: [`Account`](../wiki/api.entities.Account#account); `type`: [`Caller`](../wiki/#caller) \| [`Other`](../wiki/#other) \| [`MultiSigCreator`](../wiki/#multisigcreator); \}

***

### PolymeshError

> **PolymeshError** = [`PolymeshError`](../wiki/base.PolymeshError#polymesherror)

Defined in: [base/types.ts:244](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L244)

***

### PolymeshTransaction

> **PolymeshTransaction**\<`ReturnValue`, `TransformedReturnValue`, `Args`\> = [`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`ReturnValue`, `TransformedReturnValue`, `Args`\>

Defined in: [base/types.ts:234](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L234)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ReturnValue` | `unknown` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` *extends* `unknown`[] \| \[\] | `unknown`[] |

***

### PolymeshTransactionBatch

> **PolymeshTransactionBatch**\<`ReturnValue`, `TransformedReturnValue`, `Args`\> = [`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch#polymeshtransactionbatch)\<`ReturnValue`, `TransformedReturnValue`, `Args`\>

Defined in: [base/types.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L239)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ReturnValue` | `unknown` |
| `TransformedReturnValue` | `ReturnValue` |
| `Args` *extends* `unknown`[][] | `unknown`[][] |

***

### TransactionArgument

> **TransactionArgument** = `object` & [`PlainTransactionArgument`](../wiki/#plaintransactionargument) \| [`ArrayTransactionArgument`](../wiki/#arraytransactionargument) \| [`SimpleEnumTransactionArgument`](../wiki/#simpleenumtransactionargument) \| [`ComplexTransactionArgument`](../wiki/#complextransactionargument)

Defined in: [base/types.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L106)

#### Type Declaration

##### \_rawType

> **\_rawType**: `TypeDef`

##### name

> **name**: `string`

##### optional

> **optional**: `boolean`

***

### TransactionPayloadInput

> **TransactionPayloadInput** = [`TransactionPayload`](../wiki/#transactionpayload) \| [`TransactionPayload`](../wiki/#transactionpayload)\[`"payload"`\] \| [`TransactionPayload`](../wiki/#transactionpayload)\[`"rawPayload"`\]

Defined in: [base/types.ts:229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/base/types.ts#L229)

The data needed for submitting an offline transaction.

#### Note

One of the following can be used to submit an offline transaction -
  1. Full payload
  2. Inner payload field
  3. Inner raw payload field
