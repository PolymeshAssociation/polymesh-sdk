# Class: Issuance

Handles all Security Token Issuance related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **Issuance**

## Index

### Properties

* [context](issuance.md#protected-context)
* [parent](issuance.md#protected-parent)

### Methods

* [issue](issuance.md#issue)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/base/Namespace.ts#L10)*

## Methods

###  issue

▸ **issue**(`args`: object): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Issuance.ts:16](https://github.com/PolymathNetwork/polymesh-sdk/blob/e182811/src/api/entities/SecurityToken/Issuance.ts#L16)*

Issue a certain amount of tokens to one or multiple identities. The receiving identities must comply with any receiver rules set on the token

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`issuanceData` | [IssuanceData](../interfaces/issuancedata.md)[] | array that specifies who to issue tokens to and which amounts  |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*
