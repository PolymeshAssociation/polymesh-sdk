# Interface: SimplePermissions

[api/entities/types](../wiki/api.entities.types).SimplePermissions

This represents positive permissions (i.e. only "includes"). It is used
  for specifying procedure requirements and querying if an Account has certain
  permissions. Null values represent full permissions in that category

## Table of contents

### Properties

- [assets](../wiki/api.entities.types.SimplePermissions#assets)
- [portfolios](../wiki/api.entities.types.SimplePermissions#portfolios)
- [transactions](../wiki/api.entities.types.SimplePermissions#transactions)

## Properties

### assets

• `Optional` **assets**: ``null`` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset)[]

list of required Asset permissions

#### Defined in

[api/entities/types.ts:677](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L677)

___

### portfolios

• `Optional` **portfolios**: ``null`` \| ([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[]

#### Defined in

[api/entities/types.ts:683](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L683)

___

### transactions

• `Optional` **transactions**: ``null`` \| [`TxTag`](../wiki/generated.types#txtag)[]

list of required Transaction permissions

#### Defined in

[api/entities/types.ts:681](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L681)
