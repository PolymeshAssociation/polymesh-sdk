# Class: Identity

Represents an identity in the Polymesh blockchain

## Hierarchy

* [Entity](_src_base_entity_.entity.md)‹[UniqueIdentifiers](../interfaces/_src_api_entities_identity_index_.uniqueidentifiers.md)›

  ↳ **Identity**

## Index

### Constructors

* [constructor](_src_api_entities_identity_index_.identity.md#constructor)

### Properties

* [authorizations](_src_api_entities_identity_index_.identity.md#authorizations)
* [context](_src_api_entities_identity_index_.identity.md#protected-context)
* [did](_src_api_entities_identity_index_.identity.md#did)
* [uuid](_src_api_entities_identity_index_.identity.md#uuid)

### Methods

* [getMasterKey](_src_api_entities_identity_index_.identity.md#getmasterkey)
* [getTokenBalance](_src_api_entities_identity_index_.identity.md#gettokenbalance)
* [hasRole](_src_api_entities_identity_index_.identity.md#hasrole)
* [hasRoles](_src_api_entities_identity_index_.identity.md#hasroles)
* [hasValidCdd](_src_api_entities_identity_index_.identity.md#hasvalidcdd)
* [isGcMember](_src_api_entities_identity_index_.identity.md#isgcmember)
* [generateUuid](_src_api_entities_identity_index_.identity.md#static-generateuuid)
* [unserialize](_src_api_entities_identity_index_.identity.md#static-unserialize)

## Constructors

###  constructor

\+ **new Identity**(`identifiers`: [UniqueIdentifiers](../interfaces/_src_api_entities_identity_index_.uniqueidentifiers.md), `context`: [Context](_src_context_index_.context.md)): *[Identity](_src_api_entities_identity_index_.identity.md)*

*Overrides void*

*Defined in [src/api/entities/Identity/index.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L55)*

Create an Identity entity

**Parameters:**

Name | Type |
------ | ------ |
`identifiers` | [UniqueIdentifiers](../interfaces/_src_api_entities_identity_index_.uniqueidentifiers.md) |
`context` | [Context](_src_context_index_.context.md) |

**Returns:** *[Identity](_src_api_entities_identity_index_.identity.md)*

## Properties

###  authorizations

• **authorizations**: *[Authorizations](_src_api_entities_identity_authorizations_.authorizations.md)*

*Defined in [src/api/entities/Identity/index.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L55)*

___

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Entity](_src_base_entity_.entity.md).[context](_src_base_entity_.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/Identity/index.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L52)*

identity ID as stored in the blockchain

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[uuid](_src_base_entity_.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L47)*

## Methods

###  getMasterKey

▸ **getMasterKey**(): *Promise‹string›*

*Defined in [src/api/entities/Identity/index.ts:222](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L222)*

Retrieve the master key associated with the identity

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **getMasterKey**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹string›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:223](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L223)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  getTokenBalance

▸ **getTokenBalance**(`args`: object): *Promise‹BigNumber›*

*Defined in [src/api/entities/Identity/index.ts:143](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L143)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

**Returns:** *Promise‹BigNumber›*

▸ **getTokenBalance**(`args`: object, `callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/Identity/index.ts:144](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L144)*

Retrieve the balance of a particular Security Token

**`note`** can be subscribed to

**Parameters:**

▪ **args**: *object*

Name | Type |
------ | ------ |
`ticker` | string |

▪ **callback**: *[SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber›*

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  hasRole

▸ **hasRole**(`role`: [Role](../modules/_src_types_index_.md#role)): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:107](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L107)*

Check whether this Identity possesses the specified Role

**Parameters:**

Name | Type |
------ | ------ |
`role` | [Role](../modules/_src_types_index_.md#role) |

**Returns:** *Promise‹boolean›*

___

###  hasRoles

▸ **hasRoles**(`roles`: [Role](../modules/_src_types_index_.md#role)[]): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:253](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L253)*

Check whether this Identity possesses all specified roles

**Parameters:**

Name | Type |
------ | ------ |
`roles` | [Role](../modules/_src_types_index_.md#role)[] |

**Returns:** *Promise‹boolean›*

___

###  hasValidCdd

▸ **hasValidCdd**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:186](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L186)*

Check whether this Identity has a valid CDD claim

**Returns:** *Promise‹boolean›*

___

###  isGcMember

▸ **isGcMember**(): *Promise‹boolean›*

*Defined in [src/api/entities/Identity/index.ts:203](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/Identity/index.ts#L203)*

Check whether this Identity is Governance Committee member

**Returns:** *Promise‹boolean›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[generateUuid](_src_base_entity_.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L15)*

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

*Inherited from [Entity](_src_base_entity_.entity.md).[unserialize](_src_base_entity_.entity.md#static-unserialize)*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
