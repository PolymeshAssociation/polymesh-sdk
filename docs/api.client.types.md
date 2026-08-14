[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/types

# api/client/types

## Enumerations

### ErrorCode

Defined in: [api/client/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L62)

Specifies possible types of errors in the SDK

#### Enumeration Members

##### DataUnavailable

> **DataUnavailable**: `"DataUnavailable"`

Defined in: [api/client/types.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L98)

the data that is being fetched does not exist on-chain, or relies on non-existent data. There are
  some cases where the data did exist at some point, but has been deleted to save storage space

##### EntityInUse

> **EntityInUse**: `"EntityInUse"`

Defined in: [api/client/types.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L120)

this type of error is thrown when attempting to delete/modify an entity which has other entities depending on it. For example, deleting
  a Portfolio that still holds assets, or removing a Checkpoint Schedule that is being referenced by a Corporate Action

##### FatalError

> **FatalError**: `"FatalError"`

Defined in: [api/client/types.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L80)

error that should cause termination of the calling application

##### General

> **General**: `"General"`

Defined in: [api/client/types.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L133)

general purpose errors that don't fit well into the other categories

##### InsufficientBalance

> **InsufficientBalance**: `"InsufficientBalance"`

Defined in: [api/client/types.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L124)

one or more parties involved in the transaction do not have enough balance to perform it

##### LimitExceeded

> **LimitExceeded**: `"LimitExceeded"`

Defined in: [api/client/types.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L108)

the data that is being written to the chain would result in some limit being exceeded. For example, adding a transfer
  restriction when the maximum possible amount has already been added

##### MiddlewareError

> **MiddlewareError**: `"MiddlewareError"`

Defined in: [api/client/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L93)

errors encountered when interacting with the historic data middleware (GQL server)

##### NoDataChange

> **NoDataChange**: `"NoDataChange"`

Defined in: [api/client/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L103)

the data that is being written to the chain is the same data that is already in place. This would result
  in a redundant/useless transaction being executed

##### NotAuthorized

> **NotAuthorized**: `"NotAuthorized"`

Defined in: [api/client/types.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L89)

user does not have the required roles/permissions to perform an operation

##### NotSupported

> **NotSupported**: `"NotSupported"`

Defined in: [api/client/types.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L137)

method not supported

##### TransactionAborted

> **TransactionAborted**: `"TransactionAborted"`

Defined in: [api/client/types.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L66)

transaction removed from the tx pool

##### TransactionRejectedByUser

> **TransactionRejectedByUser**: `"TransactionRejectedByUser"`

Defined in: [api/client/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L70)

user rejected the transaction in their wallet

##### TransactionReverted

> **TransactionReverted**: `"TransactionReverted"`

Defined in: [api/client/types.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L76)

transaction failed due to an on-chain error. This is a business logic error,
  and it should be caught by the SDK before being sent to the chain.
  Please report it to the Polymesh team

##### UnexpectedError

> **UnexpectedError**: `"UnexpectedError"`

Defined in: [api/client/types.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L129)

errors that are the result of something unforeseen.
  These should generally be reported to the Polymesh team

##### UnmetPrerequisite

> **UnmetPrerequisite**: `"UnmetPrerequisite"`

Defined in: [api/client/types.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L115)

one or more base prerequisites for a transaction to be successful haven't been met. For example, reserving a ticker requires
  said ticker to not be already reserved. Attempting to reserve a ticker without that prerequisite being met would result in this
  type of error. Attempting to create an entity that already exists would also fall into this category,
  if the entity in question is supposed to be unique

##### ValidationError

> **ValidationError**: `"ValidationError"`

Defined in: [api/client/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L85)

user input error. This means that one or more inputs passed by the user
  do not conform to expected value ranges or types

***

### InstructionStatusEnum

Defined in: [middleware/types.ts:5282](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5282)

#### Enumeration Members

##### Created

> **Created**: `"Created"`

Defined in: [middleware/types.ts:5283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5283)

##### Executed

> **Executed**: `"Executed"`

Defined in: [middleware/types.ts:5284](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5284)

##### Failed

> **Failed**: `"Failed"`

Defined in: [middleware/types.ts:5285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5285)

##### Locked

> **Locked**: `"Locked"`

Defined in: [middleware/types.ts:5286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5286)

##### Rejected

> **Rejected**: `"Rejected"`

Defined in: [middleware/types.ts:5287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/middleware/types.ts#L5287)

## Interfaces

### EventIdentifier

Defined in: [api/client/types.ts:179](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L179)

#### Extended by

- [`HistoricPolyxTransaction`](../wiki/api.entities.Account.types#historicpolyxtransaction)
- [`BaseHistoricAssetTransaction`](../wiki/api.entities.Asset.types#basehistoricassettransaction)

#### Properties

##### blockDate

> **blockDate**: `Date`

Defined in: [api/client/types.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L182)

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L181)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/client/types.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L180)

##### eventIndex

> **eventIndex**: `BigNumber`

Defined in: [api/client/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L183)

***

### ExtrinsicData

Defined in: [api/client/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L9)

#### Extended by

- [`ExtrinsicDataWithFees`](../wiki/#extrinsicdatawithfees)

#### Properties

##### address

> **address**: `string` \| `null`

Defined in: [api/client/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L17)

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

##### blockDate

> **blockDate**: `Date`

Defined in: [api/client/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L12)

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L10)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/client/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L11)

##### extrinsicHash

> **extrinsicHash**: `string`

Defined in: [api/client/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L26)

##### extrinsicIdx

> **extrinsicIdx**: `BigNumber`

Defined in: [api/client/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L13)

##### nonce

> **nonce**: `BigNumber` \| `null`

Defined in: [api/client/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L21)

nonce of the transaction. Null for unsigned transactions where address is null

##### params

> **params**: `Record`\<`string`, `unknown`\>[]

Defined in: [api/client/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L23)

##### specVersionId

> **specVersionId**: `BigNumber`

Defined in: [api/client/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L25)

##### success

> **success**: `boolean`

Defined in: [api/client/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L24)

##### txTag

> **txTag**: `TxTag`

Defined in: [api/client/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L22)

***

### ExtrinsicDataWithFees

Defined in: [api/client/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L29)

#### Extends

- [`ExtrinsicData`](../wiki/#extrinsicdata)

#### Properties

##### address

> **address**: `string` \| `null`

Defined in: [api/client/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L17)

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`address`](../wiki/#address)

##### blockDate

> **blockDate**: `Date`

Defined in: [api/client/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L12)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`blockDate`](../wiki/#blockdate-1)

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L10)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`blockHash`](../wiki/#blockhash-1)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/client/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L11)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`blockNumber`](../wiki/#blocknumber-1)

##### extrinsicHash

> **extrinsicHash**: `string`

Defined in: [api/client/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L26)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`extrinsicHash`](../wiki/#extrinsichash)

##### extrinsicIdx

> **extrinsicIdx**: `BigNumber`

Defined in: [api/client/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L13)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`extrinsicIdx`](../wiki/#extrinsicidx)

##### fee

> **fee**: [`Fees`](../wiki/#fees)

Defined in: [api/client/types.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L30)

##### nonce

> **nonce**: `BigNumber` \| `null`

Defined in: [api/client/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L21)

nonce of the transaction. Null for unsigned transactions where address is null

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`nonce`](../wiki/#nonce)

##### params

> **params**: `Record`\<`string`, `unknown`\>[]

Defined in: [api/client/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L23)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`params`](../wiki/#params)

##### specVersionId

> **specVersionId**: `BigNumber`

Defined in: [api/client/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L25)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`specVersionId`](../wiki/#specversionid)

##### success

> **success**: `boolean`

Defined in: [api/client/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L24)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`success`](../wiki/#success)

##### txTag

> **txTag**: `TxTag`

Defined in: [api/client/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L22)

###### Inherited from

[`ExtrinsicData`](../wiki/#extrinsicdata).[`txTag`](../wiki/#txtag)

***

### Fees

Defined in: [api/client/types.ts:192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L192)

#### Properties

##### gas

> **gas**: `BigNumber`

Defined in: [api/client/types.ts:200](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L200)

regular network fee

##### protocol

> **protocol**: `BigNumber`

Defined in: [api/client/types.ts:196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L196)

bonus fee charged by certain transactions

##### total

> **total**: `BigNumber`

Defined in: [api/client/types.ts:204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L204)

sum of the protocol and gas fees

***

### HistoricalInstructionFilters

Defined in: [api/client/types.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L224)

Filters for instructions

#### Properties

##### asset?

> `optional` **asset?**: `string` \| [`Asset`](../wiki/api.entities.Asset.types#asset-3)

Defined in: [api/client/types.ts:232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L232)

The asset ID to filter by

##### identity?

> `optional` **identity?**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/client/types.ts:228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L228)

The DID of the identity to filter by

##### mediator?

> `optional` **mediator?**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/client/types.ts:248](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L248)

The mediator did to filter by

##### party?

> `optional` **party?**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/client/types.ts:252](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L252)

The party did to filter by

##### receiver?

> `optional` **receiver?**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/client/types.ts:244](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L244)

