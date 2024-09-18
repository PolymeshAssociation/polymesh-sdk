# Module: api/entities/MetadataEntry/types

## Table of contents

### Enumerations

- [MetadataLockStatus](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus)
- [MetadataType](../wiki/api.entities.MetadataEntry.types.MetadataType)

### Interfaces

- [MetadataDetails](../wiki/api.entities.MetadataEntry.types.MetadataDetails)
- [MetadataSpec](../wiki/api.entities.MetadataEntry.types.MetadataSpec)

### Type Aliases

- [GlobalMetadataKey](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)
- [MetadataValue](../wiki/api.entities.MetadataEntry.types#metadatavalue)
- [MetadataValueDetails](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails)

## Type Aliases

### GlobalMetadataKey

Ƭ **GlobalMetadataKey**: [`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails) & { `id`: `BigNumber`  }

#### Defined in

[api/entities/MetadataEntry/types.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/types.ts#L53)

___

### MetadataValue

Ƭ **MetadataValue**: { `value`: `string`  } & [`MetadataValueDetails`](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails)

#### Defined in

[api/entities/MetadataEntry/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/types.ts#L49)

___

### MetadataValueDetails

Ƭ **MetadataValueDetails**: { `expiry`: `Date` \| ``null``  } & { `lockStatus`: `Exclude`<[`MetadataLockStatus`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus), [`LockedUntil`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus#lockeduntil)\>  } \| { `lockStatus`: [`LockedUntil`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus#lockeduntil) ; `lockedUntil`: `Date`  }

#### Defined in

[api/entities/MetadataEntry/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MetadataEntry/types.ts#L25)
