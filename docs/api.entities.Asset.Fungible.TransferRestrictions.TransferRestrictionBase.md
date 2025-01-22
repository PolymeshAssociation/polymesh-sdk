# Module: api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase

## Table of contents

### Classes

- [TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)

### Type Aliases

- [RemoveAssetStatParamsBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase#removeassetstatparamsbase)
- [SetTransferRestrictionsParams](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase#settransferrestrictionsparams)

## Type Aliases

### RemoveAssetStatParamsBase

Ƭ **RemoveAssetStatParamsBase**\<`T`\>: `Omit`\<`T` extends [`Count`](../wiki/api.procedures.types.TransferRestrictionType#count) ? [`RemoveCountStatParams`](../wiki/api.procedures.types#removecountstatparams) : `T` extends [`Percentage`](../wiki/api.procedures.types.TransferRestrictionType#percentage) ? [`RemoveBalanceStatParams`](../wiki/api.procedures.types#removebalancestatparams) : `T` extends [`ClaimCount`](../wiki/api.procedures.types.TransferRestrictionType#claimcount) ? [`RemoveScopedCountParams`](../wiki/api.procedures.types#removescopedcountparams) : [`RemoveScopedBalanceParams`](../wiki/api.procedures.types#removescopedbalanceparams), ``"type"``\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts#L57)

___

### SetTransferRestrictionsParams

Ƭ **SetTransferRestrictionsParams**: \{ `asset`: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)  } & [`SetCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetCountTransferRestrictionsParams) \| [`SetPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetPercentageTransferRestrictionsParams) \| [`SetClaimCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimCountTransferRestrictionsParams) \| [`SetClaimPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimPercentageTransferRestrictionsParams)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts#L50)
