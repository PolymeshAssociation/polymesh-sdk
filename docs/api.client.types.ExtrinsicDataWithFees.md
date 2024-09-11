# Interface: ExtrinsicDataWithFees

[api/client/types](../wiki/api.client.types).ExtrinsicDataWithFees

## Hierarchy

- [`ExtrinsicData`](../wiki/api.client.types.ExtrinsicData)

  ↳ **`ExtrinsicDataWithFees`**

## Table of contents

### Properties

- [address](../wiki/api.client.types.ExtrinsicDataWithFees#address)
- [blockDate](../wiki/api.client.types.ExtrinsicDataWithFees#blockdate)
- [blockHash](../wiki/api.client.types.ExtrinsicDataWithFees#blockhash)
- [blockNumber](../wiki/api.client.types.ExtrinsicDataWithFees#blocknumber)
- [extrinsicHash](../wiki/api.client.types.ExtrinsicDataWithFees#extrinsichash)
- [extrinsicIdx](../wiki/api.client.types.ExtrinsicDataWithFees#extrinsicidx)
- [fee](../wiki/api.client.types.ExtrinsicDataWithFees#fee)
- [nonce](../wiki/api.client.types.ExtrinsicDataWithFees#nonce)
- [params](../wiki/api.client.types.ExtrinsicDataWithFees#params)
- [specVersionId](../wiki/api.client.types.ExtrinsicDataWithFees#specversionid)
- [success](../wiki/api.client.types.ExtrinsicDataWithFees#success)
- [txTag](../wiki/api.client.types.ExtrinsicDataWithFees#txtag)

## Properties

### address

• **address**: ``null`` \| `string`

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[address](../wiki/api.client.types.ExtrinsicData#address)

#### Defined in

[api/client/types.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L14)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[blockDate](../wiki/api.client.types.ExtrinsicData#blockdate)

#### Defined in

[api/client/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L9)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[blockHash](../wiki/api.client.types.ExtrinsicData#blockhash)

#### Defined in

[api/client/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L7)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[blockNumber](../wiki/api.client.types.ExtrinsicData#blocknumber)

#### Defined in

[api/client/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L8)

___

### extrinsicHash

• **extrinsicHash**: `string`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[extrinsicHash](../wiki/api.client.types.ExtrinsicData#extrinsichash)

#### Defined in

[api/client/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L23)

___

### extrinsicIdx

• **extrinsicIdx**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[extrinsicIdx](../wiki/api.client.types.ExtrinsicData#extrinsicidx)

#### Defined in

[api/client/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L10)

___

### fee

• **fee**: [`Fees`](../wiki/api.client.types.Fees)

#### Defined in

[api/client/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L27)

___

### nonce

• **nonce**: ``null`` \| `BigNumber`

nonce of the transaction. Null for unsigned transactions where address is null

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[nonce](../wiki/api.client.types.ExtrinsicData#nonce)

#### Defined in

[api/client/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L18)

___

### params

• **params**: `Record`\<`string`, `unknown`\>[]

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[params](../wiki/api.client.types.ExtrinsicData#params)

#### Defined in

[api/client/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L20)

___

### specVersionId

• **specVersionId**: `BigNumber`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[specVersionId](../wiki/api.client.types.ExtrinsicData#specversionid)

#### Defined in

[api/client/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L22)

___

### success

• **success**: `boolean`

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[success](../wiki/api.client.types.ExtrinsicData#success)

#### Defined in

[api/client/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L21)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

#### Inherited from

[ExtrinsicData](../wiki/api.client.types.ExtrinsicData).[txTag](../wiki/api.client.types.ExtrinsicData#txtag)

#### Defined in

[api/client/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L19)
