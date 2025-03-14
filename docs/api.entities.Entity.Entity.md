# Class: Entity\<UniqueIdentifiers, HumanReadable\>

[api/entities/Entity](../wiki/api.entities.Entity).Entity

Represents an object or resource in the Polymesh Ecosystem with its own set of properties and functionality

## Type parameters

| Name |
| :------ |
| `UniqueIdentifiers` |
| `HumanReadable` |

## Hierarchy

- **`Entity`**

  ↳ [`Account`](../wiki/api.entities.Account.Account)

  ↳ [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)

  ↳ [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)

  ↳ [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)

  ↳ [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)

  ↳ [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule)

  ↳ [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase.CorporateActionBase)

  ↳ [`Identity`](../wiki/api.entities.Identity.Identity)

  ↳ [`Instruction`](../wiki/api.entities.Instruction.Instruction)

  ↳ [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)

  ↳ [`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)

  ↳ [`Offering`](../wiki/api.entities.Offering.Offering)

  ↳ [`PermissionGroup`](../wiki/api.entities.PermissionGroup.PermissionGroup)

  ↳ [`Portfolio`](../wiki/api.entities.Portfolio.Portfolio)

  ↳ [`Subsidy`](../wiki/api.entities.Subsidy.Subsidy)

  ↳ [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)

  ↳ [`Venue`](../wiki/api.entities.Venue.Venue)

## Table of contents

### Properties

- [uuid](../wiki/api.entities.Entity.Entity#uuid)

### Methods

- [exists](../wiki/api.entities.Entity.Entity#exists)
- [isEqual](../wiki/api.entities.Entity.Entity#isequal)
- [toHuman](../wiki/api.entities.Entity.Entity#tohuman)
- [generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)
- [isUniqueIdentifiers](../wiki/api.entities.Entity.Entity#isuniqueidentifiers)
- [unserialize](../wiki/api.entities.Entity.Entity#unserialize)

## Properties

### uuid

• **uuid**: `string`

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### exists

▸ `Abstract` **exists**(): `Promise`\<`boolean`\>

Determine whether this Entity exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[api/entities/Entity.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L68)

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

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L61)

___

### toHuman

▸ `Abstract` **toHuman**(): `HumanReadable`

Returns Entity data in a human readable (JSON) format

#### Returns

`HumanReadable`

#### Defined in

[api/entities/Entity.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L73)

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

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L14)

___

### isUniqueIdentifiers

▸ `Static` **isUniqueIdentifiers**(`identifiers`): `boolean`

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `identifiers` | `unknown` | object to type check |

#### Returns

`boolean`

#### Defined in

[api/entities/Entity.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L42)

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

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
