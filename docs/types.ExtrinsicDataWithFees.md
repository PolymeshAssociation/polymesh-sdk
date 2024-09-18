# Interface: ExtrinsicDataWithFees

[types](../wiki/types).ExtrinsicDataWithFees

## Hierarchy

- [`ExtrinsicData`](../wiki/types.ExtrinsicData)

  ↳ **`ExtrinsicDataWithFees`**

## Table of contents

### Properties

- [address](../wiki/types.ExtrinsicDataWithFees#address)
- [blockDate](../wiki/types.ExtrinsicDataWithFees#blockdate)
- [blockHash](../wiki/types.ExtrinsicDataWithFees#blockhash)
- [blockNumber](../wiki/types.ExtrinsicDataWithFees#blocknumber)
- [extrinsicHash](../wiki/types.ExtrinsicDataWithFees#extrinsichash)
- [extrinsicIdx](../wiki/types.ExtrinsicDataWithFees#extrinsicidx)
- [fee](../wiki/types.ExtrinsicDataWithFees#fee)
- [nonce](../wiki/types.ExtrinsicDataWithFees#nonce)
- [params](../wiki/types.ExtrinsicDataWithFees#params)
- [specVersionId](../wiki/types.ExtrinsicDataWithFees#specversionid)
- [success](../wiki/types.ExtrinsicDataWithFees#success)
- [txTag](../wiki/types.ExtrinsicDataWithFees#txtag)

## Properties

### address

• **address**: ``null`` \| `string`

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[address](../wiki/types.ExtrinsicData#address)

#### Defined in

[types/index.ts:380](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L380)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[blockDate](../wiki/types.ExtrinsicData#blockdate)

#### Defined in

[types/index.ts:375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L375)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[blockHash](../wiki/types.ExtrinsicData#blockhash)

#### Defined in

[types/index.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L373)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[blockNumber](../wiki/types.ExtrinsicData#blocknumber)

#### Defined in

[types/index.ts:374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L374)

___

### extrinsicHash

• **extrinsicHash**: `string`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[extrinsicHash](../wiki/types.ExtrinsicData#extrinsichash)

#### Defined in

[types/index.ts:389](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L389)

___

### extrinsicIdx

• **extrinsicIdx**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[extrinsicIdx](../wiki/types.ExtrinsicData#extrinsicidx)

#### Defined in

[types/index.ts:376](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L376)

___

### fee

• **fee**: [`Fees`](../wiki/types.Fees)

#### Defined in

[types/index.ts:393](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L393)

___

### nonce

• **nonce**: ``null`` \| `BigNumber`

nonce of the transaction. Null for unsigned transactions where address is null

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[nonce](../wiki/types.ExtrinsicData#nonce)

#### Defined in

[types/index.ts:384](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L384)

___

### params

• **params**: `Record`<`string`, `unknown`\>[]

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[params](../wiki/types.ExtrinsicData#params)

#### Defined in

[types/index.ts:386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L386)

___

### specVersionId

• **specVersionId**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[specVersionId](../wiki/types.ExtrinsicData#specversionid)

#### Defined in

[types/index.ts:388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L388)

___

### success

• **success**: `boolean`

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[success](../wiki/types.ExtrinsicData#success)

#### Defined in

[types/index.ts:387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L387)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

#### Inherited from

[ExtrinsicData](../wiki/types.ExtrinsicData).[txTag](../wiki/types.ExtrinsicData#txtag)

#### Defined in

[types/index.ts:385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L385)
