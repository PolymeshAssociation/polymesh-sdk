# Interface: SetAssetRequirementsParams

[api/procedures/types](../wiki/api.procedures.types).SetAssetRequirementsParams

## Table of contents

### Properties

- [requirements](../wiki/api.procedures.types.SetAssetRequirementsParams#requirements)

## Properties

### requirements

• **requirements**: [`InputCondition`](../wiki/api.entities.types#inputcondition)[][]

array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays.
  In other words, higher level arrays are *OR* between them, while conditions inside each array are *AND* between them

#### Defined in

[api/procedures/types.ts:1129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1129)
