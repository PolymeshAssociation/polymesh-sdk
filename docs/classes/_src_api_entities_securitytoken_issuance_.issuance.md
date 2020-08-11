# Class: Issuance

Handles all Security Token Issuance related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **Issuance**

## Index

### Properties

* [context](_src_api_entities_securitytoken_issuance_.issuance.md#protected-context)
* [parent](_src_api_entities_securitytoken_issuance_.issuance.md#protected-parent)

### Methods

* [issue](_src_api_entities_securitytoken_issuance_.issuance.md#issue)

## Properties

### `Protected` context

• **context**: *[Context](_src_context_index_.context.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[context](_src_base_namespace_.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)*

*Inherited from [Namespace](_src_base_namespace_.namespace.md).[parent](_src_base_namespace_.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/base/Namespace.ts#L8)*

## Methods

###  issue

▸ **issue**(`args`: object): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Issuance.ts:16](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Issuance.ts#L16)*

Issue a certain amount of tokens to one or multiple identities. The receiving identities must comply with any receiver rules set on the token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`issuanceData` | [IssuanceData](../interfaces/_src_types_index_.issuancedata.md)[] | array that specifies who to issue tokens to and which amounts  |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*
