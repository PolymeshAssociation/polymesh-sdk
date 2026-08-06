[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Identities

# api/client/Identities

## Classes

### Identities

Defined in: [api/client/Identities.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L39)

Handles all Identity related functionality

#### Methods

##### allowIdentityToCreatePortfolios()

> **allowIdentityToCreatePortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Identities.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L286)

Gives permission to the Identity to create Portfolios on behalf of the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AllowIdentityToCreatePortfoliosParams`](../wiki/api.procedures.types#allowidentitytocreateportfoliosparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if
 - the provided Identity already has permissions to create portfolios for signing Identity
 - the provided Identity does not exist

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [allowIdentityToCreatePortfolios.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### attestPrimaryKeyRotation()

> **attestPrimaryKeyRotation**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/client/Identities.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L172)

Get CDD Provider's attestation to change primary key

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AttestPrimaryKeyRotationParams`](../wiki/api.procedures.types#attestprimarykeyrotationparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

the transaction signer must be a CDD provider

###### Note

this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which have to be accepted by the `targetAccount` along with the authorization for `RotatingPrimaryKey`.
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

required role:
  - Customer Due Diligence Provider

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [attestPrimaryKeyRotation.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### ~~createChild()~~

> **createChild**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)\>\>

Defined in: [api/client/Identities.ts:262](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L262)

Creates a child identity and makes the `secondaryKey` as the primary key of the child identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateChildIdentityParams`](../wiki/api.procedures.types#createchildidentityparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity), [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)\>\>

###### Note

the given `secondaryKey` is removed as secondary key from the signing Identity

###### Throws

if
 - the transaction signer is not the primary account of which the `secondaryKey` is a secondary key
 - the `secondaryKey` can't be unlinked (can happen when it's part of a multisig with some balance)
 - the signing account is not a primary key
 - the signing Identity is already a child of some other identity

###### Deprecated

Child identities are no longer supported in chain v8

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createChild.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### ~~createChildren()~~

> **createChildren**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)[], [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)[]\>\>

Defined in: [api/client/Identities.ts:277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L277)

Create child identities using off chain authorization

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateChildIdentitiesParams`](../wiki/api.procedures.types#createchildidentitiesparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)[], [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)[]\>\>

###### Note

the list of `key` provided in the params should not be linked to any other account

###### Throws

if
 - the signing account is not a primary key
 - the signing Identity is already a child of some other identity
 - `expiresAt` is not a future date
 - the any `key` in `childKeyAuths` is already linked to an Identity

###### Deprecated

Child identities are no longer supported in chain v8

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createChildren.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createPortfolio()

> **createPortfolio**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>\>

Defined in: [api/client/Identities.ts:206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L206)

Create a new Portfolio under the ownership of the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `name`: `string`; `ownerDid?`: `string`; \} |
| `args.name` | `string` |
| `args.ownerDid?` | `string` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>\>

###### Note

the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createPortfolio.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createPortfolios()

> **createPortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[]\>\>

Defined in: [api/client/Identities.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L216)

Creates a set of new Portfolios under the ownership of the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `names`: `string`[]; `ownerDid?`: `string`; \} |
| `args.names` | `string`[] |
| `args.ownerDid?` | `string` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[], [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)[]\>\>

###### Note

the `ownerDid` is optional. If provided portfolios will be created as Custody Portfolios under the `ownerDid`

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createPortfolios.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getAllowedCustodians()

> **getAllowedCustodians**(`did`): `Promise`\<`string`[]\>

Defined in: [api/client/Identities.ts:308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L308)

Returns a list of allowed custodian did(s) for Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `did` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) |

###### Returns

`Promise`\<`string`[]\>

###### Throws

if
- the provided Identity does not exist

##### ~~getChildIdentity()~~

> **getChildIdentity**(`args`): `Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)\>

Defined in: [api/client/Identities.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L237)

Create a ChildIdentity instance from a DID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `did`: `string`; \} |
| `args.did` | `string` |

###### Returns

`Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)\>

###### Throws

if there is no ChildIdentity with the passed DID

###### Deprecated

Child identities are no longer supported in chain v8

##### getIdentity()

> **getIdentity**(`args`): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

Defined in: [api/client/Identities.ts:226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L226)

Create an Identity instance from a DID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `did`: `string`; \} |
| `args.did` | `string` |

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

###### Throws

if there is no Identity with the passed DID

##### isIdentityValid()

> **isIdentityValid**(`args`): `Promise`\<`boolean`\>

Defined in: [api/client/Identities.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L245)

Return whether the supplied Identity/DID exists

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) |

###### Returns

`Promise`\<`boolean`\>

##### registerDid()

> **registerDid**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

Defined in: [api/client/Identities.ts:159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L159)

Register a new DID for the `targetAccount`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RegisterDidParams`](../wiki/api.procedures.types#registerdidparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

###### Note

the transaction signer must be an active DID Registrar

###### Note

unlike [registerIdentity](../wiki/#registeridentity), this does not support secondary keys or CDD claims

###### Throws

if the `targetAccount` is already linked to an Identity

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [registerDid.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### registerIdentity()

> **registerIdentity**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

Defined in: [api/client/Identities.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L142)

Register an Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RegisterIdentityParams`](../wiki/api.procedures.types#registeridentityparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

###### Note

the transaction signer must be a DID Registrar

###### Note

this may create [Authorization Requests](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which have to be accepted by the `targetAccount`.
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

required role:
  - DID Registrar

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [registerIdentity.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### revokeIdentityToCreatePortfolios()

> **revokeIdentityToCreatePortfolios**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Identities.ts:298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L298)

Revokes permission from the Identity to create Portfolios on behalf of the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RevokeIdentityToCreatePortfoliosParams`](../wiki/api.procedures.types#revokeidentitytocreateportfoliosparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if
 - the provided Identity already does not have permissions to create portfolios for signing Identity
 - the provided Identity does not exist

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [revokeIdentityToCreatePortfolios.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### rotatePrimaryKey()

> **rotatePrimaryKey**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/client/Identities.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L184)

Creates an Authorization to rotate primary key of the signing Identity by the `targetAccount`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RotatePrimaryKeyParams`](../wiki/api.procedures.types#rotateprimarykeyparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [rotatePrimaryKey.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### rotatePrimaryKeyToSecondary()

> **rotatePrimaryKeyToSecondary**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/client/Identities.ts:197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L197)

Creates an Authorization to rotate primary key of the signing Identity to an existing secondary key identified by the `targetAccount`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RotatePrimaryKeyToSecondaryParams`](../wiki/api.procedures.types#rotateprimarykeytosecondaryparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

the given `targetAccount` must be an existing secondaryKey or unlinked to any other Identity

###### Note

this creates an [Authorization Requests](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which have to be accepted by the `targetAccount` along with the optional CDD authorization generated by CDD provider attesting the rotation of primary key
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Throws

if the given `targetAccount` is linked with another Identity

###### Throws

if the given `targetAccount` is already the primary key of the signing Identity

###### Throws

if the given `targetAccount` already has a pending invitation to become the primary key of the signing Identity

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [rotatePrimaryKeyToSecondary.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### selfRegisterDid()

> **selfRegisterDid**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

Defined in: [api/client/Identities.ts:149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Identities.ts#L149)

Register a new DID for the signing Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

###### Throws

if the signing Account is already linked to an Identity

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [selfRegisterDid.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it
