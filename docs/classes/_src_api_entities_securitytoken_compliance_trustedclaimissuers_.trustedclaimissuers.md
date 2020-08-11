# Class: TrustedClaimIssuers

Handles all Security Token Default Trusted Claim Issuers related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **TrustedClaimIssuers**

## Index

### Properties

* [context](_src_api_entities_securitytoken_compliance_trustedclaimissuers_.trustedclaimissuers.md#protected-context)
* [parent](_src_api_entities_securitytoken_compliance_trustedclaimissuers_.trustedclaimissuers.md#protected-parent)

### Methods

* [get](_src_api_entities_securitytoken_compliance_trustedclaimissuers_.trustedclaimissuers.md#get)
* [set](_src_api_entities_securitytoken_compliance_trustedclaimissuers_.trustedclaimissuers.md#set)

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

###  get

▸ **get**(): *Promise‹[TrustedClaimIssuer](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:35](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L35)*

Retrieve the current default trusted claim issuers of the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹[TrustedClaimIssuer](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TrustedClaimIssuer](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md)[]›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L36)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹[TrustedClaimIssuer](_src_api_entities_trustedclaimissuer_.trustedclaimissuer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  set

▸ **set**(`args`: [SetTokenTrustedClaimIssuersParams](../interfaces/_src_api_procedures_settokentrustedclaimissuers_.settokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:22](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L22)*

Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenTrustedClaimIssuersParams](../interfaces/_src_api_procedures_settokentrustedclaimissuers_.settokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*
