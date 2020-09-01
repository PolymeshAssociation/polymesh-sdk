# Class: Transfers

Handles all Security Token Transfer related functionality

## Hierarchy

* Namespace‹[SecurityToken](securitytoken.md)›

  ↳ **Transfers**

## Index

### Properties

* [context](transfers.md#protected-context)
* [parent](transfers.md#protected-parent)

### Methods

* [areFrozen](transfers.md#arefrozen)
* [canMint](transfers.md#canmint)
* [canTransfer](transfers.md#cantransfer)
* [freeze](transfers.md#freeze)
* [transfer](transfers.md#transfer)
* [unfreeze](transfers.md#unfreeze)

## Properties

### `Protected` context

• **context**: *Context*

*Inherited from void*

*Defined in [src/base/Namespace.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/base/Namespace.ts#L12)*

___

### `Protected` parent

• **parent**: *[SecurityToken](securitytoken.md)*

*Inherited from void*

*Defined in [src/base/Namespace.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/base/Namespace.ts#L10)*

## Methods

###  areFrozen

▸ **areFrozen**(): *Promise‹boolean›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L52)*

Check whether transfers are frozen for the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹boolean›*

▸ **areFrozen**(`callback`: [SubCallback](../globals.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L53)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../globals.md#subcallback)‹boolean› |

**Returns:** *Promise‹[UnsubCallback](../globals.md#unsubcallback)›*

___

###  canMint

▸ **canMint**(`args`: object): *Promise‹[TransferStatus](../enums/transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:102](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L102)*

Check whether it is possible to mint a certain amount of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to mint  |
`to` | string &#124; [Identity](identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/transferstatus.md)›*

___

###  canTransfer

▸ **canTransfer**(`args`: object): *Promise‹[TransferStatus](../enums/transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:87](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L87)*

Check whether it is possible to transfer a certain amount of this asset between two identities

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to transfer  |
`from?` | string &#124; [Identity](identity.md) | sender identity (optional, defaults to the current identity) |
`to` | string &#124; [Identity](identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/transferstatus.md)›*

___

###  freeze

▸ **freeze**(): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L28)*

Freezes transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  transfer

▸ **transfer**(`args`: [TransferTokenParams](../interfaces/transfertokenparams.md)): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:151](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L151)*

Transfer an amount of the token to another identity.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferTokenParams](../interfaces/transfertokenparams.md) |

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

___

###  unfreeze

▸ **unfreeze**(): *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/4660ab0/src/api/entities/SecurityToken/Transfers.ts#L39)*

Unfreeze transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](transactionqueue.md)‹[SecurityToken](securitytoken.md)››*
