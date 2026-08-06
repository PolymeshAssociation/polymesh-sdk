[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Checkpoints/types

# api/entities/Asset/Fungible/Checkpoints/types

## Enumerations

### CaCheckpointType

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:5](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L5)

#### Enumeration Members

##### Existing

> **Existing**: `"Existing"`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L6)

##### Schedule

> **Schedule**: `"Schedule"`

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L7)

## Type Aliases

### InputCaCheckpoint

> **InputCaCheckpoint** = [`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `Date` \| \{ `id`: `BigNumber`; `type`: [`Existing`](../wiki/#existing); \} \| \{ `id`: `BigNumber`; `type`: [`Schedule`](../wiki/#schedule); \}

Defined in: [api/entities/Asset/Fungible/Checkpoints/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L10)

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
