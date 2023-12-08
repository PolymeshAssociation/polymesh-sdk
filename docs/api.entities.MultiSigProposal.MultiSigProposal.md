# Class: MultiSigProposal

[api/entities/MultiSigProposal](../wiki/api.entities.MultiSigProposal).MultiSigProposal

A proposal for a MultiSig transaction. This is a wrapper around an extrinsic that will be executed when the amount of approvals reaches the signature threshold set on the MultiSig Account

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)<`UniqueIdentifiers`, [`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)\>

  ↳ **`MultiSigProposal`**

## Table of contents

### Properties

- [id](../wiki/api.entities.MultiSigProposal.MultiSigProposal#id)
- [multiSig](../wiki/api.entities.MultiSigProposal.MultiSigProposal#multisig)
- [uuid](../wiki/api.entities.MultiSigProposal.MultiSigProposal#uuid)

### Methods

- [details](../wiki/api.entities.MultiSigProposal.MultiSigProposal#details)
- [exists](../wiki/api.entities.MultiSigProposal.MultiSigProposal#exists)
- [isEqual](../wiki/api.entities.MultiSigProposal.MultiSigProposal#isequal)
- [toHuman](../wiki/api.entities.MultiSigProposal.MultiSigProposal#tohuman)
- [generateUuid](../wiki/api.entities.MultiSigProposal.MultiSigProposal#generateuuid)
- [isUniqueIdentifiers](../wiki/api.entities.MultiSigProposal.MultiSigProposal#isuniqueidentifiers)
- [unserialize](../wiki/api.entities.MultiSigProposal.MultiSigProposal#unserialize)

## Properties

### id

• **id**: `BigNumber`

#### Defined in

[api/entities/MultiSigProposal/index.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/index.ts#L30)

___

### multiSig

• **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

#### Defined in

[api/entities/MultiSigProposal/index.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/MultiSigProposal/index.ts#L29)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Entity.ts#L46)

## Methods

### details

▸ **details**(): `Promise`<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)\>

Fetches the details of the Proposal. This includes the amount of approvals and rejections, the expiry, and details of the wrapped extrinsic

#### Returns

`Promise`<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)\>

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determines whether this Proposal exists on chain

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

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

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)

Returns a human readable representation

#### Returns

[`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)

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

### isUniqueIdentifiers

▸ `Static` **isUniqueIdentifiers**(`identifiers`): `boolean`

Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `identifiers` | `unknown` | object to type check |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isUniqueIdentifiers](../wiki/api.entities.Entity.Entity#isuniqueidentifiers)

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
