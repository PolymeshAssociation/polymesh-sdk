[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Offerings

# api/entities/Asset/Fungible/Offerings

## Classes

### Offerings

Defined in: [api/entities/Asset/Fungible/Offerings/index.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Offerings/index.ts#L29)

Handles all Asset Offering related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### get()

> **get**(`opts?`): `Promise`\<[`OfferingWithDetails`](../wiki/api.entities.types#offeringwithdetails)[]\>

Defined in: [api/entities/Asset/Fungible/Offerings/index.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Offerings/index.ts#L78)

Retrieve all of the Asset's Offerings and their details. Can be filtered using parameters

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `status?`: `Partial`\<[`OfferingStatus`](../wiki/api.entities.Offering.types#offeringstatus)\>; \} | - |
| `opts.status?` | `Partial`\<[`OfferingStatus`](../wiki/api.entities.Offering.types#offeringstatus)\> | status of the Offerings to fetch. If defined, only Offerings that have all passed statuses will be returned |

###### Returns

`Promise`\<[`OfferingWithDetails`](../wiki/api.entities.types#offeringwithdetails)[]\>

##### getOne()

> **getOne**(`args`): `Promise`\<[`Offering`](../wiki/api.entities.Offering#offering)\>

Defined in: [api/entities/Asset/Fungible/Offerings/index.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Offerings/index.ts#L56)

Retrieve a single Offering associated to this Asset by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`Offering`](../wiki/api.entities.Offering#offering)\>

###### Throws

if there is no Offering with the passed ID

##### launch()

> **launch**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering#offering), [`Offering`](../wiki/api.entities.Offering#offering)\>\>

Defined in: [api/entities/Asset/Fungible/Offerings/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Offerings/index.ts#L49)

Launch an Asset Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`LaunchOfferingParams`](../wiki/api.procedures.types#launchofferingparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering#offering), [`Offering`](../wiki/api.entities.Offering#offering)\>\>

###### Note

required roles:
  - Offering Portfolio Custodian
  - Raising Portfolio Custodian

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [launch.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
