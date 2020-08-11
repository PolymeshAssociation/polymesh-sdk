# Interface: TickerReservationDetails

## Hierarchy

* **TickerReservationDetails**

## Index

### Properties

* [expiryDate](_src_api_entities_tickerreservation_types_.tickerreservationdetails.md#expirydate)
* [owner](_src_api_entities_tickerreservation_types_.tickerreservationdetails.md#owner)
* [status](_src_api_entities_tickerreservation_types_.tickerreservationdetails.md#status)

## Properties

###  expiryDate

• **expiryDate**: *Date | null*

*Defined in [src/api/entities/TickerReservation/types.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/types.ts#L11)*

date at which the reservation expires, null if it never expires (permanent reservation or token already launched)

___

###  owner

• **owner**: *[Identity](../classes/_src_api_entities_identity_index_.identity.md) | null*

*Defined in [src/api/entities/TickerReservation/types.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/types.ts#L7)*

identity ID of the owner of the ticker, null if it hasn't been reserved

___

###  status

• **status**: *[TickerReservationStatus](../enums/_src_api_entities_tickerreservation_types_.tickerreservationstatus.md)*

*Defined in [src/api/entities/TickerReservation/types.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/types.ts#L12)*
