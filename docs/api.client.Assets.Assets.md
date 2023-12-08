# Class: Assets

[api/client/Assets](../wiki/api.client.Assets).Assets

Handles all Asset related functionality

## Table of contents

### Methods

- [createAsset](../wiki/api.client.Assets.Assets#createasset)
- [get](../wiki/api.client.Assets.Assets#get)
- [getAsset](../wiki/api.client.Assets.Assets#getasset)
- [getAssets](../wiki/api.client.Assets.Assets#getassets)
- [getGlobalMetadataKeys](../wiki/api.client.Assets.Assets#getglobalmetadatakeys)
- [getTickerReservation](../wiki/api.client.Assets.Assets#gettickerreservation)
- [getTickerReservations](../wiki/api.client.Assets.Assets#gettickerreservations)
- [isTickerAvailable](../wiki/api.client.Assets.Assets#istickeravailable)
- [reserveTicker](../wiki/api.client.Assets.Assets#reserveticker)

## Methods

### createAsset

▸ **createAsset**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Asset`](../wiki/api.entities.Asset.Asset), [`Asset`](../wiki/api.entities.Asset.Asset)\>\>

Create an Asset

**`Note`**

 if ticker is already reserved, then required role:
  - Ticker Owner

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createAsset.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateAssetWithTickerParams`](../wiki/api.procedures.types.CreateAssetWithTickerParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Asset`](../wiki/api.entities.Asset.Asset), [`Asset`](../wiki/api.entities.Asset.Asset)\>\>

___

### get

▸ **get**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`Asset`](../wiki/api.entities.Asset.Asset)\>\>

Retrieve all the Assets on chain

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`Asset`](../wiki/api.entities.Asset.Asset)\>\>

___

### getAsset

▸ **getAsset**(`args`): `Promise`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

Retrieve an Asset

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.ticker` | `string` | Asset ticker |

#### Returns

`Promise`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

___

### getAssets

▸ **getAssets**(`args?`): `Promise`<[`Asset`](../wiki/api.entities.Asset.Asset)[]\>

Retrieve all of the Assets owned by an Identity

**`Note`**

 Assets with unreadable characters in their tickers will be left out

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.owner` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity representation or Identity ID as stored in the blockchain |

#### Returns

`Promise`<[`Asset`](../wiki/api.entities.Asset.Asset)[]\>

___

### getGlobalMetadataKeys

▸ **getGlobalMetadataKeys**(): `Promise`<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs

#### Returns

`Promise`<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

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

___

### getTickerReservations

▸ **getTickerReservations**(`args?`): `Promise`<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)[]\>

Retrieve all the ticker reservations currently owned by an Identity. This doesn't include Assets that
  have already been launched

**`Note`**

 reservations with unreadable characters in their tickers will be left out

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.owner` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)[]\>

___

### isTickerAvailable

▸ **isTickerAvailable**(`args`): `Promise`<`boolean`\>

Check if a ticker hasn't been reserved

**`Note`**

 can be subscribed to

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`<`boolean`\>

▸ **isTickerAvailable**(`args`, `callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<`boolean`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### reserveTicker

▸ **reserveTicker**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>

Reserve a ticker symbol under the ownership of the signing Identity to later use in the creation of an Asset.
  The ticker will expire after a set amount of time, after which other users can reserve it

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [reserveTicker.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ReserveTickerParams`](../wiki/api.procedures.types.ReserveTickerParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>
