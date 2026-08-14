[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/AuthorizationRequest

# api/entities/AuthorizationRequest

## Classes

### AuthorizationRequest

Defined in: [api/entities/AuthorizationRequest.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L51)

Represents a request made by an Identity to another Identity (or Account) for some sort of authorization. This has multiple uses. For example, if Alice
  wants to transfer ownership of one of her Assets to Bob, this method emits an authorization request for Bob,
  who then has to accept it in order to complete the ownership transfer

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### authId

> **authId**: `BigNumber`

Defined in: [api/entities/AuthorizationRequest.ts:99](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L99)

internal identifier for the Request (used to accept/reject/cancel)

##### data

> **data**: [`Authorization`](../wiki/api.entities.types#authorization)

Defined in: [api/entities/AuthorizationRequest.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L88)

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

##### expiry

> **expiry**: `Date` \| `null`

Defined in: [api/entities/AuthorizationRequest.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L94)

date at which the Authorization Request expires and can no longer be accepted.
  At this point, a new Authorization Request must be emitted. Null if the Request never expires

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/AuthorizationRequest.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L70)

Identity that emitted the request

##### target

> **target**: [`Signer`](../wiki/api.entities.types#signer)

Defined in: [api/entities/AuthorizationRequest.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L65)

Identity or Account to which the request was emitted

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### accept()

> **accept**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/AuthorizationRequest.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L185)

Accept the Authorization Request. You must be the target of the Request to be able to accept it

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [accept.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/AuthorizationRequest.ts:207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L207)

Determine whether this Authorization Request exists on chain

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

##### isExpired()

> **isExpired**(): `boolean`

Defined in: [api/entities/AuthorizationRequest.ts:198](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L198)

Returns whether the Authorization Request has expired

###### Returns

`boolean`

##### remove()

> **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/AuthorizationRequest.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L193)

Remove the Authorization Request

- If you are the Request issuer, this will cancel the Authorization
- If you are the Request target, this will reject the Authorization

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/AuthorizationRequest.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L221)

Return the Authorization's static data

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

Defined in: [api/entities/AuthorizationRequest.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L31)

#### Properties

##### data

> **data**: [`HumanReadableType`](../wiki/types.utils#humanreadabletype)\<[`Authorization`](../wiki/api.entities.types#authorization)\>

Defined in: [api/entities/AuthorizationRequest.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L35)

##### expiry

> **expiry**: `string` \| `null`

Defined in: [api/entities/AuthorizationRequest.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L33)

##### id

> **id**: `string`

Defined in: [api/entities/AuthorizationRequest.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L36)

##### issuer

> **issuer**: `string`

Defined in: [api/entities/AuthorizationRequest.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L32)

##### target

> **target**: [`SignerValue`](../wiki/api.entities.types#signervalue)

Defined in: [api/entities/AuthorizationRequest.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L34)

***

### Params

Defined in: [api/entities/AuthorizationRequest.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L39)

#### Properties

##### data

> **data**: [`Authorization`](../wiki/api.entities.types#authorization)

Defined in: [api/entities/AuthorizationRequest.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L43)

##### expiry

> **expiry**: `Date` \| `null`

Defined in: [api/entities/AuthorizationRequest.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L42)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/entities/AuthorizationRequest.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L41)

##### target

> **target**: [`Signer`](../wiki/api.entities.types#signer)

Defined in: [api/entities/AuthorizationRequest.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L40)

***

### UniqueIdentifiers

Defined in: [api/entities/AuthorizationRequest.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L27)

#### Properties

##### authId

> **authId**: `BigNumber`

Defined in: [api/entities/AuthorizationRequest.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/AuthorizationRequest.ts#L28)
