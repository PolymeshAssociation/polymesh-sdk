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

[api/procedures/types.ts:1739](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1739)

___

### expiresAt

• **expiresAt**: `Date`

Expiry date until which all the off chain authorizations received from each key will be valid

#### Defined in

[api/procedures/types.ts:1734](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1734)
