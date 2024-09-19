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

[api/procedures/types.ts:586](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L586)

___

### ownerAuth

• **ownerAuth**: [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) \| `BigNumber`

Authorization from the owner who initiated the change

#### Defined in

[api/procedures/types.ts:582](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L582)
