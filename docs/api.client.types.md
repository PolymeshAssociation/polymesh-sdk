# Module: api/client/types

## Table of contents

### Enumerations

- [ErrorCode](../wiki/api.client.types.ErrorCode)

### Interfaces

- [EventIdentifier](../wiki/api.client.types.EventIdentifier)
- [ExtrinsicData](../wiki/api.client.types.ExtrinsicData)
- [ExtrinsicDataWithFees](../wiki/api.client.types.ExtrinsicDataWithFees)
- [Fees](../wiki/api.client.types.Fees)
- [MiddlewareConfig](../wiki/api.client.types.MiddlewareConfig)
- [MiddlewareMetadata](../wiki/api.client.types.MiddlewareMetadata)
- [NetworkProperties](../wiki/api.client.types.NetworkProperties)
- [PolkadotConfig](../wiki/api.client.types.PolkadotConfig)
- [ProtocolFees](../wiki/api.client.types.ProtocolFees)
- [SubmissionDetails](../wiki/api.client.types.SubmissionDetails)

### Type Aliases

- [CustomClaimType](../wiki/api.client.types#customclaimtype)
- [CustomClaimTypeWithDid](../wiki/api.client.types#customclaimtypewithdid)

## Type Aliases

### CustomClaimType

Ƭ **CustomClaimType**: `Object`

CustomClaimType

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `BigNumber` |
| `name` | `string` |

#### Defined in

[api/client/types.ts:202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L202)

___

### CustomClaimTypeWithDid

Ƭ **CustomClaimTypeWithDid**: [`CustomClaimType`](../wiki/api.client.types#customclaimtype) & \{ `did?`: `string`  }

CustomClaimType with DID that registered the CustomClaimType

#### Defined in

[api/client/types.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L210)
