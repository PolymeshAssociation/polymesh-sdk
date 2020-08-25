# Class: Documents

Handles all Security Token Document related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **Documents**

## Index

### Properties

* [context](api_entities_securitytoken.documents.md#protected-context)
* [parent](api_entities_securitytoken.documents.md#protected-parent)

### Methods

* [get](api_entities_securitytoken.documents.md#get)
* [set](api_entities_securitytoken.documents.md#set)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Namespace](base.namespace.md).[context](base.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](api_entities_securitytoken.securitytoken.md)*

*Inherited from [Namespace](base.namespace.md).[parent](base.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/base/Namespace.ts#L8)*

## Methods

###  get

▸ **get**(`paginationOpts?`: [PaginationOptions](../interfaces/types.paginationoptions.md)): *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[TokenDocument](../interfaces/types.tokendocument.md)››*

*Defined in [src/api/entities/SecurityToken/Documents.ts:38](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Documents.ts#L38)*

Retrieve all documents linked to the Security Token

**`note`** supports pagination

**Parameters:**

Name | Type |
------ | ------ |
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) |

**Returns:** *Promise‹[ResultSet](../interfaces/types.resultset.md)‹[TokenDocument](../interfaces/types.tokendocument.md)››*

___

###  set

▸ **set**(`args`: [SetTokenDocumentsParams](../interfaces/api_procedures.settokendocumentsparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Documents.ts:25](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Documents.ts#L25)*

Assign a new list of documents to the Security Token by replacing the existing list of documents with the one passed in the parameters

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenDocumentsParams](../interfaces/api_procedures.settokendocumentsparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
