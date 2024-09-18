# Interface: Balance

[types](../wiki/types).Balance

## Hierarchy

- **`Balance`**

  ↳ [`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)

## Table of contents

### Properties

- [free](../wiki/types.Balance#free)
- [locked](../wiki/types.Balance#locked)
- [total](../wiki/types.Balance#total)

## Properties

### free

• **free**: `BigNumber`

balance available for transferring and paying fees

#### Defined in

[types/index.ts:763](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L763)

___

### locked

• **locked**: `BigNumber`

unavailable balance, either bonded for staking or locked for some other purpose

#### Defined in

[types/index.ts:767](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L767)

___

### total

• **total**: `BigNumber`

free + locked

#### Defined in

[types/index.ts:771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L771)
