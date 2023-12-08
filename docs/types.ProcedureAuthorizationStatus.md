# Interface: ProcedureAuthorizationStatus

[types](../wiki/types).ProcedureAuthorizationStatus

## Table of contents

### Properties

- [accountFrozen](../wiki/types.ProcedureAuthorizationStatus#accountfrozen)
- [agentPermissions](../wiki/types.ProcedureAuthorizationStatus#agentpermissions)
- [noIdentity](../wiki/types.ProcedureAuthorizationStatus#noidentity)
- [roles](../wiki/types.ProcedureAuthorizationStatus#roles)
- [signerPermissions](../wiki/types.ProcedureAuthorizationStatus#signerpermissions)

## Properties

### accountFrozen

• **accountFrozen**: `boolean`

whether the Account is frozen (i.e. can't perform any transactions)

#### Defined in

[types/index.ts:1289](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1289)

___

### agentPermissions

• **agentPermissions**: [`CheckPermissionsResult`](../wiki/types.CheckPermissionsResult)<[`Identity`](../wiki/types.SignerType#identity)\>

whether the Identity complies with all required Agent permissions

#### Defined in

[types/index.ts:1277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1277)

___

### noIdentity

• **noIdentity**: `boolean`

true only if the Procedure requires an Identity but the signing Account
  doesn't have one associated

#### Defined in

[types/index.ts:1294](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1294)

___

### roles

• **roles**: [`CheckRolesResult`](../wiki/types.CheckRolesResult)

whether the Identity complies with all required Roles

#### Defined in

[types/index.ts:1285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1285)

___

### signerPermissions

• **signerPermissions**: [`CheckPermissionsResult`](../wiki/types.CheckPermissionsResult)<[`Account`](../wiki/types.SignerType#account)\>

whether the Account complies with all required Signer permissions

#### Defined in

[types/index.ts:1281](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1281)
