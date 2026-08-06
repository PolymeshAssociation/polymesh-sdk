[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/types

# api/entities/Account/types

## Enumerations

### AccountIdentityRelation

Defined in: [api/entities/Account/types.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L82)

Represents the how an Account is associated to an Identity

#### Enumeration Members

##### MultiSigSigner

> **MultiSigSigner**: `"MultiSigSigner"`

Defined in: [api/entities/Account/types.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L98)

The Account is one of many signers for a MultiSig

##### Primary

> **Primary**: `"Primary"`

Defined in: [api/entities/Account/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L90)

The Account is the Identity's primary key (i.e. it has full permission)

##### Secondary

> **Secondary**: `"Secondary"`

Defined in: [api/entities/Account/types.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L94)

The Account is a Secondary account. There are associated permissions that may limit what transactions it may authorize for the Identity

##### Unassigned

> **Unassigned**: `"Unassigned"`

Defined in: [api/entities/Account/types.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L86)

The Account is not associated to any Identity

***

### AccountKeyType

Defined in: [api/entities/Account/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L64)

Distinguishes MultiSig and Smart Contract accounts

#### Enumeration Members

##### MultiSig

> **MultiSig**: `"MultiSig"`

Defined in: [api/entities/Account/types.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L72)

Account is a MultiSig. (i.e. multiple signatures are required to authorize transactions)

##### Normal

> **Normal**: `""`

Defined in: [api/entities/Account/types.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L68)

Account is a standard type (e.g. corresponds to the public key of a sr25519 pair)

##### SmartContract

> **SmartContract**: `"SmartContract"`

Defined in: [api/entities/Account/types.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L76)

Account represents a smart contract

## Interfaces

### AccountBalance

Defined in: [api/entities/Account/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L25)

POLYX balance of an Account

#### Properties

##### free

> **free**: `BigNumber`

Defined in: [api/entities/Account/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L34)

balance that is guaranteed to be spendable on transfers and transaction fees. Calculated according
  to the chain's rules as `chain free - max(frozen - reserved, existential deposit)`

###### Note

this differs from the chain's raw `free` value, which still includes frozen funds. The
  existential deposit (0.000001 POLYX) is always treated as unspendable, so this value is a
  lower bound on what the Account can spend without risk of the transaction failing

##### frozen

> **frozen**: `BigNumber`

Defined in: [api/entities/Account/types.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L58)

minimum balance (out of `total`) that must remain in the Account due to freezes/locks.
  Frozen funds may overlap with `reserved` funds. Corresponds to the chain's raw `frozen` value

###### Note

on v7 chains this is the maximum of the chain's `miscFrozen` and `feeFrozen` values

##### locked

> **locked**: `BigNumber`

Defined in: [api/entities/Account/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L40)

balance that is unavailable for spending. Made up of funds on hold (`reserved`, e.g. bonded for
  staking), frozen funds not covered by holds (`frozen`) and the existential
  deposit. Always equal to `total - free`

##### reserved

> **reserved**: `BigNumber`

Defined in: [api/entities/Account/types.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L51)

balance placed on hold by the protocol, e.g. POLYX bonded for staking. Held funds are not part
  of the chain's `free` balance and cannot be spent until released (e.g. unbonded and withdrawn).
  Corresponds to the chain's raw `reserved` value

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L45)

total balance owned by the Account, including unavailable funds. Equal to the chain's
  `free + reserved`, and to `free + locked` as returned here

***

### AccountTypeInfo

Defined in: [api/entities/Account/types.ts:104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L104)

The type of account, and its relation to an Identity

#### Properties

##### keyType

