# Interface: ExtrinsicData

[types](../wiki/types).ExtrinsicData

## Hierarchy

- **`ExtrinsicData`**

  ↳ [`ExtrinsicDataWithFees`](../wiki/types.ExtrinsicDataWithFees)

## Table of contents

### Properties

- [address](../wiki/types.ExtrinsicData#address)
- [blockDate](../wiki/types.ExtrinsicData#blockdate)
- [blockHash](../wiki/types.ExtrinsicData#blockhash)
- [blockNumber](../wiki/types.ExtrinsicData#blocknumber)
- [extrinsicHash](../wiki/types.ExtrinsicData#extrinsichash)
- [extrinsicIdx](../wiki/types.ExtrinsicData#extrinsicidx)
- [nonce](../wiki/types.ExtrinsicData#nonce)
- [params](../wiki/types.ExtrinsicData#params)
- [specVersionId](../wiki/types.ExtrinsicData#specversionid)
- [success](../wiki/types.ExtrinsicData#success)
- [txTag](../wiki/types.ExtrinsicData#txtag)

## Properties

### address

• **address**: ``null`` \| `string`

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

#### Defined in

[types/index.ts:380](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L380)

___

### blockDate

• **blockDate**: `Date`

#### Defined in

[types/index.ts:375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L375)

___

### blockHash

• **blockHash**: `string`

#### Defined in

[types/index.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L373)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Defined in

[types/index.ts:374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L374)

___

### extrinsicHash

• **extrinsicHash**: `string`

#### Defined in

[types/index.ts:389](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L389)

___

### extrinsicIdx

• **extrinsicIdx**: `BigNumber`

#### Defined in

[types/index.ts:376](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L376)

___

### nonce

• **nonce**: ``null`` \| `BigNumber`

nonce of the transaction. Null for unsigned transactions where address is null

#### Defined in

[types/index.ts:384](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L384)

___

### params

• **params**: `Record`<`string`, `unknown`\>[]

#### Defined in

[types/index.ts:386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L386)

___

### specVersionId

• **specVersionId**: `BigNumber`

#### Defined in

[types/index.ts:388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L388)

___

### success

• **success**: `boolean`

#### Defined in

[types/index.ts:387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L387)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

#### Defined in

[types/index.ts:385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/types/index.ts#L385)
