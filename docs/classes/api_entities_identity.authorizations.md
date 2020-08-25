# Class: Authorizations

Handles all Identity Authorization related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[Identity](api_entities_identity.identity.md)›

  ↳ **Authorizations**

## Index

### Properties

* [context](api_entities_identity.authorizations.md#protected-context)
* [parent](api_entities_identity.authorizations.md#protected-parent)

### Methods

* [getReceived](api_entities_identity.authorizations.md#getreceived)
* [getSent](api_entities_identity.authorizations.md#getsent)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Namespace](base.namespace.md).[context](base.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[Identity](api_entities_identity.identity.md)*

*Inherited from [Namespace](base.namespace.md).[parent](base.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L8)*

## Methods

###  getReceived

▸ **getReceived**(`paginationOpts?`: [PaginationOptions](../interfaces/types.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[AuthorizationRequest](api_entities.authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/Identity/Authorizations.ts#L28)*

Fetch all pending authorization requests for which this identity is the target

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[AuthorizationRequest](api_entities.authorizationrequest.md)››*

___

###  getSent

▸ **getSent**(`paginationOpts?`: [PaginationOptions](../interfaces/types.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[AuthorizationRequest](api_entities.authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/Identity/Authorizations.ts#L62)*

Fetch all pending authorization requests issued by this identity

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[AuthorizationRequest](api_entities.authorizationrequest.md)››*
