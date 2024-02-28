# Class: Settlements

[api/client/Settlements](../wiki/api.client.Settlements).Settlements

Handles all Settlement related functionality

## Table of contents

### Methods

- [addInstruction](../wiki/api.client.Settlements.Settlements#addinstruction)
- [affirmInstruction](../wiki/api.client.Settlements.Settlements#affirminstruction)
- [createVenue](../wiki/api.client.Settlements.Settlements#createvenue)
- [getInstruction](../wiki/api.client.Settlements.Settlements#getinstruction)
- [getVenue](../wiki/api.client.Settlements.Settlements#getvenue)

## Methods

### addInstruction

▸ **addInstruction**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Create an Instruction to exchange Assets

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [addInstruction.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddInstructionWithVenueIdParams`](../wiki/api.procedures.types#addinstructionwithvenueidparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### affirmInstruction

▸ **affirmInstruction**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Affirm an Instruction (authorize)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [affirmInstruction.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InstructionIdParams`](../wiki/api.procedures.types.InstructionIdParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

___

### createVenue

▸ **createVenue**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Venue`](../wiki/api.entities.Venue.Venue), [`Venue`](../wiki/api.entities.Venue.Venue)\>\>

Create a Venue under the ownership of the signing Identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createVenue.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateVenueParams`](../wiki/api.procedures.types.CreateVenueParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Venue`](../wiki/api.entities.Venue.Venue), [`Venue`](../wiki/api.entities.Venue.Venue)\>\>

___

### getInstruction

▸ **getInstruction**(`args`): `Promise`<[`Instruction`](../wiki/api.entities.Instruction.Instruction)\>

Retrieve an Instruction by its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.id` | `BigNumber` | identifier number of the Instruction |

#### Returns

`Promise`<[`Instruction`](../wiki/api.entities.Instruction.Instruction)\>

___

### getVenue

▸ **getVenue**(`args`): `Promise`<[`Venue`](../wiki/api.entities.Venue.Venue)\>

Retrieve a Venue by its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.id` | `BigNumber` | identifier number of the Venue |

#### Returns

`Promise`<[`Venue`](../wiki/api.entities.Venue.Venue)\>
