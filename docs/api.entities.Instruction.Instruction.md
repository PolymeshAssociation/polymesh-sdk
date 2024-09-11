# Class: Instruction

[api/entities/Instruction](../wiki/api.entities.Instruction).Instruction

Represents a settlement Instruction to be executed on a certain Venue

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.Instruction.UniqueIdentifiers), `string`\>

  ↳ **`Instruction`**

## Table of contents

### Properties

- [id](../wiki/api.entities.Instruction.Instruction#id)
- [uuid](../wiki/api.entities.Instruction.Instruction#uuid)

### Methods

- [affirm](../wiki/api.entities.Instruction.Instruction#affirm)
- [affirmAsMediator](../wiki/api.entities.Instruction.Instruction#affirmasmediator)
- [details](../wiki/api.entities.Instruction.Instruction#details)
- [executeManually](../wiki/api.entities.Instruction.Instruction#executemanually)
- [exists](../wiki/api.entities.Instruction.Instruction#exists)
- [getAffirmations](../wiki/api.entities.Instruction.Instruction#getaffirmations)
- [getInvolvedPortfolios](../wiki/api.entities.Instruction.Instruction#getinvolvedportfolios)
- [getLegs](../wiki/api.entities.Instruction.Instruction#getlegs)
- [getMediators](../wiki/api.entities.Instruction.Instruction#getmediators)
- [getStatus](../wiki/api.entities.Instruction.Instruction#getstatus)
- [isEqual](../wiki/api.entities.Instruction.Instruction#isequal)
- [isExecuted](../wiki/api.entities.Instruction.Instruction#isexecuted)
- [isPending](../wiki/api.entities.Instruction.Instruction#ispending)
- [onStatusChange](../wiki/api.entities.Instruction.Instruction#onstatuschange)
- [reject](../wiki/api.entities.Instruction.Instruction#reject)
- [rejectAsMediator](../wiki/api.entities.Instruction.Instruction#rejectasmediator)
- [toHuman](../wiki/api.entities.Instruction.Instruction#tohuman)
- [withdraw](../wiki/api.entities.Instruction.Instruction#withdraw)
- [withdrawAsMediator](../wiki/api.entities.Instruction.Instruction#withdrawasmediator)
- [generateUuid](../wiki/api.entities.Instruction.Instruction#generateuuid)
- [unserialize](../wiki/api.entities.Instruction.Instruction#unserialize)

## Properties

### id

• **id**: `BigNumber`

Unique identifier number of the instruction

#### Defined in

[api/entities/Instruction/index.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L93)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

## Methods

### affirm

▸ **affirm**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Affirm this instruction (authorize)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`AffirmOrWithdrawInstructionParams`](../wiki/api.procedures.types#affirmorwithdrawinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types.OptionalArgsProcedureMethod), which means you can call [affirm.checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:518](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L518)

___

### affirmAsMediator

▸ **affirmAsMediator**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Affirm this instruction as a mediator (authorize)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`AffirmAsMediatorParams`](../wiki/api.procedures.types#affirmasmediatorparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types.OptionalArgsProcedureMethod), which means you can call [affirmAsMediator.checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:552](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L552)

___

### details

▸ **details**(): `Promise`\<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

Retrieve information specific to this Instruction

#### Returns

`Promise`\<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails)\>

#### Defined in

[api/entities/Instruction/index.ts:290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L290)

___

### executeManually

▸ **executeManually**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Executes an Instruction either of type `SettleManual` or a `Failed` instruction

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`ExecuteManualInstructionParams`](../wiki/api.procedures.types.ExecuteManualInstructionParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types.OptionalArgsProcedureMethod), which means you can call [executeManually.checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:572](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L572)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Instruction exists on chain (or existed and was pruned)

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Instruction/index.ts:272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L272)

___

### getAffirmations

▸ **getAffirmations**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types.InstructionAffirmation)\>\>

Retrieve every authorization generated by this Instruction (status and authorizing Identity)

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`InstructionAffirmation`](../wiki/api.entities.Instruction.types.InstructionAffirmation)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Instruction/index.ts:342](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L342)

___

### getInvolvedPortfolios

▸ **getInvolvedPortfolios**(`args`): `Promise`\<([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[]\>

Retrieve all the involved portfolios in this Instruction where the given identity is a custodian of

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`\<([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[]\>

#### Defined in

[api/entities/Instruction/index.ts:618](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L618)

___

### getLegs

▸ **getLegs**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Leg`](../wiki/api.entities.Instruction.types#leg)\>\>

Retrieve all legs of this Instruction

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Leg`](../wiki/api.entities.Instruction.types#leg)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Instruction/index.ts:388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L388)

___

### getMediators

▸ **getMediators**(): `Promise`\<[`MediatorAffirmation`](../wiki/api.entities.Instruction.types#mediatoraffirmation)[]\>

Returns the mediators for the Instruction, along with their affirmation status

#### Returns

`Promise`\<[`MediatorAffirmation`](../wiki/api.entities.Instruction.types#mediatoraffirmation)[]\>

#### Defined in

[api/entities/Instruction/index.ts:663](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L663)

___

### getStatus

▸ **getStatus**(): `Promise`\<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

Retrieve current status of this Instruction

#### Returns

`Promise`\<[`InstructionStatusResult`](../wiki/api.entities.Instruction.types#instructionstatusresult)\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Instruction/index.ts:464](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L464)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### isExecuted

▸ **isExecuted**(): `Promise`\<`boolean`\>

Retrieve whether the Instruction has already been executed and pruned from
  the chain.

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[api/entities/Instruction/index.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L184)

___

### isPending

▸ **isPending**(): `Promise`\<`boolean`\>

Retrieve whether the Instruction is still pending on chain

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[api/entities/Instruction/index.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L213)

___

### onStatusChange

▸ **onStatusChange**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Retrieve current status of the Instruction. This can be subscribed to know if instruction fails

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

**`Note`**

current status as `Executed` means that the Instruction has been executed/rejected and pruned from
  the chain.

#### Defined in

[api/entities/Instruction/index.ts:238](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L238)

___

### reject

▸ **reject**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Reject this instruction

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`RejectInstructionParams`](../wiki/api.procedures.types#rejectinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.

**`Note`**

reject on `SettleOnBlock` behaves just like unauthorize

**`Note`**

reject on `SettleManual` behaves just like unauthorize

**`Note`**

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types.OptionalArgsProcedureMethod), which means you can call [reject.checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:508](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L508)

___

### rejectAsMediator

▸ **rejectAsMediator**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Reject this instruction as a mediator

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

reject on `SettleOnAffirmation` will execute the settlement and it will fail immediately.

**`Note`**

reject on `SettleOnBlock` behaves just like unauthorize

**`Note`**

reject on `SettleManual` behaves just like unauthorize

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [rejectAsMediator.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:542](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L542)

___

### toHuman

▸ **toHuman**(): `string`

Return the Instruction's ID

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Instruction/index.ts:611](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L611)

___

### withdraw

▸ **withdraw**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Withdraw affirmation from this instruction (unauthorize)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`AffirmOrWithdrawInstructionParams`](../wiki/api.procedures.types#affirmorwithdrawinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types.OptionalArgsProcedureMethod), which means you can call [withdraw.checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:528](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L528)

___

### withdrawAsMediator

▸ **withdrawAsMediator**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Withdraw affirmation from this instruction as a mediator (unauthorize)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [withdrawAsMediator.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Instruction/index.ts:562](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/index.ts#L562)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

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

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

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

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
