# Interface: TransactionPayload

[base/types](../wiki/base.types).TransactionPayload

## Table of contents

### Properties

- [metadata](../wiki/base.types.TransactionPayload#metadata)
- [method](../wiki/base.types.TransactionPayload#method)
- [payload](../wiki/base.types.TransactionPayload#payload)
- [rawPayload](../wiki/base.types.TransactionPayload#rawpayload)

## Properties

### metadata

• `Readonly` **metadata**: `Record`\<`string`, `string`\>

Additional information attached to the payload, such as IDs or memos about the transaction

#### Defined in

[base/types.ts:195](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L195)

___

### method

• `Readonly` **method**: \`0x$\{string}\`

A hex representation of the core extrinsic information. i.e. the extrinsic and args, but does not contain information about who is to sign the transaction.

When submitting the transaction this will be used to construct the extrinsic, to which
the signer payload and signature will be attached to.

#### Defined in

[base/types.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L190)

___

### payload

• `Readonly` **payload**: `SignerPayloadJSON`

This is what a Polkadot signer ".signPayload" method expects

#### Defined in

[base/types.ts:174](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L174)

___

### rawPayload

• `Readonly` **rawPayload**: `SignerPayloadRaw`

An alternative representation of the payload for which Polkadot signers providing ".signRaw" expect.

**`Note`**

the signature should be prefixed with a single byte to indicate its type. Prepend a zero byte (`0x00`) for ed25519 or a `0x01` byte to indicate sr25519 if the signer implementation does not already do so.

#### Defined in

[base/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L181)
