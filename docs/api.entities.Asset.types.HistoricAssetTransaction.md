# Interface: HistoricAssetTransaction

[api/entities/Asset/types](../wiki/api.entities.Asset.types).HistoricAssetTransaction

## Hierarchy

- [`EventIdentifier`](../wiki/types.EventIdentifier)

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
- [to](../wiki/api.entities.Asset.types.HistoricAssetTransaction#to)

## Properties

### amount

• **amount**: `BigNumber`

#### Defined in

[api/entities/Asset/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L90)

___

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

#### Defined in

[api/entities/Asset/types.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L89)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockDate](../wiki/types.EventIdentifier#blockdate)

#### Defined in

[types/index.ts:755](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L755)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockHash](../wiki/types.EventIdentifier#blockhash)

#### Defined in

[types/index.ts:754](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L754)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockNumber](../wiki/types.EventIdentifier#blocknumber)

#### Defined in

[types/index.ts:753](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L753)

___

### event

• **event**: [`EventIdEnum`](../wiki/types.EventIdEnum)

#### Defined in

[api/entities/Asset/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L93)

___

### eventIndex

• **eventIndex**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[eventIndex](../wiki/types.EventIdentifier#eventindex)

#### Defined in

[types/index.ts:756](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L756)

___

### extrinsicIndex

• **extrinsicIndex**: `BigNumber`

#### Defined in

[api/entities/Asset/types.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L94)

___

### from

• **from**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

#### Defined in

[api/entities/Asset/types.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L91)

___

### to

• **to**: ``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

#### Defined in

[api/entities/Asset/types.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L92)
