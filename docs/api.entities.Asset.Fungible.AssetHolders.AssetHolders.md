# Class: AssetHolders

[api/entities/Asset/Fungible/AssetHolders](../wiki/api.entities.Asset.Fungible.AssetHolders).AssetHolders

Handles all Asset Holders related functionality

## Hierarchy

- `Namespace`<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`AssetHolders`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Fungible.AssetHolders.AssetHolders#get)

## Methods

### get

▸ **get**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>

Retrieve all the Asset Holders with their respective balance

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>
