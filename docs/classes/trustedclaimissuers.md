# Class: TrustedClaimIssuers

Handles all Security Token Default Trusted Claim Issuers related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **TrustedClaimIssuers**

## Index

### Properties

* [context](trustedclaimissuers.md#protected-context)
* [parent](trustedclaimissuers.md#protected-parent)

### Methods

* [add](trustedclaimissuers.md#add)
* [get](trustedclaimissuers.md#get)
* [remove](trustedclaimissuers.md#remove)
* [set](trustedclaimissuers.md#set)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/base/Namespace.ts#L10)*

## Methods

###  add

▸ **add**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:42](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L42)*

Add the supplied identities to the Security Token's list of trusted claim issuers

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  get

▸ **get**(): *Promise‹[TrustedClaimIssuer](trustedclaimissuer.md)[]›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:76](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L76)*

Retrieve the current default trusted claim issuers of the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹[TrustedClaimIssuer](trustedclaimissuer.md)[]›*

▸ **get**(`callback`: [SubCallback](../globals.md#subcallback)‹[TrustedClaimIssuer](trustedclaimissuer.md)[]›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:77](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L77)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹[TrustedClaimIssuer](trustedclaimissuer.md)[]› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  remove

▸ **remove**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L58)*

Remove the supplied identities from the Security Token's list of trusted claim issuers   *

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  set

▸ **set**(`args`: [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts:26](https://github.com/PolymathNetwork/polymesh-sdk/blob/4b9adaf/src/api/entities/SecurityToken/Compliance/TrustedClaimIssuers.ts#L26)*

Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter

This requires two transactions

**Parameters:**

Name | Type |
------ | ------ |
`args` | [ModifyTokenTrustedClaimIssuersParams](../interfaces/modifytokentrustedclaimissuersparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*
