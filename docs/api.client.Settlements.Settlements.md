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

▸ **addInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Create an Instruction to exchange Assets

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddInstructionWithVenueIdParams`](../wiki/api.procedures.types#addinstructionwithvenueidparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addInstruction.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Settlements.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Settlements.ts#L121)

___

### affirmInstruction

▸ **affirmInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Affirm an Instruction (authorize)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InstructionIdParams`](../wiki/api.procedures.types.InstructionIdParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction), [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [affirmInstruction.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Settlements.ts:131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Settlements.ts#L131)

___

### createVenue

▸ **createVenue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Venue`](../wiki/api.entities.Venue.Venue), [`Venue`](../wiki/api.entities.Venue.Venue)\>\>

Create a Venue under the ownership of the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateVenueParams`](../wiki/api.procedures.types.CreateVenueParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Venue`](../wiki/api.entities.Venue.Venue), [`Venue`](../wiki/api.entities.Venue.Venue)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createVenue.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Settlements.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Settlements.ts#L111)

___

### getInstruction

▸ **getInstruction**(`args`): `Promise`\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)\>

Retrieve an Instruction by its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.id` | `BigNumber` | identifier number of the Instruction |

#### Returns

`Promise`\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)\>

#### Defined in

[api/client/Settlements.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Settlements.ts#L89)

___

### getVenue

▸ **getVenue**(`args`): `Promise`\<[`Venue`](../wiki/api.entities.Venue.Venue)\>

Retrieve a Venue by its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.id` | `BigNumber` | identifier number of the Venue |

#### Returns

`Promise`\<[`Venue`](../wiki/api.entities.Venue.Venue)\>

#### Defined in

[api/client/Settlements.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Settlements.ts#L68)
