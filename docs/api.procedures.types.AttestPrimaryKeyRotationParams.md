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

[api/procedures/types.ts:477](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L477)

___

### identity

• **identity**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity or the DID of the Identity that is to be rotated

#### Defined in

[api/procedures/types.ts:472](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L472)

___

### targetAccount

• **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The Account that will be attested to become the primary key of the `identity`. Can be ss58 encoded address or an instance of Account

#### Defined in

[api/procedures/types.ts:467](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L467)
