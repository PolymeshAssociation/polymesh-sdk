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

[api/procedures/types.ts:749](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L749)

___

### documents

• `Optional` **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types.AssetDocument)[]

Links to off chain documents related to the NftCollection

#### Defined in

[api/procedures/types.ts:753](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L753)

___

### fundingRound

• `Optional` **fundingRound**: `string`

A optional field that can be used to provide information about the funding state of the asset

#### Defined in

[api/procedures/types.ts:758](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L758)

___

### name

• `Optional` **name**: `string`

The collection name. defaults to `ticker`

#### Defined in

[api/procedures/types.ts:733](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L733)

___

### nftType

• **nftType**: `string` \| `BigNumber`

**`Throws`**

if provided string that does not have a custom type

**`Throws`**

if provided a BigNumber that does not correspond to a custom type

#### Defined in

[api/procedures/types.ts:738](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L738)

___

### securityIdentifiers

• `Optional` **securityIdentifiers**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]

array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)

#### Defined in

[api/procedures/types.ts:742](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L742)

___

### ticker

• **ticker**: `string`

The primary identifier for the collection. The ticker must either be free, or the signer has appropriate permissions if reserved

#### Defined in

[api/procedures/types.ts:729](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L729)
