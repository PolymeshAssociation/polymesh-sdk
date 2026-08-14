[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Metadata

# api/entities/Asset/Base/Metadata

## Classes

### Metadata

Defined in: [api/entities/Asset/Base/Metadata/index.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Metadata/index.ts#L37)

Handles all Asset Metadata related functionality

#### Extends

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)\>

#### Methods

##### get()

> **get**(): `Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)[]\>

Defined in: [api/entities/Asset/Base/Metadata/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Metadata/index.ts#L63)

Retrieve all (global + local) the MetadataEntry for this Asset

###### Returns

`Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)[]\>

###### Note

this returns all available metadata entries for this Asset, with or without any value being associated with the metadata

##### getDetails()

> **getDetails**(): `Promise`\<[`MetadataWithValue`](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)[]\>

Defined in: [api/entities/Asset/Base/Metadata/index.ts:177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Metadata/index.ts#L177)

Retrieve all (local + global) the MetadataEntry details whose value is set for this Asset

###### Returns

`Promise`\<[`MetadataWithValue`](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)[]\>

##### getOne()

> **getOne**(`args`): `Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)\>

Defined in: [api/entities/Asset/Base/Metadata/index.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Metadata/index.ts#L109)

Retrieve a single MetadataEntry by its ID and type

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; `type`: [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype); \} |
| `args.id` | `BigNumber` |
| `args.type` | [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype) |

###### Returns

`Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)\>

###### Throws

if there is no MetadataEntry with the passed ID and specified type

##### register()

> **register**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)\>\>

Defined in: [api/entities/Asset/Base/Metadata/index.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Metadata/index.ts#L56)

Register a metadata for this Asset and optionally set its value.
The metadata value can be set by passing `value` parameter and specifying other optional `details` about the value

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RegisterMetadataParams`](../wiki/api.procedures.types#registermetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)\>\>

###### Note

This registers a metadata of type `Local`

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [register.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
