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

[api/procedures/types.ts:574](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L574)

___

### ownerAuth

• **ownerAuth**: [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) \| `BigNumber`

Authorization from the owner who initiated the change

#### Defined in

[api/procedures/types.ts:570](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L570)
