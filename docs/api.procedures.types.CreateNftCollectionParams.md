# Interface: CreateNftCollectionParams

[api/procedures/types](../wiki/api.procedures.types).CreateNftCollectionParams

## Table of contents

### Properties

- [collectionKeys](../wiki/api.procedures.types.CreateNftCollectionParams#collectionkeys)
- [documents](../wiki/api.procedures.types.CreateNftCollectionParams#documents)
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

[api/procedures/types.ts:371](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L371)

___

### documents

• `Optional` **documents**: [`AssetDocument`](../wiki/types.AssetDocument)[]

Links to off chain documents related to the NftCollection

#### Defined in

[api/procedures/types.ts:375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L375)

___

### name

• `Optional` **name**: `string`

The collection name. defaults to `ticker`

#### Defined in

[api/procedures/types.ts:355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L355)

___

### nftType

• **nftType**: `string` \| `BigNumber`

**`Throws`**

 if provided string that does not have a custom type

**`Throws`**

 if provided a BigNumber that does not correspond to a custom type

#### Defined in

[api/procedures/types.ts:360](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L360)

___

### securityIdentifiers

• `Optional` **securityIdentifiers**: [`SecurityIdentifier`](../wiki/types.SecurityIdentifier)[]

array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)

#### Defined in

[api/procedures/types.ts:364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L364)

___

### ticker

• **ticker**: `string`

The primary identifier for the collection. The ticker must either be free, or the signer has appropriate permissions if reserved

#### Defined in

[api/procedures/types.ts:351](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L351)
