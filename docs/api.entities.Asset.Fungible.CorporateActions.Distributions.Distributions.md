# Class: Distributions

[api/entities/Asset/Fungible/CorporateActions/Distributions](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions).Distributions

Handles all Asset Distributions related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Distributions`**

## Table of contents

### Methods

- [configureDividendDistribution](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions.Distributions#configuredividenddistribution)
- [get](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions.Distributions#get)
- [getOne](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions.Distributions#getone)

## Methods

### configureDividendDistribution

▸ **configureDividendDistribution**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`DividendDistribution`](../wiki/api.entities.DividendDistribution.DividendDistribution), [`DividendDistribution`](../wiki/api.entities.DividendDistribution.DividendDistribution)\>\>

Create a Dividend Distribution for a subset of the Asset Holders at a certain (existing or future) Checkpoint

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ConfigureDividendDistributionParams`](../wiki/api.procedures.types.ConfigureDividendDistributionParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`DividendDistribution`](../wiki/api.entities.DividendDistribution.DividendDistribution), [`DividendDistribution`](../wiki/api.entities.DividendDistribution.DividendDistribution)\>\>

**`Note`**

required role:
  - Origin Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [configureDividendDistribution.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Distributions.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L42)

___

### get

▸ **get**(): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)[]\>

Retrieve all Dividend Distributions associated to this Asset, along with their details

#### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)[]\>

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Distributions.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L117)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)\>

Retrieve a single Dividend Distribution associated to this Asset by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)\>

**`Throws`**

if there is no Distribution with the passed ID

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Distributions.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L65)
