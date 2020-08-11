# Class: TrustedClaimIssuer

Represents a trusted claim issuer for a specific token in the Polymesh blockchain

## Hierarchy

* [Entity](_src_base_entity_.entity.md)‹[UniqueIdentifiers](../interfaces/_src_api_entities_trustedclaimissuer_.uniqueidentifiers.md)›

  ↳ **TrustedClaimIssuer**

## Index

### Properties

* [context](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#protected-context)
* [identity](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#identity)
* [ticker](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#ticker)
* [uuid](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#uuid)

### Methods

* [addedAt](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#addedat)
* [generateUuid](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#static-generateuuid)
* [unserialize](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Entity](_src_base_entity_.entity.md).[context](_src_base_entity_.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L49)*

___

###  identity

• **identity**: *[Identity](_src_api_entities_identity_index_.identity.md)*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:34](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/TrustedClaimIssuer.ts#L34)*

identity of the trusted claim issuer

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/TrustedClaimIssuer.ts#L39)*

ticker of the Security Token

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[uuid](_src_base_entity_.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L47)*

## Methods

###  addedAt

▸ **addedAt**(): *Promise‹[EventIdentifier](../interfaces/_src_types_index_.eventidentifier.md) | null›*

*Defined in [src/api/entities/TrustedClaimIssuer.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/TrustedClaimIssuer.ts#L58)*

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`note`** this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

**Returns:** *Promise‹[EventIdentifier](../interfaces/_src_types_index_.eventidentifier.md) | null›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[generateUuid](_src_base_entity_.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
