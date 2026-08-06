[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/NonFungible/NftCollection

# api/entities/Asset/NonFungible/NftCollection

## Classes

### NftCollection

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L74)

Class used to manage NFT functionality

#### Extends

- [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)

#### Properties

##### assetHolders

> **assetHolders**: [`AssetHolders`](../wiki/api.entities.Asset.NonFungible.AssetHolders#assetholders)

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L75)

##### compliance

> **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance#compliance)

Defined in: [api/entities/Asset/Base/BaseAsset.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L71)

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`compliance`](../wiki/api.entities.Asset.Base.BaseAsset#compliance)

##### documents

> **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents#documents)

Defined in: [api/entities/Asset/Base/BaseAsset.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L72)

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`documents`](../wiki/api.entities.Asset.Base.BaseAsset#documents)

##### id

> **id**: `string`

Defined in: [api/entities/Asset/Base/BaseAsset.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L79)

Unique ID of the Asset in UUID format

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`id`](../wiki/api.entities.Asset.Base.BaseAsset#id)

##### metadata

> **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata#metadata)

Defined in: [api/entities/Asset/Base/BaseAsset.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L73)

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`metadata`](../wiki/api.entities.Asset.Base.BaseAsset#metadata)

##### permissions

> **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions#permissions)

Defined in: [api/entities/Asset/Base/BaseAsset.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L74)

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`permissions`](../wiki/api.entities.Asset.Base.BaseAsset#permissions)

##### settlements

> **settlements**: [`NonFungibleSettlements`](../wiki/api.entities.Asset.Base.Settlements#nonfungiblesettlements)

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L76)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`uuid`](../wiki/api.entities.Asset.Base.BaseAsset#uuid)

#### Accessors

##### rawId

###### Get Signature

> **get** **rawId**(): `string`

Defined in: [api/entities/Asset/Base/BaseAsset.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L86)

Unique ID of the Asset in hex format

###### Note

Although UUID format is the usual representation of asset IDs, generic polkadot/substrate tools usually expect it in hex format

###### Returns

`string`

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`rawId`](../wiki/api.entities.Asset.Base.BaseAsset#rawid)

#### Methods

##### addRequiredMediators()

> **addRequiredMediators**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L213)

Add required mediators. Mediators must approve any trades involving the asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AssetMediatorParams`](../wiki/api.procedures.types#assetmediatorparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addRequiredMediators.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`addRequiredMediators`](../wiki/api.entities.Asset.Base.BaseAsset#addrequiredmediators)

##### batchIssue()

> **batchIssue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[], [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[]\>\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L89)

Issues mulitple NFTs for the collection

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`BatchIssueNftParams`](../wiki/api.procedures.types#batchissuenftparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[], [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[]\>\>

###### Note

Each NFT requires metadata for each value returned by `collectionKeys`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value complies with the specification.

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [batchIssue.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### collectionKeys()

> **collectionKeys**(): `Promise`\<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L202)

Retrieve the metadata that defines the NFT collection. Every `issue` call for this collection must provide a value for each element returned

###### Returns

`Promise`\<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

###### Note

Each NFT **must** have an entry for each value, it **should** comply with the spec.
In other words, the SDK only validates the presence of metadata keys, additional validation should be used when issuing

##### controllerTransfer()

> **controllerTransfer**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L94)

Force a transfer from the origin portfolio to one of the caller's portfolios

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`NftControllerTransferParams`](../wiki/api.procedures.types#nftcontrollertransferparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [controllerTransfer.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createdAt()

> **createdAt**(): `Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L291)

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

###### Returns

`Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

###### Note

uses the middlewareV2

###### Note

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

##### currentFundingRound()

###### Call Signature

> **currentFundingRound**(): `Promise`\<`string` \| `null`\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:500](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L500)

Retrieve the Asset's funding round

###### Returns

`Promise`\<`string` \| `null`\>

Promise that resolves to the current funding round name or null if not set

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`currentFundingRound`](../wiki/api.entities.Asset.Base.BaseAsset#currentfundinground)

###### Call Signature

> **currentFundingRound**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:510](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L510)

Retrieve the Asset's funding round

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`string` \| `null`\> | Callback function that receives funding round updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`currentFundingRound`](../wiki/api.entities.Asset.Base.BaseAsset#currentfundinground)

##### details()

###### Call Signature

> **details**(): `Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types#assetdetails)\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L143)

Retrieve the NftCollection's data

###### Returns

`Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types#assetdetails)\>

Promise that resolves to the NftCollection details

###### Overrides

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`details`](../wiki/api.entities.Asset.Base.BaseAsset#details)

###### Call Signature

> **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:153](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L153)

Retrieve the NftCollection's data

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AssetDetails`](../wiki/api.entities.Asset.types#assetdetails)\> | Callback function that receives NftCollection details updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Overrides

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`details`](../wiki/api.entities.Asset.Base.BaseAsset#details)

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L314)

Determine whether this NftCollection exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

`BaseAsset.exists`

##### freeze()

> **freeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L203)

Freeze transfers of the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [freeze.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`freeze`](../wiki/api.entities.Asset.Base.BaseAsset#freeze)

##### getCollectionId()

> **getCollectionId**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:333](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L333)

Returns the collection's on chain numeric ID. Used primarily to access NFT specific storage values

###### Returns

`Promise`\<`BigNumber`\>

##### getIdentifiers()

###### Call Signature

> **getIdentifiers**(): `Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:242](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L242)

Retrieve the Asset's identifiers list

###### Returns

`Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]\>

Promise that resolves to the list of security identifiers

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`getIdentifiers`](../wiki/api.entities.Asset.Base.BaseAsset#getidentifiers)

###### Call Signature

> **getIdentifiers**(`callback?`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:252](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L252)

Retrieve the Asset's identifiers list

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback?` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]\> | Callback function that receives identifier updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`getIdentifiers`](../wiki/api.entities.Asset.Base.BaseAsset#getidentifiers)

##### getIssuedInFundingRound()

> **getIssuedInFundingRound**(`fundingRound`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:546](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L546)

Retrieve the total amount of the Asset issued in the given funding round

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fundingRound` | `string` | name of the funding round to query |

###### Returns

`Promise`\<`BigNumber`\>

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`getIssuedInFundingRound`](../wiki/api.entities.Asset.Base.BaseAsset#getissuedinfundinground)

##### getNft()

> **getNft**(`args`): `Promise`\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:267](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L267)

Get an NFT belonging to this collection

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)\>

###### Throws

if the given NFT does not exist

##### getRequiredMediators()

> **getRequiredMediators**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)[]\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:445](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L445)

Get required Asset mediators. These Identities must approve any Instruction involving the asset

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)[]\>

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`getRequiredMediators`](../wiki/api.entities.Asset.Base.BaseAsset#getrequiredmediators)

##### getTransactionHistory()

> **getTransactionHistory**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricNftTransaction`](../wiki/api.entities.Asset.types#historicnfttransaction)\>\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:360](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L360)

Retrieve this Collection's transaction history

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricNftTransaction`](../wiki/api.entities.Asset.types#historicnfttransaction)\>\>

###### Note

uses the middlewareV2

##### getVenueFilteringDetails()

> **getVenueFilteringDetails**(): `Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types#venuefilteringdetails)\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:465](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L465)

Get venue filtering details

###### Returns

`Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types#venuefilteringdetails)\>

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`getVenueFilteringDetails`](../wiki/api.entities.Asset.Base.BaseAsset#getvenuefilteringdetails)

##### investorCount()

> **investorCount**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L245)

Retrieve the amount of unique investors that hold this Nft

###### Returns

`Promise`\<`BigNumber`\>

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`isEqual`](../wiki/api.entities.Asset.Base.BaseAsset#isequal)

##### isFrozen()

###### Call Signature

> **isFrozen**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L290)

