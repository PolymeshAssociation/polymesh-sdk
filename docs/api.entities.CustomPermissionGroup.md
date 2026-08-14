[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CustomPermissionGroup

# api/entities/CustomPermissionGroup

## Classes

### CustomPermissionGroup

Defined in: [api/entities/CustomPermissionGroup.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L33)

Represents a group of custom permissions for an Asset

#### Extends

- [`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup)

#### Properties

##### asset

> **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)

Defined in: [api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/PermissionGroup.ts#L19)

Asset for which this group specifies permissions

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`asset`](../wiki/api.entities.PermissionGroup#asset)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CustomPermissionGroup.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L44)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`uuid`](../wiki/api.entities.PermissionGroup#uuid)

#### Methods

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/CustomPermissionGroup.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L106)

Determine whether this Custom Permission Group exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`exists`](../wiki/api.entities.PermissionGroup#exists)

##### getPermissions()

> **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Defined in: [api/entities/CustomPermissionGroup.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L70)

Retrieve the list of permissions and transaction groups associated with this Permission Group

###### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`getPermissions`](../wiki/api.entities.PermissionGroup#getpermissions)

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`isEqual`](../wiki/api.entities.PermissionGroup#isequal)

##### setPermissions()

> **setPermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/CustomPermissionGroup.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L65)

Modify the group's permissions

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetGroupPermissionsParams`](../wiki/api.procedures.types#setgrouppermissionsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setPermissions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/CustomPermissionGroup.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L120)

Return the Group's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`toHuman`](../wiki/api.entities.PermissionGroup#tohuman)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`generateUuid`](../wiki/api.entities.PermissionGroup#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`unserialize`](../wiki/api.entities.PermissionGroup#unserialize)

## Interfaces

### HumanReadable

Defined in: [api/entities/CustomPermissionGroup.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L20)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CustomPermissionGroup.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L22)

##### id

> **id**: `string`

Defined in: [api/entities/CustomPermissionGroup.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L21)

***

### UniqueIdentifiers

Defined in: [api/entities/CustomPermissionGroup.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L25)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CustomPermissionGroup.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L27)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CustomPermissionGroup.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CustomPermissionGroup.ts#L26)
