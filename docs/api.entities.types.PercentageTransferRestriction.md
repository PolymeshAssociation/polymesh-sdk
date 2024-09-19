# Interface: PercentageTransferRestriction

[api/entities/types](../wiki/api.entities.types).PercentageTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`PercentageTransferRestriction`**

## Table of contents

### Properties

- [exemptedIds](../wiki/api.entities.types.PercentageTransferRestriction#exemptedids)
- [percentage](../wiki/api.entities.types.PercentageTransferRestriction#percentage)

## Properties

### exemptedIds

• `Optional` **exemptedIds**: `string`[]

array of Identity IDs that are exempted from the Restriction

#### Inherited from

TransferRestrictionBase.exemptedIds

#### Defined in

[api/entities/types.ts:489](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L489)

___

### percentage

• **percentage**: `BigNumber`

maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once

#### Defined in

[api/entities/types.ts:500](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L500)
