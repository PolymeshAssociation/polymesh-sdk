# Class: FungibleAsset

[api/entities/Asset/Fungible](../wiki/api.entities.Asset.Fungible).FungibleAsset

Class used to manage all Fungible Asset functionality

## Hierarchy

- [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

  ↳ **`FungibleAsset`**

## Table of contents

### Properties

- [assetHolders](../wiki/api.entities.Asset.Fungible.FungibleAsset#assetholders)
- [checkpoints](../wiki/api.entities.Asset.Fungible.FungibleAsset#checkpoints)
- [compliance](../wiki/api.entities.Asset.Fungible.FungibleAsset#compliance)
- [corporateActions](../wiki/api.entities.Asset.Fungible.FungibleAsset#corporateactions)
- [documents](../wiki/api.entities.Asset.Fungible.FungibleAsset#documents)
- [id](../wiki/api.entities.Asset.Fungible.FungibleAsset#id)
- [issuance](../wiki/api.entities.Asset.Fungible.FungibleAsset#issuance)
- [metadata](../wiki/api.entities.Asset.Fungible.FungibleAsset#metadata)
- [offerings](../wiki/api.entities.Asset.Fungible.FungibleAsset#offerings)
- [permissions](../wiki/api.entities.Asset.Fungible.FungibleAsset#permissions)
- [settlements](../wiki/api.entities.Asset.Fungible.FungibleAsset#settlements)
- [transferRestrictions](../wiki/api.entities.Asset.Fungible.FungibleAsset#transferrestrictions)
- [uuid](../wiki/api.entities.Asset.Fungible.FungibleAsset#uuid)

### Accessors

- [rawId](../wiki/api.entities.Asset.Fungible.FungibleAsset#rawid)

### Methods

- [addRequiredMediators](../wiki/api.entities.Asset.Fungible.FungibleAsset#addrequiredmediators)
- [controllerTransfer](../wiki/api.entities.Asset.Fungible.FungibleAsset#controllertransfer)
- [createdAt](../wiki/api.entities.Asset.Fungible.FungibleAsset#createdat)
- [currentFundingRound](../wiki/api.entities.Asset.Fungible.FungibleAsset#currentfundinground)
- [details](../wiki/api.entities.Asset.Fungible.FungibleAsset#details)
- [exists](../wiki/api.entities.Asset.Fungible.FungibleAsset#exists)
- [freeze](../wiki/api.entities.Asset.Fungible.FungibleAsset#freeze)
- [getIdentifiers](../wiki/api.entities.Asset.Fungible.FungibleAsset#getidentifiers)
- [getOperationHistory](../wiki/api.entities.Asset.Fungible.FungibleAsset#getoperationhistory)
- [getRequiredMediators](../wiki/api.entities.Asset.Fungible.FungibleAsset#getrequiredmediators)
- [getTransactionHistory](../wiki/api.entities.Asset.Fungible.FungibleAsset#gettransactionhistory)
- [getVenueFilteringDetails](../wiki/api.entities.Asset.Fungible.FungibleAsset#getvenuefilteringdetails)
- [investorCount](../wiki/api.entities.Asset.Fungible.FungibleAsset#investorcount)
- [isEqual](../wiki/api.entities.Asset.Fungible.FungibleAsset#isequal)
- [isFrozen](../wiki/api.entities.Asset.Fungible.FungibleAsset#isfrozen)
- [linkTicker](../wiki/api.entities.Asset.Fungible.FungibleAsset#linkticker)
- [modify](../wiki/api.entities.Asset.Fungible.FungibleAsset#modify)
- [redeem](../wiki/api.entities.Asset.Fungible.FungibleAsset#redeem)
- [removeRequiredMediators](../wiki/api.entities.Asset.Fungible.FungibleAsset#removerequiredmediators)
- [setVenueFiltering](../wiki/api.entities.Asset.Fungible.FungibleAsset#setvenuefiltering)
- [toHuman](../wiki/api.entities.Asset.Fungible.FungibleAsset#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.Fungible.FungibleAsset#transferownership)
- [unfreeze](../wiki/api.entities.Asset.Fungible.FungibleAsset#unfreeze)
- [unlinkTicker](../wiki/api.entities.Asset.Fungible.FungibleAsset#unlinkticker)
- [generateUuid](../wiki/api.entities.Asset.Fungible.FungibleAsset#generateuuid)
- [unserialize](../wiki/api.entities.Asset.Fungible.FungibleAsset#unserialize)

## Properties

### assetHolders

• **assetHolders**: [`AssetHolders`](../wiki/api.entities.Asset.Fungible.AssetHolders.AssetHolders)

#### Defined in

[api/entities/Asset/Fungible/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L49)

___

### checkpoints

• **checkpoints**: [`Checkpoints`](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints)

#### Defined in

[api/entities/Asset/Fungible/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L53)

___

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[compliance](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L71)

___

### corporateActions

• **corporateActions**: [`CorporateActions`](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions)

#### Defined in

[api/entities/Asset/Fungible/index.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L54)

___

### documents

• **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents.Documents)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[documents](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#documents)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L72)

___

### id

• **id**: `string`

Unique ID of the Asset in UUID format

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[id](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#id)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L79)

___

### issuance

• **issuance**: [`Issuance`](../wiki/api.entities.Asset.Fungible.Issuance.Issuance)

#### Defined in

[api/entities/Asset/Fungible/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L50)

___

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[metadata](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L73)

___

### offerings

• **offerings**: [`Offerings`](../wiki/api.entities.Asset.Fungible.Offerings.Offerings)

#### Defined in

[api/entities/Asset/Fungible/index.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L52)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[permissions](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L74)

___

### settlements

• **settlements**: [`FungibleSettlements`](../wiki/api.entities.Asset.Base.Settlements.FungibleSettlements)

#### Defined in

[api/entities/Asset/Fungible/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L48)

___

### transferRestrictions

• **transferRestrictions**: [`TransferRestrictions`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions)

#### Defined in

[api/entities/Asset/Fungible/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L51)

___

### uuid

• **uuid**: `string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[uuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

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

[api/entities/Asset/Base/BaseAsset.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L86)

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

[api/entities/Asset/Base/BaseAsset.ts:241](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L241)

___

### controllerTransfer

▸ **controllerTransfer**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Force a transfer from a given Portfolio to the caller’s default Portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ControllerTransferParams`](../wiki/api.procedures.types.ControllerTransferParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [controllerTransfer.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/index.ts:148](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L148)

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

[api/entities/Asset/Fungible/index.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L86)

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

[api/entities/Asset/Base/BaseAsset.ts:518](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L518)

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

[api/entities/Asset/Base/BaseAsset.ts:519](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L519)

___

### details

▸ **details**(): `Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the Asset's data

#### Returns

`Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:360](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L360)

▸ **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L361)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this FungibleAsset exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

BaseAsset.exists

#### Defined in

[api/entities/Asset/Fungible/index.ts:263](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L263)

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

[api/entities/Asset/Base/BaseAsset.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L221)

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

[api/entities/Asset/Base/BaseAsset.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L287)

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

[api/entities/Asset/Base/BaseAsset.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L288)

___

### getOperationHistory

▸ **getOperationHistory**(): `Promise`\<[`HistoricAgentOperation`](../wiki/api.entities.Asset.types.HistoricAgentOperation)[]\>

Retrieve this Asset's Operation History

#### Returns

`Promise`\<[`HistoricAgentOperation`](../wiki/api.entities.Asset.types.HistoricAgentOperation)[]\>

**`Note`**

Operations are grouped by the agent Identity who performed them

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Asset/Fungible/index.ts:159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L159)

___

### getRequiredMediators

▸ **getRequiredMediators**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

Get required Asset mediators. These Identities must approve any Instruction involving the asset

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getrequiredmediators)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:463](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L463)

___

### getTransactionHistory

▸ **getTransactionHistory**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricAssetTransaction`](../wiki/api.entities.Asset.types.HistoricAssetTransaction)\>\>

Retrieve this Asset's transaction History

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricAssetTransaction`](../wiki/api.entities.Asset.types.HistoricAssetTransaction)\>\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Asset/Fungible/index.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L190)

___

### getVenueFilteringDetails

▸ **getVenueFilteringDetails**(): `Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

Get venue filtering details

#### Returns

`Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getVenueFilteringDetails](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getvenuefilteringdetails)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:483](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L483)

___

### investorCount

▸ **investorCount**(): `Promise`\<`BigNumber`\>

Retrieve the amount of unique investors that hold this Asset

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Asset/Fungible/index.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L119)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

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

[api/entities/Asset/Base/BaseAsset.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L326)

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

[api/entities/Asset/Base/BaseAsset.ts:327](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L327)

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

[api/entities/Asset/Base/BaseAsset.ts:264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L264)

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

[api/entities/Asset/Base/BaseAsset.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L135)

___

### redeem

▸ **redeem**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Redeem (burn) an amount of this Asset's tokens

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RedeemTokensParams`](../wiki/api.procedures.types.RedeemTokensParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [redeem.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/index.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Fungible/index.ts#L112)

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

[api/entities/Asset/Base/BaseAsset.ts:251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L251)

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

[api/entities/Asset/Base/BaseAsset.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L111)

___

### toHuman

▸ **toHuman**(): `string`

Return the BaseAsset's ID

#### Returns

`string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[toHuman](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#tohuman)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:575](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L575)

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

[api/entities/Asset/Base/BaseAsset.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L101)

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

[api/entities/Asset/Base/BaseAsset.ts:231](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L231)

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

[api/entities/Asset/Base/BaseAsset.ts:278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/Base/BaseAsset.ts#L278)

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

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

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

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