> **keyType**: [`AccountKeyType`](../wiki/#accountkeytype)

Defined in: [api/entities/Account/types.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L108)

The type of Account

##### relation

> **relation**: [`AccountIdentityRelation`](../wiki/#accountidentityrelation)

Defined in: [api/entities/Account/types.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L112)

How or if the account is associated to an Identity

***

### ActiveEraInfo

Defined in: [api/entities/Account/types.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L170)

#### Properties

##### index

> **index**: `BigNumber`

Defined in: [api/entities/Account/types.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L180)

The era number

###### Note

an era is roughly 1 day on most chains (dev chains may have shorter eras)

##### start

> **start**: `BigNumber`

Defined in: [api/entities/Account/types.ts:174](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L174)

The block number in which this era became active

***

### Balance

Defined in: [api/entities/Account/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L7)

#### Extended by

- [`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)

#### Properties

##### free

> **free**: `BigNumber`

Defined in: [api/entities/Account/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L11)

balance available for transferring

##### locked

> **locked**: `BigNumber`

Defined in: [api/entities/Account/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L15)

unavailable balance, locked for some purpose (e.g. pending settlement instructions)

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L19)

free + locked

***

### HistoricPolyxTransaction

Defined in: [api/entities/Account/types.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L115)

#### Extends

- [`EventIdentifier`](../wiki/api.client.types#eventidentifier)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/entities/Account/types.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L137)

##### blockDate

> **blockDate**: `Date`

Defined in: [api/client/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/types.ts#L183)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockDate`](../wiki/api.client.types#blockdate)

##### blockHash

> **blockHash**: `string`

Defined in: [api/client/types.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/types.ts#L182)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockHash`](../wiki/api.client.types#blockhash)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/client/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/types.ts#L181)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`blockNumber`](../wiki/api.client.types#blocknumber)

##### callId

> **callId**: [`CallIdEnum`](../wiki/types#callidenum) \| `undefined`

Defined in: [api/entities/Account/types.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L145)

##### eventId

> **eventId**: [`EventIdEnum`](../wiki/types#eventidenum)

Defined in: [api/entities/Account/types.ts:147](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L147)

##### eventIndex

> **eventIndex**: `BigNumber`

Defined in: [api/client/types.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/types.ts#L184)

###### Inherited from

[`EventIdentifier`](../wiki/api.client.types#eventidentifier).[`eventIndex`](../wiki/api.client.types#eventindex)

##### extrinsicIdx

> **extrinsicIdx**: `BigNumber` \| `undefined`

Defined in: [api/entities/Account/types.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L143)

##### fromAccount

> **fromAccount**: [`Account`](../wiki/api.entities.Account#account) \| `undefined`

Defined in: [api/entities/Account/types.ts:125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L125)

Account from which the POLYX transaction has been initiated/deducted in case of a transfer.

###### Note

this can be null in cases where some balance are endowed/transferred from treasury

##### fromIdentity

> **fromIdentity**: [`Identity`](../wiki/api.entities.Identity#identity) \| `undefined`

Defined in: [api/entities/Account/types.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L120)

Identity from which the POLYX transaction has been initiated/deducted in case of a transfer.

###### Note

this can be null in cases where some balance are endowed/transferred from treasury

##### memo

> **memo**: `string` \| `undefined`

Defined in: [api/entities/Account/types.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L142)

identifier string to help differentiate transfers

##### moduleId

> **moduleId**: [`ModuleIdEnum`](../wiki/types#moduleidenum)

Defined in: [api/entities/Account/types.ts:146](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L146)

##### toAccount

> **toAccount**: [`Account`](../wiki/api.entities.Account#account) \| `undefined`

Defined in: [api/entities/Account/types.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L135)

Account in which the POLYX amount was deposited.

###### Note

this can be null in case when account balance was burned

##### toIdentity

> **toIdentity**: [`Identity`](../wiki/api.entities.Identity#identity) \| `undefined`

Defined in: [api/entities/Account/types.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L130)

Identity in which the POLYX amount was deposited.

###### Note

this can be null in case when account balance was burned

##### type

> **type**: [`BalanceTypeEnum`](../wiki/types#balancetypeenum)

Defined in: [api/entities/Account/types.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L138)

***

### StakingCommission

Defined in: [api/entities/Account/types.ts:204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L204)

#### Properties

##### account

> **account**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L208)

The account of the validator

##### blocked

> **blocked**: `boolean`

Defined in: [api/entities/Account/types.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L218)

`true` if the validator has been blocked

##### commission

> **commission**: `BigNumber`

Defined in: [api/entities/Account/types.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L213)

The commission as a percentage (0-100)

***

### StakingLedger

Defined in: [api/entities/Account/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L188)

#### Properties

##### active

> **active**: `BigNumber`

Defined in: [api/entities/Account/types.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L191)

##### claimedRewards

> **claimedRewards**: `BigNumber`[]

Defined in: [api/entities/Account/types.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L193)

##### stash

> **stash**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L189)

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L190)

##### unlocking

> **unlocking**: [`StakingUnlockingEntry`](../wiki/#stakingunlockingentry)[]

Defined in: [api/entities/Account/types.ts:192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L192)

***

### StakingNomination

Defined in: [api/entities/Account/types.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L150)

#### Properties

##### submittedInEra

> **submittedInEra**: `BigNumber`

Defined in: [api/entities/Account/types.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L160)

The era in which the nomination was submitted

###### Note

nominations only effect future eras (1 era is approximately 1 day)

##### suppressed

> **suppressed**: `boolean`

Defined in: [api/entities/Account/types.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L167)

Nominations maybe suppressed if they fail to meet the minimum bond or validators are over subscribed

###### Note

nominations are rarely suppressed on Polymesh

##### targets

> **targets**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/Account/types.ts:154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L154)

The nominated validators

***

### StakingPayee

Defined in: [api/entities/Account/types.ts:196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L196)

#### Properties

##### account

> **account**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Account/types.ts:197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L197)

##### autoStaked

> **autoStaked**: `boolean`

Defined in: [api/entities/Account/types.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L201)

If true then rewards will be auto staked

***

### StakingUnlockingEntry

Defined in: [api/entities/Account/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L183)

#### Properties

##### era

> **era**: `BigNumber`

Defined in: [api/entities/Account/types.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L185)

##### value

> **value**: `BigNumber`

Defined in: [api/entities/Account/types.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/types.ts#L184)
