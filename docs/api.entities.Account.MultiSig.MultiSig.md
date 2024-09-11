# Class: MultiSig

[api/entities/Account/MultiSig](../wiki/api.entities.Account.MultiSig).MultiSig

Represents a MultiSig Account. A MultiSig Account is composed of one or more signing Accounts. In order to submit a transaction, a specific amount of those signing Accounts must approve it first

## Hierarchy

- [`Account`](../wiki/api.entities.Account.Account)

  ↳ **`MultiSig`**

## Table of contents

### Properties

- [address](../wiki/api.entities.Account.MultiSig.MultiSig#address)
- [authorizations](../wiki/api.entities.Account.MultiSig.MultiSig#authorizations)
- [key](../wiki/api.entities.Account.MultiSig.MultiSig#key)
- [subsidies](../wiki/api.entities.Account.MultiSig.MultiSig#subsidies)
- [uuid](../wiki/api.entities.Account.MultiSig.MultiSig#uuid)

### Methods

- [checkPermissions](../wiki/api.entities.Account.MultiSig.MultiSig#checkpermissions)
- [details](../wiki/api.entities.Account.MultiSig.MultiSig#details)
- [exists](../wiki/api.entities.Account.MultiSig.MultiSig#exists)
- [getBalance](../wiki/api.entities.Account.MultiSig.MultiSig#getbalance)
- [getCreator](../wiki/api.entities.Account.MultiSig.MultiSig#getcreator)
- [getCurrentNonce](../wiki/api.entities.Account.MultiSig.MultiSig#getcurrentnonce)
- [getHistoricalProposals](../wiki/api.entities.Account.MultiSig.MultiSig#gethistoricalproposals)
- [getIdentity](../wiki/api.entities.Account.MultiSig.MultiSig#getidentity)
- [getMultiSig](../wiki/api.entities.Account.MultiSig.MultiSig#getmultisig)
- [getPendingProposals](../wiki/api.entities.Account.MultiSig.MultiSig#getpendingproposals)
- [getPermissions](../wiki/api.entities.Account.MultiSig.MultiSig#getpermissions)
- [getPolyxTransactions](../wiki/api.entities.Account.MultiSig.MultiSig#getpolyxtransactions)
- [getProposal](../wiki/api.entities.Account.MultiSig.MultiSig#getproposal)
- [getProposals](../wiki/api.entities.Account.MultiSig.MultiSig#getproposals)
- [getSubsidy](../wiki/api.entities.Account.MultiSig.MultiSig#getsubsidy)
- [getTransactionHistory](../wiki/api.entities.Account.MultiSig.MultiSig#gettransactionhistory)
- [getTypeInfo](../wiki/api.entities.Account.MultiSig.MultiSig#gettypeinfo)
- [isEqual](../wiki/api.entities.Account.MultiSig.MultiSig#isequal)
- [isFrozen](../wiki/api.entities.Account.MultiSig.MultiSig#isfrozen)
- [modify](../wiki/api.entities.Account.MultiSig.MultiSig#modify)
- [toHuman](../wiki/api.entities.Account.MultiSig.MultiSig#tohuman)
- [generateUuid](../wiki/api.entities.Account.MultiSig.MultiSig#generateuuid)
- [unserialize](../wiki/api.entities.Account.MultiSig.MultiSig#unserialize)

## Properties

### address

• **address**: `string`

Polymesh-specific address of the Account. Serves as an identifier

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[address](../wiki/api.entities.Account.Account#address)

#### Defined in

[api/entities/Account/index.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L82)

___

### authorizations

• **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)\<[`Account`](../wiki/api.entities.Account.Account)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[authorizations](../wiki/api.entities.Account.Account#authorizations)

#### Defined in

[api/entities/Account/index.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L91)

___

### key

• **key**: `string`

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[key](../wiki/api.entities.Account.Account#key)

#### Defined in

[api/entities/Account/index.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L88)

___

### subsidies

• **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies.Subsidies)

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[subsidies](../wiki/api.entities.Account.Account#subsidies)

#### Defined in

[api/entities/Account/index.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L92)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[uuid](../wiki/api.entities.Account.Account#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

## Methods

### checkPermissions

▸ **checkPermissions**(`permissions`): `Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Account`](../wiki/api.entities.types.SignerType#account)\>\>

Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `permissions` | [`SimplePermissions`](../wiki/api.entities.types.SimplePermissions) |

#### Returns

`Promise`\<[`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Account`](../wiki/api.entities.types.SignerType#account)\>\>

which permissions the Account is missing (if any) and the final result

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[checkPermissions](../wiki/api.entities.Account.Account#checkpermissions)

#### Defined in

[api/entities/Account/index.ts:372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L372)

___

### details

▸ **details**(): `Promise`\<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types.MultiSigDetails)\>

Return details about this MultiSig such as the signing Accounts and the required number of signatures to execute a MultiSigProposal

#### Returns

`Promise`\<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types.MultiSigDetails)\>

#### Defined in

[api/entities/Account/MultiSig/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L50)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Account exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[exists](../wiki/api.entities.Account.Account#exists)

#### Defined in

[api/entities/Account/index.ts:455](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L455)

___

### getBalance

▸ **getBalance**(): `Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

Get the free/locked POLYX balance of the Account

#### Returns

`Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getBalance](../wiki/api.entities.Account.Account#getbalance)

#### Defined in

[api/entities/Account/index.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L115)

▸ **getBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Balance`](../wiki/api.entities.Account.types.Balance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getBalance](../wiki/api.entities.Account.Account#getbalance)

#### Defined in

[api/entities/Account/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L116)

___

### getCreator

▸ **getCreator**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Returns the Identity of the MultiSig creator. This Identity can add or remove signers directly without creating a MultiSigProposal first.

#### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

#### Defined in

[api/entities/Account/MultiSig/index.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L194)

___

### getCurrentNonce

▸ **getCurrentNonce**(): `Promise`\<`BigNumber`\>

Retrieve the current nonce for this Account

#### Returns

`Promise`\<`BigNumber`\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getCurrentNonce](../wiki/api.entities.Account.Account#getcurrentnonce)

#### Defined in

[api/entities/Account/index.ts:469](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L469)

___

### getHistoricalProposals

▸ **getHistoricalProposals**(`opts`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>\>

Return all [MultiSigProposal](../wiki/api.entities.MultiSigProposal.MultiSigProposal) for this MultiSig Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/Account/MultiSig/index.ts:156](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L156)

___

### getIdentity

▸ **getIdentity**(): `Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to this Account (null if there is none)

#### Returns

`Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getIdentity](../wiki/api.entities.Account.Account#getidentity)

#### Defined in

[api/entities/Account/index.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L160)

___

### getMultiSig

▸ **getMultiSig**(): `Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

#### Returns

`Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getMultiSig](../wiki/api.entities.Account.Account#getmultisig)

#### Defined in

[api/entities/Account/index.ts:427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L427)

___

### getPendingProposals

▸ **getPendingProposals**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

Returns pending MultiSig proposals for this Account

#### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

**`Note`**

uses the middleware

**`Throws`**

if the Account is not a signer on any MultiSig

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getPendingProposals](../wiki/api.entities.Account.Account#getpendingproposals)

#### Defined in

[api/entities/Account/index.ts:571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L571)

___

### getPermissions

▸ **getPermissions**(): `Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

#### Returns

`Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

**`Throws`**

if there is no Identity associated with the Account

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getPermissions](../wiki/api.entities.Account.Account#getpermissions)

#### Defined in

[api/entities/Account/index.ts:333](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L333)

___

### getPolyxTransactions

▸ **getPolyxTransactions**(`filters`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types.HistoricPolyxTransaction)\>\>

Returns POLYX transactions associated with this account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.size?` | `BigNumber` | page size |
| `filters.start?` | `BigNumber` | page offset |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types.HistoricPolyxTransaction)\>\>

**`Note`**

uses the middleware

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getPolyxTransactions](../wiki/api.entities.Account.Account#getpolyxtransactions)

#### Defined in

[api/entities/Account/index.ts:553](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L553)

___

### getProposal

▸ **getProposal**(`args`): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

Given an ID, fetch a [MultiSigProposal](../wiki/api.entities.MultiSigProposal.MultiSigProposal) for this MultiSig

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

**`Throws`**

if the MultiSigProposal is not found

#### Defined in

[api/entities/Account/MultiSig/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L85)

___

### getProposals

▸ **getProposals**(): `Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

Return all active [MultiSigProposal](../wiki/api.entities.MultiSigProposal.MultiSigProposal) for this MultiSig Account

#### Returns

`Promise`\<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

#### Defined in

[api/entities/Account/MultiSig/index.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L105)

___

### getSubsidy

▸ **getSubsidy**(): `Promise`\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

Get the subsidized balance of this Account and the subsidizer Account. If
  this Account isn't being subsidized, return null

#### Returns

`Promise`\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

**`Deprecated`**

in favour of [subsidies.getSubsidizer](../wiki/api.entities.Subsidies.Subsidies#getsubsidizer)

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getSubsidy](../wiki/api.entities.Account.Account#getsubsidy)

#### Defined in

[api/entities/Account/index.ts:140](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L140)

▸ **getSubsidy**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getSubsidy](../wiki/api.entities.Account.Account#getsubsidy)

#### Defined in

[api/entities/Account/index.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L141)

___

### getTransactionHistory

▸ **getTransactionHistory**(`filters?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`ExtrinsicData`](../wiki/api.client.types.ExtrinsicData)\>\>

Retrieve a list of transactions signed by this Account. Can be filtered using parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.blockHash?` | `string` | - |
| `filters.blockNumber?` | `BigNumber` | - |
| `filters.orderBy?` | [`ExtrinsicsOrderBy`](../wiki/types.ExtrinsicsOrderBy) | - |
| `filters.size?` | `BigNumber` | page size |
| `filters.start?` | `BigNumber` | page offset |
| `filters.success?` | `boolean` | whether the transaction was successful or not |
| `filters.tag?` | [`TxTag`](../wiki/generated.types#txtag) | tag associated with the transaction |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`ExtrinsicData`](../wiki/api.client.types.ExtrinsicData)\>\>

**`Note`**

if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account.
Also, for ordering by block_id, one should pass `ExtrinsicsOrderBy.CreatedAtAsc` or `ExtrinsicsOrderBy.CreatedAtDesc`
in order of their choice (since block ID is a string field in middleware v2)

**`Note`**

uses the middleware v2

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getTransactionHistory](../wiki/api.entities.Account.Account#gettransactionhistory)

#### Defined in

[api/entities/Account/index.ts:196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L196)

___

### getTypeInfo

▸ **getTypeInfo**(): `Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

Retrieve the type of Account, and its relation to an Identity, if applicable

#### Returns

`Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getTypeInfo](../wiki/api.entities.Account.Account#gettypeinfo)

#### Defined in

[api/entities/Account/index.ts:490](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L490)

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

[Account](../wiki/api.entities.Account.Account).[isEqual](../wiki/api.entities.Account.Account#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### isFrozen

▸ **isFrozen**(): `Promise`\<`boolean`\>

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

#### Returns

`Promise`\<`boolean`\>

**`Note`**

returns false if the Account isn't associated to any Identity

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[isFrozen](../wiki/api.entities.Account.Account#isfrozen)

#### Defined in

[api/entities/Account/index.ts:312](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L312)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`\<[`ModifyMultiSigParams`](../wiki/api.procedures.types.ModifyMultiSigParams), ``"signers"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Account/MultiSig/index.ts:225](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/MultiSig/index.ts#L225)

___

### toHuman

▸ **toHuman**(): `string`

Return the Account's address

#### Returns

`string`

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[toHuman](../wiki/api.entities.Account.Account#tohuman)

#### Defined in

[api/entities/Account/index.ts:462](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/index.ts#L462)

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

[Account](../wiki/api.entities.Account.Account).[generateUuid](../wiki/api.entities.Account.Account#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L14)

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

[Account](../wiki/api.entities.Account.Account).[unserialize](../wiki/api.entities.Account.Account#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
