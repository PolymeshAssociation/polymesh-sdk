# Interface: Balance

[api/entities/Account/types](../wiki/api.entities.Account.types).Balance

## Hierarchy

- **`Balance`**

  ↳ [`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)

## Table of contents

### Properties

- [free](../wiki/api.entities.Account.types.Balance#free)
- [locked](../wiki/api.entities.Account.types.Balance#locked)
- [total](../wiki/api.entities.Account.types.Balance#total)

## Properties

### free

• **free**: `BigNumber`

balance available for transferring and paying fees

#### Defined in

[api/entities/Account/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Account/types.ts#L11)

___

### locked

• **locked**: `BigNumber`

unavailable balance, either bonded for staking or locked for some other purpose

#### Defined in

[api/entities/Account/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Account/types.ts#L15)

___

### total

• **total**: `BigNumber`

free + locked

#### Defined in

[api/entities/Account/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Account/types.ts#L19)
