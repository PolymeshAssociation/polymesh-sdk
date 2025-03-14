# Class: PermissionGroup

[api/entities/PermissionGroup](../wiki/api.entities.PermissionGroup).PermissionGroup

Represents a group of permissions for an Asset

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.PermissionGroup.UniqueIdentifiers), `unknown`\>

  ↳ **`PermissionGroup`**

  ↳↳ [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)

  ↳↳ [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)

## Table of contents

### Properties

- [asset](../wiki/api.entities.PermissionGroup.PermissionGroup#asset)
- [uuid](../wiki/api.entities.PermissionGroup.PermissionGroup#uuid)

### Methods

- [exists](../wiki/api.entities.PermissionGroup.PermissionGroup#exists)
- [getPermissions](../wiki/api.entities.PermissionGroup.PermissionGroup#getpermissions)
- [isEqual](../wiki/api.entities.PermissionGroup.PermissionGroup#isequal)
- [toHuman](../wiki/api.entities.PermissionGroup.PermissionGroup#tohuman)
- [generateUuid](../wiki/api.entities.PermissionGroup.PermissionGroup#generateuuid)
- [isUniqueIdentifiers](../wiki/api.entities.PermissionGroup.PermissionGroup#isuniqueidentifiers)
- [unserialize](../wiki/api.entities.PermissionGroup.PermissionGroup#unserialize)

## Properties

### asset

• **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

Asset for which this group specifies permissions

#### Defined in

[api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/PermissionGroup.ts#L19)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ `Abstract` **exists**(): `Promise`\<`boolean`\>

Determine whether this Entity exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Entity.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L68)

___

### getPermissions

▸ `Abstract` **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Retrieve the Permissions associated with this Permission Group

#### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

#### Defined in

[api/entities/PermissionGroup.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/PermissionGroup.ts#L35)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### toHuman

▸ `Abstract` **toHuman**(): `unknown`

Returns Entity data in a human readable (JSON) format

#### Returns

`unknown`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Entity.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L73)

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

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

___

### isUniqueIdentifiers

▸ `Static` **isUniqueIdentifiers**(`identifiers`): `boolean`

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `identifiers` | `unknown` | object to type check |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isUniqueIdentifiers](../wiki/api.entities.Entity.Entity#isuniqueidentifiers)

#### Defined in

[api/entities/Entity.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L42)

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

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
