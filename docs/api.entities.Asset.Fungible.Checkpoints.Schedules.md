[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Checkpoints/Schedules

# api/entities/Asset/Fungible/Checkpoints/Schedules

## Classes

### Schedules

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L26)

Handles all Asset Checkpoint Schedules related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### create()

> **create**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule), [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L52)

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

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L82)

Retrieve all active Checkpoint Schedules

###### Returns

`Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)[]\>

##### getOne()

> **getOne**(`__namedParameters`): `Promise`\<[`ScheduleWithDetails`](../wiki/api.entities.types#schedulewithdetails)\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L64)

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

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L127)

Retrieve the maximum allowed Schedule complexity for this Asset

###### Returns

`Promise`\<`BigNumber`\>

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/Checkpoints/Schedules.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Checkpoints/Schedules.ts#L57)

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
