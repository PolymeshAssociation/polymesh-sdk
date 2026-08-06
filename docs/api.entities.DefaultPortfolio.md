[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/DefaultPortfolio

# api/entities/DefaultPortfolio

## Classes

### DefaultPortfolio

Defined in: [api/entities/DefaultPortfolio.ts:10](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/DefaultPortfolio.ts#L10)

Represents the default Portfolio for an Identity

#### Extends

- [`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio)

#### Properties

##### owner

> **owner**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/Portfolio/index.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L91)

Identity of the Portfolio's owner

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`owner`](../wiki/api.entities.Portfolio#owner)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`uuid`](../wiki/api.entities.Portfolio#uuid)

#### Methods

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/DefaultPortfolio.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/DefaultPortfolio.ts#L21)

Determine whether this Portfolio exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`exists`](../wiki/api.entities.Portfolio#exists)

##### getAssetBalances()

> **getAssetBalances**(`args?`): `Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)[]\>

Defined in: [api/entities/Portfolio/index.ts:232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L232)

Retrieve the balances of all fungible assets in this Portfolio

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `assets`: (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset))[]; \} | - |
| `args.assets?` | (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset))[] | array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed) |

###### Returns

`Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)[]\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`getAssetBalances`](../wiki/api.entities.Portfolio#getassetbalances)

##### getCollections()

> **getCollections**(`args?`): `Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types#portfoliocollection)[]\>

Defined in: [api/entities/Portfolio/index.ts:311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L311)

Retrieve the NFTs held in this portfolio

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `collections`: (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection))[]; \} | - |
| `args.collections?` | (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection))[] | array of NftCollection (or tickers) for which to fetch holdings (optional, all holdings are retrieved if not passed) |

###### Returns

`Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types#portfoliocollection)[]\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`getCollections`](../wiki/api.entities.Portfolio#getcollections)

##### getCustodian()

> **getCustodian**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

Defined in: [api/entities/Portfolio/index.ts:432](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L432)

Retrieve the custodian Identity of this Portfolio

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)\>

###### Note

if no custodian is set, the owner Identity is returned

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`getCustodian`](../wiki/api.entities.Portfolio#getcustodian)

##### getTransactionHistory()

> **getTransactionHistory**(`filters?`): `Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types#historicsettlement)[]\>

Defined in: [api/entities/Portfolio/index.ts:474](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L474)

Retrieve a list of transactions where this portfolio was involved. Can be filtered using parameters

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filters` | \{ `account?`: `string`; `assetId?`: `string`; `ticker?`: `string`; \} | - |
| `filters.account?` | `string` | Account involved in the settlement |
| `filters.assetId?` | `string` | - |
| `filters.ticker?` | `string` | ticker involved in the transaction |

###### Returns

`Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types#historicsettlement)[]\>

###### Note

uses the middlewareV2

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`getTransactionHistory`](../wiki/api.entities.Portfolio#gettransactionhistory)

##### isAssetPreApproved()

> **isAssetPreApproved**(`asset`): `Promise`\<`boolean`\>

Defined in: [api/entities/Portfolio/index.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L169)

Returns whether or not this Portfolio has pre-approved a particular asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`isAssetPreApproved`](../wiki/api.entities.Portfolio#isassetpreapproved)

##### isCustodiedBy()

> **isCustodiedBy**(`args?`): `Promise`\<`boolean`\>

Defined in: [api/entities/Portfolio/index.ts:155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L155)

Return whether an Identity is the Portfolio custodian

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.identity?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | optional, defaults to the signing Identity |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`isCustodiedBy`](../wiki/api.entities.Portfolio#iscustodiedby)

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`isEqual`](../wiki/api.entities.Portfolio#isequal)

##### isOwnedBy()

> **isOwnedBy**(`args?`): `Promise`\<`boolean`\>

Defined in: [api/entities/Portfolio/index.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L142)

Return whether an Identity is the Portfolio owner

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.identity?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | defaults to the signing Identity |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`isOwnedBy`](../wiki/api.entities.Portfolio#isownedby)

##### moveFunds()

> **moveFunds**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Portfolio/index.ts:407](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L407)

Moves funds from this Portfolio to another one owned by the same Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`MoveFundsParams`](../wiki/api.procedures.types#movefundsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required role:
  - Portfolio Custodian

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [moveFunds.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`moveFunds`](../wiki/api.entities.Portfolio#movefunds)

##### preApproveAsset()

> **preApproveAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Portfolio/index.ts:420](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L420)

Pre-approves receiving an asset for this Portfolio. Receiving this asset in a settlement will not require manual affirmation

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `asset`: `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset); \} |
| `args.asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [preApproveAsset.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`preApproveAsset`](../wiki/api.entities.Portfolio#preapproveasset)

##### preApprovedAssets()

> **preApprovedAssets**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

Defined in: [api/entities/Portfolio/index.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L194)

Returns a list of all assets this Portfolio has pre-approved. These assets will not require affirmation when being received in settlements

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`preApprovedAssets`](../wiki/api.entities.Portfolio#preapprovedassets)

##### quitCustody()

> **quitCustody**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Portfolio/index.ts:415](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L415)

Returns the custody of the portfolio to the portfolio owner unilaterally

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required role:
  - Portfolio Custodian

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [quitCustody.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`quitCustody`](../wiki/api.entities.Portfolio#quitcustody)

##### removeAssetPreApproval()

> **removeAssetPreApproval**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Portfolio/index.ts:425](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L425)

Removes pre-approval of an asset for this Portfolio

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `asset`: `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset); \} |
| `args.asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeAssetPreApproval.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`removeAssetPreApproval`](../wiki/api.entities.Portfolio#removeassetpreapproval)

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/api.entities.Portfolio#humanreadable)

Defined in: [api/entities/Portfolio/index.ts:549](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Portfolio/index.ts#L549)

Return the Portfolio ID and owner DID

###### Returns

[`HumanReadable`](../wiki/api.entities.Portfolio#humanreadable)

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`toHuman`](../wiki/api.entities.Portfolio#tohuman)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`generateUuid`](../wiki/api.entities.Portfolio#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio).[`unserialize`](../wiki/api.entities.Portfolio#unserialize)

## Interfaces

### UniqueIdentifiers

Defined in: [api/entities/DefaultPortfolio.ts:3](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/DefaultPortfolio.ts#L3)

#### Properties

##### did

> **did**: `string`

Defined in: [api/entities/DefaultPortfolio.ts:4](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/DefaultPortfolio.ts#L4)
