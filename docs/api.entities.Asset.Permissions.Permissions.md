# Class: Permissions

[api/entities/Asset/Permissions](../wiki/api.entities.Asset.Permissions).Permissions

Handles all Asset Permissions related functionality

## Hierarchy

- `Namespace`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

  ↳ **`Permissions`**

## Table of contents

### Methods

- [createGroup](../wiki/api.entities.Asset.Permissions.Permissions#creategroup)
- [getAgents](../wiki/api.entities.Asset.Permissions.Permissions#getagents)
- [getGroup](../wiki/api.entities.Asset.Permissions.Permissions#getgroup)
- [getGroups](../wiki/api.entities.Asset.Permissions.Permissions#getgroups)
- [inviteAgent](../wiki/api.entities.Asset.Permissions.Permissions#inviteagent)
- [removeAgent](../wiki/api.entities.Asset.Permissions.Permissions#removeagent)

## Methods

### createGroup

▸ **createGroup**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)\>\>

Create a Permission Group for this Asset. Identities can be assigned to Permission Groups as agents. Agents assigned to a Permission Group have said group's permissions over the Asset

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createGroup.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateGroupParams`](../wiki/api.procedures.types.CreateGroupParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup), [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)\>\>

___

### getAgents

▸ **getAgents**(): `Promise`<[`AgentWithGroup`](../wiki/api.entities.Asset.types.AgentWithGroup)[]\>

Retrieve a list of agents (Identities which have permissions over the Asset) and
  their respective Permission Groups

#### Returns

`Promise`<[`AgentWithGroup`](../wiki/api.entities.Asset.types.AgentWithGroup)[]\>

___

### getGroup

▸ **getGroup**(`args`): `Promise`<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)\>

Retrieve a single Permission Group by its ID (or type). Passing an ID will fetch a Custom Permission Group,
  while passing a type will fetch a Known Permission Group

**`Throws`**

 if there is no Permission Group with the passed ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)\>

▸ **getGroup**(`args`): `Promise`<[`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.type` | [`PermissionGroupType`](../wiki/types.PermissionGroupType) |

#### Returns

`Promise`<[`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)\>

___

### getGroups

▸ **getGroups**(): `Promise`<[`PermissionGroups`](../wiki/types.PermissionGroups)\>

Retrieve all Permission Groups of this Asset

#### Returns

`Promise`<[`PermissionGroups`](../wiki/types.PermissionGroups)\>

___

### inviteAgent

▸ **inviteAgent**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Invite an Identity to be an agent with permissions over this Asset

**`Note`**

 this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [inviteAgent.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InviteExternalAgentParams`](../wiki/api.procedures.types.InviteExternalAgentParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

___

### removeAgent

▸ **removeAgent**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Revoke an agent's permissions over this Asset

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [removeAgent.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveExternalAgentParams`](../wiki/api.procedures.types.RemoveExternalAgentParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
