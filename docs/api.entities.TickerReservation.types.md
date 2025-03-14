# Module: api/entities/TickerReservation/types

## Table of contents

### Enumerations

- [TickerReservationStatus](../wiki/api.entities.TickerReservation.types.TickerReservationStatus)

### Type Aliases

- [TickerReservationDetails](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)

## Type Aliases

### TickerReservationDetails

Ƭ **TickerReservationDetails**: \{ `expiryDate`: `Date` \| ``null`` ; `owner`: [`Identity`](../wiki/api.entities.Identity.Identity) \| ``null``  } & \{ `status`: [`Free`](../wiki/api.entities.TickerReservation.types.TickerReservationStatus#free) \| [`Reserved`](../wiki/api.entities.TickerReservation.types.TickerReservationStatus#reserved)  } \| \{ `assetId`: `string` ; `status`: [`AssetCreated`](../wiki/api.entities.TickerReservation.types.TickerReservationStatus#assetcreated)  }

#### Defined in

[api/entities/TickerReservation/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/TickerReservation/types.ts#L18)
