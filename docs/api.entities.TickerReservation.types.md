[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/TickerReservation/types

# api/entities/TickerReservation/types

## Enumerations

### TickerReservationStatus

Defined in: [api/entities/TickerReservation/types.ts:3](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/types.ts#L3)

#### Enumeration Members

##### AssetCreated

> **AssetCreated**: `"AssetCreated"`

Defined in: [api/entities/TickerReservation/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/types.ts#L15)

an Asset using this ticker has already been created

##### Free

> **Free**: `"Free"`

Defined in: [api/entities/TickerReservation/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/types.ts#L7)

ticker hasn't been reserved or previous reservation expired

##### Reserved

> **Reserved**: `"Reserved"`

Defined in: [api/entities/TickerReservation/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/types.ts#L11)

ticker is currently reserved

## Type Aliases

### TickerReservationDetails

> **TickerReservationDetails** = `object` & \{ `status`: [`Free`](../wiki/#free) \| [`Reserved`](../wiki/#reserved); \} \| \{ `assetId`: `string`; `status`: [`AssetCreated`](../wiki/#assetcreated); \}

Defined in: [api/entities/TickerReservation/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/types.ts#L18)

#### Type Declaration

##### expiryDate

> **expiryDate**: `Date` \| `null`

date at which the reservation expires, null if it never expires (permanent reservation or Asset already launched)

##### owner

> **owner**: [`Identity`](../wiki/api.entities.Identity#identity) \| `null`

Identity ID of the owner of the ticker, null if it hasn't been reserved
