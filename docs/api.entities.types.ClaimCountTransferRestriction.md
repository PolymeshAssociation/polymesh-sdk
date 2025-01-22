# Interface: ClaimCountTransferRestriction

[api/entities/types](../wiki/api.entities.types).ClaimCountTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`ClaimCountTransferRestriction`**

## Table of contents

### Properties

- [claim](../wiki/api.entities.types.ClaimCountTransferRestriction#claim)
- [exemptedIds](../wiki/api.entities.types.ClaimCountTransferRestriction#exemptedids)
- [issuer](../wiki/api.entities.types.ClaimCountTransferRestriction#issuer)
- [max](../wiki/api.entities.types.ClaimCountTransferRestriction#max)
- [min](../wiki/api.entities.types.ClaimCountTransferRestriction#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

The type of investors this restriction applies to. e.g. non-accredited

#### Defined in

[api/entities/types.ts:512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L512)

___

### exemptedIds

• `Optional` **exemptedIds**: `string`[]

array of Identity IDs that are exempted from the Restriction

#### Inherited from

TransferRestrictionBase.exemptedIds

#### Defined in

[api/entities/types.ts:495](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L495)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/types.ts:522](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L522)

___

### max

• `Optional` **max**: `BigNumber`

The maximum amount of investors that must meet the Claim criteria

#### Defined in

[api/entities/types.ts:520](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L520)

___

### min

• **min**: `BigNumber`

The minimum amount of investors the must meet the Claim criteria

#### Defined in

[api/entities/types.ts:516](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L516)
