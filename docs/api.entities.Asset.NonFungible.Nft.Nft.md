# Class: Nft

[api/entities/Asset/NonFungible/Nft](../wiki/api.entities.Asset.NonFungible.Nft).Nft

Class used to manage Nft functionality. Each NFT belongs to an NftCollection, which specifies the expected metadata values for each NFT

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<[`NftUniqueIdentifiers`](../wiki/api.entities.Asset.NonFungible.Nft#nftuniqueidentifiers), [`HumanReadable`](../wiki/api.entities.Asset.NonFungible.Nft.HumanReadable)\>

  ↳ **`Nft`**

## Table of contents

### Properties

- [collection](../wiki/api.entities.Asset.NonFungible.Nft.Nft#collection)
- [id](../wiki/api.entities.Asset.NonFungible.Nft.Nft#id)
- [uuid](../wiki/api.entities.Asset.NonFungible.Nft.Nft#uuid)

### Methods

- [exists](../wiki/api.entities.Asset.NonFungible.Nft.Nft#exists)
- [getImageUri](../wiki/api.entities.Asset.NonFungible.Nft.Nft#getimageuri)
- [getMetadata](../wiki/api.entities.Asset.NonFungible.Nft.Nft#getmetadata)
- [getOwner](../wiki/api.entities.Asset.NonFungible.Nft.Nft#getowner)
- [getTokenUri](../wiki/api.entities.Asset.NonFungible.Nft.Nft#gettokenuri)
- [isEqual](../wiki/api.entities.Asset.NonFungible.Nft.Nft#isequal)
- [isLocked](../wiki/api.entities.Asset.NonFungible.Nft.Nft#islocked)
- [redeem](../wiki/api.entities.Asset.NonFungible.Nft.Nft#redeem)
- [generateUuid](../wiki/api.entities.Asset.NonFungible.Nft.Nft#generateuuid)
- [unserialize](../wiki/api.entities.Asset.NonFungible.Nft.Nft#unserialize)

## Properties

### collection

• **collection**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

The [NftCollection](../wiki/api.entities.Asset.NonFungible.NftCollection) this NFT belongs to

#### Defined in

[api/entities/Asset/NonFungible/Nft.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/NonFungible/Nft.ts#L50)

___

### id

• **id**: `BigNumber`

#### Defined in

[api/entities/Asset/NonFungible/Nft.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/NonFungible/Nft.ts#L45)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine if the NFT exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

___

### getImageUri

▸ **getImageUri**(): `Promise`<``null`` \| `string`\>

Get the conventional image URI for the NFT

This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.

When creating a collection an issuer can either require per token images by specifying global metadata key `imageUri` as a collection key or by
setting a collection base image URL by setting a value on the collection corresponding to the global metadata key `baseImageUri`.

This method will return `null` if the NFT issuer did not configure the collection according to the convention.

Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.

The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
 - `https://example.com/nfts/{tokenId}/image.png` becomes `https://example.com/nfts/1/image.png`
 - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value

#### Returns

`Promise`<``null`` \| `string`\>

___

### getMetadata

▸ **getMetadata**(): `Promise`<[`NftMetadata`](../wiki/api.entities.Asset.types.NftMetadata)[]\>

Get metadata associated with this token

#### Returns

`Promise`<[`NftMetadata`](../wiki/api.entities.Asset.types.NftMetadata)[]\>

___

### getOwner

▸ **getOwner**(): `Promise`<``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

Get owner of the NFT

**`Note`**

 This method returns `null` if there is no existing holder for the token. This may happen even if the token has been redeemed/burned

#### Returns

`Promise`<``null`` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

___

### getTokenUri

▸ **getTokenUri**(): `Promise`<``null`` \| `string`\>

Get the conventional token URI for the NFT

This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.

When creating a collection an issuer can either require per token URL by specifying global metadata key `tokenURI` as a collection key or by
setting a collection base URL by setting a value on the collection corresponding to the global metadata key `baseTokenUri` on the collection.

This method will return `null` if the NFT issuer did not configure the collection according to the convention.

Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.

The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
 - `https://example.com/nfts/{tokenId}/info.json` becomes `https://example.com/nfts/1/info.json`
 - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value

#### Returns

`Promise`<``null`` \| `string`\>

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

### isLocked

▸ **isLocked**(): `Promise`<`boolean`\>

Check if the NFT is locked in any settlement instruction

**`Throws`**

 if NFT has no owner (has been redeemed)

#### Returns

`Promise`<`boolean`\>

___

### redeem

▸ **redeem**(`args?`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Redeem (or "burns") the NFT, removing it from circulation

**`Note`**

 this method is of type [OptionalArgsProcedureMethod](../wiki/types.OptionalArgsProcedureMethod), which means you can call [redeem.checkAuthorization](../wiki/types.OptionalArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | [`RedeemNftParams`](../wiki/api.procedures.types.RedeemNftParams) |
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
