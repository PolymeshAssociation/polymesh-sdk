# Class: AuthorizationRequest

[api/entities/AuthorizationRequest](../wiki/api.entities.AuthorizationRequest).AuthorizationRequest

Represents a request made by an Identity to another Identity (or Account) for some sort of authorization. This has multiple uses. For example, if Alice
  wants to transfer ownership of one of her Assets to Bob, this method emits an authorization request for Bob,
  who then has to accept it in order to complete the ownership transfer

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.AuthorizationRequest.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.AuthorizationRequest.HumanReadable)\>

  ↳ **`AuthorizationRequest`**

## Table of contents

### Properties

- [authId](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#authid)
- [data](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#data)
- [expiry](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#expiry)
- [issuer](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#issuer)
- [target](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#target)
- [uuid](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#uuid)

### Methods

- [accept](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#accept)
- [exists](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#exists)
- [isEqual](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#isequal)
- [isExpired](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#isexpired)
- [remove](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#remove)
- [toHuman](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#tohuman)
- [generateUuid](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#generateuuid)
- [unserialize](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest#unserialize)

## Properties

### authId

• **authId**: `BigNumber`

internal identifier for the Request (used to accept/reject/cancel)

#### Defined in

[api/entities/AuthorizationRequest.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L100)

___

### data

• **data**: [`Authorization`](../wiki/api.entities.types#authorization)

Authorization Request data corresponding to type of Authorization

| Type                            | Data                            |
|---------------------------------|---------------------------------|
| Add Relayer Paying Key          | Beneficiary, Relayer, Allowance |
| Become Agent                    | Permission Group                |
| Attest Primary Key Rotation     | DID                             |
| Rotate Primary Key              | N/A                             |
| Rotate Primary Key to Secondary | Permissions                     |
| Transfer Ticker                 | Ticker                          |
| Add MultiSig Signer             | Account                         |
| Transfer Asset Ownership        | Ticker                          |
| Join Identity                   | Permissions                     |
| Portfolio Custody               | Portfolio                       |

#### Defined in

[api/entities/AuthorizationRequest.ts:89](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L89)

___

### expiry

• **expiry**: ``null`` \| `Date`

date at which the Authorization Request expires and can no longer be accepted.
  At this point, a new Authorization Request must be emitted. Null if the Request never expires

#### Defined in

[api/entities/AuthorizationRequest.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L95)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity that emitted the request

#### Defined in

[api/entities/AuthorizationRequest.ts:71](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L71)

___

### target

• **target**: [`Signer`](../wiki/api.entities.types#signer)

Identity or Account to which the request was emitted

#### Defined in

[api/entities/AuthorizationRequest.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L66)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Entity.ts#L46)

## Methods

### accept

▸ **accept**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Accept the Authorization Request. You must be the target of the Request to be able to accept it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [accept.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/AuthorizationRequest.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L193)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Authorization Request exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/AuthorizationRequest.ts:222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L222)

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

### isExpired

▸ **isExpired**(): `boolean`

Returns whether the Authorization Request has expired

#### Returns

`boolean`

#### Defined in

[api/entities/AuthorizationRequest.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L213)

___

### remove

▸ **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove the Authorization Request

- If you are the Request issuer, this will cancel the Authorization
- If you are the Request target, this will reject the Authorization

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/AuthorizationRequest.ts:206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L206)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.AuthorizationRequest.HumanReadable)

Return the Authorization's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.AuthorizationRequest.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/AuthorizationRequest.ts:236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/AuthorizationRequest.ts#L236)

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
