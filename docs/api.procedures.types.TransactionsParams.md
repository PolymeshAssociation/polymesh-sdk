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

[api/procedures/types.ts:1429](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1429)

___

### transactions

• **transactions**: ``null`` \| [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

a null value means full permissions

#### Defined in

[api/procedures/types.ts:1436](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1436)
