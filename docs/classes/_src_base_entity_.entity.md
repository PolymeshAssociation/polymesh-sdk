# Class: Entity ‹**UniqueIdentifiers**›

Represents an object or resource in the Polymesh Ecosystem with its own set of properties and functionality

## Type parameters

▪ **UniqueIdentifiers**: *object*

## Hierarchy

* **Entity**

  ↳ [TrustedClaimIssuer](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md)

  ↳ [SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)

  ↳ [TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)

  ↳ [Identity](_src_api_entities_identity_index_.identity.md)

  ↳ [AuthorizationRequest](_src_api_entities_authorizationrequest_.authorizationrequest.md)

  ↳ [Proposal](_src_api_entities_proposal_index_.proposal.md)

## Index

### Properties

* [context](_src_base_entity_.entity.md#protected-context)
* [uuid](_src_base_entity_.entity.md#uuid)

### Methods

* [generateUuid](_src_base_entity_.entity.md#static-generateuuid)
* [isUniqueIdentifiers](_src_base_entity_.entity.md#static-isuniqueidentifiers)
* [unserialize](_src_base_entity_.entity.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L49)*

___

###  uuid

• **uuid**: *string*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L47)*

## Methods

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

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

### `Static` isUniqueIdentifiers

▸ **isUniqueIdentifiers**(`identifiers`: unknown): *boolean*

*Defined in [src/base/Entity.ts:43](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L43)*

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`identifiers` | unknown | object to type check  |

**Returns:** *boolean*

___

### `Static` unserialize

▸ **unserialize**‹**Identifiers**›(`serialized`: string): *Identifiers*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
