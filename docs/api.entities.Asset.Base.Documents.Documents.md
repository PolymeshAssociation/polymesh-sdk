# Class: Documents

[api/entities/Asset/Base/Documents](../wiki/api.entities.Asset.Base.Documents).Documents

Handles all Asset Document related functionality

## Hierarchy

- `Namespace`<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`Documents`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Base.Documents.Documents#get)
- [set](../wiki/api.entities.Asset.Base.Documents.Documents#set)

## Methods

### get

▸ **get**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`AssetDocument`](../wiki/types.AssetDocument)\>\>

Retrieve all documents linked to the Asset

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`AssetDocument`](../wiki/types.AssetDocument)\>\>

___

### set

▸ **set**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Assign a new list of documents to the Asset by replacing the existing list of documents with the ones passed in the parameters

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetAssetDocumentsParams`](../wiki/api.procedures.types.SetAssetDocumentsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