The receiver did to filter by

##### sender?

> `optional` **sender?**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/client/types.ts:240](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L240)

The sender did to filter by

##### size?

> `optional` **size?**: `BigNumber`

Defined in: [api/client/types.ts:256](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L256)

The number of results to return

##### start?

> `optional` **start?**: `BigNumber`

Defined in: [api/client/types.ts:260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L260)

The number of results to skip

##### status?

> `optional` **status?**: [`InstructionStatusEnum`](../wiki/#instructionstatusenum)

Defined in: [api/client/types.ts:236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L236)

The status to filter by

***

### MiddlewareConfig

Defined in: [api/client/types.ts:140](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L140)

#### Properties

##### key

> **key**: `string`

Defined in: [api/client/types.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L142)

##### link

> **link**: `string`

Defined in: [api/client/types.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L141)

***

### MiddlewareMetadata

Defined in: [api/client/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L38)

#### Properties

##### chain

> **chain**: `string`

Defined in: [api/client/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L39)

##### genesisHash

> **genesisHash**: `string`

Defined in: [api/client/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L40)

##### indexerHealthy

> **indexerHealthy**: `boolean`

Defined in: [api/client/types.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L41)

##### lastProcessedHeight

> **lastProcessedHeight**: `BigNumber`

Defined in: [api/client/types.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L42)

##### lastProcessedTimestamp

> **lastProcessedTimestamp**: `Date`

Defined in: [api/client/types.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L43)

##### specName

> **specName**: `string`

Defined in: [api/client/types.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L44)

##### sqVersion

> **sqVersion**: `string`

Defined in: [api/client/types.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L46)

##### targetHeight

> **targetHeight**: `BigNumber`

Defined in: [api/client/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L45)

***

### NetworkProperties

Defined in: [api/client/types.ts:186](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L186)

#### Properties

##### genesisHash

> **genesisHash**: `string`

Defined in: [api/client/types.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L189)

##### name

> **name**: `string`

Defined in: [api/client/types.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L187)

##### version

> **version**: `BigNumber`

Defined in: [api/client/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L188)

***

### PolkadotConfig

Defined in: [api/client/types.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L145)

#### Properties

##### metadata?

> `optional` **metadata?**: `Record`\<`string`, `` `0x${string}` ``\>

Defined in: [api/client/types.ts:164](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L164)

provide a locally saved metadata file for a modestly fast startup time (e.g. 1 second when provided, 1.5 seconds without).

###### Note

if not provided the SDK will read the needed data from chain during startup

###### Note

format is key as genesis hash and spec version and the value hex encoded chain metadata

###### Example

**creating valid metadata**

```ts
const meta = _polkadotApi.runtimeMetadata.toHex();
const genesisHash = _polkadotApi.genesisHash;
const specVersion = _polkadotApi.runtimeVersion.specVersion;

const metadata = {
 [`${genesisHash}-${specVersion}`]: meta,
};
```

##### noInitWarn?

> `optional` **noInitWarn?**: `boolean`

Defined in: [api/client/types.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L169)

set to `true` to disable polkadot start up warnings

##### typesBundle?

> `optional` **typesBundle?**: `OverrideBundleType`

Defined in: [api/client/types.ts:176](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L176)

allows for types to be provided for multiple chain specs at once

###### Note

shouldn't be needed for most use cases

***

### ProtocolFees

Defined in: [api/client/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L33)

#### Properties

##### fees

> **fees**: `BigNumber`

Defined in: [api/client/types.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L35)

##### tag

> **tag**: `TxTag`

Defined in: [api/client/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L34)

***

### StakingEraInfo

Defined in: [api/client/types.ts:266](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L266)

A conglomeration of staking storage related to the active era

#### Properties

##### activeEra

> **activeEra**: `BigNumber`

Defined in: [api/client/types.ts:270](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L270)

The active era. This is the era whose rewards and slashes are being processed and may lag the current era

##### activeEraStart

> **activeEraStart**: `BigNumber`

Defined in: [api/client/types.ts:274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L274)

The block in which the active era began

##### currentEra

> **currentEra**: `BigNumber`

Defined in: [api/client/types.ts:278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L278)

The current era

##### plannedSession

> **plannedSession**: `BigNumber`

Defined in: [api/client/types.ts:282](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L282)

The planned session number. A session is a subdivision of an era

##### totalStaked

> **totalStaked**: `BigNumber`

Defined in: [api/client/types.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L286)

The total amount of POLYX staked

***

### SubmissionDetails

Defined in: [api/client/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L49)

#### Properties

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L50)

##### result

> **result**: `ISubmittableResult`

Defined in: [api/client/types.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L56)

The raw result of the transaction. Contains event data for the transaction

##### transactionHash

> **transactionHash**: `string`

Defined in: [api/client/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L52)

##### transactionIndex

> **transactionIndex**: `BigNumber`

Defined in: [api/client/types.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L51)

## Type Aliases

### CustomClaimType

> **CustomClaimType** = `object`

Defined in: [api/client/types.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L210)

CustomClaimType

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/client/types.ts:212](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L212)

##### name

> **name**: `string`

Defined in: [api/client/types.ts:211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L211)

***

### CustomClaimTypeWithDid

> **CustomClaimTypeWithDid** = [`CustomClaimType`](../wiki/#customclaimtype) & `object`

Defined in: [api/client/types.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L218)

CustomClaimType with DID that registered the CustomClaimType

#### Type Declaration

##### did?

> `optional` **did?**: `string`
