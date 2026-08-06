[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/MetadataEntry

# api/entities/MetadataEntry

## Classes

### MetadataEntry

Defined in: [api/entities/MetadataEntry/index.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L45)

Represents an Asset MetadataEntry in the Polymesh blockchain

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### asset

> **asset**: [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)

Defined in: [api/entities/MetadataEntry/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L49)

Asset for which this is the metadata

##### id

> **id**: `BigNumber`

Defined in: [api/entities/MetadataEntry/index.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L59)

identifier number of the MetadataEntry

##### type

> **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype)

Defined in: [api/entities/MetadataEntry/index.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L54)

Type of metadata represented by this instance

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### clear()

> **clear**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/MetadataEntry/index.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L111)

Removes the asset metadata value

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

- if the Metadata doesn't exists
  - if the Metadata value is locked

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [clear.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

> **details**(): `Promise`\<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types#metadatadetails)\>

Defined in: [api/entities/MetadataEntry/index.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L129)

Retrieve name and specs for this MetadataEntry

###### Returns

`Promise`\<[`MetadataDetails`](../wiki/api.entities.MetadataEntry.types#metadatadetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/MetadataEntry/index.ts:205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L205)

Determine whether this MetadataEntry exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

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

##### isModifiable()

> **isModifiable**(): `Promise`\<\{ `canModify`: `boolean`; `reason?`: [`PolymeshError`](../wiki/base.PolymeshError#polymesherror); \}\>

Defined in: [api/entities/MetadataEntry/index.ts:238](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L238)

Check if the MetadataEntry can be modified.
A MetadataEntry is modifiable if it exists and is not locked

###### Returns

`Promise`\<\{ `canModify`: `boolean`; `reason?`: [`PolymeshError`](../wiki/base.PolymeshError#polymesherror); \}\>

##### remove()

> **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/MetadataEntry/index.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L124)

Removes a local Asset Metadata key along with its value

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

A global Metadata key cannot be deleted

###### Throws

- if the Metadata type is global
  - if the Metadata doesn't exists
  - if the Metadata value is locked
  - if the Metadata is a mandatory key for any NFT Collection

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### set()

> **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/#metadataentry), [`MetadataEntry`](../wiki/#metadataentry)\>\>

Defined in: [api/entities/MetadataEntry/index.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L102)

Assign new value for the MetadataEntry along with its details or optionally only set the details (expiry + lock status) of any Metadata value

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetMetadataParams`](../wiki/api.procedures.types#setmetadataparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MetadataEntry`](../wiki/#metadataentry), [`MetadataEntry`](../wiki/#metadataentry)\>\>

###### Note

- Value or the details can only be set if the MetadataEntry is not locked

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/MetadataEntry/index.ts:301](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L301)

Return the MetadataEntry's ID, Asset ticker and Metadata type

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### value()

> **value**(): `Promise`\<[`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue) \| `null`\>

Defined in: [api/entities/MetadataEntry/index.ts:176](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L176)

Retrieve the value and details (expiry + lock status) for this MetadataEntry

###### Returns

`Promise`\<[`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue) \| `null`\>

###### Note

- This returns `null` if no value is yet specified for this MetadataEntry

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

### HumanReadable

Defined in: [api/entities/MetadataEntry/index.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L36)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/MetadataEntry/index.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L38)

##### id

> **id**: `string`

Defined in: [api/entities/MetadataEntry/index.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L37)

##### type

> **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype)

Defined in: [api/entities/MetadataEntry/index.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L39)

***

### UniqueIdentifiers

Defined in: [api/entities/MetadataEntry/index.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L30)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/MetadataEntry/index.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L33)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/MetadataEntry/index.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L32)

##### type

> **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype)

Defined in: [api/entities/MetadataEntry/index.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MetadataEntry/index.ts#L31)
