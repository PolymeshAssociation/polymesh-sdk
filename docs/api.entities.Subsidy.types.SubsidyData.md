# Interface: SubsidyData

[api/entities/Subsidy/types](../wiki/api.entities.Subsidy.types).SubsidyData

## Table of contents

### Properties

- [allowance](../wiki/api.entities.Subsidy.types.SubsidyData#allowance)
- [beneficiary](../wiki/api.entities.Subsidy.types.SubsidyData#beneficiary)
- [subsidizer](../wiki/api.entities.Subsidy.types.SubsidyData#subsidizer)

## Properties

### allowance

• **allowance**: `BigNumber`

amount of POLYX to be subsidized. This can be increased/decreased later on

#### Defined in

[api/entities/Subsidy/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Subsidy/types.ts#L17)

___

### beneficiary

• **beneficiary**: [`Account`](../wiki/api.entities.Account.Account)

Account whose transactions are being paid for

#### Defined in

[api/entities/Subsidy/types.ts:9](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Subsidy/types.ts#L9)

___

### subsidizer

• **subsidizer**: [`Account`](../wiki/api.entities.Account.Account)

Account that is paying for the transactions

#### Defined in

[api/entities/Subsidy/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Subsidy/types.ts#L13)
