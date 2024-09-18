# Enumeration: StatType

[types](../wiki/types).StatType

Represents the StatType from the `statistics` module.

**`Note`**

 the chain doesn't use "Scoped" types, but they are needed here to discriminate the input instead of having an optional input

## Table of contents

### Enumeration Members

- [Balance](../wiki/types.StatType#balance)
- [Count](../wiki/types.StatType#count)
- [ScopedBalance](../wiki/types.StatType#scopedbalance)
- [ScopedCount](../wiki/types.StatType#scopedcount)

## Enumeration Members

### Balance

• **Balance** = ``"Balance"``

#### Defined in

[types/index.ts:357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L357)

___

### Count

• **Count** = ``"Count"``

#### Defined in

[types/index.ts:356](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L356)

___

### ScopedBalance

• **ScopedBalance** = ``"ScopedBalance"``

ScopedPercentage is an SDK only type, on chain it is `Balance` with a claimType option present

#### Defined in

[types/index.ts:365](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L365)

___

### ScopedCount

• **ScopedCount** = ``"ScopedCount"``

ScopedCount is an SDK only type, on chain it is `Count` with a claimType option present

#### Defined in

[types/index.ts:361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L361)
