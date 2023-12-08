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

• **asset**: [`Asset`](../wiki/api.entities.Asset.Asset)

Asset for which this group specifies permissions

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[asset](../wiki/api.entities.PermissionGroup.PermissionGroup#asset)

#### Defined in

[api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/PermissionGroup.ts#L19)

___

### id

• **id**: `BigNumber`

#### Defined in

[api/entities/CustomPermissionGroup.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CustomPermissionGroup.ts#L39)

___

### uuid

• **uuid**: `string`

#### Inherited from

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[uuid](../wiki/api.entities.PermissionGroup.PermissionGroup#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this Custom Permission Group exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[exists](../wiki/api.entities.PermissionGroup.PermissionGroup#exists)

___

### getPermissions

▸ **getPermissions**(): `Promise`<[`GroupPermissions`](../wiki/types#grouppermissions)\>

Retrieve the list of permissions and transaction groups associated with this Permission Group

#### Returns

`Promise`<[`GroupPermissions`](../wiki/types#grouppermissions)\>

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[getPermissions](../wiki/api.entities.PermissionGroup.PermissionGroup#getpermissions)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[isEqual](../wiki/api.entities.PermissionGroup.PermissionGroup#isequal)

___

### setPermissions

▸ **setPermissions**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Modify the group's permissions

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [setPermissions.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetGroupPermissionsParams`](../wiki/api.procedures.types.SetGroupPermissionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.CustomPermissionGroup.HumanReadable)

Return the Group's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.CustomPermissionGroup.HumanReadable)

#### Overrides

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[toHuman](../wiki/api.entities.PermissionGroup.PermissionGroup#tohuman)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[generateUuid](../wiki/api.entities.PermissionGroup.PermissionGroup#generateuuid)

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

[PermissionGroup](../wiki/api.entities.PermissionGroup.PermissionGroup).[unserialize](../wiki/api.entities.PermissionGroup.PermissionGroup#unserialize)
