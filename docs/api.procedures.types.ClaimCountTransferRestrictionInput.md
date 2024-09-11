# Interface: ClaimCountTransferRestrictionInput

[api/procedures/types](../wiki/api.procedures.types).ClaimCountTransferRestrictionInput

## Hierarchy

- `TransferRestrictionInputBase`

  ↳ **`ClaimCountTransferRestrictionInput`**

## Table of contents

### Properties

- [claim](../wiki/api.procedures.types.ClaimCountTransferRestrictionInput#claim)
- [exemptedIdentities](../wiki/api.procedures.types.ClaimCountTransferRestrictionInput#exemptedidentities)
- [issuer](../wiki/api.procedures.types.ClaimCountTransferRestrictionInput#issuer)
- [max](../wiki/api.procedures.types.ClaimCountTransferRestrictionInput#max)
- [min](../wiki/api.procedures.types.ClaimCountTransferRestrictionInput#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

#### Defined in

[api/procedures/types.ts:508](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L508)

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

[api/procedures/types.ts:507](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L507)

___

### max

• `Optional` **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:506](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L506)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:505](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L505)
