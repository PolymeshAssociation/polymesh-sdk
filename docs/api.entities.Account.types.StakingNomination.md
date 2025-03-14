# Interface: StakingNomination

[api/entities/Account/types](../wiki/api.entities.Account.types).StakingNomination

## Table of contents

### Properties

- [submittedInEra](../wiki/api.entities.Account.types.StakingNomination#submittedinera)
- [suppressed](../wiki/api.entities.Account.types.StakingNomination#suppressed)
- [targets](../wiki/api.entities.Account.types.StakingNomination#targets)

## Properties

### submittedInEra

• **submittedInEra**: `BigNumber`

The era in which the nomination was submitted

**`Note`**

nominations only effect future eras (1 era is approximately 1 day)

#### Defined in

[api/entities/Account/types.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/types.ts#L123)

___

### suppressed

• **suppressed**: `boolean`

Nominations maybe suppressed if they fail to meet the minimum bond or validators are over subscribed

**`Note`**

nominations are rarely suppressed on Polymesh

#### Defined in

[api/entities/Account/types.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/types.ts#L130)

___

### targets

• **targets**: [`Account`](../wiki/api.entities.Account.Account)[]

The nominated validators

#### Defined in

[api/entities/Account/types.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/types.ts#L117)
