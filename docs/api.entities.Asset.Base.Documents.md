[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Documents

# api/entities/Asset/Base/Documents

## Classes

### Documents

Defined in: [api/entities/Asset/Base/Documents/index.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Documents/index.ts#L24)

Handles all Asset Document related functionality

#### Extends

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)\>

#### Methods

##### add()

> **add**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Documents/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Documents/index.ts#L57)

Add documents to the Asset's existing list of documents

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddAssetDocumentsParams`](../wiki/api.procedures.types#addassetdocumentsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [add.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)\>\>

Defined in: [api/entities/Asset/Base/Documents/index.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Documents/index.ts#L70)

Retrieve all documents linked to the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)\>\>

###### Note

supports pagination

###### Note

returns documents with their on-chain IDs which can be used with the `remove` method

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Documents/index.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Documents/index.ts#L62)

Remove specific documents from the Asset by their IDs

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveAssetDocumentsParams`](../wiki/api.procedures.types#removeassetdocumentsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### set()

> **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Documents/index.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Documents/index.ts#L52)

Assign a new list of documents to the Asset by replacing the existing list of documents with the ones passed in the parameters

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetAssetDocumentsParams`](../wiki/api.procedures.types#setassetdocumentsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this removes all existing documents and adds the new ones

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
