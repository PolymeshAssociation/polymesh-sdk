# Interface: InvestInOfferingParams

[api/procedures/types](../wiki/api.procedures.types).InvestInOfferingParams

## Table of contents

### Properties

- [fundingPortfolio](../wiki/api.procedures.types.InvestInOfferingParams#fundingportfolio)
- [maxPrice](../wiki/api.procedures.types.InvestInOfferingParams#maxprice)
- [purchaseAmount](../wiki/api.procedures.types.InvestInOfferingParams#purchaseamount)
- [purchasePortfolio](../wiki/api.procedures.types.InvestInOfferingParams#purchaseportfolio)

## Properties

### fundingPortfolio

• **fundingPortfolio**: [`PortfolioLike`](../wiki/types#portfoliolike)

portfolio from which funds will be withdrawn to pay for the Asset tokens

#### Defined in

[api/procedures/types.ts:939](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L939)

___

### maxPrice

• `Optional` **maxPrice**: `BigNumber`

maximum average price to pay per Asset token (optional)

#### Defined in

[api/procedures/types.ts:947](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L947)

___

### purchaseAmount

• **purchaseAmount**: `BigNumber`

amount of Asset tokens to purchase

#### Defined in

[api/procedures/types.ts:943](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L943)

___

### purchasePortfolio

• **purchasePortfolio**: [`PortfolioLike`](../wiki/types#portfoliolike)

portfolio in which the purchased Asset tokens will be stored

#### Defined in

[api/procedures/types.ts:935](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L935)
