# Class: Assets

[api/client/Assets](../wiki/api.client.Assets).Assets

Handles all Asset related functionality

## Table of contents

### Methods

- [createAsset](../wiki/api.client.Assets.Assets#createasset)
- [createNftCollection](../wiki/api.client.Assets.Assets#createnftcollection)
- [get](../wiki/api.client.Assets.Assets#get)
- [getAsset](../wiki/api.client.Assets.Assets#getasset)
- [getAssets](../wiki/api.client.Assets.Assets#getassets)
- [getFungibleAsset](../wiki/api.client.Assets.Assets#getfungibleasset)
- [getGlobalMetadataKeys](../wiki/api.client.Assets.Assets#getglobalmetadatakeys)
- [getNextCustomAssetTypeId](../wiki/api.client.Assets.Assets#getnextcustomassettypeid)
- [getNftCollection](../wiki/api.client.Assets.Assets#getnftcollection)
- [getTickerReservation](../wiki/api.client.Assets.Assets#gettickerreservation)
- [getTickerReservations](../wiki/api.client.Assets.Assets#gettickerreservations)
- [isTickerAvailable](../wiki/api.client.Assets.Assets#istickeravailable)
- [registerCustomAssetType](../wiki/api.client.Assets.Assets#registercustomassettype)
- [reserveTicker](../wiki/api.client.Assets.Assets#reserveticker)

## Methods

### createAsset

▸ **createAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Create an Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateAssetWithTickerParams`](../wiki/api.procedures.types.CreateAssetWithTickerParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

**`Note`**

if ticker is already reserved, then required role:
  - Ticker Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createAsset.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Assets.ts:114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L114)

___

### createNftCollection

▸ **createNftCollection**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection), [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>\>

Create an NftCollection

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateNftCollectionParams`](../wiki/api.procedures.types.CreateNftCollectionParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection), [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>\>

**`Note`**

if ticker is already reserved, then required role:
  - Ticker Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createNftCollection.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Assets.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L127)

___

### get

▸ **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

Retrieve all the Assets on chain

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

**`Note`**

supports pagination

#### Defined in

[api/client/Assets.ts:420](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L420)

___

### getAsset

▸ **getAsset**(`args`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

Retrieve a FungibleAsset or NftCollection

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

**`Note`**

`getFungibleAsset` and `getNftCollection` are similar to this method, but return a more specific type

#### Defined in

[api/client/Assets.ts:242](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L242)

▸ **getAsset**(`args`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.assetId` | `string` |

#### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

#### Defined in

[api/client/Assets.ts:243](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L243)

___

### getAssets

▸ **getAssets**(`args?`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)[]\>

Retrieve all of the Assets owned by an Identity

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.owner` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity representation or Identity ID as stored in the blockchain |

#### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)[]\>

**`Note`**

Assets with unreadable characters in their tickers will be left out

#### Defined in

[api/client/Assets.ts:272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L272)

___

### getFungibleAsset

▸ **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

Retrieve a FungibleAsset

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.assetId` | `string` | Unique Id of the Asset (for spec version 6.x, this is same as ticker) |

#### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Defined in

[api/client/Assets.ts:353](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L353)

▸ **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Defined in

[api/client/Assets.ts:354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L354)

___

### getGlobalMetadataKeys

▸ **getGlobalMetadataKeys**(): `Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs

#### Returns

`Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

#### Defined in

[api/client/Assets.ts:470](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L470)

___

### getNextCustomAssetTypeId

▸ **getNextCustomAssetTypeId**(): `Promise`\<`BigNumber`\>

Gets the next custom Asset type Id

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/client/Assets.ts:528](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L528)

___

### getNftCollection

▸ **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

Retrieve an NftCollection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.ticker` | `string` | NftCollection ticker |

#### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Defined in

[api/client/Assets.ts:385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L385)

▸ **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.assetId` | `string` |

#### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Defined in

[api/client/Assets.ts:386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L386)

___

### getTickerReservation

▸ **getTickerReservation**(`args`): [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)

Retrieve a Ticker Reservation

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.ticker` | `string` | Asset ticker |

#### Returns

[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)

#### Defined in

[api/client/Assets.ts:230](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L230)

___

### getTickerReservations

▸ **getTickerReservations**(`args?`): `Promise`\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)[]\>

Retrieve all the ticker reservations currently owned by an Identity. This doesn't include Assets that
  have already been launched

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.owner` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)[]\>

**`Note`**

reservations with unreadable characters in their tickers will be left out

#### Defined in

[api/client/Assets.ts:171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L171)

___

### isTickerAvailable

▸ **isTickerAvailable**(`args`): `Promise`\<`boolean`\>

Check if a ticker hasn't been reserved

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`\<`boolean`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/client/Assets.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L136)

▸ **isTickerAvailable**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/client/Assets.ts:137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L137)

___

### registerCustomAssetType

▸ **registerCustomAssetType**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

Register a custom asset type

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterCustomAssetTypeParams`](../wiki/api.procedures.types.RegisterCustomAssetTypeParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [registerCustomAssetType.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Assets.ts:521](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L521)

___

### reserveTicker

▸ **reserveTicker**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>

Reserve a ticker symbol under the ownership of the signing Identity to later use in the creation of an Asset.
  The ticker will expire after a set amount of time, after which other users can reserve it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ReserveTickerParams`](../wiki/api.procedures.types.ReserveTickerParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [reserveTicker.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Assets.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Assets.ts#L101)
