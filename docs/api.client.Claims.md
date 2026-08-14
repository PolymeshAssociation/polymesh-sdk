[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Claims

# api/client/Claims

## Classes

### Claims

Defined in: [api/client/Claims.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L54)

Handles all Claims related functionality

#### Methods

##### addClaims()

> **addClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Claims.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L126)

Add claims to Identities

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), `"claims"`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required roles:
  - DID Registrar: if there is at least one CDD claim in the arguments

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### editClaims()

> **editClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Claims.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L134)

Edit claims associated to Identities (only the expiry date can be modified)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), `"claims"`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required roles:
  - DID Registrar: if there is at least one CDD claim in the arguments

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [editClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getAllCustomClaimTypes()

> **getAllCustomClaimTypes**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`CustomClaimTypeWithDid`](../wiki/api.client.types#customclaimtypewithdid)\>\>

Defined in: [api/client/Claims.ts:564](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L564)

Retrieve registered CustomClaimTypes

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `dids?`: `string`[]; `size?`: `BigNumber`; `start?`: `BigNumber`; \} | - |
| `opts.dids?` | `string`[] | Fetch CustomClaimTypes issued by the given `dids` |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`CustomClaimTypeWithDid`](../wiki/api.client.types#customclaimtypewithdid)\>\>

###### Note

supports pagination

###### Note

uses the middlewareV2 (Required)

##### getClaimScopes()

> **getClaimScopes**(`opts?`): `Promise`\<[`ClaimScope`](../wiki/api.entities.types#claimscope)[]\>

Defined in: [api/client/Claims.ts:273](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L273)

Retrieve all scopes in which claims have been made for the target Identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `target?`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity for which to fetch claim scopes (optional, defaults to the signing Identity) |

###### Returns

`Promise`\<[`ClaimScope`](../wiki/api.entities.types#claimscope)[]\>

###### Note

in order for scopes to include scopes for custom claims, middlewareV2 is required

##### getCustomClaimTypeById()

> **getCustomClaimTypeById**(`id`): `Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

Defined in: [api/client/Claims.ts:539](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L539)

Retrieves a custom claim type based on its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `BigNumber` | The ID of the custom claim type to retrieve |

###### Returns

`Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

##### getCustomClaimTypeByName()

> **getCustomClaimTypeByName**(`name`): `Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

Defined in: [api/client/Claims.ts:516](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L516)

Retrieves a custom claim type based on its name

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the custom claim type to retrieve |

###### Returns

`Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

##### getIdentitiesWithClaims()

> **getIdentitiesWithClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityWithClaims`](../wiki/api.entities.types#identitywithclaims)\>\>

Defined in: [api/client/Claims.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L187)

Retrieve a list of Identities with claims associated to them. Can be filtered using parameters

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `claimTypes?`: [`TrustedFor`](../wiki/api.entities.types#trustedfor-1)[]; `includeExpired?`: `boolean`; `scope?`: [`Scope`](../wiki/api.entities.types#scope-9); `size?`: `BigNumber`; `start?`: `BigNumber`; `targets?`: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]; `trustedClaimIssuers?`: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]; \} | - |
| `opts.claimTypes?` | [`TrustedFor`](../wiki/api.entities.types#trustedfor-1)[] | types of the claims to fetch. Defaults to any type |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/api.entities.types#scope-9) | scope of the claims to fetch. Defaults to any scope |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.targets?` | (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[] | Identities (or Identity IDs) for which to fetch targeting claims. Defaults to all targets |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[] | Identity IDs of claim issuers. Defaults to all claim issuers |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityWithClaims`](../wiki/api.entities.types#identitywithclaims)\>\>

###### Note

supports pagination

###### Note

uses the middleware V2

##### getIssuedClaims()

> **getIssuedClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`ClaimData`](../wiki/api.entities.types#claimdata)\<[`Claim`](../wiki/api.entities.types#claim-5)\>\>\>

Defined in: [api/client/Claims.ts:152](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L152)

Retrieve all claims issued by an Identity

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `includeExpired?`: `boolean`; `size?`: `BigNumber`; `start?`: `BigNumber`; `target?`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity (optional, defaults to the signing Identity) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`ClaimData`](../wiki/api.entities.types#claimdata)\<[`Claim`](../wiki/api.entities.types#claim-5)\>\>\>

###### Note

supports pagination

###### Note

uses the middlewareV2

##### getTargetingClaims()

> **getTargetingClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityWithClaims`](../wiki/api.entities.types#identitywithclaims)\>\>

Defined in: [api/client/Claims.ts:424](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L424)

Retrieve all claims issued about an Identity, grouped by claim issuer

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `includeExpired?`: `boolean`; `scope?`: [`Scope`](../wiki/api.entities.types#scope-9); `size?`: `BigNumber`; `start?`: `BigNumber`; `target?`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); `trustedClaimIssuers?`: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]; \} | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/api.entities.types#scope-9) | - |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity for which to fetch targeting claims (optional, defaults to the signing Identity) |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[] | - |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityWithClaims`](../wiki/api.entities.types#identitywithclaims)\>\>

###### Note

supports pagination

###### Note

uses the middlewareV2 (optional)

##### registerCustomClaimType()

> **registerCustomClaimType**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

Defined in: [api/client/Claims.ts:509](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L509)

Creates a custom claim type using the `name` and returns the `id` of the created claim type

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RegisterCustomClaimTypeParams`](../wiki/api.procedures.types#registercustomclaimtypeparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

###### Throws

if
 - the `name` is longer than allowed
 - a custom claim type with the same `name` already exists

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [registerCustomClaimType.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### revokeClaims()

> **revokeClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Claims.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/Claims.ts#L141)

Revoke claims from Identities

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), `"claims"`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

a claim can only be revoked by the Identity that issued it

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [revokeClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
