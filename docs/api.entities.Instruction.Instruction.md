# Class: Instruction

[api/entities/Instruction](../wiki/api.entities.Instruction).Instruction

Represents a settlement Instruction to be executed on a certain Venue

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<[`UniqueIdentifiers`](../wiki/api.entities.Instruction.UniqueIdentifiers), `string`\>

  ↳ **`Instruction`**

## Table of contents

### Properties

- [id](../wiki/api.entities.Instruction.Instruction#id)
- [uuid](../wiki/api.entities.Instruction.Instruction#uuid)

### Methods

- [affirm](../wiki/api.entities.Instruction.Instruction#affirm)
- [details](../wiki/api.entities.Instruction.Instruction#details)
- [executeManually](../wiki/api.entities.Instruction.Instruction#executemanually)
- [exists](../wiki/api.entities.Instruction.Instruction#exists)
- [getAffirmations](../wiki/api.entities.Instruction.Instruction#getaffirmations)
- [getInvolvedPortfolios](../wiki/api.entities.Instruction.Instruction#getinvolvedportfolios)
- [getLegs](../wiki/api.entities.Instruction.Instruction#getlegs)
- [getStatus](../wiki/api.entities.Instruction.Instruction#getstatus)
- [isEqual](../wiki/api.entities.Instruction.Instruction#isequal)
- [isExecuted](../wiki/api.entities.Instruction.Instruction#isexecuted)
- [isPending](../wiki/api.entities.Instruction.Instruction#ispending)
- [onStatusChange](../wiki/api.entities.Instruction.Instruction#onstatuschange)
- [reject](../wiki/api.entities.Instruction.Instruction#reject)
- [reschedule](../wiki/api.entities.Instruction.Instruction#reschedule)
- [toHuman](../wiki/api.entities.Instruction.Instruction#tohuman)
- [withdraw](../wiki/api.entities.Instruction.Instruction#withdraw)
- [generateUuid](../wiki/api.entities.Instruction.Instruction#generateuuid)
- [unserialize](../wiki/api.entities.Instruction.Instruction#unserialize)

## Properties

### id

• **id**: `BigNumber`

Unique identifier number of the instruction

#### Defined in

[api/entities/Instruction/index.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/index.ts#L89)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Entity.ts#L46)

## Methods

### affirm

▸ **affirm**(`args?`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Affirm this instruction (authorize)

**`Note`**

 this method is of type [OptionalArgsProcedureMethod](../wiki/types.OptionalArgsProcedureMethod), which means you can call [affirm.checkAuthorization](../wiki/types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`AffirmOrWithdrawInstructionParams`](../wiki/api.procedures.types#affirmorwithdrawinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### details

▸ **details**(): `Promise`<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

Retrieve information specific to this Instruction

#### Returns

`Promise`<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

___

### executeManually

▸ **executeManually**(`args?`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Executes an Instruction either of type `SettleManual` or a `Failed` instruction

**`Note`**

 this method is of type [OptionalArgsProcedureMethod](../wiki/types.OptionalArgsProcedureMethod), which means you can call [executeManually.checkAuthorization](../wiki/types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`ExecuteManualInstructionParams`](../wiki/api.procedures.types#executemanualinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this Instruction exists on chain (or existed and was pruned)

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

___

### getAffirmations

▸ **getAffirmations**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types.InstructionAffirmation)\>\>

Retrieve every authorization generated by this Instruction (status and authorizing Identity)

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types.InstructionAffirmation)\>\>

___

### getInvolvedPortfolios

▸ **getInvolvedPortfolios**(`args`): `Promise`<([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[]\>

Retrieve all the involved portfolios in this Instruction where the given identity is a custodian of

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`<([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[]\>

___

### getLegs

▸ **getLegs**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`Leg`](../wiki/api.entities.Instruction.types.Leg)\>\>

Retrieve all legs of this Instruction

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`Leg`](../wiki/api.entities.Instruction.types.Leg)\>\>

___

### getStatus

▸ **getStatus**(): `Promise`<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

Retrieve current status of this Instruction

**`Note`**

 uses the middlewareV2

#### Returns

`Promise`<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

___

### isExecuted

▸ **isExecuted**(): `Promise`<`boolean`\>

Retrieve whether the Instruction has already been executed and pruned from
  the chain.

#### Returns

`Promise`<`boolean`\>

___

### isPending

▸ **isPending**(): `Promise`<`boolean`\>

Retrieve whether the Instruction is still pending on chain

#### Returns

`Promise`<`boolean`\>

___

### onStatusChange

▸ **onStatusChange**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

Retrieve current status of the Instruction. This can be subscribed to know if instruction fails

**`Note`**

 can be subscribed to

**`Note`**

 current status as `Executed` means that the Instruction has been executed/rejected and pruned from
  the chain.

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### reject

▸ **reject**(`args?`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Reject this instruction

**`Note`**

 reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.

**`Note`**

 reject on `SettleOnBlock` behaves just like unauthorize

**`Note`**

 reject on `SettleManual` behaves just like unauthorize

**`Note`**

 this method is of type [OptionalArgsProcedureMethod](../wiki/types.OptionalArgsProcedureMethod), which means you can call [reject.checkAuthorization](../wiki/types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`RejectInstructionParams`](../wiki/api.procedures.types#rejectinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### reschedule

▸ **reschedule**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Reschedules a failed Instruction to be tried again

**`Throws`**

 if the Instruction status is not `InstructionStatus.Failed`

**`Deprecated`**

 chain v6 will allow executeManually to be used instead

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [reschedule.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### toHuman

▸ **toHuman**(): `string`

Return the Instruction's ID

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

___

### withdraw

▸ **withdraw**(`args?`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Withdraw affirmation from this instruction (unauthorize)

**`Note`**

 this method is of type [OptionalArgsProcedureMethod](../wiki/types.OptionalArgsProcedureMethod), which means you can call [withdraw.checkAuthorization](../wiki/types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`AffirmOrWithdrawInstructionParams`](../wiki/api.procedures.types#affirmorwithdrawinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)
