# Class: Offerings

[api/entities/Asset/Offerings](../wiki/api.entities.Asset.Offerings).Offerings

Handles all Asset Offering related functionality

## Hierarchy

- `Namespace`<[`Asset`](../wiki/api.entities.Asset.Asset)\>

  ↳ **`Offerings`**

## Table of contents

### Methods

- [get](../wiki/api.entities.Asset.Offerings.Offerings#get)
- [getOne](../wiki/api.entities.Asset.Offerings.Offerings#getone)
- [launch](../wiki/api.entities.Asset.Offerings.Offerings#launch)

## Methods

### get

▸ **get**(`opts?`): `Promise`<[`OfferingWithDetails`](../wiki/types.OfferingWithDetails)[]\>

Retrieve all of the Asset's Offerings and their details. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.status?` | `Partial`<[`OfferingStatus`](../wiki/api.entities.Offering.types.OfferingStatus)\> | status of the Offerings to fetch. If defined, only Offerings that have all passed statuses will be returned |

#### Returns

`Promise`<[`OfferingWithDetails`](../wiki/types.OfferingWithDetails)[]\>

___

### getOne

▸ **getOne**(`args`): `Promise`<[`Offering`](../wiki/api.entities.Offering.Offering)\>

Retrieve a single Offering associated to this Asset by its ID

**`Throws`**

 if there is no Offering with the passed ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`Offering`](../wiki/api.entities.Offering.Offering)\>

___

### launch

▸ **launch**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

Launch an Asset Offering

**`Note`**

 required roles:
  - Offering Portfolio Custodian
  - Raising Portfolio Custodian

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [launch.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`LaunchOfferingParams`](../wiki/api.procedures.types.LaunchOfferingParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>
