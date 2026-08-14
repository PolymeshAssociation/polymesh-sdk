[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Checkpoints/Schedules

# api/entities/Asset/Fungible/Checkpoints/Schedules

## Classes

### Schedules

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L27)

Handles all Asset Checkpoint Schedules related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### create()

> **create**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule), [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L53)

Create a schedule for Checkpoint creation (e.g. "Create a checkpoint every week for 5 weeks, starting next tuesday")

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateCheckpointScheduleParams`](../wiki/api.procedures.types#createcheckpointscheduleparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule), [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)\>\>

###### Note

⚠️ Chain v6 introduces changes in how checkpoints are created. Only a set amount of points can be specified, infinitely repeating schedules are deprecated

###### Note

due to chain limitations, schedules are advanced and (if appropriate) executed whenever the Asset is
  redeemed, issued or transferred between portfolios. This means that on an Asset without much movement, there may be disparities between intended Checkpoint creation dates
  and the actual date when they are created. This, however, has no effect on the Checkpoint's accuracy regarding to balances

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(): `Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)[]\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L83)

Retrieve all active Checkpoint Schedules

###### Returns

`Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)[]\>

##### getNextCheckpoint()

> **getNextCheckpoint**(): `Promise`\<[`NextCheckpoints`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#nextcheckpoints) \| `null`\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L141)

Retrieve the cached next Checkpoint information for this Asset, aggregated across all of its active Schedules

###### Returns

`Promise`\<[`NextCheckpoints`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#nextcheckpoints) \| `null`\>

`null` if the Asset has no active Schedules

##### getOne()

> **getOne**(`__namedParameters`): `Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L65)

Retrieve a single Checkpoint Schedule associated to this Asset by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `id`: `BigNumber`; \} |
| `__namedParameters.id` | `BigNumber` |

###### Returns

`Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)\>

###### Throws

if there is no Schedule with the passed ID

##### maxComplexity()

> **maxComplexity**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L128)

Retrieve the maximum allowed Schedule complexity for this Asset

###### Returns

`Promise`\<`BigNumber`\>

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L58)

Remove the supplied Checkpoint Schedule for a given Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveCheckpointScheduleParams`](../wiki/api.procedures.types#removecheckpointscheduleparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
