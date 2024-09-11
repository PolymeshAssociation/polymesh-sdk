# Interface: CreateNftCollectionParams

[api/procedures/types](../wiki/api.procedures.types).CreateNftCollectionParams

## Table of contents

### Properties

- [collectionKeys](../wiki/api.procedures.types.CreateNftCollectionParams#collectionkeys)
- [documents](../wiki/api.procedures.types.CreateNftCollectionParams#documents)
- [fundingRound](../wiki/api.procedures.types.CreateNftCollectionParams#fundinground)
- [name](../wiki/api.procedures.types.CreateNftCollectionParams#name)
- [nftType](../wiki/api.procedures.types.CreateNftCollectionParams#nfttype)
- [securityIdentifiers](../wiki/api.procedures.types.CreateNftCollectionParams#securityidentifiers)
- [ticker](../wiki/api.procedures.types.CreateNftCollectionParams#ticker)

## Properties

### collectionKeys

• **collectionKeys**: [`CollectionKeyInput`](../wiki/api.procedures.types#collectionkeyinput)[]

The required metadata values each NFT in the collection will have

**`Note`**

Images — Most Polymesh networks (mainnet, testnet, etc.) have global metadata keys registered to help standardize displaying images
If `imageUri` is specified as a collection key, then each token will need to be issued with an image URI.

#### Defined in

[api/procedures/types.ts:702](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L702)

___

### documents

• `Optional` **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types.AssetDocument)[]

Links to off chain documents related to the NftCollection

#### Defined in

[api/procedures/types.ts:706](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L706)

___

### fundingRound

• `Optional` **fundingRound**: `string`

A optional field that can be used to provide information about the funding state of the asset

#### Defined in

[api/procedures/types.ts:711](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L711)

___

### name

• `Optional` **name**: `string`

The collection name. defaults to `ticker`

#### Defined in

[api/procedures/types.ts:686](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L686)

___

### nftType

• **nftType**: `string` \| `BigNumber`

**`Throws`**

if provided string that does not have a custom type

**`Throws`**

if provided a BigNumber that does not correspond to a custom type

#### Defined in

[api/procedures/types.ts:691](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L691)

___

### securityIdentifiers

• `Optional` **securityIdentifiers**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]

array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)

#### Defined in

[api/procedures/types.ts:695](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L695)

___

### ticker

• **ticker**: `string`

The primary identifier for the collection. The ticker must either be free, or the signer has appropriate permissions if reserved

#### Defined in

[api/procedures/types.ts:682](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L682)
