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

[api/procedures/types.ts:552](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L552)

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

[api/procedures/types.ts:551](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L551)

___

### max

• `Optional` **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:550](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L550)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:549](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L549)
