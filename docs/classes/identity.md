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

*Defined in [src/api/entities/Identity/index.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L62)*

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

*Defined in [src/api/entities/Identity/index.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L62)*

___

### `Protected` context

• **context**: *Context*

*Inherited from [Entity](entity.md).[context](entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/Identity/index.ts:59](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L59)*

identity ID as stored in the blockchain

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](entity.md).[uuid](entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Entity.ts#L47)*

## Methods

###  getHeldTokens

▸ **getHeldTokens**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/Identity/index.ts:256](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L256)*

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

*Defined in [src/api/entities/Identity/index.ts:221](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L221)*

Retrieve the master key associated with the identity

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **getMasterKey**(`callback`: [SubCallback](../globals.md#subcallback)‹string›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:222](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L222)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  getTokenBalance

▸ **getTokenBalance**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/api/entities/Identity/index.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L120)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹BigNumber›*

▸ **getTokenBalance**(`args`: object, `callback`: [SubCallback](../globals.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:121](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L121)*

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

*Defined in [src/api/entities/Identity/index.ts:307](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L307)*

Get the list of tokens for which this identity is a trusted claim issuer

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **args**: *object*= { order: Order.Asc }

Name | Type |
------ | ------ |
`order` | Order |

**Returns:** *Promise‹[SecurityToken](securitytoken.md)[]›*

___

###  hasRole

▸ **hasRole**(`role`: [Role](../globals.md#role)): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:79](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L79)*

Check whether this Identity possesses the specified Role

**Parameters:**

Name | Type |
------ | ------ |
`role` | [Role](../globals.md#role) |

**Returns:** *Promise‹boolean›*

___

###  hasRoles

▸ **hasRoles**(`roles`: [Role](../globals.md#role)[]): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:296](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L296)*

Check whether this Identity possesses all specified roles

**Parameters:**

Name | Type |
------ | ------ |
`roles` | [Role](../globals.md#role)[] |

**Returns:** *Promise‹boolean›*

___

###  hasValidCdd

▸ **hasValidCdd**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:168](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L168)*

Check whether this Identity has a valid CDD claim

**Returns:** *Promise‹boolean›*

___

###  isCddProvider

▸ **isCddProvider**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:202](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L202)*

Check whether this Identity is a CDD provider

**Returns:** *Promise‹boolean›*

___

###  isGcMember

▸ **isGcMember**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:185](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/Identity/index.ts#L185)*

Check whether this Identity is Governance Committee member

**Returns:** *Promise‹boolean›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](entity.md).[generateUuid](entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
