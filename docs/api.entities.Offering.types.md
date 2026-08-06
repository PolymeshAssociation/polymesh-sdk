[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Offering/types

# api/entities/Offering/types

## Enumerations

### OfferingBalanceStatus

Defined in: [api/entities/Offering/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L21)

#### Enumeration Members

##### Available

> **Available**: `"Available"`

Defined in: [api/entities/Offering/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L25)

There still are Asset tokens available for purchase

##### Residual

> **Residual**: `"Residual"`

Defined in: [api/entities/Offering/types.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L35)

There are remaining Asset tokens, but their added value is lower than the Offering's
  minimum investment, so they cannot be purchased. The Offering should be manually closed
  to retrieve them

##### SoldOut

> **SoldOut**: `"SoldOut"`

Defined in: [api/entities/Offering/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L29)

All Asset tokens in the Offering have been sold

***

### OfferingSaleStatus

Defined in: [api/entities/Offering/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L38)

#### Enumeration Members

##### Closed

> **Closed**: `"Closed"`

Defined in: [api/entities/Offering/types.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L54)

Sale was manually closed after the end date was reached

##### ClosedEarly

> **ClosedEarly**: `"ClosedEarly"`

Defined in: [api/entities/Offering/types.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L50)

Sale was manually closed before the end date was reached

##### Frozen

> **Frozen**: `"Frozen"`

Defined in: [api/entities/Offering/types.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L42)

Sale temporarily paused, can be resumed (unfrozen)

##### Live

> **Live**: `"Live"`

Defined in: [api/entities/Offering/types.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L46)

Investments can be made

***

### OfferingTimingStatus

Defined in: [api/entities/Offering/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L6)

#### Enumeration Members

##### Expired

> **Expired**: `"Expired"`

Defined in: [api/entities/Offering/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L18)

End date reached

##### NotStarted

> **NotStarted**: `"NotStarted"`

Defined in: [api/entities/Offering/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L10)

Start date not reached yet

##### Started

> **Started**: `"Started"`

Defined in: [api/entities/Offering/types.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L14)

Between start and end date

## Interfaces

### Investment

Defined in: [api/entities/Offering/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L88)

#### Properties

##### investedAmount

> **investedAmount**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L91)

##### investor

> **investor**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/Offering/types.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L89)

##### soldAmount

> **soldAmount**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L90)

***

### OffChainFundingReceipt

Defined in: [api/entities/Offering/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L103)

#### Properties

##### metadata

> **metadata**: `string` \| `undefined`

Defined in: [api/entities/Offering/types.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L119)

(optional) Metadata value that can be used to attach messages to the receipt

##### signature

> **signature**: [`OffChainSignature`](../wiki/api.procedures.types#offchainsignature)

Defined in: [api/entities/Offering/types.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L115)

Signature confirming the receipt details

##### signer

> **signer**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Offering/types.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L111)

Signer of this receipt

##### uid

> **uid**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L107)

Unique receipt number set by the signer for their receipts

***

### OfferingDetails

Defined in: [api/entities/Offering/types.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L72)

#### Properties

##### creator

> **creator**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/Offering/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L73)

##### end

> **end**: `Date` \| `null`

Defined in: [api/entities/Offering/types.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L81)

##### minInvestment

> **minInvestment**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L83)

##### name

> **name**: `string`

Defined in: [api/entities/Offering/types.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L74)

##### offeringPortfolio

> **offeringPortfolio**: [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/entities/Offering/types.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L75)

##### raisingCurrency

> **raisingCurrency**: `string`

Defined in: [api/entities/Offering/types.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L77)

##### raisingPortfolio

> **raisingPortfolio**: [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/entities/Offering/types.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L76)

##### start

> **start**: `Date`

Defined in: [api/entities/Offering/types.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L80)

##### status

> **status**: [`OfferingStatus`](../wiki/#offeringstatus)

Defined in: [api/entities/Offering/types.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L82)

##### tiers

> **tiers**: [`Tier`](../wiki/#tier)[]

Defined in: [api/entities/Offering/types.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L78)

##### totalAmount

> **totalAmount**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L84)

##### totalRemaining

> **totalRemaining**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L85)

##### venue

> **venue**: [`Venue`](../wiki/api.entities.Venue#venue)

Defined in: [api/entities/Offering/types.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L79)

***

### OfferingStatus

Defined in: [api/entities/Offering/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L57)

#### Properties

##### balance

> **balance**: [`OfferingBalanceStatus`](../wiki/#offeringbalancestatus)

Defined in: [api/entities/Offering/types.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L59)

##### sale

> **sale**: [`OfferingSaleStatus`](../wiki/#offeringsalestatus)

Defined in: [api/entities/Offering/types.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L60)

##### timing

> **timing**: [`OfferingTimingStatus`](../wiki/#offeringtimingstatus)

Defined in: [api/entities/Offering/types.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L58)

***

### OfferingTier

Defined in: [api/entities/Offering/types.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L63)

#### Extended by

- [`Tier`](../wiki/#tier)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L64)

##### price

> **price**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L65)

***

### Tier

Defined in: [api/entities/Offering/types.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L68)

#### Extends

- [`OfferingTier`](../wiki/#offeringtier)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L64)

###### Inherited from

[`OfferingTier`](../wiki/#offeringtier).[`amount`](../wiki/#amount)

##### price

> **price**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L65)

###### Inherited from

[`OfferingTier`](../wiki/#offeringtier).[`price`](../wiki/#price)

##### remaining

> **remaining**: `BigNumber`

Defined in: [api/entities/Offering/types.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L69)

## Type Aliases

### OffChainFundingDetails

> **OffChainFundingDetails** = \{ `enabled`: `false`; \} \| \{ `enabled`: `true`; `offChainTicker`: `string`; \}

Defined in: [api/entities/Offering/types.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/types.ts#L94)
