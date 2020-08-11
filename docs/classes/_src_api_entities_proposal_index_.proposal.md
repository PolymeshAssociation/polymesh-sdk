# Class: Proposal

Represents a Polymesh Improvement Proposal (PIP)

## Hierarchy

* [Entity](_src_base_entity_.entity.md)‹[UniqueIdentifiers](../interfaces/_src_api_entities_proposal_index_.uniqueidentifiers.md)›

  ↳ **Proposal**

## Index

### Properties

* [context](_src_api_entities_proposal_index_.proposal.md#protected-context)
* [pipId](_src_api_entities_proposal_index_.proposal.md#pipid)
* [uuid](_src_api_entities_proposal_index_.proposal.md#uuid)

### Methods

* [cancel](_src_api_entities_proposal_index_.proposal.md#cancel)
* [edit](_src_api_entities_proposal_index_.proposal.md#edit)
* [getDetails](_src_api_entities_proposal_index_.proposal.md#getdetails)
* [getStage](_src_api_entities_proposal_index_.proposal.md#getstage)
* [getVotes](_src_api_entities_proposal_index_.proposal.md#getvotes)
* [identityHasVoted](_src_api_entities_proposal_index_.proposal.md#identityhasvoted)
* [generateUuid](_src_api_entities_proposal_index_.proposal.md#static-generateuuid)
* [unserialize](_src_api_entities_proposal_index_.proposal.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Entity](_src_base_entity_.entity.md).[context](_src_base_entity_.entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L49)*

___

###  pipId

• **pipId**: *number*

*Defined in [src/api/entities/Proposal/index.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L39)*

internal identifier

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](_src_base_entity_.entity.md).[uuid](_src_base_entity_.entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Entity.ts#L47)*

## Methods

###  cancel

▸ **cancel**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:166](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L166)*

Cancel the proposal

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

###  edit

▸ **edit**(`args`: [EditProposalParams](../modules/_src_api_procedures_editproposal_.md#editproposalparams)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:158](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L158)*

Edit a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [EditProposalParams](../modules/_src_api_procedures_editproposal_.md#editproposalparams) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹void››*

___

###  getDetails

▸ **getDetails**(): *Promise‹[ProposalDetails](../interfaces/_src_api_entities_proposal_types_.proposaldetails.md)›*

*Defined in [src/api/entities/Proposal/index.ts:174](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L174)*

Retrieve the proposal details

**Returns:** *Promise‹[ProposalDetails](../interfaces/_src_api_entities_proposal_types_.proposaldetails.md)›*

___

###  getStage

▸ **getStage**(): *Promise‹[ProposalStage](../enums/_src_api_entities_proposal_types_.proposalstage.md)›*

*Defined in [src/api/entities/Proposal/index.ts:200](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L200)*

Retrieve the current stage of the proposal

**Returns:** *Promise‹[ProposalStage](../enums/_src_api_entities_proposal_types_.proposalstage.md)›*

___

###  getVotes

▸ **getVotes**(`opts`: object): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[ProposalVote](../interfaces/_src_api_entities_proposal_types_.proposalvote.md)››*

*Defined in [src/api/entities/Proposal/index.ts:104](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L104)*

Retrieve all the votes of the proposal. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | [ProposalVotesOrderByInput](../modules/_src_middleware_types_.md#proposalvotesorderbyinput) | the order in witch the votes are returned |
`size?` | undefined &#124; number | number of votes in each requested page (default: 25) |
`start?` | undefined &#124; number | page offset  |
`vote?` | undefined &#124; false &#124; true | vote decision (positive or negative) |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[ProposalVote](../interfaces/_src_api_entities_proposal_types_.proposalvote.md)››*

___

###  identityHasVoted

▸ **identityHasVoted**(`args?`: undefined | object): *Promise‹boolean›*

*Defined in [src/api/entities/Proposal/index.ts:57](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Proposal/index.ts#L57)*

Check if an identity has voted on the proposal

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹boolean›*

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
