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

[api/client/Assets.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L113)

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

[api/client/Assets.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L126)

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

[api/client/Assets.ts:386](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L386)

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

[api/client/Assets.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L221)

▸ **getAsset**(`args`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.assetId` | `string` |

#### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>

#### Defined in

[api/client/Assets.ts:222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L222)

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

[api/client/Assets.ts:243](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L243)

___

### getFungibleAsset

▸ **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

Retrieve a FungibleAsset

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.assetId` | `string` | Unique Id of the Fungible Asset (for spec version 6.x, this is same as ticker) |
| `args.skipExistsCheck?` | `boolean` | when true, method will not check if the Asset exists |

#### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Defined in

[api/client/Assets.ts:292](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L292)

▸ **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.skipExistsCheck?` | `boolean` |
| `args.ticker` | `string` |

#### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

#### Defined in

[api/client/Assets.ts:298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L298)

___

### getGlobalMetadataKeys

▸ **getGlobalMetadataKeys**(): `Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs

#### Returns

`Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

#### Defined in

[api/client/Assets.ts:427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L427)

___

### getNextCustomAssetTypeId

▸ **getNextCustomAssetTypeId**(): `Promise`\<`BigNumber`\>

Gets the next custom Asset type Id

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/client/Assets.ts:485](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L485)

___

### getNftCollection

▸ **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

Retrieve an NftCollection

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.skipExistsCheck?` | `boolean` | when true, method will not check if the NftCollection exists |
| `args.ticker` | `string` | NftCollection ticker |

#### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Defined in

[api/client/Assets.ts:340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L340)

▸ **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.assetId` | `string` |
| `args.skipExistsCheck?` | `boolean` |

#### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)\>

#### Defined in

[api/client/Assets.ts:346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L346)

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

[api/client/Assets.ts:209](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L209)

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

[api/client/Assets.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L170)

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

[api/client/Assets.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L135)

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

[api/client/Assets.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L136)

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

[api/client/Assets.ts:478](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L478)

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

[api/client/Assets.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Assets.ts#L100)
