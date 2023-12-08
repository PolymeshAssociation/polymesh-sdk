# Interface: AcceptPrimaryKeyRotationParams

[api/procedures/types](../wiki/api.procedures.types).AcceptPrimaryKeyRotationParams

## Table of contents

### Properties

- [cddAuth](../wiki/api.procedures.types.AcceptPrimaryKeyRotationParams#cddauth)
- [ownerAuth](../wiki/api.procedures.types.AcceptPrimaryKeyRotationParams#ownerauth)

## Properties

### cddAuth

• `Optional` **cddAuth**: [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) \| `BigNumber`

(optional) Authorization from a CDD service provider attesting the rotation of primary key

#### Defined in

[api/procedures/types.ts:249](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L249)

___

### ownerAuth

• **ownerAuth**: [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) \| `BigNumber`

Authorization from the owner who initiated the change

#### Defined in

[api/procedures/types.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L245)
