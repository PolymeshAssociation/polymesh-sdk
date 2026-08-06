[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Venue/types

# api/entities/Venue/types

## Enumerations

### VenueType

Defined in: [api/entities/Venue/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L7)

#### Enumeration Members

##### Distribution

> **Distribution**: `"Distribution"`

Defined in: [api/entities/Venue/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L15)

Primary issuance

##### Exchange

> **Exchange**: `"Exchange"`

Defined in: [api/entities/Venue/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L20)

##### Other

> **Other**: `"Other"`

Defined in: [api/entities/Venue/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L11)

Default type

##### Sto

> **Sto**: `"Sto"`

Defined in: [api/entities/Venue/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L19)

Offering/Fundraise

## Interfaces

### VenueDetails

Defined in: [api/entities/Venue/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L23)

#### Properties

##### description

> **description**: `string`

Defined in: [api/entities/Venue/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L26)

##### owner

> **owner**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/Venue/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L25)

##### type

> **type**: [`VenueType`](../wiki/#venuetype)

Defined in: [api/entities/Venue/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L24)

## Type Aliases

### HistoricInstruction

> **HistoricInstruction** = `Omit`\<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails), `"status"` \| `"venue"`\> & `object`

Defined in: [api/entities/Venue/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Venue/types.ts#L29)

#### Type Declaration

##### blockHash

> **blockHash**: `string`

##### blockNumber

> **blockNumber**: `BigNumber`

##### id

> **id**: `BigNumber`

##### legs

> **legs**: [`Leg`](../wiki/api.entities.Instruction.types#leg)[]

##### status

> **status**: [`InstructionStatusEnum`](../wiki/api.client.types#instructionstatusenum)

##### venueId?

> `optional` **venueId?**: `BigNumber`
