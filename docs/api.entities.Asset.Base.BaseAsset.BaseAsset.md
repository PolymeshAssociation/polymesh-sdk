# Class: BaseAsset

[api/entities/Asset/Base/BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset).BaseAsset

Class used to manage functionality common to all assets.

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.Asset.types.UniqueIdentifiers), `string`\>

  ↳ **`BaseAsset`**

  ↳↳ [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

  ↳↳ [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

## Table of contents

### Properties

- [compliance](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#compliance)
- [did](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#did)
- [documents](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#documents)
- [metadata](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#metadata)
- [permissions](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#permissions)
- [ticker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#ticker)
- [uuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#uuid)

### Methods

- [addRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#addrequiredmediators)
- [currentFundingRound](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#currentfundinground)
- [details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)
- [freeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#freeze)
- [getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)
- [getRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getrequiredmediators)
- [getVenueFilteringDetails](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getvenuefilteringdetails)
- [isEqual](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isequal)
- [isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)
- [modify](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#modify)
- [removeRequiredMediators](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#removerequiredmediators)
- [setVenueFiltering](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#setvenuefiltering)
- [toHuman](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#transferownership)
- [unfreeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unfreeze)
- [generateUuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#generateuuid)
- [unserialize](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unserialize)

## Properties

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L66)

___

### did

• **did**: `string`

Identity ID of the Asset (used for Claims)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L74)

___

### documents

• **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents.Documents)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L67)

___

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L68)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L69)

___

### ticker

• **ticker**: `string`

ticker of the Asset

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L79)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L218)

___

### currentFundingRound

▸ **currentFundingRound**(): `Promise`\<``null`` \| `string`\>

Retrieve the Asset's funding round

#### Returns

`Promise`\<``null`` \| `string`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:457](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L457)

▸ **currentFundingRound**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| `string`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:458](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L458)

___

### details

▸ **details**(): `Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the Asset's data

#### Returns

`Promise`\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:309](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L309)

▸ **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L310)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L198)

___

### getIdentifiers

▸ **getIdentifiers**(): `Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\>

Retrieve the Asset's identifiers list

#### Returns

`Promise`\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L237)

▸ **getIdentifiers**(`callback?`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:238](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L238)

___

### getRequiredMediators

▸ **getRequiredMediators**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

Get required Asset mediators. These Identities must approve any Instruction involving the asset

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:403](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L403)

___

### getVenueFilteringDetails

▸ **getVenueFilteringDetails**(): `Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

Get venue filtering details

#### Returns

`Promise`\<[`VenueFilteringDetails`](../wiki/api.entities.Asset.types.VenueFilteringDetails)\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:422](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L422)

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

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### isFrozen

▸ **isFrozen**(): `Promise`\<`boolean`\>

Check whether transfers are frozen for the Asset

#### Returns

`Promise`\<`boolean`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L274)

▸ **isFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:275](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L275)

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

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L124)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L228)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L102)

___

### toHuman

▸ **toHuman**(): `string`

Return the NftCollection's ticker

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:514](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L514)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L92)

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

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Base/BaseAsset.ts#L208)

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

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L14)

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

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
