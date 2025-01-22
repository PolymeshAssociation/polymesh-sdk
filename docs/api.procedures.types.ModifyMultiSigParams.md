# Interface: ModifyMultiSigParams

[api/procedures/types](../wiki/api.procedures.types).ModifyMultiSigParams

## Table of contents

### Properties

- [multiSig](../wiki/api.procedures.types.ModifyMultiSigParams#multisig)
- [requiredSignatures](../wiki/api.procedures.types.ModifyMultiSigParams#requiredsignatures)
- [signers](../wiki/api.procedures.types.ModifyMultiSigParams#signers)

## Properties

### multiSig

• **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

The MultiSig to be modified

#### Defined in

[api/procedures/types.ts:1648](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1648)

___

### requiredSignatures

• `Optional` **requiredSignatures**: `BigNumber`

The required number of signatures for the MultiSig

#### Defined in

[api/procedures/types.ts:1656](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1656)

___

### signers

• `Optional` **signers**: [`Signer`](../wiki/api.entities.types#signer)[]

The signers to set for the MultiSig

#### Defined in

[api/procedures/types.ts:1652](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1652)
