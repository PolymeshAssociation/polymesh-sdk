# Class: TickerReservation

Represents a reserved token symbol in the Polymesh chain. Ticker reservations expire
after a set length of time, after which they can be reserved by another identity.
A Ticker must be previously reserved by an identity for that identity to be able create a Security Token with it

## Hierarchy

* [Entity](_src_base_entity_.entity.md)‹[UniqueIdentifiers](../interfaces/_src_api_entities_tickerreservation_index_.uniqueidentifiers.md)›

  ↳ **TickerReservation**

## Index

### Properties

* [context](_src_api_entities_tickerreservation_index_.tickerreservation.md#protected-context)
* [ticker](_src_api_entities_tickerreservation_index_.tickerreservation.md#ticker)
* [uuid](_src_api_entities_tickerreservation_index_.tickerreservation.md#uuid)

### Methods

* [createToken](_src_api_entities_tickerreservation_index_.tickerreservation.md#createtoken)
* [details](_src_api_entities_tickerreservation_index_.tickerreservation.md#details)
* [extend](_src_api_entities_tickerreservation_index_.tickerreservation.md#extend)
* [generateUuid](_src_api_entities_tickerreservation_index_.tickerreservation.md#static-generateuuid)
* [unserialize](_src_api_entities_tickerreservation_index_.tickerreservation.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Entity](_src_base_entity_.entity.md).[context](_src_base_entity_.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L49)*

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/TickerReservation/index.ts:44](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/index.ts#L44)*

reserved ticker

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[uuid](_src_base_entity_.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L47)*

## Methods

###  createToken

▸ **createToken**(`args`: [CreateSecurityTokenParams](../interfaces/_src_api_procedures_createsecuritytoken_.createsecuritytokenparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/TickerReservation/index.ts:164](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/index.ts#L164)*

Create a Security Token using the reserved ticker

**Parameters:**

Name | Type |
------ | ------ |
`args` | [CreateSecurityTokenParams](../interfaces/_src_api_procedures_createsecuritytoken_.createsecuritytokenparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  details

▸ **details**(): *Promise‹[TickerReservationDetails](../interfaces/_src_api_entities_tickerreservation_types_.tickerreservationdetails.md)›*

*Defined in [src/api/entities/TickerReservation/index.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/index.ts#L62)*

Retrieve the reservation's owner, expiry date and status

**`note`** can be subscribed to

**Returns:** *Promise‹[TickerReservationDetails](../interfaces/_src_api_entities_tickerreservation_types_.tickerreservationdetails.md)›*

▸ **details**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TickerReservationDetails](../interfaces/_src_api_entities_tickerreservation_types_.tickerreservationdetails.md)›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/TickerReservation/index.ts:63](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/index.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TickerReservationDetails](../interfaces/_src_api_entities_tickerreservation_types_.tickerreservationdetails.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  extend

▸ **extend**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)››*

*Defined in [src/api/entities/TickerReservation/index.ts:143](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/TickerReservation/index.ts#L143)*

Extend the reservation time period of the ticker for 60 days from now
to later use it in the creation of a Security Token.

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[TickerReservation](_src_api_entities_tickerreservation_index_.tickerreservation.md)››*

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
