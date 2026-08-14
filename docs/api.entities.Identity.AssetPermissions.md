[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Identity/AssetPermissions

# api/entities/Identity/AssetPermissions

## Classes

### AssetPermissions

Defined in: [api/entities/Identity/AssetPermissions.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L82)

Handles all Asset Permissions (External Agents) related functionality on the Identity side

#### Extends

- `Namespace`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

#### Methods

##### checkPermissions()

> **checkPermissions**(`args`): `Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Identity`](../wiki/api.entities.types#identity-1)\>\>

Defined in: [api/entities/Identity/AssetPermissions.ts:135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L135)

Check whether this Identity has specific transaction Permissions over an Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `asset`: `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset); `transactions`: `TxTag`[] \| `null`; \} |
| `args.asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |
| `args.transactions` | `TxTag`[] \| `null` |

###### Returns

`Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Identity`](../wiki/api.entities.types#identity-1)\>\>

##### enabledAt()

> **enabledAt**(`__namedParameters`): `Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

Defined in: [api/entities/Identity/AssetPermissions.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L326)

Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Identity was enabled/added as
  an Agent with permissions over a specific Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `asset`: `string` \| [`Asset`](../wiki/api.entities.Asset.types#asset-3); \} |
| `__namedParameters.asset` | `string` \| [`Asset`](../wiki/api.entities.Asset.types#asset-3) |

###### Returns

`Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

###### Note

uses the middlewareV2

###### Note

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

##### get()

> **get**(): `Promise`\<[`AssetWithGroup`](../wiki/api.entities.Asset.types#assetwithgroup)[]\>

Defined in: [api/entities/Identity/AssetPermissions.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L103)

Retrieve all the Assets over which this Identity has permissions, with the corresponding Permission Group

###### Returns

`Promise`\<[`AssetWithGroup`](../wiki/api.entities.Asset.types#assetwithgroup)[]\>

##### getGroup()

> **getGroup**(`__namedParameters`): `Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>

Defined in: [api/entities/Identity/AssetPermissions.ts:285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L285)

Retrieve this Identity's Permission Group for a specific Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `__namedParameters` | \{ `asset`: `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset); \} |
| `__namedParameters.asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |

###### Returns

`Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>

##### getOperationHistory()

> **getOperationHistory**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier)\>\>

Defined in: [api/entities/Identity/AssetPermissions.ts:370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L370)

Retrieve all Events triggered by Operations this Identity has performed on a specific Asset

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `asset`: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset); `eventId?`: [`EventIdEnum`](../wiki/types#eventidenum); `moduleId?`: [`ModuleIdEnum`](../wiki/types#moduleidenum); `size?`: `BigNumber`; `start?`: `BigNumber`; \} | - |
| `opts.asset` | `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset) | - |
| `opts.eventId?` | [`EventIdEnum`](../wiki/types#eventidenum) | filters results by event |
| `opts.moduleId?` | [`ModuleIdEnum`](../wiki/types#moduleidenum) | filters results by module |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier)\>\>

###### Note

uses the middlewareV2

###### Note

supports pagination

##### setGroup()

> **setGroup**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>\>

Defined in: [api/entities/Identity/AssetPermissions.ts:354](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L354)

Assign this Identity to a different Permission Group for a given Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetPermissionGroupParams`](../wiki/api.procedures.types#setpermissiongroupparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setGroup.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### waive()

> **waive**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/AssetPermissions.ts:349](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/AssetPermissions.ts#L349)

Abdicate from the current Permissions Group for a given Asset. This means that this Identity will no longer have any permissions over said Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`WaivePermissionsParams`](../wiki/api.procedures.types#waivepermissionsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [waive.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
