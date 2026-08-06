[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/CorporateActions/Distributions

# api/entities/Asset/Fungible/CorporateActions/Distributions

## Classes

### Distributions

Defined in: [api/entities/Asset/Fungible/CorporateActions/Distributions.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L31)

Handles all Asset Distributions related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### configureDividendDistribution()

> **configureDividendDistribution**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`DividendDistribution`](../wiki/api.entities.DividendDistribution#dividenddistribution), [`DividendDistribution`](../wiki/api.entities.DividendDistribution#dividenddistribution)\>\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Distributions.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L38)

Create a Dividend Distribution for a subset of the Asset Holders at a certain (existing or future) Checkpoint

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ConfigureDividendDistributionParams`](../wiki/api.procedures.types#configuredividenddistributionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`DividendDistribution`](../wiki/api.entities.DividendDistribution#dividenddistribution), [`DividendDistribution`](../wiki/api.entities.DividendDistribution#dividenddistribution)\>\>

###### Note

required role:
  - Origin Portfolio Custodian

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [configureDividendDistribution.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Distributions.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L113)

Retrieve all Dividend Distributions associated to this Asset, along with their details

###### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

##### getOne()

> **getOne**(`args`): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Distributions.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/Distributions.ts#L60)

Retrieve a single Dividend Distribution associated to this Asset by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)\>

###### Throws

if there is no Distribution with the passed ID
