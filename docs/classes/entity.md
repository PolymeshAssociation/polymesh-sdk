# Class: Entity ‹**UniqueIdentifiers**›

Represents an object or resource in the Polymesh Ecosystem with its own set of properties and functionality

## Type parameters

▪ **UniqueIdentifiers**: *object*

## Hierarchy

* **Entity**

  ↳ [TrustedClaimIssuer](trustedclaimissuer.md)

  ↳ [SecurityToken](securitytoken.md)

  ↳ [TickerReservation](tickerreservation.md)

  ↳ [Identity](identity.md)

  ↳ [AuthorizationRequest](authorizationrequest.md)

  ↳ [Proposal](proposal.md)

## Index

### Properties

* [context](entity.md#protected-context)
* [uuid](entity.md#uuid)

### Methods

* [generateUuid](entity.md#static-generateuuid)
* [isUniqueIdentifiers](entity.md#static-isuniqueidentifiers)
* [unserialize](entity.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *Context*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/bcdc2ee/src/base/Entity.ts#L49)*

___

###  uuid

• **uuid**: *string*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/bcdc2ee/src/base/Entity.ts#L47)*

## Methods

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/bcdc2ee/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:43](https://github.com/PolymathNetwork/polymesh-sdk/blob/bcdc2ee/src/base/Entity.ts#L43)*

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`identifiers` | unknown | object to type check  |

**Returns:** *boolean*

___

### `Static` unserialize

▸ **unserialize**‹**Identifiers**›(`serialized`: string): *Identifiers*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/bcdc2ee/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
