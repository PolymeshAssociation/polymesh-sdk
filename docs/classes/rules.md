# Class: Rules

Handles all Security Token Rules related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **Rules**

## Index

### Properties

* [context](rules.md#protected-context)
* [parent](rules.md#protected-parent)

### Methods

* [arePaused](rules.md#arepaused)
* [checkMint](rules.md#checkmint)
* [checkTransfer](rules.md#checktransfer)
* [get](rules.md#get)
* [pause](rules.md#pause)
* [reset](rules.md#reset)
* [set](rules.md#set)
* [unpause](rules.md#unpause)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/base/Namespace.ts#L10)*

## Methods

###  arePaused

▸ **arePaused**(): *Promise‹boolean›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:168](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L168)*

Check whether compliance rules are paused or not

**Returns:** *Promise‹boolean›*

___

###  checkMint

▸ **checkMint**(`args`: object): *Promise‹[RuleCompliance](../interfaces/rulecompliance.md)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:158](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L158)*

Check whether minting to an identity complies with all the rules of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`to` | string &#124; [Identity](identity.md) | receiver identity  |

**Returns:** *Promise‹[RuleCompliance](../interfaces/rulecompliance.md)›*

___

###  checkTransfer

▸ **checkTransfer**(`args`: object): *Promise‹[RuleCompliance](../interfaces/rulecompliance.md)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:145](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L145)*

Check whether transferring from one identity to another complies with all the rules of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`from?` | string &#124; [Identity](identity.md) | sender identity (optional, defaults to the current identity) |
`to` | string &#124; [Identity](identity.md) | receiver identity  |

**Returns:** *Promise‹[RuleCompliance](../interfaces/rulecompliance.md)›*

___

###  get

▸ **get**(): *Promise‹[Rule](../interfaces/rule.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L49)*

Retrieve all of the Security Token's transfer rules

**`note`** can be subscribed to

**Returns:** *Promise‹[Rule](../interfaces/rule.md)[]›*

▸ **get**(`callback`: [SubCallback](../globals.md#subcallback)‹[Rule](../interfaces/rule.md)[]›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:50](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L50)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹[Rule](../interfaces/rule.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  pause

▸ **pause**(): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L120)*

Pause all the Security Token's rules. This means that all transfers and token issuance will be allowed until rules are unpaused

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  reset

▸ **reset**(): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:109](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L109)*

Detele all the current rules for the Security Token.

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  set

▸ **set**(`args`: [SetTokenRulesParams](../interfaces/settokenrulesparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L36)*

Configure transfer rules for the Security Token. This operation will replace all existing rules with a new rule set

This requires two transactions

**`example`** Say A, B, C, D and E are rules and we arrange them as `[[A, B], [C, D], [E]]`.
For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenRulesParams](../interfaces/settokenrulesparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  unpause

▸ **unpause**(): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:131](https://github.com/PolymathNetwork/polymesh-sdk/blob/374efb41/src/api/entities/SecurityToken/Compliance/Rules.ts#L131)*

Un-pause all the Security Token's current rules

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*
