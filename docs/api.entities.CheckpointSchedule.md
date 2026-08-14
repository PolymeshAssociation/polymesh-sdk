[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CheckpointSchedule

# api/entities/CheckpointSchedule

## Classes

### CheckpointSchedule

Defined in: [api/entities/CheckpointSchedule/index.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L34)

Represents a Checkpoint Schedule for an Asset. Schedules can be set up to create Checkpoints at regular intervals

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/CheckpointSchedule/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L53)

Asset for which Checkpoints are scheduled

##### expiryDate

> **expiryDate**: `Date`

Defined in: [api/entities/CheckpointSchedule/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L63)

date at which the last Checkpoint will be created with this Schedule.

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CheckpointSchedule/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L48)

schedule identifier number

##### pendingPoints

> **pendingPoints**: `Date`[]

Defined in: [api/entities/CheckpointSchedule/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L58)

dates in the future where checkpoints are schedule to be created

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### details()

> **details**(): `Promise`\<[`ScheduleDetails`](../wiki/api.entities.CheckpointSchedule.types#scheduledetails)\>

Defined in: [api/entities/CheckpointSchedule/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L85)

Retrieve information specific to this Schedule

###### Returns

`Promise`\<[`ScheduleDetails`](../wiki/api.entities.CheckpointSchedule.types#scheduledetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/CheckpointSchedule/index.ts:165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L165)

Determine whether this Checkpoint Schedule exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getCheckpoints()

> **getCheckpoints**(): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)[]\>

Defined in: [api/entities/CheckpointSchedule/index.ts:132](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L132)

Retrieve all Checkpoints created by this Schedule

###### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)[]\>

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/CheckpointSchedule/index.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L190)

Return the Schedule's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### HumanReadable

Defined in: [api/entities/CheckpointSchedule/index.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L18)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CheckpointSchedule/index.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L20)

##### expiryDate

> **expiryDate**: `string` \| `null`

Defined in: [api/entities/CheckpointSchedule/index.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L22)

##### id

> **id**: `string`

Defined in: [api/entities/CheckpointSchedule/index.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L19)

##### pendingPoints

> **pendingPoints**: `string`[]

Defined in: [api/entities/CheckpointSchedule/index.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L21)

***

### Params

Defined in: [api/entities/CheckpointSchedule/index.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L25)

#### Properties

##### pendingPoints

> **pendingPoints**: `Date`[]

Defined in: [api/entities/CheckpointSchedule/index.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L26)

***

### UniqueIdentifiers

Defined in: [api/entities/CheckpointSchedule/index.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L13)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CheckpointSchedule/index.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L15)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CheckpointSchedule/index.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CheckpointSchedule/index.ts#L14)
