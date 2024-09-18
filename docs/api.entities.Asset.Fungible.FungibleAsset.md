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
- [did](../wiki/api.entities.Asset.Fungible.FungibleAsset#did)
- [documents](../wiki/api.entities.Asset.Fungible.FungibleAsset#documents)
- [issuance](../wiki/api.entities.Asset.Fungible.FungibleAsset#issuance)
- [metadata](../wiki/api.entities.Asset.Fungible.FungibleAsset#metadata)
- [offerings](../wiki/api.entities.Asset.Fungible.FungibleAsset#offerings)
- [permissions](../wiki/api.entities.Asset.Fungible.FungibleAsset#permissions)
- [settlements](../wiki/api.entities.Asset.Fungible.FungibleAsset#settlements)
- [ticker](../wiki/api.entities.Asset.Fungible.FungibleAsset#ticker)
- [transferRestrictions](../wiki/api.entities.Asset.Fungible.FungibleAsset#transferrestrictions)
- [uuid](../wiki/api.entities.Asset.Fungible.FungibleAsset#uuid)

### Methods

- [controllerTransfer](../wiki/api.entities.Asset.Fungible.FungibleAsset#controllertransfer)
- [createdAt](../wiki/api.entities.Asset.Fungible.FungibleAsset#createdat)
- [currentFundingRound](../wiki/api.entities.Asset.Fungible.FungibleAsset#currentfundinground)
- [details](../wiki/api.entities.Asset.Fungible.FungibleAsset#details)
- [exists](../wiki/api.entities.Asset.Fungible.FungibleAsset#exists)
- [freeze](../wiki/api.entities.Asset.Fungible.FungibleAsset#freeze)
- [getIdentifiers](../wiki/api.entities.Asset.Fungible.FungibleAsset#getidentifiers)
- [getOperationHistory](../wiki/api.entities.Asset.Fungible.FungibleAsset#getoperationhistory)
- [getTransactionHistory](../wiki/api.entities.Asset.Fungible.FungibleAsset#gettransactionhistory)
- [investorCount](../wiki/api.entities.Asset.Fungible.FungibleAsset#investorcount)
- [isEqual](../wiki/api.entities.Asset.Fungible.FungibleAsset#isequal)
- [isFrozen](../wiki/api.entities.Asset.Fungible.FungibleAsset#isfrozen)
- [modify](../wiki/api.entities.Asset.Fungible.FungibleAsset#modify)
- [redeem](../wiki/api.entities.Asset.Fungible.FungibleAsset#redeem)
- [setVenueFiltering](../wiki/api.entities.Asset.Fungible.FungibleAsset#setvenuefiltering)
- [toHuman](../wiki/api.entities.Asset.Fungible.FungibleAsset#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.Fungible.FungibleAsset#transferownership)
- [unfreeze](../wiki/api.entities.Asset.Fungible.FungibleAsset#unfreeze)
- [generateUuid](../wiki/api.entities.Asset.Fungible.FungibleAsset#generateuuid)
- [unserialize](../wiki/api.entities.Asset.Fungible.FungibleAsset#unserialize)

## Properties

### assetHolders

• **assetHolders**: [`AssetHolders`](../wiki/api.entities.Asset.Fungible.AssetHolders.AssetHolders)

#### Defined in

[api/entities/Asset/Fungible/index.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L66)

___

### checkpoints

• **checkpoints**: [`Checkpoints`](../wiki/api.entities.Asset.Fungible.Checkpoints.Checkpoints)

#### Defined in

[api/entities/Asset/Fungible/index.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L70)

___

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[compliance](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L54)

___

### corporateActions

• **corporateActions**: [`CorporateActions`](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions)

#### Defined in

[api/entities/Asset/Fungible/index.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L71)

___

### did

• **did**: `string`

Identity ID of the Asset (used for Claims)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[did](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#did)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L62)

___

### documents

• **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents.Documents)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[documents](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#documents)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L55)

___

### issuance

• **issuance**: [`Issuance`](../wiki/api.entities.Asset.Fungible.Issuance.Issuance)

#### Defined in

[api/entities/Asset/Fungible/index.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L67)

___

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[metadata](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L56)

___

### offerings

• **offerings**: [`Offerings`](../wiki/api.entities.Asset.Fungible.Offerings.Offerings)

#### Defined in

[api/entities/Asset/Fungible/index.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L69)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[permissions](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L57)

___

### settlements

• **settlements**: [`FungibleSettlements`](../wiki/api.entities.Asset.Base.Settlements.FungibleSettlements)

#### Defined in

[api/entities/Asset/Fungible/index.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L65)

___

### ticker

• **ticker**: `string`

ticker of the Asset

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[ticker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#ticker)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L67)

___

### transferRestrictions

• **transferRestrictions**: [`TransferRestrictions`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions)

#### Defined in

[api/entities/Asset/Fungible/index.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/index.ts#L68)

___

### uuid

• **uuid**: `string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[uuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### controllerTransfer

▸ **controllerTransfer**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Force a transfer from a given Portfolio to the caller’s default Portfolio

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [controllerTransfer.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ControllerTransferParams`](../wiki/api.procedures.types.ControllerTransferParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### createdAt

▸ **createdAt**(): `Promise`<``null`` \| [`EventIdentifier`](../wiki/types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`Note`**

 uses the middlewareV2

**`Note`**

 there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Returns

`Promise`<``null`` \| [`EventIdentifier`](../wiki/types.EventIdentifier)\>

___

### currentFundingRound

▸ **currentFundingRound**(): `Promise`<``null`` \| `string`\>

Retrieve the Asset's funding round

**`Note`**

 can be subscribed to

#### Returns

`Promise`<``null`` \| `string`\>

▸ **currentFundingRound**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<``null`` \| `string`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### details

▸ **details**(): `Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the Asset's data

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

▸ **details**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this FungibleAsset exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

BaseAsset.exists

___

### freeze

▸ **freeze**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Freeze transfers of the Asset

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [freeze.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[freeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#freeze)

___

### getIdentifiers

▸ **getIdentifiers**(): `Promise`<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\>

Retrieve the Asset's identifiers list

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)

▸ **getIdentifiers**(`callback?`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | [`SubCallback`](../wiki/types#subcallback)<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)

___

### getOperationHistory

▸ **getOperationHistory**(): `Promise`<[`HistoricAgentOperation`](../wiki/types.HistoricAgentOperation)[]\>

Retrieve this Asset's Operation History

**`Note`**

 Operations are grouped by the agent Identity who performed them

**`Note`**

 uses the middlewareV2

#### Returns

`Promise`<[`HistoricAgentOperation`](../wiki/types.HistoricAgentOperation)[]\>

___

### getTransactionHistory

▸ **getTransactionHistory**(`opts`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HistoricAssetTransaction`](../wiki/api.entities.Asset.types.HistoricAssetTransaction)\>\>

Retrieve this Asset's transaction History

**`Note`**

 uses the middlewareV2

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HistoricAssetTransaction`](../wiki/api.entities.Asset.types.HistoricAssetTransaction)\>\>

___

### investorCount

▸ **investorCount**(): `Promise`<`BigNumber`\>

Retrieve the amount of unique investors that hold this Asset

#### Returns

`Promise`<`BigNumber`\>

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isEqual](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isequal)

___

### isFrozen

▸ **isFrozen**(): `Promise`<`boolean`\>

Check whether transfers are frozen for the Asset

**`Note`**

 can be subscribed to

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)

▸ **isFrozen**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<`boolean`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Modify some properties of the Asset

**`Throws`**

 if the passed values result in no changes being made to the Asset

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetParams`](../wiki/api.procedures.types#modifyassetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

___

### redeem

▸ **redeem**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Redeem (burn) an amount of this Asset's tokens

**`Note`**

 tokens are removed from the caller's Default Portfolio

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [redeem.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RedeemTokensParams`](../wiki/api.procedures.types.RedeemTokensParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### setVenueFiltering

▸ **setVenueFiltering**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Enable/disable venue filtering for this Asset and/or set allowed/disallowed venues

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [setVenueFiltering.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetVenueFilteringParams`](../wiki/api.procedures.types#setvenuefilteringparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### toHuman

▸ **toHuman**(): `string`

Return the NftCollection's ticker

#### Returns

`string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[toHuman](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#tohuman)

___

### transferOwnership

▸ **transferOwnership**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
  by the recipient

**`Note`**

 this will create [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [transferOwnership.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`TransferAssetOwnershipParams`](../wiki/api.procedures.types.TransferAssetOwnershipParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[transferOwnership](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#transferownership)

___

### unfreeze

▸ **unfreeze**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Unfreeze transfers of the Asset

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [unfreeze.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[unfreeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unfreeze)

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

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

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

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
