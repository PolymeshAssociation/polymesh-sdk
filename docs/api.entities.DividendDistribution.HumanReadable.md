# Interface: HumanReadable

[api/entities/DividendDistribution](../wiki/api.entities.DividendDistribution).HumanReadable

## Hierarchy

- [`HumanReadable`](../wiki/api.entities.CorporateAction.HumanReadable)

  ↳ **`HumanReadable`**

## Table of contents

### Properties

- [assetId](../wiki/api.entities.DividendDistribution.HumanReadable#assetid)
- [currency](../wiki/api.entities.DividendDistribution.HumanReadable#currency)
- [declarationDate](../wiki/api.entities.DividendDistribution.HumanReadable#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.DividendDistribution.HumanReadable#defaulttaxwithholding)
- [description](../wiki/api.entities.DividendDistribution.HumanReadable#description)
- [expiryDate](../wiki/api.entities.DividendDistribution.HumanReadable#expirydate)
- [id](../wiki/api.entities.DividendDistribution.HumanReadable#id)
- [maxAmount](../wiki/api.entities.DividendDistribution.HumanReadable#maxamount)
- [origin](../wiki/api.entities.DividendDistribution.HumanReadable#origin)
- [paymentDate](../wiki/api.entities.DividendDistribution.HumanReadable#paymentdate)
- [perShare](../wiki/api.entities.DividendDistribution.HumanReadable#pershare)
- [targets](../wiki/api.entities.DividendDistribution.HumanReadable#targets)
- [taxWithholdings](../wiki/api.entities.DividendDistribution.HumanReadable#taxwithholdings)
- [ticker](../wiki/api.entities.DividendDistribution.HumanReadable#ticker)

## Properties

### assetId

• **assetId**: `string`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[assetId](../wiki/api.entities.CorporateAction.HumanReadable#assetid)

#### Defined in

[api/entities/CorporateAction.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L26)

___

### currency

• **currency**: `string`

#### Defined in

[api/entities/DividendDistribution/index.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L65)

___

### declarationDate

• **declarationDate**: `string`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[declarationDate](../wiki/api.entities.CorporateAction.HumanReadable#declarationdate)

#### Defined in

[api/entities/CorporateAction.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L27)

___

### defaultTaxWithholding

• **defaultTaxWithholding**: `string`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[defaultTaxWithholding](../wiki/api.entities.CorporateAction.HumanReadable#defaulttaxwithholding)

#### Defined in

[api/entities/CorporateAction.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L30)

___

### description

• **description**: `string`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[description](../wiki/api.entities.CorporateAction.HumanReadable#description)

#### Defined in

[api/entities/CorporateAction.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L28)

___

### expiryDate

• **expiryDate**: ``null`` \| `string`

#### Defined in

[api/entities/DividendDistribution/index.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L68)

___

### id

• **id**: `string`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[id](../wiki/api.entities.CorporateAction.HumanReadable#id)

#### Defined in

[api/entities/CorporateAction.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L21)

___

### maxAmount

• **maxAmount**: `string`

#### Defined in

[api/entities/DividendDistribution/index.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L67)

___

### origin

• **origin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `id?` | `string` |

#### Defined in

[api/entities/DividendDistribution/index.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L64)

___

### paymentDate

• **paymentDate**: `string`

#### Defined in

[api/entities/DividendDistribution/index.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L69)

___

### perShare

• **perShare**: `string`

#### Defined in

[api/entities/DividendDistribution/index.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/DividendDistribution/index.ts#L66)

___

### targets

• **targets**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `identities` | `string`[] |
| `treatment` | [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types.TargetTreatment) |

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[targets](../wiki/api.entities.CorporateAction.HumanReadable#targets)

#### Defined in

[api/entities/CorporateAction.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L29)

___

### taxWithholdings

• **taxWithholdings**: \{ `identity`: `string` ; `percentage`: `string`  }[]

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[taxWithholdings](../wiki/api.entities.CorporateAction.HumanReadable#taxwithholdings)

#### Defined in

[api/entities/CorporateAction.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L31)

___

### ticker

• **ticker**: `string`

**`Deprecated`**

in favour of `assetId`

#### Inherited from

[HumanReadable](../wiki/api.entities.CorporateAction.HumanReadable).[ticker](../wiki/api.entities.CorporateAction.HumanReadable#ticker)

#### Defined in

[api/entities/CorporateAction.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/CorporateAction.ts#L25)
