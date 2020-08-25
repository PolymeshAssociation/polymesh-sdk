# Class: TrustedClaimIssuers

Handles all Security Token Default Trusted Claim Issuers related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **TrustedClaimIssuers**

## Index

### Properties

* [context](api_entities_securitytoken_compliance.trustedclaimissuers.md#protected-context)
* [parent](api_entities_securitytoken_compliance.trustedclaimissuers.md#protected-parent)

### Methods

* [get](api_entities_securitytoken_compliance.trustedclaimissuers.md#get)
* [set](api_entities_securitytoken_compliance.trustedclaimissuers.md#set)

## Properties

### `Protected` context

• **context**: *[Context](context.context-1.md)*

*Inherited from [Namespace](base.namespace.md).[context](base.namespace.md#protected-context)*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L10)*

___

### `Protected` parent

• **parent**: *[SecurityToken](api_entities_securitytoken.securitytoken.md)*

*Inherited from [Namespace](base.namespace.md).[parent](base.namespace.md#protected-parent)*

*Defined in [src/base/Namespace.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/base/Namespace.ts#L8)*

## Methods

###  get

▸ **get**(): *Promise‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:35](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L35)*

Retrieve the current default trusted claim issuers of the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L36)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  set

▸ **set**(`args`: [SetTokenTrustedClaimIssuersParams](../interfaces/api_procedures.settokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:22](https://github.com/PolymathNetwork/polymesh-sdk/blob/73feada/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L22)*

Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [SetTokenTrustedClaimIssuersParams](../interfaces/api_procedures.settokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
