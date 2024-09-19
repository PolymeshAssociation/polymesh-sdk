# Class: Account

[api/entities/Account](../wiki/api.entities.Account).Account

Represents an Account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<`UniqueIdentifiers`, `string`\>

  ↳ **`Account`**

  ↳↳ [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

## Table of contents

### Properties

- [address](../wiki/api.entities.Account.Account#address)
- [authorizations](../wiki/api.entities.Account.Account#authorizations)
- [key](../wiki/api.entities.Account.Account#key)
- [subsidies](../wiki/api.entities.Account.Account#subsidies)
- [uuid](../wiki/api.entities.Account.Account#uuid)

### Methods

- [checkPermissions](../wiki/api.entities.Account.Account#checkpermissions)
- [exists](../wiki/api.entities.Account.Account#exists)
- [getBalance](../wiki/api.entities.Account.Account#getbalance)
- [getCurrentNonce](../wiki/api.entities.Account.Account#getcurrentnonce)
- [getIdentity](../wiki/api.entities.Account.Account#getidentity)
- [getMultiSig](../wiki/api.entities.Account.Account#getmultisig)
- [getOffChainReceipts](../wiki/api.entities.Account.Account#getoffchainreceipts)
- [getPendingProposals](../wiki/api.entities.Account.Account#getpendingproposals)
- [getPermissions](../wiki/api.entities.Account.Account#getpermissions)
- [getPolyxTransactions](../wiki/api.entities.Account.Account#getpolyxtransactions)
- [getSubsidy](../wiki/api.entities.Account.Account#getsubsidy)
- [getTransactionHistory](../wiki/api.entities.Account.Account#gettransactionhistory)
- [getTypeInfo](../wiki/api.entities.Account.Account#gettypeinfo)
- [isEqual](../wiki/api.entities.Account.Account#isequal)
- [isFrozen](../wiki/api.entities.Account.Account#isfrozen)
- [toHuman](../wiki/api.entities.Account.Account#tohuman)
- [generateUuid](../wiki/api.entities.Account.Account#generateuuid)
- [unserialize](../wiki/api.entities.Account.Account#unserialize)

## Properties

### address

• **address**: `string`

Polymesh-specific address of the Account. Serves as an identifier

#### Defined in

[api/entities/Account/index.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L83)

___

### authorizations

• **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)\<[`Account`](../wiki/api.entities.Account.Account)\>

#### Defined in

[api/entities/Account/index.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L92)

___

### key

• **key**: `string`

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

#### Defined in

[api/entities/Account/index.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L89)

___

### subsidies

• **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies.Subsidies)

#### Defined in

[api/entities/Account/index.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L93)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Entity.ts#L46)

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

#### Defined in

[api/entities/Account/index.ts:374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L374)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Account exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Account/index.ts:457](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L457)

___

### getBalance

▸ **getBalance**(): `Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

Get the free/locked POLYX balance of the Account

#### Returns

`Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Account/index.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L116)

▸ **getBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Balance`](../wiki/api.entities.Account.types.Balance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/index.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L117)

___

### getCurrentNonce

▸ **getCurrentNonce**(): `Promise`\<`BigNumber`\>

Retrieve the current nonce for this Account

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Account/index.ts:471](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L471)

___

### getIdentity

▸ **getIdentity**(): `Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to this Account (null if there is none)

#### Returns

`Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

#### Defined in

[api/entities/Account/index.ts:161](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L161)

___

### getMultiSig

▸ **getMultiSig**(): `Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

#### Returns

`Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

#### Defined in

[api/entities/Account/index.ts:429](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L429)

___

### getOffChainReceipts

▸ **getOffChainReceipts**(): `Promise`\<`BigNumber`[]\>

Returns all off chain receipts used by this Account

#### Returns

`Promise`\<`BigNumber`[]\>

#### Defined in

[api/entities/Account/index.ts:589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L589)

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

#### Defined in

[api/entities/Account/index.ts:573](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L573)

___

### getPermissions

▸ **getPermissions**(): `Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

#### Returns

`Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

**`Throws`**

if there is no Identity associated with the Account

#### Defined in

[api/entities/Account/index.ts:334](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L334)

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

#### Defined in

[api/entities/Account/index.ts:555](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L555)

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

#### Defined in

[api/entities/Account/index.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L141)

▸ **getSubsidy**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/index.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L142)

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

#### Defined in

[api/entities/Account/index.ts:197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L197)

___

### getTypeInfo

▸ **getTypeInfo**(): `Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

Retrieve the type of Account, and its relation to an Identity, if applicable

#### Returns

`Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

#### Defined in

[api/entities/Account/index.ts:492](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L492)

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

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Entity.ts#L61)

___

### isFrozen

▸ **isFrozen**(): `Promise`\<`boolean`\>

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

#### Returns

`Promise`\<`boolean`\>

**`Note`**

returns false if the Account isn't associated to any Identity

#### Defined in

[api/entities/Account/index.ts:313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L313)

___

### toHuman

▸ **toHuman**(): `string`

Return the Account's address

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Account/index.ts:464](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/index.ts#L464)

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

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Entity.ts#L14)

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

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Entity.ts#L23)
