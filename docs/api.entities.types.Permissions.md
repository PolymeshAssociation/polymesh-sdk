# Interface: Permissions

[api/entities/types](../wiki/api.entities.types).Permissions

Permissions a Secondary Key has over the Identity. A null value means the key has
  all permissions of that type (e.g. if `assets` is null, the key has permissions over all
  of the Identity's Assets)

## Table of contents

### Properties

- [assets](../wiki/api.entities.types.Permissions#assets)
- [portfolios](../wiki/api.entities.types.Permissions#portfolios)
- [transactionGroups](../wiki/api.entities.types.Permissions#transactiongroups)
- [transactions](../wiki/api.entities.types.Permissions#transactions)

## Properties

### assets

• **assets**: ``null`` \| [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

Assets over which this key has permissions

#### Defined in

[api/entities/types.ts:646](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L646)

___

### portfolios

• **portfolios**: ``null`` \| [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\>

#### Defined in

[api/entities/types.ts:660](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L660)

___

### transactionGroups

• **transactionGroups**: [`TxGroup`](../wiki/api.procedures.types.TxGroup)[]

list of Transaction Groups this key can execute. Having permissions over a TxGroup
  means having permissions over every TxTag in said group. Partial group permissions are not
  covered by this value. For a full picture of transaction permissions, see the `transactions` property

NOTE: If transactions is null, ignore this value

#### Defined in

[api/entities/types.ts:658](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L658)

___

### transactions

• **transactions**: ``null`` \| [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

Transactions this key can execute

#### Defined in

[api/entities/types.ts:650](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L650)
