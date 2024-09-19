# Interface: CreateChildIdentitiesParams

[api/procedures/types](../wiki/api.procedures.types).CreateChildIdentitiesParams

## Table of contents

### Properties

- [childKeyAuths](../wiki/api.procedures.types.CreateChildIdentitiesParams#childkeyauths)
- [expiresAt](../wiki/api.procedures.types.CreateChildIdentitiesParams#expiresat)

## Properties

### childKeyAuths

• **childKeyAuths**: [`ChildKeyWithAuth`](../wiki/api.procedures.types.ChildKeyWithAuth)[]

List of child keys along with their off chain authorization signatures

#### Defined in

[api/procedures/types.ts:1689](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1689)

___

### expiresAt

• **expiresAt**: `Date`

Expiry date until which all the off chain authorizations received from each key will be valid

#### Defined in

[api/procedures/types.ts:1684](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1684)
