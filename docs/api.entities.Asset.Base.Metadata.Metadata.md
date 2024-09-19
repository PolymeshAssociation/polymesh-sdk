# Class: Metadata

[api/entities/Asset/Base/Metadata](../wiki/api.entities.Asset.Base.Metadata).Metadata

Handles all Asset Metadata related functionality

## Hierarchy

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`Metadata`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Base.Metadata.Metadata#get)
- [getDetails](../wiki/api.entities.Asset.Base.Metadata.Metadata#getdetails)
- [getOne](../wiki/api.entities.Asset.Base.Metadata.Metadata#getone)
- [register](../wiki/api.entities.Asset.Base.Metadata.Metadata#register)

## Methods

### get

▸ **get**(): `Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)[]\>

Retrieve all (global + local) the MetadataEntry for this Asset

#### Returns

`Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)[]\>

**`Note`**

this returns all available metadata entries for this Asset, with or without any value being associated with the metadata

#### Defined in

[api/entities/Asset/Base/Metadata/index.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Metadata/index.ts#L71)

___

### getDetails

▸ **getDetails**(): `Promise`\<[`MetadataWithValue`](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)[]\>

Retrieve all (local + global) the MetadataEntry details whose value is set for this Asset

#### Returns

`Promise`\<[`MetadataWithValue`](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)[]\>

#### Defined in

[api/entities/Asset/Base/Metadata/index.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Metadata/index.ts#L182)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>

Retrieve a single MetadataEntry by its ID and type

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |
| `args.type` | [`MetadataType`](../wiki/api.entities.MetadataEntry.types.MetadataType) |

#### Returns

`Promise`\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>

**`Throws`**

if there is no MetadataEntry with the passed ID and specified type

#### Defined in

[api/entities/Asset/Base/Metadata/index.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Metadata/index.ts#L117)

___

### register

▸ **register**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

Register a metadata for this Asset and optionally set its value.
The metadata value can be set by passing `value` parameter and specifying other optional `details` about the value

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterMetadataParams`](../wiki/api.procedures.types#registermetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

**`Note`**

This registers a metadata of type `Local`

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [register.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Metadata/index.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Metadata/index.ts#L62)
