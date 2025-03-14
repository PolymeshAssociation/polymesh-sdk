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
- [staking](../wiki/api.entities.Account.Account#staking)
- [subsidies](../wiki/api.entities.Account.Account#subsidies)
- [uuid](../wiki/api.entities.Account.Account#uuid)

### Methods

- [checkPermissions](../wiki/api.entities.Account.Account#checkpermissions)
- [exists](../wiki/api.entities.Account.Account#exists)
- [getBalance](../wiki/api.entities.Account.Account#getbalance)
- [getCurrentNonce](../wiki/api.entities.Account.Account#getcurrentnonce)
- [getIdentity](../wiki/api.entities.Account.Account#getidentity)
- [getMultiSig](../wiki/api.entities.Account.Account#getmultisig)
- [getNextAssetId](../wiki/api.entities.Account.Account#getnextassetid)
- [getOffChainReceipts](../wiki/api.entities.Account.Account#getoffchainreceipts)
- [getPendingProposals](../wiki/api.entities.Account.Account#getpendingproposals)
- [getPermissions](../wiki/api.entities.Account.Account#getpermissions)
- [getPolyxTransactions](../wiki/api.entities.Account.Account#getpolyxtransactions)
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

[api/entities/Account/index.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L90)

___

### authorizations

• **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)\<[`Account`](../wiki/api.entities.Account.Account)\>

#### Defined in

[api/entities/Account/index.ts:99](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L99)

___

### key

• **key**: `string`

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

#### Defined in

[api/entities/Account/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L96)

___

### staking

• **staking**: [`Staking`](../wiki/api.entities.Account.Staking.Staking)

#### Defined in

[api/entities/Account/index.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L101)

___

### subsidies

• **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies.Subsidies)

#### Defined in

[api/entities/Account/index.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L100)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

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

[api/entities/Account/index.ts:372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L372)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Account exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Account/index.ts:455](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L455)

___

### getBalance

▸ **getBalance**(): `Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

Get the free/locked POLYX balance of the Account

#### Returns

`Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Account/index.ts:125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L125)

▸ **getBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Balance`](../wiki/api.entities.Account.types.Balance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/index.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L126)

___

### getCurrentNonce

▸ **getCurrentNonce**(): `Promise`\<`BigNumber`\>

Retrieve the current nonce for this Account

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Account/index.ts:469](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L469)

___

### getIdentity

▸ **getIdentity**(): `Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to this Account (null if there is none)

#### Returns

`Promise`\<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

#### Defined in

[api/entities/Account/index.ts:145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L145)

___

### getMultiSig

▸ **getMultiSig**(): `Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

#### Returns

`Promise`\<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

#### Defined in

[api/entities/Account/index.ts:427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L427)

___

### getNextAssetId

▸ **getNextAssetId**(): `Promise`\<`string`\>

Returns next assetID that will be generated for this Identity

#### Returns

`Promise`\<`string`\>

#### Defined in

[api/entities/Account/index.ts:614](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L614)

___

### getOffChainReceipts

▸ **getOffChainReceipts**(): `Promise`\<`BigNumber`[]\>

Returns all off chain receipts used by this Account

#### Returns

`Promise`\<`BigNumber`[]\>

#### Defined in

[api/entities/Account/index.ts:587](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L587)

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

[api/entities/Account/index.ts:571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L571)

___

### getPermissions

▸ **getPermissions**(): `Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

#### Returns

`Promise`\<[`Permissions`](../wiki/api.entities.types.Permissions)\>

**`Throws`**

if there is no Identity associated with the Account

#### Defined in

[api/entities/Account/index.ts:319](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L319)

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

[api/entities/Account/index.ts:553](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L553)

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

[api/entities/Account/index.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L181)

___

### getTypeInfo

▸ **getTypeInfo**(): `Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

Retrieve the type of Account, and its relation to an Identity, if applicable

#### Returns

`Promise`\<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

#### Defined in

[api/entities/Account/index.ts:490](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L490)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### isFrozen

▸ **isFrozen**(): `Promise`\<`boolean`\>

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

#### Returns

`Promise`\<`boolean`\>

**`Note`**

returns false if the Account isn't associated to any Identity

#### Defined in

[api/entities/Account/index.ts:298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L298)

___

### toHuman

▸ **toHuman**(): `string`

Return the Account's address

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Account/index.ts:462](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/index.ts#L462)

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

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
