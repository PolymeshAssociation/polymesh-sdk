# Class: Authorizations

Handles all Identity Authorization related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[Identity](_src_api_entities_identity_index_.identity.md)›

  ↳ **Authorizations**

## Index

### Properties

* [context](_src_api_entities_identity_authorizations_.authorizations.md#protected-context)
* [parent](_src_api_entities_identity_authorizations_.authorizations.md#protected-parent)

### Methods

* [getReceived](_src_api_entities_identity_authorizations_.authorizations.md#getreceived)
* [getSent](_src_api_entities_identity_authorizations_.authorizations.md#getsent)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[context](_src_base_namespace_.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[Identity](_src_api_entities_identity_index_.identity.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[parent](_src_base_namespace_.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Namespace.ts#L8)*

## Methods

###  getReceived

▸ **getReceived**(`paginationOpts?`: [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[AuthorizationRequest](_src_api_entities_authorizationrequest_.authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Identity/Authorizations.ts#L28)*

Fetch all pending authorization requests for which this identity is the target

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[AuthorizationRequest](_src_api_entities_authorizationrequest_.authorizationrequest.md)››*

___

###  getSent

▸ **getSent**(`paginationOpts?`: [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[AuthorizationRequest](_src_api_entities_authorizationrequest_.authorizationrequest.md)››*

*Defined in [src/api/entities/Identity/Authorizations.ts:62](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/Identity/Authorizations.ts#L62)*

Fetch all pending authorization requests issued by this identity

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[AuthorizationRequest](_src_api_entities_authorizationrequest_.authorizationrequest.md)››*
