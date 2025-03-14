# Class: Venue

[api/entities/Venue](../wiki/api.entities.Venue).Venue

Represents a Venue through which settlements are handled

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.Venue.UniqueIdentifiers), `string`\>

  ↳ **`Venue`**

## Table of contents

### Properties

- [id](../wiki/api.entities.Venue.Venue#id)
- [uuid](../wiki/api.entities.Venue.Venue#uuid)

### Methods

- [addInstruction](../wiki/api.entities.Venue.Venue#addinstruction)
- [addInstructions](../wiki/api.entities.Venue.Venue#addinstructions)
- [addSigners](../wiki/api.entities.Venue.Venue#addsigners)
- [details](../wiki/api.entities.Venue.Venue#details)
- [exists](../wiki/api.entities.Venue.Venue#exists)
- [getAllowedSigners](../wiki/api.entities.Venue.Venue#getallowedsigners)
- [getHistoricalInstructions](../wiki/api.entities.Venue.Venue#gethistoricalinstructions)
- [getInstructions](../wiki/api.entities.Venue.Venue#getinstructions)
- [isEqual](../wiki/api.entities.Venue.Venue#isequal)
- [modify](../wiki/api.entities.Venue.Venue#modify)
- [removeSigners](../wiki/api.entities.Venue.Venue#removesigners)
- [toHuman](../wiki/api.entities.Venue.Venue#tohuman)
- [generateUuid](../wiki/api.entities.Venue.Venue#generateuuid)
- [unserialize](../wiki/api.entities.Venue.Venue#unserialize)

## Properties

### id

• **id**: `BigNumber`

identifier number of the Venue

#### Defined in

[api/entities/Venue/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L77)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### addInstruction

▸ **addInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

Creates a settlement Instruction in this Venue

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddInstructionParams`](../wiki/api.procedures.types#addinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)\>\>

**`Note`**

required role:
  - Venue Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addInstruction.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Venue/index.ts:314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L314)

___

### addInstructions

▸ **addInstructions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]\>\>

Creates a batch of settlement Instructions in this Venue

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddInstructionsParams`](../wiki/api.procedures.types.AddInstructionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction.Instruction)[], [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]\>\>

**`Note`**

required role:
  - Venue Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addInstructions.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Venue/index.ts:327](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L327)

___

### addSigners

▸ **addSigners**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Adds a list of signers allowed to sign receipts for this Venue

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UpdateVenueSignersParams`](../wiki/api.procedures.types.UpdateVenueSignersParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Venue Owner

**`Throws`**

if one or more specified signers are already added to the Venue

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addSigners.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Venue/index.ts:355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L355)

___

### details

▸ **details**(): `Promise`\<[`VenueDetails`](../wiki/api.entities.Venue.types.VenueDetails)\>

Retrieve information specific to this Venue

#### Returns

`Promise`\<[`VenueDetails`](../wiki/api.entities.Venue.types.VenueDetails)\>

#### Defined in

[api/entities/Venue/index.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L150)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Venue exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Venue/index.ts:131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L131)

___

### getAllowedSigners

▸ **getAllowedSigners**(): `Promise`\<[`Account`](../wiki/api.entities.Account.Account)[]\>

Get all signers allowed by this Venue.
Only these signers are allowed to affirm off-chain instructions

#### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account.Account)[]\>

#### Defined in

[api/entities/Venue/index.ts:283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L283)

___

### getHistoricalInstructions

▸ **getHistoricalInstructions**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

Retrieve all Instructions that have been associated with this Venue instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

**`Note`**

uses the middleware V2

**`Note`**

supports pagination

#### Defined in

[api/entities/Venue/index.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L239)

___

### getInstructions

▸ **getInstructions**(): `Promise`\<`Pick`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions), ``"pending"`` \| ``"failed"``\>\>

Retrieve all pending and failed Instructions in this Venue

#### Returns

`Promise`\<`Pick`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions), ``"pending"`` \| ``"failed"``\>\>

#### Defined in

[api/entities/Venue/index.ts:179](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L179)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify description and type

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyVenueParams`](../wiki/api.procedures.types#modifyvenueparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Venue Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Venue/index.ts:340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L340)

___

### removeSigners

▸ **removeSigners**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Adds a list of signers allowed to sign receipts for this Venue

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UpdateVenueSignersParams`](../wiki/api.procedures.types.UpdateVenueSignersParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Venue Owner

**`Throws`**

if one or more specified signers are already added to the Venue

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [removeSigners.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Venue/index.ts:370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L370)

___

### toHuman

▸ **toHuman**(): `string`

Return the Venue's ID

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Venue/index.ts:377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Venue/index.ts#L377)

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

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

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

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
