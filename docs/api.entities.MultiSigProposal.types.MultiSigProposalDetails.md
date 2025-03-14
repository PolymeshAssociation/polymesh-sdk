# Interface: MultiSigProposalDetails

[api/entities/MultiSigProposal/types](../wiki/api.entities.MultiSigProposal.types).MultiSigProposalDetails

## Table of contents

### Properties

- [approvalAmount](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#approvalamount)
- [args](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#args)
- [autoClose](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#autoclose)
- [expiry](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#expiry)
- [rejectionAmount](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#rejectionamount)
- [status](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#status)
- [txTag](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#txtag)
- [voted](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails#voted)

## Properties

### approvalAmount

• **approvalAmount**: `BigNumber`

The number of approvals this proposal has received

#### Defined in

[api/entities/MultiSigProposal/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L33)

___

### args

• **args**: [`AnyJson`](../wiki/api.entities.MultiSigProposal.types#anyjson)

The arguments to be passed to the transaction for this proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L57)

___

### autoClose

• **autoClose**: `boolean`

Determines if the proposal will automatically be closed once a threshold of reject votes has been reached

#### Defined in

[api/entities/MultiSigProposal/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L49)

___

### expiry

• **expiry**: ``null`` \| `Date`

An optional time in which this proposal will expire if a decision isn't reached by then

#### Defined in

[api/entities/MultiSigProposal/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L45)

___

### rejectionAmount

• **rejectionAmount**: `BigNumber`

The number of rejections this proposal has received

#### Defined in

[api/entities/MultiSigProposal/types.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L37)

___

### status

• **status**: [`ProposalStatus`](../wiki/api.entities.MultiSigProposal.types.ProposalStatus)

The current status of the proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L41)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

The tag for the transaction being proposed for the MultiSig to execute

#### Defined in

[api/entities/MultiSigProposal/types.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L53)

___

### voted

• **voted**: [`Account`](../wiki/api.entities.Account.Account)[]

Accounts of signing keys that have already voted on this proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/types.ts#L61)
