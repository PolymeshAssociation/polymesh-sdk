# Interface: ExtrinsicData

[api/client/types](../wiki/api.client.types).ExtrinsicData

## Hierarchy

- **`ExtrinsicData`**

  ↳ [`ExtrinsicDataWithFees`](../wiki/api.client.types.ExtrinsicDataWithFees)

## Table of contents

### Properties

- [address](../wiki/api.client.types.ExtrinsicData#address)
- [blockDate](../wiki/api.client.types.ExtrinsicData#blockdate)
- [blockHash](../wiki/api.client.types.ExtrinsicData#blockhash)
- [blockNumber](../wiki/api.client.types.ExtrinsicData#blocknumber)
- [extrinsicHash](../wiki/api.client.types.ExtrinsicData#extrinsichash)
- [extrinsicIdx](../wiki/api.client.types.ExtrinsicData#extrinsicidx)
- [nonce](../wiki/api.client.types.ExtrinsicData#nonce)
- [params](../wiki/api.client.types.ExtrinsicData#params)
- [specVersionId](../wiki/api.client.types.ExtrinsicData#specversionid)
- [success](../wiki/api.client.types.ExtrinsicData#success)
- [txTag](../wiki/api.client.types.ExtrinsicData#txtag)

## Properties

### address

• **address**: ``null`` \| `string`

public key of the signer. Unsigned transactions have no signer, in which case this value is null (example: an enacted governance proposal)

#### Defined in

[api/client/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L15)

___

### blockDate

• **blockDate**: `Date`

#### Defined in

[api/client/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L10)

___

### blockHash

• **blockHash**: `string`

#### Defined in

[api/client/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L8)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Defined in

[api/client/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L9)

___

### extrinsicHash

• **extrinsicHash**: `string`

#### Defined in

[api/client/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L24)

___

### extrinsicIdx

• **extrinsicIdx**: `BigNumber`

#### Defined in

[api/client/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L11)

___

### nonce

• **nonce**: ``null`` \| `BigNumber`

nonce of the transaction. Null for unsigned transactions where address is null

#### Defined in

[api/client/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L19)

___

### params

• **params**: `Record`\<`string`, `unknown`\>[]

#### Defined in

[api/client/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L21)

___

### specVersionId

• **specVersionId**: `BigNumber`

#### Defined in

[api/client/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L23)

___

### success

• **success**: `boolean`

#### Defined in

[api/client/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L22)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

#### Defined in

[api/client/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L20)
