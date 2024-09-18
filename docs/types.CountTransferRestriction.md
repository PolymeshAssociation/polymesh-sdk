# Interface: CountTransferRestriction

[types](../wiki/types).CountTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`CountTransferRestriction`**

## Table of contents

### Properties

- [count](../wiki/types.CountTransferRestriction#count)
- [exemptedIds](../wiki/types.CountTransferRestriction#exemptedids)

## Properties

### count

• **count**: `BigNumber`

#### Defined in

[types/index.ts:1357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1357)

___

### exemptedIds

• `Optional` **exemptedIds**: `string`[]

array of Scope/Identity IDs that are exempted from the Restriction

**`Note`**

 if the Asset requires investor uniqueness, Scope IDs are used. Otherwise, we use Identity IDs. More on Scope IDs and investor uniqueness
  [here](https://developers.polymesh.network/introduction/identity#polymesh-unique-identity-system-puis) and
  [here](https://developers.polymesh.network/polymesh-docs/primitives/confidential-identity)

#### Inherited from

TransferRestrictionBase.exemptedIds

#### Defined in

[types/index.ts:1353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1353)
