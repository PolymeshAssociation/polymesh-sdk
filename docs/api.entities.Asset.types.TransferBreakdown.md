# Interface: TransferBreakdown

[api/entities/Asset/types](../wiki/api.entities.Asset.types).TransferBreakdown

Object containing every reason why a specific Asset transfer would fail

## Table of contents

### Properties

- [compliance](../wiki/api.entities.Asset.types.TransferBreakdown#compliance)
- [general](../wiki/api.entities.Asset.types.TransferBreakdown#general)
- [restrictions](../wiki/api.entities.Asset.types.TransferBreakdown#restrictions)
- [result](../wiki/api.entities.Asset.types.TransferBreakdown#result)

## Properties

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.types.Compliance)

how the transfer adheres to the asset's compliance rules

#### Defined in

[api/entities/Asset/types.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L134)

___

### general

• **general**: [`TransferError`](../wiki/api.entities.Asset.types.TransferError)[]

list of general transfer errors

#### Defined in

[api/entities/Asset/types.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L130)

___

### restrictions

• **restrictions**: [`TransferRestrictionResult`](../wiki/api.entities.Asset.types.TransferRestrictionResult)[]

list of transfer restrictions and whether the transfer satisfies each one

#### Defined in

[api/entities/Asset/types.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L138)

___

### result

• **result**: `boolean`

true if the transfer is possible

#### Defined in

[api/entities/Asset/types.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L142)
