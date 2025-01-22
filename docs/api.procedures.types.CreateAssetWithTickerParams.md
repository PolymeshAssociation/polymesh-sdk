# Interface: CreateAssetWithTickerParams

[api/procedures/types](../wiki/api.procedures.types).CreateAssetWithTickerParams

## Hierarchy

- [`CreateAssetParams`](../wiki/api.procedures.types.CreateAssetParams)

  ↳ **`CreateAssetWithTickerParams`**

## Table of contents

### Properties

- [assetType](../wiki/api.procedures.types.CreateAssetWithTickerParams#assettype)
- [documents](../wiki/api.procedures.types.CreateAssetWithTickerParams#documents)
- [fundingRound](../wiki/api.procedures.types.CreateAssetWithTickerParams#fundinground)
- [initialStatistics](../wiki/api.procedures.types.CreateAssetWithTickerParams#initialstatistics)
- [initialSupply](../wiki/api.procedures.types.CreateAssetWithTickerParams#initialsupply)
- [isDivisible](../wiki/api.procedures.types.CreateAssetWithTickerParams#isdivisible)
- [name](../wiki/api.procedures.types.CreateAssetWithTickerParams#name)
- [portfolioId](../wiki/api.procedures.types.CreateAssetWithTickerParams#portfolioid)
- [securityIdentifiers](../wiki/api.procedures.types.CreateAssetWithTickerParams#securityidentifiers)
- [ticker](../wiki/api.procedures.types.CreateAssetWithTickerParams#ticker)

## Properties

### assetType

• **assetType**: `string` \| `BigNumber`

type of security that the Asset represents (e.g. Equity, Debt, Commodity). Common values are included in the
  [KnownAssetType](../wiki/api.entities.Asset.types.KnownAssetType) enum, but custom values can be used as well. Custom values must be registered on-chain the first time
  they're used, requiring an additional transaction. They aren't tied to a specific Asset
  if using a custom type, it can be provided as a string (representing name) or a BigNumber (representing the custom type ID)

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[assetType](../wiki/api.procedures.types.CreateAssetParams#assettype)

#### Defined in

[api/procedures/types.ts:669](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L669)

___

### documents

• `Optional` **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types.AssetDocument)[]

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[documents](../wiki/api.procedures.types.CreateAssetParams#documents)

#### Defined in

[api/procedures/types.ts:678](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L678)

___

### fundingRound

• `Optional` **fundingRound**: `string`

(optional) funding round in which the Asset currently is (e.g. Series A, Series B)

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[fundingRound](../wiki/api.procedures.types.CreateAssetParams#fundinground)

#### Defined in

[api/procedures/types.ts:677](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L677)

___

### initialStatistics

• `Optional` **initialStatistics**: [`InputStatType`](../wiki/api.entities.types#inputstattype)[]

(optional) type of statistics that should be enabled for the Asset

Enabling statistics allows for TransferRestrictions to be made. For example the SEC requires registration for a company that
has either more than 2000 investors, or more than 500 non accredited investors. To prevent crossing this limit two restrictions are
needed, a `Count` of 2000, and a `ScopedCount` of non accredited with a maximum of 500. [source](https://www.sec.gov/info/smallbus/secg/jobs-act-section-12g-small-business-compliance-guide.htm)

These restrictions require a `Count` and `ScopedCount` statistic to be created. Although they an be created after the Asset is made, it is recommended to create statistics
before the Asset is circulated. Count statistics made after Asset creation need their initial value set, so it is simpler to create them before investors hold the Asset.
If you do need to create a stat for an Asset after creation, you can use the [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat) method in
the appropriate namespace

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[initialStatistics](../wiki/api.procedures.types.CreateAssetParams#initialstatistics)

#### Defined in

[api/procedures/types.ts:692](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L692)

___

### initialSupply

• `Optional` **initialSupply**: `BigNumber`

amount of Asset tokens that will be minted on creation (optional, default doesn't mint)

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[initialSupply](../wiki/api.procedures.types.CreateAssetParams#initialsupply)

#### Defined in

[api/procedures/types.ts:654](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L654)

___

### isDivisible

• **isDivisible**: `boolean`

whether a single Asset token can be divided into decimal parts

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[isDivisible](../wiki/api.procedures.types.CreateAssetParams#isdivisible)

#### Defined in

[api/procedures/types.ts:662](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L662)

___

### name

• **name**: `string`

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[name](../wiki/api.procedures.types.CreateAssetParams#name)

#### Defined in

[api/procedures/types.ts:650](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L650)

___

### portfolioId

• `Optional` **portfolioId**: `BigNumber`

portfolio to which the Asset tokens will be issued on creation (optional, default is the default portfolio)

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[portfolioId](../wiki/api.procedures.types.CreateAssetParams#portfolioid)

#### Defined in

[api/procedures/types.ts:658](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L658)

___

### securityIdentifiers

• `Optional` **securityIdentifiers**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types.SecurityIdentifier)[]

array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)

#### Inherited from

[CreateAssetParams](../wiki/api.procedures.types.CreateAssetParams).[securityIdentifiers](../wiki/api.procedures.types.CreateAssetParams#securityidentifiers)

#### Defined in

[api/procedures/types.ts:673](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L673)

___

### ticker

• `Optional` **ticker**: `string`

(optional) ticker to be linked with the Asset

**`Note`**

from 7.x chain, ticker has been made optional. For 6.x chain, it is still mandatory.

#### Defined in

[api/procedures/types.ts:712](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L712)
