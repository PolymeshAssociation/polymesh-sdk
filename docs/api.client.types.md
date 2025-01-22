# Module: api/client/types

## Table of contents

### Enumerations

- [ErrorCode](../wiki/api.client.types.ErrorCode)
- [InstructionStatusEnum](../wiki/api.client.types.InstructionStatusEnum)

### Interfaces

- [EventIdentifier](../wiki/api.client.types.EventIdentifier)
- [ExtrinsicData](../wiki/api.client.types.ExtrinsicData)
- [ExtrinsicDataWithFees](../wiki/api.client.types.ExtrinsicDataWithFees)
- [Fees](../wiki/api.client.types.Fees)
- [InstructionPartiesFilters](../wiki/api.client.types.InstructionPartiesFilters)
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

[api/client/types.ts:207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L207)

___

### CustomClaimTypeWithDid

Ƭ **CustomClaimTypeWithDid**: [`CustomClaimType`](../wiki/api.client.types#customclaimtype) & \{ `did?`: `string`  }

CustomClaimType with DID that registered the CustomClaimType

#### Defined in

[api/client/types.ts:215](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/types.ts#L215)
