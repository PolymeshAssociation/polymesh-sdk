# Class: TransferRestrictionBase<T\>

[api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase).TransferRestrictionBase

Base class for managing Transfer Restrictions

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TransferRestrictionType`](../wiki/types.TransferRestrictionType) |

## Hierarchy

- `Namespace`<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`TransferRestrictionBase`**

  ↳↳ [`ClaimCount`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount)

  ↳↳ [`ClaimPercentage`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage)

  ↳↳ [`Count`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count)

  ↳↳ [`Percentage`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage)

## Table of contents

### Methods

- [addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#addrestriction)
- [disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#disablestat)
- [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat)
- [get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#get)
- [removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#removerestrictions)
- [setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#setrestrictions)

## Methods

### addRestriction

▸ **addRestriction**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

Add a Transfer Restriction of the corresponding type to this Asset

**`Note`**

 the result is the total amount of restrictions after the procedure has run

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [addRestriction.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddRestrictionParams`](../wiki/api.procedures.types#addrestrictionparams)<`T`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

___

### disableStat

▸ **disableStat**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Removes an Asset statistic

**`Throws`**

 if the statistic is being used or is not set

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [disableStat.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveAssetStatParamsBase`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase#removeassetstatparamsbase)<`T`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### enableStat

▸ **enableStat**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Enables statistic of the corresponding type for this Asset, which are required for restrictions to be created

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [enableStat.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetAssetStatParams`](../wiki/api.procedures.types#setassetstatparams)<`T`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### get

▸ **get**(): `Promise`<[`GetTransferRestrictionReturnType`](../wiki/api.procedures.types#gettransferrestrictionreturntype)<`T`\>\>

Retrieve all active Transfer Restrictions of the corresponding type

**`Note`**

 there is a maximum number of restrictions allowed across all types.
  The `availableSlots` property of the result represents how many more restrictions can be added
  before reaching that limit

#### Returns

`Promise`<[`GetTransferRestrictionReturnType`](../wiki/api.procedures.types#gettransferrestrictionreturntype)<`T`\>\>

___

### removeRestrictions

▸ **removeRestrictions**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

Removes all Transfer Restrictions of the corresponding type from this Asset

**`Note`**

 the result is the total amount of restrictions after the procedure has run

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [removeRestrictions.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

___

### setRestrictions

▸ **setRestrictions**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>

Sets all Transfer Restrictions of the corresponding type on this Asset

**`Note`**

 the result is the total amount of restrictions after the procedure has run

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [setRestrictions.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetRestrictionsParams`](../wiki/api.procedures.types#setrestrictionsparams)<`T`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`BigNumber`, `BigNumber`\>\>
