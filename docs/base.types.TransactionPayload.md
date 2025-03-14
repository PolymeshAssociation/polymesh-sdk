# Interface: TransactionPayload

[base/types](../wiki/base.types).TransactionPayload

Unsigned transaction data in JSON a format

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

Additional information attached to the payload, such as IDs or memos about the transaction.

**`Note`**

this is not chain data. Its for convenience for attaching a trace ID

#### Defined in

[base/types.ts:203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/base/types.ts#L203)

___

### method

• `Readonly` **method**: \`0x$\{string}\`

A hex representation of the core extrinsic information. i.e. the extrinsic and args, but does not contain information about who is to sign the transaction.

#### Defined in

[base/types.ts:196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/base/types.ts#L196)

___

### multiSig

• `Readonly` **multiSig**: ``null`` \| `string`

The address of the MultiSig if the transaction is a proposal.

Will be set only if the signing account is a MultiSig signer and the transaction is not approving or rejecting an existing proposal

#### Defined in

[base/types.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/base/types.ts#L210)

___

### payload

• `Readonly` **payload**: `SignerPayloadJSON`

This is what a Polkadot signer ".signPayload" method expects

**`Note`**

this field is recommended to be passed in with the signature when submitting a signed transaction

#### Defined in

[base/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/base/types.ts#L183)

___

### rawPayload

• `Readonly` **rawPayload**: `SignerPayloadRaw`

An alternative representation of the payload for which Polkadot signers providing ".signRaw" expect.

**`Note`**

using the field `payload` is generally recommended. The raw version is included so any polkadot compliant signer can sign.

**`Note`**

`signRaw` typically returns just the signature. However signatures must be prefixed with a byte to indicate the type. For ed25519 signatures prepend a zero byte (`0x00`), for sr25519 `0x01` byte to indicate sr25519 if the signer implementation does not already do so.

#### Defined in

[base/types.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/base/types.ts#L191)
