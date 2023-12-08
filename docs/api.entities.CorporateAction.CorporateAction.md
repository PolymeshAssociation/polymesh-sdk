# Class: CorporateAction

[api/entities/CorporateAction](../wiki/api.entities.CorporateAction).CorporateAction

Represents an action initiated by the issuer of an Asset which may affect the positions of
  the Asset Holders

## Hierarchy

- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase.CorporateActionBase)

  ↳ **`CorporateAction`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.CorporateAction.CorporateAction#asset)
- [declarationDate](../wiki/api.entities.CorporateAction.CorporateAction#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.CorporateAction.CorporateAction#defaulttaxwithholding)
- [description](../wiki/api.entities.CorporateAction.CorporateAction#description)
- [id](../wiki/api.entities.CorporateAction.CorporateAction#id)
- [targets](../wiki/api.entities.CorporateAction.CorporateAction#targets)
- [taxWithholdings](../wiki/api.entities.CorporateAction.CorporateAction#taxwithholdings)
- [uuid](../wiki/api.entities.CorporateAction.CorporateAction#uuid)

### Methods

- [checkpoint](../wiki/api.entities.CorporateAction.CorporateAction#checkpoint)
- [exists](../wiki/api.entities.CorporateAction.CorporateAction#exists)
- [isEqual](../wiki/api.entities.CorporateAction.CorporateAction#isequal)
- [linkDocuments](../wiki/api.entities.CorporateAction.CorporateAction#linkdocuments)
- [modifyCheckpoint](../wiki/api.entities.CorporateAction.CorporateAction#modifycheckpoint)
- [toHuman](../wiki/api.entities.CorporateAction.CorporateAction#tohuman)
- [generateUuid](../wiki/api.entities.CorporateAction.CorporateAction#generateuuid)
- [unserialize](../wiki/api.entities.CorporateAction.CorporateAction#unserialize)

## Properties

### asset

• **asset**: [`Asset`](../wiki/api.entities.Asset.Asset)

Asset affected by this Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[asset](../wiki/api.entities.CorporateActionBase.CorporateActionBase#asset)

#### Defined in

[api/entities/CorporateActionBase/index.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L82)

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

### id

• **id**: `BigNumber`

internal Corporate Action ID

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[id](../wiki/api.entities.CorporateActionBase.CorporateActionBase#id)

#### Defined in

[api/entities/CorporateActionBase/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/CorporateActionBase/index.ts#L77)

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

▸ **checkpoint**(): `Promise`<``null`` \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

Retrieve the Checkpoint associated with this Corporate Action. If the Checkpoint is scheduled and has
  not been created yet, the corresponding CheckpointSchedule is returned instead. A null value means
  the Corporate Action was created without an associated Checkpoint

#### Returns

`Promise`<``null`` \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[checkpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#checkpoint)

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this Corporate Action exists on chain

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[exists](../wiki/api.entities.CorporateActionBase.CorporateActionBase#exists)

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

Modify the Corporate Action's Checkpoint

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyCaCheckpointParams`](../wiki/api.procedures.types.ModifyCaCheckpointParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[modifyCheckpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#modifycheckpoint)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.CorporateActionBase.HumanReadable)

Return the Corporate Action's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.CorporateActionBase.HumanReadable)

#### Inherited from

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
