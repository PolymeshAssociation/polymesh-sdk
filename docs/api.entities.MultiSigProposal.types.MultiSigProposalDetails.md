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

## Properties

### approvalAmount

• **approvalAmount**: `BigNumber`

The number of approvals this proposal has received

#### Defined in

[api/entities/MultiSigProposal/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L18)

___

### args

• **args**: `string`[]

The arguments to be passed to the transaction for this proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L42)

___

### autoClose

• **autoClose**: `boolean`

Determines if the proposal will automatically be closed once a threshold of reject votes has been reached

#### Defined in

[api/entities/MultiSigProposal/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L34)

___

### expiry

• **expiry**: ``null`` \| `Date`

An optional time in which this proposal will expire if a decision isn't reached by then

#### Defined in

[api/entities/MultiSigProposal/types.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L30)

___

### rejectionAmount

• **rejectionAmount**: `BigNumber`

The number of rejections this proposal has received

#### Defined in

[api/entities/MultiSigProposal/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L22)

___

### status

• **status**: [`ProposalStatus`](../wiki/api.entities.MultiSigProposal.types.ProposalStatus)

The current status of the proposal

#### Defined in

[api/entities/MultiSigProposal/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L26)

___

### txTag

• **txTag**: [`TxTag`](../wiki/generated.types#txtag)

The tag for the transaction being proposed for the MultiSig to execute

#### Defined in

[api/entities/MultiSigProposal/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/types.ts#L38)
