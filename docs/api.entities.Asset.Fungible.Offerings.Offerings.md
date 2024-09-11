# Class: Offerings

[api/entities/Asset/Fungible/Offerings](../wiki/api.entities.Asset.Fungible.Offerings).Offerings

Handles all Asset Offering related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Offerings`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Fungible.Offerings.Offerings#get)
- [getOne](../wiki/api.entities.Asset.Fungible.Offerings.Offerings#getone)
- [launch](../wiki/api.entities.Asset.Fungible.Offerings.Offerings#launch)

## Methods

### get

▸ **get**(`opts?`): `Promise`\<[`OfferingWithDetails`](../wiki/api.entities.types.OfferingWithDetails)[]\>

Retrieve all of the Asset's Offerings and their details. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.status?` | `Partial`\<[`OfferingStatus`](../wiki/api.entities.Offering.types.OfferingStatus)\> | status of the Offerings to fetch. If defined, only Offerings that have all passed statuses will be returned |

#### Returns

`Promise`\<[`OfferingWithDetails`](../wiki/api.entities.types.OfferingWithDetails)[]\>

#### Defined in

[api/entities/Asset/Fungible/Offerings/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Offerings/index.ts#L85)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`Offering`](../wiki/api.entities.Offering.Offering)\>

Retrieve a single Offering associated to this Asset by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`Offering`](../wiki/api.entities.Offering.Offering)\>

**`Throws`**

if there is no Offering with the passed ID

#### Defined in

[api/entities/Asset/Fungible/Offerings/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Offerings/index.ts#L60)

___

### launch

▸ **launch**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

Launch an Asset Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`LaunchOfferingParams`](../wiki/api.procedures.types.LaunchOfferingParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

**`Note`**

required roles:
  - Offering Portfolio Custodian
  - Raising Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [launch.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/Offerings/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/Offerings/index.ts#L51)
