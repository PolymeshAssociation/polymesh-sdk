# Interface: GroupedInvolvedInstructions

[api/entities/Instruction/types](../wiki/api.entities.Instruction.types).GroupedInvolvedInstructions

## Table of contents

### Properties

- [custodied](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions#custodied)
- [owned](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions#owned)

## Properties

### custodied

• **custodied**: [`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions)

Instructions where the Identity is the custodian of the leg portfolios

#### Defined in

[api/entities/Instruction/types.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/types.ts#L128)

___

### owned

• **owned**: `Omit`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions), ``"affirmed"``\>

Instructions where the Identity is the owner of the leg portfolios

#### Defined in

[api/entities/Instruction/types.ts:132](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Instruction/types.ts#L132)
