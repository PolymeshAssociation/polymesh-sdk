# Class: Identities

[api/client/Identities](../wiki/api.client.Identities).Identities

Handles all Identity related functionality

## Table of contents

### Methods

- [allowIdentityToCreatePortfolios](../wiki/api.client.Identities.Identities#allowidentitytocreateportfolios)
- [attestPrimaryKeyRotation](../wiki/api.client.Identities.Identities#attestprimarykeyrotation)
- [createChild](../wiki/api.client.Identities.Identities#createchild)
- [createChildren](../wiki/api.client.Identities.Identities#createchildren)
- [createPortfolio](../wiki/api.client.Identities.Identities#createportfolio)
- [createPortfolios](../wiki/api.client.Identities.Identities#createportfolios)
- [getAllowedCustodians](../wiki/api.client.Identities.Identities#getallowedcustodians)
- [getChildIdentity](../wiki/api.client.Identities.Identities#getchildidentity)
- [getIdentity](../wiki/api.client.Identities.Identities#getidentity)
- [isIdentityValid](../wiki/api.client.Identities.Identities#isidentityvalid)
- [registerIdentity](../wiki/api.client.Identities.Identities#registeridentity)
- [revokeIdentityToCreatePortfolios](../wiki/api.client.Identities.Identities#revokeidentitytocreateportfolios)
- [rotatePrimaryKey](../wiki/api.client.Identities.Identities#rotateprimarykey)
- [rotatePrimaryKeyToSecondary](../wiki/api.client.Identities.Identities#rotateprimarykeytosecondary)

## Methods

### allowIdentityToCreatePortfolios

▸ **allowIdentityToCreatePortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Gives permission to the Identity to create Portfolios on behalf of the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AllowIdentityToCreatePortfoliosParams`](../wiki/api.procedures.types#allowidentitytocreateportfoliosparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if
 - the provided Identity already has permissions to create portfolios for signing Identity
 - the provided Identity does not exist

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [allowIdentityToCreatePortfolios.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L274)

___

### attestPrimaryKeyRotation

▸ **attestPrimaryKeyRotation**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Get CDD Provider's attestation to change primary key

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AttestPrimaryKeyRotationParams`](../wiki/api.procedures.types.AttestPrimaryKeyRotationParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

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

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [attestPrimaryKeyRotation.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L145)

___

### createChild

▸ **createChild**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>\>

Creates a child identity and makes the `secondaryKey` as the primary key of the child identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateChildIdentityParams`](../wiki/api.procedures.types.CreateChildIdentityParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>\>

**`Note`**

the given `secondaryKey` is removed as secondary key from the signing Identity

**`Throws`**

if
 - the transaction signer is not the primary account of which the `secondaryKey` is a secondary key
 - the `secondaryKey` can't be unlinked (can happen when it's part of a multisig with some balance)
 - the signing account is not a primary key
 - the signing Identity is already a child of some other identity

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createChild.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:242](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L242)

___

### createChildren

▸ **createChildren**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[], [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[]\>\>

Create child identities using off chain authorization

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateChildIdentitiesParams`](../wiki/api.procedures.types.CreateChildIdentitiesParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[], [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[]\>\>

**`Note`**

the list of `key` provided in the params should not be linked to any other account

**`Throws`**

if
 - the signing account is not a primary key
 - the signing Identity is already a child of some other identity
 - `expiresAt` is not a future date
 - the any `key` in `childKeyAuths` is already linked to an Identity

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createChildren.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L260)

___

### createPortfolio

▸ **createPortfolio**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

Create a new Portfolio under the ownership of the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.name` | `string` |
| `args.ownerDid?` | `string` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

**`Note`**

the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createPortfolio.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L188)

___

### createPortfolios

▸ **createPortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[]\>\>

Creates a set of new Portfolios under the ownership of the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.names` | `string`[] |
| `args.ownerDid?` | `string` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)[]\>\>

**`Note`**

the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createPortfolios.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L199)

___

### getAllowedCustodians

▸ **getAllowedCustodians**(`did`): `Promise`\<`string`[]\>

Returns a list of allowed custodian did(s) for Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) |

#### Returns

`Promise`\<`string`[]\>

**`Throws`**

if
- the provided Identity does not exist

#### Defined in

[api/client/Identities.ts:297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L297)

___

### getChildIdentity

▸ **getChildIdentity**(`args`): `Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>

Create a ChildIdentity instance from a DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)\>

**`Throws`**

if there is no ChildIdentity with the passed DID

#### Defined in

[api/client/Identities.ts:217](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L217)

___

### getIdentity

▸ **getIdentity**(`args`): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Create an Identity instance from a DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.did` | `string` |

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

**`Throws`**

if there is no Identity with the passed DID

#### Defined in

[api/client/Identities.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L208)

___

### isIdentityValid

▸ **isIdentityValid**(`args`): `Promise`\<`boolean`\>

Return whether the supplied Identity/DID exists

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[api/client/Identities.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L224)

___

### registerIdentity

▸ **registerIdentity**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

Register an Identity, possibly with a CDD claim

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterIdentityParams`](../wiki/api.procedures.types.RegisterIdentityParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

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

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [registerIdentity.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L127)

___

### revokeIdentityToCreatePortfolios

▸ **revokeIdentityToCreatePortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Revokes permission from the Identity to create Portfolios on behalf of the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RevokeIdentityToCreatePortfoliosParams`](../wiki/api.procedures.types#revokeidentitytocreateportfoliosparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if
 - the provided Identity already does not have permissions to create portfolios for signing Identity
 - the provided Identity does not exist

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [revokeIdentityToCreatePortfolios.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L288)

___

### rotatePrimaryKey

▸ **rotatePrimaryKey**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Creates an Authorization to rotate primary key of the signing Identity by the `targetAccount`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RotatePrimaryKeyParams`](../wiki/api.procedures.types.RotatePrimaryKeyParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [rotatePrimaryKey.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L159)

___

### rotatePrimaryKeyToSecondary

▸ **rotatePrimaryKeyToSecondary**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Creates an Authorization to rotate primary key of the signing Identity to an existing secondary key identified by the `targetAccount`

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RotatePrimaryKeyToSecondaryParams`](../wiki/api.procedures.types#rotateprimarykeytosecondaryparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

the given `targetAccount` must be an existing secondaryKey or unlinked to any other Identity

**`Note`**

this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Throws`**

if the given `targetAccount` is linked with another Identity

**`Throws`**

if the given `targetAccount` is already the primary key of the signing Identity

**`Throws`**

if the given `targetAccount` already has a pending invitation to become the primary key of the signing Identity

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [rotatePrimaryKeyToSecondary.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Identities.ts:177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Identities.ts#L177)
