[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/MultiSig/types

# api/entities/Account/MultiSig/types

## Interfaces

### HistoricalMultiSigProposal

Defined in: [api/entities/Account/MultiSig/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L18)

#### Properties

##### approvalAmount

> **approvalAmount**: `BigNumber`

Defined in: [api/entities/Account/MultiSig/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L21)

##### args

> **args**: [`AnyJson`](../wiki/api.entities.MultiSigProposal.types#anyjson)

Defined in: [api/entities/Account/MultiSig/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L25)

##### expiry

> **expiry**: `Date` \| `null`

Defined in: [api/entities/Account/MultiSig/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L23)

##### proposal

> **proposal**: [`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)

Defined in: [api/entities/Account/MultiSig/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L19)

##### rejectionAmount

> **rejectionAmount**: `BigNumber`

Defined in: [api/entities/Account/MultiSig/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L22)

##### status

> **status**: [`ProposalStatus`](../wiki/api.entities.MultiSigProposal.types#proposalstatus)

Defined in: [api/entities/Account/MultiSig/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L20)

##### txTag

> **txTag**: `TxTag`

Defined in: [api/entities/Account/MultiSig/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L24)

***

### MultiSigDetails

Defined in: [api/entities/Account/MultiSig/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L6)

#### Properties

##### requiredSignatures

> **requiredSignatures**: `BigNumber`

Defined in: [api/entities/Account/MultiSig/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L8)

##### signers

> **signers**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/Account/MultiSig/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L7)

***

### MultiSigSigners

Defined in: [api/entities/Account/MultiSig/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L11)

#### Properties

##### isAdmin

> **isAdmin**: `boolean`

Defined in: [api/entities/Account/MultiSig/types.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L14)

##### isPayer

> **isPayer**: `boolean`

Defined in: [api/entities/Account/MultiSig/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L15)

##### signerFor

> **signerFor**: [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)

Defined in: [api/entities/Account/MultiSig/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L12)

##### signers

> **signers**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/Account/MultiSig/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/MultiSig/types.ts#L13)
