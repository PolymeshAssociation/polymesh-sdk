# Interface: AddAssetRequirementParams

[api/procedures/types](../wiki/api.procedures.types).AddAssetRequirementParams

## Table of contents

### Properties

- [conditions](../wiki/api.procedures.types.AddAssetRequirementParams#conditions)

## Properties

### conditions

• **conditions**: [`InputCondition`](../wiki/types#inputcondition)[]

array of conditions that form the requirement that must be added.
  Conditions within a requirement are *AND* between them. This means that in order
  for a transfer to comply with this requirement, it must fulfill *ALL* conditions

#### Defined in

[api/procedures/types.ts:637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/procedures/types.ts#L637)
