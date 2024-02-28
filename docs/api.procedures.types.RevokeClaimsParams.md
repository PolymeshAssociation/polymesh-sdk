# Interface: RevokeClaimsParams

[api/procedures/types](../wiki/api.procedures.types).RevokeClaimsParams

## Table of contents

### Properties

- [claims](../wiki/api.procedures.types.RevokeClaimsParams#claims)
- [operation](../wiki/api.procedures.types.RevokeClaimsParams#operation)

## Properties

### claims

• **claims**: `Omit`<[`ClaimTarget`](../wiki/types.ClaimTarget), ``"expiry"``\>[]

array of claims to be revoked

#### Defined in

[api/procedures/types.ts:412](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L412)

___

### operation

• **operation**: [`Revoke`](../wiki/api.procedures.types.ClaimOperation#revoke)

#### Defined in

[api/procedures/types.ts:413](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2c78f6c3/src/api/procedures/types.ts#L413)
