# Interface: HistoricAssetTransaction

[api/entities/Asset/types](../wiki/api.entities.Asset.types).HistoricAssetTransaction

## Hierarchy

- [`BaseHistoricAssetTransaction`](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction)

  ↳ **`HistoricAssetTransaction`**

## Table of contents

### Properties

- [amount](../wiki/api.entities.Asset.types.HistoricAssetTransaction#amount)
- [asset](../wiki/api.entities.Asset.types.HistoricAssetTransaction#asset)
- [blockDate](../wiki/api.entities.Asset.types.HistoricAssetTransaction#blockdate)
- [blockHash](../wiki/api.entities.Asset.types.HistoricAssetTransaction#blockhash)
- [blockNumber](../wiki/api.entities.Asset.types.HistoricAssetTransaction#blocknumber)
- [event](../wiki/api.entities.Asset.types.HistoricAssetTransaction#event)
- [eventIndex](../wiki/api.entities.Asset.types.HistoricAssetTransaction#eventindex)
- [extrinsicIndex](../wiki/api.entities.Asset.types.HistoricAssetTransaction#extrinsicindex)
- [from](../wiki/api.entities.Asset.types.HistoricAssetTransaction#from)
- [fundingRound](../wiki/api.entities.Asset.types.HistoricAssetTransaction#fundinground)
- [instructionId](../wiki/api.entities.Asset.types.HistoricAssetTransaction#instructionid)
- [instructionMemo](../wiki/api.entities.Asset.types.HistoricAssetTransaction#instructionmemo)
- [to](../wiki/api.entities.Asset.types.HistoricAssetTransaction#to)

## Properties

### amount

• **amount**: `BigNumber`

Amount of the fungible tokens involved in the transaction

#### Defined in

[api/entities/Asset/types.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L189)

___

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

#### Defined in

[api/entities/Asset/types.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L184)

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

### to

• **to**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Destination portfolio involved in the transaction . This value will be null when the `event` value is `Redeemed`

#### Inherited from

[BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction).[to](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction#to)

#### Defined in

[api/entities/Asset/types.ts:157](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L157)
