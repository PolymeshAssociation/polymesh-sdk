# Interface: TransactionsParams

[api/procedures/types](../wiki/api.procedures.types).TransactionsParams

## Hierarchy

- [`AssetBase`](../wiki/api.procedures.types.AssetBase)

  ↳ **`TransactionsParams`**

## Table of contents

### Properties

- [asset](../wiki/api.procedures.types.TransactionsParams#asset)
- [transactions](../wiki/api.procedures.types.TransactionsParams#transactions)

## Properties

### asset

• **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset over which the Identity will be granted permissions

#### Inherited from

[AssetBase](../wiki/api.procedures.types.AssetBase).[asset](../wiki/api.procedures.types.AssetBase#asset)

#### Defined in

[api/procedures/types.ts:1545](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1545)

___

### transactions

• **transactions**: ``null`` \| [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

a null value means full permissions

#### Defined in

[api/procedures/types.ts:1552](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L1552)
