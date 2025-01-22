# Class: MetadataEntry

[api/entities/MetadataEntry](../wiki/api.entities.MetadataEntry).MetadataEntry

Represents an Asset MetadataEntry in the Polymesh blockchain

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.MetadataEntry.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)\>

  ↳ **`MetadataEntry`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.MetadataEntry.MetadataEntry#asset)
- [id](../wiki/api.entities.MetadataEntry.MetadataEntry#id)
- [type](../wiki/api.entities.MetadataEntry.MetadataEntry#type)
- [uuid](../wiki/api.entities.MetadataEntry.MetadataEntry#uuid)

### Methods

- [clear](../wiki/api.entities.MetadataEntry.MetadataEntry#clear)
- [details](../wiki/api.entities.MetadataEntry.MetadataEntry#details)
- [exists](../wiki/api.entities.MetadataEntry.MetadataEntry#exists)
- [isEqual](../wiki/api.entities.MetadataEntry.MetadataEntry#isequal)
- [isModifiable](../wiki/api.entities.MetadataEntry.MetadataEntry#ismodifiable)
- [remove](../wiki/api.entities.MetadataEntry.MetadataEntry#remove)
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

[api/entities/MetadataEntry/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L50)

___

### id

• **id**: `BigNumber`

identifier number of the MetadataEntry

#### Defined in

[api/entities/MetadataEntry/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L60)

___

### type

• **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types.MetadataType)

Type of metadata represented by this instance

#### Defined in

[api/entities/MetadataEntry/index.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L55)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L46)

## Methods

### clear

▸ **clear**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Removes the asset metadata value

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

- if the Metadata doesn't exists
  - if the Metadata value is locked

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [clear.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/MetadataEntry/index.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L120)

___

### details

▸ **details**(): `Promise`\<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)\>

Retrieve name and specs for this MetadataEntry

#### Returns

`Promise`\<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)\>

#### Defined in

[api/entities/MetadataEntry/index.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L145)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this MetadataEntry exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/MetadataEntry/index.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L221)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L61)

___

### isModifiable

▸ **isModifiable**(): `Promise`\<\{ `canModify`: `boolean` ; `reason?`: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)  }\>

Check if the MetadataEntry can be modified.
A MetadataEntry is modifiable if it exists and is not locked

#### Returns

`Promise`\<\{ `canModify`: `boolean` ; `reason?`: [`PolymeshError`](../wiki/base.PolymeshError.PolymeshError)  }\>

#### Defined in

[api/entities/MetadataEntry/index.ts:254](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L254)

___

### remove

▸ **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Removes a local Asset Metadata key along with its value

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

A global Metadata key cannot be deleted

**`Throws`**

- if the Metadata type is global
  - if the Metadata doesn't exists
  - if the Metadata value is locked
  - if the Metadata is a mandatory key for any NFT Collection

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/MetadataEntry/index.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L138)

___

### set

▸ **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

Assign new value for the MetadataEntry along with its details or optionally only set the details (expiry + lock status) of any Metadata value

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetMetadataParams`](../wiki/api.procedures.types#setmetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry), [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)\>\>

**`Note`**

- Value or the details can only be set if the MetadataEntry is not locked

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/MetadataEntry/index.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L106)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)

Return the MetadataEntry's ID, Asset ticker and Metadata type

#### Returns

[`HumanReadable`](../wiki/api.entities.MetadataEntry.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/MetadataEntry/index.ts:317](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L317)

___

### value

▸ **value**(): `Promise`\<``null`` \| [`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue)\>

Retrieve the value and details (expiry + lock status) for this MetadataEntry

#### Returns

`Promise`\<``null`` \| [`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue)\>

**`Note`**

- This returns `null` if no value is yet specified for this MetadataEntry

#### Defined in

[api/entities/MetadataEntry/index.ts:192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/index.ts#L192)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

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

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

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

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L23)
