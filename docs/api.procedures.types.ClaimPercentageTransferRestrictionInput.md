# Interface: ClaimPercentageTransferRestrictionInput

[api/procedures/types](../wiki/api.procedures.types).ClaimPercentageTransferRestrictionInput

## Hierarchy

- `TransferRestrictionInputBase`

  ↳ **`ClaimPercentageTransferRestrictionInput`**

## Table of contents

### Properties

- [claim](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#claim)
- [exemptedIdentities](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#exemptedidentities)
- [issuer](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#issuer)
- [max](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#max)
- [min](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

#### Defined in

[api/procedures/types.ts:558](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L558)

___

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:531](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L531)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:557](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L557)

___

### max

• **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:556](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L556)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:555](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L555)
