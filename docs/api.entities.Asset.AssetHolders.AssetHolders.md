# Class: AssetHolders

[api/entities/Asset/AssetHolders](../wiki/api.entities.Asset.AssetHolders).AssetHolders

Handles all Asset Holders related functionality

## Hierarchy

- `Namespace`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

  ↳ **`AssetHolders`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.AssetHolders.AssetHolders#get)

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
