[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CorporateAction

# api/entities/CorporateAction

## Classes

### CorporateAction

Defined in: [api/entities/CorporateAction.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L42)

Represents an action initiated by the issuer of an Asset which may affect the positions of
  the Asset Holders

#### Extends

- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase)

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/CorporateActionBase/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L85)

Asset affected by this Corporate Action

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`asset`](../wiki/api.entities.CorporateActionBase#asset)

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

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L80)

internal Corporate Action ID

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`id`](../wiki/api.entities.CorporateActionBase#id)

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

> **checkpoint**(): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `null`\>

Defined in: [api/entities/CorporateActionBase/index.ts:229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L229)

Retrieve the Checkpoint associated with this Corporate Action. If the Checkpoint is scheduled and has
  not been created yet, the corresponding CheckpointSchedule is returned instead. A null value means
  the Corporate Action was created without an associated Checkpoint

###### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `null`\>

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`checkpoint`](../wiki/api.entities.CorporateActionBase#checkpoint)

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/CorporateActionBase/index.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L218)

Determine whether this Corporate Action exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`exists`](../wiki/api.entities.CorporateActionBase#exists)

##### getDocuments()

> **getDocuments**(): `Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

Defined in: [api/entities/CorporateActionBase/index.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L167)

Retrieve the documents linked to this Corporate Action

###### Returns

`Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`getDocuments`](../wiki/api.entities.CorporateActionBase#getdocuments)

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

Defined in: [api/entities/CorporateAction.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L63)

Modify the Corporate Action's Checkpoint

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyCaCheckpointParams`](../wiki/api.procedures.types#modifycacheckpointparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`modifyCheckpoint`](../wiki/api.entities.CorporateActionBase#modifycheckpoint)

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/api.entities.CorporateActionBase#humanreadable)

Defined in: [api/entities/CorporateActionBase/index.ts:315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L315)

Return the Corporate Action's static data

###### Returns

[`HumanReadable`](../wiki/api.entities.CorporateActionBase#humanreadable)

###### Inherited from

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

### HumanReadable

Defined in: [api/entities/CorporateAction.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L19)

#### Extended by

- [`HumanReadable`](../wiki/api.entities.DividendDistribution#humanreadable)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateAction.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L21)

##### declarationDate

> **declarationDate**: `string`

Defined in: [api/entities/CorporateAction.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L22)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `string`

Defined in: [api/entities/CorporateAction.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L25)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateAction.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L23)

##### id

> **id**: `string`

Defined in: [api/entities/CorporateAction.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L20)

##### targets

> **targets**: `object`

Defined in: [api/entities/CorporateAction.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L24)

###### identities

> **identities**: `string`[]

###### treatment

> **treatment**: [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types#targettreatment)

##### taxWithholdings

> **taxWithholdings**: `object`[]

Defined in: [api/entities/CorporateAction.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L26)

###### identity

> **identity**: `string`

###### percentage

> **percentage**: `string`

***

### Params

Defined in: [api/entities/CorporateAction.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L29)

#### Properties

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/entities/CorporateAction.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L31)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber`

Defined in: [api/entities/CorporateAction.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L34)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateAction.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L32)

##### kind

> **kind**: [`CorporateActionKind`](../wiki/api.entities.CorporateActionBase.types#corporateactionkind)

Defined in: [api/entities/CorporateAction.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L30)

##### targets

> **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets)

Defined in: [api/entities/CorporateAction.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L33)

##### taxWithholdings

> **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding)[]

Defined in: [api/entities/CorporateAction.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L35)

***

### UniqueIdentifiers

Defined in: [api/entities/CorporateAction.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L14)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateAction.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L16)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateAction.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateAction.ts#L15)
