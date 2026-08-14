[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Assets

# api/client/Assets

## Classes

### Assets

Defined in: [api/client/Assets.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L59)

Handles all Asset related functionality

#### Methods

##### createAsset()

> **createAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/client/Assets.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L116)

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

Defined in: [api/client/Assets.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L124)

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

Defined in: [api/client/Assets.ts:413](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L413)

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

Defined in: [api/client/Assets.ts:236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L236)

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

Defined in: [api/client/Assets.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L245)

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

Defined in: [api/client/Assets.ts:266](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L266)

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

Defined in: [api/client/Assets.ts:314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L314)

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

Defined in: [api/client/Assets.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L326)

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

Defined in: [api/client/Assets.ts:454](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L454)

Retrieve all the Asset Global Metadata on chain. This includes metadata id, name and specs

###### Returns

`Promise`\<[`GlobalMetadataKey`](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)[]\>

##### getNextCustomAssetTypeId()

> **getNextCustomAssetTypeId**(): `Promise`\<`BigNumber`\>

Defined in: [api/client/Assets.ts:507](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L507)

Gets the next custom Asset type Id

###### Returns

`Promise`\<`BigNumber`\>

##### getNftCollection()

###### Call Signature

> **getNftCollection**(`args`): `Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

Defined in: [api/client/Assets.ts:365](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L365)

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

Defined in: [api/client/Assets.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L373)

Retrieve an NftCollection by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; `skipExistsCheck?`: `boolean`; \} | - |
| `args.assetId` | `string` | Unique identifier of the NftCollection |
| `args.skipExistsCheck?` | `boolean` | When true, method will not check if the NftCollection exists before returning instance. Defaults to false |

###### Returns

`Promise`\<[`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)\>

##### getTickerRegistrationConfig()

> **getTickerRegistrationConfig**(): `Promise`\<[`TickerRegistrationConfig`](../wiki/api.entities.Asset.types#tickerregistrationconfig)\>

Defined in: [api/client/Assets.ts:535](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L535)

Gets the chain-wide rules used to validate ticker registrations

###### Returns

`Promise`\<[`TickerRegistrationConfig`](../wiki/api.entities.Asset.types#tickerregistrationconfig)\>

##### getTickerReservation()

> **getTickerReservation**(`args`): [`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)

Defined in: [api/client/Assets.ts:222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L222)

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

Defined in: [api/client/Assets.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L181)

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

Defined in: [api/client/Assets.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L133)

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

Defined in: [api/client/Assets.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L145)

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

Defined in: [api/client/Assets.ts:502](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L502)

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

Defined in: [api/client/Assets.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L108)

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

> **transferFunds**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction) \| `undefined`, [`Instruction`](../wiki/api.entities.Instruction#instruction) \| `undefined`\>\>

Defined in: [api/client/Assets.ts:530](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Assets.ts#L530)

Transfer funds between two asset holders (Account or Portfolio), which may be owned by the same or different identities.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferFundsParams`](../wiki/api.procedures.types#transferfundsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Instruction`](../wiki/api.entities.Instruction#instruction) \| `undefined`, [`Instruction`](../wiki/api.entities.Instruction#instruction) \| `undefined`\>\>

###### Note

When `from` account is of type account and the caller is the subsidizer of `from` account, there should be allowance available for transfer and for each transfer said amount is decremented.

###### Note

When `from` and `to` belong to different identities, this creates a settlement instruction that is immediately affirmed on behalf of `from`. If the caller's identity doesn't also own `to`, the instruction remains pending until the receiver affirms it (a resolved [Instruction](../wiki/api.entities.Instruction#instruction) is returned in that case). If both sides are affirmed, the transfer settles immediately and `undefined` is returned.

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [transferFunds.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
