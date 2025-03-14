# Class: CustomPermissionGroup

[api/entities/CustomPermissionGroup](../wiki/api.entities.CustomPermissionGroup).CustomPermissionGroup

Represents a group of custom permissions for an Asset

## Hierarchy

- [`PermissionGroup`](../wiki/api.entities.PermissionGroup.PermissionGroup)

  ↳ **`CustomPermissionGroup`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#asset)
- [id](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#id)
- [uuid](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#uuid)

### Methods

- [exists](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#exists)
- [getPermissions](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#getpermissions)
- [isEqual](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#isequal)
- [setPermissions](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#setpermissions)
- [toHuman](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#tohuman)
- [generateUuid](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#generateuuid)
- [unserialize](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup#unserialize)

## Properties

### asset

• **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

Asset for which this group specifies permissions

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[asset](../wiki/api.entities.PermissionGroup.PermissionGroup#asset)

#### Defined in

[api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/PermissionGroup.ts#L19)

___

### id

• **id**: `BigNumber`

#### Defined in

[api/entities/CustomPermissionGroup.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/CustomPermissionGroup.ts#L39)

___

### uuid

• **uuid**: `string`

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[uuid](../wiki/api.entities.PermissionGroup.PermissionGroup#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Custom Permission Group exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[exists](../wiki/api.entities.PermissionGroup.PermissionGroup#exists)

#### Defined in

[api/entities/CustomPermissionGroup.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/CustomPermissionGroup.ts#L103)

___

### getPermissions

▸ **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Retrieve the list of permissions and transaction groups associated with this Permission Group

#### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[getPermissions](../wiki/api.entities.PermissionGroup.PermissionGroup#getpermissions)

#### Defined in

[api/entities/CustomPermissionGroup.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/CustomPermissionGroup.ts#L70)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### setPermissions

▸ **setPermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify the group's permissions

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetGroupPermissionsParams`](../wiki/api.procedures.types.SetGroupPermissionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setPermissions.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/CustomPermissionGroup.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/CustomPermissionGroup.ts#L63)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.CustomPermissionGroup.HumanReadable)

Return the Group's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.CustomPermissionGroup.HumanReadable)

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[toHuman](../wiki/api.entities.PermissionGroup.PermissionGroup#tohuman)

#### Defined in

[api/entities/CustomPermissionGroup.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/CustomPermissionGroup.ts#L117)

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

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

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

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
