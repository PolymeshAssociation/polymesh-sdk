# Class: TrustedClaimIssuers

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers).TrustedClaimIssuers

Handles all Asset Default Trusted Claim Issuers related functionality

## Hierarchy

- `Namespace`\<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`TrustedClaimIssuers`**

## Table of contents

### Methods

- [add](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#add)
- [get](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#get)
- [remove](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#remove)
- [set](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#set)

## Methods

### add

▸ **add**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Add the supplied Identities to the Asset's list of trusted claim issuers

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersAddSetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [add.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L95)

___

### get

▸ **get**(): `Promise`\<[`TrustedClaimIssuer`](../wiki/api.entities.types.TrustedClaimIssuer)\<``true``\>[]\>

Retrieve the current Default Trusted Claim Issuers of the Asset

#### Returns

`Promise`\<[`TrustedClaimIssuer`](../wiki/api.entities.types.TrustedClaimIssuer)\<``true``\>[]\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L114)

▸ **get**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`TrustedClaimIssuer`](../wiki/api.entities.types.TrustedClaimIssuer)\<``true``\>[]\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L115)

___

### remove

▸ **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove the supplied Identities from the Asset's list of trusted claim issuers   *

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersRemoveParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersRemoveParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L105)

___

### set

▸ **set**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Assign a new default list of trusted claim issuers to the Asset by replacing the existing ones with the list passed as a parameter

This requires two transactions

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersAddSetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Base/Compliance/TrustedClaimIssuers.ts#L85)
