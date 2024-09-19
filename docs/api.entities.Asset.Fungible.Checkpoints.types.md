# Module: api/entities/Asset/Fungible/Checkpoints/types

## Table of contents

### Enumerations

- [CaCheckpointType](../wiki/api.entities.Asset.Fungible.Checkpoints.types.CaCheckpointType)

### Type Aliases

- [InputCaCheckpoint](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint)

## Type Aliases

### InputCaCheckpoint

Ƭ **InputCaCheckpoint**: [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| `Date` \| \{ `id`: `BigNumber` ; `type`: [`Existing`](../wiki/api.entities.Asset.Fungible.Checkpoints.types.CaCheckpointType#existing)  } \| \{ `id`: `BigNumber` ; `type`: [`Schedule`](../wiki/api.entities.Asset.Fungible.Checkpoints.types.CaCheckpointType#schedule)  }

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/types.ts#L10)
