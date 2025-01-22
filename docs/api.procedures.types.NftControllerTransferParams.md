# Interface: NftControllerTransferParams

[api/procedures/types](../wiki/api.procedures.types).NftControllerTransferParams

## Table of contents

### Properties

- [destinationPortfolio](../wiki/api.procedures.types.NftControllerTransferParams#destinationportfolio)
- [nfts](../wiki/api.procedures.types.NftControllerTransferParams#nfts)
- [originPortfolio](../wiki/api.procedures.types.NftControllerTransferParams#originportfolio)

## Properties

### destinationPortfolio

• `Optional` **destinationPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Optional portfolio (or portfolio ID) to which NFTs will be transferred to. Defaults to default. If specified it must be one of the callers own portfolios

#### Defined in

[api/procedures/types.ts:1135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1135)

___

### nfts

• **nfts**: (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft))[]

The NFTs to transfer

#### Defined in

[api/procedures/types.ts:1130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1130)

___

### originPortfolio

• **originPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

portfolio (or portfolio ID) from which NFTs will be transferred from

#### Defined in

[api/procedures/types.ts:1126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1126)
