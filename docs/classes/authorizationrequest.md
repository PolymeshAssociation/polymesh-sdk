# Class: AuthorizationRequest

Represents a request made by an identity to another identity for some sort of authorization. This has multiple uses. For example, if Alice
wants to transfer ownership of her asset ALICETOKEN to Bob, an authorization request gets emitted to Bob,
who then has to accept it in order for the ownership transfer to be complete

## Hierarchy

* [Entity](entity.md)‹UniqueIdentifiers›

  ↳ **AuthorizationRequest**

## Index

### Properties

* [authId](authorizationrequest.md#authid)
* [context](authorizationrequest.md#protected-context)
* [data](authorizationrequest.md#data)
* [expiry](authorizationrequest.md#expiry)
* [issuerIdentity](authorizationrequest.md#issueridentity)
* [targetIdentity](authorizationrequest.md#targetidentity)
* [uuid](authorizationrequest.md#uuid)

### Methods

* [accept](authorizationrequest.md#accept)
* [remove](authorizationrequest.md#remove)
* [generateUuid](authorizationrequest.md#static-generateuuid)
* [unserialize](authorizationrequest.md#static-unserialize)

## Properties

###  authId

• **authId**: *BigNumber*

*Defined in [src/api/entities/AuthorizationRequest.ts:71](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L71)*

internal identifier for the request (used to accept/reject/cancel)

___

### `Protected` context

• **context**: *Context*

*Inherited from [Entity](entity.md).[context](entity.md#protected-context)*

*Defined in [src/base/Entity.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Entity.ts#L49)*

___

###  data

• **data**: *[Authorization](../globals.md#authorization)*

*Defined in [src/api/entities/AuthorizationRequest.ts:60](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L60)*

authorization request data corresponding to type of authorization

| Type                       | Data   |
|----------------------------|--------|
| Attest Master Key Rotation | DID    |
| Rotate Master Key          | DID    |
| Transfer Ticker            | Ticker |
| Add MultiSig Signer        | N/A    |
| Transfer Token Ownership   | Ticker |
| Join Identity              | DID    |
| Custom                     | Custom |
| No Data                    | N/A    |

___

###  expiry

• **expiry**: *Date | null*

*Defined in [src/api/entities/AuthorizationRequest.ts:66](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L66)*

date at which the authorization request expires and can no longer be accepted.
At this point, a new authorization request must be emitted. Null if the request never expires

___

###  issuerIdentity

• **issuerIdentity**: *[Identity](identity.md)*

*Defined in [src/api/entities/AuthorizationRequest.ts:44](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L44)*

Identity that emitted the request

___

###  targetIdentity

• **targetIdentity**: *[Identity](identity.md)*

*Defined in [src/api/entities/AuthorizationRequest.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L39)*

Identity to which the request was emitted

___

###  uuid

• **uuid**: *string*

*Inherited from [Entity](entity.md).[uuid](entity.md#uuid)*

*Defined in [src/base/Entity.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Entity.ts#L47)*

## Methods

###  accept

▸ **accept**(): *Promise‹[TransactionQueue](transactionqueue.md)›*

*Defined in [src/api/entities/AuthorizationRequest.ts:93](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L93)*

Accept the authorization request. You must be the target of the request to be able to accept it

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)›*

___

###  remove

▸ **remove**(): *Promise‹[TransactionQueue](transactionqueue.md)›*

*Defined in [src/api/entities/AuthorizationRequest.ts:106](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/AuthorizationRequest.ts#L106)*

Remove the authorization request

- If you are the request issuer, this will cancel the authorization
- If you are the request target, this will reject the authorization

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)›*

___

### `Static` generateUuid

▸ **generateUuid**‹**Identifiers**›(`identifiers`: Identifiers): *string*

*Inherited from [Entity](entity.md).[generateUuid](entity.md#static-generateuuid)*

*Defined in [src/base/Entity.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Entity.ts#L15)*

Generate the Entity's UUID from its identifying properties

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`identifiers` | Identifiers |   |

**Returns:** *string*

___

### `Static` unserialize

▸ **unserialize**‹**Identifiers**›(`serialized`: string): *Identifiers*

*Inherited from [Entity](entity.md).[unserialize](entity.md#static-unserialize)*

*Defined in [src/base/Entity.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Entity.ts#L24)*

Unserialize a UUID into its Unique Identifiers

**Type parameters:**

▪ **Identifiers**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`serialized` | string | UUID to unserialize  |

**Returns:** *Identifiers*
