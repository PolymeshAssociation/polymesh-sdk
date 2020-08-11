# Class: Governance

Handles all Governance related functionality

## Hierarchy

* **Governance**

## Index

### Methods

* [createProposal](_src_governance_.governance.md#createproposal)
* [getGovernanceCommitteeMembers](_src_governance_.governance.md#getgovernancecommitteemembers)
* [getProposals](_src_governance_.governance.md#getproposals)
* [getTransactionArguments](_src_governance_.governance.md#gettransactionarguments)
* [minimumProposalDeposit](_src_governance_.governance.md#minimumproposaldeposit)
* [proposalTimeFrames](_src_governance_.governance.md#proposaltimeframes)

## Methods

###  createProposal

▸ **createProposal**(`args`: [CreateProposalParams](../interfaces/_src_api_procedures_createproposal_.createproposalparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[Proposal](_src_api_entities_proposal_index_.proposal.md)››*

*Defined in [src/Governance.ts:116](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L116)*

Create a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [CreateProposalParams](../interfaces/_src_api_procedures_createproposal_.createproposalparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[Proposal](_src_api_entities_proposal_index_.proposal.md)››*

___

###  getGovernanceCommitteeMembers

▸ **getGovernanceCommitteeMembers**(): *Promise‹[Identity](_src_api_entities_identity_index_.identity.md)[]›*

*Defined in [src/Governance.ts:37](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L37)*

Retrieve a list of all active committee members

**Returns:** *Promise‹[Identity](_src_api_entities_identity_index_.identity.md)[]›*

___

###  getProposals

▸ **getProposals**(`opts`: object): *Promise‹[Proposal](_src_api_entities_proposal_index_.proposal.md)[]›*

*Defined in [src/Governance.ts:70](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L70)*

Retrieve a list of proposals. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | [ProposalOrderByInput](../modules/_src_middleware_types_.md#proposalorderbyinput) | the order in which the proposals are returned |
`proposers?` | (string &#124; [Identity](_src_api_entities_identity_index_.identity.md)‹›)[] | identities (or identity IDs) for which to fetch proposals. Defaults to all proposers |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`states?` | [ProposalState](../enums/_src_middleware_types_.proposalstate.md)[] | state of the proposal |

**Returns:** *Promise‹[Proposal](_src_api_entities_proposal_index_.proposal.md)[]›*

___

###  getTransactionArguments

▸ **getTransactionArguments**(`args`: object): *[TransactionArgument](../modules/_src_types_index_.md#transactionargument)[]*

*Defined in [src/Governance.ts:57](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L57)*

Retrieve the types of arguments that a certain transaction requires to be run

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | tag associated with the transaction that will be executed if the proposal passes  |

**Returns:** *[TransactionArgument](../modules/_src_types_index_.md#transactionargument)[]*

___

###  minimumProposalDeposit

▸ **minimumProposalDeposit**(): *Promise‹BigNumber›*

*Defined in [src/Governance.ts:125](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L125)*

Get the minimum amount of POLYX that has to be deposited when creating a proposal

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **minimumProposalDeposit**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Governance.ts:126](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L126)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  proposalTimeFrames

▸ **proposalTimeFrames**(): *Promise‹[ProposalTimeFrames](../interfaces/_src_api_entities_proposal_types_.proposaltimeframes.md)›*

*Defined in [src/Governance.ts:159](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L159)*

Retrieve the proposal time frames. This includes:

- Amount of blocks from proposal creation until the proposal can be voted on (cool off)
- Amount of blocks from when cool off ends until the voting period is over (duration)

**`note`** can be subscribed to

**Returns:** *Promise‹[ProposalTimeFrames](../interfaces/_src_api_entities_proposal_types_.proposaltimeframes.md)›*

▸ **proposalTimeFrames**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[ProposalTimeFrames](../interfaces/_src_api_entities_proposal_types_.proposaltimeframes.md)›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/Governance.ts:160](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/Governance.ts#L160)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[ProposalTimeFrames](../interfaces/_src_api_entities_proposal_types_.proposaltimeframes.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*
