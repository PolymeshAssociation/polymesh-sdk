# Class: Metadata

[api/entities/Asset/Base/Metadata](../wiki/api.entities.Asset.Base.Metadata).Metadata

Handles all Asset Metadata related functionality

## Hierarchy

- `Namespace`<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`Metadata`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Base.Metadata.Metadata#get)
- [getOne](../wiki/api.entities.Asset.Base.Metadata.Metadata#getone)
- [register](../wiki/api.entities.Asset.Base.Metadata.Metadata#register)

## Methods

### get

▸ **get**(): `Promise`<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)[]\>

Retrieve all the MetadataEntry for this Asset

#### Returns

`Promise`<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)[]\>

___

### getOne

▸ **getOne**(`args`): `Promise`<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>

Retrieve a single MetadataEntry by its ID and type

**`Throws`**

 if there is no MetadataEntry with the passed ID and specified type

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |
| `args.type` | [`MetadataType`](../wiki/api.entities.MetadataEntry.types.MetadataType) |

#### Returns

`Promise`<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>

___

### register

▸ **register**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

Register a metadata for this Asset and optionally set its value.
The metadata value can be set by passing `value` parameter and specifying other optional `details` about the value

**`Note`**

 This registers a metadata of type `Local`

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [register.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterMetadataParams`](../wiki/api.procedures.types#registermetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>
