# Interface: PortfolioBalance

[api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types).PortfolioBalance

## Hierarchy

- [`Balance`](../wiki/api.entities.Account.types.Balance)

  ↳ **`PortfolioBalance`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.Portfolio.types.PortfolioBalance#asset)
- [free](../wiki/api.entities.Portfolio.types.PortfolioBalance#free)
- [locked](../wiki/api.entities.Portfolio.types.PortfolioBalance#locked)
- [total](../wiki/api.entities.Portfolio.types.PortfolioBalance#total)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

#### Defined in

[api/entities/Portfolio/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L8)

___

### free

• **free**: `BigNumber`

balance available for transferring and paying fees

#### Inherited from

[Balance](../wiki/api.entities.Account.types.Balance).[free](../wiki/api.entities.Account.types.Balance#free)

#### Defined in

[api/entities/Account/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L11)

___

### locked

• **locked**: `BigNumber`

unavailable balance, either bonded for staking or locked for some other purpose

#### Inherited from

[Balance](../wiki/api.entities.Account.types.Balance).[locked](../wiki/api.entities.Account.types.Balance#locked)

#### Defined in

[api/entities/Account/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L15)

___

### total

• **total**: `BigNumber`

free + locked

#### Inherited from

[Balance](../wiki/api.entities.Account.types.Balance).[total](../wiki/api.entities.Account.types.Balance#total)

#### Defined in

[api/entities/Account/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L19)
