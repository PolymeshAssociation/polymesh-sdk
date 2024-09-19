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

• **fundingPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

portfolio from which funds will be withdrawn to pay for the Asset tokens

#### Defined in

[api/procedures/types.ts:1522](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1522)

___

### maxPrice

• `Optional` **maxPrice**: `BigNumber`

maximum average price to pay per Asset token (optional)

#### Defined in

[api/procedures/types.ts:1530](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1530)

___

### purchaseAmount

• **purchaseAmount**: `BigNumber`

amount of Asset tokens to purchase

#### Defined in

[api/procedures/types.ts:1526](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1526)

___

### purchasePortfolio

• **purchasePortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

portfolio in which the purchased Asset tokens will be stored

#### Defined in

[api/procedures/types.ts:1518](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1518)
