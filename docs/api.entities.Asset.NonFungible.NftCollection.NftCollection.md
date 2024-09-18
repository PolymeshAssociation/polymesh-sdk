# Class: NftCollection

[api/entities/Asset/NonFungible/NftCollection](../wiki/api.entities.Asset.NonFungible.NftCollection).NftCollection

Class used to manage NFT functionality

## Hierarchy

- [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

  ↳ **`NftCollection`**

## Table of contents

### Properties

- [compliance](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#compliance)
- [did](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#did)
- [documents](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#documents)
- [metadata](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#metadata)
- [permissions](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#permissions)
- [settlements](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#settlements)
- [ticker](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#ticker)
- [uuid](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#uuid)

### Methods

- [collectionKeys](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#collectionkeys)
- [createdAt](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#createdat)
- [details](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#details)
- [exists](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#exists)
- [freeze](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#freeze)
- [getCollectionId](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getcollectionid)
- [getIdentifiers](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getidentifiers)
- [getNft](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#getnft)
- [investorCount](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#investorcount)
- [isEqual](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#isequal)
- [isFrozen](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#isfrozen)
- [issue](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#issue)
- [toHuman](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#tohuman)
- [transferOwnership](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#transferownership)
- [unfreeze](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#unfreeze)
- [generateUuid](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#generateuuid)
- [unserialize](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection#unserialize)

## Properties

### compliance

• **compliance**: [`Compliance`](../wiki/api.entities.Asset.Base.Compliance.Compliance)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[compliance](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#compliance)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L54)

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

### metadata

• **metadata**: [`Metadata`](../wiki/api.entities.Asset.Base.Metadata.Metadata)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[metadata](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#metadata)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L56)

___

### permissions

• **permissions**: [`Permissions`](../wiki/api.entities.Asset.Base.Permissions.Permissions)

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[permissions](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#permissions)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L57)

___

### settlements

• **settlements**: [`NonFungibleSettlements`](../wiki/api.entities.Asset.Base.Settlements.NonFungibleSettlements)

#### Defined in

[api/entities/Asset/NonFungible/NftCollection.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/NonFungible/NftCollection.ts#L50)

___

### ticker

• **ticker**: `string`

ticker of the Asset

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[ticker](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#ticker)

#### Defined in

[api/entities/Asset/Base/BaseAsset.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Base/BaseAsset.ts#L67)

___

### uuid

• **uuid**: `string`

#### Inherited from

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[uuid](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### collectionKeys

▸ **collectionKeys**(): `Promise`<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

Retrieve the metadata that defines the NFT collection. Every `issue` call for this collection must provide a value for each element returned

**`Note`**

 Each NFT **must** have an entry for each value, it **should** comply with the spec.
In other words, the SDK only validates the presence of metadata keys, additional validation should be used when issuing

#### Returns

`Promise`<[`CollectionKey`](../wiki/api.entities.Asset.types#collectionkey)[]\>

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

### details

▸ **details**(): `Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

Retrieve the NftCollection's data

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\>

#### Overrides

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

▸ **details**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`AssetDetails`](../wiki/api.entities.Asset.types.AssetDetails)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Overrides

[BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset).[details](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset#details)

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this NftCollection exists on chain

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

### getCollectionId

▸ **getCollectionId**(): `Promise`<`BigNumber`\>

Returns the collection's on chain numeric ID. Used primarily to access NFT specific storage values

#### Returns

`Promise`<`BigNumber`\>

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

### getNft

▸ **getNft**(`args`): `Promise`<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>

Get an NFT belonging to this collection

**`Throws`**

 if the given NFT does not exist

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>

___

### investorCount

▸ **investorCount**(): `Promise`<`BigNumber`\>

Retrieve the amount of unique investors that hold this Nft

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

### issue

▸ **issue**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft), [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>\>

Issues a new NFT for the collection

**`Note`**

 Each NFT requires metadata for each value returned by `collectionKeys`. The SDK and chain only validate the presence of these fields. Additional validation may be needed to ensure each value complies with the specification.

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [issue.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IssueNftParams`](../wiki/api.procedures.types#issuenftparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft), [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)\>\>

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
