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

▸ **addClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Add claims to Identities

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addClaims.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Claims.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L129)

___

### editClaims

▸ **editClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Edit claims associated to Identities (only the expiry date can be modified)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [editClaims.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Claims.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L142)

___

### getAllCustomClaimTypes

▸ **getAllCustomClaimTypes**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`CustomClaimTypeWithDid`](../wiki/api.client.types#customclaimtypewithdid)\>\>

Retrieve registered CustomClaimTypes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.dids?` | `string`[] | Fetch CustomClaimTypes issued by the given `dids` |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`CustomClaimTypeWithDid`](../wiki/api.client.types#customclaimtypewithdid)\>\>

**`Note`**

supports pagination

**`Note`**

uses the middlewareV2 (Required)

#### Defined in

[api/client/Claims.ts:574](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L574)

___

### getCddClaims

▸ **getCddClaims**(`opts?`): `Promise`\<[`ClaimData`](../wiki/api.entities.types.ClaimData)\<[`CddClaim`](../wiki/api.entities.types.CddClaim)\>[]\>

Retrieve the list of CDD claims for a target Identity

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch CDD claims (optional, defaults to the signing Identity) |

#### Returns

`Promise`\<[`ClaimData`](../wiki/api.entities.types.ClaimData)\<[`CddClaim`](../wiki/api.entities.types.CddClaim)\>[]\>

#### Defined in

[api/client/Claims.ts:337](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L337)

___

### getClaimScopes

▸ **getClaimScopes**(`opts?`): `Promise`\<[`ClaimScope`](../wiki/api.entities.types.ClaimScope)[]\>

Retrieve all scopes in which claims have been made for the target Identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch claim scopes (optional, defaults to the signing Identity) |

#### Returns

`Promise`\<[`ClaimScope`](../wiki/api.entities.types.ClaimScope)[]\>

#### Defined in

[api/client/Claims.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L288)

___

### getCustomClaimTypeById

▸ **getCustomClaimTypeById**(`id`): `Promise`\<``null`` \| [`CustomClaimType`](../wiki/api.client.types#customclaimtype)\>

Retrieves a custom claim type based on its ID

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `BigNumber` | The ID of the custom claim type to retrieve |

#### Returns

`Promise`\<``null`` \| [`CustomClaimType`](../wiki/api.client.types#customclaimtype)\>

#### Defined in

[api/client/Claims.ts:549](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L549)

___

### getCustomClaimTypeByName

▸ **getCustomClaimTypeByName**(`name`): `Promise`\<``null`` \| [`CustomClaimType`](../wiki/api.client.types#customclaimtype)\>

Retrieves a custom claim type based on its name

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the custom claim type to retrieve |

#### Returns

`Promise`\<``null`` \| [`CustomClaimType`](../wiki/api.client.types#customclaimtype)\>

#### Defined in

[api/client/Claims.ts:526](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L526)

___

### getIdentitiesWithClaims

▸ **getIdentitiesWithClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityWithClaims`](../wiki/api.entities.types.IdentityWithClaims)\>\>

Retrieve a list of Identities with claims associated to them. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.claimTypes?` | [`ClaimType`](../wiki/api.entities.types.ClaimType)[] | types of the claims to fetch. Defaults to any type |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/api.entities.types.Scope) | scope of the claims to fetch. Defaults to any scope |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.targets?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | Identities (or Identity IDs) for which to fetch targeting claims. Defaults to all targets |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | Identity IDs of claim issuers. Defaults to all claim issuers |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityWithClaims`](../wiki/api.entities.types.IdentityWithClaims)\>\>

**`Note`**

supports pagination

**`Note`**

uses the middleware V2

#### Defined in

[api/client/Claims.ts:203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L203)

___

### getIssuedClaims

▸ **getIssuedClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`ClaimData`](../wiki/api.entities.types.ClaimData)\<[`Claim`](../wiki/api.entities.types#claim)\>\>\>

Retrieve all claims issued by an Identity

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity (optional, defaults to the signing Identity) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`ClaimData`](../wiki/api.entities.types.ClaimData)\<[`Claim`](../wiki/api.entities.types#claim)\>\>\>

**`Note`**

supports pagination

**`Note`**

uses the middlewareV2

#### Defined in

[api/client/Claims.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L168)

___

### getTargetingClaims

▸ **getTargetingClaims**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityWithClaims`](../wiki/api.entities.types.IdentityWithClaims)\>\>

Retrieve all claims issued about an Identity, grouped by claim issuer

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired claims. Defaults to true |
| `opts.scope?` | [`Scope`](../wiki/api.entities.types.Scope) | - |
| `opts.size?` | `BigNumber` | - |
| `opts.start?` | `BigNumber` | - |
| `opts.target?` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | Identity for which to fetch targeting claims (optional, defaults to the signing Identity) |
| `opts.trustedClaimIssuers?` | (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[] | - |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityWithClaims`](../wiki/api.entities.types.IdentityWithClaims)\>\>

**`Note`**

supports pagination

**`Note`**

uses the middlewareV2 (optional)

#### Defined in

[api/client/Claims.ts:429](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L429)

___

### registerCustomClaimType

▸ **registerCustomClaimType**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

Creates a custom claim type using the `name` and returns the `id` of the created claim type

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RegisterCustomClaimTypeParams`](../wiki/api.procedures.types.RegisterCustomClaimTypeParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`BigNumber`, `BigNumber`\>\>

**`Throws`**

if
 - the `name` is longer than allowed
 - a custom claim type with the same `name` already exists

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [registerCustomClaimType.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Claims.ts:517](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L517)

___

### revokeClaims

▸ **revokeClaims**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Revoke claims from Identities

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`\<[`ModifyClaimsParams`](../wiki/api.procedures.types#modifyclaimsparams), ``"claims"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required roles:
  - Customer Due Diligence Provider: if there is at least one CDD claim in the arguments

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [revokeClaims.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Claims.ts:155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/Claims.ts#L155)
