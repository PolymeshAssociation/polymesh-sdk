# Class: TokenHolders

Handles all Security Token Holders related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **TokenHolders**

## Index

### Properties

* [context](tokenholders.md#protected-context)
* [parent](tokenholders.md#protected-parent)

### Methods

* [get](tokenholders.md#get)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/ac1f14a/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/ac1f14a/src/base/Namespace.ts#L10)*

## Methods

###  get

▸ **get**(`opts`: Pick‹[TokenHolderOptions](../interfaces/tokenholderoptions.md), "canBeIssuedTo"›, `paginationOpts?`: [PaginationOptions](../interfaces/paginationoptions.md)): *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityBalance](../interfaces/identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/tokenholderproperties.md), "canBeIssuedTo"›››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/ac1f14a/src/api/entities/SecurityToken/TokenHolders.ts#L27)*

Retrieve all the token holders with balance

**`note`** supports pagination

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`opts` | Pick‹[TokenHolderOptions](../interfaces/tokenholderoptions.md), "canBeIssuedTo"› | object that represents whether extra properties should be fetched for each token holder  |
`paginationOpts?` | [PaginationOptions](../interfaces/paginationoptions.md) | - |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityBalance](../interfaces/identitybalance.md) & Pick‹[TokenHolderProperties](../interfaces/tokenholderproperties.md), "canBeIssuedTo"›››*

▸ **get**(`paginationOpts?`: [PaginationOptions](../interfaces/paginationoptions.md)): *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityBalance](../interfaces/identitybalance.md)››*

*Defined in [src/api/entities/SecurityToken/TokenHolders.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/ac1f14a/src/api/entities/SecurityToken/TokenHolders.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[IdentityBalance](../interfaces/identitybalance.md)››*
