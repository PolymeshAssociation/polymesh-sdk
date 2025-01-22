# Enumeration: StatType

[api/entities/types](../wiki/api.entities.types).StatType

Represents the StatType from the `statistics` module.

**`Note`**

the chain doesn't use "Scoped" types, but they are needed here to discriminate the input instead of having an optional input

## Table of contents

### Enumeration Members

- [Balance](../wiki/api.entities.types.StatType#balance)
- [Count](../wiki/api.entities.types.StatType#count)
- [ScopedBalance](../wiki/api.entities.types.StatType#scopedbalance)
- [ScopedCount](../wiki/api.entities.types.StatType#scopedcount)

## Enumeration Members

### Balance

• **Balance** = ``"Balance"``

#### Defined in

[api/entities/types.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L288)

___

### Count

• **Count** = ``"Count"``

#### Defined in

[api/entities/types.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L287)

___

### ScopedBalance

• **ScopedBalance** = ``"ScopedBalance"``

ScopedPercentage is an SDK only type, on chain it is `Balance` with a claimType option present

#### Defined in

[api/entities/types.ts:296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L296)

___

### ScopedCount

• **ScopedCount** = ``"ScopedCount"``

ScopedCount is an SDK only type, on chain it is `Count` with a claimType option present

#### Defined in

[api/entities/types.ts:292](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L292)
