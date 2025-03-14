# Interface: VenueFilteringDetails

[api/entities/Asset/types](../wiki/api.entities.Asset.types).VenueFilteringDetails

## Table of contents

### Properties

- [allowedVenues](../wiki/api.entities.Asset.types.VenueFilteringDetails#allowedvenues)
- [isEnabled](../wiki/api.entities.Asset.types.VenueFilteringDetails#isenabled)

## Properties

### allowedVenues

• **allowedVenues**: [`Venue`](../wiki/api.entities.Venue.Venue)[]

If `isEnabled` is true, then only these venues are allowed to create instructions involving the asset

#### Defined in

[api/entities/Asset/types.ts:235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L235)

___

### isEnabled

• **isEnabled**: `boolean`

Whether or not Venue filtering is enabled. If enabled then only allowed the Venues are able to create instructions to trade the asset

#### Defined in

[api/entities/Asset/types.ts:231](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L231)
