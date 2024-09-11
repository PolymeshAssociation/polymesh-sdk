# Class: Checkpoint

[api/entities/Checkpoint](../wiki/api.entities.Checkpoint).Checkpoint

Represents a snapshot of the Asset's holders and their respective balances
  at a certain point in time

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.Checkpoint.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.Checkpoint.HumanReadable)\>

  ↳ **`Checkpoint`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.Checkpoint.Checkpoint#asset)
- [id](../wiki/api.entities.Checkpoint.Checkpoint#id)
- [uuid](../wiki/api.entities.Checkpoint.Checkpoint#uuid)

### Methods

- [allBalances](../wiki/api.entities.Checkpoint.Checkpoint#allbalances)
- [balance](../wiki/api.entities.Checkpoint.Checkpoint#balance)
- [createdAt](../wiki/api.entities.Checkpoint.Checkpoint#createdat)
- [exists](../wiki/api.entities.Checkpoint.Checkpoint#exists)
- [isEqual](../wiki/api.entities.Checkpoint.Checkpoint#isequal)
- [toHuman](../wiki/api.entities.Checkpoint.Checkpoint#tohuman)
- [totalSupply](../wiki/api.entities.Checkpoint.Checkpoint#totalsupply)
- [generateUuid](../wiki/api.entities.Checkpoint.Checkpoint#generateuuid)
- [unserialize](../wiki/api.entities.Checkpoint.Checkpoint#unserialize)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset whose balances are being recorded in this Checkpoint

#### Defined in

[api/entities/Checkpoint.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L52)

___

### id

• **id**: `BigNumber`

Checkpoint identifier number

#### Defined in

[api/entities/Checkpoint.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L47)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

## Methods

### allBalances

▸ **allBalances**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>

Retrieve all Asset Holder balances at this Checkpoint

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`IdentityBalance`](../wiki/api.entities.Asset.types.IdentityBalance)\>\>

**`Note`**

supports pagination

**`Note`**

current Asset holders who didn't hold any tokens when the Checkpoint was created will be listed with a balance of 0.
This arises from a chain storage optimization and pagination.

**`See`**

[balance](../wiki/api.entities.Checkpoint.Checkpoint#balance) for a more detailed explanation of the logic

#### Defined in

[api/entities/Checkpoint.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L109)

___

### balance

▸ **balance**(`args?`): `Promise`\<`BigNumber`\>

Retrieve the balance of a specific Asset Holder Identity at this Checkpoint

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.identity` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | defaults to the signing Identity |

#### Returns

`Promise`\<`BigNumber`\>

**`Note`**

A checkpoint only records balances when they change. The implementation is to query for all balance updates for [ticker, did] pair.
If no balance updates have happened since the Checkpoint has been created, then the storage will not have an entry for the user. Instead the current balance should be used.
The balance is stored only when the Identity makes a transaction after a Checkpoint is created. This helps keep storage usage to a minimum

#### Defined in

[api/entities/Checkpoint.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L201)

___

### createdAt

▸ **createdAt**(): `Promise`\<`Date`\>

Retrieve this Checkpoint's creation date

#### Returns

`Promise`\<`Date`\>

#### Defined in

[api/entities/Checkpoint.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L87)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Checkpoint exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Checkpoint.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L245)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.Checkpoint.HumanReadable)

Return the Checkpoint's ticker and identifier

#### Returns

[`HumanReadable`](../wiki/api.entities.Checkpoint.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Checkpoint.ts:265](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L265)

___

### totalSupply

▸ **totalSupply**(): `Promise`\<`BigNumber`\>

Retrieve the Asset's total supply at this checkpoint

#### Returns

`Promise`\<`BigNumber`\>

#### Defined in

[api/entities/Checkpoint.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Checkpoint.ts#L69)

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

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
