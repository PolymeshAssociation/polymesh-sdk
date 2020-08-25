# Class: TrustedClaimIssuer

Represents a trusted claim issuer for a specific token in the Polymesh blockchain

## Hierarchy

* [Entity](base.entity.md)‹[UniqueIdentifiers](../interfaces/api_entities.uniqueidentifiers.md)›

  ↳ **TrustedClaimIssuer**

## Index

### Properties

* [context](api_entities.trustedclaimissuer.md#protected-context)
* [identity](api_entities.trustedclaimissuer.md#identity)
* [ticker](api_entities.trustedclaimissuer.md#ticker)
* [uuid](api_entities.trustedclaimissuer.md#uuid)

### Methods

* [addedAt](api_entities.trustedclaimissuer.md#addedat)
* [generateUuid](api_entities.trustedclaimissuer.md#static-generateuuid)
* [unserialize](api_entities.trustedclaimissuer.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Entity.ts#L49)*

___

###  identity

• **identity**: *[Identity](api_entities_identity.identity.md)*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:34](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/TrustedClaimIssuer.ts#L34)*

identity of the trusted claim issuer

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/TrustedClaimIssuer.ts#L39)*

ticker of the Security Token

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Entity.ts#L47)*

## Methods

###  addedAt

▸ **addedAt**(): *Promise‹[EventIdentifier](../interfaces/types.eventidentifier.md) | null›*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/TrustedClaimIssuer.ts#L58)*

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`note`** this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

**Returns:** *Promise‹[EventIdentifier](../interfaces/types.eventidentifier.md) | null›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](base.entity.md).[generateUuid](base.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
