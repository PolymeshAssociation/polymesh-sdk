# Interface: DistributionParticipant

[api/entities/DividendDistribution/types](../wiki/api.entities.DividendDistribution.types).DistributionParticipant

## Table of contents

### Properties

- [amount](../wiki/api.entities.DividendDistribution.types.DistributionParticipant#amount)
- [amountAfterTax](../wiki/api.entities.DividendDistribution.types.DistributionParticipant#amountaftertax)
- [identity](../wiki/api.entities.DividendDistribution.types.DistributionParticipant#identity)
- [paid](../wiki/api.entities.DividendDistribution.types.DistributionParticipant#paid)
- [taxWithholdingPercentage](../wiki/api.entities.DividendDistribution.types.DistributionParticipant#taxwithholdingpercentage)

## Properties

### amount

• **amount**: `BigNumber`

#### Defined in

[api/entities/DividendDistribution/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DividendDistribution/types.ts#L15)

___

### amountAfterTax

• **amountAfterTax**: `BigNumber`

amount to be paid to the participant after tax deductions

#### Defined in

[api/entities/DividendDistribution/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DividendDistribution/types.ts#L23)

___

### identity

• **identity**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/DividendDistribution/types.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DividendDistribution/types.ts#L14)

___

### paid

• **paid**: `boolean`

#### Defined in

[api/entities/DividendDistribution/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DividendDistribution/types.ts#L24)

___

### taxWithholdingPercentage

• **taxWithholdingPercentage**: `BigNumber`

percentage (0-100) of tax withholding for this participant

#### Defined in

[api/entities/DividendDistribution/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DividendDistribution/types.ts#L19)
