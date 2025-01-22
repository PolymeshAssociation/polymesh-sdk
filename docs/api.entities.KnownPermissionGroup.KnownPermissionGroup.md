# Class: KnownPermissionGroup

[api/entities/KnownPermissionGroup](../wiki/api.entities.KnownPermissionGroup).KnownPermissionGroup

Represents a pre-defined group of permissions for an Asset

## Hierarchy

- [`PermissionGroup`](../wiki/api.entities.PermissionGroup.PermissionGroup)

  ↳ **`KnownPermissionGroup`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#asset)
- [type](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#type)
- [uuid](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#uuid)

### Methods

- [exists](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#exists)
- [getPermissions](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#getpermissions)
- [isEqual](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#isequal)
- [toHuman](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#tohuman)
- [generateUuid](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#generateuuid)
- [unserialize](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup#unserialize)

## Properties

### asset

• **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

Asset for which this group specifies permissions

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[asset](../wiki/api.entities.PermissionGroup.PermissionGroup#asset)

#### Defined in

[api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/PermissionGroup.ts#L19)

___

### type

• **type**: [`PermissionGroupType`](../wiki/api.entities.types.PermissionGroupType)

#### Defined in

[api/entities/KnownPermissionGroup.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/KnownPermissionGroup.ts#L34)

___

### uuid

• **uuid**: `string`

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[uuid](../wiki/api.entities.PermissionGroup.PermissionGroup#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Known Permission Group exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[exists](../wiki/api.entities.PermissionGroup.PermissionGroup#exists)

#### Defined in

[api/entities/KnownPermissionGroup.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/KnownPermissionGroup.ts#L94)

___

### getPermissions

▸ **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Retrieve the Permissions associated with this Permission Group

#### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[getPermissions](../wiki/api.entities.PermissionGroup.PermissionGroup#getpermissions)

#### Defined in

[api/entities/KnownPermissionGroup.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/KnownPermissionGroup.ts#L50)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[isEqual](../wiki/api.entities.PermissionGroup.PermissionGroup#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L61)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.KnownPermissionGroup.HumanReadable)

Return the KnownPermissionGroup's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.KnownPermissionGroup.HumanReadable)

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[toHuman](../wiki/api.entities.PermissionGroup.PermissionGroup#tohuman)

#### Defined in

[api/entities/KnownPermissionGroup.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/KnownPermissionGroup.ts#L101)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[generateUuid](../wiki/api.entities.PermissionGroup.PermissionGroup#generateuuid)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[unserialize](../wiki/api.entities.PermissionGroup.PermissionGroup#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L23)
