[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/DividendDistribution

# api/entities/DividendDistribution

## Classes

### DividendDistribution

Defined in: [api/entities/DividendDistribution/index.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L86)

Represents a Corporate Action via which an Asset issuer wishes to distribute dividends
  between a subset of the Asset Holders (targets)

#### Extends

- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase)

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/CorporateActionBase/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L85)

Asset affected by this Corporate Action

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`asset`](../wiki/api.entities.CorporateActionBase#asset)

##### currency

> **currency**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L95)

Asset ID of the currency in which dividends are being distributed

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/entities/CorporateActionBase/index.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L90)

date at which the Corporate Action was created

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`declarationDate`](../wiki/api.entities.CorporateActionBase#declarationdate)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L106)

default percentage (0-100) of tax withholding for this Corporate Action

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`defaultTaxWithholding`](../wiki/api.entities.CorporateActionBase#defaulttaxwithholding)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L95)

brief text description of the Corporate Action

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`description`](../wiki/api.entities.CorporateActionBase#description)

##### expiryDate

> **expiryDate**: `Date` \| `null`

Defined in: [api/entities/DividendDistribution/index.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L111)

date after which dividends can no longer be paid/reclaimed. A null value means the distribution never expires

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L80)

internal Corporate Action ID

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`id`](../wiki/api.entities.CorporateActionBase#id)

##### maxAmount

> **maxAmount**: `BigNumber`

Defined in: [api/entities/DividendDistribution/index.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L106)

maximum amount of `currency` to be distributed. Distributions are "first come, first served", so funds can be depleted before
  every Asset Holder receives their corresponding amount

##### origin

> **origin**: [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/entities/DividendDistribution/index.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L90)

Portfolio from which the dividends will be distributed

##### paymentDate

> **paymentDate**: `Date`

Defined in: [api/entities/DividendDistribution/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L116)

date starting from which dividends can be paid/reclaimed

##### perShare

> **perShare**: `BigNumber`

Defined in: [api/entities/DividendDistribution/index.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L100)

amount of `currency` to pay for each share held by the Asset Holders

##### targets

> **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets)

Defined in: [api/entities/CorporateActionBase/index.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L101)

Asset Holder Identities related to this Corporate action. If the treatment is `Exclude`, the Identities
  in the array will not be targeted by the Action, Identities not in the array will be targeted, and vice versa

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`targets`](../wiki/api.entities.CorporateActionBase#targets)

##### taxWithholdings

> **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding)[]

Defined in: [api/entities/CorporateActionBase/index.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L112)

percentage (0-100) of tax withholding per Identity. Any Identity not present
  in this array uses the default tax withholding percentage

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`taxWithholdings`](../wiki/api.entities.CorporateActionBase#taxwithholdings)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`uuid`](../wiki/api.entities.CorporateActionBase#uuid)

#### Methods

##### checkpoint()

> **checkpoint**(): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)\>

Defined in: [api/entities/DividendDistribution/index.ts:233](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L233)

Retrieve the Checkpoint associated with this Dividend Distribution. If the Checkpoint is scheduled and has not been created yet,
  the corresponding CheckpointSchedule is returned instead

###### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)\>

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`checkpoint`](../wiki/api.entities.CorporateActionBase#checkpoint)

##### claim()

> **claim**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/DividendDistribution/index.ts:196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L196)

Claim the Dividends corresponding to the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [claim.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

> **details**(): `Promise`\<[`DividendDistributionDetails`](../wiki/api.entities.DividendDistribution.types#dividenddistributiondetails)\>

Defined in: [api/entities/DividendDistribution/index.ts:261](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L261)

Retrieve details associated with this Dividend Distribution

###### Returns

`Promise`\<[`DividendDistributionDetails`](../wiki/api.entities.DividendDistribution.types#dividenddistributiondetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/DividendDistribution/index.ts:252](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L252)

Retrieve whether the Distribution exists

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`exists`](../wiki/api.entities.CorporateActionBase#exists)

##### getDocuments()

> **getDocuments**(): `Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

Defined in: [api/entities/CorporateActionBase/index.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L167)

Retrieve the documents linked to this Corporate Action

###### Returns

`Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`getDocuments`](../wiki/api.entities.CorporateActionBase#getdocuments)

##### getParticipant()

> **getParticipant**(`args?`): `Promise`\<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types#distributionparticipant) \| `null`\>

Defined in: [api/entities/DividendDistribution/index.ts:354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L354)

Retrieve an Identity that is entitled to dividends in this Distribution (participant),
  the amount it is entitled to and whether it has been paid or not

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.identity?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | defaults to the signing Identity |

###### Returns

`Promise`\<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types#distributionparticipant) \| `null`\>

###### Note

if the Distribution Checkpoint hasn't been created yet, the result will be null.
  This is because the Distribution participant's corresponding payment cannot be determined without a Checkpoint

##### getParticipants()

> **getParticipants**(): `Promise`\<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types#distributionparticipant)[]\>

Defined in: [api/entities/DividendDistribution/index.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L287)

Retrieve a comprehensive list of all Identities that are entitled to dividends in this Distribution (participants),
  the amount they are entitled to and whether they have been paid or not

###### Returns

`Promise`\<[`DistributionParticipant`](../wiki/api.entities.DividendDistribution.types#distributionparticipant)[]\>

###### Note

this request can take a lot of time with large amounts of Asset Holders

###### Note

if the Distribution Checkpoint hasn't been created yet, the result will be an empty array.
  This is because the Distribution participants cannot be determined without a Checkpoint

##### getPaymentHistory()

> **getPaymentHistory**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`DistributionPayment`](../wiki/api.entities.types#distributionpayment)\>\>

Defined in: [api/entities/DividendDistribution/index.ts:493](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L493)

Retrieve the payment history for this Distribution

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`DistributionPayment`](../wiki/api.entities.types#distributionpayment)\>\>

###### Note

uses the middleware V2

###### Note

supports pagination

##### getWithheldTax()

> **getWithheldTax**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/DividendDistribution/index.ts:452](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L452)

Retrieve the amount of taxes that have been withheld up to this point in this Distribution

###### Returns

`Promise`\<`BigNumber`\>

###### Note

uses the middlewareV2

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`isEqual`](../wiki/api.entities.CorporateActionBase#isequal)

##### linkDocuments()

> **linkDocuments**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/CorporateActionBase/index.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L162)

Link a list of documents to this corporate action

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`LinkCaDocsParams`](../wiki/api.procedures.types#linkcadocsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

any previous links are removed in favor of the new list

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [linkDocuments.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`linkDocuments`](../wiki/api.entities.CorporateActionBase#linkdocuments)

##### modifyCheckpoint()

> **modifyCheckpoint**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/DividendDistribution/index.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L201)

Modify the Distribution's Checkpoint

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`Modify`](../wiki/types.utils#modify)\<[`ModifyCaCheckpointParams`](../wiki/api.procedures.types#modifycacheckpointparams), \{ `checkpoint`: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint); \}\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`modifyCheckpoint`](../wiki/api.entities.CorporateActionBase#modifycheckpoint)

##### pay()

> **pay**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/DividendDistribution/index.ts:217](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L217)

Transfer the corresponding share of the dividends to a list of Identities

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`PayDividendsParams`](../wiki/api.procedures.types#paydividendsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

due to performance issues, we do not validate that the distribution has enough remaining funds to pay the corresponding amount to the supplied Identities

###### Note

if `currency` is indivisible, the Identity's share will be rounded down to the nearest integer (after taxes are withheld)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [pay.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### reclaimFunds()

> **reclaimFunds**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/DividendDistribution/index.ts:227](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L227)

