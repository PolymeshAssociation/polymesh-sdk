[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Checkpoints/types

# api/entities/Asset/Fungible/Checkpoints/types

## Enumerations

### CaCheckpointType

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:5](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L5)

#### Enumeration Members

##### Existing

> **Existing**: `"Existing"`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L6)

##### Schedule

> **Schedule**: `"Schedule"`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L7)

## Interfaces

### NextCheckpoints

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L40)

#### Properties

##### nextAt

> **nextAt**: `Date`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L44)

closest upcoming Checkpoint creation date across all of the Asset's active Schedules

##### schedules

> **schedules**: [`ScheduleNextCheckpoint`](../wiki/#schedulenextcheckpoint)[]

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L52)

next Checkpoint creation date for each active Schedule

##### totalPending

> **totalPending**: `BigNumber`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L48)

total amount of pending Checkpoints across all of the Asset's active Schedules

***

### ScheduleNextCheckpoint

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L29)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L33)

identifier for the Checkpoint Schedule

##### nextAt

> **nextAt**: `Date`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L37)

next Checkpoint creation date for this Schedule

## Type Aliases

### InputCaCheckpoint

> **InputCaCheckpoint** = [`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `Date` \| \{ `id`: `BigNumber`; `type`: [`Existing`](../wiki/#existing); \} \| \{ `id`: `BigNumber`; `type`: [`Schedule`](../wiki/#schedule); \}

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L10)

#### Union Members

[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)

***

[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)

***

`Date`

***

##### Type Literal

\{ `id`: `BigNumber`; `type`: [`Existing`](../wiki/#existing); \}

###### id

> **id**: `BigNumber`

identifier for an existing Checkpoint

###### type

> **type**: [`Existing`](../wiki/#existing)

***

##### Type Literal

\{ `id`: `BigNumber`; `type`: [`Schedule`](../wiki/#schedule); \}

###### id

> **id**: `BigNumber`

identifier for a Checkpoint Schedule

###### type

> **type**: [`Schedule`](../wiki/#schedule)
