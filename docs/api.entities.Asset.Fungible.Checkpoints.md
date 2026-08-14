[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Checkpoints

# api/entities/Asset/Fungible/Checkpoints

## Classes

### Checkpoints

Defined in: [api/entities/Asset/Fungible/Checkpoints/index.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L33)

Handles all Asset Checkpoints related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Properties

##### schedules

> **schedules**: [`Schedules`](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules#schedules)

Defined in: [api/entities/Asset/Fungible/Checkpoints/index.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L34)

#### Methods

##### create()

> **create**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L53)

Create a snapshot of Asset Holders and their respective balances at this moment

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint), [`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`CheckpointWithData`](../wiki/api.entities.types#checkpointwithdata)\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L85)

Retrieve all Checkpoints created on this Asset, together with their corresponding creation Date and Total Supply

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`CheckpointWithData`](../wiki/api.entities.types#checkpointwithdata)\>\>

###### Note

supports pagination

##### getOne()

> **getOne**(`args`): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/index.ts#L60)

Retrieve a single Checkpoint for this Asset by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)\>

###### Throws

if there is no Checkpoint with the passed ID
