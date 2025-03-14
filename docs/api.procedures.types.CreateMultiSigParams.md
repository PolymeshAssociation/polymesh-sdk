# Interface: CreateMultiSigParams

[api/procedures/types](../wiki/api.procedures.types).CreateMultiSigParams

## Table of contents

### Properties

- [permissions](../wiki/api.procedures.types.CreateMultiSigParams#permissions)
- [requiredSignatures](../wiki/api.procedures.types.CreateMultiSigParams#requiredsignatures)
- [signers](../wiki/api.procedures.types.CreateMultiSigParams#signers)

## Properties

### permissions

• `Optional` **permissions**: [`PermissionsLike`](../wiki/api.entities.types#permissionslike)

Grants permissions to the MultiSig upon creation. The caller must be the primary key of the Identity for these to work

#### Defined in

[api/procedures/types.ts:1673](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1673)

___

### requiredSignatures

• **requiredSignatures**: `BigNumber`

#### Defined in

[api/procedures/types.ts:1669](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1669)

___

### signers

• **signers**: [`Signer`](../wiki/api.entities.types#signer)[]

**`Note`**

Signer must be an Account as of v7

#### Defined in

[api/procedures/types.ts:1668](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1668)
