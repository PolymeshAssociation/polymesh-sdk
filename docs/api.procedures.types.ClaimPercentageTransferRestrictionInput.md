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

[api/procedures/types.ts:514](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L514)

___

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:487](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L487)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:513](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L513)

___

### max

• **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L512)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:511](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L511)
