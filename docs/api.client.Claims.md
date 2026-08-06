[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/Claims

# api/client/Claims

## Classes

### Claims

Defined in: [api/client/Claims.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L61)

Handles all Claims related functionality

#### Methods

##### addClaims()

> **addClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Claims.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L133)

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
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### editClaims()

> **editClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/Claims.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L141)

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
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [editClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getAllCustomClaimTypes()

> **getAllCustomClaimTypes**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`CustomClaimTypeWithDid`](../wiki/api.client.types#customclaimtypewithdid)\>\>

Defined in: [api/client/Claims.ts:637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L637)

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

##### ~~getCddClaims()~~

> **getCddClaims**(`opts?`): `Promise`\<[`ClaimData`](../wiki/api.entities.types#claimdata)\<[`CddClaim`](../wiki/api.entities.types#cddclaim)\>[]\>

Defined in: [api/client/Claims.ts:397](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L397)

Retrieve the list of CDD claims for a target Identity

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `includeExpired?`: `boolean`; `target?`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity for which to fetch CDD claims (optional, defaults to the signing Identity) |

###### Returns

`Promise`\<[`ClaimData`](../wiki/api.entities.types#claimdata)\<[`CddClaim`](../wiki/api.entities.types#cddclaim)\>[]\>

###### Deprecated

CDD claims are no longer supported with v8 chains

##### getClaimScopes()

> **getClaimScopes**(`opts?`): `Promise`\<[`ClaimScope`](../wiki/api.entities.types#claimscope)[]\>

Defined in: [api/client/Claims.ts:281](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L281)

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

Defined in: [api/client/Claims.ts:612](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L612)

Retrieves a custom claim type based on its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `BigNumber` | The ID of the custom claim type to retrieve |

###### Returns

`Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

##### getCustomClaimTypeByName()

> **getCustomClaimTypeByName**(`name`): `Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

Defined in: [api/client/Claims.ts:589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L589)

Retrieves a custom claim type based on its name

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The name of the custom claim type to retrieve |

###### Returns

`Promise`\<[`CustomClaimType`](../wiki/api.client.types#customclaimtype) \| `null`\>

##### getIdentitiesWithClaims()

> **getIdentitiesWithClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityWithClaims`](../wiki/api.entities.types#identitywithclaims)\>\>

Defined in: [api/client/Claims.ts:195](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L195)

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

Defined in: [api/client/Claims.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L160)

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

Defined in: [api/client/Claims.ts:497](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L497)

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

Defined in: [api/client/Claims.ts:582](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L582)

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

Defined in: [api/client/Claims.ts:149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/client/Claims.ts#L149)

Revoke claims from Identities

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), `"claims"`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [revokeClaims.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
