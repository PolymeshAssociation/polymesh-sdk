[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/MetadataEntry/types

# api/entities/MetadataEntry/types

## Enumerations

### MetadataLockStatus

Defined in: [api/entities/MetadataEntry/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L10)

#### Enumeration Members

##### Locked

> **Locked**: `"Locked"`

Defined in: [api/entities/MetadataEntry/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L12)

##### LockedUntil

> **LockedUntil**: `"LockedUntil"`

Defined in: [api/entities/MetadataEntry/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L13)

##### Unlocked

> **Unlocked**: `"Unlocked"`

Defined in: [api/entities/MetadataEntry/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L11)

***

### MetadataType

Defined in: [api/entities/MetadataEntry/types.ts:5](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L5)

#### Enumeration Members

##### Global

> **Global**: `"Global"`

Defined in: [api/entities/MetadataEntry/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L7)

##### Local

> **Local**: `"Local"`

Defined in: [api/entities/MetadataEntry/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L6)

## Interfaces

### MetadataDetails

Defined in: [api/entities/MetadataEntry/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L22)

#### Properties

##### name

> **name**: `string`

Defined in: [api/entities/MetadataEntry/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L23)

##### specs

> **specs**: [`MetadataSpec`](../wiki/#metadataspec)

Defined in: [api/entities/MetadataEntry/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L24)

***

### MetadataSpec

Defined in: [api/entities/MetadataEntry/types.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L16)

#### Properties

##### description?

> `optional` **description?**: `string`

Defined in: [api/entities/MetadataEntry/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L18)

##### typeDef?

> `optional` **typeDef?**: `string`

Defined in: [api/entities/MetadataEntry/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L19)

##### url?

> `optional` **url?**: `string`

Defined in: [api/entities/MetadataEntry/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L17)

## Type Aliases

### GlobalMetadataKey

> **GlobalMetadataKey** = [`MetadataDetails`](../wiki/#metadatadetails) & `object`

Defined in: [api/entities/MetadataEntry/types.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L58)

#### Type Declaration

##### id

> **id**: `BigNumber`

***

### MetadataValue

> **MetadataValue** = `object` & [`MetadataValueDetails`](../wiki/#metadatavaluedetails)

Defined in: [api/entities/MetadataEntry/types.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L54)

#### Type Declaration

##### value

> **value**: `string` \| `undefined`

***

### MetadataValueDetails

> **MetadataValueDetails** = `object` & \{ `lockStatus`: `Exclude`\<[`MetadataLockStatus`](../wiki/#metadatalockstatus), [`LockedUntil`](../wiki/#lockeduntil)\>; \} \| \{ `lockedUntil`: `Date`; `lockStatus`: [`LockedUntil`](../wiki/#lockeduntil) \| `undefined`; \} \| \{ `lockStatus`: `undefined`; \}

Defined in: [api/entities/MetadataEntry/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L27)

#### Type Declaration

##### expiry?

> `optional` **expiry?**: `Date` \| `null`

Date at which the Metadata value expires, null if it never expires

***

### MetadataWithValue

> **MetadataWithValue** = `object` & [`MetadataDetails`](../wiki/#metadatadetails) & [`MetadataValue`](../wiki/#metadatavalue)

Defined in: [api/entities/MetadataEntry/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MetadataEntry/types.ts#L62)

#### Type Declaration

##### metadataEntry

> **metadataEntry**: [`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)
