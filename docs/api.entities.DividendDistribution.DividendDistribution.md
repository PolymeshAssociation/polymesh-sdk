# Class: DividendDistribution

[api/entities/DividendDistribution](../wiki/api.entities.DividendDistribution).DividendDistribution

Represents a Corporate Action via which an Asset issuer wishes to distribute dividends
  between a subset of the Asset Holders (targets)

## Hierarchy

- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase.CorporateActionBase)

  ↳ **`DividendDistribution`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.DividendDistribution.DividendDistribution#asset)
- [currency](../wiki/api.entities.DividendDistribution.DividendDistribution#currency)
- [declarationDate](../wiki/api.entities.DividendDistribution.DividendDistribution#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.DividendDistribution.DividendDistribution#defaulttaxwithholding)
- [description](../wiki/api.entities.DividendDistribution.DividendDistribution#description)
- [expiryDate](../wiki/api.entities.DividendDistribution.DividendDistribution#expirydate)
- [id](../wiki/api.entities.DividendDistribution.DividendDistribution#id)
- [maxAmount](../wiki/api.entities.DividendDistribution.DividendDistribution#maxamount)
- [origin](../wiki/api.entities.DividendDistribution.DividendDistribution#origin)
- [paymentDate](../wiki/api.entities.DividendDistribution.DividendDistribution#paymentdate)
- [perShare](../wiki/api.entities.DividendDistribution.DividendDistribution#pershare)
- [targets](../wiki/api.entities.DividendDistribution.DividendDistribution#targets)
- [taxWithholdings](../wiki/api.entities.DividendDistribution.DividendDistribution#taxwithholdings)
- [uuid](../wiki/api.entities.DividendDistribution.DividendDistribution#uuid)

### Methods

- [checkpoint](../wiki/api.entities.DividendDistribution.DividendDistribution#checkpoint)
- [claim](../wiki/api.entities.DividendDistribution.DividendDistribution#claim)
- [details](../wiki/api.entities.DividendDistribution.DividendDistribution#details)
- [exists](../wiki/api.entities.DividendDistribution.DividendDistribution#exists)
- [getParticipant](../wiki/api.entities.DividendDistribution.DividendDistribution#getparticipant)
- [getParticipants](../wiki/api.entities.DividendDistribution.DividendDistribution#getparticipants)
- [getPaymentHistory](../wiki/api.entities.DividendDistribution.DividendDistribution#getpaymenthistory)
- [getWithheldTax](../wiki/api.entities.DividendDistribution.DividendDistribution#getwithheldtax)
- [isEqual](../wiki/api.entities.DividendDistribution.DividendDistribution#isequal)
- [linkDocuments](../wiki/api.entities.DividendDistribution.DividendDistribution#linkdocuments)
- [modifyCheckpoint](../wiki/api.entities.DividendDistribution.DividendDistribution#modifycheckpoint)
- [pay](../wiki/api.entities.DividendDistribution.DividendDistribution#pay)
- [reclaimFunds](../wiki/api.entities.DividendDistribution.DividendDistribution#reclaimfunds)
- [toHuman](../wiki/api.entities.DividendDistribution.DividendDistribution#tohuman)
- [generateUuid](../wiki/api.entities.DividendDistribution.DividendDistribution#generateuuid)
- [unserialize](../wiki/api.entities.DividendDistribution.DividendDistribution#unserialize)

## Properties

### asset

• **asset**: [`Asset`](../wiki/api.entities.Asset.Asset)

Asset affected by this Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[asset](../wiki/api.entities.CorporateActionBase.CorporateActionBase#asset)

#### Defined in

[api/entities/CorporateActionBase/index.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L82)

___

### currency

• **currency**: `string`

ticker of the currency in which dividends are being distributed

#### Defined in

[api/entities/DividendDistribution/index.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L97)

___

### declarationDate

• **declarationDate**: `Date`

date at which the Corporate Action was created

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[declarationDate](../wiki/api.entities.CorporateActionBase.CorporateActionBase#declarationdate)

#### Defined in

[api/entities/CorporateActionBase/index.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L87)

___

### defaultTaxWithholding

• **defaultTaxWithholding**: `BigNumber`

default percentage (0-100) of tax withholding for this Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[defaultTaxWithholding](../wiki/api.entities.CorporateActionBase.CorporateActionBase#defaulttaxwithholding)

#### Defined in

[api/entities/CorporateActionBase/index.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L103)

___

### description

• **description**: `string`

brief text description of the Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[description](../wiki/api.entities.CorporateActionBase.CorporateActionBase#description)

#### Defined in

[api/entities/CorporateActionBase/index.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L92)

___

### expiryDate

• **expiryDate**: ``null`` \| `Date`

date after which dividends can no longer be paid/reclaimed. A null value means the distribution never expires

#### Defined in

[api/entities/DividendDistribution/index.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L113)

___

### id

• **id**: `BigNumber`

internal Corporate Action ID

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[id](../wiki/api.entities.CorporateActionBase.CorporateActionBase#id)

#### Defined in

[api/entities/CorporateActionBase/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L77)

___

### maxAmount

• **maxAmount**: `BigNumber`

maximum amount of `currency` to be distributed. Distributions are "first come, first served", so funds can be depleted before
  every Asset Holder receives their corresponding amount

#### Defined in

[api/entities/DividendDistribution/index.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L108)

___

### origin

• **origin**: [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

Portfolio from which the dividends will be distributed

#### Defined in

[api/entities/DividendDistribution/index.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L92)

___

### paymentDate

• **paymentDate**: `Date`

date starting from which dividends can be paid/reclaimed

#### Defined in

[api/entities/DividendDistribution/index.ts:118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L118)

___

### perShare

• **perShare**: `BigNumber`

amount of `currency` to pay for each share held by the Asset Holders

#### Defined in

[api/entities/DividendDistribution/index.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/DividendDistribution/index.ts#L102)

___

### targets

• **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types.CorporateActionTargets)

Asset Holder Identities related to this Corporate action. If the treatment is `Exclude`, the Identities
  in the array will not be targeted by the Action, Identities not in the array will be targeted, and vice versa

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[targets](../wiki/api.entities.CorporateActionBase.CorporateActionBase#targets)

#### Defined in

[api/entities/CorporateActionBase/index.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L98)

___

### taxWithholdings

• **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types.TaxWithholding)[]

percentage (0-100) of tax withholding per Identity. Any Identity not present
  in this array uses the default tax withholding percentage

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[taxWithholdings](../wiki/api.entities.CorporateActionBase.CorporateActionBase#taxwithholdings)

#### Defined in

[api/entities/CorporateActionBase/index.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L109)

___

### uuid

• **uuid**: `string`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[uuid](../wiki/api.entities.CorporateActionBase.CorporateActionBase#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Entity.ts#L46)

## Methods

### checkpoint

▸ **checkpoint**(): `Promise`<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

Retrieve the Checkpoint associated with this Dividend Distribution. If the Checkpoint is scheduled and has not been created yet,
  the corresponding CheckpointSchedule is returned instead

#### Returns

`Promise`<[`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[checkpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#checkpoint)

___

### claim

▸ **claim**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Claim the Dividends corresponding to the signing Identity

**`Note`**

 if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [claim.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### details

▸ **details**(): `Promise`<[`DividendDistributionDetails`](../wiki/api.entities.DividendDistribution.types.DividendDistributionDetails)\>

Retrieve details associated with this Dividend Distribution

#### Returns

`Promise`<[`DividendDistributionDetails`](../wiki/api.entities.DividendDistribution.types.DividendDistributionDetails)\>

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Retrieve whether the Distribution exists

#### Returns

`Promise`<`boolean`\>

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[exists](../wiki/api.entities.CorporateActionBase.CorporateActionBase#exists)

___

### getParticipant

▸ **getParticipant**(`args?`): `Promise`<``null`` \| [`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types.DistributionParticipant)\>

Retrieve an Identity that is entitled to dividends in this Distribution (participant),
  the amount it is entitled to and whether it has been paid or not

**`Note`**

 if the Distribution Checkpoint hasn't been created yet, the result will be null.
  This is because the Distribution participant's corresponding payment cannot be determined without a Checkpoint

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`<``null`` \| [`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types.DistributionParticipant)\>

___

### getParticipants

▸ **getParticipants**(): `Promise`<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types.DistributionParticipant)[]\>

Retrieve a comprehensive list of all Identities that are entitled to dividends in this Distribution (participants),
  the amount they are entitled to and whether they have been paid or not

**`Note`**

 this request can take a lot of time with large amounts of Asset Holders

**`Note`**

 if the Distribution Checkpoint hasn't been created yet, the result will be an empty array.
  This is because the Distribution participants cannot be determined without a Checkpoint

#### Returns

`Promise`<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types.DistributionParticipant)[]\>

___

### getPaymentHistory

▸ **getPaymentHistory**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`DistributionPayment`](../wiki/types.DistributionPayment)\>\>

Retrieve the payment history for this Distribution

**`Note`**

 uses the middleware V2

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`DistributionPayment`](../wiki/types.DistributionPayment)\>\>

___

### getWithheldTax

▸ **getWithheldTax**(): `Promise`<`BigNumber`\>

Retrieve the amount of taxes that have been withheld up to this point in this Distribution

**`Note`**

 uses the middlewareV2

#### Returns

`Promise`<`BigNumber`\>

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[isEqual](../wiki/api.entities.CorporateActionBase.CorporateActionBase#isequal)

___

### linkDocuments

▸ **linkDocuments**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Link a list of documents to this corporate action

**`Note`**

 any previous links are removed in favor of the new list

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [linkDocuments.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`LinkCaDocsParams`](../wiki/api.procedures.types.LinkCaDocsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[linkDocuments](../wiki/api.entities.CorporateActionBase.CorporateActionBase#linkdocuments)

___

### modifyCheckpoint

▸ **modifyCheckpoint**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Modify the Distribution's Checkpoint

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`Modify`](../wiki/types.utils#modify)<[`ModifyCaCheckpointParams`](../wiki/api.procedures.types.ModifyCaCheckpointParams), { `checkpoint`: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Checkpoints.types#inputcacheckpoint)  }\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[modifyCheckpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#modifycheckpoint)

___

### pay

▸ **pay**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Transfer the corresponding share of the dividends to a list of Identities

**`Note`**

 due to performance issues, we do not validate that the distribution has enough remaining funds to pay the corresponding amount to the supplied Identities

**`Note`**

 if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [pay.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`PayDividendsParams`](../wiki/api.procedures.types.PayDividendsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### reclaimFunds

▸ **reclaimFunds**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Reclaim any remaining funds back to the origin Portfolio. This can only be done after the Distribution has expired

**`Note`**

 withheld taxes are also reclaimed in the same transaction

**`Note`**

 required roles:
  - Origin Portfolio Custodian

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [reclaimFunds.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.DividendDistribution.HumanReadable)

Return the Dividend Distribution's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.DividendDistribution.HumanReadable)

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[toHuman](../wiki/api.entities.CorporateActionBase.CorporateActionBase#tohuman)

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[generateUuid](../wiki/api.entities.CorporateActionBase.CorporateActionBase#generateuuid)

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[unserialize](../wiki/api.entities.CorporateActionBase.CorporateActionBase#unserialize)
