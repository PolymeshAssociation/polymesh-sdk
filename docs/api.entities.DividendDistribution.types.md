[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/DividendDistribution/types

# api/entities/DividendDistribution/types

## Interfaces

### DistributionParticipant

Defined in: [api/entities/DividendDistribution/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L13)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/entities/DividendDistribution/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L15)

##### amountAfterTax

> **amountAfterTax**: `BigNumber`

Defined in: [api/entities/DividendDistribution/types.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L23)

amount to be paid to the participant after tax deductions

##### identity

> **identity**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/DividendDistribution/types.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L14)

##### paid

> **paid**: `boolean`

Defined in: [api/entities/DividendDistribution/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L24)

##### taxWithholdingPercentage

> **taxWithholdingPercentage**: `BigNumber`

Defined in: [api/entities/DividendDistribution/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L19)

percentage (0-100) of tax withholding for this participant

***

### DividendDistributionDetails

Defined in: [api/entities/DividendDistribution/types.ts:5](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L5)

#### Properties

##### fundsReclaimed

> **fundsReclaimed**: `boolean`

Defined in: [api/entities/DividendDistribution/types.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L10)

whether the unclaimed funds have been reclaimed

##### remainingFunds

> **remainingFunds**: `BigNumber`

Defined in: [api/entities/DividendDistribution/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/types.ts#L6)

## References

### DividendDistributionParams

Re-exports [DividendDistributionParams](../wiki/api.entities.DividendDistribution#dividenddistributionparams)
