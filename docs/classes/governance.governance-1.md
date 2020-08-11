# Class: Governance

Handles all Governance related functionality

## Hierarchy

* **Governance**

## Index

### Methods

* [createProposal](governance.governance-1.md#createproposal)
* [getGovernanceCommitteeMembers](governance.governance-1.md#getgovernancecommitteemembers)
* [getProposals](governance.governance-1.md#getproposals)
* [getTransactionArguments](governance.governance-1.md#gettransactionarguments)
* [minimumProposalDeposit](governance.governance-1.md#minimumproposaldeposit)
* [proposalTimeFrames](governance.governance-1.md#proposaltimeframes)

## Methods

###  createProposal

▸ **createProposal**(`args`: [CreateProposalParams](../interfaces/api_procedures.createproposalparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[Proposal](api_entities_proposal.proposal.md)››*

*Defined in [src/Governance.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L120)*

Create a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [CreateProposalParams](../interfaces/api_procedures.createproposalparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[Proposal](api_entities_proposal.proposal.md)››*

___

###  getGovernanceCommitteeMembers

▸ **getGovernanceCommitteeMembers**(): *Promise‹[Identity](api_entities_identity.identity.md)[]›*

*Defined in [src/Governance.ts:41](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L41)*

Retrieve a list of all active committee members

**Returns:** *Promise‹[Identity](api_entities_identity.identity.md)[]›*

___

###  getProposals

▸ **getProposals**(`opts`: object): *Promise‹[Proposal](api_entities_proposal.proposal.md)[]›*

*Defined in [src/Governance.ts:74](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L74)*

Retrieve a list of proposals. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | [ProposalOrderByInput](../modules/middleware.md#proposalorderbyinput) | the order in which the proposals are returned |
`proposers?` | (string &#124; [Identity](api_entities_identity.identity.md)‹›)[] | identities (or identity IDs) for which to fetch proposals. Defaults to all proposers |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`states?` | [ProposalState](../enums/middleware.proposalstate.md)[] | state of the proposal |

**Returns:** *Promise‹[Proposal](api_entities_proposal.proposal.md)[]›*

___

###  getTransactionArguments

▸ **getTransactionArguments**(`args`: object): *[TransactionArgument](../modules/types.md#transactionargument)[]*

*Defined in [src/Governance.ts:61](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L61)*

Retrieve the types of arguments that a certain transaction requires to be run

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | tag associated with the transaction that will be executed if the proposal passes  |

**Returns:** *[TransactionArgument](../modules/types.md#transactionargument)[]*

___

###  minimumProposalDeposit

▸ **minimumProposalDeposit**(): *Promise‹BigNumber›*

*Defined in [src/Governance.ts:129](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L129)*

Get the minimum amount of POLYX that has to be deposited when creating a proposal

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **minimumProposalDeposit**(`callback`: [SubCallback](../modules/types.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Governance.ts:130](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L130)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  proposalTimeFrames

▸ **proposalTimeFrames**(): *Promise‹[ProposalTimeFrames](../interfaces/api_entities_proposal.proposaltimeframes.md)›*

*Defined in [src/Governance.ts:163](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L163)*

Retrieve the proposal time frames. This includes:

- Amount of blocks from proposal creation until the proposal can be voted on (cool off)
- Amount of blocks from when cool off ends until the voting period is over (duration)

**`note`** can be subscribed to

**Returns:** *Promise‹[ProposalTimeFrames](../interfaces/api_entities_proposal.proposaltimeframes.md)›*

▸ **proposalTimeFrames**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[ProposalTimeFrames](../interfaces/api_entities_proposal.proposaltimeframes.md)›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/Governance.ts:164](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/Governance.ts#L164)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[ProposalTimeFrames](../interfaces/api_entities_proposal.proposaltimeframes.md)› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*
