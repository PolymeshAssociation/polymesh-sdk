# Interface: HistoricNftTransaction

[api/entities/Asset/types](../wiki/api.entities.Asset.types).HistoricNftTransaction

## Hierarchy

- [`BaseHistoricAssetTransaction`](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction)

  ↳ **`HistoricNftTransaction`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.Asset.types.HistoricNftTransaction#asset)
- [blockDate](../wiki/api.entities.Asset.types.HistoricNftTransaction#blockdate)
- [blockHash](../wiki/api.entities.Asset.types.HistoricNftTransaction#blockhash)
- [blockNumber](../wiki/api.entities.Asset.types.HistoricNftTransaction#blocknumber)
- [event](../wiki/api.entities.Asset.types.HistoricNftTransaction#event)
- [eventIndex](../wiki/api.entities.Asset.types.HistoricNftTransaction#eventindex)
- [extrinsicIndex](../wiki/api.entities.Asset.types.HistoricNftTransaction#extrinsicindex)
- [from](../wiki/api.entities.Asset.types.HistoricNftTransaction#from)
- [fundingRound](../wiki/api.entities.Asset.types.HistoricNftTransaction#fundinground)
- [instructionId](../wiki/api.entities.Asset.types.HistoricNftTransaction#instructionid)
- [instructionMemo](../wiki/api.entities.Asset.types.HistoricNftTransaction#instructionmemo)
- [nfts](../wiki/api.entities.Asset.types.HistoricNftTransaction#nfts)
- [to](../wiki/api.entities.Asset.types.HistoricNftTransaction#to)

## Properties

### asset

• **asset**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

#### Defined in

[api/entities/Asset/types.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L193)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[blockDate](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blockdate)

#### Defined in

[api/client/types.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L170)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[blockHash](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blockhash)

#### Defined in

[api/client/types.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L169)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[blockNumber](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#blocknumber)

#### Defined in

[api/client/types.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L168)

___

### event

• **event**: [`EventIdEnum`](../wiki/types.EventIdEnum)

Event identifying the type of transaction

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[event](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#event)

#### Defined in

[api/entities/Asset/types.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L162)

___

### eventIndex

• **eventIndex**: `BigNumber`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[eventIndex](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#eventindex)

#### Defined in

[api/client/types.ts:171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L171)

___

### extrinsicIndex

• **extrinsicIndex**: `BigNumber`

Index value of the extrinsic which led to the Asset transaction within the `blockNumber` block

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[extrinsicIndex](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#extrinsicindex)

#### Defined in

[api/entities/Asset/types.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L167)

___

### from

• **from**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Origin portfolio involved in the transaction. This value will be null when the `event` value is `Issued`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[from](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#from)

#### Defined in

[api/entities/Asset/types.ts:153](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L153)

___

### fundingRound

• `Optional` **fundingRound**: `string`

Name of the funding round (if provided while issuing the Asset). This value is present only when the value of `event` is `Issued`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[fundingRound](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#fundinground)

#### Defined in

[api/entities/Asset/types.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L172)

___

### instructionId

• `Optional` **instructionId**: `BigNumber`

ID of the instruction being executed. This value is present only when the value of `event` is `Transfer`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[instructionId](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#instructionid)

#### Defined in

[api/entities/Asset/types.ts:176](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L176)

___

### instructionMemo

• `Optional` **instructionMemo**: `string`

Memo provided against the executed instruction. This value is present only when the value of `event` is `Transfer`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[instructionMemo](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#instructionmemo)

#### Defined in

[api/entities/Asset/types.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L180)

___

### nfts

• **nfts**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)[]

The specific NFTs involved in the transaction

#### Defined in

[api/entities/Asset/types.ts:198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L198)

___

### to

• **to**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Destination portfolio involved in the transaction . This value will be null when the `event` value is `Redeemed`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[to](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#to)

#### Defined in

[api/entities/Asset/types.ts:157](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L157)
