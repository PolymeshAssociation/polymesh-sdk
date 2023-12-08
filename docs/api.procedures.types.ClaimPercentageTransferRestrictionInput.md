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

[api/procedures/types.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L189)

___

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L162)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L188)

___

### max

• **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L187)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:186](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L186)
