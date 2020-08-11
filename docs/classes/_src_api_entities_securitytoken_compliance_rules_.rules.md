# Class: Rules

Handles all Security Token Rules related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **Rules**

## Index

### Properties

* [context](_src_api_entities_securitytoken_compliance_rules_.rules.md#protected-context)
* [parent](_src_api_entities_securitytoken_compliance_rules_.rules.md#protected-parent)

### Methods

* [get](_src_api_entities_securitytoken_compliance_rules_.rules.md#get)
* [pause](_src_api_entities_securitytoken_compliance_rules_.rules.md#pause)
* [reset](_src_api_entities_securitytoken_compliance_rules_.rules.md#reset)
* [set](_src_api_entities_securitytoken_compliance_rules_.rules.md#set)
* [unpause](_src_api_entities_securitytoken_compliance_rules_.rules.md#unpause)

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

▸ **get**(): *Promise‹[Rule](../interfaces/_src_types_index_.rule.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:40](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L40)*

Retrieve all of the Security Token's transfer rules

**`note`** can be subscribed to

**Returns:** *Promise‹[Rule](../interfaces/_src_types_index_.rule.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[Rule](../interfaces/_src_types_index_.rule.md)[]›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:41](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L41)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[Rule](../interfaces/_src_types_index_.rule.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  pause

▸ **pause**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:111](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L111)*

Pause all the Security Token's rules. This means that all transfers and token issuance will be allowed until rules are unpaused

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  reset

▸ **reset**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:100](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L100)*

Detele all the current rules for the Security Token.

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  set

▸ **set**(`args`: [SetTokenRulesParams](../interfaces/_src_api_procedures_settokenrules_.settokenrulesparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L27)*

Configure transfer rules for the Security Token. This operation will replace all existing rules with a new rule set

This requires two transactions

**`example`** Say A, B, C, D and E are rules and we arrange them as `[[A, B], [C, D], [E]]`.
For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenRulesParams](../interfaces/_src_api_procedures_settokenrules_.settokenrulesparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  unpause

▸ **unpause**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:122](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/api/entities/SecurityToken/Compliance/Rules.ts#L122)*

Un-pause all the Security Token's current rules

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*
