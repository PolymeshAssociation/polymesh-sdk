# Interface: MortalProcedureOptValue

[api/procedures/types](../wiki/api.procedures.types).MortalProcedureOptValue

This transaction will be rejected if not included in a block after a while (default: ~5 minutes)

## Table of contents

### Properties

- [immortal](../wiki/api.procedures.types.MortalProcedureOptValue#immortal)
- [lifetime](../wiki/api.procedures.types.MortalProcedureOptValue#lifetime)

## Properties

### immortal

• `Readonly` **immortal**: ``false``

#### Defined in

[api/procedures/types.ts:161](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L161)

___

### lifetime

• `Optional` `Readonly` **lifetime**: `BigNumber`

The number of blocks the for which the transaction remains valid. Target block time is 6 seconds. The default should suffice for most use cases

**`Note`**

this value will get rounded up to the closest power of 2, e.g. `65` rounds up to `128`

**`Note`**

this value should not exceed 4096, which is the chain's `BlockHashCount` as the lesser of the two will be used.

#### Defined in

[api/procedures/types.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L168)
