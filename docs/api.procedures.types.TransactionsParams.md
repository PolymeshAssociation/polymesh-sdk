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

[api/procedures/types.ts:1613](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1613)

___

### transactions

• **transactions**: ``null`` \| [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

a null value means full permissions

#### Defined in

[api/procedures/types.ts:1620](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1620)
