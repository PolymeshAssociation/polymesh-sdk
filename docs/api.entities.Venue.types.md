# Module: api/entities/Venue/types

## Table of contents

### Enumerations

- [VenueType](../wiki/api.entities.Venue.types.VenueType)

### Interfaces

- [VenueDetails](../wiki/api.entities.Venue.types.VenueDetails)

### Type Aliases

- [HistoricInstruction](../wiki/api.entities.Venue.types#historicinstruction)

## Type Aliases

### HistoricInstruction

Ƭ **HistoricInstruction**: `Omit`<[`InstructionDetails`](../wiki/api.entities.Instruction.types#instructiondetails), ``"status"`` \| ``"venue"``\> & { `blockHash`: `string` ; `blockNumber`: `BigNumber` ; `id`: `BigNumber` ; `legs`: [`Leg`](../wiki/api.entities.Instruction.types.Leg)[] ; `status`: [`InstructionStatusEnum`](../wiki/types.InstructionStatusEnum) ; `venueId`: `BigNumber`  }

#### Defined in

[api/entities/Venue/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Venue/types.ts#L29)
