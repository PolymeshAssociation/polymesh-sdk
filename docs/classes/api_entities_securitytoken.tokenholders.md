# Class: TokenHolders

Handles all Security Token Holders related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **TokenHolders**

## Index

### Properties

* [context](api_entities_securitytoken.tokenholders.md#protected-context)
* [parent](api_entities_securitytoken.tokenholders.md#protected-parent)

### Methods

* [get](api_entities_securitytoken.tokenholders.md#get)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Namespace](base.namespace.md).[context](base.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](api_entities_securitytoken.securitytoken.md)*

*Inherited from [Namespace](base.namespace.md).[parent](base.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L8)*

## Methods

###  get

▸ **get**(`opts`: Pick‹[TokenHolderOptions](../interfaces/api_entities_securitytoken.tokenholderoptions.md), "canBeIssuedTo"›, `paginationOpts?`: [PaginationOptions](../interfaces/types.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityBalance](../interfaces/api_entities_securitytoken.identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/api_entities_securitytoken.tokenholderproperties.md), "canBeIssuedTo"›››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/SecurityToken/TokenHolders.ts#L27)*

Retrieve all the token holders with balance

**`note`** supports pagination

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`opts` | Pick‹[TokenHolderOptions](../interfaces/api_entities_securitytoken.tokenholderoptions.md), "canBeIssuedTo"› | object that represents whether extra properties should be fetched for each token holder  |
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) | - |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityBalance](../interfaces/api_entities_securitytoken.identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/api_entities_securitytoken.tokenholderproperties.md), "canBeIssuedTo"›››*

▸ **get**(`paginationOpts?`: [PaginationOptions](../interfaces/types.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityBalance](../interfaces/api_entities_securitytoken.identitybalance.md)››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/SecurityToken/TokenHolders.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[IdentityBalance](../interfaces/api_entities_securitytoken.identitybalance.md)››*
