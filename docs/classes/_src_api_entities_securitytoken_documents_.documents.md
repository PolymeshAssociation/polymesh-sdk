# Class: Documents

Handles all Security Token Document related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **Documents**

## Index

### Properties

* [context](_src_api_entities_securitytoken_documents_.documents.md#protected-context)
* [parent](_src_api_entities_securitytoken_documents_.documents.md#protected-parent)

### Methods

* [get](_src_api_entities_securitytoken_documents_.documents.md#get)
* [set](_src_api_entities_securitytoken_documents_.documents.md#set)

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

▸ **get**(): *Promise‹[TokenDocument](../interfaces/_src_types_index_.tokendocument.md)[]›*

*Defined in [src/api/entities/SecurityToken/Documents.ts:30](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Documents.ts#L30)*

Retrieve all documents linked to the Security Token

**Returns:** *Promise‹[TokenDocument](../interfaces/_src_types_index_.tokendocument.md)[]›*

___

###  set

▸ **set**(`args`: [SetTokenDocumentsParams](../interfaces/_src_api_procedures_settokendocuments_.settokendocumentsparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Documents.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Documents.ts#L19)*

Assign a new list of documents to the Security Token by replacing the existing list of documents with the one passed in the parameters

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenDocumentsParams](../interfaces/_src_api_procedures_settokendocuments_.settokendocumentsparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*
