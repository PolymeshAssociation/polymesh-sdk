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

[api/procedures/types.ts:1015](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L1015)

___

### maxPrice

• `Optional` **maxPrice**: `BigNumber`

maximum average price to pay per Asset token (optional)

#### Defined in

[api/procedures/types.ts:1023](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L1023)

___

### purchaseAmount

• **purchaseAmount**: `BigNumber`

amount of Asset tokens to purchase

#### Defined in

[api/procedures/types.ts:1019](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L1019)

___

### purchasePortfolio

• **purchasePortfolio**: [`PortfolioLike`](../wiki/types#portfoliolike)

portfolio in which the purchased Asset tokens will be stored

#### Defined in

[api/procedures/types.ts:1011](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L1011)
