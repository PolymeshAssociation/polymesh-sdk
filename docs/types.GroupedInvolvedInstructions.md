# Interface: GroupedInvolvedInstructions

[types](../wiki/types).GroupedInvolvedInstructions

## Table of contents

### Properties

- [custodied](../wiki/types.GroupedInvolvedInstructions#custodied)
- [owned](../wiki/types.GroupedInvolvedInstructions#owned)

## Properties

### custodied

• **custodied**: [`GroupedInstructions`](../wiki/types.GroupedInstructions)

Instructions where the Identity is the custodian of the leg portfolios

#### Defined in

[types/index.ts:1567](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1567)

___

### owned

• **owned**: `Omit`<[`GroupedInstructions`](../wiki/types.GroupedInstructions), ``"affirmed"``\>

Instructions where the Identity is the owner of the leg portfolios

#### Defined in

[types/index.ts:1571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1571)
