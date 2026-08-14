[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Compliance/TrustedClaimIssuers

# api/entities/Asset/Base/Compliance/TrustedClaimIssuers

## Classes

### TrustedClaimIssuers

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L26)

Handles all Asset Default Trusted Claim Issuers related functionality

#### Extends

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)\>

#### Methods

##### add()

> **add**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L84)

Add the supplied Identities to the Asset's list of trusted claim issuers

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types#modifyassettrustedclaimissuersaddsetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [add.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

###### Call Signature

> **get**(): `Promise`\<[`TrustedClaimIssuer`](../wiki/api.entities.types#trustedclaimissuer)\<`true`\>[]\>

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L96)

Retrieve the current Default Trusted Claim Issuers of the Asset

###### Returns

`Promise`\<[`TrustedClaimIssuer`](../wiki/api.entities.types#trustedclaimissuer)\<`true`\>[]\>

Promise that resolves to the list of default trusted claim issuers

###### Call Signature

> **get**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L106)

Retrieve the current Default Trusted Claim Issuers of the Asset

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`TrustedClaimIssuer`](../wiki/api.entities.types#trustedclaimissuer)\<`true`\>[]\> | Callback function that receives trusted claim issuers updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L89)

Remove the supplied Identities from the Asset's list of trusted claim issuers   *

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyAssetTrustedClaimIssuersRemoveParams`](../wiki/api.procedures.types#modifyassettrustedclaimissuersremoveparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### set()

> **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L79)

Assign a new default list of trusted claim issuers to the Asset by replacing the existing ones with the list passed as a parameter

This requires two transactions

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types#modifyassettrustedclaimissuersaddsetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
