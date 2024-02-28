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

[api/procedures/types.ts:910](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L910)

___

### permissions

• **permissions**: [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup) \| { `transactions`: ``null`` \| [`TransactionPermissions`](../wiki/types.TransactionPermissions)  } \| { `transactionGroups`: [`TxGroup`](../wiki/types.TxGroup)[]  }

#### Defined in

[api/procedures/types.ts:895](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L895)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:894](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L894)
