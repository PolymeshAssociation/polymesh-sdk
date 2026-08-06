[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CorporateActionBase/types

# api/entities/CorporateActionBase/types

## Enumerations

### CorporateActionKind

Defined in: [api/entities/CorporateActionBase/types.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L35)

#### Enumeration Members

##### IssuerNotice

> **IssuerNotice**: `"IssuerNotice"`

Defined in: [api/entities/CorporateActionBase/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L38)

##### Other

> **Other**: `"Other"`

Defined in: [api/entities/CorporateActionBase/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L40)

##### PredictableBenefit

> **PredictableBenefit**: `"PredictableBenefit"`

Defined in: [api/entities/CorporateActionBase/types.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L36)

##### Reorganization

> **Reorganization**: `"Reorganization"`

Defined in: [api/entities/CorporateActionBase/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L39)

##### UnpredictableBenefit

> **UnpredictableBenefit**: `"UnpredictableBenefit"`

Defined in: [api/entities/CorporateActionBase/types.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L37)

***

### TargetTreatment

Defined in: [api/entities/CorporateActionBase/types.ts:6](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L6)

#### Enumeration Members

##### Exclude

> **Exclude**: `"Exclude"`

Defined in: [api/entities/CorporateActionBase/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L8)

##### Include

> **Include**: `"Include"`

Defined in: [api/entities/CorporateActionBase/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L7)

## Interfaces

### CorporateActionTargets

Defined in: [api/entities/CorporateActionBase/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L11)

#### Properties

##### identities

> **identities**: [`Identity`](../wiki/api.entities.Identity#identity)[]

Defined in: [api/entities/CorporateActionBase/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L12)

##### treatment

> **treatment**: [`TargetTreatment`](../wiki/#targettreatment)

Defined in: [api/entities/CorporateActionBase/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L13)

***

### TaxWithholding

Defined in: [api/entities/CorporateActionBase/types.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L16)

#### Properties

##### identity

> **identity**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/CorporateActionBase/types.ts:17](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L17)

##### percentage

> **percentage**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L18)

## Type Aliases

### InputTargets

> **InputTargets** = [`Modify`](../wiki/types.utils#modify)\<[`CorporateActionTargets`](../wiki/#corporateactiontargets), \{ `identities`: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]; \}\>

Defined in: [api/entities/CorporateActionBase/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L21)

***

### InputTaxWithholding

> **InputTaxWithholding** = [`Modify`](../wiki/types.utils#modify)\<[`TaxWithholding`](../wiki/#taxwithholding), \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \}\>

Defined in: [api/entities/CorporateActionBase/types.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/CorporateActionBase/types.ts#L28)

## References

### CorporateActionParams

Renames and re-exports [Params](../wiki/api.entities.CorporateActionBase#params)
