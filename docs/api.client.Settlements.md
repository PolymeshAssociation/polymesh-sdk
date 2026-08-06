[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Settlements

# api/client/Settlements

## Classes

### Settlements

Defined in: [api/client/Settlements.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L33)

Handles all Settlement related functionality

#### Methods

##### addInstruction()

> **addInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

Defined in: [api/client/Settlements.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L119)

Create an Instruction to exchange Assets

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddInstructionWithVenueIdParams`](../wiki/api.procedures.types#addinstructionwithvenueidparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addInstruction.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### affirmInstruction()

> **affirmInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction), [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

Defined in: [api/client/Settlements.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L128)

Affirm an Instruction (authorize)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`InstructionIdParams`](../wiki/api.procedures.types#instructionidparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction), [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [affirmInstruction.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createVenue()

> **createVenue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Venue`](../wiki/api.entities.Venue#venue), [`Venue`](../wiki/api.entities.Venue#venue)\>\>

Defined in: [api/client/Settlements.ts:114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L114)

Create a Venue under the ownership of the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateVenueParams`](../wiki/api.procedures.types#createvenueparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Venue`](../wiki/api.entities.Venue#venue), [`Venue`](../wiki/api.entities.Venue#venue)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createVenue.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getHistoricalInstructions()

> **getHistoricalInstructions**(`filter`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

Defined in: [api/client/Settlements.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L137)

Retrieve all Instructions that have been associated with this Identity's DID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filter` | [`HistoricalInstructionFilters`](../wiki/api.client.types#historicalinstructionfilters) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

###### Note

uses the middleware V2

###### Note

supports pagination

##### getInstruction()

> **getInstruction**(`args`): `Promise`\<[`Instruction`](../wiki/api.entities.Instruction#instruction)\>

Defined in: [api/client/Settlements.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L95)

Retrieve an Instruction by its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} | - |
| `args.id` | `BigNumber` | identifier number of the Instruction |

###### Returns

`Promise`\<[`Instruction`](../wiki/api.entities.Instruction#instruction)\>

##### getVenue()

> **getVenue**(`args`): `Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)\>

Defined in: [api/client/Settlements.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Settlements.ts#L74)

Retrieve a Venue by its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} | - |
| `args.id` | `BigNumber` | identifier number of the Venue |

###### Returns

`Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)\>
