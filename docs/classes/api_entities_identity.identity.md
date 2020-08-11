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

* [getMasterKey](api_entities_identity.identity.md#getmasterkey)
* [getTokenBalance](api_entities_identity.identity.md#gettokenbalance)
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

*Defined in [src/api/entities/Identity/index.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L55)*

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

*Defined in [src/api/entities/Identity/index.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L55)*

___

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/Identity/index.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L52)*

identity ID as stored in the blockchain

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Entity.ts#L47)*

## Methods

###  getMasterKey

▸ **getMasterKey**(): *Promise‹string›*

*Defined in [src/api/entities/Identity/index.ts:222](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L222)*

Retrieve the master key associated with the identity

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **getMasterKey**(`callback`: [SubCallback](../modules/types.md#subcallback)‹string›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:223](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L223)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getTokenBalance

▸ **getTokenBalance**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/api/entities/Identity/index.ts:143](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L143)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹BigNumber›*

▸ **getTokenBalance**(`args`: object, `callback`: [SubCallback](../modules/types.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:144](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L144)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../modules/types.md#subcallback)‹BigNumber›*

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  hasRole

▸ **hasRole**(`role`: [Role](../modules/types.md#role)): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:107](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L107)*

Check whether this Identity possesses the specified Role

**Parameters:**

Name | Type |
------ | ------ |
`role` | [Role](../modules/types.md#role) |

**Returns:** *Promise‹boolean›*

___

###  hasRoles

▸ **hasRoles**(`roles`: [Role](../modules/types.md#role)[]): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:253](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L253)*

Check whether this Identity possesses all specified roles

**Parameters:**

Name | Type |
------ | ------ |
`roles` | [Role](../modules/types.md#role)[] |

**Returns:** *Promise‹boolean›*

___

###  hasValidCdd

▸ **hasValidCdd**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:186](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L186)*

Check whether this Identity has a valid CDD claim

**Returns:** *Promise‹boolean›*

___

###  isGcMember

▸ **isGcMember**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:203](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/Identity/index.ts#L203)*

Check whether this Identity is Governance Committee member

**Returns:** *Promise‹boolean›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](base.entity.md).[generateUuid](base.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
