# Interface: MortalProcedureOptValue

[types](../wiki/types).MortalProcedureOptValue

This transaction will be rejected if not included in a block after a while (default: ~5 minutes)

## Table of contents

### Properties

- [immortal](../wiki/types.MortalProcedureOptValue#immortal)
- [lifetime](../wiki/types.MortalProcedureOptValue#lifetime)

## Properties

### immortal

• `Readonly` **immortal**: ``false``

#### Defined in

[types/index.ts:1531](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1531)

___

### lifetime

• `Optional` `Readonly` **lifetime**: `BigNumber`

The number of blocks the for which the transaction remains valid. Target block time is 6 seconds. The default should suffice for most use cases

**`Note`**

 this value will get rounded up to the closest power of 2, e.g. `65` rounds up to `128`

**`Note`**

 this value should not exceed 4096, which is the chain's `BlockHashCount` as the lesser of the two will be used.

#### Defined in

[types/index.ts:1538](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1538)
