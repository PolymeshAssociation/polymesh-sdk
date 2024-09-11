# Interface: RegisterIdentityParams

[api/procedures/types](../wiki/api.procedures.types).RegisterIdentityParams

## Table of contents

### Properties

- [createCdd](../wiki/api.procedures.types.RegisterIdentityParams#createcdd)
- [expiry](../wiki/api.procedures.types.RegisterIdentityParams#expiry)
- [secondaryAccounts](../wiki/api.procedures.types.RegisterIdentityParams#secondaryaccounts)
- [targetAccount](../wiki/api.procedures.types.RegisterIdentityParams#targetaccount)

## Properties

### createCdd

• `Optional` **createCdd**: `boolean`

(optional) also issue a CDD claim for the created DID, completing the onboarding process for the Account

#### Defined in

[api/procedures/types.ts:784](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L784)

___

### expiry

• `Optional` **expiry**: `Date`

(optional) when the generated CDD claim should expire, `createCdd` must be true if specified

#### Defined in

[api/procedures/types.ts:788](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L788)

___

### secondaryAccounts

• `Optional` **secondaryAccounts**: [`Modify`](../wiki/types.utils#modify)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount), \{ `permissions`: [`PermissionsLike`](../wiki/api.entities.types#permissionslike)  }\>[]

(optional) secondary accounts for the new Identity with their corresponding permissions.

**`Note`**

Each Account will need to accept the generated authorizations before being linked to the Identity

#### Defined in

[api/procedures/types.ts:780](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L780)

___

### targetAccount

• **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

#### Defined in

[api/procedures/types.ts:775](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L775)
