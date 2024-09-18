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

• **compliance**: [`Compliance`](../wiki/types.Compliance)

how the transfer adheres to the asset's compliance rules

#### Defined in

[api/entities/Asset/types.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L72)

___

### general

• **general**: [`TransferError`](../wiki/types.TransferError)[]

list of general transfer errors

#### Defined in

[api/entities/Asset/types.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L68)

___

### restrictions

• **restrictions**: [`TransferRestrictionResult`](../wiki/api.entities.Asset.types.TransferRestrictionResult)[]

list of transfer restrictions and whether the transfer satisfies each one

#### Defined in

[api/entities/Asset/types.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L76)

___

### result

• **result**: `boolean`

true if the transfer is possible

#### Defined in

[api/entities/Asset/types.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L80)
