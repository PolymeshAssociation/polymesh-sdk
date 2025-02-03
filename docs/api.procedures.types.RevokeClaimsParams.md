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

[api/procedures/types.ts:813](https://github.com/PolymeshAssociation/polymesh-sdk/blob/e47b6f47c/src/api/procedures/types.ts#L813)

___

### operation

• **operation**: [`Revoke`](../wiki/api.procedures.types.ClaimOperation#revoke)

#### Defined in

[api/procedures/types.ts:814](https://github.com/PolymeshAssociation/polymesh-sdk/blob/e47b6f47c/src/api/procedures/types.ts#L814)
