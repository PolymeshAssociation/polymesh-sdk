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

[api/procedures/types.ts:1605](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1605)

___

### requiredSignatures

• `Optional` **requiredSignatures**: `BigNumber`

The required number of signatures for the MultiSig

#### Defined in

[api/procedures/types.ts:1613](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1613)

___

### signers

• `Optional` **signers**: [`Signer`](../wiki/api.entities.types#signer)[]

The signers to set for the MultiSig

#### Defined in

[api/procedures/types.ts:1609](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1609)
