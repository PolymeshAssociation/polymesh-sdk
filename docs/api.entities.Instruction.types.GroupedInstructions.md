# Interface: GroupedInstructions

[api/entities/Instruction/types](../wiki/api.entities.Instruction.types).GroupedInstructions

## Table of contents

### Properties

- [affirmed](../wiki/api.entities.Instruction.types.GroupedInstructions#affirmed)
- [failed](../wiki/api.entities.Instruction.types.GroupedInstructions#failed)
- [pending](../wiki/api.entities.Instruction.types.GroupedInstructions#pending)

## Properties

### affirmed

• **affirmed**: [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]

Instructions that have already been affirmed by the Identity

#### Defined in

[api/entities/Instruction/types.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L128)

___

### failed

• **failed**: [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]

Instructions that failed in their execution (can be rescheduled).
  This group supersedes the other three, so for example, a failed Instruction
  might also belong in the `affirmed` group, but it will only be included in this one

#### Defined in

[api/entities/Instruction/types.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L138)

___

### pending

• **pending**: [`Instruction`](../wiki/api.entities.Instruction.Instruction)[]

Instructions that still need to be affirmed/rejected by the Identity

#### Defined in

[api/entities/Instruction/types.ts:132](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Instruction/types.ts#L132)
