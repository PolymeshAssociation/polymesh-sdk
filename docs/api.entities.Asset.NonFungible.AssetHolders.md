[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/NonFungible/AssetHolders

# api/entities/Asset/NonFungible/AssetHolders

## Classes

### AssetHolders

Defined in: [api/entities/Asset/NonFungible/AssetHolders/index.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/NonFungible/AssetHolders/index.ts#L13)

Handles all NFT Holders related functionality

#### Extends

- `Namespace`\<[`NftCollection`](../wiki/api.entities.types#nftcollection)\>

#### Methods

##### get()

> **get**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityHeldNfts`](../wiki/api.entities.Asset.types#identityheldnfts)\>\>

Defined in: [api/entities/Asset/NonFungible/AssetHolders/index.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/NonFungible/AssetHolders/index.ts#L19)

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
