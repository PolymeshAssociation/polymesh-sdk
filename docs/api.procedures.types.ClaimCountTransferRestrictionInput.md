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

• **claim**: [`InputStatClaim`](../wiki/types#inputstatclaim)

#### Defined in

[api/procedures/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L188)

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

[api/procedures/types.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L187)

___

### max

• `Optional` **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:186](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L186)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L185)
