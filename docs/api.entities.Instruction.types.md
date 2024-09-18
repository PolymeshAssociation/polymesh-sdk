# Module: api/entities/Instruction/types

## Table of contents

### Enumerations

- [AffirmationStatus](../wiki/api.entities.Instruction.types.AffirmationStatus)
- [InstructionStatus](../wiki/api.entities.Instruction.types.InstructionStatus)
- [InstructionType](../wiki/api.entities.Instruction.types.InstructionType)

### Interfaces

- [FungibleLeg](../wiki/api.entities.Instruction.types.FungibleLeg)
- [InstructionAffirmation](../wiki/api.entities.Instruction.types.InstructionAffirmation)
- [NftLeg](../wiki/api.entities.Instruction.types.NftLeg)

### Type Aliases

- [InstructionDetails](../wiki/api.entities.Instruction.types#instructiondetails)
- [InstructionEndCondition](../wiki/api.entities.Instruction.types#instructionendcondition)
- [InstructionStatusResult](../wiki/api.entities.Instruction.types#instructionstatusresult)
- [Leg](../wiki/api.entities.Instruction.types#leg)

## Type Aliases

### InstructionDetails

Ƭ **InstructionDetails**: { `createdAt`: `Date` ; `memo`: `string` \| ``null`` ; `status`: [`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus) ; `tradeDate`: `Date` \| ``null`` ; `valueDate`: `Date` \| ``null`` ; `venue`: [`Venue`](../wiki/api.entities.Venue.Venue)  } & [`InstructionEndCondition`](../wiki/api.entities.Instruction.types#instructionendcondition)

#### Defined in

[api/entities/Instruction/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Instruction/types.ts#L39)

___

### InstructionEndCondition

Ƭ **InstructionEndCondition**: { `type`: [`SettleOnAffirmation`](../wiki/api.entities.Instruction.types.InstructionType#settleonaffirmation)  } \| { `endBlock`: `BigNumber` ; `type`: [`SettleOnBlock`](../wiki/api.entities.Instruction.types.InstructionType#settleonblock)  } \| { `endAfterBlock`: `BigNumber` ; `type`: [`SettleManual`](../wiki/api.entities.Instruction.types.InstructionType#settlemanual)  }

#### Defined in

[api/entities/Instruction/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Instruction/types.ts#L26)

___

### InstructionStatusResult

Ƭ **InstructionStatusResult**: { `status`: [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)  } \| { `eventIdentifier`: [`EventIdentifier`](../wiki/types.EventIdentifier) ; `status`: `Exclude`<[`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus), [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)\>  }

#### Defined in

[api/entities/Instruction/types.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Instruction/types.ts#L81)

___

### Leg

Ƭ **Leg**: [`FungibleLeg`](../wiki/api.entities.Instruction.types.FungibleLeg) \| [`NftLeg`](../wiki/api.entities.Instruction.types.NftLeg)

#### Defined in

[api/entities/Instruction/types.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Instruction/types.ts#L68)
