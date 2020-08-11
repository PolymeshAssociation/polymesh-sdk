# Class: TokenHolders

Handles all Security Token Holders related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **TokenHolders**

## Index

### Properties

* [context](_src_api_entities_securitytoken_tokenholders_.tokenholders.md#protected-context)
* [parent](_src_api_entities_securitytoken_tokenholders_.tokenholders.md#protected-parent)

### Methods

* [get](_src_api_entities_securitytoken_tokenholders_.tokenholders.md#get)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[context](_src_base_namespace_.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[parent](_src_base_namespace_.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/base/Namespace.ts#L8)*

## Methods

###  get

▸ **get**(`opts`: Pick‹[TokenHolderOptions](../interfaces/_src_api_entities_securitytoken_types_.tokenholderoptions.md), "canBeIssuedTo"›, `paginationOpts?`: [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityBalance](../interfaces/_src_api_entities_securitytoken_types_.identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/_src_api_entities_securitytoken_types_.tokenholderproperties.md), "canBeIssuedTo"›››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/TokenHolders.ts#L27)*

Retrieve all the token holders with balance

**`note`** supports pagination

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`opts` | Pick‹[TokenHolderOptions](../interfaces/_src_api_entities_securitytoken_types_.tokenholderoptions.md), "canBeIssuedTo"› | object that represents whether extra properties should be fetched for each token holder  |
`paginationOpts?` | [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md) | - |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityBalance](../interfaces/_src_api_entities_securitytoken_types_.identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/_src_api_entities_securitytoken_types_.tokenholderproperties.md), "canBeIssuedTo"›››*

▸ **get**(`paginationOpts?`: [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityBalance](../interfaces/_src_api_entities_securitytoken_types_.identitybalance.md)››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/TokenHolders.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/_src_types_index_.resultset.md)‹[IdentityBalance](../interfaces/_src_api_entities_securitytoken_types_.identitybalance.md)››*
