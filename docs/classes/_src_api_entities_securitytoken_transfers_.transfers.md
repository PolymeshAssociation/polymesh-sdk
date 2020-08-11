# Class: Transfers

Handles all Security Token Transfer related functionality

## Hierarchy

* [Namespace](_src_base_namespace_.namespace.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)›

  ↳ **Transfers**

## Index

### Properties

* [context](_src_api_entities_securitytoken_transfers_.transfers.md#protected-context)
* [parent](_src_api_entities_securitytoken_transfers_.transfers.md#protected-parent)

### Methods

* [areFrozen](_src_api_entities_securitytoken_transfers_.transfers.md#arefrozen)
* [canMint](_src_api_entities_securitytoken_transfers_.transfers.md#canmint)
* [canTransfer](_src_api_entities_securitytoken_transfers_.transfers.md#cantransfer)
* [freeze](_src_api_entities_securitytoken_transfers_.transfers.md#freeze)
* [transfer](_src_api_entities_securitytoken_transfers_.transfers.md#transfer)
* [unfreeze](_src_api_entities_securitytoken_transfers_.transfers.md#unfreeze)

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

###  areFrozen

▸ **areFrozen**(): *Promise‹boolean›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:52](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L52)*

Check whether transfers are frozen for the Security Token

**`note`** can be subscribed to

**Returns:** *Promise‹boolean›*

▸ **areFrozen**(`callback`: [SubCallback](../modules/_src_types_index_.md#subcallback)‹boolean›): *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L53)*

**Parameters:**

Name | Type |
------ | ------ |
`callback` | [SubCallback](../modules/_src_types_index_.md#subcallback)‹boolean› |

**Returns:** *Promise‹[UnsubCallback](../modules/_src_types_index_.md#unsubcallback)›*

___

###  canMint

▸ **canMint**(`args`: object): *Promise‹[TransferStatus](../enums/_src_types_index_.transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:102](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L102)*

Check whether it is possible to mint a certain amount of this asset

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to mint  |
`to` | string &#124; [Identity](_src_api_entities_identity_index_.identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/_src_types_index_.transferstatus.md)›*

___

###  canTransfer

▸ **canTransfer**(`args`: object): *Promise‹[TransferStatus](../enums/_src_types_index_.transferstatus.md)›*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:87](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L87)*

Check whether it is possible to transfer a certain amount of this asset between two identities

**Parameters:**

▪ **args**: *object*

Name | Type | Description |
------ | ------ | ------ |
`amount` | BigNumber | amount of tokens to transfer  |
`from?` | string &#124; [Identity](_src_api_entities_identity_index_.identity.md) | sender identity (optional, defaults to the current identity) |
`to` | string &#124; [Identity](_src_api_entities_identity_index_.identity.md) | receiver identity |

**Returns:** *Promise‹[TransferStatus](../enums/_src_types_index_.transferstatus.md)›*

___

###  freeze

▸ **freeze**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L28)*

Freezes transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  transfer

▸ **transfer**(`args`: [TransferTokenParams](../interfaces/_src_api_procedures_transfertoken_.transfertokenparams.md)): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:152](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L152)*

Transfer an amount of the token to another identity.

**Parameters:**

Name | Type |
------ | ------ |
`args` | [TransferTokenParams](../interfaces/_src_api_procedures_transfertoken_.transfertokenparams.md) |

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

___

###  unfreeze

▸ **unfreeze**(): *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*

*Defined in [src/api/entities/SecurityToken/Transfers.ts:39](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/api/entities/SecurityToken/Transfers.ts#L39)*

Unfreeze transfers and minting of the Security Token

**Returns:** *Promise‹[TransactionQueue](_src_base_transactionqueue_.transactionqueue.md)‹[SecurityToken](_src_api_entities_securitytoken_index_.securitytoken.md)››*
