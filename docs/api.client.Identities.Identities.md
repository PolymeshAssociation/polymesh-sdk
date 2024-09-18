# Class: Identities

[api/client/Identities](../wiki/api.client.Identities).Identities

Handles all Identity related functionality

## Table of contents

### Methods

- [attestPrimaryKeyRotation](../wiki/api.client.Identities.Identities#attestprimarykeyrotation)
- [createChild](../wiki/api.client.Identities.Identities#createchild)
- [createPortfolio](../wiki/api.client.Identities.Identities#createportfolio)
- [createPortfolios](../wiki/api.client.Identities.Identities#createportfolios)
- [getChildIdentity](../wiki/api.client.Identities.Identities#getchildidentity)
- [getIdentity](../wiki/api.client.Identities.Identities#getidentity)
- [isIdentityValid](../wiki/api.client.Identities.Identities#isidentityvalid)
- [registerIdentity](../wiki/api.client.Identities.Identities#registeridentity)
- [rotatePrimaryKey](../wiki/api.client.Identities.Identities#rotateprimarykey)

## Methods

### attestPrimaryKeyRotation

▸ **attestPrimaryKeyRotation**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Get CDD Provider's attestation to change primary key

**`Note`**

 the transaction signer must be a CDD provider

**`Note`**

 this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which have to be accepted by the `targetAccount` along with the authorization for `RotatingPrimaryKey`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 required role:
  - Customer Due Diligence Provider

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [attestPrimaryKeyRotation.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AttestPrimaryKeyRotationParams`](../wiki/api.procedures.types.AttestPrimaryKeyRotationParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

___

### createChild

▸ **createChild**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>\>

Creates a child identity and makes the `secondaryKey` as the primary key of the child identity

**`Note`**

 the given `secondaryKey` is removed as secondary key from the signing Identity

**`Throws`**

 if
 - the transaction signer is not the primary account of which the `secondaryKey` is a secondary key
 - the `secondaryKey` can't be unlinked (can happen when it's part of a multisig with some balance)
 - the signing account is not a primary key
 - the signing Identity is already a child of some other identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createChild.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateChildIdentityParams`](../wiki/api.procedures.types.CreateChildIdentityParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>\>

___

### createPortfolio

▸ **createPortfolio**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

Create a new Portfolio under the ownership of the signing Identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createPortfolio.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.name` | `string` |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

___

### createPortfolios

▸ **createPortfolios**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[]\>\>

Creates a set of new Portfolios under the ownership of the signing Identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createPortfolios.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.names` | `string`[] |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[]\>\>

___

### getChildIdentity

▸ **getChildIdentity**(`args`): `Promise`<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>

Create a ChildIdentity instance from a DID

**`Throws`**

 if there is no ChildIdentity with the passed DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>

___

### getIdentity

▸ **getIdentity**(`args`): `Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Create an Identity instance from a DID

**`Throws`**

 if there is no Identity with the passed DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### isIdentityValid

▸ **isIdentityValid**(`args`): `Promise`<`boolean`\>

Return whether the supplied Identity/DID exists

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) |

#### Returns

`Promise`<`boolean`\>

___

### registerIdentity

▸ **registerIdentity**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

Register an Identity, possibly with a CDD claim

**`Note`**

 the transaction signer must be a CDD provider

**`Note`**

 this may create [Authorization Requests](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which have to be accepted by the `targetAccount`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 required role:
  - Customer Due Diligence Provider

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [registerIdentity.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterIdentityParams`](../wiki/api.procedures.types.RegisterIdentityParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

___

### rotatePrimaryKey

▸ **rotatePrimaryKey**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Creates an Authorization to rotate primary key of the signing Identity by the `targetAccount`

**`Note`**

 this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [rotatePrimaryKey.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RotatePrimaryKeyParams`](../wiki/api.procedures.types.RotatePrimaryKeyParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>
