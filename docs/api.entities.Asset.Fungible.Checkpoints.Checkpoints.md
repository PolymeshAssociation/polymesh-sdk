# Class: Checkpoints

[api/entities/Asset/Fungible/Checkpoints](../wiki/api.entities.Asset.Fungible.Checkpoints).Checkpoints

Handles all Asset Checkpoints related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Checkpoints`**

## Table of contents

### Properties

- [schedules](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints#schedules)

### Methods

- [create](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints#create)
- [get](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints#get)
- [getOne](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints#getone)

## Properties

### schedules

• **schedules**: [`Schedules`](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules.Schedules)

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/index.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L36)

## Methods

### create

▸ **create**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>\>

Create a snapshot of Asset Holders and their respective balances at this moment

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L60)

___

### get

▸ **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`CheckpointWithData`](../wiki/api.entities.types.CheckpointWithData)\>\>

Retrieve all Checkpoints created on this Asset, together with their corresponding creation Date and Total Supply

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`CheckpointWithData`](../wiki/api.entities.types.CheckpointWithData)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/index.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L94)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

Retrieve a single Checkpoint for this Asset by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

**`Throws`**

if there is no Checkpoint with the passed ID

#### Defined in

[api/entities/Asset/Fungible/Checkpoints/index.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L69)
