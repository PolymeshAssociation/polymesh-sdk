# Module: api/entities/CorporateActionBase/types

## Table of contents

### References

- [CorporateActionParams](../wiki/api.entities.CorporateActionBase.types#corporateactionparams)

### Enumerations

- [CorporateActionKind](../wiki/api.entities.CorporateActionBase.types.CorporateActionKind)
- [TargetTreatment](../wiki/api.entities.CorporateActionBase.types.TargetTreatment)

### Interfaces

- [CorporateActionTargets](../wiki/api.entities.CorporateActionBase.types.CorporateActionTargets)
- [TaxWithholding](../wiki/api.entities.CorporateActionBase.types.TaxWithholding)

### Type Aliases

- [InputTargets](../wiki/api.entities.CorporateActionBase.types#inputtargets)
- [InputTaxWithholding](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)

## References

### CorporateActionParams

Renames and re-exports [Params](../wiki/api.entities.CorporateActionBase.Params)

## Type Aliases

### InputTargets

Ƭ **InputTargets**: [`Modify`](../wiki/types.utils#modify)<[`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types.CorporateActionTargets), { `identities`: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]  }\>

#### Defined in

[api/entities/CorporateActionBase/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/CorporateActionBase/types.ts#L21)

___

### InputTaxWithholding

Ƭ **InputTaxWithholding**: [`Modify`](../wiki/types.utils#modify)<[`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types.TaxWithholding), { `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)  }\>

#### Defined in

[api/entities/CorporateActionBase/types.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/CorporateActionBase/types.ts#L28)
