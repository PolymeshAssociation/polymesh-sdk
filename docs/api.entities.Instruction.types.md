# Module: api/entities/Instruction/types

## Table of contents

### Enumerations

- [AffirmationStatus](../wiki/api.entities.Instruction.types.AffirmationStatus)
- [InstructionStatus](../wiki/api.entities.Instruction.types.InstructionStatus)
- [InstructionType](../wiki/api.entities.Instruction.types.InstructionType)

### Interfaces

- [InstructionAffirmation](../wiki/api.entities.Instruction.types.InstructionAffirmation)
- [Leg](../wiki/api.entities.Instruction.types.Leg)

### Type Aliases

- [InstructionDetails](../wiki/api.entities.Instruction.types#instructiondetails)
- [InstructionEndCondition](../wiki/api.entities.Instruction.types#instructionendcondition)
- [InstructionStatusResult](../wiki/api.entities.Instruction.types#instructionstatusresult)

## Type Aliases

### InstructionDetails

Ƭ **InstructionDetails**: { `createdAt`: `Date` ; `memo`: `string` \| ``null`` ; `status`: [`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus) ; `tradeDate`: `Date` \| ``null`` ; `valueDate`: `Date` \| ``null`` ; `venue`: [`Venue`](../wiki/api.entities.Venue.Venue)  } & [`InstructionEndCondition`](../wiki/api.entities.Instruction.types#instructionendcondition)

#### Defined in

[api/entities/Instruction/types.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L31)

___

### InstructionEndCondition

Ƭ **InstructionEndCondition**: { `type`: [`SettleOnAffirmation`](../wiki/api.entities.Instruction.types.InstructionType#settleonaffirmation)  } \| { `endBlock`: `BigNumber` ; `type`: [`SettleOnBlock`](../wiki/api.entities.Instruction.types.InstructionType#settleonblock)  } \| { `endAfterBlock`: `BigNumber` ; `type`: [`SettleManual`](../wiki/api.entities.Instruction.types.InstructionType#settlemanual)  }

#### Defined in

[api/entities/Instruction/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L18)

___

### InstructionStatusResult

Ƭ **InstructionStatusResult**: { `status`: [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)  } \| { `eventIdentifier`: [`EventIdentifier`](../wiki/types.EventIdentifier) ; `status`: `Exclude`<[`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus), [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)\>  }

#### Defined in

[api/entities/Instruction/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L64)
