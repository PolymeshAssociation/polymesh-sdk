# Interface: TransactionPayload

[base/types](../wiki/base.types).TransactionPayload

## Table of contents

### Properties

- [metadata](../wiki/base.types.TransactionPayload#metadata)
- [method](../wiki/base.types.TransactionPayload#method)
- [multiSig](../wiki/base.types.TransactionPayload#multisig)
- [payload](../wiki/base.types.TransactionPayload#payload)
- [rawPayload](../wiki/base.types.TransactionPayload#rawpayload)

## Properties

### metadata

• `Readonly` **metadata**: `Record`\<`string`, `string`\>

Additional information attached to the payload, such as IDs or memos about the transaction

#### Defined in

[base/types.ts:199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L199)

___

### method

• `Readonly` **method**: \`0x$\{string}\`

A hex representation of the core extrinsic information. i.e. the extrinsic and args, but does not contain information about who is to sign the transaction.

When submitting the transaction this will be used to construct the extrinsic, to which
the signer payload and signature will be attached to.

#### Defined in

[base/types.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L194)

___

### multiSig

• `Readonly` **multiSig**: ``null`` \| `string`

The address of the MultiSig if the transaction is a proposal.

Will be set only if the signing account is a MultiSig signer and the transaction is not approving or rejecting an existing proposal

#### Defined in

[base/types.ts:206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L206)

___

### payload

• `Readonly` **payload**: `SignerPayloadJSON`

This is what a Polkadot signer ".signPayload" method expects

#### Defined in

[base/types.ts:178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L178)

___

### rawPayload

• `Readonly` **rawPayload**: `SignerPayloadRaw`

An alternative representation of the payload for which Polkadot signers providing ".signRaw" expect.

**`Note`**

the signature should be prefixed with a single byte to indicate its type. Prepend a zero byte (`0x00`) for ed25519 or a `0x01` byte to indicate sr25519 if the signer implementation does not already do so.

#### Defined in

[base/types.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/base/types.ts#L185)
