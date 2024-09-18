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

[api/entities/MultiSigProposal/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L19)

___

### args

• **args**: [`AnyJson`](../wiki/types#anyjson)

The arguments to be passed to the transaction for this proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L43)

___

### autoClose

• **autoClose**: `boolean`

Determines if the proposal will automatically be closed once a threshold of reject votes has been reached

#### Defined in

[api/entities/MultiSigProposal/types.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L35)

___

### expiry

• **expiry**: ``null`` \| `Date`

An optional time in which this proposal will expire if a decision isn't reached by then

#### Defined in

[api/entities/MultiSigProposal/types.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L31)

___

### rejectionAmount

• **rejectionAmount**: `BigNumber`

The number of rejections this proposal has received

#### Defined in

[api/entities/MultiSigProposal/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L23)

___

### status

• **status**: [`ProposalStatus`](../wiki/api.entities.MultiSigProposal.types.ProposalStatus)

The current status of the proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L27)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

The tag for the transaction being proposed for the MultiSig to execute

#### Defined in

[api/entities/MultiSigProposal/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L39)

___

### voted

• **voted**: [`Account`](../wiki/api.entities.Account.Account)[]

Accounts of signing keys that have already voted on this proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/MultiSigProposal/types.ts#L47)
