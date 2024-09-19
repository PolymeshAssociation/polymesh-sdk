# Class: AssetPermissions

[api/entities/Identity/AssetPermissions](../wiki/api.entities.Identity.AssetPermissions).AssetPermissions

Handles all Asset Permissions (External Agents) related functionality on the Identity side

## Hierarchy

- `Namespace`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

  ↳ **`AssetPermissions`**

## Table of contents

### Methods

- [checkPermissions](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#checkpermissions)
- [enabledAt](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#enabledat)
- [get](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#get)
- [getGroup](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#getgroup)
- [getOperationHistory](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#getoperationhistory)
- [setGroup](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#setgroup)
- [waive](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions#waive)

## Methods

### checkPermissions

▸ **checkPermissions**(`args`): `Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Identity`](../wiki/api.entities.types.SignerType#identity)\>\>

Check whether this Identity has specific transaction Permissions over an Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset) |
| `args.transactions` | ``null`` \| [`TxTag`](../wiki/generated.types#txtag)[] |

#### Returns

`Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Identity`](../wiki/api.entities.types.SignerType#identity)\>\>

#### Defined in

[api/entities/Identity/AssetPermissions.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L133)

___

### enabledAt

▸ **enabledAt**(`«destructured»`): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Identity was enabled/added as
  an Agent with permissions over a specific Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `asset` | `string` \| [`Asset`](../wiki/api.entities.Asset.types#asset) |

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/Identity/AssetPermissions.ts:323](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L323)

___

### get

▸ **get**(): `Promise`\<[`AssetWithGroup`](../wiki/api.entities.Asset.types.AssetWithGroup)[]\>

Retrieve all the Assets over which this Identity has permissions, with the corresponding Permission Group

#### Returns

`Promise`\<[`AssetWithGroup`](../wiki/api.entities.Asset.types.AssetWithGroup)[]\>

#### Defined in

[api/entities/Identity/AssetPermissions.ts:104](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L104)

___

### getGroup

▸ **getGroup**(`«destructured»`): `Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>

Retrieve this Identity's Permission Group for a specific Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset) |

#### Returns

`Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>

#### Defined in

[api/entities/Identity/AssetPermissions.ts:283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L283)

___

### getOperationHistory

▸ **getOperationHistory**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>\>

Retrieve all Events triggered by Operations this Identity has performed on a specific Asset

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.asset` | `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset) | - |
| `opts.eventId?` | [`EventIdEnum`](../wiki/types.EventIdEnum) | filters results by event |
| `opts.moduleId?` | [`ModuleIdEnum`](../wiki/types.ModuleIdEnum) | filters results by module |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>\>

**`Note`**

uses the middlewareV2

**`Note`**

supports pagination

#### Defined in

[api/entities/Identity/AssetPermissions.ts:374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L374)

___

### setGroup

▸ **setGroup**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>\>

Assign this Identity to a different Permission Group for a given Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetPermissionGroupParams`](../wiki/api.procedures.types.SetPermissionGroupParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setGroup.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Identity/AssetPermissions.ts:359](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L359)

___

### waive

▸ **waive**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Abdicate from the current Permissions Group for a given Asset. This means that this Identity will no longer have any permissions over said Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`WaivePermissionsParams`](../wiki/api.procedures.types.WaivePermissionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [waive.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Identity/AssetPermissions.ts:349](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Identity/AssetPermissions.ts#L349)
