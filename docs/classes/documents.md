# Class: Documents

Handles all Security Token Document related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **Documents**

## Index

### Properties

* [context](documents.md#protected-context)
* [parent](documents.md#protected-parent)

### Methods

* [get](documents.md#get)
* [set](documents.md#set)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/e5ab20b/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/e5ab20b/src/base/Namespace.ts#L10)*

## Methods

###  get

▸ **get**(`paginationOpts?`: [PaginationOptions](../interfaces/paginationoptions.md)): *Promise‹[ResultSet](../interfaces/resultset.md)‹[TokenDocument](../interfaces/tokendocument.md)››*

*Defined in [src/api/entities/SecurityToken/Documents.ts:38](https://github.com/PolymathNetwork/polymesh-sdk/blob/e5ab20b/src/api/entities/SecurityToken/Documents.ts#L38)*

Retrieve all documents linked to the Security Token

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/resultset.md)‹[TokenDocument](../interfaces/tokendocument.md)››*

___

###  set

▸ **set**(`args`: [SetTokenDocumentsParams](../interfaces/settokendocumentsparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Documents.ts:25](https://github.com/PolymathNetwork/polymesh-sdk/blob/e5ab20b/src/api/entities/SecurityToken/Documents.ts#L25)*

Assign a new list of documents to the Security Token by replacing the existing list of documents with the one passed in the parameters

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenDocumentsParams](../interfaces/settokendocumentsparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*
