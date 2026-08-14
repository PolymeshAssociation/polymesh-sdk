[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CorporateBallot

# api/entities/CorporateBallot

## Classes

### CorporateBallot

Defined in: [api/entities/CorporateBallot/index.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L69)

Represents a Ballot

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

##### details()

> **details**(): `Promise`\<[`CorporateBallotDetails`](../wiki/api.entities.CorporateBallot.types#corporateballotdetails)\>

Defined in: [api/entities/CorporateBallot/index.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L136)

Retrieve details associated with this Ballot

###### Returns

`Promise`\<[`CorporateBallotDetails`](../wiki/api.entities.CorporateBallot.types#corporateballotdetails)\>

###### Throws

if the Ballot does not exist

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/CorporateBallot/index.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L115)

Determine whether this Ballot exists on chain

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

Defined in: [api/entities/CorporateBallot/index.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L326)

Modify the Corporate Ballot's Record Date

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `checkpoint`: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint); \} |
| `args.checkpoint` | [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Overrides

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`modifyCheckpoint`](../wiki/api.entities.CorporateActionBase#modifycheckpoint)

##### remove()

> **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/CorporateBallot/index.ts:308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L308)

Remove the Ballot

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

deletes the corporate action with the associated ballot if ballot has not started

###### Throws

if ballot has already started

###### Throws

if ballot is not found

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### results()

> **results**(): `Promise`\<[`CorporateBallotMetaWithResults`](../wiki/api.entities.CorporateBallot.types#corporateballotmetawithresults)\>

Defined in: [api/entities/CorporateBallot/index.ts:173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L173)

Retrieve the results of the Ballot

###### Returns

`Promise`\<[`CorporateBallotMetaWithResults`](../wiki/api.entities.CorporateBallot.types#corporateballotmetawithresults)\>

###### Throws

if the Ballot does not exist

##### status()

> **status**(): `Promise`\<[`CorporateBallotStatus`](../wiki/api.entities.CorporateBallot.types#corporateballotstatus)\>

Defined in: [api/entities/CorporateBallot/index.ts:147](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L147)

Return the status of the Ballot

###### Returns

`Promise`\<[`CorporateBallotStatus`](../wiki/api.entities.CorporateBallot.types#corporateballotstatus)\>

###### Throws

if the Ballot does not exist

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/api.entities.CorporateActionBase#humanreadable)

Defined in: [api/entities/CorporateActionBase/index.ts:315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateActionBase/index.ts#L315)

Return the Corporate Action's static data

###### Returns

[`HumanReadable`](../wiki/api.entities.CorporateActionBase#humanreadable)

###### Inherited from

[`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase).[`toHuman`](../wiki/api.entities.CorporateActionBase#tohuman)

##### vote()

> **vote**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/CorporateBallot/index.ts:321](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L321)

Cast a vote on the Ballot

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CastBallotVoteParams`](../wiki/api.procedures.types#castballotvoteparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if the Ballot does not exist

###### Throws

if the Ballot voting is not active

###### Throws

if the number of votes does not match the sum of all choices of all motions

###### Throws

if fallback votes are provided for a non-RCV Ballot

###### Throws

if vote does not point to the correct choice in motion

###### Throws

if the fallback vote is the same as the choice

###### Throws

if the fallback vote is not pointing to a choice in the motion

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [vote.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### votesByIdentity()

> **votesByIdentity**(`did`): `Promise`\<[`CorporateBallotWithParticipation`](../wiki/api.entities.CorporateBallot.types#corporateballotwithparticipation)\>

Defined in: [api/entities/CorporateBallot/index.ts:234](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L234)

Retrieve the participation of the Ballot

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `did` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) |

###### Returns

`Promise`\<[`CorporateBallotWithParticipation`](../wiki/api.entities.CorporateBallot.types#corporateballotwithparticipation)\>

###### Throws

if the Ballot does not exist

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

Defined in: [api/entities/CorporateBallot/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L53)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateBallot/index.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L55)

##### id

> **id**: `string`

Defined in: [api/entities/CorporateBallot/index.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L54)

***

### Params

Defined in: [api/entities/CorporateBallot/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L57)

#### Properties

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/entities/CorporateBallot/index.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L59)

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber`

Defined in: [api/entities/CorporateBallot/index.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L62)

##### description

> **description**: `string`

Defined in: [api/entities/CorporateBallot/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L60)

##### kind

> **kind**: [`CorporateActionKind`](../wiki/api.entities.CorporateActionBase.types#corporateactionkind)

Defined in: [api/entities/CorporateBallot/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L58)

##### targets

> **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets)

Defined in: [api/entities/CorporateBallot/index.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L61)

##### taxWithholdings

> **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding)[]

Defined in: [api/entities/CorporateBallot/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L63)

***

### UniqueIdentifiers

Defined in: [api/entities/CorporateBallot/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L48)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/CorporateBallot/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L50)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/CorporateBallot/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/index.ts#L49)
