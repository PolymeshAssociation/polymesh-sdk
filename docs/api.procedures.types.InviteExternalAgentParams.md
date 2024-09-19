# Interface: InviteExternalAgentParams

[api/procedures/types](../wiki/api.procedures.types).InviteExternalAgentParams

## Table of contents

### Properties

- [expiry](../wiki/api.procedures.types.InviteExternalAgentParams#expiry)
- [permissions](../wiki/api.procedures.types.InviteExternalAgentParams#permissions)
- [target](../wiki/api.procedures.types.InviteExternalAgentParams#target)

## Properties

### expiry

• `Optional` **expiry**: `Date`

date at which the authorization request for invitation expires (optional)

**`Note`**

if expiry date is not set, the invitation will never expire

**`Note`**

due to chain limitations, the expiry will be ignored if the passed `permissions` don't correspond to an existing Permission Group

#### Defined in

[api/procedures/types.ts:1417](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1417)

___

### permissions

• **permissions**: [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup) \| \{ `transactions`: ``null`` \| [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)  } \| \{ `transactionGroups`: [`TxGroup`](../wiki/api.procedures.types.TxGroup)[]  }

#### Defined in

[api/procedures/types.ts:1402](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1402)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:1401](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1401)
