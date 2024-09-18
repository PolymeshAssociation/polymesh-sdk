# Class: Account

[api/entities/Account](../wiki/api.entities.Account).Account

Represents an Account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<`UniqueIdentifiers`, `string`\>

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

[api/entities/Account/index.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/index.ts#L74)

___

### authorizations

• **authorizations**: [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)<[`Account`](../wiki/api.entities.Account.Account)\>

#### Defined in

[api/entities/Account/index.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/index.ts#L83)

___

### key

• **key**: `string`

A hex representation of the cryptographic public key of the Account. This is consistent across
Substrate chains, while the address depends on the chain as well.

#### Defined in

[api/entities/Account/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/index.ts#L80)

___

### subsidies

• **subsidies**: [`Subsidies`](../wiki/api.entities.Subsidies.Subsidies)

#### Defined in

[api/entities/Account/index.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/index.ts#L84)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

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

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this Account exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

___

### getBalance

▸ **getBalance**(): `Promise`<[`Balance`](../wiki/types.Balance)\>

Get the free/locked POLYX balance of the Account

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`Balance`](../wiki/types.Balance)\>

▸ **getBalance**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`Balance`](../wiki/types.Balance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### getCurrentNonce

▸ **getCurrentNonce**(): `Promise`<`BigNumber`\>

Retrieve the current nonce for this Account

#### Returns

`Promise`<`BigNumber`\>

___

### getIdentity

▸ **getIdentity**(): `Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Retrieve the Identity associated to this Account (null if there is none)

#### Returns

`Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### getMultiSig

▸ **getMultiSig**(): `Promise`<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null

#### Returns

`Promise`<``null`` \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

___

### getPermissions

▸ **getPermissions**(): `Promise`<[`Permissions`](../wiki/types.Permissions)\>

Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity

**`Throws`**

 if there is no Identity associated with the Account

#### Returns

`Promise`<[`Permissions`](../wiki/types.Permissions)\>

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

▸ **getSubsidy**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

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

___

### getTypeInfo

▸ **getTypeInfo**(): `Promise`<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

Retrieve the type of Account, and its relation to an Identity, if applicable

#### Returns

`Promise`<[`AccountTypeInfo`](../wiki/api.entities.Account.types.AccountTypeInfo)\>

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

### isFrozen

▸ **isFrozen**(): `Promise`<`boolean`\>

Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts

**`Note`**

 returns false if the Account isn't associated to any Identity

#### Returns

`Promise`<`boolean`\>

___

### toHuman

▸ **toHuman**(): `string`

Return the Account's address

#### Returns

`string`

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
