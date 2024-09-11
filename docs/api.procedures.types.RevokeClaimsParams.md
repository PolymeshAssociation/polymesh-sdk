# Interface: RevokeClaimsParams

[api/procedures/types](../wiki/api.procedures.types).RevokeClaimsParams

## Table of contents

### Properties

- [claims](../wiki/api.procedures.types.RevokeClaimsParams#claims)
- [operation](../wiki/api.procedures.types.RevokeClaimsParams#operation)

## Properties

### claims

• **claims**: `Omit`\<[`ClaimTarget`](../wiki/api.entities.types.ClaimTarget), ``"expiry"``\>[]

array of claims to be revoked

#### Defined in

[api/procedures/types.ts:748](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L748)

___

### operation

• **operation**: [`Revoke`](../wiki/api.procedures.types.ClaimOperation#revoke)

#### Defined in

[api/procedures/types.ts:749](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L749)
