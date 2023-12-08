# Interface: ExtrinsicData

[types](../wiki/types).ExtrinsicData

## Hierarchy

- **`ExtrinsicData`**

  ↳ [`ExtrinsicDataWithFees`](../wiki/types.ExtrinsicDataWithFees)

## Table of contents

### Properties

- [address](../wiki/types.ExtrinsicData#address)
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

[types/index.ts:349](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L349)

___

### blockHash

• **blockHash**: `string`

#### Defined in

[types/index.ts:343](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L343)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Defined in

[types/index.ts:344](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L344)

___

### extrinsicHash

• **extrinsicHash**: `string`

#### Defined in

[types/index.ts:358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L358)

___

### extrinsicIdx

• **extrinsicIdx**: `BigNumber`

#### Defined in

[types/index.ts:345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L345)

___

### nonce

• **nonce**: ``null`` \| `BigNumber`

nonce of the transaction. Null for unsigned transactions where address is null

#### Defined in

[types/index.ts:353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L353)

___

### params

• **params**: `Record`<`string`, `unknown`\>[]

#### Defined in

[types/index.ts:355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L355)

___

### specVersionId

• **specVersionId**: `BigNumber`

#### Defined in

[types/index.ts:357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L357)

___

### success

• **success**: `boolean`

#### Defined in

[types/index.ts:356](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L356)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

#### Defined in

[types/index.ts:354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L354)
