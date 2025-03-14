# Class: MultiSigProposal

[api/entities/MultiSigProposal](../wiki/api.entities.MultiSigProposal).MultiSigProposal

A proposal for a MultiSig transaction. This is a wrapper around an extrinsic that will be executed when the amount of approvals reaches the signature threshold set on the MultiSig Account

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<`UniqueIdentifiers`, [`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)\>

  ↳ **`MultiSigProposal`**

## Table of contents

### Properties

- [id](../wiki/api.entities.MultiSigProposal.MultiSigProposal#id)
- [multiSig](../wiki/api.entities.MultiSigProposal.MultiSigProposal#multisig)
- [uuid](../wiki/api.entities.MultiSigProposal.MultiSigProposal#uuid)

### Methods

- [approve](../wiki/api.entities.MultiSigProposal.MultiSigProposal#approve)
- [createdAt](../wiki/api.entities.MultiSigProposal.MultiSigProposal#createdat)
- [creator](../wiki/api.entities.MultiSigProposal.MultiSigProposal#creator)
- [details](../wiki/api.entities.MultiSigProposal.MultiSigProposal#details)
- [exists](../wiki/api.entities.MultiSigProposal.MultiSigProposal#exists)
- [isEqual](../wiki/api.entities.MultiSigProposal.MultiSigProposal#isequal)
- [reject](../wiki/api.entities.MultiSigProposal.MultiSigProposal#reject)
- [toHuman](../wiki/api.entities.MultiSigProposal.MultiSigProposal#tohuman)
- [votes](../wiki/api.entities.MultiSigProposal.MultiSigProposal#votes)
- [generateUuid](../wiki/api.entities.MultiSigProposal.MultiSigProposal#generateuuid)
- [isUniqueIdentifiers](../wiki/api.entities.MultiSigProposal.MultiSigProposal#isuniqueidentifiers)
- [unserialize](../wiki/api.entities.MultiSigProposal.MultiSigProposal#unserialize)

## Properties

### id

• **id**: `BigNumber`

#### Defined in

[api/entities/MultiSigProposal/index.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L52)

___

### multiSig

• **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

#### Defined in

[api/entities/MultiSigProposal/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L51)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L46)

## Methods

### approve

▸ **approve**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Approve this MultiSig proposal

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [approve.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/MultiSigProposal/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L96)

___

### createdAt

▸ **createdAt**(): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal was created

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/MultiSigProposal/index.ts:282](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L282)

___

### creator

▸ **creator**(): `Promise`\<``null`` \| [`Account`](../wiki/api.entities.Account.Account)\>

Retrieve the account which created this MultiSig Proposal

#### Returns

`Promise`\<``null`` \| [`Account`](../wiki/api.entities.Account.Account)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/MultiSigProposal/index.ts:297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L297)

___

### details

▸ **details**(): `Promise`\<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)\>

Fetches the details of the Proposal. This includes the amount of approvals and rejections, the expiry, and details of the wrapped extrinsic

#### Returns

`Promise`\<[`MultiSigProposalDetails`](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)\>

#### Defined in

[api/entities/MultiSigProposal/index.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L113)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determines whether this Proposal exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/MultiSigProposal/index.ts:179](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L179)

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

### reject

▸ **reject**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Reject this MultiSig proposal

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [reject.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/MultiSigProposal/index.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L106)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)

Returns a human readable representation

#### Returns

[`HumanReadable`](../wiki/api.entities.MultiSigProposal.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/MultiSigProposal/index.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L201)

___

### votes

▸ **votes**(): `Promise`\<[`MultiSigProposalVote`](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)[]\>

Fetches the individual votes for this MultiSig proposal and their identifier data (block number, date and event index) of the event that was emitted when this MultiSig Proposal Vote was casted

#### Returns

`Promise`\<[`MultiSigProposalVote`](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)[]\>

**`Note`**

uses the middlewareV2

#### Defined in

[api/entities/MultiSigProposal/index.ts:218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/MultiSigProposal/index.ts#L218)

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

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Entity.ts#L23)
