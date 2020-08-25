# Class: Identity

Represents an identity in the Polymesh blockchain

## Hierarchy

* [Entity](base.entity.md)‹[UniqueIdentifiers](../interfaces/api_entities_identity.uniqueidentifiers.md)›

  ↳ **Identity**

## Index

### Constructors

* [constructor](api_entities_identity.identity.md#constructor)

### Properties

* [authorizations](api_entities_identity.identity.md#authorizations)
* [context](api_entities_identity.identity.md#protected-context)
* [did](api_entities_identity.identity.md#did)
* [uuid](api_entities_identity.identity.md#uuid)

### Methods

* [getCddClaims](api_entities_identity.identity.md#getcddclaims)
* [getClaimScopes](api_entities_identity.identity.md#getclaimscopes)
* [getClaims](api_entities_identity.identity.md#getclaims)
* [getHeldTokens](api_entities_identity.identity.md#getheldtokens)
* [getMasterKey](api_entities_identity.identity.md#getmasterkey)
* [getTokenBalance](api_entities_identity.identity.md#gettokenbalance)
* [getTrustingTokens](api_entities_identity.identity.md#gettrustingtokens)
* [hasRole](api_entities_identity.identity.md#hasrole)
* [hasRoles](api_entities_identity.identity.md#hasroles)
* [hasValidCdd](api_entities_identity.identity.md#hasvalidcdd)
* [isGcMember](api_entities_identity.identity.md#isgcmember)
* [generateUuid](api_entities_identity.identity.md#static-generateuuid)
* [unserialize](api_entities_identity.identity.md#static-unserialize)

## Constructors

###  constructor

\+ **new Identity**(`identifiers`: [UniqueIdentifiers](../interfaces/api_entities_identity.uniqueidentifiers.md), `context`: [Context](context.context-1.md)): *[Identity](api_entities_identity.identity.md)*

*Overrides void*

*Defined in [src/api/entities/Identity/index.ts:73](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L73)*

Create an Identity entity

**Parameters:**

Name | Type |
------ | ------ |
`identifiers` | [UniqueIdentifiers](../interfaces/api_entities_identity.uniqueidentifiers.md) |
`context` | [Context](context.context-1.md) |

**Returns:** *[Identity](api_entities_identity.identity.md)*

## Properties

###  authorizations

• **authorizations**: *[Authorizations](api_entities_identity.authorizations.md)*

*Defined in [src/api/entities/Identity/index.ts:73](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L73)*

___

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/Identity/index.ts:70](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L70)*

identity ID as stored in the blockchain

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L47)*

## Methods

###  getCddClaims

▸ **getCddClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

*Defined in [src/api/entities/Identity/index.ts:249](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L249)*

Retrieve the list of cdd claims for the current identity

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ClaimData](../interfaces/types.claimdata.md)››*

___

###  getClaimScopes

▸ **getClaimScopes**(): *Promise‹[ClaimScope](../interfaces/types.claimscope.md)[]›*

*Defined in [src/api/entities/Identity/index.ts:276](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L276)*

Retrieve all scopes in which claims have been made for this identity.
  If the scope is an asset DID, the corresponding ticker is returned as well

**`note`** a null scope means the identity has scopeless claims (like CDD for example)

**Returns:** *Promise‹[ClaimScope](../interfaces/types.claimscope.md)[]›*

___

###  getClaims

▸ **getClaims**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityWithClaims](../interfaces/types.identitywithclaims.md)››*

*Defined in [src/api/entities/Identity/index.ts:375](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L375)*

Retrieve all claims issued about this identity, grouped by claim issuer

**`note`** supports pagination

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type |
------ | ------ |
`scope?` | undefined &#124; string |
`size?` | undefined &#124; number |
`start?` | undefined &#124; number |
`trustedClaimIssuers?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityWithClaims](../interfaces/types.identitywithclaims.md)››*

___

###  getHeldTokens

▸ **getHeldTokens**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/Identity/index.ts:305](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L305)*

Retrieve a list of all tokens which were held at one point by this identity

**`note`** supports pagination

**Parameters:**

▪`Default value`  **opts**: *object*= { order: Order.Asc }

Name | Type |
------ | ------ |
`order?` | [Order](../enums/middleware.order.md) |
`size?` | undefined &#124; number |
`start?` | undefined &#124; number |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  getMasterKey

▸ **getMasterKey**(): *Promise‹string›*

*Defined in [src/api/entities/Identity/index.ts:215](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L215)*

Retrieve the master key associated with the identity

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **getMasterKey**(`callback`: [SubCallback](../modules/types.md#subcallback)‹string›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:216](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L216)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getTokenBalance

▸ **getTokenBalance**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/api/entities/Identity/index.ts:131](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L131)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹BigNumber›*

▸ **getTokenBalance**(`args`: object, `callback`: [SubCallback](../modules/types.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:132](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L132)*

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../modules/types.md#subcallback)‹BigNumber›*

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getTrustingTokens

▸ **getTrustingTokens**(`args`: object): *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)[]›*

*Defined in [src/api/entities/Identity/index.ts:354](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L354)*

Get the list of tokens for which this identity is a trusted claim issuer

**Parameters:**

▪`Default value`  **args**: *object*= { order: Order.Asc }

Name | Type |
------ | ------ |
`order` | [Order](../enums/middleware.order.md) |

**Returns:** *Promise‹[SecurityToken](api_entities_securitytoken.securitytoken.md)[]›*

___

###  hasRole

▸ **hasRole**(`role`: [Role](../modules/types.md#role)): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:90](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L90)*

Check whether this Identity possesses the specified Role

**Parameters:**

Name | Type |
------ | ------ |
`role` | [Role](../modules/types.md#role) |

**Returns:** *Promise‹boolean›*

___

###  hasRoles

▸ **hasRoles**(`roles`: [Role](../modules/types.md#role)[]): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:345](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L345)*

Check whether this Identity possesses all specified roles

**Parameters:**

Name | Type |
------ | ------ |
`roles` | [Role](../modules/types.md#role)[] |

**Returns:** *Promise‹boolean›*

___

###  hasValidCdd

▸ **hasValidCdd**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:179](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L179)*

Check whether this Identity has a valid CDD claim

**Returns:** *Promise‹boolean›*

___

###  isGcMember

▸ **isGcMember**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:196](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/Identity/index.ts#L196)*

Check whether this Identity is Governance Committee member

**Returns:** *Promise‹boolean›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](base.entity.md).[generateUuid](base.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L15)*

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

*Inherited from [Entity](base.entity.md).[unserialize](base.entity.md#static-unserialize)*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
