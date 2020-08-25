# Class: TickerReservation

Represents a reserved token symbol in the Polymesh chain. Ticker reservations expire
after a set length of time, after which they can be reserved by another identity.
A Ticker must be previously reserved by an identity for that identity to be able create a Security Token with it

## Hierarchy

* [Entity](base.entity.md)‹[UniqueIdentifiers](../interfaces/api_entities_tickerreservation.uniqueidentifiers.md)›

  ↳ **TickerReservation**

## Index

### Properties

* [context](api_entities_tickerreservation.tickerreservation.md#protected-context)
* [ticker](api_entities_tickerreservation.tickerreservation.md#ticker)
* [uuid](api_entities_tickerreservation.tickerreservation.md#uuid)

### Methods

* [createToken](api_entities_tickerreservation.tickerreservation.md#createtoken)
* [details](api_entities_tickerreservation.tickerreservation.md#details)
* [extend](api_entities_tickerreservation.tickerreservation.md#extend)
* [generateUuid](api_entities_tickerreservation.tickerreservation.md#static-generateuuid)
* [unserialize](api_entities_tickerreservation.tickerreservation.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L49)*

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/TickerReservation/index.ts:44](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/TickerReservation/index.ts#L44)*

reserved ticker

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Entity.ts#L47)*

## Methods

###  createToken

▸ **createToken**(`args`: [CreateSecurityTokenParams](../interfaces/api_procedures.createsecuritytokenparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/TickerReservation/index.ts:164](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/TickerReservation/index.ts#L164)*

Create a Security Token using the reserved ticker

**Parameters:**

Name | Type |
------ | ------ |
`args` | [CreateSecurityTokenParams](../interfaces/api_procedures.createsecuritytokenparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  details

▸ **details**(): *Promise‹[TickerReservationDetails](../interfaces/api_entities_tickerreservation.tickerreservationdetails.md)›*

*Defined in [src/api/entities/TickerReservation/index.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/TickerReservation/index.ts#L62)*

Retrieve the reservation's owner, expiry date and status

**`note`** can be subscribed to

**Returns:** *Promise‹[TickerReservationDetails](../interfaces/api_entities_tickerreservation.tickerreservationdetails.md)›*

▸ **details**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[TickerReservationDetails](../interfaces/api_entities_tickerreservation.tickerreservationdetails.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/TickerReservation/index.ts:63](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/TickerReservation/index.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[TickerReservationDetails](../interfaces/api_entities_tickerreservation.tickerreservationdetails.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  extend

▸ **extend**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)››*

*Defined in [src/api/entities/TickerReservation/index.ts:143](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/TickerReservation/index.ts#L143)*

Extend the reservation time period of the ticker for 60 days from now
to later use it in the creation of a Security Token.

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[TickerReservation](api_entities_tickerreservation.tickerreservation.md)››*

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
