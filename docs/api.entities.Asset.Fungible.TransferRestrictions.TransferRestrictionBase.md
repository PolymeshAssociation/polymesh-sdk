# Module: api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase

## Table of contents

### Classes

- [TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)

### Type Aliases

- [RemoveAssetStatParamsBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase#removeassetstatparamsbase)
- [SetTransferRestrictionsParams](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase#settransferrestrictionsparams)

## Type Aliases

### RemoveAssetStatParamsBase

Ƭ **RemoveAssetStatParamsBase**<`T`\>: `Omit`<`T` extends [`Count`](../wiki/types.TransferRestrictionType#count) ? [`RemoveCountStatParams`](../wiki/api.procedures.types#removecountstatparams) : `T` extends [`Percentage`](../wiki/types.TransferRestrictionType#percentage) ? [`RemoveBalanceStatParams`](../wiki/api.procedures.types#removebalancestatparams) : `T` extends [`ClaimCount`](../wiki/types.TransferRestrictionType#claimcount) ? [`RemoveScopedCountParams`](../wiki/api.procedures.types#removescopedcountparams) : [`RemoveScopedBalanceParams`](../wiki/api.procedures.types#removescopedbalanceparams), ``"type"``\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts#L51)

___

### SetTransferRestrictionsParams

Ƭ **SetTransferRestrictionsParams**: { `ticker`: `string`  } & [`SetCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetCountTransferRestrictionsParams) \| [`SetPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetPercentageTransferRestrictionsParams) \| [`SetClaimCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimCountTransferRestrictionsParams) \| [`SetClaimPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimPercentageTransferRestrictionsParams)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase.ts#L44)