Reclaim any remaining funds back to the origin Portfolio. This can only be done after the Distribution has expired

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

withheld taxes are also reclaimed in the same transaction

###### Note

required roles:
  - Origin Portfolio Custodian

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [reclaimFunds.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/DividendDistribution/index.ts:608](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L608)

Return the Dividend Distribution's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`toHuman`](../wiki/api.entities.CorporateActionBase#tohuman)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`generateUuid`](../wiki/api.entities.CorporateActionBase#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`unserialize`](../wiki/api.entities.CorporateActionBase#unserialize)

## Interfaces

### DividendDistributionParams

Defined in: [api/entities/DividendDistribution/index.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L69)

#### Properties

##### currency

> **currency**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L71)

##### expiryDate

> **expiryDate**: `Date` \| `null`

Defined in: [api/entities/DividendDistribution/index.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L74)

##### maxAmount

> **maxAmount**: `BigNumber`

Defined in: [api/entities/DividendDistribution/index.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L73)

##### origin

> **origin**: [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/entities/DividendDistribution/index.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L70)

##### paymentDate

> **paymentDate**: `Date`

Defined in: [api/entities/DividendDistribution/index.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L75)

##### perShare

> **perShare**: `BigNumber`

Defined in: [api/entities/DividendDistribution/index.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L72)

***

### HumanReadable

Defined in: [api/entities/DividendDistribution/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L60)

#### Extends

- [`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateAction.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L21)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`assetId`](../wiki/api.entities.CorporateAction#assetid)

##### currency

> **currency**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L62)

##### declarationDate

> **declarationDate**: `string`

Defined in: [api/entities/CorporateAction.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L22)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`declarationDate`](../wiki/api.entities.CorporateAction#declarationdate-1)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `string`

Defined in: [api/entities/CorporateAction.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L25)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`defaultTaxWithholding`](../wiki/api.entities.CorporateAction#defaulttaxwithholding-1)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateAction.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L23)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`description`](../wiki/api.entities.CorporateAction#description-1)

##### expiryDate

> **expiryDate**: `string` \| `null`

Defined in: [api/entities/DividendDistribution/index.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L65)

##### id

> **id**: `string`

Defined in: [api/entities/CorporateAction.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L20)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`id`](../wiki/api.entities.CorporateAction#id-1)

##### maxAmount

> **maxAmount**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L64)

##### origin

> **origin**: `object`

Defined in: [api/entities/DividendDistribution/index.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L61)

###### did

> **did**: `string`

###### id?

> `optional` **id?**: `string`

##### paymentDate

> **paymentDate**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L66)

##### perShare

> **perShare**: `string`

Defined in: [api/entities/DividendDistribution/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L63)

##### targets

> **targets**: `object`

Defined in: [api/entities/CorporateAction.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L24)

###### identities

> **identities**: `string`[]

###### treatment

> **treatment**: [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types#targettreatment)

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`targets`](../wiki/api.entities.CorporateAction#targets-1)

##### taxWithholdings

> **taxWithholdings**: `object`[]

Defined in: [api/entities/CorporateAction.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L26)

###### identity

> **identity**: `string`

###### percentage

> **percentage**: `string`

###### Inherited from

[`HumanReadable`](../wiki/api.entities.CorporateAction#humanreadable).[`taxWithholdings`](../wiki/api.entities.CorporateAction#taxwithholdings-1)

## Type Aliases

### Params

> **Params** = [`Params`](../wiki/api.entities.CorporateAction#params) & [`DividendDistributionParams`](../wiki/#dividenddistributionparams)

Defined in: [api/entities/DividendDistribution/index.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/DividendDistribution/index.ts#L78)
