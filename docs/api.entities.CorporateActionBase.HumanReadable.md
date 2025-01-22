# Interface: HumanReadable

[api/entities/CorporateActionBase](../wiki/api.entities.CorporateActionBase).HumanReadable

## Table of contents

### Properties

- [assetId](../wiki/api.entities.CorporateActionBase.HumanReadable#assetid)
- [declarationDate](../wiki/api.entities.CorporateActionBase.HumanReadable#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.CorporateActionBase.HumanReadable#defaulttaxwithholding)
- [description](../wiki/api.entities.CorporateActionBase.HumanReadable#description)
- [id](../wiki/api.entities.CorporateActionBase.HumanReadable#id)
- [targets](../wiki/api.entities.CorporateActionBase.HumanReadable#targets)
- [taxWithholdings](../wiki/api.entities.CorporateActionBase.HumanReadable#taxwithholdings)
- [ticker](../wiki/api.entities.CorporateActionBase.HumanReadable#ticker)

## Properties

### assetId

• **assetId**: `string`

#### Defined in

[api/entities/CorporateActionBase/index.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L44)

___

### declarationDate

• **declarationDate**: `string`

#### Defined in

[api/entities/CorporateActionBase/index.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L45)

___

### defaultTaxWithholding

• **defaultTaxWithholding**: `string`

#### Defined in

[api/entities/CorporateActionBase/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L48)

___

### description

• **description**: `string`

#### Defined in

[api/entities/CorporateActionBase/index.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L46)

___

### id

• **id**: `string`

#### Defined in

[api/entities/CorporateActionBase/index.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L39)

___

### targets

• **targets**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `identities` | `string`[] |
| `treatment` | [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types.TargetTreatment) |

#### Defined in

[api/entities/CorporateActionBase/index.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L47)

___

### taxWithholdings

• **taxWithholdings**: \{ `identity`: `string` ; `percentage`: `string`  }[]

#### Defined in

[api/entities/CorporateActionBase/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L49)

___

### ticker

• **ticker**: `string`

**`Deprecated`**

in favour of `assetId`

#### Defined in

[api/entities/CorporateActionBase/index.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateActionBase/index.ts#L43)
