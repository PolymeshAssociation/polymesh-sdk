# Interface: ActiveTransferRestrictions\<Restriction\>

[api/entities/types](../wiki/api.entities.types).ActiveTransferRestrictions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Restriction` | extends [`CountTransferRestriction`](../wiki/api.entities.types.CountTransferRestriction) \| [`PercentageTransferRestriction`](../wiki/api.entities.types.PercentageTransferRestriction) \| [`ClaimCountTransferRestriction`](../wiki/api.entities.types.ClaimCountTransferRestriction) \| [`ClaimPercentageTransferRestriction`](../wiki/api.entities.types.ClaimPercentageTransferRestriction) |

## Table of contents

### Properties

- [availableSlots](../wiki/api.entities.types.ActiveTransferRestrictions#availableslots)
- [restrictions](../wiki/api.entities.types.ActiveTransferRestrictions#restrictions)

## Properties

### availableSlots

• **availableSlots**: `BigNumber`

amount of restrictions that can be added before reaching the shared limit

#### Defined in

[api/entities/types.ts:553](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L553)

___

### restrictions

• **restrictions**: `Restriction`[]

#### Defined in

[api/entities/types.ts:549](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L549)
