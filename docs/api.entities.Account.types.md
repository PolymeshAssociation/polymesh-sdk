[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/types

# api/entities/Account/types

## Enumerations

### AccountIdentityRelation

Defined in: [api/entities/Account/types.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L80)

Represents the how an Account is associated to an Identity

#### Enumeration Members

##### MultiSigSigner

> **MultiSigSigner**: `"MultiSigSigner"`

Defined in: [api/entities/Account/types.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L96)

The Account is one of many signers for a MultiSig

##### Primary

> **Primary**: `"Primary"`

Defined in: [api/entities/Account/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L88)

The Account is the Identity's primary key (i.e. it has full permission)

##### Secondary

> **Secondary**: `"Secondary"`

Defined in: [api/entities/Account/types.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L92)

The Account is a Secondary account. There are associated permissions that may limit what transactions it may authorize for the Identity

##### Unassigned

> **Unassigned**: `"Unassigned"`

Defined in: [api/entities/Account/types.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L84)

The Account is not associated to any Identity

***

### AccountKeyType

Defined in: [api/entities/Account/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L62)

Distinguishes MultiSig and Smart Contract accounts

#### Enumeration Members

##### MultiSig

> **MultiSig**: `"MultiSig"`

Defined in: [api/entities/Account/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L70)

Account is a MultiSig. (i.e. multiple signatures are required to authorize transactions)

##### Normal

> **Normal**: `""`

Defined in: [api/entities/Account/types.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L66)

Account is a standard type (e.g. corresponds to the public key of a sr25519 pair)

##### SmartContract

> **SmartContract**: `"SmartContract"`

Defined in: [api/entities/Account/types.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L74)

Account represents a smart contract

## Interfaces

### AccountBalance

Defined in: [api/entities/Account/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L25)

POLYX balance of an Account

#### Properties

##### free

> **free**: `BigNumber`

Defined in: [api/entities/Account/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L34)

balance that is guaranteed to be spendable on transfers and transaction fees. Calculated according
  to the chain's rules as `chain free - max(frozen - reserved, existential deposit)`

###### Note

this differs from the chain's raw `free` value, which still includes frozen funds. The
  existential deposit (0.000001 POLYX) is always treated as unspendable, so this value is a
  lower bound on what the Account can spend without risk of the transaction failing

##### frozen

> **frozen**: `BigNumber`

Defined in: [api/entities/Account/types.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L56)

minimum balance (out of `total`) that must remain in the Account due to freezes/locks.
  Frozen funds may overlap with `reserved` funds. Corresponds to the chain's raw `frozen` value

##### locked

> **locked**: `BigNumber`

Defined in: [api/entities/Account/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L40)

balance that is unavailable for spending. Made up of funds on hold (`reserved`, e.g. bonded for
  staking), frozen funds not covered by holds (`frozen`) and the existential
  deposit. Always equal to `total - free`

##### reserved

> **reserved**: `BigNumber`

Defined in: [api/entities/Account/types.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L51)

balance placed on hold by the protocol, e.g. POLYX bonded for staking. Held funds are not part
  of the chain's `free` balance and cannot be spent until released (e.g. unbonded and withdrawn).
  Corresponds to the chain's raw `reserved` value

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L45)

total balance owned by the Account, including unavailable funds. Equal to the chain's
  `free + reserved`, and to `free + locked` as returned here

***

### AccountTypeInfo

Defined in: [api/entities/Account/types.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L102)

The type of account, and its relation to an Identity

#### Properties

##### keyType

