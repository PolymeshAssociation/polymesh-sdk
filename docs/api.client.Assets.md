[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Assets

# api/client/Assets

## Classes

### Assets

Defined in: [api/client/Assets.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L58)

Handles all Asset related functionality

#### Methods

##### createAsset()

> **createAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/client/Assets.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L115)

Create an Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateAssetWithTickerParams`](../wiki/api.procedures.types#createassetwithtickerparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

###### Note

if ticker is already reserved, then required role:
  - Ticker Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createAsset.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createNftCollection()

> **createNftCollection**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection), [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>\>

Defined in: [api/client/Assets.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L123)

Create an NftCollection

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateNftCollectionParams`](../wiki/api.procedures.types#createnftcollectionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection), [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>\>

###### Note

if ticker is already reserved, then required role:
  - Ticker Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createNftCollection.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

Defined in: [api/client/Assets.ts:412](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L412)

Retrieve all the Assets on chain

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

###### Note

supports pagination

##### getAsset()

###### Call Signature

> **getAsset**(`args`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>

Defined in: [api/client/Assets.ts:235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L235)

Retrieve a FungibleAsset or NftCollection by ticker

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Unique ticker of the Asset |

###### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>

###### Note

`getFungibleAsset` and `getNftCollection` are similar to this method, but return a more specific type

###### Call Signature

> **getAsset**(`args`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>

Defined in: [api/client/Assets.ts:244](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L244)

Retrieve a FungibleAsset or NftCollection by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; \} | - |
| `args.assetId` | `string` | Unique identifier of the Asset |

###### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>

###### Note

`getFungibleAsset` and `getNftCollection` are similar to this method, but return a more specific type

##### getAssets()

> **getAssets**(`args?`): `Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)[]\>

Defined in: [api/client/Assets.ts:265](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L265)

Retrieve all of the Assets owned by an Identity

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `owner`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.owner?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity representation or Identity ID as stored in the blockchain |

###### Returns

`Promise`\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)[]\>

###### Note

Assets with unreadable characters in their tickers will be left out

##### getFungibleAsset()

###### Call Signature

> **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

Defined in: [api/client/Assets.ts:313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L313)

Retrieve a FungibleAsset by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; `skipExistsCheck?`: `boolean`; \} | - |
| `args.assetId` | `string` | Unique identifier of the Fungible Asset |
| `args.skipExistsCheck?` | `boolean` | When true, method will not check if Asset exists before returning instance. Defaults to false |

###### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

###### Call Signature

> **getFungibleAsset**(`args`): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

Defined in: [api/client/Assets.ts:325](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L325)

Retrieve a FungibleAsset by ticker

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Unique ticker of the Fungible Asset |

###### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

###### Note

The Asset must exist on chain to be retrieved by ticker

##### getGlobalMetadataKeys()

> **getGlobalMetadataKeys**(): `Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

Defined in: [api/client/Assets.ts:453](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L453)

Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs

###### Returns

`Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

##### getNextCustomAssetTypeId()

> **getNextCustomAssetTypeId**(): `Promise`\<`BigNumber`\>

Defined in: [api/client/Assets.ts:506](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L506)

Gets the next custom Asset type Id

###### Returns

`Promise`\<`BigNumber`\>

##### getNftCollection()

###### Call Signature

> **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

Defined in: [api/client/Assets.ts:364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L364)

Retrieve an NftCollection by ticker

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Unique ticker of the NftCollection |

###### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

###### Note

The NftCollection must exist on chain to be retrieved by ticker

###### Call Signature

> **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

Defined in: [api/client/Assets.ts:372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L372)

Retrieve an NftCollection by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; `skipExistsCheck?`: `boolean`; \} | - |
| `args.assetId` | `string` | Unique identifier of the NftCollection (for spec version 6.x, this is same as ticker) |
| `args.skipExistsCheck?` | `boolean` | When true, method will not check if the NftCollection exists before returning instance. Defaults to false |

###### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

##### getTickerRegistrationConfig()

> **getTickerRegistrationConfig**(): `Promise`\<[`TickerRegistrationConfig`](../wiki/api.entities.Asset.types#tickerregistrationconfig)\>

Defined in: [api/client/Assets.ts:534](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L534)

Gets the chain-wide rules used to validate ticker registrations

###### Returns

`Promise`\<[`TickerRegistrationConfig`](../wiki/api.entities.Asset.types#tickerregistrationconfig)\>

##### getTickerReservation()

> **getTickerReservation**(`args`): [`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)

Defined in: [api/client/Assets.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L221)

Retrieve a Ticker Reservation

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Asset ticker |

###### Returns

[`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)

##### getTickerReservations()

> **getTickerReservations**(`args?`): `Promise`\<[`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)[]\>

Defined in: [api/client/Assets.ts:180](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L180)

Retrieve all the ticker reservations currently owned by an Identity. This doesn't include tickers already
associated with an Asset

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `owner`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.owner?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | The identity whose reservations to return. Defaults to the signing Identity if omitted. |

###### Returns

`Promise`\<[`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)[]\>

A list of active `TickerReservation` instances

###### Note

Reservations with unreadable ticker characters are excluded.

##### isTickerAvailable()

###### Call Signature

> **isTickerAvailable**(`args`): `Promise`\<`boolean`\>

Defined in: [api/client/Assets.ts:132](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L132)

Check if a ticker hasn't been reserved

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Ticker symbol to check availability for |

###### Returns

`Promise`\<`boolean`\>

Promise that resolves to true if ticker is available, false otherwise

###### Call Signature

> **isTickerAvailable**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/client/Assets.ts:144](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L144)

Check if a ticker hasn't been reserved (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Ticker symbol to check availability for |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> | Callback function that receives availability status updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### registerCustomAssetType()

> **registerCustomAssetType**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

Defined in: [api/client/Assets.ts:501](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L501)

Register a custom asset type

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RegisterCustomAssetTypeParams`](../wiki/api.procedures.types#registercustomassettypeparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [registerCustomAssetType.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### reserveTicker()

> **reserveTicker**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation), [`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)\>\>

Defined in: [api/client/Assets.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L107)

Reserve a ticker symbol under the ownership of the signing Identity to later use in the creation of an Asset.
  The ticker will expire after a set amount of time, after which other users can reserve it

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ReserveTickerParams`](../wiki/api.procedures.types#reservetickerparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation), [`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [reserveTicker.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### transferFunds()

> **transferFunds**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Assets.ts:529](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Assets.ts#L529)

Transfer funds between two asset holders (Account or Portfolio) owned by same identity.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferFundsParams`](../wiki/api.procedures.types#transferfundsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

When `from` account is of type account and the caller is the subsidizer of `from` account, there should be allowance available for transfer and for each transfer said amount is decremented.

###### Note

To transfer between asset holders owned by separate DID use settlement instructions

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [transferFunds.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
