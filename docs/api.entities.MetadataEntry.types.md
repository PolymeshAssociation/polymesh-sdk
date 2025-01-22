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
- [MetadataWithValue](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)

## Type Aliases

### GlobalMetadataKey

Ƭ **GlobalMetadataKey**: [`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails) & \{ `id`: `BigNumber`  }

#### Defined in

[api/entities/MetadataEntry/types.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/types.ts#L55)

___

### MetadataValue

Ƭ **MetadataValue**: \{ `value`: `string`  } & [`MetadataValueDetails`](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails)

#### Defined in

[api/entities/MetadataEntry/types.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/types.ts#L51)

___

### MetadataValueDetails

Ƭ **MetadataValueDetails**: \{ `expiry`: `Date` \| ``null``  } & \{ `lockStatus`: `Exclude`\<[`MetadataLockStatus`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus), [`LockedUntil`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus#lockeduntil)\>  } \| \{ `lockStatus`: [`LockedUntil`](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus#lockeduntil) ; `lockedUntil`: `Date`  }

#### Defined in

[api/entities/MetadataEntry/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/types.ts#L27)

___

### MetadataWithValue

Ƭ **MetadataWithValue**: \{ `metadataEntry`: [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)  } & [`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails) & [`MetadataValue`](../wiki/api.entities.MetadataEntry.types#metadatavalue)

#### Defined in

[api/entities/MetadataEntry/types.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/MetadataEntry/types.ts#L59)
