# Interface: TickerReservationDetails

[api/entities/TickerReservation/types](../wiki/api.entities.TickerReservation.types).TickerReservationDetails

## Table of contents

### Properties

- [expiryDate](../wiki/api.entities.TickerReservation.types.TickerReservationDetails#expirydate)
- [owner](../wiki/api.entities.TickerReservation.types.TickerReservationDetails#owner)
- [status](../wiki/api.entities.TickerReservation.types.TickerReservationDetails#status)

## Properties

### expiryDate

• **expiryDate**: ``null`` \| `Date`

date at which the reservation expires, null if it never expires (permanent reservation or Asset already launched)

#### Defined in

[api/entities/TickerReservation/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/TickerReservation/types.ts#L26)

___

### owner

• **owner**: ``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity ID of the owner of the ticker, null if it hasn't been reserved

#### Defined in

[api/entities/TickerReservation/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/TickerReservation/types.ts#L22)

___

### status

• **status**: [`TickerReservationStatus`](../wiki/api.entities.TickerReservation.types.TickerReservationStatus)

#### Defined in

[api/entities/TickerReservation/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/TickerReservation/types.ts#L27)
