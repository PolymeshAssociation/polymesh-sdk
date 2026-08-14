[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Checkpoint

# api/entities/Checkpoint

## Classes

### Checkpoint

Defined in: [api/entities/Checkpoint.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L36)

Represents a snapshot of the Asset's holders and their respective balances
  at a certain point in time

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/Checkpoint.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L55)

Asset whose balances are being recorded in this Checkpoint

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Checkpoint.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L50)

Checkpoint identifier number

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### allBalances()

> **allBalances**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityBalance`](../wiki/api.entities.Asset.types#identitybalance)\>\>

Defined in: [api/entities/Checkpoint.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L107)

Retrieve all Asset Holder balances at this Checkpoint

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`IdentityBalance`](../wiki/api.entities.Asset.types#identitybalance)\>\>

###### Note

supports pagination

###### Note

current Asset holders who didn't hold any tokens when the Checkpoint was created will be listed with a balance of 0.
This arises from a chain storage optimization and pagination.

###### See

[balance](../wiki/#balance) for a more detailed explanation of the logic

##### balance()

> **balance**(`args?`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Checkpoint.ts:209](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L209)

Retrieve the balance of a specific Asset Holder Identity at this Checkpoint

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.identity?` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | defaults to the signing Identity |

###### Returns

`Promise`\<`BigNumber`\>

###### Note

A checkpoint only records balances when they change. The implementation is to query for all balance updates for [ticker, did] pair.
If no balance updates have happened since the Checkpoint has been created, then the storage will not have an entry for the user. Instead the current balance should be used.
The balance is stored only when the Identity makes a transaction after a Checkpoint is created. This helps keep storage usage to a minimum

##### createdAt()

> **createdAt**(): `Promise`\<`Date`\>

Defined in: [api/entities/Checkpoint.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L87)

Retrieve this Checkpoint's creation date

###### Returns

`Promise`\<`Date`\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Checkpoint.ts:254](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L254)

Determine whether this Checkpoint exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

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

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/Checkpoint.ts:276](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L276)

Return the Checkpoint's ticker and identifier

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### totalSupply()

> **totalSupply**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Checkpoint.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L72)

Retrieve the Asset's total supply at this checkpoint

###### Returns

`Promise`\<`BigNumber`\>

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

## Interfaces

### HumanReadable

Defined in: [api/entities/Checkpoint.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L27)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/Checkpoint.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L29)

##### id

> **id**: `string`

Defined in: [api/entities/Checkpoint.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L28)

***

### UniqueIdentifiers

Defined in: [api/entities/Checkpoint.ts:22](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L22)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/Checkpoint.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L24)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Checkpoint.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Checkpoint.ts#L23)
