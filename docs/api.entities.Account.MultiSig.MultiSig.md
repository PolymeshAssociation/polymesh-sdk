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
- [getIdentity](../wiki/api.entities.Account.MultiSig.MultiSig#getidentity)
- [getMultiSig](../wiki/api.entities.Account.MultiSig.MultiSig#getmultisig)
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

[api/entities/Account/index.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Account/index.ts#L75)

___

### authorizations

• **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)<[`Account`](../wiki/api.entities.Account.Account)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[authorizations](../wiki/api.entities.Account.Account#authorizations)

#### Defined in

[api/entities/Account/index.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Account/index.ts#L84)

___

### key

• **key**: `string`

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[key](../wiki/api.entities.Account.Account#key)

#### Defined in

[api/entities/Account/index.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Account/index.ts#L81)

___

### subsidies

• **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies.Subsidies)

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[subsidies](../wiki/api.entities.Account.Account#subsidies)

#### Defined in

[api/entities/Account/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Account/index.ts#L85)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[uuid](../wiki/api.entities.Account.Account#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Entity.ts#L46)

## Methods

### checkPermissions

▸ **checkPermissions**(`permissions`): `Promise`<[`CheckPermissionsResult`](../wiki/types.CheckPermissionsResult)<[`Account`](../wiki/types.SignerType#account)\>\>

Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `permissions` | [`SimplePermissions`](../wiki/types.SimplePermissions) |

#### Returns

`Promise`<[`CheckPermissionsResult`](../wiki/types.CheckPermissionsResult)<[`Account`](../wiki/types.SignerType#account)\>\>

which permissions the Account is missing (if any) and the final result

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[checkPermissions](../wiki/api.entities.Account.Account#checkpermissions)

___

### details

▸ **details**(): `Promise`<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types.MultiSigDetails)\>

Return details about this MultiSig such as the signing Accounts and the required number of signatures to execute a MultiSigProposal

#### Returns

`Promise`<[`MultiSigDetails`](../wiki/api.entities.Account.MultiSig.types.MultiSigDetails)\>

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this Account exists on chain

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[exists](../wiki/api.entities.Account.Account#exists)

___

### getBalance

▸ **getBalance**(): `Promise`<[`Balance`](../wiki/types.Balance)\>

Get the free/locked POLYX balance of the Account

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`Balance`](../wiki/types.Balance)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getBalance](../wiki/api.entities.Account.Account#getbalance)

▸ **getBalance**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`Balance`](../wiki/types.Balance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getBalance](../wiki/api.entities.Account.Account#getbalance)

___

### getCreator

▸ **getCreator**(): `Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

Returns the Identity of the MultiSig creator. This Identity can add or remove signers directly without creating a MultiSigProposal first.

#### Returns

`Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### getCurrentNonce

▸ **getCurrentNonce**(): `Promise`<`BigNumber`\>

Retrieve the current nonce for this Account

#### Returns

`Promise`<`BigNumber`\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getCurrentNonce](../wiki/api.entities.Account.Account#getcurrentnonce)

___

### getIdentity

▸ **getIdentity**(): `Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to this Account (null if there is none)

#### Returns

`Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getIdentity](../wiki/api.entities.Account.Account#getidentity)

___

### getMultiSig

▸ **getMultiSig**(): `Promise`<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

#### Returns

`Promise`<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getMultiSig](../wiki/api.entities.Account.Account#getmultisig)

___

### getPermissions

▸ **getPermissions**(): `Promise`<[`Permissions`](../wiki/types.Permissions)\>

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

**`Throws`**

 if there is no Identity associated with the Account

#### Returns

`Promise`<[`Permissions`](../wiki/types.Permissions)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getPermissions](../wiki/api.entities.Account.Account#getpermissions)

___

### getPolyxTransactions

▸ **getPolyxTransactions**(`filters`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types.HistoricPolyxTransaction)\>\>

Returns POLYX transactions associated with this account

**`Note`**

 uses the middleware

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filters` | `Object` | - |
| `filters.size?` | `BigNumber` | page size |
| `filters.start?` | `BigNumber` | page offset |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HistoricPolyxTransaction`](../wiki/api.entities.Account.types.HistoricPolyxTransaction)\>\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getPolyxTransactions](../wiki/api.entities.Account.Account#getpolyxtransactions)

___

### getProposal

▸ **getProposal**(`args`): `Promise`<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

Given an ID, fetch a [MultiSigProposal](../wiki/api.entities.MultiSigProposal.MultiSigProposal) for this MultiSig

**`Throws`**

 if the MultiSigProposal is not found

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)\>

___

### getProposals

▸ **getProposals**(): `Promise`<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

Return all [MultiSigProposal](../wiki/api.entities.MultiSigProposal.MultiSigProposal) for this MultiSig Account

#### Returns

`Promise`<[`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)[]\>

___

### getSubsidy

▸ **getSubsidy**(): `Promise`<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

Get the subsidized balance of this Account and the subsidizer Account. If
  this Account isn't being subsidized, return null

**`Note`**

 can be subscribed to

**`Deprecated`**

 in favour of [subsidies.getSubsidizer](../wiki/api.entities.Subsidies.Subsidies#getsubsidizer)

#### Returns

`Promise`<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getSubsidy](../wiki/api.entities.Account.Account#getsubsidy)

▸ **getSubsidy**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getSubsidy](../wiki/api.entities.Account.Account#getsubsidy)

___

### getTransactionHistory

▸ **getTransactionHistory**(`filters?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`ExtrinsicData`](../wiki/types.ExtrinsicData)\>\>

Retrieve a list of transactions signed by this Account. Can be filtered using parameters

**`Note`**

 if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account.
Also, for ordering by block_id, one should pass `ExtrinsicsOrderBy.CreatedAtAsc` or `ExtrinsicsOrderBy.CreatedAtDesc`
in order of their choice (since block ID is a string field in middleware v2)

**`Note`**

 uses the middleware v2

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

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`ExtrinsicData`](../wiki/types.ExtrinsicData)\>\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getTransactionHistory](../wiki/api.entities.Account.Account#gettransactionhistory)

___

### getTypeInfo

▸ **getTypeInfo**(): `Promise`<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

Retrieve the type of Account, and its relation to an Identity, if applicable

#### Returns

`Promise`<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[getTypeInfo](../wiki/api.entities.Account.Account#gettypeinfo)

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

[Account](../wiki/api.entities.Account.Account).[isEqual](../wiki/api.entities.Account.Account#isequal)

___

### isFrozen

▸ **isFrozen**(): `Promise`<`boolean`\>

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

**`Note`**

 returns false if the Account isn't associated to any Identity

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[isFrozen](../wiki/api.entities.Account.Account#isfrozen)

___

### modify

▸ **modify**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [modify.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Pick`<[`ModifyMultiSigParams`](../wiki/api.procedures.types.ModifyMultiSigParams), ``"signers"``\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### toHuman

▸ **toHuman**(): `string`

Return the Account's address

#### Returns

`string`

#### Inherited from

[Account](../wiki/api.entities.Account.Account).[toHuman](../wiki/api.entities.Account.Account#tohuman)

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

[Account](../wiki/api.entities.Account.Account).[generateUuid](../wiki/api.entities.Account.Account#generateuuid)

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

[Account](../wiki/api.entities.Account.Account).[unserialize](../wiki/api.entities.Account.Account#unserialize)
