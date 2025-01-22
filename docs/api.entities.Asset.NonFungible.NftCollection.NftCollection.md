# Class: NftCollection

[api/entities/Asset/NonFungible/NftCollection](../wiki/api.entities.Asset.NonFungible.NftCollection).NftCollection

Class used to manage NFT functionality

## Hierarchy

- [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

  ↳ **`NftCollection`**

## Table of contents

### Properties

- [assetHolders](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#assetholders)
- [compliance](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#compliance)
- [did](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#did)
- [documents](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#documents)
- [id](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#id)
- [metadata](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#metadata)
- [permissions](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#permissions)
- [settlements](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#settlements)
- [ticker](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#ticker)
- [uuid](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#uuid)

### Accessors

- [rawId](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#rawid)

### Methods

- [addRequiredMediators](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#addrequiredmediators)
- [collectionKeys](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#collectionkeys)
- [controllerTransfer](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#controllertransfer)
- [createdAt](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#createdat)
- [currentFundingRound](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#currentfundinground)
- [details](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#details)
- [exists](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#exists)
- [freeze](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#freeze)
- [getCollectionId](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getcollectionid)
- [getIdentifiers](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getidentifiers)
- [getNft](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getnft)
- [getRequiredMediators](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getrequiredmediators)
- [getTransactionHistory](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#gettransactionhistory)
- [getVenueFilteringDetails](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getvenuefilteringdetails)
- [investorCount](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#investorcount)
- [isEqual](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#isequal)
- [isFrozen](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#isfrozen)
- [issue](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#issue)
- [linkTicker](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#linkticker)
- [modify](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#modify)
- [removeRequiredMediators](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#removerequiredmediators)
- [setVenueFiltering](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#setvenuefiltering)
- [toHuman](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#transferownership)
- [unfreeze](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#unfreeze)
- [unlinkTicker](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#unlinkticker)
- [generateUuid](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#generateuuid)
- [unserialize](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#unserialize)

## Properties

### assetHolders

• **assetHolders**: [`AssetHolders`](../wiki/api.entities.Asset.NonFungible.AssetHolders.AssetHolders)

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L62)

___

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[compliance](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L71)

___

### did

• `Optional` **did**: `string`

Identity ID of the Asset (used for Claims)

**`Deprecated`**

this is no longer used from chain 7.x

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[did](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#did)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L81)

___

### documents

• **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents.Documents)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[documents](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#documents)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L72)

___

### id

• **id**: `string`

Unique ID of the Asset in UUID format

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[id](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#id)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L95)

___

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[metadata](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L73)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[permissions](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L74)

___

### settlements

• **settlements**: [`NonFungibleSettlements`](../wiki/api.entities.Asset.Base.Settlements.NonFungibleSettlements)

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L63)

___

### ticker

• `Optional` **ticker**: `string`

ticker of the Asset

Since the chain version 7.x, ticker can be optionally associated with an Asset

**`Deprecated`**

in favour of `ticker` value received from the response of `details` method

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[ticker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#ticker)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L90)

___

### uuid

• **uuid**: `string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[uuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L46)

## Accessors

### rawId

• `get` **rawId**(): `string`

Unique ID of the Asset in hex format

#### Returns

`string`

**`Note`**

Although UUID format is the usual representation of asset IDs, generic polkadot/substrate tools usually expect it in hex format

#### Inherited from

BaseAsset.rawId

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L102)

## Methods

### addRequiredMediators

▸ **addRequiredMediators**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Add required mediators. Mediators must approve any trades involving the asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AssetMediatorParams`](../wiki/api.procedures.types.AssetMediatorParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addRequiredMediators.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[addRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#addrequiredmediators)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:265](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L265)

___

### collectionKeys

▸ **collectionKeys**(): `Promise`\<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

Retrieve the metadata that defines the NFT collection. Every `issue` call for this collection must provide a value for each element returned

#### Returns

`Promise`\<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

**`Note`**

Each NFT **must** have an entry for each value, it **should** comply with the spec.
In other words, the SDK only validates the presence of metadata keys, additional validation should be used when issuing

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L172)

___

### controllerTransfer

▸ **controllerTransfer**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Force a transfer from the origin portfolio to one of the caller's portfolios

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`NftControllerTransferParams`](../wiki/api.procedures.types.NftControllerTransferParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [controllerTransfer.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L82)

___

### createdAt

▸ **createdAt**(): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:261](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L261)

___

### currentFundingRound

▸ **currentFundingRound**(): `Promise`\<``null`` \| `string`\>

Retrieve the Asset's funding round

#### Returns

`Promise`\<``null`` \| `string`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[currentFundingRound](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#currentfundinground)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:565](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L565)

▸ **currentFundingRound**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| `string`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[currentFundingRound](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#currentfundinground)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:566](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L566)

___

### details

▸ **details**(): `Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the NftCollection's data

#### Returns

`Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Overrides

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:122](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L122)

▸ **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Overrides

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L123)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this NftCollection exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

BaseAsset.exists

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:284](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L284)

___

### freeze

▸ **freeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Freeze transfers of the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [freeze.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[freeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#freeze)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L245)

___

### getCollectionId

▸ **getCollectionId**(): `Promise`\<`BigNumber`\>

Returns the collection's on chain numeric ID. Used primarily to access NFT specific storage values

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L311)

___

### getIdentifiers

▸ **getIdentifiers**(): `Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\>

Retrieve the Asset's identifiers list

#### Returns

`Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L311)

▸ **getIdentifiers**(`callback?`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:312](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L312)

___

### getNft

▸ **getNft**(`args`): `Promise`\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>

Get an NFT belonging to this collection

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>

**`Throws`**

if the given NFT does not exist

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L237)

___

### getRequiredMediators

▸ **getRequiredMediators**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

Get required Asset mediators. These Identities must approve any Instruction involving the asset

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getrequiredmediators)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:510](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L510)

___

### getTransactionHistory

▸ **getTransactionHistory**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricNftTransaction`](../wiki/api.entities.Asset.types.HistoricNftTransaction)\>\>

Retrieve this Collection's transaction history

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricNftTransaction`](../wiki/api.entities.Asset.types.HistoricNftTransaction)\>\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L346)

___

### getVenueFilteringDetails

▸ **getVenueFilteringDetails**(): `Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

Get venue filtering details

#### Returns

`Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getVenueFilteringDetails](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getvenuefilteringdetails)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:530](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L530)

___

### investorCount

▸ **investorCount**(): `Promise`\<`BigNumber`\>

Retrieve the amount of unique investors that hold this Nft

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:215](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L215)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isEqual](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L61)

___

### isFrozen

▸ **isFrozen**(): `Promise`\<`boolean`\>

Check whether transfers are frozen for the Asset

#### Returns

`Promise`\<`boolean`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L357)

▸ **isFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L358)

___

### issue

▸ **issue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft), [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>\>

Issues a new NFT for the collection

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IssueNftParams`](../wiki/api.procedures.types#issuenftparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft), [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>\>

**`Note`**

Each NFT requires metadata for each value returned by `collectionKeys`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value complies with the specification.

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [issue.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/NonFungible/NftCollection.ts#L72)

___

### linkTicker

▸ **linkTicker**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Link ticker to the asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`LinkTickerToAssetParams`](../wiki/api.procedures.types.LinkTickerToAssetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

if ticker is already reserved, then required role:
- Ticker Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [linkTicker.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[linkTicker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#linkticker)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L288)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Asset`](../wiki/api.entities.Asset.types#asset), [`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

Modify some properties of the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetParams`](../wiki/api.procedures.types#modifyassetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Asset`](../wiki/api.entities.Asset.types#asset), [`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

**`Throws`**

if the passed values result in no changes being made to the Asset

**`Throws`**

if the passed assetType is not a known asset type or a custom type that has not been created on the chain

**`Throws`**

if trying to modify an NftCollection's assetType

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[modify](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#modify)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:151](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L151)

___

### removeRequiredMediators

▸ **removeRequiredMediators**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove required mediators

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AssetMediatorParams`](../wiki/api.procedures.types.AssetMediatorParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [removeRequiredMediators.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[removeRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#removerequiredmediators)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:275](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L275)

___

### setVenueFiltering

▸ **setVenueFiltering**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Enable/disable venue filtering for this Asset and/or set allowed/disallowed venues

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetVenueFilteringParams`](../wiki/api.procedures.types#setvenuefilteringparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setVenueFiltering.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[setVenueFiltering](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#setvenuefiltering)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L127)

___

### toHuman

▸ **toHuman**(): `string`

Return the BaseAsset's ID

#### Returns

`string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[toHuman](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#tohuman)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:632](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L632)

___

### transferOwnership

▸ **transferOwnership**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
  by the recipient

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`TransferAssetOwnershipParams`](../wiki/api.procedures.types.TransferAssetOwnershipParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this will create [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [transferOwnership.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[transferOwnership](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#transferownership)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L117)

___

### unfreeze

▸ **unfreeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Unfreeze transfers of the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [unfreeze.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[unfreeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unfreeze)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:255](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L255)

___

### unlinkTicker

▸ **unlinkTicker**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Unlink ticker from the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

Only the ticker owner is allowed to unlink the Asset

**`Throws`**

if there is no ticker to unlink

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [unlinkTicker.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[unlinkTicker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unlinkticker)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/BaseAsset.ts#L302)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[generateUuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[unserialize](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L23)
