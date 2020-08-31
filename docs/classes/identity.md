# Class: Identity

Represents an identity in the Polymesh blockchain

## Hierarchy

* [Entity](entity.md)‹UniqueIdentifiers›

  ↳ **Identity**

## Index

### Constructors

* [constructor](identity.md#constructor)

### Properties

* [authorizations](identity.md#authorizations)
* [context](identity.md#protected-context)
* [did](identity.md#did)
* [uuid](identity.md#uuid)

### Methods

* [getCddClaims](identity.md#getcddclaims)
* [getClaimScopes](identity.md#getclaimscopes)
* [getClaims](identity.md#getclaims)
* [getHeldTokens](identity.md#getheldtokens)
* [getMasterKey](identity.md#getmasterkey)
* [getTokenBalance](identity.md#gettokenbalance)
* [getTrustingTokens](identity.md#gettrustingtokens)
* [hasRole](identity.md#hasrole)
* [hasRoles](identity.md#hasroles)
* [hasValidCdd](identity.md#hasvalidcdd)
* [isCddProvider](identity.md#iscddprovider)
* [isGcMember](identity.md#isgcmember)
* [generateUuid](identity.md#static-generateuuid)
* [unserialize](identity.md#static-unserialize)

## Constructors

###  constructor

\+ **new Identity**(`identifiers`: UniqueIdentifiers, `context`: Context): *[Identity](identity.md)*

*Overrides void*

*Defined in [src/api/entities/Identity/index.ts:73](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L73)*

Create an Identity entity

**Parameters:**

Name | Type |
------ | ------ |
`identifiers` | UniqueIdentifiers |
`context` | Context |

**Returns:** *[Identity](identity.md)*

## Properties

###  authorizations

• **authorizations**: *[Authorizations](authorizations.md)*

*Defined in [src/api/entities/Identity/index.ts:73](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L73)*

___

### `Protected` context

• **context**: *Context*

*Inherited from [Entity](entity.md).[context](entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/Identity/index.ts:70](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L70)*

identity ID as stored in the blockchain

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](entity.md).[uuid](entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/Entity.ts#L47)*

## Methods

###  getCddClaims

▸ **getCddClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

*Defined in [src/api/entities/Identity/index.ts:268](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L268)*

Retrieve the list of cdd claims for the current identity

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[ClaimData](../interfaces/claimdata.md)››*

___

###  getClaimScopes

▸ **getClaimScopes**(): *Promise‹[ClaimScope](../interfaces/claimscope.md)[]›*

*Defined in [src/api/entities/Identity/index.ts:295](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L295)*

Retrieve all scopes in which claims have been made for this identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

**`note`** a null scope means the identity has scopeless claims (like CDD for example)

**Returns:** *Promise‹[ClaimScope](../interfaces/claimscope.md)[]›*

___

###  getClaims

▸ **getClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

*Defined in [src/api/entities/Identity/index.ts:396](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L396)*

Retrieve all claims issued about this identity, grouped by claim issuer

**`note`** supports pagination

**Parameters:**

▪`Default value`  **opts**: *object*= { includeExpired: true }

Name | Type | Description |
------ | ------ | ------ |
`includeExpired?` | undefined &#124; false &#124; true | whether to include expired claims. Defaults to true  |
`scope?` | undefined &#124; string | - |
`size?` | undefined &#124; number | - |
`start?` | undefined &#124; number | - |
`trustedClaimIssuers?` | (string &#124; [Identity](identity.md)‹›)[] | - |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityWithClaims](../interfaces/identitywithclaims.md)››*

___

###  getHeldTokens

▸ **getHeldTokens**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/Identity/index.ts:324](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L324)*

Retrieve a list of all tokens which were held at one point by this identity

**`note`** supports pagination

**Parameters:**

▪`Default value`  **opts**: *object*= { order: Order.Asc }

Name | Type |
------ | ------ |
`order?` | Order |
`size?` | undefined &#124; number |
`start?` | undefined &#124; number |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[SecurityToken](securitytoken.md)››*

___

###  getMasterKey

▸ **getMasterKey**(): *Promise‹string›*

*Defined in [src/api/entities/Identity/index.ts:232](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L232)*

Retrieve the master key associated with the identity

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **getMasterKey**(`callback`: [SubCallback](../globals.md#subcallback)‹string›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:233](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L233)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  getTokenBalance

▸ **getTokenBalance**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/api/entities/Identity/index.ts:131](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L131)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹BigNumber›*

▸ **getTokenBalance**(`args`: object, `callback`: [SubCallback](../globals.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:132](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L132)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../globals.md#subcallback)‹BigNumber›*

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  getTrustingTokens

▸ **getTrustingTokens**(`args`: object): *Promise‹[SecurityToken](securitytoken.md)[]›*

*Defined in [src/api/entities/Identity/index.ts:373](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L373)*

Get the list of tokens for which this identity is a trusted claim issuer

**Parameters:**

▪`Default value`  **args**: *object*= { order: Order.Asc }

Name | Type |
------ | ------ |
`order` | Order |

**Returns:** *Promise‹[SecurityToken](securitytoken.md)[]›*

___

###  hasRole

▸ **hasRole**(`role`: [Role](../globals.md#role)): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:90](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L90)*

Check whether this Identity possesses the specified Role

**Parameters:**

Name | Type |
------ | ------ |
`role` | [Role](../globals.md#role) |

**Returns:** *Promise‹boolean›*

___

###  hasRoles

▸ **hasRoles**(`roles`: [Role](../globals.md#role)[]): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:364](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L364)*

Check whether this Identity possesses all specified roles

**Parameters:**

Name | Type |
------ | ------ |
`roles` | [Role](../globals.md#role)[] |

**Returns:** *Promise‹boolean›*

___

###  hasValidCdd

▸ **hasValidCdd**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:179](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L179)*

Check whether this Identity has a valid CDD claim

**Returns:** *Promise‹boolean›*

___

###  isCddProvider

▸ **isCddProvider**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:213](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L213)*

Check whether this Identity is a cdd provider

**Returns:** *Promise‹boolean›*

___

###  isGcMember

▸ **isGcMember**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:196](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/api/entities/Identity/index.ts#L196)*

Check whether this Identity is Governance Committee member

**Returns:** *Promise‹boolean›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](entity.md).[generateUuid](entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/Entity.ts#L15)*

Generate the Entity's UUID from its identifying properties

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`identifiers` | Identifiers |   |

**Returns:** *string*

___

### `Static` unserialize

▸ **unserialize**‹**Identifiers**›(`serialized`: string): *Identifiers*

*Inherited from [Entity](entity.md).[unserialize](entity.md#static-unserialize)*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/a07dd9c/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
