[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Permissions

# api/entities/Asset/Base/Permissions

## Classes

### Permissions

Defined in: [api/entities/Asset/Base/Permissions/index.ts:37](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L37)

Handles all Asset Permissions related functionality

#### Extends

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)\>

#### Methods

##### createGroup()

> **createGroup**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup)\>\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L63)

Create a Permission Group for this Asset. Identities can be assigned to Permission Groups as agents. Agents assigned to a Permission Group have said group's permissions over the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateGroupParams`](../wiki/api.procedures.types#creategroupparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createGroup.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getAgents()

> **getAgents**(): `Promise`\<[`AgentWithGroup`](../wiki/api.entities.Asset.types#agentwithgroup)[]\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:163](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L163)

Retrieve a list of agents (Identities which have permissions over the Asset) and
  their respective Permission Groups

###### Returns

`Promise`\<[`AgentWithGroup`](../wiki/api.entities.Asset.types#agentwithgroup)[]\>

##### getGroup()

###### Call Signature

> **getGroup**(`args`): `Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup)\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L88)

Retrieve a Custom Permission Group by its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} | - |
| `args.id` | `BigNumber` | Permission Group identifier |

###### Returns

`Promise`\<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup)\>

Promise that resolves to the Custom Permission Group

###### Throws

if there is no Permission Group with the passed ID

###### Call Signature

> **getGroup**(`args`): `Promise`\<[`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L97)

Retrieve a Known Permission Group by its type

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `type`: [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype); \} | - |
| `args.type` | [`PermissionGroupType`](../wiki/api.entities.types#permissiongrouptype) | The Known Permission Group type |

###### Returns

`Promise`\<[`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup)\>

Promise that resolves to the Known Permission Group

##### getGroups()

> **getGroups**(): `Promise`\<[`PermissionGroups`](../wiki/api.entities.types#permissiongroups)\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L126)

Retrieve all Permission Groups of this Asset

###### Returns

`Promise`\<[`PermissionGroups`](../wiki/api.entities.types#permissiongroups)\>

##### inviteAgent()

> **inviteAgent**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L72)

Invite an Identity to be an agent with permissions over this Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`InviteExternalAgentParams`](../wiki/api.procedures.types#inviteexternalagentparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [inviteAgent.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### removeAgent()

> **removeAgent**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Permissions/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Permissions/index.ts#L77)

Revoke an agent's permissions over this Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveExternalAgentParams`](../wiki/api.procedures.types#removeexternalagentparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeAgent.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
