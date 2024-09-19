# Interface: SectionPermissions\<T\>

[api/entities/types](../wiki/api.entities.types).SectionPermissions

Signer/agent permissions for a specific type

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | type of Permissions (Asset, Transaction, Portfolio, etc) |

## Hierarchy

- **`SectionPermissions`**

  ↳ [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

## Table of contents

### Properties

- [type](../wiki/api.entities.types.SectionPermissions#type)
- [values](../wiki/api.entities.types.SectionPermissions#values)

## Properties

### type

• **type**: [`PermissionType`](../wiki/api.entities.types.PermissionType)

Whether the permissions are inclusive or exclusive

#### Defined in

[api/entities/types.ts:615](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L615)

___

### values

• **values**: `T`[]

Values to be included/excluded

#### Defined in

[api/entities/types.ts:611](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/types.ts#L611)
