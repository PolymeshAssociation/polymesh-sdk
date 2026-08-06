[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/KnownPermissionGroup

# api/entities/KnownPermissionGroup

## Classes

### KnownPermissionGroup

Defined in: [api/entities/KnownPermissionGroup.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L27)

Represents a pre-defined group of permissions for an Asset

#### Extends

- [`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup)

#### Properties

##### asset

> **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)

Defined in: [api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L19)

Asset for which this group specifies permissions

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`asset`](../wiki/api.entities.PermissionGroup#asset)

##### type

> **type**: [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype)

Defined in: [api/entities/KnownPermissionGroup.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L38)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`uuid`](../wiki/api.entities.PermissionGroup#uuid)

#### Methods

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/KnownPermissionGroup.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L103)

Determine whether this Known Permission Group exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`exists`](../wiki/api.entities.PermissionGroup#exists)

##### getPermissions()

> **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Defined in: [api/entities/KnownPermissionGroup.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L54)

Retrieve the Permissions associated with this Permission Group

###### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`getPermissions`](../wiki/api.entities.PermissionGroup#getpermissions)

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`isEqual`](../wiki/api.entities.PermissionGroup#isequal)

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/KnownPermissionGroup.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L110)

Return the KnownPermissionGroup's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup).[`toHuman`](../wiki/api.entities.PermissionGroup#tohuman)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L14)

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

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L23)

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

Defined in: [api/entities/KnownPermissionGroup.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L14)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/KnownPermissionGroup.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L16)

##### type

> **type**: [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype)

Defined in: [api/entities/KnownPermissionGroup.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L15)

***

### UniqueIdentifiers

Defined in: [api/entities/KnownPermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L19)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/KnownPermissionGroup.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L21)

##### type

> **type**: [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype)

Defined in: [api/entities/KnownPermissionGroup.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/KnownPermissionGroup.ts#L20)
