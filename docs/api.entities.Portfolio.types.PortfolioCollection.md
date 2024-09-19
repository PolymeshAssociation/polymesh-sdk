# Interface: PortfolioCollection

[api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types).PortfolioCollection

## Table of contents

### Properties

- [collection](../wiki/api.entities.Portfolio.types.PortfolioCollection#collection)
- [free](../wiki/api.entities.Portfolio.types.PortfolioCollection#free)
- [locked](../wiki/api.entities.Portfolio.types.PortfolioCollection#locked)
- [total](../wiki/api.entities.Portfolio.types.PortfolioCollection#total)

## Properties

### collection

• **collection**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

#### Defined in

[api/entities/Portfolio/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L12)

___

### free

• **free**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)[]

NFTs available for transferring

#### Defined in

[api/entities/Portfolio/types.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L16)

___

### locked

• **locked**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)[]

NFTs that are locked, such as being involved in a pending instruction

#### Defined in

[api/entities/Portfolio/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L20)

___

### total

• **total**: `BigNumber`

Total number of NFTs held for a collection

#### Defined in

[api/entities/Portfolio/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L24)