Check whether transfers are frozen for the Asset

###### Returns

`Promise`\<`boolean`\>

Promise that resolves to true if transfers are frozen, false otherwise

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`isFrozen`](../wiki/api.entities.Asset.Base.BaseAsset#isfrozen)

###### Call Signature

> **isFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:300](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L300)

Check whether transfers are frozen for the Asset

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> | Callback function that receives frozen status updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`isFrozen`](../wiki/api.entities.Asset.Base.BaseAsset#isfrozen)

##### issue()

> **issue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[], [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)\>\>

Defined in: [api/entities/Asset/NonFungible/NftCollection.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/NftCollection.ts#L82)

Issues a new NFT for the collection

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`IssueNftParams`](../wiki/api.procedures.types#issuenftparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[], [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)\>\>

###### Note

Each NFT requires metadata for each value returned by `collectionKeys`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value complies with the specification.

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [issue.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### linkTicker()

> **linkTicker**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L226)

Link ticker to the asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`LinkTickerToAssetParams`](../wiki/api.procedures.types#linktickertoassetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

if ticker is already reserved, then required role:
- Ticker Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [linkTicker.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`linkTicker`](../wiki/api.entities.Asset.Base.BaseAsset#linkticker)

##### modify()

> **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3), [`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:122](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L122)

Modify some properties of the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyAssetParams`](../wiki/api.procedures.types#modifyassetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3), [`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

###### Throws

if the passed values result in no changes being made to the Asset

###### Throws

if the passed assetType is not a known asset type or a custom type that has not been created on the chain

###### Throws

if trying to modify an NftCollection's assetType

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`modify`](../wiki/api.entities.Asset.Base.BaseAsset#modify)

##### removeRequiredMediators()

> **removeRequiredMediators**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L218)

Remove required mediators

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AssetMediatorParams`](../wiki/api.procedures.types#assetmediatorparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeRequiredMediators.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`removeRequiredMediators`](../wiki/api.entities.Asset.Base.BaseAsset#removerequiredmediators)

##### setVenueFiltering()

> **setVenueFiltering**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L103)

Enable/disable venue filtering for this Asset and/or set allowed/disallowed venues

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetVenueFilteringParams`](../wiki/api.procedures.types#setvenuefilteringparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setVenueFiltering.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`setVenueFiltering`](../wiki/api.entities.Asset.Base.BaseAsset#setvenuefiltering)

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Asset/Base/BaseAsset.ts:589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L589)

Return the BaseAsset's ID

###### Returns

`string`

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`toHuman`](../wiki/api.entities.Asset.Base.BaseAsset#tohuman)

##### transferOwnership()

> **transferOwnership**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L98)

Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
  by the recipient

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferAssetOwnershipParams`](../wiki/api.procedures.types#transferassetownershipparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

this will create [Authorization Request](../wiki/api.entities.types#authorizationrequest) which has to be accepted by the `target` Identity.
  An [api/entities/Account!Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [transferOwnership.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`transferOwnership`](../wiki/api.entities.Asset.Base.BaseAsset#transferownership)

##### unfreeze()

> **unfreeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L208)

Unfreeze transfers of the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unfreeze.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`unfreeze`](../wiki/api.entities.Asset.Base.BaseAsset#unfreeze)

##### unlinkTicker()

> **unlinkTicker**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/BaseAsset.ts:235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/BaseAsset.ts#L235)

Unlink ticker from the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

Only the ticker owner is allowed to unlink the Asset

###### Throws

if there is no ticker to unlink

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unlinkTicker.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`unlinkTicker`](../wiki/api.entities.Asset.Base.BaseAsset#unlinkticker)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`generateUuid`](../wiki/api.entities.Asset.Base.BaseAsset#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset).[`unserialize`](../wiki/api.entities.Asset.Base.BaseAsset#unserialize)
