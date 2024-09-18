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

[types/index.ts:1615](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1615)

___

### owned

• **owned**: `Omit`<[`GroupedInstructions`](../wiki/types.GroupedInstructions), ``"affirmed"``\>

Instructions where the Identity is the owner of the leg portfolios

#### Defined in

[types/index.ts:1619](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1619)
