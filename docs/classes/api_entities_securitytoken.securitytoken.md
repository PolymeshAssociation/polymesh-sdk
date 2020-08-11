# Class: SecurityToken

Class used to manage all the Security Token functionality

## Hierarchy

* [Entity](base.entity.md)‹[UniqueIdentifiers](../interfaces/api_entities_securitytoken.uniqueidentifiers.md)›

  ↳ **SecurityToken**

## Index

### Properties

* [compliance](api_entities_securitytoken.securitytoken.md#compliance)
* [context](api_entities_securitytoken.securitytoken.md#protected-context)
* [did](api_entities_securitytoken.securitytoken.md#did)
* [documents](api_entities_securitytoken.securitytoken.md#documents)
* [issuance](api_entities_securitytoken.securitytoken.md#issuance)
* [ticker](api_entities_securitytoken.securitytoken.md#ticker)
* [tokenHolders](api_entities_securitytoken.securitytoken.md#tokenholders)
* [transfers](api_entities_securitytoken.securitytoken.md#transfers)
* [uuid](api_entities_securitytoken.securitytoken.md#uuid)

### Methods

* [createdAt](api_entities_securitytoken.securitytoken.md#createdat)
* [currentFundingRound](api_entities_securitytoken.securitytoken.md#currentfundinground)
* [details](api_entities_securitytoken.securitytoken.md#details)
* [getIdentifiers](api_entities_securitytoken.securitytoken.md#getidentifiers)
* [modify](api_entities_securitytoken.securitytoken.md#modify)
* [transferOwnership](api_entities_securitytoken.securitytoken.md#transferownership)
* [generateUuid](api_entities_securitytoken.securitytoken.md#static-generateuuid)
* [unserialize](api_entities_securitytoken.securitytoken.md#static-unserialize)

## Properties

###  compliance

• **compliance**: *[Compliance](api_entities_securitytoken_compliance.compliance.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:84](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L84)*

___

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/SecurityToken/index.ts:72](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L72)*

identity id of the Security Token

___

###  documents

• **documents**: *[Documents](api_entities_securitytoken.documents.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:80](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L80)*

___

###  issuance

• **issuance**: *[Issuance](api_entities_securitytoken.issuance.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:83](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L83)*

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/SecurityToken/index.ts:77](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L77)*

ticker of the Security Token

___

###  tokenHolders

• **tokenHolders**: *[TokenHolders](api_entities_securitytoken.tokenholders.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:82](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L82)*

___

###  transfers

• **transfers**: *[Transfers](api_entities_securitytoken.transfers.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:81](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L81)*

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L47)*

## Methods

###  createdAt

▸ **createdAt**(): *Promise‹[EventIdentifier](../interfaces/types.eventidentifier.md) | null›*

*Defined in [src/api/entities/SecurityToken/index.ts:259](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L259)*

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`note`** this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

**Returns:** *Promise‹[EventIdentifier](../interfaces/types.eventidentifier.md) | null›*

___

###  currentFundingRound

▸ **currentFundingRound**(): *Promise‹string›*

*Defined in [src/api/entities/SecurityToken/index.ts:182](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L182)*

Retrieve the Security Token's funding round

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **currentFundingRound**(`callback`: [SubCallback](../modules/types.md#subcallback)‹string›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:183](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L183)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  details

▸ **details**(): *Promise‹[SecurityTokenDetails](../interfaces/api_entities_securitytoken.securitytokendetails.md)›*

*Defined in [src/api/entities/SecurityToken/index.ts:133](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L133)*

Retrieve the Security Token's name, total supply, whether it is divisible or not and the identity of the owner

**`note`** can be subscribed to

**Returns:** *Promise‹[SecurityTokenDetails](../interfaces/api_entities_securitytoken.securitytokendetails.md)›*

▸ **details**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[SecurityTokenDetails](../interfaces/api_entities_securitytoken.securitytokendetails.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:134](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L134)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[SecurityTokenDetails](../interfaces/api_entities_securitytoken.securitytokendetails.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  getIdentifiers

▸ **getIdentifiers**(): *Promise‹[TokenIdentifier](../interfaces/types.tokenidentifier.md)[]›*

*Defined in [src/api/entities/SecurityToken/index.ts:213](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L213)*

Retrive the Security Token's asset identifiers list

**`note`** can be subscribed to

**Returns:** *Promise‹[TokenIdentifier](../interfaces/types.tokenidentifier.md)[]›*

▸ **getIdentifiers**(`callback?`: [SubCallback](../modules/types.md#subcallback)‹[TokenIdentifier](../interfaces/types.tokenidentifier.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:214](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L214)*

**Parameters:**

Name | Type |
------ | ------ |
`callback?` | [SubCallback](../modules/types.md#subcallback)‹[TokenIdentifier](../interfaces/types.tokenidentifier.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  modify

▸ **modify**(`args`: [ModifyTokenParams](../modules/api_procedures.md#modifytokenparams)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/index.ts:123](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L123)*

Modify some properties of the Security Token

**`throws`** if the passed values result in no changes being made to the token

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenParams](../modules/api_procedures.md#modifytokenparams) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  transferOwnership

▸ **transferOwnership**(`args`: [TransferTokenOwnershipParams](../interfaces/api_procedures.transfertokenownershipparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/index.ts:110](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/SecurityToken/index.ts#L110)*

Transfer ownership of the Security Token to another identity. This generates an authorization request that must be accepted
by the destinatary

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferTokenOwnershipParams](../interfaces/api_procedures.transfertokenownershipparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](base.entity.md).[generateUuid](base.entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L15)*

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

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
