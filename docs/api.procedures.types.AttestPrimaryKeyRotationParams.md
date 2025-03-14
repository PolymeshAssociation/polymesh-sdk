# Interface: AttestPrimaryKeyRotationParams

[api/procedures/types](../wiki/api.procedures.types).AttestPrimaryKeyRotationParams

## Table of contents

### Properties

- [expiry](../wiki/api.procedures.types.AttestPrimaryKeyRotationParams#expiry)
- [identity](../wiki/api.procedures.types.AttestPrimaryKeyRotationParams#identity)
- [targetAccount](../wiki/api.procedures.types.AttestPrimaryKeyRotationParams#targetaccount)

## Properties

### expiry

• `Optional` **expiry**: `Date`

(optional) when the generated authorization should expire

#### Defined in

[api/procedures/types.ts:902](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L902)

___

### identity

• **identity**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity or the DID of the Identity that is to be rotated

#### Defined in

[api/procedures/types.ts:897](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L897)

___

### targetAccount

• **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The Account that will be attested to become the primary key of the `identity`. Can be ss58 encoded address or an instance of Account

#### Defined in

[api/procedures/types.ts:892](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L892)