> **keyType**: [`AccountKeyType`](../wiki/#accountkeytype)

Defined in: [api/entities/Account/types.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L106)

The type of Account

##### relation

> **relation**: [`AccountIdentityRelation`](../wiki/#accountidentityrelation)

Defined in: [api/entities/Account/types.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L110)

How or if the account is associated to an Identity

***

### ActiveEraInfo

Defined in: [api/entities/Account/types.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L168)

#### Properties

##### index

> **index**: `BigNumber`

Defined in: [api/entities/Account/types.ts:178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L178)

The era number

###### Note

an era is roughly 1 day on most chains (dev chains may have shorter eras)

##### start

> **start**: `BigNumber`

Defined in: [api/entities/Account/types.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L172)

The block number in which this era became active

***

### Balance

Defined in: [api/entities/Account/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L7)

#### Extended by

- [`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)

#### Properties

##### free

> **free**: `BigNumber`

Defined in: [api/entities/Account/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L11)

balance available for transferring

##### locked

> **locked**: `BigNumber`

Defined in: [api/entities/Account/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L15)

unavailable balance, locked for some purpose (e.g. pending settlement instructions)

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L19)

free + locked

***

### HistoricPolyxTransaction

Defined in: [api/entities/Account/types.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L113)

#### Extends

- [`EventIdentifier`](../wiki/api.client.types#eventidentifier)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/entities/Account/types.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L135)

##### blockDate

> **blockDate**: `Date`

Defined in: [api/client/types.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L182)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockDate`](../wiki/api.client.types#blockdate)

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L181)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockHash`](../wiki/api.client.types#blockhash)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/client/types.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L180)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockNumber`](../wiki/api.client.types#blocknumber)

##### callId

> **callId**: [`CallIdEnum`](../wiki/types#callidenum) \| `undefined`

Defined in: [api/entities/Account/types.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L143)

##### eventId

> **eventId**: [`EventIdEnum`](../wiki/types#eventidenum)

Defined in: [api/entities/Account/types.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L145)

##### eventIndex

> **eventIndex**: `BigNumber`

Defined in: [api/client/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/types.ts#L183)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`eventIndex`](../wiki/api.client.types#eventindex)

##### extrinsicIdx

> **extrinsicIdx**: `BigNumber` \| `undefined`

Defined in: [api/entities/Account/types.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L141)

##### fromAccount

> **fromAccount**: [`Account`](../wiki/api.entities.Account#account) \| `undefined`

Defined in: [api/entities/Account/types.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L123)

Account from which the POLYX transaction has been initiated/deducted in case of a transfer.

###### Note

this can be null in cases where some balance are endowed/transferred from treasury

##### fromIdentity

> **fromIdentity**: [`Identity`](../wiki/api.entities.Identity#identity) \| `undefined`

Defined in: [api/entities/Account/types.ts:118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L118)

Identity from which the POLYX transaction has been initiated/deducted in case of a transfer.

###### Note

this can be null in cases where some balance are endowed/transferred from treasury

##### memo

> **memo**: `string` \| `undefined`

Defined in: [api/entities/Account/types.ts:140](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L140)

identifier string to help differentiate transfers

##### moduleId

> **moduleId**: [`ModuleIdEnum`](../wiki/types#moduleidenum)

Defined in: [api/entities/Account/types.ts:144](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L144)

##### toAccount

> **toAccount**: [`Account`](../wiki/api.entities.Account#account) \| `undefined`

Defined in: [api/entities/Account/types.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L133)

Account in which the POLYX amount was deposited.

###### Note

this can be null in case when account balance was burned

##### toIdentity

> **toIdentity**: [`Identity`](../wiki/api.entities.Identity#identity) \| `undefined`

Defined in: [api/entities/Account/types.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L128)

Identity in which the POLYX amount was deposited.

###### Note

this can be null in case when account balance was burned

##### type

> **type**: [`BalanceTypeEnum`](../wiki/types#balancetypeenum)

Defined in: [api/entities/Account/types.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L136)

***

### StakingCommission

Defined in: [api/entities/Account/types.ts:202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L202)

#### Properties

##### account

> **account**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L206)

The account of the validator

##### blocked

> **blocked**: `boolean`

Defined in: [api/entities/Account/types.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L216)

`true` if the validator has been blocked

##### commission

> **commission**: `BigNumber`

Defined in: [api/entities/Account/types.ts:211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L211)

The commission as a percentage (0-100)

***

### StakingLedger

Defined in: [api/entities/Account/types.ts:186](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L186)

#### Properties

##### active

> **active**: `BigNumber`

Defined in: [api/entities/Account/types.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L189)

##### claimedRewards

> **claimedRewards**: `BigNumber`[]

Defined in: [api/entities/Account/types.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L191)

##### stash

> **stash**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L187)

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L188)

##### unlocking

> **unlocking**: [`StakingUnlockingEntry`](../wiki/#stakingunlockingentry)[]

Defined in: [api/entities/Account/types.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L190)

***

### StakingNomination

Defined in: [api/entities/Account/types.ts:148](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L148)

#### Properties

##### submittedInEra

> **submittedInEra**: `BigNumber`

Defined in: [api/entities/Account/types.ts:158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L158)

The era in which the nomination was submitted

###### Note

nominations only effect future eras (1 era is approximately 1 day)

##### suppressed

> **suppressed**: `boolean`

Defined in: [api/entities/Account/types.ts:165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L165)

Nominations maybe suppressed if they fail to meet the minimum bond or validators are over subscribed

###### Note

nominations are rarely suppressed on Polymesh

##### targets

> **targets**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/Account/types.ts:152](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L152)

The nominated validators

***

### StakingPayee

Defined in: [api/entities/Account/types.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L194)

#### Properties

##### account

> **account**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:195](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L195)

##### autoStaked

> **autoStaked**: `boolean`

Defined in: [api/entities/Account/types.ts:199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L199)

If true then rewards will be auto staked

***

### StakingUnlockingEntry

Defined in: [api/entities/Account/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L181)

#### Properties

##### era

> **era**: `BigNumber`

Defined in: [api/entities/Account/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L183)

##### value

> **value**: `BigNumber`

Defined in: [api/entities/Account/types.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L182)
