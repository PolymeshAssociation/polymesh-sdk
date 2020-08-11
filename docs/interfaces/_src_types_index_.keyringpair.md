# Interface: KeyringPair

## Hierarchy

* IKeyringPair

  ↳ **KeyringPair**

## Index

### Properties

* [address](_src_types_index_.keyringpair.md#address)
* [isLocked](_src_types_index_.keyringpair.md#islocked)
* [publicKey](_src_types_index_.keyringpair.md#publickey)
* [sign](_src_types_index_.keyringpair.md#sign)

## Properties

###  address

• **address**: *string*

*Inherited from [KeyringPair](_src_types_index_.keyringpair.md).[address](_src_types_index_.keyringpair.md#address)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:12

___

###  isLocked

• **isLocked**: *boolean*

*Defined in [src/types/index.ts:338](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/types/index.ts#L338)*

___

###  publicKey

• **publicKey**: *Uint8Array*

*Inherited from [KeyringPair](_src_types_index_.keyringpair.md).[publicKey](_src_types_index_.keyringpair.md#publickey)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:13

___

###  sign

• **sign**: *function*

*Inherited from [KeyringPair](_src_types_index_.keyringpair.md).[sign](_src_types_index_.keyringpair.md#sign)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:14

#### Type declaration:

▸ (`data`: Uint8Array, `options?`: SignOptions): *Uint8Array*

**Parameters:**

Name | Type |
------ | ------ |
`data` | Uint8Array |
`options?` | SignOptions |
