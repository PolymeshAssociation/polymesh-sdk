[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/MultiSig

# api/entities/Account/MultiSig

## Classes

### MultiSig

Defined in: [api/entities/Account/MultiSig/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L49)

Represents a MultiSig Account. A MultiSig Account is composed of one or more signing Accounts. In order to submit a transaction, a specific amount of those signing Accounts must approve it first

#### Extends

- [`Account`](../wiki/api.entities.Account#account)

#### Properties

##### address

> **address**: `string`

Defined in: [api/entities/Account/index.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L110)

Polymesh-specific address of the Account. Serves as an identifier

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`address`](../wiki/api.entities.Account#address)

##### authorizations

> **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations)\<[`Account`](../wiki/api.entities.Account#account)\>

Defined in: [api/entities/Account/index.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L119)

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`authorizations`](../wiki/api.entities.Account#authorizations)

##### key

> **key**: `string`

Defined in: [api/entities/Account/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L116)

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`key`](../wiki/api.entities.Account#key)

##### staking

> **staking**: [`Staking`](../wiki/api.entities.Account.Staking#staking)

Defined in: [api/entities/Account/index.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L121)

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`staking`](../wiki/api.entities.Account#staking)

##### subsidies

> **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies#subsidies)

Defined in: [api/entities/Account/index.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L120)

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`subsidies`](../wiki/api.entities.Account#subsidies)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`uuid`](../wiki/api.entities.Account#uuid)

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`checkPermissions`](../wiki/api.entities.Account#checkpermissions)

##### details()

> **details**(): `Promise`\<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types#multisigdetails)\>

Defined in: [api/entities/Account/MultiSig/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L80)

Return details about this MultiSig such as the signing Accounts and the required number of signatures to execute a MultiSigProposal

###### Returns

`Promise`\<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types#multisigdetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Account/index.ts:477](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L477)

Determine whether this Account exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`exists`](../wiki/api.entities.Account#exists)

##### getAdmin()

> **getAdmin**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/entities/Account/MultiSig/index.ts:264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L264)

Returns the Identity of the MultiSig admin. This Identity can add or remove signers directly without creating a MultiSigProposal first.

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getAssetBalances`](../wiki/api.entities.Account#getassetbalances)

##### getBalance()

###### Call Signature

> **getBalance**(): `Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

Defined in: [api/entities/Account/index.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L145)

Get the free/locked POLYX balance of the Account

###### Returns

`Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

Promise that resolves to the Account's POLYX balance information

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getBalance`](../wiki/api.entities.Account#getbalance)

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getBalance`](../wiki/api.entities.Account#getbalance)

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getCollections`](../wiki/api.entities.Account#getcollections)

##### getCurrentNonce()

> **getCurrentNonce**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Account/index.ts:491](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L491)

Retrieve the current nonce for this Account

###### Returns

`Promise`\<`BigNumber`\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getCurrentNonce`](../wiki/api.entities.Account#getcurrentnonce)

##### getHistoricalProposals()

> **getHistoricalProposals**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricalMultiSigProposal`](../wiki/api.entities.Account.MultiSig.types#historicalmultisigproposal)\>\>

Defined in: [api/entities/Account/MultiSig/index.ts:198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L198)

Return a set of [MultiSigProposal](../wiki/api.entities.MultiSigProposal#multisigproposal) for this MultiSig Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricalMultiSigProposal`](../wiki/api.entities.Account.MultiSig.types#historicalmultisigproposal)\>\>

###### Note

uses the middlewareV2

##### getIdentity()

> **getIdentity**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/entities/Account/index.ts:175](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L175)

Retrieve the Identity associated to this Account (null if there is none)

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getIdentity`](../wiki/api.entities.Account#getidentity)

##### getMultiSig()

> **getMultiSig**(): `Promise`\<[`MultiSig`](../wiki/#multisig) \| `null`\>

Defined in: [api/entities/Account/index.ts:449](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L449)

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

###### Returns

`Promise`\<[`MultiSig`](../wiki/#multisig) \| `null`\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getMultiSig`](../wiki/api.entities.Account#getmultisig)

##### getNextAssetId()

> **getNextAssetId**(): `Promise`\<`string`\>

Defined in: [api/entities/Account/index.ts:629](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L629)

Returns next assetID that will be generated for this Identity

###### Returns

`Promise`\<`string`\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getNextAssetId`](../wiki/api.entities.Account#getnextassetid)

##### getOffChainReceipts()

> **getOffChainReceipts**(): `Promise`\<`BigNumber`[]\>

Defined in: [api/entities/Account/index.ts:602](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L602)

Returns all off chain receipts used by this Account

###### Returns

`Promise`\<`BigNumber`[]\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getOffChainReceipts`](../wiki/api.entities.Account#getoffchainreceipts)

##### getPayer()

> **getPayer**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/entities/Account/MultiSig/index.ts:290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L290)

