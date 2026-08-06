[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Compliance/Requirements

# api/entities/Asset/Base/Compliance/Requirements

## Classes

### Requirements

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L39)

Handles all Asset Compliance Requirements related functionality

#### Extends

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)\>

#### Methods

##### add()

> **add**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L88)

Add a new compliance requirement to the the Asset. This doesn't modify existing requirements

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddAssetRequirementParams`](../wiki/api.procedures.types#addassetrequirementparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [add.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### arePaused()

> **arePaused**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L197)

Check whether Asset compliance requirements are paused or not

###### Returns

`Promise`\<`boolean`\>

##### get()

###### Call Signature

> **get**(): `Promise`\<[`ComplianceRequirements`](../wiki/api.entities.types#compliancerequirements-1)\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L108)

Retrieve all of the Asset's compliance requirements, together with the Default Trusted Claim Issuers

###### Returns

`Promise`\<[`ComplianceRequirements`](../wiki/api.entities.types#compliancerequirements-1)\>

Promise that resolves to the compliance requirements and trusted claim issuers

###### Call Signature

> **get**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L118)

Retrieve all of the Asset's compliance requirements, together with the Default Trusted Claim Issuers

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`ComplianceRequirements`](../wiki/api.entities.types#compliancerequirements-1)\> | Callback function that receives compliance requirements updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### modify()

> **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L218)

Modify a compliance requirement for the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyComplianceRequirementParams`](../wiki/api.procedures.types#modifycompliancerequirementparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### pause()

> **pause**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L187)

Pause all the Asset's requirements. This means that all transfers will be allowed until requirements are unpaused

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [pause.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L93)

Remove an existing compliance requirement from the Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveAssetRequirementParams`](../wiki/api.procedures.types#removeassetrequirementparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### reset()

> **reset**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L182)

Delete all the current requirements for the Asset.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [reset.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### set()

> **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L101)

Configure compliance requirements for the Asset. This operation will replace all existing requirements with a new requirement set

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetAssetRequirementsParams`](../wiki/api.procedures.types#setassetrequirementsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Example

```ts
Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
```

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### unpause()

> **unpause**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/Requirements.ts:192](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Compliance/Requirements.ts#L192)

Un-pause all the Asset's current requirements

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unpause.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it
