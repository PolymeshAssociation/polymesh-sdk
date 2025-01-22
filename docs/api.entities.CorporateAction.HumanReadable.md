# Interface: HumanReadable

[api/entities/CorporateAction](../wiki/api.entities.CorporateAction).HumanReadable

## Hierarchy

- **`HumanReadable`**

  ↳ [`HumanReadable`](../wiki/api.entities.DividendDistribution.HumanReadable)

## Table of contents

### Properties

- [assetId](../wiki/api.entities.CorporateAction.HumanReadable#assetid)
- [declarationDate](../wiki/api.entities.CorporateAction.HumanReadable#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.CorporateAction.HumanReadable#defaulttaxwithholding)
- [description](../wiki/api.entities.CorporateAction.HumanReadable#description)
- [id](../wiki/api.entities.CorporateAction.HumanReadable#id)
- [targets](../wiki/api.entities.CorporateAction.HumanReadable#targets)
- [taxWithholdings](../wiki/api.entities.CorporateAction.HumanReadable#taxwithholdings)
- [ticker](../wiki/api.entities.CorporateAction.HumanReadable#ticker)

## Properties

### assetId

• **assetId**: `string`

#### Defined in

[api/entities/CorporateAction.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L26)

___

### declarationDate

• **declarationDate**: `string`

#### Defined in

[api/entities/CorporateAction.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L27)

___

### defaultTaxWithholding

• **defaultTaxWithholding**: `string`

#### Defined in

[api/entities/CorporateAction.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L30)

___

### description

• **description**: `string`

#### Defined in

[api/entities/CorporateAction.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L28)

___

### id

• **id**: `string`

#### Defined in

[api/entities/CorporateAction.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L21)

___

### targets

• **targets**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `identities` | `string`[] |
| `treatment` | [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types.TargetTreatment) |

#### Defined in

[api/entities/CorporateAction.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L29)

___

### taxWithholdings

• **taxWithholdings**: \{ `identity`: `string` ; `percentage`: `string`  }[]

#### Defined in

[api/entities/CorporateAction.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L31)

___

### ticker

• **ticker**: `string`

**`Deprecated`**

in favour of `assetId`

#### Defined in

[api/entities/CorporateAction.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L25)
