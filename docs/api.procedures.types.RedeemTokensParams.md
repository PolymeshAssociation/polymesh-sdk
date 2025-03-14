# Interface: RedeemTokensParams

[api/procedures/types](../wiki/api.procedures.types).RedeemTokensParams

## Table of contents

### Properties

- [amount](../wiki/api.procedures.types.RedeemTokensParams#amount)
- [from](../wiki/api.procedures.types.RedeemTokensParams#from)

## Properties

### amount

• **amount**: `BigNumber`

amount of Asset tokens to be redeemed

#### Defined in

[api/procedures/types.ts:1239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1239)

___

### from

• `Optional` **from**: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)

#### Defined in

[api/procedures/types.ts:1243](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1243)
