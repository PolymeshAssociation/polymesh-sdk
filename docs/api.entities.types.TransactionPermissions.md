# Interface: TransactionPermissions

[api/entities/types](../wiki/api.entities.types).TransactionPermissions

Permissions related to Transactions. Can include/exclude individual transactions or entire modules

## Hierarchy

- [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<[`TxTag`](../wiki/generated.types#txtag) \| [`ModuleName`](../wiki/generated.types.ModuleName)\>

  ↳ **`TransactionPermissions`**

## Table of contents

### Properties

- [exceptions](../wiki/api.entities.types.TransactionPermissions#exceptions)
- [type](../wiki/api.entities.types.TransactionPermissions#type)
- [values](../wiki/api.entities.types.TransactionPermissions#values)

## Properties

### exceptions

• `Optional` **exceptions**: [`TxTag`](../wiki/generated.types#txtag)[]

Transactions to be exempted from inclusion/exclusion. This allows more granularity when
  setting permissions. For example, let's say we want to include only the `asset` and `staking` modules,
  but exclude the `asset.registerTicker` transaction. We could add both modules to `values`, and add
  `TxTags.asset.registerTicker` to `exceptions`

#### Defined in

[api/entities/types.ts:634](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L634)

___

### type

• **type**: [`PermissionType`](../wiki/api.entities.types.PermissionType)

Whether the permissions are inclusive or exclusive

#### Inherited from

[SectionPermissions](../wiki/api.entities.types.SectionPermissions).[type](../wiki/api.entities.types.SectionPermissions#type)

#### Defined in

[api/entities/types.ts:621](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L621)

___

### values

• **values**: ([`TxTag`](../wiki/generated.types#txtag) \| [`ModuleName`](../wiki/generated.types.ModuleName))[]

Values to be included/excluded

#### Inherited from

[SectionPermissions](../wiki/api.entities.types.SectionPermissions).[values](../wiki/api.entities.types.SectionPermissions#values)

#### Defined in

[api/entities/types.ts:617](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L617)
