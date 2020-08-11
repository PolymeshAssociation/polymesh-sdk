# Class: SecurityToken

Class used to manage all the Security Token functionality

## Hierarchy

* [Entity](_src_base_entity_.entity.md)‹[UniqueIdentifiers](../interfaces/_src_api_entities_securitytoken_index_.uniqueidentifiers.md)›

  ↳ **SecurityToken**

## Index

### Properties

* [compliance](_src_api_entities_securitytoken_index_.securitytoken.md#compliance)
* [context](_src_api_entities_securitytoken_index_.securitytoken.md#protected-context)
* [did](_src_api_entities_securitytoken_index_.securitytoken.md#did)
* [documents](_src_api_entities_securitytoken_index_.securitytoken.md#documents)
* [issuance](_src_api_entities_securitytoken_index_.securitytoken.md#issuance)
* [ticker](_src_api_entities_securitytoken_index_.securitytoken.md#ticker)
* [tokenHolders](_src_api_entities_securitytoken_index_.securitytoken.md#tokenholders)
* [transfers](_src_api_entities_securitytoken_index_.securitytoken.md#transfers)
* [uuid](_src_api_entities_securitytoken_index_.securitytoken.md#uuid)

### Methods

* [createdAt](_src_api_entities_securitytoken_index_.securitytoken.md#createdat)
* [currentFundingRound](_src_api_entities_securitytoken_index_.securitytoken.md#currentfundinground)
* [details](_src_api_entities_securitytoken_index_.securitytoken.md#details)
* [getIdentifiers](_src_api_entities_securitytoken_index_.securitytoken.md#getidentifiers)
* [modify](_src_api_entities_securitytoken_index_.securitytoken.md#modify)
* [transferOwnership](_src_api_entities_securitytoken_index_.securitytoken.md#transferownership)
* [generateUuid](_src_api_entities_securitytoken_index_.securitytoken.md#static-generateuuid)
* [unserialize](_src_api_entities_securitytoken_index_.securitytoken.md#static-unserialize)

## Properties

###  compliance

• **compliance**: *[Compliance](_src_api_entities_securitytoken_compliance_index_.compliance.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:84](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L84)*

___

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Entity](_src_base_entity_.entity.md).[context](_src_base_entity_.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L49)*

___

###  did

• **did**: *string*

*Defined in [src/api/entities/SecurityToken/index.ts:72](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L72)*

identity id of the Security Token

___

###  documents

• **documents**: *[Documents](_src_api_entities_securitytoken_documents_.documents.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:80](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L80)*

___

###  issuance

• **issuance**: *[Issuance](_src_api_entities_securitytoken_issuance_.issuance.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:83](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L83)*

___

###  ticker

• **ticker**: *string*

*Defined in [src/api/entities/SecurityToken/index.ts:77](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L77)*

ticker of the Security Token

___

###  tokenHolders

• **tokenHolders**: *[TokenHolders](_src_api_entities_securitytoken_tokenholders_.tokenholders.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:82](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L82)*

___

###  transfers

• **transfers**: *[Transfers](_src_api_entities_securitytoken_transfers_.transfers.md)*

*Defined in [src/api/entities/SecurityToken/index.ts:81](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L81)*

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[uuid](_src_base_entity_.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Entity.ts#L47)*

## Methods

###  createdAt

▸ **createdAt**(): *Promise‹[EventIdentifier](../interfaces/_src_types_index_.eventidentifier.md) | null›*

*Defined in [src/api/entities/SecurityToken/index.ts:259](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L259)*

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created

**`note`** this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

**Returns:** *Promise‹[EventIdentifier](../interfaces/_src_types_index_.eventidentifier.md) | null›*

___

###  currentFundingRound

▸ **currentFundingRound**(): *Promise‹string›*

*Defined in [src/api/entities/SecurityToken/index.ts:182](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L182)*

Retrieve the Security Token's funding round

**`note`** can be subscribed to

**Returns:** *Promise‹string›*

▸ **currentFundingRound**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹string›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:183](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L183)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹string› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  details

▸ **details**(): *Promise‹[SecurityTokenDetails](../interfaces/_src_api_entities_securitytoken_types_.securitytokendetails.md)›*

*Defined in [src/api/entities/SecurityToken/index.ts:133](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L133)*

Retrieve the Security Token's name, total supply, whether it is divisible or not and the identity of the owner

**`note`** can be subscribed to

**Returns:** *Promise‹[SecurityTokenDetails](../interfaces/_src_api_entities_securitytoken_types_.securitytokendetails.md)›*

▸ **details**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[SecurityTokenDetails](../interfaces/_src_api_entities_securitytoken_types_.securitytokendetails.md)›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:134](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L134)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[SecurityTokenDetails](../interfaces/_src_api_entities_securitytoken_types_.securitytokendetails.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  getIdentifiers

▸ **getIdentifiers**(): *Promise‹[TokenIdentifier](../interfaces/_src_types_index_.tokenidentifier.md)[]›*

*Defined in [src/api/entities/SecurityToken/index.ts:213](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L213)*

Retrive the Security Token's asset identifiers list

**`note`** can be subscribed to

**Returns:** *Promise‹[TokenIdentifier](../interfaces/_src_types_index_.tokenidentifier.md)[]›*

▸ **getIdentifiers**(`callback?`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TokenIdentifier](../interfaces/_src_types_index_.tokenidentifier.md)[]›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/index.ts:214](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L214)*

**Parameters:**

Name | Type |
------ | ------ |
`callback?` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TokenIdentifier](../interfaces/_src_types_index_.tokenidentifier.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  modify

▸ **modify**(`args`: [ModifyTokenParams](../modules/_src_api_procedures_modifytoken_.md#modifytokenparams)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/index.ts:123](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L123)*

Modify some properties of the Security Token

**`throws`** if the passed values result in no changes being made to the token

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenParams](../modules/_src_api_procedures_modifytoken_.md#modifytokenparams) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  transferOwnership

▸ **transferOwnership**(`args`: [TransferTokenOwnershipParams](../interfaces/_src_api_procedures_transfertokenownership_.transfertokenownershipparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/index.ts:110](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/index.ts#L110)*

Transfer ownership of the Security Token to another identity. This generates an authorization request that must be accepted
by the destinatary

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferTokenOwnershipParams](../interfaces/_src_api_procedures_transfertokenownership_.transfertokenownershipparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

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
