# Module: api/entities/MultiSigProposal/types

## Table of contents

### Enumerations

- [MultiSigProposalAction](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalAction)
- [ProposalStatus](../wiki/api.entities.MultiSigProposal.types.ProposalStatus)

### Interfaces

- [MultiSigProposalDetails](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)

### Type Aliases

- [AnyJson](../wiki/api.entities.MultiSigProposal.types#anyjson)
- [MultiSigProposalVote](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)

## Type Aliases

### AnyJson

Ƭ **AnyJson**: `string` \| `number` \| `boolean` \| ``null`` \| `undefined` \| [`AnyJson`](../wiki/api.entities.MultiSigProposal.types#anyjson)[] \| \{ `[index: string]`: [`AnyJson`](../wiki/api.entities.MultiSigProposal.types#anyjson);  }

Represents JSON serializable data. Used for cases when the value can take on many types, like args for a MultiSig proposal.

#### Defined in

[api/entities/MultiSigProposal/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/MultiSigProposal/types.ts#L18)

___

### MultiSigProposalVote

Ƭ **MultiSigProposalVote**: [`EventIdentifier`](../wiki/api.client.types.EventIdentifier) & \{ `action`: [`MultiSigProposalVoteActionEnum`](../wiki/types.MultiSigProposalVoteActionEnum) ; `signer`: [`Signer`](../wiki/api.entities.types#signer)  }

#### Defined in

[api/entities/MultiSigProposal/types.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/MultiSigProposal/types.ts#L69)
