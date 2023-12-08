# Class: Portfolios

[api/entities/Identity/Portfolios](../wiki/api.entities.Identity.Portfolios).Portfolios

Handles all Portfolio related functionality on the Identity side

## Hierarchy

- `Namespace`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

  ↳ **`Portfolios`**

## Table of contents

### Methods

- [delete](../wiki/api.entities.Identity.Portfolios.Portfolios#delete)
- [getCustodiedPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getcustodiedportfolios)
- [getPortfolio](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolio)
- [getPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolios)

## Methods

### delete

▸ **delete**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Delete a Portfolio by ID

**`Note`**

 required role:
  - Portfolio Custodian

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [delete.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.portfolio` | `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### getCustodiedPortfolios

▸ **getCustodiedPortfolios**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>\>

Retrieve all Portfolios custodied by this Identity.
  This only includes portfolios owned by a different Identity but custodied by this one.
  To fetch Portfolios owned by this Identity, use [getPortfolios](../wiki/api.entities.Identity.Portfolios.Portfolios#getportfolios)

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>\>

___

### getPortfolio

▸ **getPortfolio**(): `Promise`<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

Retrieve a Numbered Portfolio or the Default Portfolio if Portfolio ID is not passed

#### Returns

`Promise`<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

▸ **getPortfolio**(`args`): `Promise`<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.portfolioId` | `BigNumber` |

#### Returns

`Promise`<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>

___

### getPortfolios

▸ **getPortfolios**(): `Promise`<[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio), ...NumberedPortfolio[]]\>

Retrieve all the Portfolios owned by this Identity

#### Returns

`Promise`<[[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio), ...NumberedPortfolio[]]\>
