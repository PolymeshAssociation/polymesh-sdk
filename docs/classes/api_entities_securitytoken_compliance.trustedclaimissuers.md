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

* [add](api_entities_securitytoken_compliance.trustedclaimissuers.md#add)
* [get](api_entities_securitytoken_compliance.trustedclaimissuers.md#get)
* [remove](api_entities_securitytoken_compliance.trustedclaimissuers.md#remove)
* [set](api_entities_securitytoken_compliance.trustedclaimissuers.md#set)

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

###  add

▸ **add**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:42](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L42)*

Add the supplied identities to the Security Token's list of trusted claim issuers

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  get

▸ **get**(): *Promise‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:76](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L76)*

Retrieve the current default trusted claim issuers of the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›*

▸ **get**(`callback`: [SubCallback](../modules/types.md#subcallback)‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:77](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L77)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹[TrustedClaimIssuer](api_entities.trustedclaimissuer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  remove

▸ **remove**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L58)*

Remove the supplied identities from the Security Token's list of trusted claim issuers   *

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  set

▸ **set**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:26](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L26)*

Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/api_procedures.modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
