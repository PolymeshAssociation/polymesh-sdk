# Class: Claims

[api/client/Claims](../wiki/api.client.Claims).Claims

Handles all Claims related functionality

## Table of contents

### Methods

- [addClaims](../wiki/api.client.Claims.Claims#addclaims)
- [editClaims](../wiki/api.client.Claims.Claims#editclaims)
- [getAllCustomClaimTypes](../wiki/api.client.Claims.Claims#getallcustomclaimtypes)
- [getCddClaims](../wiki/api.client.Claims.Claims#getcddclaims)
- [getClaimScopes](../wiki/api.client.Claims.Claims#getclaimscopes)
- [getCustomClaimTypeById](../wiki/api.client.Claims.Claims#getcustomclaimtypebyid)
- [getCustomClaimTypeByName](../wiki/api.client.Claims.Claims#getcustomclaimtypebyname)
- [getIdentitiesWithClaims](../wiki/api.client.Claims.Claims#getidentitieswithclaims)
- [getIssuedClaims](../wiki/api.client.Claims.Claims#getissuedclaims)
- [getTargetingClaims](../wiki/api.client.Claims.Claims#gettargetingclaims)
- [registerCustomClaimType](../wiki/api.client.Claims.Claims#registercustomclaimtype)
- [revokeClaims](../wiki/api.client.Claims.Claims#revokeclaims)

## Methods

### addClaims

▸ **addClaims**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Add claims to Identities

**`Note`**

 required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [addClaims.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### editClaims

▸ **editClaims**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Edit claims associated to Identities (only the expiry date can be modified)

**`Note`**

 required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [editClaims.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### getAllCustomClaimTypes

▸ **getAllCustomClaimTypes**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`CustomClaimTypeWithDid`](../wiki/types#customclaimtypewithdid)\>\>

Retrieve registered CustomClaimTypes

**`Note`**

 supports pagination

**`Note`**

 uses the middlewareV2 (Required)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.dids?` | `string`[] | Fetch CustomClaimTypes issued by the given `dids` |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`CustomClaimTypeWithDid`](../wiki/types#customclaimtypewithdid)\>\>

___

### getCddClaims

▸ **getCddClaims**(`opts?`): `Promise`<[`ClaimData`](../wiki/types.ClaimData)<[`CddClaim`](../wiki/types.CddClaim)\>[]\>

Retrieve the list of CDD claims for a target Identity

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch CDD claims (optional, defaults to the signing Identity) |

#### Returns

`Promise`<[`ClaimData`](../wiki/types.ClaimData)<[`CddClaim`](../wiki/types.CddClaim)\>[]\>

___

### getClaimScopes

▸ **getClaimScopes**(`opts?`): `Promise`<[`ClaimScope`](../wiki/types.ClaimScope)[]\>

Retrieve all scopes in which claims have been made for the target Identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch claim scopes (optional, defaults to the signing Identity) |

#### Returns

`Promise`<[`ClaimScope`](../wiki/types.ClaimScope)[]\>

___

### getCustomClaimTypeById

▸ **getCustomClaimTypeById**(`id`): `Promise`<``null`` \| [`CustomClaimType`](../wiki/types#customclaimtype)\>

Retrieves a custom claim type based on its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `BigNumber` | The ID of the custom claim type to retrieve |

#### Returns

`Promise`<``null`` \| [`CustomClaimType`](../wiki/types#customclaimtype)\>

___

### getCustomClaimTypeByName

▸ **getCustomClaimTypeByName**(`name`): `Promise`<``null`` \| [`CustomClaimType`](../wiki/types#customclaimtype)\>

Retrieves a custom claim type based on its name

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the custom claim type to retrieve |

#### Returns

`Promise`<``null`` \| [`CustomClaimType`](../wiki/types#customclaimtype)\>

___

### getIdentitiesWithClaims

▸ **getIdentitiesWithClaims**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityWithClaims`](../wiki/types.IdentityWithClaims)\>\>

Retrieve a list of Identities with claims associated to them. Can be filtered using parameters

**`Note`**

 supports pagination

**`Note`**

 uses the middleware V2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.claimTypes?` | [`ClaimType`](../wiki/types.ClaimType)[] | types of the claims to fetch. Defaults to any type |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/types.Scope) | scope of the claims to fetch. Defaults to any scope |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.targets?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | Identities (or Identity IDs) for which to fetch targeting claims. Defaults to all targets |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | Identity IDs of claim issuers. Defaults to all claim issuers |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityWithClaims`](../wiki/types.IdentityWithClaims)\>\>

___

### getIssuedClaims

▸ **getIssuedClaims**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`ClaimData`](../wiki/types.ClaimData)<[`Claim`](../wiki/types#claim)\>\>\>

Retrieve all claims issued by an Identity

**`Note`**

 supports pagination

**`Note`**

 uses the middlewareV2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity (optional, defaults to the signing Identity) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`ClaimData`](../wiki/types.ClaimData)<[`Claim`](../wiki/types#claim)\>\>\>

___

### getTargetingClaims

▸ **getTargetingClaims**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityWithClaims`](../wiki/types.IdentityWithClaims)\>\>

Retrieve all claims issued about an Identity, grouped by claim issuer

**`Note`**

 supports pagination

**`Note`**

 uses the middlewareV2 (optional)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/types.Scope) | - |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch targeting claims (optional, defaults to the signing Identity) |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | - |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`IdentityWithClaims`](../wiki/types.IdentityWithClaims)\>\>

___

### registerCustomClaimType

▸ **registerCustomClaimType**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

Creates a custom claim type using the `name` and returns the `id` of the created claim type

**`Throws`**

 if
 - the `name` is longer than allowed
 - a custom claim type with the same `name` already exists

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [registerCustomClaimType.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterCustomClaimTypeParams`](../wiki/api.procedures.types.RegisterCustomClaimTypeParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

___

### revokeClaims

▸ **revokeClaims**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Revoke claims from Identities

**`Note`**

 required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [revokeClaims.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
