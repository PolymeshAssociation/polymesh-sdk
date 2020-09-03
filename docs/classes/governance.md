# Class: Governance

Handles all Governance related functionality

## Hierarchy

* **Governance**

## Index

### Methods

* [createProposal](governance.md#createproposal)
* [getGovernanceCommitteeMembers](governance.md#getgovernancecommitteemembers)
* [getProposals](governance.md#getproposals)
* [getTransactionArguments](governance.md#gettransactionarguments)
* [minimumProposalDeposit](governance.md#minimumproposaldeposit)
* [proposalTimeFrames](governance.md#proposaltimeframes)

## Methods

###  createProposal

▸ **createProposal**(`args`: [CreateProposalParams](../interfaces/createproposalparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[Proposal](proposal.md)››*

*Defined in [src/Governance.ts:128](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L128)*

Create a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [CreateProposalParams](../interfaces/createproposalparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[Proposal](proposal.md)››*

___

###  getGovernanceCommitteeMembers

▸ **getGovernanceCommitteeMembers**(): *Promise‹[Identity](identity.md)[]›*

*Defined in [src/Governance.ts:48](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L48)*

Retrieve a list of all active committee members

**Returns:** *Promise‹[Identity](identity.md)[]›*

___

###  getProposals

▸ **getProposals**(`opts`: object): *Promise‹[ProposalWithDetails](../interfaces/proposalwithdetails.md)[]›*

*Defined in [src/Governance.ts:85](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L85)*

Retrieve a list of proposals and their respective details. Can be filtered using parameters

**`note`** details for a single proposal can be fetched using the `Proposal` entity's `getDetails` method

**`note`** uses the middleware

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | ProposalOrderByInput | the order in which the proposals are returned |
`proposers?` | string[] | accounts for which to fetch proposals. Defaults to all proposers |
`size?` | undefined &#124; number | page size |
`start?` | undefined &#124; number | page offset  |
`states?` | ProposalState[] | state of the proposal |

**Returns:** *Promise‹[ProposalWithDetails](../interfaces/proposalwithdetails.md)[]›*

___

###  getTransactionArguments

▸ **getTransactionArguments**(`args`: object): *[TransactionArgument](../globals.md#transactionargument)[]*

*Defined in [src/Governance.ts:68](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L68)*

Retrieve the types of arguments that a certain transaction requires to be run

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`tag` | TxTag | tag associated with the transaction that will be executed if the proposal passes  |

**Returns:** *[TransactionArgument](../globals.md#transactionargument)[]*

___

###  minimumProposalDeposit

▸ **minimumProposalDeposit**(): *Promise‹BigNumber›*

*Defined in [src/Governance.ts:137](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L137)*

Get the minimum amount of POLYX that has to be deposited when creating a proposal

**`note`** can be subscribed to

**Returns:** *Promise‹BigNumber›*

▸ **minimumProposalDeposit**(`callback`: [SubCallback](../globals.md#subcallback)‹BigNumber›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Governance.ts:138](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L138)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹BigNumber› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  proposalTimeFrames

▸ **proposalTimeFrames**(): *Promise‹[ProposalTimeFrames](../interfaces/proposaltimeframes.md)›*

*Defined in [src/Governance.ts:171](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L171)*

Retrieve the proposal time frames. This includes:

- Amount of blocks from proposal creation until the proposal can be voted on (cool off)
- Amount of blocks from when cool off ends until the voting period is over (duration)

**`note`** can be subscribed to

**Returns:** *Promise‹[ProposalTimeFrames](../interfaces/proposaltimeframes.md)›*

▸ **proposalTimeFrames**(`callback`: [SubCallback](../globals.md#subcallback)‹[ProposalTimeFrames](../interfaces/proposaltimeframes.md)›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/Governance.ts:172](https://github.com/PolymathNetwork/polymesh-sdk/blob/a6abd82/src/Governance.ts#L172)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹[ProposalTimeFrames](../interfaces/proposaltimeframes.md)› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*
