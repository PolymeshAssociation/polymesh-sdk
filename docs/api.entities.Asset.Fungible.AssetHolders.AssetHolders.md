# Class: AssetHolders

[api/entities/Asset/Fungible/AssetHolders](../wiki/api.entities.Asset.Fungible.AssetHolders).AssetHolders

Handles all Asset Holders related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`AssetHolders`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Fungible.AssetHolders.AssetHolders#get)

## Methods

### get

▸ **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>

Retrieve all the Asset Holders with their respective balance

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Asset/Fungible/AssetHolders/index.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/AssetHolders/index.ts#L17)
