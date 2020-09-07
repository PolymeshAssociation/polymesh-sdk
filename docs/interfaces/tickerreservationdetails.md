# Interface: TickerReservationDetails

## Hierarchy

* **TickerReservationDetails**

## Index

### Properties

* [expiryDate](tickerreservationdetails.md#expirydate)
* [owner](tickerreservationdetails.md#owner)
* [status](tickerreservationdetails.md#status)

## Properties

###  expiryDate

• **expiryDate**: *Date | null*

*Defined in [src/api/entities/TickerReservation/types.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/8d4ef126/src/api/entities/TickerReservation/types.ts#L11)*

date at which the reservation expires, null if it never expires (permanent reservation or token already launched)

___

###  owner

• **owner**: *[Identity](../classes/identity.md) | null*

*Defined in [src/api/entities/TickerReservation/types.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/8d4ef126/src/api/entities/TickerReservation/types.ts#L7)*

identity ID of the owner of the ticker, null if it hasn't been reserved

___

###  status

• **status**: *[TickerReservationStatus](../enums/tickerreservationstatus.md)*

*Defined in [src/api/entities/TickerReservation/types.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/8d4ef126/src/api/entities/TickerReservation/types.ts#L12)*
