[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/PermissionGroup

# api/entities/PermissionGroup

## Classes

### `abstract` PermissionGroup

Defined in: [api/entities/PermissionGroup.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L15)

Represents a group of permissions for an Asset

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `unknown`\>

#### Extended by

- [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup)
- [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)

#### Properties

##### asset

> **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)

Defined in: [api/entities/PermissionGroup.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L19)

Asset for which this group specifies permissions

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### exists()

> `abstract` **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Entity.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L68)

Determine whether this Entity exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getPermissions()

> `abstract` **getPermissions**(): `Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

Defined in: [api/entities/PermissionGroup.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L35)

Retrieve the Permissions associated with this Permission Group

###### Returns

`Promise`\<[`GroupPermissions`](../wiki/api.entities.types#grouppermissions)\>

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### toHuman()

> `abstract` **toHuman**(): `unknown`

Defined in: [api/entities/Entity.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L73)

Returns Entity data in a human readable (JSON) format

###### Returns

`unknown`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

##### isUniqueIdentifiers()

> `static` **isUniqueIdentifiers**(`identifiers`): `boolean`

Defined in: [api/entities/Entity.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L42)

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `unknown` | object to type check |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isUniqueIdentifiers`](../wiki/api.entities.Entity#isuniqueidentifiers)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### UniqueIdentifiers

Defined in: [api/entities/PermissionGroup.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L6)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/PermissionGroup.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L7)

##### id?

> `optional` **id?**: `BigNumber`

Defined in: [api/entities/PermissionGroup.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L8)

##### type?

> `optional` **type?**: [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype)

Defined in: [api/entities/PermissionGroup.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/PermissionGroup.ts#L9)
