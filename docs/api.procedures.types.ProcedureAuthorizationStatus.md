# Interface: ProcedureAuthorizationStatus

[api/procedures/types](../wiki/api.procedures.types).ProcedureAuthorizationStatus

## Table of contents

### Properties

- [accountFrozen](../wiki/api.procedures.types.ProcedureAuthorizationStatus#accountfrozen)
- [agentPermissions](../wiki/api.procedures.types.ProcedureAuthorizationStatus#agentpermissions)
- [noIdentity](../wiki/api.procedures.types.ProcedureAuthorizationStatus#noidentity)
- [roles](../wiki/api.procedures.types.ProcedureAuthorizationStatus#roles)
- [signerPermissions](../wiki/api.procedures.types.ProcedureAuthorizationStatus#signerpermissions)

## Properties

### accountFrozen

• **accountFrozen**: `boolean`

whether the Account is frozen (i.e. can't perform any transactions)

#### Defined in

[api/procedures/types.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L82)

___

### agentPermissions

• **agentPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Identity`](../wiki/api.entities.types.SignerType#identity)\>

whether the Identity complies with all required Agent permissions

#### Defined in

[api/procedures/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L70)

___

### noIdentity

• **noIdentity**: `boolean`

true only if the Procedure requires an Identity but the signing Account
  doesn't have one associated

#### Defined in

[api/procedures/types.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L87)

___

### roles

• **roles**: [`CheckRolesResult`](../wiki/api.entities.types.CheckRolesResult)

whether the Identity complies with all required Roles

#### Defined in

[api/procedures/types.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L78)

___

### signerPermissions

• **signerPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Account`](../wiki/api.entities.types.SignerType#account)\>

whether the Account complies with all required Signer permissions

#### Defined in

[api/procedures/types.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L74)
