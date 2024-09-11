# Class: AssetHolders

[api/entities/Asset/NonFungible/AssetHolders](../wiki/api.entities.Asset.NonFungible.AssetHolders).AssetHolders

Handles all NFT Holders related functionality

## Hierarchy

- `Namespace`\<[`NftCollection`](../wiki/api.entities.types#nftcollection)\>

  ↳ **`AssetHolders`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.NonFungible.AssetHolders.AssetHolders#get)

## Methods

### get

▸ **get**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityHeldNfts`](../wiki/api.entities.Asset.types.IdentityHeldNfts)\>\>

Retrieve all the NFT Holders with their holdings

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityHeldNfts`](../wiki/api.entities.Asset.types.IdentityHeldNfts)\>\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Asset/NonFungible/AssetHolders/index.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/NonFungible/AssetHolders/index.ts#L19)
