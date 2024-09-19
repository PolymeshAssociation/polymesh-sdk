# Class: Requirements

[api/entities/Asset/Base/Compliance/Requirements](../wiki/api.entities.Asset.Base.Compliance.Requirements).Requirements

Handles all Asset Compliance Requirements related functionality

## Hierarchy

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`Requirements`**

## Table of contents

### Methods

- [add](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#add)
- [arePaused](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#arepaused)
- [get](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#get)
- [modify](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#modify)
- [pause](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#pause)
- [remove](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#remove)
- [reset](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#reset)
- [set](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#set)
- [unpause](../wiki/api.entities.Asset.Base.Compliance.Requirements.Requirements#unpause)

## Methods

### add

▸ **add**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Add a new compliance requirement to the the Asset. This doesn't modify existing requirements

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddAssetRequirementParams`](../wiki/api.procedures.types.AddAssetRequirementParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [add.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L94)

___

### arePaused

▸ **arePaused**(): `Promise`\<`boolean`\>

Check whether Asset compliance requirements are paused or not

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L221)

___

### get

▸ **get**(): `Promise`\<[`ComplianceRequirements`](../wiki/api.entities.types.ComplianceRequirements)\>

Retrieve all of the Asset's compliance requirements, together with the Default Trusted Claim Issuers

#### Returns

`Promise`\<[`ComplianceRequirements`](../wiki/api.entities.types.ComplianceRequirements)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L126)

▸ **get**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`ComplianceRequirements`](../wiki/api.entities.types.ComplianceRequirements)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L127)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify a compliance requirement for the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyComplianceRequirementParams`](../wiki/api.procedures.types#modifycompliancerequirementparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L245)

___

### pause

▸ **pause**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Pause all the Asset's requirements. This means that all transfers will be allowed until requirements are unpaused

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [pause.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L204)

___

### remove

▸ **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove an existing compliance requirement from the Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveAssetRequirementParams`](../wiki/api.procedures.types.RemoveAssetRequirementParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L104)

___

### reset

▸ **reset**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Delete all the current requirements for the Asset.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [reset.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L194)

___

### set

▸ **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Configure compliance requirements for the Asset. This operation will replace all existing requirements with a new requirement set

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetAssetRequirementsParams`](../wiki/api.procedures.types.SetAssetRequirementsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Example`**

```ts
Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
```

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L117)

___

### unpause

▸ **unpause**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Un-pause all the Asset's current requirements

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [unpause.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/Requirements.ts:214](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/Requirements.ts#L214)
