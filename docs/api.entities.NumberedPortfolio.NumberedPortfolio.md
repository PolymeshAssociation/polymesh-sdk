# Class: NumberedPortfolio

[api/entities/NumberedPortfolio](../wiki/api.entities.NumberedPortfolio).NumberedPortfolio

Represents a numbered (non-default) Portfolio for an Identity

## Hierarchy

- [`Portfolio`](../wiki/api.entities.Portfolio.Portfolio)

  ↳ **`NumberedPortfolio`**

## Table of contents

### Properties

- [id](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#id)
- [owner](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#owner)
- [uuid](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#uuid)

### Methods

- [createdAt](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#createdat)
- [exists](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#exists)
- [getAssetBalances](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#getassetbalances)
- [getCollections](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#getcollections)
- [getCustodian](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#getcustodian)
- [getName](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#getname)
- [getTransactionHistory](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#gettransactionhistory)
- [isCustodiedBy](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#iscustodiedby)
- [isEqual](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#isequal)
- [isOwnedBy](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#isownedby)
- [modifyName](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#modifyname)
- [moveFunds](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#movefunds)
- [quitCustody](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#quitcustody)
- [setCustodian](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#setcustodian)
- [toHuman](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#tohuman)
- [generateUuid](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#generateuuid)
- [unserialize](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio#unserialize)

## Properties

### id

• **id**: `BigNumber`

Portfolio identifier number

#### Defined in

[api/entities/NumberedPortfolio.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/NumberedPortfolio.ts#L39)

___

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

### createdAt

▸ **createdAt**(): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Portfolio was created

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/NumberedPortfolio.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/NumberedPortfolio.ts#L101)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Return whether this Portfolio exists

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Portfolio](../wiki/api.entities.Portfolio.Portfolio).[exists](../wiki/api.entities.Portfolio.Portfolio#exists)

#### Defined in

[api/entities/NumberedPortfolio.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/NumberedPortfolio.ts#L127)

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

### getName

▸ **getName**(): `Promise`\<`string`\>

Return the Portfolio name

#### Returns

`Promise`\<`string`\>

#### Defined in

[api/entities/NumberedPortfolio.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/NumberedPortfolio.ts#L72)

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

### modifyName

▸ **modifyName**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio), [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

Rename portfolio

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RenamePortfolioParams`](../wiki/api.procedures.types.RenamePortfolioParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio), [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)\>\>

**`Note`**

Only the owner is allowed to rename the Portfolio.

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modifyName.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/NumberedPortfolio.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/NumberedPortfolio.ts#L65)

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
