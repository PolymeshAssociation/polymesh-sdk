[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CorporateActionBase

# api/entities/CorporateActionBase

## Classes

### `abstract` CorporateActionBase

Defined in: [api/entities/CorporateActionBase/index.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L66)

Represents an action initiated by the issuer of an Asset which may affect the positions of
  the Asset Holders

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `unknown`\>

#### Extended by

- [`CorporateAction`](../wiki/api.entities.CorporateAction#corporateaction)
- [`CorporateBallot`](../wiki/api.entities.CorporateBallot#corporateballot)
- [`DividendDistribution`](../wiki/api.entities.DividendDistribution#dividenddistribution)

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/CorporateActionBase/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L85)

Asset affected by this Corporate Action

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/entities/CorporateActionBase/index.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L90)

date at which the Corporate Action was created

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L106)

default percentage (0-100) of tax withholding for this Corporate Action

##### description

> **description**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L95)

brief text description of the Corporate Action

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L80)

internal Corporate Action ID

##### targets

> **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets)

Defined in: [api/entities/CorporateActionBase/index.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L101)

Asset Holder Identities related to this Corporate action. If the treatment is `Exclude`, the Identities
  in the array will not be targeted by the Action, Identities not in the array will be targeted, and vice versa

##### taxWithholdings

> **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding)[]

Defined in: [api/entities/CorporateActionBase/index.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L112)

percentage (0-100) of tax withholding per Identity. Any Identity not present
  in this array uses the default tax withholding percentage

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### checkpoint()

> **checkpoint**(): `Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `null`\>

Defined in: [api/entities/CorporateActionBase/index.ts:229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L229)

Retrieve the Checkpoint associated with this Corporate Action. If the Checkpoint is scheduled and has
  not been created yet, the corresponding CheckpointSchedule is returned instead. A null value means
  the Corporate Action was created without an associated Checkpoint

###### Returns

`Promise`\<[`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint) \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule) \| `null`\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/CorporateActionBase/index.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L218)

Determine whether this Corporate Action exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getDocuments()

> **getDocuments**(): `Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

Defined in: [api/entities/CorporateActionBase/index.ts:167](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L167)

Retrieve the documents linked to this Corporate Action

###### Returns

`Promise`\<[`AssetDocumentWithId`](../wiki/api.entities.Asset.types#assetdocumentwithid)[]\>

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

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

##### modifyCheckpoint()

> `abstract` **modifyCheckpoint**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/CorporateActionBase/index.ts:205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L205)

Modify the Corporate Action's Checkpoint

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`Modify`](../wiki/types.utils#modify)\<[`ModifyCaCheckpointParams`](../wiki/api.procedures.types#modifycacheckpointparams), \{ `checkpoint`: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint); \}\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/CorporateActionBase/index.ts:315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L315)

Return the Corporate Action's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### HumanReadable

Defined in: [api/entities/CorporateActionBase/index.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L43)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L45)

##### declarationDate

> **declarationDate**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L46)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L49)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L47)

##### id

> **id**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L44)

##### targets

> **targets**: `object`

Defined in: [api/entities/CorporateActionBase/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L48)

###### identities

> **identities**: `string`[]

###### treatment

> **treatment**: [`TargetTreatment`](../wiki/api.entities.CorporateActionBase.types#targettreatment)

##### taxWithholdings

> **taxWithholdings**: `object`[]

Defined in: [api/entities/CorporateActionBase/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L50)

###### identity

> **identity**: `string`

###### percentage

> **percentage**: `string`

***

### Params

Defined in: [api/entities/CorporateActionBase/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L53)

#### Properties

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/entities/CorporateActionBase/index.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L55)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L58)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L56)

##### kind

> **kind**: [`CorporateActionKind`](../wiki/api.entities.CorporateActionBase.types#corporateactionkind)

Defined in: [api/entities/CorporateActionBase/index.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L54)

##### targets

> **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets)

Defined in: [api/entities/CorporateActionBase/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L57)

##### taxWithholdings

> **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding)[]

Defined in: [api/entities/CorporateActionBase/index.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L59)

***

### UniqueIdentifiers

Defined in: [api/entities/CorporateActionBase/index.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L38)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateActionBase/index.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L40)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateActionBase/index.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L39)
