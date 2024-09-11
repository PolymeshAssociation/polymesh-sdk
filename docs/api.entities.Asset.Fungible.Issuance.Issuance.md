# Class: Issuance

[api/entities/Asset/Fungible/Issuance](../wiki/api.entities.Asset.Fungible.Issuance).Issuance

Handles all Asset Issuance related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Issuance`**

## Table of contents

### Methods

- [issue](../wiki/api.entities.Asset.Fungible.Issuance.Issuance#issue)

## Methods

### issue

▸ **issue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Issue a certain amount of Asset tokens to the caller's default portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IssueTokensParams`](../wiki/api.procedures.types.IssueTokensParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [issue.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/Issuance/index.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Issuance/index.ts#L30)
