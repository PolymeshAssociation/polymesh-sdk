[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/MultiSigProposal

# api/entities/MultiSigProposal

## Classes

### MultiSigProposal

Defined in: [api/entities/MultiSigProposal/index.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L49)

A proposal for a MultiSig transaction. This is a wrapper around an extrinsic that will be executed when the amount of approvals reaches the signature threshold set on the MultiSig Account

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`UniqueIdentifiers`, [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/entities/MultiSigProposal/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L51)

##### multiSig

> **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)

Defined in: [api/entities/MultiSigProposal/index.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L50)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### approve()

> **approve**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/MultiSigProposal/index.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L92)

Approve this MultiSig proposal

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [approve.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createdAt()

> **createdAt**(): `Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

Defined in: [api/entities/MultiSigProposal/index.ts:272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L272)

Retrieve the identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal was created

###### Returns

`Promise`\<[`EventIdentifier`](../wiki/api.client.types#eventidentifier) \| `null`\>

###### Note

uses the middlewareV2

###### Note

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

##### creator()

> **creator**(): `Promise`\<[`Account`](../wiki/api.entities.Account#account) \| `null`\>

Defined in: [api/entities/MultiSigProposal/index.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L287)

Retrieve the account which created this MultiSig Proposal

###### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account#account) \| `null`\>

###### Note

uses the middlewareV2

###### Note

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

##### details()

> **details**(): `Promise`\<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types#multisigproposaldetails)\>

Defined in: [api/entities/MultiSigProposal/index.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L102)

Fetches the details of the Proposal. This includes the amount of approvals and rejections, the expiry, and details of the wrapped extrinsic

###### Returns

`Promise`\<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types#multisigproposaldetails)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/MultiSigProposal/index.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L168)

Determines whether this Proposal exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### reject()

> **reject**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/MultiSigProposal/index.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L97)

Reject this MultiSig proposal

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [reject.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/MultiSigProposal/index.ts:190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L190)

Returns a human readable representation

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### votes()

> **votes**(): `Promise`\<[`MultiSigProposalVote`](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)[]\>

Defined in: [api/entities/MultiSigProposal/index.ts:207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L207)

Fetches the individual votes for this MultiSig proposal and their identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal Vote was casted

###### Returns

`Promise`\<[`MultiSigProposalVote`](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)[]\>

###### Note

uses the middlewareV2

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

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

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

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isUniqueIdentifiers`](../wiki/api.entities.Entity#isuniqueidentifiers)

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

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### HumanReadable

Defined in: [api/entities/MultiSigProposal/index.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L41)

#### Properties

##### id

> **id**: `string`

Defined in: [api/entities/MultiSigProposal/index.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L43)

##### multiSigAddress

> **multiSigAddress**: `string`

Defined in: [api/entities/MultiSigProposal/index.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/MultiSigProposal/index.ts#L42)
