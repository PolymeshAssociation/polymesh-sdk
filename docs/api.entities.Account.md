[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account

# api/entities/Account

## Classes

### Account

Defined in: [api/entities/Account/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L96)

Represents an Account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`UniqueIdentifiers`, `string`\>

#### Extended by

- [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)

#### Properties

##### address

> **address**: `string`

Defined in: [api/entities/Account/index.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L110)

Polymesh-specific address of the Account. Serves as an identifier

##### authorizations

> **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations)\<[`Account`](../wiki/#account)\>

Defined in: [api/entities/Account/index.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L119)

##### key

> **key**: `string`

Defined in: [api/entities/Account/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L116)

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

##### staking

> **staking**: [`Staking`](../wiki/api.entities.Account.Staking#staking)

Defined in: [api/entities/Account/index.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L121)

##### subsidies

> **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies#subsidies)

Defined in: [api/entities/Account/index.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L120)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### checkPermissions()

> **checkPermissions**(`permissions`): `Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Account`](../wiki/api.entities.types#account)\>\>

Defined in: [api/entities/Account/index.ts:394](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L394)

Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `permissions` | [`SimplePermissions`](../wiki/api.entities.types#simplepermissions) |

###### Returns

`Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Account`](../wiki/api.entities.types#account)\>\>

which permissions the Account is missing (if any) and the final result

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Account/index.ts:477](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L477)

Determine whether this Account exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getAssetBalances()

> **getAssetBalances**(`args?`): `Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)[]\>

Defined in: [api/entities/Account/index.ts:676](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L676)

Retrieve the balances of all fungible assets in this Account

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `assets`: (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset))[]; \} | - |
| `args.assets?` | (`string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset))[] | array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed) |

###### Returns

`Promise`\<[`PortfolioBalance`](../wiki/api.entities.Portfolio.types#portfoliobalance)[]\>

##### getBalance()

###### Call Signature

> **getBalance**(): `Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

Defined in: [api/entities/Account/index.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L145)

Get the free/locked POLYX balance of the Account

###### Returns

`Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

Promise that resolves to the Account's POLYX balance information

###### Call Signature

> **getBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Account/index.ts:156](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L156)

Get the free/locked POLYX balance of the Account (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\> | Callback function that receives balance updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### getCollections()

> **getCollections**(`args?`): `Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types#portfoliocollection)[]\>

Defined in: [api/entities/Account/index.ts:756](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L756)

Retrieve the NFTs held in this Account

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `collections`: (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection))[]; \} | - |
| `args.collections?` | (`string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection))[] | array of NftCollection (or tickers) for which to fetch holdings (optional, all holdings are retrieved if not passed) |

###### Returns

`Promise`\<[`PortfolioCollection`](../wiki/api.entities.Portfolio.types#portfoliocollection)[]\>

##### getCurrentNonce()

> **getCurrentNonce**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Account/index.ts:491](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L491)

Retrieve the current nonce for this Account

###### Returns

`Promise`\<`BigNumber`\>

##### getIdentity()

> **getIdentity**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/entities/Account/index.ts:175](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L175)

Retrieve the Identity associated to this Account (null if there is none)

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

##### getMultiSig()

> **getMultiSig**(): `Promise`\<[`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig) \| `null`\>

Defined in: [api/entities/Account/index.ts:449](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L449)

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

###### Returns

`Promise`\<[`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig) \| `null`\>

##### getNextAssetId()

> **getNextAssetId**(): `Promise`\<`string`\>

Defined in: [api/entities/Account/index.ts:629](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L629)

Returns next assetID that will be generated for this Identity

###### Returns

`Promise`\<`string`\>

##### getOffChainReceipts()

> **getOffChainReceipts**(): `Promise`\<`BigNumber`[]\>

Defined in: [api/entities/Account/index.ts:602](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L602)

Returns all off chain receipts used by this Account

###### Returns

`Promise`\<`BigNumber`[]\>

##### getPendingProposals()

> **getPendingProposals**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)[]\>

Defined in: [api/entities/Account/index.ts:586](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L586)

Returns pending MultiSig proposals for this Account

###### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)[]\>

###### Note

uses the middleware

###### Throws

if the Account is not a signer on any MultiSig

##### getPermissions()

> **getPermissions**(): `Promise`\<[`Permissions`](../wiki/api.entities.types#permissions-1)\>

Defined in: [api/entities/Account/index.ts:341](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L341)

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

###### Returns

`Promise`\<[`Permissions`](../wiki/api.entities.types#permissions-1)\>

###### Throws

if there is no Identity associated with the Account

##### getPolyxTransactions()

> **getPolyxTransactions**(`filters`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types#historicpolyxtransaction)\>\>

Defined in: [api/entities/Account/index.ts:568](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L568)

Returns POLYX transactions associated with this account

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filters` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} | - |
| `filters.size?` | `BigNumber` | page size |
| `filters.start?` | `BigNumber` | page offset |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types#historicpolyxtransaction)\>\>

###### Note

uses the middleware

##### getTransactionHistory()

> **getTransactionHistory**(`filters?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`ExtrinsicData`](../wiki/api.client.types#extrinsicdata)\>\>

Defined in: [api/entities/Account/index.ts:211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L211)

Retrieve a list of transactions signed by this Account. Can be filtered using parameters

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filters` | \{ `blockHash?`: `string`; `blockNumber?`: `BigNumber`; `orderBy?`: [`ExtrinsicsOrderBy`](../wiki/types#extrinsicsorderby); `size?`: `BigNumber`; `start?`: `BigNumber`; `success?`: `boolean`; `tag?`: `TxTag`; \} | - |
| `filters.blockHash?` | `string` | - |
| `filters.blockNumber?` | `BigNumber` | - |
| `filters.orderBy?` | [`ExtrinsicsOrderBy`](../wiki/types#extrinsicsorderby) | - |
| `filters.size?` | `BigNumber` | page size |
| `filters.start?` | `BigNumber` | page offset |
| `filters.success?` | `boolean` | whether the transaction was successful or not |
| `filters.tag?` | `TxTag` | tag associated with the transaction |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`ExtrinsicData`](../wiki/api.client.types#extrinsicdata)\>\>

###### Note

if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account.
Also, for ordering by block_id, one should pass `ExtrinsicsOrderBy.BlockIdAsc` or `ExtrinsicsOrderBy.BlockIdDesc`
in order of their choice (since block ID is a string field in middleware v2)

###### Note

uses the middleware v2

##### getTypeInfo()

> **getTypeInfo**(): `Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types#accounttypeinfo)\>

Defined in: [api/entities/Account/index.ts:512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L512)

Retrieve the type of Account, and its relation to an Identity, if applicable

###### Returns

`Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types#accounttypeinfo)\>

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### isFrozen()

> **isFrozen**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Account/index.ts:320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L320)

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

###### Returns

`Promise`\<`boolean`\>

###### Note

returns false if the Account isn't associated to any Identity

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Account/index.ts:484](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L484)

Return the Account's address

###### Returns

`string`

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L14)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L23)

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

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)
