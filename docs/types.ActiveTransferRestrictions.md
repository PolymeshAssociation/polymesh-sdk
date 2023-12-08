# Interface: ActiveTransferRestrictions<Restriction\>

[types](../wiki/types).ActiveTransferRestrictions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Restriction` | extends [`CountTransferRestriction`](../wiki/types.CountTransferRestriction) \| [`PercentageTransferRestriction`](../wiki/types.PercentageTransferRestriction) \| [`ClaimCountTransferRestriction`](../wiki/types.ClaimCountTransferRestriction) \| [`ClaimPercentageTransferRestriction`](../wiki/types.ClaimPercentageTransferRestriction) |

## Table of contents

### Properties

- [availableSlots](../wiki/types.ActiveTransferRestrictions#availableslots)
- [restrictions](../wiki/types.ActiveTransferRestrictions#restrictions)

## Properties

### availableSlots

• **availableSlots**: `BigNumber`

amount of restrictions that can be added before reaching the shared limit

#### Defined in

[types/index.ts:1362](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1362)

___

### restrictions

• **restrictions**: `Restriction`[]

#### Defined in

[types/index.ts:1358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1358)
