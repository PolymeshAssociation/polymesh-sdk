# Class: Portfolios

[api/entities/Identity/Portfolios](../wiki/api.entities.Identity.Portfolios).Portfolios

Handles all Portfolio related functionality on the Identity side

## Hierarchy

- `Namespace`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

  ↳ **`Portfolios`**

## Table of contents

### Methods

- [delete](../wiki/api.entities.Identity.Portfolios.Portfolios#delete)
- [getCustodiedPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getcustodiedportfolios)
- [getPortfolio](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolio)
- [getPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolios)
- [getTransactionHistory](../wiki/api.entities.Identity.Portfolios.Portfolios#gettransactionhistory)

## Methods

### delete

▸ **delete**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Delete a Portfolio by ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.portfolio` | `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [delete.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Identity/Portfolios.ts:178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L178)

___

### getCustodiedPortfolios

▸ **getCustodiedPortfolios**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>\>

Retrieve all Portfolios custodied by this Identity.
  This only includes portfolios owned by a different Identity but custodied by this one.
  To fetch Portfolios owned by this Identity, use [getPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolios)

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Identity/Portfolios.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L91)

___

### getPortfolio

▸ **getPortfolio**(): `Promise`\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

Retrieve a Numbered Portfolio or the Default Portfolio if Portfolio ID is not passed

#### Returns

`Promise`\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

#### Defined in

[api/entities/Identity/Portfolios.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L138)

▸ **getPortfolio**(`args`): `Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.portfolioId` | `BigNumber` |

#### Returns

`Promise`\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>

#### Defined in

[api/entities/Identity/Portfolios.ts:139](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L139)

___

### getPortfolios

▸ **getPortfolios**(): `Promise`\<[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio), ...NumberedPortfolio[]]\>

Retrieve all the Portfolios owned by this Identity

#### Returns

`Promise`\<[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio), ...NumberedPortfolio[]]\>

#### Defined in

[api/entities/Identity/Portfolios.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L60)

___

### getTransactionHistory

▸ **getTransactionHistory**(`filters?`): `Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

Retrieve a list of transactions where this identity was involved. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.account?` | `string` | Account involved in the settlement |
| `filters.ticker?` | `string` | ticker involved in the transaction |

#### Returns

`Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Identity/Portfolios.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/Portfolios.ts#L190)
