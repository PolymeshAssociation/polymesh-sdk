# Class: DefaultPortfolio

[api/entities/DefaultPortfolio](../wiki/api.entities.DefaultPortfolio).DefaultPortfolio

Represents the default Portfolio for an Identity

## Hierarchy

- [`Portfolio`](../wiki/api.entities.Portfolio.Portfolio)

  ↳ **`DefaultPortfolio`**

## Table of contents

### Properties

- [owner](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#owner)
- [uuid](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#uuid)

### Methods

- [exists](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#exists)
- [getAssetBalances](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#getassetbalances)
- [getCollections](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#getcollections)
- [getCustodian](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#getcustodian)
- [getTransactionHistory](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#gettransactionhistory)
- [isCustodiedBy](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#iscustodiedby)
- [isEqual](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#isequal)
- [isOwnedBy](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#isownedby)
- [moveFunds](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#movefunds)
- [quitCustody](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#quitcustody)
- [setCustodian](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#setcustodian)
- [toHuman](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#tohuman)
- [generateUuid](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#generateuuid)
- [unserialize](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio#unserialize)

## Properties

### owner

• **owner**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity of the Portfolio's owner

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[owner](../wiki/api.entities.Portfolio.Portfolio#owner)

#### Defined in

[api/entities/Portfolio/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L77)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[uuid](../wiki/api.entities.Portfolio.Portfolio#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Portfolio exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[exists](../wiki/api.entities.Portfolio.Portfolio#exists)

#### Defined in

[api/entities/DefaultPortfolio.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/DefaultPortfolio.ts#L22)

___

### getAssetBalances

▸ **getAssetBalances**(`args?`): `Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)[]\>

Retrieve the balances of all fungible assets in this Portfolio

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.assets` | (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset))[] | array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed) |

#### Returns

`Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types.PortfolioBalance)[]\>

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[getAssetBalances](../wiki/api.entities.Portfolio.Portfolio#getassetbalances)

#### Defined in

[api/entities/Portfolio/index.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L143)

___

### getCollections

▸ **getCollections**(`args?`): `Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types.PortfolioCollection)[]\>

Retrieve the NFTs held in this portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | `Object` |
| `args.collections` | (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection))[] |

#### Returns

`Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types.PortfolioCollection)[]\>

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[getCollections](../wiki/api.entities.Portfolio.Portfolio#getcollections)

#### Defined in

[api/entities/Portfolio/index.ts:222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L222)

___

### getCustodian

▸ **getCustodian**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the custodian Identity of this Portfolio

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

**`Note`**

if no custodian is set, the owner Identity is returned

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[getCustodian](../wiki/api.entities.Portfolio.Portfolio#getcustodian)

#### Defined in

[api/entities/Portfolio/index.ts:370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L370)

___

### getTransactionHistory

▸ **getTransactionHistory**(`filters?`): `Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

Retrieve a list of transactions where this portfolio was involved. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.account?` | `string` | Account involved in the settlement |
| `filters.assetId?` | `string` | - |
| `filters.ticker?` | `string` | ticker involved in the transaction |

#### Returns

`Promise`\<[`HistoricSettlement`](../wiki/api.entities.Portfolio.types.HistoricSettlement)[]\>

**`Note`**

uses the middlewareV2

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[getTransactionHistory](../wiki/api.entities.Portfolio.Portfolio#gettransactionhistory)

#### Defined in

[api/entities/Portfolio/index.ts:412](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L412)

___

### isCustodiedBy

▸ **isCustodiedBy**(`args?`): `Promise`\<`boolean`\>

Return whether an Identity is the Portfolio custodian

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | optional, defaults to the signing Identity |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[isCustodiedBy](../wiki/api.entities.Portfolio.Portfolio#iscustodiedby)

#### Defined in

[api/entities/Portfolio/index.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L127)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[isEqual](../wiki/api.entities.Portfolio.Portfolio#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### isOwnedBy

▸ **isOwnedBy**(`args?`): `Promise`\<`boolean`\>

Return whether an Identity is the Portfolio owner

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[isOwnedBy](../wiki/api.entities.Portfolio.Portfolio#isownedby)

#### Defined in

[api/entities/Portfolio/index.ts:114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L114)

___

### moveFunds

▸ **moveFunds**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Moves funds from this Portfolio to another one owned by the same Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`MoveFundsParams`](../wiki/api.procedures.types.MoveFundsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [moveFunds.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[moveFunds](../wiki/api.entities.Portfolio.Portfolio#movefunds)

#### Defined in

[api/entities/Portfolio/index.ts:348](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L348)

___

### quitCustody

▸ **quitCustody**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Returns the custody of the portfolio to the portfolio owner unilaterally

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required role:
  - Portfolio Custodian

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [quitCustody.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[quitCustody](../wiki/api.entities.Portfolio.Portfolio#quitcustody)

#### Defined in

[api/entities/Portfolio/index.ts:361](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L361)

___

### setCustodian

▸ **setCustodian**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an invitation to an Identity to assign it as custodian for this Portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetCustodianParams`](../wiki/api.procedures.types.SetCustodianParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `targetIdentity`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

required role:
  - Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setCustodian.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[setCustodian](../wiki/api.entities.Portfolio.Portfolio#setcustodian)

#### Defined in

[api/entities/Portfolio/index.ts:335](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L335)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.Portfolio.HumanReadable)

Return the Portfolio ID and owner DID

#### Returns

[`HumanReadable`](../wiki/api.entities.Portfolio.HumanReadable)

#### Inherited from

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[toHuman](../wiki/api.entities.Portfolio.Portfolio#tohuman)

#### Defined in

[api/entities/Portfolio/index.ts:487](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Portfolio/index.ts#L487)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

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

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[generateUuid](../wiki/api.entities.Portfolio.Portfolio#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

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

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[unserialize](../wiki/api.entities.Portfolio.Portfolio#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
