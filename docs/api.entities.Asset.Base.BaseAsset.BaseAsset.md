# Class: BaseAsset

[api/entities/Asset/Base/BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset).BaseAsset

Class used to manage functionality common to all assets.

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<[`UniqueIdentifiers`](../wiki/api.entities.Asset.types.UniqueIdentifiers), `string`\>

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

- [details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)
- [freeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#freeze)
- [getIdentifiers](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#getidentifiers)
- [isEqual](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isequal)
- [isFrozen](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#isfrozen)
- [toHuman](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#transferownership)
- [unfreeze](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unfreeze)
- [generateUuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#generateuuid)
- [unserialize](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#unserialize)

## Properties

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L54)

___

### did

• **did**: `string`

Identity ID of the Asset (used for Claims)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L62)

___

### documents

• **documents**: [`Documents`](../wiki/api.entities.Asset.Base.Documents.Documents)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L55)

___

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L56)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L57)

___

### ticker

• **ticker**: `string`

ticker of the Asset

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L67)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### details

▸ **details**(): `Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the Asset's data

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

▸ **details**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

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

___

### getIdentifiers

▸ **getIdentifiers**(): `Promise`<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\>

Retrieve the Asset's identifiers list

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\>

▸ **getIdentifiers**(`callback?`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | [`SubCallback`](../wiki/types#subcallback)<[`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

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

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

___

### isFrozen

▸ **isFrozen**(): `Promise`<`boolean`\>

Check whether transfers are frozen for the Asset

**`Note`**

 can be subscribed to

#### Returns

`Promise`<`boolean`\>

▸ **isFrozen**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<`boolean`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### toHuman

▸ **toHuman**(): `string`

Return the NftCollection's ticker

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

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

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

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

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)
