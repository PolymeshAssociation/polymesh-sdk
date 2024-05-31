# Class: TrustedClaimIssuers

[api/entities/Asset/Base/Compliance/TrustedClaimIssuers](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers).TrustedClaimIssuers

Handles all Asset Default Trusted Claim Issuers related functionality

## Hierarchy

- `Namespace`<[`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)\>

  ↳ **`TrustedClaimIssuers`**

## Table of contents

### Methods

- [add](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#add)
- [get](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#get)
- [remove](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#remove)
- [set](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers.TrustedClaimIssuers#set)

## Methods

### add

▸ **add**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Add the supplied Identities to the Asset's list of trusted claim issuers

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [add.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersAddSetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### get

▸ **get**(): `Promise`<[`TrustedClaimIssuer`](../wiki/types.TrustedClaimIssuer)<``true``\>[]\>

Retrieve the current Default Trusted Claim Issuers of the Asset

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`TrustedClaimIssuer`](../wiki/types.TrustedClaimIssuer)<``true``\>[]\>

▸ **get**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`TrustedClaimIssuer`](../wiki/types.TrustedClaimIssuer)<``true``\>[]\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### remove

▸ **remove**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Remove the supplied Identities from the Asset's list of trusted claim issuers   *

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersRemoveParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersRemoveParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### set

▸ **set**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Assign a new default list of trusted claim issuers to the Asset by replacing the existing ones with the list passed as a parameter

This requires two transactions

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [set.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyAssetTrustedClaimIssuersAddSetParams`](../wiki/api.procedures.types.ModifyAssetTrustedClaimIssuersAddSetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
