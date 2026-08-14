[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/MultiSigProposal/types

# api/entities/MultiSigProposal/types

## Enumerations

### MultiSigProposalAction

Defined in: [api/entities/MultiSigProposal/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L64)

#### Enumeration Members

##### Approve

> **Approve**: `"approve"`

Defined in: [api/entities/MultiSigProposal/types.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L65)

##### Reject

> **Reject**: `"reject"`

Defined in: [api/entities/MultiSigProposal/types.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L66)

***

### ProposalStatus

Defined in: [api/entities/MultiSigProposal/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L6)

#### Enumeration Members

##### Active

> **Active**: `"Active"`

Defined in: [api/entities/MultiSigProposal/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L8)

##### Expired

> **Expired**: `"Expired"`

Defined in: [api/entities/MultiSigProposal/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L9)

##### Failed

> **Failed**: `"ExecutionFailed"`

Defined in: [api/entities/MultiSigProposal/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L11)

##### Invalid

> **Invalid**: `"Invalid"`

Defined in: [api/entities/MultiSigProposal/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L7)

##### Rejected

> **Rejected**: `"Rejected"`

Defined in: [api/entities/MultiSigProposal/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L12)

##### Successful

> **Successful**: `"ExecutionSuccessful"`

Defined in: [api/entities/MultiSigProposal/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L10)

## Interfaces

### MultiSigProposalDetails

Defined in: [api/entities/MultiSigProposal/types.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L29)

#### Properties

##### approvalAmount

> **approvalAmount**: `BigNumber`

Defined in: [api/entities/MultiSigProposal/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L33)

The number of approvals this proposal has received

##### args

> **args**: [`AnyJson`](../wiki/#anyjson)

Defined in: [api/entities/MultiSigProposal/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L57)

The arguments to be passed to the transaction for this proposal

##### autoClose

> **autoClose**: `boolean`

Defined in: [api/entities/MultiSigProposal/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L49)

Determines if the proposal will automatically be closed once a threshold of reject votes has been reached

##### expiry

> **expiry**: `Date` \| `null`

Defined in: [api/entities/MultiSigProposal/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L45)

An optional time in which this proposal will expire if a decision isn't reached by then

##### rejectionAmount

> **rejectionAmount**: `BigNumber`

Defined in: [api/entities/MultiSigProposal/types.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L37)

The number of rejections this proposal has received

##### status

> **status**: [`ProposalStatus`](../wiki/#proposalstatus)

Defined in: [api/entities/MultiSigProposal/types.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L41)

The current status of the proposal

##### txTag

> **txTag**: `TxTag`

Defined in: [api/entities/MultiSigProposal/types.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L53)

The tag for the transaction being proposed for the MultiSig to execute

##### voted

> **voted**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/MultiSigProposal/types.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L61)

Accounts of signing keys that have already voted on this proposal

## Type Aliases

### AnyJson

> **AnyJson** = `string` \| `number` \| `boolean` \| `null` \| `undefined` \| [`AnyJson`](../wiki/#anyjson)[] \| \{\[`index`: `string`\]: [`AnyJson`](../wiki/#anyjson); \}

Defined in: [api/entities/MultiSigProposal/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L18)

Represents JSON serializable data. Used for cases when the value can take on many types, like args for a MultiSig proposal.

***

### MultiSigProposalVote

> **MultiSigProposalVote** = [`EventIdentifier`](../wiki/api.client.types#eventidentifier) & `object`

Defined in: [api/entities/MultiSigProposal/types.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/MultiSigProposal/types.ts#L69)

#### Type Declaration

##### action

> **action**: [`MultiSigProposalVoteActionEnum`](../wiki/types#multisigproposalvoteactionenum)

##### signer

> **signer**: [`Signer`](../wiki/api.entities.types#signer)
