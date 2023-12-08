# Class: Checkpoints

[api/entities/Asset/Checkpoints](../wiki/api.entities.Asset.Checkpoints).Checkpoints

Handles all Asset Checkpoints related functionality

## Hierarchy

- `Namespace`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

  ↳ **`Checkpoints`**

## Table of contents

### Properties

- [schedules](../wiki/api.entities.Asset.Checkpoints.Checkpoints#schedules)

### Methods

- [create](../wiki/api.entities.Asset.Checkpoints.Checkpoints#create)
- [get](../wiki/api.entities.Asset.Checkpoints.Checkpoints#get)
- [getOne](../wiki/api.entities.Asset.Checkpoints.Checkpoints#getone)

## Properties

### schedules

• **schedules**: [`Schedules`](../wiki/api.entities.Asset.Checkpoints.Schedules.Schedules)

#### Defined in

[api/entities/Asset/Checkpoints/index.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Asset/Checkpoints/index.ts#L29)

## Methods

### create

▸ **create**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>\>

Create a snapshot of Asset Holders and their respective balances at this moment

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [create.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>\>

___

### get

▸ **get**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`CheckpointWithData`](../wiki/types.CheckpointWithData)\>\>

Retrieve all Checkpoints created on this Asset, together with their corresponding creation Date and Total Supply

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`CheckpointWithData`](../wiki/types.CheckpointWithData)\>\>

___

### getOne

▸ **getOne**(`args`): `Promise`<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

Retrieve a single Checkpoint for this Asset by its ID

**`Throws`**

 if there is no Checkpoint with the passed ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>
