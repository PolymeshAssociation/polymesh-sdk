# Class: Portfolio

[api/entities/Portfolio](../wiki/api.entities.Portfolio).Portfolio

Represents a base Portfolio for a specific Identity in the Polymesh blockchain

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<[`UniqueIdentifiers`](../wiki/api.entities.Portfolio.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.Portfolio.HumanReadable)\>

  ↳ **`Portfolio`**

  ↳↳ [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

  ↳↳ [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)

## Table of contents

### Properties

- [owner](../wiki/api.entities.Portfolio.Portfolio#owner)
- [uuid](../wiki/api.entities.Portfolio.Portfolio#uuid)

### Methods

- [exists](../wiki/api.entities.Portfolio.Portfolio#exists)
- [getAssetBalances](../wiki/api.entities.Portfolio.Portfolio#getassetbalances)
- [getCollections](../wiki/api.entities.Portfolio.Portfolio#getcollections)
- [getCustodian](../wiki/api.entities.Portfolio.Portfolio#getcustodian)
- [getTransactionHistory](../wiki/api.entities.Portfolio.Portfolio#gettransactionhistory)
- [isCustodiedBy](../wiki/api.entities.Portfolio.Portfolio#iscustodiedby)
- [isEqual](../wiki/api.entities.Portfolio.Portfolio#isequal)
- [isOwnedBy](../wiki/api.entities.Portfolio.Portfolio#isownedby)
- [moveFunds](../wiki/api.entities.Portfolio.Portfolio#movefunds)
- [quitCustody](../wiki/api.entities.Portfolio.Portfolio#quitcustody)
- [setCustodian](../wiki/api.entities.Portfolio.Portfolio#setcustodian)
- [toHuman](../wiki/api.entities.Portfolio.Portfolio#tohuman)
- [generateUuid](../wiki/api.entities.Portfolio.Portfolio#generateuuid)
- [unserialize](../wiki/api.entities.Portfolio.Portfolio#unserialize)

## Properties

### owner

• **owner**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity of the Portfolio's owner

#### Defined in

[api/entities/Portfolio/index.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Portfolio/index.ts#L82)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ `Abstract` **exists**(): `Promise`<`boolean`\>

Determine whether this Entity exists on chain

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

___

### getAssetBalances

▸ **getAssetBalances**(`args?`): `Promise`<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)[]\>

Retrieve the balances of all fungible assets in this Portfolio

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.assets` | (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset))[] | array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed) |

#### Returns

`Promise`<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)[]\>

___

### getCollections

▸ **getCollections**(`args?`): `Promise`<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types.PortfolioCollection)[]\>

Retrieve the NFTs held in this portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | `Object` |
| `args.collections` | (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection))[] |

#### Returns

`Promise`<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types.PortfolioCollection)[]\>

___

### getCustodian

▸ **getCustodian**(): `Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the custodian Identity of this Portfolio

**`Note`**

 if no custodian is set, the owner Identity is returned

#### Returns

`Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### getTransactionHistory

▸ **getTransactionHistory**(`filters?`): `Promise`<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

Retrieve a list of transactions where this portfolio was involved. Can be filtered using parameters

**`Note`**

 uses the middlewareV2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.account?` | `string` | Account involved in the settlement |
| `filters.ticker?` | `string` | ticker involved in the transaction |

#### Returns

`Promise`<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

___

### isCustodiedBy

▸ **isCustodiedBy**(`args?`): `Promise`<`boolean`\>

Return whether an Identity is the Portfolio custodian

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | optional, defaults to the signing Identity |

#### Returns

`Promise`<`boolean`\>

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

___

### isOwnedBy

▸ **isOwnedBy**(`args?`): `Promise`<`boolean`\>

Return whether an Identity is the Portfolio owner

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`<`boolean`\>

___

### moveFunds

▸ **moveFunds**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Moves funds from this Portfolio to another one owned by the same Identity

**`Note`**

 required role:
  - Portfolio Custodian

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [moveFunds.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`MoveFundsParams`](../wiki/api.procedures.types.MoveFundsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### quitCustody

▸ **quitCustody**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Returns the custody of the portfolio to the portfolio owner unilaterally

**`Note`**

 required role:
  - Portfolio Custodian

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [quitCustody.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### setCustodian

▸ **setCustodian**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an invitation to an Identity to assign it as custodian for this Portfolio

**`Note`**

 this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `targetIdentity`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 required role:
  - Portfolio Custodian

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [setCustodian.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetCustodianParams`](../wiki/api.procedures.types.SetCustodianParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.Portfolio.HumanReadable)

Return the Portfolio ID and owner DID

#### Returns

[`HumanReadable`](../wiki/api.entities.Portfolio.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)
