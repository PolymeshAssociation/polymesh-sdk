# Class: MetadataEntry

[api/entities/MetadataEntry](../wiki/api.entities.MetadataEntry).MetadataEntry

Represents an Asset MetadataEntry in the Polymesh blockchain

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<[`UniqueIdentifiers`](../wiki/api.entities.MetadataEntry.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)\>

  ↳ **`MetadataEntry`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.MetadataEntry.MetadataEntry#asset)
- [id](../wiki/api.entities.MetadataEntry.MetadataEntry#id)
- [type](../wiki/api.entities.MetadataEntry.MetadataEntry#type)
- [uuid](../wiki/api.entities.MetadataEntry.MetadataEntry#uuid)

### Methods

- [details](../wiki/api.entities.MetadataEntry.MetadataEntry#details)
- [exists](../wiki/api.entities.MetadataEntry.MetadataEntry#exists)
- [isEqual](../wiki/api.entities.MetadataEntry.MetadataEntry#isequal)
- [set](../wiki/api.entities.MetadataEntry.MetadataEntry#set)
- [toHuman](../wiki/api.entities.MetadataEntry.MetadataEntry#tohuman)
- [value](../wiki/api.entities.MetadataEntry.MetadataEntry#value)
- [generateUuid](../wiki/api.entities.MetadataEntry.MetadataEntry#generateuuid)
- [unserialize](../wiki/api.entities.MetadataEntry.MetadataEntry#unserialize)

## Properties

### asset

• **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

Asset for which this is the metadata

#### Defined in

[api/entities/MetadataEntry/index.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/index.ts#L37)

___

### id

• **id**: `BigNumber`

identifier number of the MetadataEntry

#### Defined in

[api/entities/MetadataEntry/index.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/index.ts#L47)

___

### type

• **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types.MetadataType)

Type of metadata represented by this instance

#### Defined in

[api/entities/MetadataEntry/index.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/index.ts#L42)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### details

▸ **details**(): `Promise`<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)\>

Retrieve name and specs for this MetadataEntry

#### Returns

`Promise`<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)\>

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this MetadataEntry exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

___

### set

▸ **set**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

Assign new value for the MetadataEntry along with its details or optionally only set the details (expiry + lock status) of any Metadata value

**`Note`**

 - Value or the details can only be set if the MetadataEntry is not locked

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetMetadataParams`](../wiki/api.procedures.types#setmetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)

Return the MetadataEntry's ID, Asset ticker and Metadata type

#### Returns

[`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

___

### value

▸ **value**(): `Promise`<``null`` \| [`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue)\>

Retrieve the value and details (expiry + lock status) for this MetadataEntry

**`Note`**

 - This returns `null` if no value is yet specified for this MetadataEntry

#### Returns

`Promise`<``null`` \| [`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue)\>

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)
