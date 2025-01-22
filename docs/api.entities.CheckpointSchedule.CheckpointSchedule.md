# Class: CheckpointSchedule

[api/entities/CheckpointSchedule](../wiki/api.entities.CheckpointSchedule).CheckpointSchedule

Represents a Checkpoint Schedule for an Asset. Schedules can be set up to create Checkpoints at regular intervals

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.CheckpointSchedule.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.CheckpointSchedule.HumanReadable)\>

  ↳ **`CheckpointSchedule`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#asset)
- [expiryDate](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#expirydate)
- [id](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#id)
- [pendingPoints](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#pendingpoints)
- [uuid](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#uuid)

### Methods

- [details](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#details)
- [exists](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#exists)
- [getCheckpoints](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#getcheckpoints)
- [isEqual](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#isequal)
- [toHuman](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#tohuman)
- [generateUuid](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#generateuuid)
- [unserialize](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule#unserialize)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset for which Checkpoints are scheduled

#### Defined in

[api/entities/CheckpointSchedule/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L57)

___

### expiryDate

• **expiryDate**: `Date`

date at which the last Checkpoint will be created with this Schedule.

#### Defined in

[api/entities/CheckpointSchedule/index.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L67)

___

### id

• **id**: `BigNumber`

schedule identifier number

#### Defined in

[api/entities/CheckpointSchedule/index.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L52)

___

### pendingPoints

• **pendingPoints**: `Date`[]

dates in the future where checkpoints are schedule to be created

#### Defined in

[api/entities/CheckpointSchedule/index.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L62)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L46)

## Methods

### details

▸ **details**(): `Promise`\<[`ScheduleDetails`](../wiki/api.entities.CheckpointSchedule.types.ScheduleDetails)\>

Retrieve information specific to this Schedule

#### Returns

`Promise`\<[`ScheduleDetails`](../wiki/api.entities.CheckpointSchedule.types.ScheduleDetails)\>

#### Defined in

[api/entities/CheckpointSchedule/index.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L89)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Checkpoint Schedule exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/CheckpointSchedule/index.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L160)

___

### getCheckpoints

▸ **getCheckpoints**(): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)[]\>

Retrieve all Checkpoints created by this Schedule

#### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)[]\>

#### Defined in

[api/entities/CheckpointSchedule/index.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L127)

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

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.CheckpointSchedule.HumanReadable)

Return the Schedule's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.CheckpointSchedule.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/CheckpointSchedule/index.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CheckpointSchedule/index.ts#L185)

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
