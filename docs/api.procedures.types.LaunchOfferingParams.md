# Interface: LaunchOfferingParams

[api/procedures/types](../wiki/api.procedures.types).LaunchOfferingParams

## Table of contents

### Properties

- [end](../wiki/api.procedures.types.LaunchOfferingParams#end)
- [minInvestment](../wiki/api.procedures.types.LaunchOfferingParams#mininvestment)
- [name](../wiki/api.procedures.types.LaunchOfferingParams#name)
- [offeringPortfolio](../wiki/api.procedures.types.LaunchOfferingParams#offeringportfolio)
- [raisingCurrency](../wiki/api.procedures.types.LaunchOfferingParams#raisingcurrency)
- [raisingPortfolio](../wiki/api.procedures.types.LaunchOfferingParams#raisingportfolio)
- [start](../wiki/api.procedures.types.LaunchOfferingParams#start)
- [tiers](../wiki/api.procedures.types.LaunchOfferingParams#tiers)
- [venue](../wiki/api.procedures.types.LaunchOfferingParams#venue)

## Properties

### end

• `Optional` **end**: `Date`

end date of the Offering (optional, defaults to never)

#### Defined in

[api/procedures/types.ts:795](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L795)

___

### minInvestment

• **minInvestment**: `BigNumber`

minimum amount that can be spent on this offering

#### Defined in

[api/procedures/types.ts:804](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L804)

___

### name

• **name**: `string`

#### Defined in

[api/procedures/types.ts:787](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L787)

___

### offeringPortfolio

• **offeringPortfolio**: [`PortfolioLike`](../wiki/types#portfoliolike)

portfolio in which the Asset tokens to be sold are stored

#### Defined in

[api/procedures/types.ts:771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L771)

___

### raisingCurrency

• **raisingCurrency**: `string`

ticker symbol of the currency in which the funds are being raised (e.g. 'USD' or 'CAD').
  Other Assets can be used as currency as well

#### Defined in

[api/procedures/types.ts:780](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L780)

___

### raisingPortfolio

• **raisingPortfolio**: [`PortfolioLike`](../wiki/types#portfoliolike)

portfolio in which the raised funds will be stored

#### Defined in

[api/procedures/types.ts:775](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L775)

___

### start

• `Optional` **start**: `Date`

start date of the Offering (optional, defaults to right now)

#### Defined in

[api/procedures/types.ts:791](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L791)

___

### tiers

• **tiers**: [`OfferingTier`](../wiki/api.entities.Offering.types.OfferingTier)[]

array of sale tiers. Each tier consists of an amount of Assets to be sold at a certain price.
  Tokens in a tier can only be bought when all tokens in previous tiers have been bought

#### Defined in

[api/procedures/types.ts:800](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L800)

___

### venue

• `Optional` **venue**: [`Venue`](../wiki/api.entities.Venue.Venue)

venue through which all offering related trades will be settled
  (optional, defaults to the first `Sto` type Venue owned by the owner of the Offering Portfolio.
  If passed, it must be of type `Sto`)

#### Defined in

[api/procedures/types.ts:786](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L786)
