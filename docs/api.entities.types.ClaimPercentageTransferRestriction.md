# Interface: ClaimPercentageTransferRestriction

[api/entities/types](../wiki/api.entities.types).ClaimPercentageTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`ClaimPercentageTransferRestriction`**

## Table of contents

### Properties

- [claim](../wiki/api.entities.types.ClaimPercentageTransferRestriction#claim)
- [exemptedIds](../wiki/api.entities.types.ClaimPercentageTransferRestriction#exemptedids)
- [issuer](../wiki/api.entities.types.ClaimPercentageTransferRestriction#issuer)
- [max](../wiki/api.entities.types.ClaimPercentageTransferRestriction#max)
- [min](../wiki/api.entities.types.ClaimPercentageTransferRestriction#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

The type of investors this restriction applies to. e.g. Canadian investor

#### Defined in

[api/entities/types.ts:522](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L522)

___

### exemptedIds

• `Optional` **exemptedIds**: `string`[]

array of Identity IDs that are exempted from the Restriction

#### Inherited from

TransferRestrictionBase.exemptedIds

#### Defined in

[api/entities/types.ts:489](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L489)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/types.ts:532](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L532)

___

### max

• **max**: `BigNumber`

The maximum percentage of the total supply that investors meeting the Claim criteria must hold

#### Defined in

[api/entities/types.ts:530](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L530)

___

### min

• **min**: `BigNumber`

The minimum percentage of the total supply that investors meeting the Claim criteria must hold

#### Defined in

[api/entities/types.ts:526](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L526)
