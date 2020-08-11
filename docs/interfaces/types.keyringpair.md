# Interface: KeyringPair

## Hierarchy

* IKeyringPair

  ↳ **KeyringPair**

## Index

### Properties

* [address](types.keyringpair.md#address)
* [isLocked](types.keyringpair.md#islocked)
* [publicKey](types.keyringpair.md#publickey)
* [sign](types.keyringpair.md#sign)

## Properties

###  address

• **address**: *string*

*Inherited from [KeyringPair](types.keyringpair.md).[address](types.keyringpair.md#address)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:12

___

###  isLocked

• **isLocked**: *boolean*

*Defined in [src/types/index.ts:338](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L338)*

___

###  publicKey

• **publicKey**: *Uint8Array*

*Inherited from [KeyringPair](types.keyringpair.md).[publicKey](types.keyringpair.md#publickey)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:13

___

###  sign

• **sign**: *function*

*Inherited from [KeyringPair](types.keyringpair.md).[sign](types.keyringpair.md#sign)*

Defined in node_modules/@polkadot/types/types/interfaces.d.ts:14

#### Type declaration:

▸ (`data`: Uint8Array, `options?`: SignOptions): *Uint8Array*

**Parameters:**

Name | Type |
------ | ------ |
`data` | Uint8Array |
`options?` | SignOptions |
