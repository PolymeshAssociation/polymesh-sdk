[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/NonFungible/AssetHolders

# api/entities/Asset/NonFungible/AssetHolders

## Classes

### AssetHolders

Defined in: [api/entities/Asset/NonFungible/AssetHolders/index.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/AssetHolders/index.ts#L13)

Handles all NFT Holders related functionality

#### Extends

- `Namespace`\<[`NftCollection`](../wiki/api.entities.types#nftcollection)\>

#### Methods

##### get()

> **get**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityHeldNfts`](../wiki/api.entities.Asset.types#identityheldnfts)\>\>

Defined in: [api/entities/Asset/NonFungible/AssetHolders/index.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/AssetHolders/index.ts#L19)

Retrieve all the NFT Holders with their holdings

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityHeldNfts`](../wiki/api.entities.Asset.types#identityheldnfts)\>\>

###### Note

uses the middlewareV2
