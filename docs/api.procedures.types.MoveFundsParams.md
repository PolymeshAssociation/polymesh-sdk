# Interface: MoveFundsParams

[api/procedures/types](../wiki/api.procedures.types).MoveFundsParams

## Table of contents

### Properties

- [items](../wiki/api.procedures.types.MoveFundsParams#items)
- [to](../wiki/api.procedures.types.MoveFundsParams#to)

## Properties

### items

• **items**: [`PortfolioMovement`](../wiki/types#portfoliomovement)[]

list of Assets (and the corresponding token amounts) that will be moved

#### Defined in

[api/procedures/types.ts:1093](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L1093)

___

### to

• `Optional` **to**: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

portfolio (or portfolio ID) that will receive the funds. Optional, if no value is passed, the funds will be moved to the default Portfolio of this Portfolio's owner

#### Defined in

[api/procedures/types.ts:1089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L1089)
