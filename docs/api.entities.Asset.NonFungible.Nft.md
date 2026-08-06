[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/NonFungible/Nft

# api/entities/Asset/NonFungible/Nft

## Classes

### Nft

Defined in: [api/entities/Asset/NonFungible/Nft.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L46)

Class used to manage Nft functionality. Each NFT belongs to an NftCollection, which specifies the expected metadata values for each NFT

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`NftUniqueIdentifiers`](../wiki/#nftuniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### collection

> **collection**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)

Defined in: [api/entities/Asset/NonFungible/Nft.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L52)

The [NftCollection](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection) this NFT belongs to

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L47)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L127)

Determine if the NFT exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getImageUri()

> **getImageUri**(): `Promise`\<`string` \| `null`\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L149)

Get the conventional image URI for the NFT

This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.

When creating a collection an issuer can either require per token images by specifying global metadata key `imageUri` as a collection key or by
setting a collection base image URL by setting a value on the collection corresponding to the global metadata key `baseImageUri`.

This method will return `null` if the NFT issuer did not configure the collection according to the convention.

Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.

The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
 - `https://example.com/nfts/{tokenId}/image.png` becomes `https://example.com/nfts/1/image.png`
 - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value

###### Returns

`Promise`\<`string` \| `null`\>

##### getMetadata()

> **getMetadata**(): `Promise`\<[`NftMetadata`](../wiki/api.entities.Asset.types#nftmetadata)[]\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L95)

Get metadata associated with this token

###### Returns

`Promise`\<[`NftMetadata`](../wiki/api.entities.Asset.types#nftmetadata)[]\>

##### getOwner()

> **getOwner**(): `Promise`\<[`AssetHolder`](../wiki/api.entities.types#assetholder) \| `null`\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L210)

Get owner of the NFT

###### Returns

`Promise`\<[`AssetHolder`](../wiki/api.entities.types#assetholder) \| `null`\>

###### Note

This method returns `null` if there is no existing holder for the token. This may happen even if the token has been redeemed/burned

##### getTokenUri()

> **getTokenUri**(): `Promise`\<`string` \| `null`\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L185)

Get the conventional token URI for the NFT

This function will check for a token level value and a collection level value. Token level values take precedence over base values in case of a conflict.

When creating a collection an issuer can either require per token URL by specifying global metadata key `tokenURI` as a collection key or by
setting a collection base URL by setting a value on the collection corresponding to the global metadata key `baseTokenUri` on the collection.

This method will return `null` if the NFT issuer did not configure the collection according to the convention.

Per token URIs provide the most flexibility, but require more chain space to store, increasing the POLYX fee to issue each token.

The URI values can include `{tokenId}` that will be replaced with the NFTs ID. If a base URI does not specify this the ID will be appended onto the URL. Examples:
 - `https://example.com/nfts/{tokenId}/info.json` becomes `https://example.com/nfts/1/info.json`
 - `https://example.com/nfts` becomes `https://example.com/nfts/1` if used a base value, but remain unchanged as a local value

###### Returns

`Promise`\<`string` \| `null`\>

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### isLocked()

> **isLocked**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:240](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L240)

Check if the NFT is locked in any settlement instruction

###### Returns

`Promise`\<`boolean`\>

###### Throws

if NFT has no owner (has been redeemed)

##### redeem()

> **redeem**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/NonFungible/Nft.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L57)

Redeem (or "burns") the NFT, removing it from circulation

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | [`RedeemNftParams`](../wiki/api.procedures.types#redeemnftparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [OptionalArgsProcedureMethod](../wiki/api.procedures.types#optionalargsproceduremethod), which means you can call [redeem.checkAuthorization](../wiki/api.procedures.types#checkauthorization-2) on it to see whether the signing Account and Identity have the required roles and permissions to run it

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### HumanReadable

Defined in: [api/entities/Asset/NonFungible/Nft.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L38)

#### Properties

##### collection

> **collection**: `string`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L40)

##### id

> **id**: `string`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L39)

## Type Aliases

### NftUniqueIdentifiers

> **NftUniqueIdentifiers** = `object`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L33)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L34)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Asset/NonFungible/Nft.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/NonFungible/Nft.ts#L35)
