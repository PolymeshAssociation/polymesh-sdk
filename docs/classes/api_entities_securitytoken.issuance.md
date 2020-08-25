# Class: Issuance

Handles all Security Token Issuance related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **Issuance**

## Index

### Properties

* [context](api_entities_securitytoken.issuance.md#protected-context)
* [parent](api_entities_securitytoken.issuance.md#protected-parent)

### Methods

* [issue](api_entities_securitytoken.issuance.md#issue)

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

###  issue

▸ **issue**(`args`: object): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Issuance.ts:16](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Issuance.ts#L16)*

Issue a certain amount of tokens to one or multiple identities. The receiving identities must comply with any receiver rules set on the token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`issuanceData` | [IssuanceData](../interfaces/types.issuancedata.md)[] | array that specifies who to issue tokens to and which amounts  |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
