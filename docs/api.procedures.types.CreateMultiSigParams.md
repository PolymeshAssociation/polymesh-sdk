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

[api/procedures/types.ts:1641](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1641)

___

### requiredSignatures

• **requiredSignatures**: `BigNumber`

#### Defined in

[api/procedures/types.ts:1637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1637)

___

### signers

• **signers**: [`Signer`](../wiki/api.entities.types#signer)[]

**`Note`**

Signer must be an Account as of v7

#### Defined in

[api/procedures/types.ts:1636](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1636)
