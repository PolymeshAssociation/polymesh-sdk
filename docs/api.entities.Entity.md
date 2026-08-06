[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Entity

# api/entities/Entity

## Classes

### `abstract` Entity

Defined in: [api/entities/Entity.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L8)

Represents an object or resource in the Polymesh Ecosystem with its own set of properties and functionality

#### Extended by

- [`Account`](../wiki/api.entities.Account#account)
- [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset)
- [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)
- [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)
- [`Checkpoint`](../wiki/api.entities.Checkpoint#checkpoint)
- [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)
- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase)
- [`Identity`](../wiki/api.entities.Identity#identity)
- [`Instruction`](../wiki/api.entities.Instruction#instruction)
- [`MetadataEntry`](../wiki/api.entities.MetadataEntry#metadataentry)
- [`MultiSigProposal`](../wiki/api.entities.MultiSigProposal#multisigproposal)
- [`Offering`](../wiki/api.entities.Offering#offering)
- [`PermissionGroup`](../wiki/api.entities.PermissionGroup#abstract-permissiongroup)
- [`Portfolio`](../wiki/api.entities.Portfolio#abstract-portfolio)
- [`Subsidy`](../wiki/api.entities.Subsidy#subsidy)
- [`TickerReservation`](../wiki/api.entities.TickerReservation#tickerreservation)
- [`Venue`](../wiki/api.entities.Venue#venue)

#### Type Parameters

| Type Parameter |
| ------ |
| `UniqueIdentifiers` |
| `HumanReadable` |

#### Properties

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

#### Methods

##### exists()

> `abstract` **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Entity.ts:68](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L68)

Determine whether this Entity exists on chain

###### Returns

`Promise`\<`boolean`\>

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

##### toHuman()

> `abstract` **toHuman**(): `HumanReadable`

Defined in: [api/entities/Entity.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L73)

Returns Entity data in a human readable (JSON) format

###### Returns

`HumanReadable`

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L14)

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

##### isUniqueIdentifiers()

> `static` **isUniqueIdentifiers**(`identifiers`): `boolean`

Defined in: [api/entities/Entity.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L42)

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `unknown` | object to type check |

###### Returns

`boolean`

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L23)

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
