[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Identity/Portfolios

# api/entities/Identity/Portfolios

## Classes

### Portfolios

Defined in: [api/entities/Identity/Portfolios.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L35)

Handles all Portfolio related functionality on the Identity side

#### Extends

- `Namespace`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

#### Methods

##### delete()

> **delete**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/Portfolios.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L224)

Delete a Portfolio by ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `portfolio`: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio); \} | - |
| `args.portfolio` | `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio) | Portfolio instance or portfolio ID to delete |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) | - |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

The calling Identity must be the custodian of the Portfolio

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [delete.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getCustodiedPortfolios()

> **getCustodiedPortfolios**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>\>

Defined in: [api/entities/Identity/Portfolios.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L96)

Retrieve all Portfolios custodied by this Identity.
This only includes portfolios owned by a different Identity but custodied by this one.
To fetch Portfolios owned by this Identity, use [getPortfolios](../wiki/#getportfolios)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) | Optional pagination options |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>\>

A ResultSet of portfolios (Default or Numbered) and pagination metadata

###### Note

supports pagination

##### getPortfolio()

###### Call Signature

> **getPortfolio**(): `Promise`\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio)\>

Defined in: [api/entities/Identity/Portfolios.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L143)

Retrieve the Default Portfolio for this Identity

###### Returns

`Promise`\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio)\>

Promise that resolves to the Default Portfolio

###### Call Signature

> **getPortfolio**(`args`): `Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>

Defined in: [api/entities/Identity/Portfolios.ts:151](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L151)

Retrieve a Numbered Portfolio by its ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `portfolioId`: `BigNumber`; \} | - |
| `args.portfolioId` | `BigNumber` | ID of the Portfolio to retrieve |

###### Returns

`Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>

Promise that resolves to the requested Numbered Portfolio

##### getPortfolioByName()

> **getPortfolioByName**(`args`): `Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>

Defined in: [api/entities/Identity/Portfolios.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L188)

Retrieve a Numbered Portfolio by its name

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `name`: `string`; \} | - |
| `args.name` | `string` | Name of the Portfolio to fetch |

###### Returns

`Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\>

Promise that resolves to the Portfolio with the given name

###### Throws

if no Portfolio exists with the given name

##### getPortfolios()

> **getPortfolios**(): `Promise`\<\[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio), `...NumberedPortfolio[]`\]\>

Defined in: [api/entities/Identity/Portfolios.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L62)

Retrieve all the Portfolios owned by this Identity

###### Returns

`Promise`\<\[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio), `...NumberedPortfolio[]`\]\>

An array where the first item is always the Default Portfolio, followed by any Numbered Portfolios owned by this Identity

##### getTransactionHistory()

> **getTransactionHistory**(`filters?`): `Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types#historicsettlement)[]\>

Defined in: [api/entities/Identity/Portfolios.ts:236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/Portfolios.ts#L236)

Retrieve a list of transactions where this identity was involved. Can be filtered using parameters

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filters` | \{ `account?`: `string`; `assetId?`: `string`; `ticker?`: `string`; \} | - |
| `filters.account?` | `string` | Account involved in the settlement |
| `filters.assetId?` | `string` | Asset ID to filter by (overrides ticker if both provided) |
| `filters.ticker?` | `string` | ticker involved in the transaction |

###### Returns

`Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types#historicsettlement)[]\>

Promise that resolves to an array of historical settlements

###### Note

uses the middlewareV2
