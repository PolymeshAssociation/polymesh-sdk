# Class: Documents

[api/entities/Asset/Base/Documents](../wiki/api.entities.Asset.Base.Documents).Documents

Handles all Asset Document related functionality

## Hierarchy

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`Documents`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Base.Documents.Documents#get)
- [set](../wiki/api.entities.Asset.Base.Documents.Documents#set)

## Methods

### get

▸ **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AssetDocument`](../wiki/api.entities.Asset.types.AssetDocument)\>\>

Retrieve all documents linked to the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AssetDocument`](../wiki/api.entities.Asset.types.AssetDocument)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Asset/Base/Documents/index.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/Documents/index.ts#L47)

___

### set

▸ **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Assign a new list of documents to the Asset by replacing the existing list of documents with the ones passed in the parameters

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetAssetDocumentsParams`](../wiki/api.procedures.types.SetAssetDocumentsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Documents/index.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/Documents/index.ts#L38)
