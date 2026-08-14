[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Venue

# api/entities/Venue

## Classes

### Venue

Defined in: [api/entities/Venue/index.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L75)

Represents a Venue through which settlements are handled

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `string`\>

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Venue/index.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L89)

identifier number of the Venue

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### addInstruction()

> **addInstruction**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

Defined in: [api/entities/Venue/index.ts:345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L345)

Creates a settlement Instruction in this Venue

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddInstructionParams`](../wiki/api.procedures.types#addinstructionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)\>\>

###### Note

required role:
  - Venue Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addInstruction.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### addInstructions()

> **addInstructions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)[]\>\>

Defined in: [api/entities/Venue/index.ts:353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L353)

Creates a batch of settlement Instructions in this Venue

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddInstructionsParams`](../wiki/api.procedures.types#addinstructionsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction)[], [`Instruction`](../wiki/api.entities.Instruction#instruction)[]\>\>

###### Note

required role:
  - Venue Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addInstructions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### addSigners()

> **addSigners**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Venue/index.ts:371](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L371)

Adds a list of signers allowed to sign receipts for this Venue

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`UpdateVenueSignersParams`](../wiki/api.procedures.types#updatevenuesignersparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required role:
  - Venue Owner

###### Throws

if one or more specified signers are already added to the Venue

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addSigners.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

> **details**(): `Promise`\<[`VenueDetails`](../wiki/api.entities.Venue.types#venuedetails)\>

Defined in: [api/entities/Venue/index.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L162)

Retrieve information specific to this Venue

###### Returns

`Promise`\<[`VenueDetails`](../wiki/api.entities.Venue.types#venuedetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Venue/index.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L143)

Determine whether this Venue exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getAllowedSigners()

> **getAllowedSigners**(): `Promise`\<[`Account`](../wiki/api.entities.Account#account)[]\>

Defined in: [api/entities/Venue/index.ts:298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L298)

Get all signers allowed by this Venue.
Only these signers are allowed to affirm off-chain instructions

###### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account#account)[]\>

##### getHistoricalInstructions()

> **getHistoricalInstructions**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

Defined in: [api/entities/Venue/index.ts:255](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L255)

Retrieve all Instructions that have been associated with this Venue instance

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

###### Note

uses the middleware V2

###### Note

supports pagination

##### getInstructions()

> **getInstructions**(): `Promise`\<`Pick`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions), `"failed"` \| `"pending"`\>\>

Defined in: [api/entities/Venue/index.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L191)

Retrieve all pending and failed Instructions in this Venue

###### Returns

`Promise`\<`Pick`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions), `"failed"` \| `"pending"`\>\>

##### getSignerCount()

> **getSignerCount**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Venue/index.ts:323](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L323)

Get the number of signers allowed by this Venue

###### Returns

`Promise`\<`BigNumber`\>

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

##### modify()

> **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Venue/index.ts:361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L361)

Modify description and type

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyVenueParams`](../wiki/api.procedures.types#modifyvenueparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required role:
  - Venue Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### removeSigners()

> **removeSigners**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Venue/index.ts:381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L381)

Adds a list of signers allowed to sign receipts for this Venue

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`UpdateVenueSignersParams`](../wiki/api.procedures.types#updatevenuesignersparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required role:
  - Venue Owner

###### Throws

if one or more specified signers are already added to the Venue

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeSigners.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Venue/index.ts:386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L386)

Return the Venue's ID

###### Returns

`string`

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

Defined in: [api/entities/Venue/index.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L42)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Venue/index.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Venue/index.ts#L43)
