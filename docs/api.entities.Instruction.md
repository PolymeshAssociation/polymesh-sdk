[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Instruction

# api/entities/Instruction

## Classes

### Instruction

Defined in: [api/entities/Instruction/index.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L117)

Represents a settlement Instruction to be executed on a certain Venue

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `string`\>

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Instruction/index.ts:131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L131)

Unique identifier number of the instruction

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### affirm()

> **affirm**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:949](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L949)

Affirm this instruction (authorize)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | [`AffirmInstructionParams`](../wiki/api.procedures.types#affirminstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types#optionalargsproceduremethod), which means you can call [affirm.checkAuthorization](../wiki/api.procedures.types#checkauthorization-2) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### affirmAsMediator()

> **affirmAsMediator**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:963](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L963)

Affirm this instruction as a mediator (authorize)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | [`AffirmAsMediatorParams`](../wiki/api.procedures.types#affirmasmediatorparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types#optionalargsproceduremethod), which means you can call [affirmAsMediator.checkAuthorization](../wiki/api.procedures.types#checkauthorization-2) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

> **details**(): `Promise`\<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

Defined in: [api/entities/Instruction/index.ts:589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L589)

Retrieve information specific to this Instruction

###### Returns

`Promise`\<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - instruction is not yet processed by the middleware (when querying from middleware)
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### executeManually()

> **executeManually**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:968](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L968)

