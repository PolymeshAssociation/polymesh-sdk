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

• **claim**: [`InputStatClaim`](../wiki/types#inputstatclaim)

#### Defined in

[api/procedures/types.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L194)

___

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L167)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L193)

___

### max

• **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L192)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L191)
