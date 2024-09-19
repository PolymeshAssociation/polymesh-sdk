# Class: Schedules

[api/entities/Asset/Fungible/Checkpoints/Schedules](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules).Schedules

Handles all Asset Checkpoint Schedules related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Schedules`**

## Table of contents

### Methods

- [create](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules#create)
- [get](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules#get)
- [getOne](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules#getone)
- [maxComplexity](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules#maxcomplexity)
- [remove](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules#remove)

## Methods

### create

▸ **create**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule), [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule)\>\>

Create a schedule for Checkpoint creation (e.g. "Create a checkpoint every week for 5 weeks, starting next tuesday")

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateCheckpointScheduleParams`](../wiki/api.procedures.types.CreateCheckpointScheduleParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule), [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule)\>\>

**`Note`**

⚠️ Chain v6 introduces changes in how checkpoints are created. Only a set amount of points can be specified, infinitely repeating schedules are deprecated

**`Note`**

due to chain limitations, schedules are advanced and (if appropriate) executed whenever the Asset is
  redeemed, issued or transferred between portfolios. This means that on an Asset without much movement, there may be disparities between intended Checkpoint creation dates
  and the actual date when they are created. This, however, has no effect on the Checkpoint's accuracy regarding to balances

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/Schedules.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L57)

___

### get

▸ **get**(): `Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types.ScheduleWithDetails)[]\>

Retrieve all active Checkpoint Schedules

#### Returns

`Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types.ScheduleWithDetails)[]\>

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/Schedules.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L94)

___

### getOne

▸ **getOne**(`«destructured»`): `Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types.ScheduleWithDetails)\>

Retrieve a single Checkpoint Schedule associated to this Asset by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `id` | `BigNumber` |

#### Returns

`Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types.ScheduleWithDetails)\>

**`Throws`**

if there is no Schedule with the passed ID

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/Schedules.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L76)

___

### maxComplexity

▸ **maxComplexity**(): `Promise`\<`BigNumber`\>

Retrieve the maximum allowed Schedule complexity for this Asset

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/Schedules.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L137)

___

### remove

▸ **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove the supplied Checkpoint Schedule for a given Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveCheckpointScheduleParams`](../wiki/api.procedures.types.RemoveCheckpointScheduleParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/Schedules.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L67)