Returns the payer for the MultiSig, if set the primary account of the identity will pay for any fees the MultiSig may incur

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getPendingProposals`](../wiki/api.entities.Account#getpendingproposals)

##### getPermissions()

> **getPermissions**(): `Promise`\<[`Permissions`](../wiki/api.entities.types#permissions-1)\>

Defined in: [api/entities/Account/index.ts:341](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L341)

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

###### Returns

`Promise`\<[`Permissions`](../wiki/api.entities.types#permissions-1)\>

###### Throws

if there is no Identity associated with the Account

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getPermissions`](../wiki/api.entities.Account#getpermissions)

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getPolyxTransactions`](../wiki/api.entities.Account#getpolyxtransactions)

##### getProposal()

> **getProposal**(`args`): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)\>

Defined in: [api/entities/Account/MultiSig/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L116)

Given an ID, fetch a [MultiSigProposal](../wiki/api.entities.MultiSigProposal#multisigproposal) for this MultiSig

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)\>

###### Throws

if the MultiSigProposal is not found

##### getProposals()

> **getProposals**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)[]\>

Defined in: [api/entities/Account/MultiSig/index.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L136)

Return all active [MultiSig Proposals](../wiki/api.entities.MultiSigProposal#multisigproposal) for this MultiSig Account

###### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)[]\>

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

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getTransactionHistory`](../wiki/api.entities.Account#gettransactionhistory)

##### getTypeInfo()

> **getTypeInfo**(): `Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types#accounttypeinfo)\>

Defined in: [api/entities/Account/index.ts:512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L512)

Retrieve the type of Account, and its relation to an Identity, if applicable

###### Returns

`Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types#accounttypeinfo)\>

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`getTypeInfo`](../wiki/api.entities.Account#gettypeinfo)

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

[`Account`](../wiki/api.entities.Account#account).[`isEqual`](../wiki/api.entities.Account#isequal)

##### isFrozen()

> **isFrozen**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Account/index.ts:320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L320)

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

###### Returns

`Promise`\<`boolean`\>

###### Note

returns false if the Account isn't associated to any Identity

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`isFrozen`](../wiki/api.entities.Account#isfrozen)

##### modify()

> **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Account/MultiSig/index.ts:315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L315)

Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `Pick`\<[`ModifyMultiSigParams`](../wiki/api.procedures.types#modifymultisigparams), `"signers"` \| `"requiredSignatures"`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### removePayer()

> **removePayer**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Account/MultiSig/index.ts:332](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L332)

A MultiSig's creator is initially responsible for any fees the MultiSig may incur. This method allows for the
MultiSig to pay for it's own fees.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

This method must be called by one of the MultiSig signer's or by the paying identity.

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [removePayer.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### setAdmin()

> **setAdmin**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Account/MultiSig/index.ts:324](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/MultiSig/index.ts#L324)

Set an admin for the MultiSig. When setting an admin it must be signed by one of the MultiSig signers and ran
as a proposal. When removing an admin it must be called by account belonging to the admin's identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetMultiSigAdminParams`](../wiki/api.procedures.types#setmultisigadminparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setAdmin.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Account/index.ts:484](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/index.ts#L484)

Return the Account's address

###### Returns

`string`

###### Inherited from

[`Account`](../wiki/api.entities.Account#account).[`toHuman`](../wiki/api.entities.Account#tohuman)

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

[`Account`](../wiki/api.entities.Account#account).[`generateUuid`](../wiki/api.entities.Account#generateuuid)

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

[`Account`](../wiki/api.entities.Account#account).[`unserialize`](../wiki/api.entities.Account#unserialize)
