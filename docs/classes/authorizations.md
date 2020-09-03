# Class: Authorizations

Handles all Identity Authorization related functionality

## Hierarchy

* Namespace‹[Identity](identity.md)›

  ↳ **Authorizations**

## Index

### Properties

* [context](authorizations.md#protected-context)
* [parent](authorizations.md#protected-parent)

### Methods

* [getReceived](authorizations.md#getreceived)
* [getSent](authorizations.md#getsent)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/257c8c9/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[Identity](identity.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/257c8c9/src/base/Namespace.ts#L10)*

## Methods

###  getReceived

▸ **getReceived**(`paginationOpts?`: [PaginationOptions](../interfaces/paginationoptions.md)): *Promise‹[ResultSet](../interfaces/resultset.md)‹[AuthorizationRequest](authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:30](https://github.com/PolymathNetwork/polymesh-sdk/blob/257c8c9/src/api/entities/Identity/Authorizations.ts#L30)*

Fetch all pending authorization requests for which this identity is the target

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[AuthorizationRequest](authorizationrequest.md)››*

___

###  getSent

▸ **getSent**(`paginationOpts?`: [PaginationOptions](../interfaces/paginationoptions.md)): *Promise‹[ResultSet](../interfaces/resultset.md)‹[AuthorizationRequest](authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:64](https://github.com/PolymathNetwork/polymesh-sdk/blob/257c8c9/src/api/entities/Identity/Authorizations.ts#L64)*

Fetch all pending authorization requests issued by this identity

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[AuthorizationRequest](authorizationrequest.md)››*
