# Class: Transfers

Handles all Security Token Transfer related functionality

## Hierarchy

* [Namespace](base.namespace.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)›

  ↳ **Transfers**

## Index

### Properties

* [context](api_entities_securitytoken.transfers.md#protected-context)
* [parent](api_entities_securitytoken.transfers.md#protected-parent)

### Methods

* [areFrozen](api_entities_securitytoken.transfers.md#arefrozen)
* [canMint](api_entities_securitytoken.transfers.md#canmint)
* [canTransfer](api_entities_securitytoken.transfers.md#cantransfer)
* [freeze](api_entities_securitytoken.transfers.md#freeze)
* [transfer](api_entities_securitytoken.transfers.md#transfer)
* [unfreeze](api_entities_securitytoken.transfers.md#unfreeze)

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

###  areFrozen

▸ **areFrozen**(): *Promise‹boolean›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L52)*

Check whether transfers are frozen for the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹boolean›*

▸ **areFrozen**(`callback`: [SubCallback](../modules/types.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L53)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/types.md#subcallback)‹boolean› |

**Returns:** *Promise‹[UnsubCallback](../modules/types.md#unsubcallback)›*

___

###  canMint

▸ **canMint**(`args`: object): *Promise‹[TransferStatus](../enums/types.transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:102](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L102)*

Check whether it is possible to mint a certain amount of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to mint  |
`to` | string &#124; [Identity](api_entities_identity.identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/types.transferstatus.md)›*

___

###  canTransfer

▸ **canTransfer**(`args`: object): *Promise‹[TransferStatus](../enums/types.transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:87](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L87)*

Check whether it is possible to transfer a certain amount of this asset between two identities

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to transfer  |
`from?` | string &#124; [Identity](api_entities_identity.identity.md) | sender identity (optional, defaults to the current identity) |
`to` | string &#124; [Identity](api_entities_identity.identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/types.transferstatus.md)›*

___

###  freeze

▸ **freeze**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L28)*

Freezes transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  transfer

▸ **transfer**(`args`: [TransferTokenParams](../interfaces/api_procedures.transfertokenparams.md)): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:151](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L151)*

Transfer an amount of the token to another identity.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferTokenParams](../interfaces/api_procedures.transfertokenparams.md) |

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

___

###  unfreeze

▸ **unfreeze**(): *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/api/entities/SecurityToken/Transfers.ts#L39)*

Unfreeze transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](base.transactionqueue.md)‹[SecurityToken](api_entities_securitytoken.securitytoken.md)››*