Executes an Instruction either of type `SettleManual` or a `Failed` instruction

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | [`ExecuteManualInstructionParams`](../wiki/api.procedures.types#executemanualinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types#optionalargsproceduremethod), which means you can call [executeManually.checkAuthorization](../wiki/api.procedures.types#checkauthorization-2) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Instruction/index.ts:430](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L430)

Determine whether this Instruction exists on chain (or existed and was pruned)

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### generateOffChainAffirmationReceipt()

> **generateOffChainAffirmationReceipt**(`args`): `Promise`\<[`OffChainAffirmationReceipt`](../wiki/api.procedures.types#offchainaffirmationreceipt)\>

Defined in: [api/entities/Instruction/index.ts:1348](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1348)

Generate an offchain affirmation receipt for a specific leg and UID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `expiresAt`: `Date`; `legId`: `BigNumber`; `metadata?`: `string`; `signer?`: `string` \| [`Account`](../wiki/api.entities.Account#account); `signerKeyRingType?`: [`SignerKeyRingType`](../wiki/api.procedures.types#signerkeyringtype); `uid`: `BigNumber`; \} | - |
| `args.expiresAt` | `Date` | timestamp at which the receipt expires and can no longer be used to affirm |
| `args.legId` | `BigNumber` | index of the offchain leg in this instruction |
| `args.metadata?` | `string` | (optional) metadata to be associated with the receipt |
| `args.signer?` | `string` \| [`Account`](../wiki/api.entities.Account#account) | (optional) Signer to be used to generate receipt signature. Defaults to signing Account associated with the SDK |
| `args.signerKeyRingType?` | [`SignerKeyRingType`](../wiki/api.procedures.types#signerkeyringtype) | (optional) keyring type of the signer. Defaults to 'Sr25519' |
| `args.uid` | `BigNumber` | UID of the receipt |

###### Returns

`Promise`\<[`OffChainAffirmationReceipt`](../wiki/api.procedures.types#offchainaffirmationreceipt)\>

##### getAffirmations()

> **getAffirmations**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types#instructionaffirmation)\>\>

Defined in: [api/entities/Instruction/index.ts:625](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L625)

Retrieve every authorization generated by this Instruction (status and authorizing Identity or Account)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) \| [`MiddlewarePaginationOptions`](../wiki/api.entities.types#middlewarepaginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types#instructionaffirmation)\>\>

###### Note

supports pagination.

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### getInvolvedPortfolios()

> **getInvolvedPortfolios**(`args`): `Promise`\<([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[]\>

Defined in: [api/entities/Instruction/index.ts:1041](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1041)

Retrieve all the involved portfolios in this Instruction where the given identity is a custodian of

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `did`: `string`; \} |
| `args.did` | `string` |

###### Returns

`Promise`\<([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[]\>

##### getLegs()

> **getLegs**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Leg`](../wiki/api.entities.Instruction.types#leg)\>\>

Defined in: [api/entities/Instruction/index.ts:828](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L828)

Retrieve all legs of this Instruction

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) \| [`MiddlewarePaginationOptions`](../wiki/api.entities.types#middlewarepaginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Leg`](../wiki/api.entities.Instruction.types#leg)\>\>

###### Note

supports pagination

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - instruction is not yet processed by the middleware (when querying from middleware)
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### getLegStatus()

> **getLegStatus**(`args`): `Promise`\<[`LegStatus`](../wiki/api.entities.Instruction.types#legstatus)\>

Defined in: [api/entities/Instruction/index.ts:1296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1296)

Returns the execution status of a specific leg in this Instruction

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `legId`: `BigNumber`; \} | - |
| `args.legId` | `BigNumber` | index of the leg whose status is to be fetched |

###### Returns

`Promise`\<[`LegStatus`](../wiki/api.entities.Instruction.types#legstatus)\>

##### getLockedInfo()

> **getLockedInfo**(): `Promise`\<[`InstructionLockedInfo`](../wiki/api.entities.Instruction.types#instructionlockedinfo)\>

Defined in: [api/entities/Instruction/index.ts:289](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L289)

Retrieve whether the Instruction is locked for execution on chain

###### Returns

`Promise`\<[`InstructionLockedInfo`](../wiki/api.entities.Instruction.types#instructionlockedinfo)\>

##### getMediators()

> **getMediators**(): `Promise`\<[`MediatorAffirmation`](../wiki/api.entities.Instruction.types#mediatoraffirmation)[]\>

Defined in: [api/entities/Instruction/index.ts:1093](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1093)

Returns the mediators for the Instruction, along with their affirmation status

###### Returns

`Promise`\<[`MediatorAffirmation`](../wiki/api.entities.Instruction.types#mediatoraffirmation)[]\>

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - instruction is not yet processed by the middleware (when querying from middleware)
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### getOffChainAffirmationForLeg()

> **getOffChainAffirmationForLeg**(`args`): `Promise`\<[`AffirmationStatus`](../wiki/api.entities.Instruction.types#affirmationstatus)\>

Defined in: [api/entities/Instruction/index.ts:1238](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1238)

Returns affirmation status for a specific offchain leg in this Instruction

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `legId`: `BigNumber`; \} | - |
| `args.legId` | `BigNumber` | index of the leg whose affirmation status is to be fetched |

###### Returns

`Promise`\<[`AffirmationStatus`](../wiki/api.entities.Instruction.types#affirmationstatus)\>

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - legId provided is not an off-chain leg
 - instruction is not yet processed by the middleware (when querying from middleware)
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### getOffChainAffirmations()

> **getOffChainAffirmations**(): `Promise`\<[`OffChainAffirmation`](../wiki/api.entities.Instruction.types#offchainaffirmation)[]\>

Defined in: [api/entities/Instruction/index.ts:1173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1173)

Returns affirmation statuses for offchain legs in this Instruction

###### Returns

`Promise`\<[`OffChainAffirmation`](../wiki/api.entities.Instruction.types#offchainaffirmation)[]\>

###### Note

uses middleware (if available) to retrieve information, otherwise directly queries from the chain

###### Throws

if
 - instruction does not exists
 - instruction is not yet processed by the middleware (when querying from middleware)
 - instruction is executed/rejected and was pruned from chain (when querying from chain)

##### getPendingAffirmationCount()

> **getPendingAffirmationCount**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Instruction/index.ts:247](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L247)

Get the number of affirmations pending before instruction can be executed

###### Returns

`Promise`\<`BigNumber`\>

###### Note

The count is returned as 0 for pruned instructions as well

##### getRelockStatus()

> **getRelockStatus**(): `Promise`\<[`InstructionRelockStatus`](../wiki/api.entities.Instruction.types#instructionrelockstatus)\>

Defined in: [api/entities/Instruction/index.ts:342](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L342)

Retrieve the relock cooldown status of the Instruction

###### Returns

`Promise`\<[`InstructionRelockStatus`](../wiki/api.entities.Instruction.types#instructionrelockstatus)\>

###### Note

After a mediator unlocks an Instruction, they must wait for the relock cooldown period to
  end before locking it again. `maxRelockCount` limits the total number of times an Instruction can be relocked.

##### getStatus()

> **getStatus**(): `Promise`\<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

Defined in: [api/entities/Instruction/index.ts:873](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L873)

Retrieve current status of this Instruction

###### Returns

`Promise`\<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

###### Note

uses the middlewareV2

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### isExecuted()

> **isExecuted**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Instruction/index.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L216)

Retrieve whether the Instruction has already been executed and pruned from
  the chain.

###### Returns

`Promise`\<`boolean`\>

##### isPending()

> **isPending**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Instruction/index.ts:268](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L268)

Retrieve whether the Instruction is still pending on chain

###### Returns

`Promise`\<`boolean`\>

##### lockForExecution()

> **lockForExecution**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:985](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L985)

Locks an Instruction of type `SettleAfterLock` for execution. Only a mediator of the instruction can lock the instruction.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

An Instruction can only be locked if
 - it has been affirmed by all parties
 - it is pending or has failed at least one time
 - all mediator affirmations are valid
 - all assets are in allowed venue list
 - all senders have the right amount of assets being transferred
 - all senders and receivers are compliant
 - all assets' statistics are still valid
 - there are no frozen assets

###### Throws

if any of the above conditions are not met

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [lockForExecution.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### onStatusChange()

> **onStatusChange**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Instruction/index.ts:396](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L396)

Retrieve current status of the Instruction. This can be subscribed to know if instruction fails

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`InstructionStatus`](../wiki/api.entities.Instruction.types#instructionstatus)\> |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

###### Note

can be subscribed to, if connected to node using a web socket

###### Note

current status as `Executed` means that the Instruction has been executed/rejected and pruned from
  the chain.

##### reject()

> **reject**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:944](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L944)

Reject this instruction

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | [`RejectInstructionParams`](../wiki/api.procedures.types#rejectinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.

###### Note

reject on `SettleOnBlock` behaves just like unauthorize

###### Note

reject on `SettleManual` behaves just like unauthorize

###### Note

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types#optionalargsproceduremethod), which means you can call [reject.checkAuthorization](../wiki/api.procedures.types#checkauthorization-2) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### rejectAsMediator()

> **rejectAsMediator**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:958](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L958)

Reject this instruction as a mediator

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.

###### Note

reject on `SettleOnBlock` behaves just like unauthorize

###### Note

reject on `SettleManual` behaves just like unauthorize

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [rejectAsMediator.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Instruction/index.ts:1034](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L1034)

Return the Instruction's ID

###### Returns

`string`

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### unlockForExecution()

> **unlockForExecution**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

Defined in: [api/entities/Instruction/index.ts:992](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L992)

Unlocks an Instruction that is currently `LockedForExecution`, moving it back to `Pending`. Only a mediator of the instruction can unlock it.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/#instruction), [`Instruction`](../wiki/#instruction)\>\>

###### Note

After unlocking, the mediator must wait for the relock cooldown period (see [getRelockStatus](../wiki/#getrelockstatus)) before locking the instruction again. This gives other parties time to reject the instruction if they wish to back out.

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unlockForExecution.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### UniqueIdentifiers

Defined in: [api/entities/Instruction/index.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L107)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Instruction/index.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Instruction/index.ts#L108)
