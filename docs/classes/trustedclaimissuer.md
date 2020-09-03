# Class: TrustedClaimIssuer

Represents a trusted claim issuer for a specific token in the Polymesh blockchain

## Hierarchy

* [Entity](entity.md)‹[UniqueIdentifiers](../interfaces/uniqueidentifiers.md)›

  ↳ **TrustedClaimIssuer**

## Index

### Properties

* [context](trustedclaimissuer.md#protected-context)
* [identity](trustedclaimissuer.md#identity)
* [ticker](trustedclaimissuer.md#ticker)
* [uuid](trustedclaimissuer.md#uuid)

### Methods

* [addedAt](trustedclaimissuer.md#addedat)
* [generateUuid](trustedclaimissuer.md#static-generateuuid)
* [unserialize](trustedclaimissuer.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from [Entity](entity.md).[context](entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/base/Entity.ts#L49)*

___

###  identity

• **identity**: *[Identity](identity.md)*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/api/entities/TrustedClaimIssuer.ts#L32)*

identity of the trusted claim issuer

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:37](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/api/entities/TrustedClaimIssuer.ts#L37)*

ticker of the Security Token

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](entity.md).[uuid](entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/base/Entity.ts#L47)*

## Methods

###  addedAt

▸ **addedAt**(): *Promise‹[EventIdentifier](../interfaces/eventidentifier.md) | null›*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:57](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/api/entities/TrustedClaimIssuer.ts#L57)*

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`note`** uses the middleware

**`note`** there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

**Returns:** *Promise‹[EventIdentifier](../interfaces/eventidentifier.md) | null›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](entity.md).[generateUuid](entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/1538712/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
