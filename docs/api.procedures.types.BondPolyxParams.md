# Interface: BondPolyxParams

[api/procedures/types](../wiki/api.procedures.types).BondPolyxParams

## Table of contents

### Properties

- [amount](../wiki/api.procedures.types.BondPolyxParams#amount)
- [autoStake](../wiki/api.procedures.types.BondPolyxParams#autostake)
- [controller](../wiki/api.procedures.types.BondPolyxParams#controller)
- [payee](../wiki/api.procedures.types.BondPolyxParams#payee)

## Properties

### amount

• **amount**: `BigNumber`

The amount of POLYX to bond (up to 6 decimals of precision)

**`Note`**

It is strongly recommended against bonding 100% an account's POLYX balance.
At the minimum a stash account needs enough POLYX to sign the unbond extrinsic ()

#### Defined in

[api/procedures/types.ts:1807](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1807)

___

### autoStake

• **autoStake**: `boolean`

Can be set to `true` if `rewardDestination` is the signing account. Auto stake will stake all rewards so the balance will compound

#### Defined in

[api/procedures/types.ts:1799](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1799)

___

### controller

• **controller**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The controller is the account responsible for managing staked POLYX. This can be the stash,
but designating a different key can make it easier to update nomination preferences and maintain
the POLYX in a more secure, but inconvenient, stash key.

#### Defined in

[api/procedures/types.ts:1789](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1789)

___

### payee

• **payee**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The account that should receive the stashing rewards

#### Defined in

[api/procedures/types.ts:1794](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1794)
