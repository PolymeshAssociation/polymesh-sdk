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

[api/procedures/types.ts:845](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L845)

___

### operation

• **operation**: [`Revoke`](../wiki/api.procedures.types.ClaimOperation#revoke)

#### Defined in

[api/procedures/types.ts:846](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L846)
