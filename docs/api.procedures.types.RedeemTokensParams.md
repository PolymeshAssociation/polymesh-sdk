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

[api/procedures/types.ts:1207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1207)

___

### from

• `Optional` **from**: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)

#### Defined in

[api/procedures/types.ts:1211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1211)
