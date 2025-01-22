# Interface: TrustedClaimIssuer\<IsDefault\>

[api/entities/types](../wiki/api.entities.types).TrustedClaimIssuer

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `IsDefault` | extends `boolean` = ``false`` | whether the Identity is a default trusted claim issuer for an asset or just for a specific compliance condition. Defaults to false |

## Table of contents

### Properties

- [identity](../wiki/api.entities.types.TrustedClaimIssuer#identity)
- [trustedFor](../wiki/api.entities.types.TrustedClaimIssuer#trustedfor)

## Properties

### identity

• **identity**: `IsDefault` extends ``true`` ? [`DefaultTrustedClaimIssuer`](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer) : [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/types.ts:313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L313)

___

### trustedFor

• **trustedFor**: ``null`` \| [`ClaimType`](../wiki/api.entities.types.ClaimType)[]

a null value means that the issuer is trusted for all claim types

#### Defined in

[api/entities/types.ts:317](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L317)
