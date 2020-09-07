# Class: Claims

Handles all Claims related functionality

## Hierarchy

* **Claims**

## Index

### Methods

* [addClaims](claims.md#addclaims)
* [editClaims](claims.md#editclaims)
* [getCddClaims](claims.md#getcddclaims)
* [getClaimScopes](claims.md#getclaimscopes)
* [getIdentitiesWithClaims](claims.md#getidentitieswithclaims)
* [getIssuedClaims](claims.md#getissuedclaims)
* [getTargetingClaims](claims.md#gettargetingclaims)
* [revokeClaims](claims.md#revokeclaims)

## Methods

###  addClaims

▸ **addClaims**(`args`: Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/Claims.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L39)*

Add claims to identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

###  editClaims

▸ **editClaims**(`args`: Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/Claims.ts:48](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L48)*

Edit claims associated to identities (only the expiry date can be modified)

* @param args.claims - array of claims to be edited

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

###  getCddClaims

▸ **getCddClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

*Defined in [src/Claims.ts:224](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L224)*

Retrieve the list of CDD claims for a target Identity

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`target?` | string &#124; [Identity](identity.md) | identity for which to fetch CDD claims (optional, defaults to the current identity) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

___

###  getClaimScopes

▸ **getClaimScopes**(`opts`: object): *Promise‹[ClaimScope](../interfaces/claimscope.md)[]›*

*Defined in [src/Claims.ts:182](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L182)*

Retrieve all scopes in which claims have been made for the target identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

**`note`** a null scope means the identity has scopeless claims (like CDD for example)

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`target?` | string &#124; [Identity](identity.md) | identity for which to fetch claim scopes (optional, defaults to the current identity)  |

**Returns:** *Promise‹[ClaimScope](../interfaces/claimscope.md)[]›*

___

###  getIdentitiesWithClaims

▸ **getIdentitiesWithClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

*Defined in [src/Claims.ts:110](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L110)*

Retrieve a list of identities with claims associated to them. Can be filtered using parameters

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`claimTypes?` | [ClaimType](../enums/claimtype.md)[] | types of the claims to fetch. Defaults to any type |
`scope?` | undefined &#124; string | scope of the claims to fetch. Defaults to any scope |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`targets?` | (string &#124; [Identity](identity.md)‹›)[] | identities (or identity IDs) for which to fetch claims (targets). Defaults to all targets |
`trustedClaimIssuers?` | (string &#124; [Identity](identity.md)‹›)[] | identity IDs of claim issuers. Defaults to all claim issuers |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

___

###  getIssuedClaims

▸ **getIssuedClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

*Defined in [src/Claims.ts:70](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L70)*

Retrieve all claims issued by an Identity

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`size?` | undefined &#124; number | - |
`start?` | undefined &#124; number | - |
`target?` | string &#124; [Identity](identity.md) | identity (optional, defaults to the current identity)  |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

___

###  getTargetingClaims

▸ **getTargetingClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

*Defined in [src/Claims.ts:260](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L260)*

Retrieve all claims issued about an identity, grouped by claim issuer

**`note`** supports pagination

**Parameters:**

▪`Default value`  **opts**: *object*= { includeExpired: true }

Name | Type | Description |
------ | ------ | ------ |
`includeExpired?` | undefined &#124; false &#124; true | whether to include expired claims. Defaults to true  |
`scope?` | undefined &#124; string | - |
`size?` | undefined &#124; number | - |
`start?` | undefined &#124; number | - |
`target?` | string &#124; [Identity](identity.md) | identity for which to fetch CDD claims (optional, defaults to the current identity) |
`trustedClaimIssuers?` | (string &#124; [Identity](identity.md)‹›)[] | - |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

___

###  revokeClaims

▸ **revokeClaims**(`args`: Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"›): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/Claims.ts:57](https://github.com/PolymathNetwork/polymesh-sdk/blob/b42f319/src/Claims.ts#L57)*

Revoke claims from identities

**Parameters:**

Name | Type |
------ | ------ |
`args` | Omit‹[ModifyClaimsParams](../globals.md#modifyclaimsparams), "operation"› |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*
