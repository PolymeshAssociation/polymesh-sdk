# Interface: ConfigureDividendDistributionParams

[api/procedures/types](../wiki/api.procedures.types).ConfigureDividendDistributionParams

## Table of contents

### Properties

- [checkpoint](../wiki/api.procedures.types.ConfigureDividendDistributionParams#checkpoint)
- [currency](../wiki/api.procedures.types.ConfigureDividendDistributionParams#currency)
- [declarationDate](../wiki/api.procedures.types.ConfigureDividendDistributionParams#declarationdate)
- [defaultTaxWithholding](../wiki/api.procedures.types.ConfigureDividendDistributionParams#defaulttaxwithholding)
- [description](../wiki/api.procedures.types.ConfigureDividendDistributionParams#description)
- [expiryDate](../wiki/api.procedures.types.ConfigureDividendDistributionParams#expirydate)
- [maxAmount](../wiki/api.procedures.types.ConfigureDividendDistributionParams#maxamount)
- [originPortfolio](../wiki/api.procedures.types.ConfigureDividendDistributionParams#originportfolio)
- [paymentDate](../wiki/api.procedures.types.ConfigureDividendDistributionParams#paymentdate)
- [perShare](../wiki/api.procedures.types.ConfigureDividendDistributionParams#pershare)
- [targets](../wiki/api.procedures.types.ConfigureDividendDistributionParams#targets)
- [taxWithholdings](../wiki/api.procedures.types.ConfigureDividendDistributionParams#taxwithholdings)

## Properties

### checkpoint

• **checkpoint**: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint)

checkpoint to be used to calculate Dividends. If a Schedule is passed, the next Checkpoint it creates will be used.
  If a Date is passed, a Checkpoint will be created at that date and used

#### Defined in

[api/procedures/types.ts:1316](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1316)

___

### currency

• **currency**: `string`

ticker of the currency in which Dividends will be distributed

#### Defined in

[api/procedures/types.ts:1324](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1324)

___

### declarationDate

• `Optional` **declarationDate**: `Date`

date at which the issuer publicly declared the Dividend Distribution. Optional, defaults to the current date

#### Defined in

[api/procedures/types.ts:1295](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1295)

___

### defaultTaxWithholding

• `Optional` **defaultTaxWithholding**: `BigNumber`

default percentage (0-100) of the Benefits to be held for tax purposes

#### Defined in

[api/procedures/types.ts:1306](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1306)

___

### description

• **description**: `string`

#### Defined in

[api/procedures/types.ts:1296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1296)

___

### expiryDate

• `Optional` **expiryDate**: `Date`

optional, defaults to never expiring

#### Defined in

[api/procedures/types.ts:1340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1340)

___

### maxAmount

• **maxAmount**: `BigNumber`

maximum amount of `currency` to distribute in total

#### Defined in

[api/procedures/types.ts:1332](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1332)

___

### originPortfolio

• `Optional` **originPortfolio**: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)

portfolio from which the Dividends will be distributed. Optional, defaults to the Dividend Distributions Agent's Default Portfolio

#### Defined in

[api/procedures/types.ts:1320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1320)

___

### paymentDate

• **paymentDate**: `Date`

date from which Asset Holders can claim their Dividends

#### Defined in

[api/procedures/types.ts:1336](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1336)

___

### perShare

• **perShare**: `BigNumber`

amount of `currency` to distribute per each share of the Asset that a target holds

#### Defined in

[api/procedures/types.ts:1328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1328)

___

### targets

• `Optional` **targets**: [`InputCorporateActionTargets`](../wiki/api.procedures.types#inputcorporateactiontargets)

Asset Holder Identities to be included (or excluded) from the Dividend Distribution. Inclusion/exclusion is controlled by the `treatment`
  property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
  the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Dividend Distribution

#### Defined in

[api/procedures/types.ts:1302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1302)

___

### taxWithholdings

• `Optional` **taxWithholdings**: [`InputCorporateActionTaxWithholdings`](../wiki/api.procedures.types#inputcorporateactiontaxwithholdings)

percentage (0-100) of the Benefits to be held for tax purposes from individual Asset Holder Identities.
  This overrides the value of `defaultTaxWithholding`

#### Defined in

[api/procedures/types.ts:1311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1311)
