# Interface: TrustedClaimIssuer<IsDefault\>

[types](../wiki/types).TrustedClaimIssuer

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `IsDefault` | extends `boolean` = ``false`` |  |

## Table of contents

### Properties

- [identity](../wiki/types.TrustedClaimIssuer#identity)
- [trustedFor](../wiki/types.TrustedClaimIssuer#trustedfor)

## Properties

### identity

• **identity**: `IsDefault` extends ``true`` ? [`DefaultTrustedClaimIssuer`](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer) : [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[types/index.ts:411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L411)

___

### trustedFor

• **trustedFor**: ``null`` \| [`ClaimType`](../wiki/types.ClaimType)[]

a null value means that the issuer is trusted for all claim types

#### Defined in

[types/index.ts:415](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L415)
