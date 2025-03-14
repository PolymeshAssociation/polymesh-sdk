# Module: api/entities/Instruction/types

## Table of contents

### Enumerations

- [AffirmationStatus](../wiki/api.entities.Instruction.types.AffirmationStatus)
- [InstructionStatus](../wiki/api.entities.Instruction.types.InstructionStatus)
- [InstructionType](../wiki/api.entities.Instruction.types.InstructionType)

### Interfaces

- [FungibleLeg](../wiki/api.entities.Instruction.types.FungibleLeg)
- [GroupedInstructions](../wiki/api.entities.Instruction.types.GroupedInstructions)
- [GroupedInvolvedInstructions](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions)
- [InstructionAffirmation](../wiki/api.entities.Instruction.types.InstructionAffirmation)
- [NftLeg](../wiki/api.entities.Instruction.types.NftLeg)
- [OffChainAffirmation](../wiki/api.entities.Instruction.types.OffChainAffirmation)
- [OffChainLeg](../wiki/api.entities.Instruction.types.OffChainLeg)

### Type Aliases

- [InstructionDetails](../wiki/api.entities.Instruction.types#instructiondetails)
- [InstructionEndCondition](../wiki/api.entities.Instruction.types#instructionendcondition)
- [InstructionStatusResult](../wiki/api.entities.Instruction.types#instructionstatusresult)
- [InstructionsByStatus](../wiki/api.entities.Instruction.types#instructionsbystatus)
- [Leg](../wiki/api.entities.Instruction.types#leg)
- [MediatorAffirmation](../wiki/api.entities.Instruction.types#mediatoraffirmation)

## Type Aliases

### InstructionDetails

Ƭ **InstructionDetails**: \{ `createdAt`: `Date` \| ``null`` ; `memo`: `string` \| ``null`` ; `status`: [`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus) ; `tradeDate`: `Date` \| ``null`` ; `valueDate`: `Date` \| ``null`` ; `venue`: [`Venue`](../wiki/api.entities.Venue.Venue) \| ``null``  } & [`InstructionEndCondition`](../wiki/api.entities.Instruction.types#instructionendcondition)

#### Defined in

[api/entities/Instruction/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L40)

___

### InstructionEndCondition

Ƭ **InstructionEndCondition**: \{ `type`: [`SettleOnAffirmation`](../wiki/api.entities.Instruction.types.InstructionType#settleonaffirmation)  } \| \{ `endBlock`: `BigNumber` ; `type`: [`SettleOnBlock`](../wiki/api.entities.Instruction.types.InstructionType#settleonblock)  } \| \{ `endAfterBlock`: `BigNumber` ; `type`: [`SettleManual`](../wiki/api.entities.Instruction.types.InstructionType#settlemanual)  }

#### Defined in

[api/entities/Instruction/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L27)

___

### InstructionStatusResult

Ƭ **InstructionStatusResult**: \{ `status`: [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)  } \| \{ `eventIdentifier`: [`EventIdentifier`](../wiki/api.client.types.EventIdentifier) ; `status`: `Exclude`\<[`InstructionStatus`](../wiki/api.entities.Instruction.types.InstructionStatus), [`Pending`](../wiki/api.entities.Instruction.types.InstructionStatus#pending)\>  }

#### Defined in

[api/entities/Instruction/types.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L106)

___

### InstructionsByStatus

Ƭ **InstructionsByStatus**: [`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions) & \{ `partiallyAffirmed`: [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]  }

#### Defined in

[api/entities/Instruction/types.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L141)

___

### Leg

Ƭ **Leg**: [`FungibleLeg`](../wiki/api.entities.Instruction.types.FungibleLeg) \| [`NftLeg`](../wiki/api.entities.Instruction.types.NftLeg) \| [`OffChainLeg`](../wiki/api.entities.Instruction.types.OffChainLeg)

#### Defined in

[api/entities/Instruction/types.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L87)

___

### MediatorAffirmation

Ƭ **MediatorAffirmation**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `expiry?` | `Date` | Affirmations may have an expiration time |
| `identity` | [`Identity`](../wiki/api.entities.Identity.Identity) | - |
| `status` | [`AffirmationStatus`](../wiki/api.entities.Instruction.types.AffirmationStatus) | - |

#### Defined in

[api/entities/Instruction/types.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L115)
