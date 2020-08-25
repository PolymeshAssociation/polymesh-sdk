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

* [arePaused](api_entities_securitytoken_compliance.rules.md#arepaused)
* [checkMint](api_entities_securitytoken_compliance.rules.md#checkmint)
* [checkTransfer](api_entities_securitytoken_compliance.rules.md#checktransfer)
* [get](api_entities_securitytoken_compliance.rules.md#get)
* [pause](api_entities_securitytoken_compliance.rules.md#pause)
* [reset](api_entities_securitytoken_compliance.rules.md#reset)
* [set](api_entities_securitytoken_compliance.rules.md#set)
* [unpause](api_entities_securitytoken_compliance.rules.md#unpause)

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

###  arePaused

▸ **arePaused**(): *Promise‹boolean›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:168](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L168)*

Check whether compliance rules are paused or not

**Returns:** *Promise‹boolean›*

___

###  checkMint

▸ **checkMint**(`args`: object): *Promise‹[RuleCompliance](../interfaces/types.rulecompliance.md)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:158](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L158)*

Check whether minting to an identity complies with all the rules of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`to` | string &#124; [Identity](api_entities_identity.identity.md) | receiver identity  |

**Returns:** *Promise‹[RuleCompliance](../interfaces/types.rulecompliance.md)›*

___

###  checkTransfer

▸ **checkTransfer**(`args`: object): *Promise‹[RuleCompliance](../interfaces/types.rulecompliance.md)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:145](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L145)*

Check whether transferring from one identity to another complies with all the rules of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`from?` | string &#124; [Identity](api_entities_identity.identity.md) | sender identity (optional, defaults to the current identity) |
`to` | string &#124; [Identity](api_entities_identity.identity.md) | receiver identity  |

**Returns:** *Promise‹[RuleCompliance](../interfaces/types.rulecompliance.md)›*

___

###  get

▸ **get**(): *Promise‹[Rule](../interfaces/types.rule.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L49)*

Retrieve all of the Security Token's transfer rules

**`note`** can be subscribed to

**Returns:** *Promise‹[Rule](../interfaces/types.rule.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[Rule](../interfaces/types.rule.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:50](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L50)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[Rule](../interfaces/types.rule.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  pause

▸ **pause**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L120)*

Pause all the Security Token's rules. This means that all transfers and token issuance will be allowed until rules are unpaused

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  reset

▸ **reset**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:109](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L109)*

Detele all the current rules for the Security Token.

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  set

▸ **set**(`args`: [SetTokenRulesParams](../interfaces/api_procedures.settokenrulesparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L36)*

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

*Defined in [src/api/entities/SecurityToken/Compliance/Rules.ts:131](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/Rules.ts#L131)*

Un-pause all the Security Token's current rules

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
