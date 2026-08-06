[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Subsidy/types

# api/entities/Subsidy/types

## Interfaces

### SubsidyData

Defined in: [api/entities/Subsidy/types.ts:5](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L5)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/entities/Subsidy/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L17)

amount of POLYX to be subsidized. This can be increased/decreased later on

##### beneficiary

> **beneficiary**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Subsidy/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L9)

Account whose transactions are being paid for

##### subsidizer

> **subsidizer**: [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/entities/Subsidy/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L13)

Account that is paying for the transactions

***

### SubsidyWithAllowance

Defined in: [api/entities/Subsidy/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L20)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/entities/Subsidy/types.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L22)

##### subsidy

> **subsidy**: [`Subsidy`](../wiki/api.entities.Subsidy#subsidy)

Defined in: [api/entities/Subsidy/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Subsidy/types.ts#L21)
