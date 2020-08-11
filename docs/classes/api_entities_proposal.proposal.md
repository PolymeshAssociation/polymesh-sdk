# Class: Proposal

Represents a Polymesh Improvement Proposal (PIP)

## Hierarchy

* [Entity](base.entity.md)‹[UniqueIdentifiers](../interfaces/api_entities_proposal.uniqueidentifiers.md)›

  ↳ **Proposal**

## Index

### Properties

* [context](api_entities_proposal.proposal.md#protected-context)
* [pipId](api_entities_proposal.proposal.md#pipid)
* [uuid](api_entities_proposal.proposal.md#uuid)

### Methods

* [cancel](api_entities_proposal.proposal.md#cancel)
* [edit](api_entities_proposal.proposal.md#edit)
* [getDetails](api_entities_proposal.proposal.md#getdetails)
* [getStage](api_entities_proposal.proposal.md#getstage)
* [getVotes](api_entities_proposal.proposal.md#getvotes)
* [identityHasVoted](api_entities_proposal.proposal.md#identityhasvoted)
* [generateUuid](api_entities_proposal.proposal.md#static-generateuuid)
* [unserialize](api_entities_proposal.proposal.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Entity](base.entity.md).[context](base.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L49)*

___

###  pipId

• **pipId**: *number*

*Defined in [src/api/entities/Proposal/index.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L39)*

internal identifier

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](base.entity.md).[uuid](base.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/base/Entity.ts#L47)*

## Methods

###  cancel

▸ **cancel**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:166](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L166)*

Cancel the proposal

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  edit

▸ **edit**(`args`: [EditProposalParams](../modules/api_procedures.md#editproposalparams)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:158](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L158)*

Edit a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [EditProposalParams](../modules/api_procedures.md#editproposalparams) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹void››*

___

###  getDetails

▸ **getDetails**(): *Promise‹[ProposalDetails](../interfaces/api_entities_proposal.proposaldetails.md)›*

*Defined in [src/api/entities/Proposal/index.ts:174](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L174)*

Retrieve the proposal details

**Returns:** *Promise‹[ProposalDetails](../interfaces/api_entities_proposal.proposaldetails.md)›*

___

###  getStage

▸ **getStage**(): *Promise‹[ProposalStage](../enums/api_entities_proposal.proposalstage.md)›*

*Defined in [src/api/entities/Proposal/index.ts:200](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L200)*

Retrieve the current stage of the proposal

**Returns:** *Promise‹[ProposalStage](../enums/api_entities_proposal.proposalstage.md)›*

___

###  getVotes

▸ **getVotes**(`opts`: object): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ProposalVote](../interfaces/api_entities_proposal.proposalvote.md)››*

*Defined in [src/api/entities/Proposal/index.ts:104](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L104)*

Retrieve all the votes of the proposal. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | [ProposalVotesOrderByInput](../modules/api_entities_proposal.md#proposalvotesorderbyinput) | the order in witch the votes are returned |
`size?` | undefined &#124; number | number of votes in each requested page (default: 25) |
`start?` | undefined &#124; number | page offset  |
`vote?` | undefined &#124; false &#124; true | vote decision (positive or negative) |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[ProposalVote](../interfaces/api_entities_proposal.proposalvote.md)››*

___

###  identityHasVoted

▸ **identityHasVoted**(`args?`: undefined | object): *Promise‹boolean›*

*Defined in [src/api/entities/Proposal/index.ts:57](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/api/entities/Proposal/index.ts#L57)*

Check if an identity has voted on the proposal

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹boolean›*

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
