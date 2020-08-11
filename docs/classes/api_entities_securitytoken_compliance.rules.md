# Class: Rules

Handles all Security Token Rules related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **Rules**

## Index

### Properties

* [context](api_entities_securitytoken_compliance.rules.md#protected-context)
* [parent](api_entities_securitytoken_compliance.rules.md#protected-parent)

### Methods

* [get](api_entities_securitytoken_compliance.rules.md#get)
* [pause](api_entities_securitytoken_compliance.rules.md#pause)
* [reset](api_entities_securitytoken_compliance.rules.md#reset)
* [set](api_entities_securitytoken_compliance.rules.md#set)
* [unpause](api_entities_securitytoken_compliance.rules.md#unpause)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Namespace](base.namespace.md).[context](base.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](api_entities_securitytoken.securitytoken.md)*

*Inherited from [Namespace](base.namespace.md).[parent](base.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/base/Namespace.ts#L8)*

## Methods

###  get

▸ **get**(): *Promise‹[Rule](../interfaces/types.rule.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:40](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L40)*

Retrieve all of the Security Token's transfer rules

**`note`** can be subscribed to

**Returns:** *Promise‹[Rule](../interfaces/types.rule.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[Rule](../interfaces/types.rule.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:41](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L41)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[Rule](../interfaces/types.rule.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  pause

▸ **pause**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:111](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L111)*

Pause all the Security Token's rules. This means that all transfers and token issuance will be allowed until rules are unpaused

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  reset

▸ **reset**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:100](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L100)*

Detele all the current rules for the Security Token.

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  set

▸ **set**(`args`: [SetTokenRulesParams](../interfaces/api_procedures.settokenrulesparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L27)*

Configure transfer rules for the Security Token. This operation will replace all existing rules with a new rule set

This requires two transactions

**`example`** Say A, B, C, D and E are rules and we arrange them as `[[A, B], [C, D], [E]]`.
For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenRulesParams](../interfaces/api_procedures.settokenrulesparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  unpause

▸ **unpause**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:122](https://github.com/PolymathNetwork/polymesh-sdk/blob/d7c2770/src/api/entities/SecurityToken/Compliance/Rules.ts#L122)*

Un-pause all the Security Token's current rules

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
