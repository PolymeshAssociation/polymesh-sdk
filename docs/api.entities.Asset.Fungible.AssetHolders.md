[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/AssetHolders

# api/entities/Asset/Fungible/AssetHolders

## Classes

### AssetHolders

Defined in: [api/entities/Asset/Fungible/AssetHolders/index.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/AssetHolders/index.ts#L11)

Handles all Asset Holders related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### get()

> **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityBalance`](../wiki/api.entities.Asset.types#identitybalance)\>\>

Defined in: [api/entities/Asset/Fungible/AssetHolders/index.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/AssetHolders/index.ts#L17)

Retrieve all the Asset Holders with their respective balance

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityBalance`](../wiki/api.entities.Asset.types#identitybalance)\>\>

###### Note

supports pagination
