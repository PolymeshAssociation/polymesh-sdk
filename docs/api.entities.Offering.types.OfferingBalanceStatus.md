# Enumeration: OfferingBalanceStatus

[api/entities/Offering/types](../wiki/api.entities.Offering.types).OfferingBalanceStatus

## Table of contents

### Enumeration Members

- [Available](../wiki/api.entities.Offering.types.OfferingBalanceStatus#available)
- [Residual](../wiki/api.entities.Offering.types.OfferingBalanceStatus#residual)
- [SoldOut](../wiki/api.entities.Offering.types.OfferingBalanceStatus#soldout)

## Enumeration Members

### Available

• **Available** = ``"Available"``

There still are Asset tokens available for purchase

#### Defined in

[api/entities/Offering/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Offering/types.ts#L24)

___

### Residual

• **Residual** = ``"Residual"``

There are remaining Asset tokens, but their added value is lower than the Offering's
  minimum investment, so they cannot be purchased. The Offering should be manually closed
  to retrieve them

#### Defined in

[api/entities/Offering/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Offering/types.ts#L34)

___

### SoldOut

• **SoldOut** = ``"SoldOut"``

All Asset tokens in the Offering have been sold

#### Defined in

[api/entities/Offering/types.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Offering/types.ts#L28)
