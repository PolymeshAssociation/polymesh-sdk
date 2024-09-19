# Enumeration: AccountIdentityRelation

[api/entities/Account/types](../wiki/api.entities.Account.types).AccountIdentityRelation

Represents the how an Account is associated to an Identity

## Table of contents

### Enumeration Members

- [MultiSigSigner](../wiki/api.entities.Account.types.AccountIdentityRelation#multisigsigner)
- [Primary](../wiki/api.entities.Account.types.AccountIdentityRelation#primary)
- [Secondary](../wiki/api.entities.Account.types.AccountIdentityRelation#secondary)
- [Unassigned](../wiki/api.entities.Account.types.AccountIdentityRelation#unassigned)

## Enumeration Members

### MultiSigSigner

• **MultiSigSigner** = ``"MultiSigSigner"``

The Account is one of many signers for a MultiSig

#### Defined in

[api/entities/Account/types.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L61)

___

### Primary

• **Primary** = ``"Primary"``

The Account is the Identity's primary key (i.e. it has full permission)

#### Defined in

[api/entities/Account/types.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L53)

___

### Secondary

• **Secondary** = ``"Secondary"``

The Account is a Secondary account. There are associated permissions that may limit what transactions it may authorize for the Identity

#### Defined in

[api/entities/Account/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L57)

___

### Unassigned

• **Unassigned** = ``"Unassigned"``

The Account is not associated to any Identity

#### Defined in

[api/entities/Account/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Account/types.ts#L49)
