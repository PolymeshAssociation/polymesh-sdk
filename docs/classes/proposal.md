# Class: Proposal

Represents a Polymesh Improvement Proposal (PIP)

## Hierarchy

* [Entity](entity.md)‹UniqueIdentifiers›

  ↳ **Proposal**

## Index

### Properties

* [context](proposal.md#protected-context)
* [pipId](proposal.md#pipid)
* [uuid](proposal.md#uuid)

### Methods

* [cancel](proposal.md#cancel)
* [edit](proposal.md#edit)
* [getDetails](proposal.md#getdetails)
* [getStage](proposal.md#getstage)
* [getVotes](proposal.md#getvotes)
* [identityHasVoted](proposal.md#identityhasvoted)
* [minimumBondedAmount](proposal.md#minimumbondedamount)
* [vote](proposal.md#vote)
* [generateUuid](proposal.md#static-generateuuid)
* [unserialize](proposal.md#static-unserialize)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from [Entity](entity.md).[context](entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/base/Entity.ts#L49)*

___

###  pipId

• **pipId**: *number*

*Defined in [src/api/entities/Proposal/index.ts:51](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L51)*

internal identifier

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](entity.md).[uuid](entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/base/Entity.ts#L47)*

## Methods

###  cancel

▸ **cancel**(): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:154](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L154)*

Cancel the proposal

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

###  edit

▸ **edit**(`args`: [EditProposalParams](../globals.md#editproposalparams)): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:146](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L146)*

Edit a proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [EditProposalParams](../globals.md#editproposalparams) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

###  getDetails

▸ **getDetails**(): *Promise‹[ProposalDetails](../interfaces/proposaldetails.md)›*

*Defined in [src/api/entities/Proposal/index.ts:162](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L162)*

Retrieve the proposal details

**Returns:** *Promise‹[ProposalDetails](../interfaces/proposaldetails.md)›*

___

###  getStage

▸ **getStage**(): *Promise‹[ProposalStage](../enums/proposalstage.md)›*

*Defined in [src/api/entities/Proposal/index.ts:188](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L188)*

Retrieve the current stage of the proposal

**Returns:** *Promise‹[ProposalStage](../enums/proposalstage.md)›*

___

###  getVotes

▸ **getVotes**(`opts`: object): *Promise‹[ResultSet](../interfaces/resultset.md)‹[ProposalVote](../interfaces/proposalvote.md)››*

*Defined in [src/api/entities/Proposal/index.ts:104](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L104)*

Retrieve all the votes of the proposal. Can be filtered using parameters

**Parameters:**

▪`Default value`  **opts**: *object*= {}

Name | Type | Description |
------ | ------ | ------ |
`orderBy?` | ProposalVotesOrderByInput | the order in witch the votes are returned |
`size?` | undefined &#124; number | number of votes in each requested page (default: 25) |
`start?` | undefined &#124; number | page offset  |
`vote?` | undefined &#124; false &#124; true | vote decision (positive or negative) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[ProposalVote](../interfaces/proposalvote.md)››*

___

###  identityHasVoted

▸ **identityHasVoted**(`args?`: undefined | object): *Promise‹boolean›*

*Defined in [src/api/entities/Proposal/index.ts:69](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L69)*

Check if an identity has voted on the proposal

**Parameters:**

Name | Type |
------ | ------ |
`args?` | undefined &#124; object |

**Returns:** *Promise‹boolean›*

___

###  minimumBondedAmount

▸ **minimumBondedAmount**(): *Promise‹BigNumber›*

*Defined in [src/api/entities/Proposal/index.ts:233](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L233)*

Retrieve the minimum amount of POLYX that must be bonded by aye votes for the proposal to be considered valid

**Returns:** *Promise‹BigNumber›*

___

###  vote

▸ **vote**(`args`: [VoteOnProposalParams](../globals.md#voteonproposalparams)): *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

*Defined in [src/api/entities/Proposal/index.ts:225](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/api/entities/Proposal/index.ts#L225)*

Vote on the proposal

**Parameters:**

Name | Type |
------ | ------ |
`args` | [VoteOnProposalParams](../globals.md#voteonproposalparams) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹void››*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](entity.md).[generateUuid](entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/base/Entity.ts#L15)*

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

*Inherited from [Entity](entity.md).[unserialize](entity.md#static-unserialize)*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/5266b72/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
