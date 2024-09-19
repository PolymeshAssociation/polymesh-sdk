# Interface: RotatePrimaryKeyParams

[api/procedures/types](../wiki/api.procedures.types).RotatePrimaryKeyParams

## Table of contents

### Properties

- [expiry](../wiki/api.procedures.types.RotatePrimaryKeyParams#expiry)
- [targetAccount](../wiki/api.procedures.types.RotatePrimaryKeyParams#targetaccount)

## Properties

### expiry

• `Optional` **expiry**: `Date`

(optional) when the generated authorization should expire

#### Defined in

[api/procedures/types.ts:864](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L864)

___

### targetAccount

• **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

#### Defined in

[api/procedures/types.ts:859](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L859)
