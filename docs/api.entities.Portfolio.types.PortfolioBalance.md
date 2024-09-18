# Interface: PortfolioBalance

[api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types).PortfolioBalance

## Hierarchy

- [`Balance`](../wiki/types.Balance)

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

[api/entities/Portfolio/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Portfolio/types.ts#L9)

___

### free

• **free**: `BigNumber`

balance available for transferring and paying fees

#### Inherited from

[Balance](../wiki/types.Balance).[free](../wiki/types.Balance#free)

#### Defined in

[types/index.ts:763](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L763)

___

### locked

• **locked**: `BigNumber`

unavailable balance, either bonded for staking or locked for some other purpose

#### Inherited from

[Balance](../wiki/types.Balance).[locked](../wiki/types.Balance#locked)

#### Defined in

[types/index.ts:767](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L767)

___

### total

• **total**: `BigNumber`

free + locked

#### Inherited from

[Balance](../wiki/types.Balance).[total](../wiki/types.Balance#total)

#### Defined in

[types/index.ts:771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L771)
