# Interface: BaseHistoricAssetTransaction

[api/entities/Asset/types](../wiki/api.entities.Asset.types).BaseHistoricAssetTransaction

## Hierarchy

- [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)

  ↳ **`BaseHistoricAssetTransaction`**

  ↳↳ [`HistoricAssetTransaction`](../wiki/api.entities.Asset.types.HistoricAssetTransaction)

  ↳↳ [`HistoricNftTransaction`](../wiki/api.entities.Asset.types.HistoricNftTransaction)

## Table of contents

### Properties

- [blockDate](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blockdate)
- [blockHash](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blockhash)
- [blockNumber](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blocknumber)
- [event](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#event)
- [eventIndex](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#eventindex)
- [extrinsicIndex](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#extrinsicindex)
- [from](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#from)
- [fundingRound](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#fundinground)
- [instructionId](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#instructionid)
- [instructionMemo](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#instructionmemo)
- [to](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#to)

## Properties

### blockDate

• **blockDate**: `Date`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockDate](../wiki/api.client.types.EventIdentifier#blockdate)

#### Defined in

[api/client/types.ts:179](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L179)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockHash](../wiki/api.client.types.EventIdentifier#blockhash)

#### Defined in

[api/client/types.ts:178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L178)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockNumber](../wiki/api.client.types.EventIdentifier#blocknumber)

#### Defined in

[api/client/types.ts:177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L177)

___

### event

• **event**: [`EventIdEnum`](../wiki/types.EventIdEnum)

Event identifying the type of transaction

#### Defined in

[api/entities/Asset/types.ts:163](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L163)

___

### eventIndex

• **eventIndex**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[eventIndex](../wiki/api.client.types.EventIdentifier#eventindex)

#### Defined in

[api/client/types.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L180)

___

### extrinsicIndex

• **extrinsicIndex**: `BigNumber`

Index value of the extrinsic which led to the Asset transaction within the `blockNumber` block

#### Defined in

[api/entities/Asset/types.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L168)

___

### from

• **from**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Origin portfolio involved in the transaction. This value will be null when the `event` value is `Issued`

#### Defined in

[api/entities/Asset/types.ts:154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L154)

___

### fundingRound

• `Optional` **fundingRound**: `string`

Name of the funding round (if provided while issuing the Asset). This value is present only when the value of `event` is `Issued`

#### Defined in

[api/entities/Asset/types.ts:173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L173)

___

### instructionId

• `Optional` **instructionId**: `BigNumber`

ID of the instruction being executed. This value is present only when the value of `event` is `Transfer`

#### Defined in

[api/entities/Asset/types.ts:177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L177)

___

### instructionMemo

• `Optional` **instructionMemo**: `string`

Memo provided against the executed instruction. This value is present only when the value of `event` is `Transfer`

#### Defined in

[api/entities/Asset/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L181)

___

### to

• **to**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Destination portfolio involved in the transaction . This value will be null when the `event` value is `Redeemed`

#### Defined in

[api/entities/Asset/types.ts:158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L158)
