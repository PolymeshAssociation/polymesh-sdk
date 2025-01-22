# Class: Count

[api/entities/Asset/Fungible/TransferRestrictions/Count](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count).Count

Handles all Count Transfer Restriction related functionality

## Hierarchy

- [`TransferRestrictionBase`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)\<[`Count`](../wiki/api.procedures.types.TransferRestrictionType#count)\>

  ↳ **`Count`**

## Table of contents

### Properties

- [addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#addrestriction)
- [disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#disablestat)
- [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#enablestat)
- [get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#get)
- [getStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#getstat)
- [investorCount](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#investorcount)
- [removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#removerestrictions)
- [setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#setrestrictions)

## Properties

### addRestriction

• **addRestriction**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddCountTransferRestrictionParams`](../wiki/api.procedures.types#addcounttransferrestrictionparams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Add a Count Transfer Restriction to this Asset. This limits to total number of individual
investors that may hold the Asset. In some jurisdictions once a threshold of investors is
passed, different regulations may apply. Count Transfer Restriction can ensure such limits are not exceeded

**`Throws`**

if a count statistic is not enabled for the Asset. [Count.enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#enablestat) should be called before this method

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#addrestriction)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L39)

___

### disableStat

• **disableStat**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`void`, `void`\>

Disables the investor count statistic for the Asset. Since statistics introduce slight overhead to each transaction
involving the Asset, disabling unused stats will reduce gas fees for investors when they transact with the Asset

**`Throws`**

if the stat is being used by a restriction or is not set

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#disablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L83)

___

### enableStat

• **enableStat**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Pick`\<[`AddCountStatParams`](../wiki/api.procedures.types#addcountstatparams), ``"count"``\>, `void`, `void`\>

Enables an investor count statistic for the Asset, which is required before creating restrictions

The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
As such the initial value for the stat should be passed in, which can be fetched with [Count.investorCount](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count#investorcount)

**`Note`**

Currently there is a potential race condition if passing in counts values when the Asset is being traded.
It is recommended to call this method during the initial configuration of the Asset, before people are trading it.
Otherwise the Asset should be frozen, or the stat checked after being set to ensure the correct value is used. Future
versions of the chain may expose a new extrinsic to avoid this issue

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L75)

___

### get

• **get**: () => `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`CountTransferRestriction`](../wiki/api.entities.types.CountTransferRestriction)\>\>

#### Type declaration

▸ (): `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`CountTransferRestriction`](../wiki/api.entities.types.CountTransferRestriction)\>\>

/**
 * Retrieve all active Count Transfer Restrictions
 *
 *

##### Returns

`Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`CountTransferRestriction`](../wiki/api.entities.types.CountTransferRestriction)\>\>

**`Note`**

there is a maximum number of restrictions allowed across all types.
 *   The `availableSlots` property of the result represents how many more restrictions can be added
 *   before reaching that limit

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#get)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L94)

___

### getStat

• **getStat**: () => `Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

#### Type declaration

▸ (): `Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

Retrieve current Count Transfer Restriction investor balance statistic for the Asset

##### Returns

`Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[getStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#getstat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L109)

___

### investorCount

• **investorCount**: () => `Promise`\<`BigNumber`\>

#### Type declaration

▸ (): `Promise`\<`BigNumber`\>

Returns the count of individual holders of the Asset

##### Returns

`Promise`\<`BigNumber`\>

**`Note`**

This value can be used to initialize `enableStat`. If used for this purpose there is a potential race condition
if Asset transfers happen between the time of check and time of use. Either pause Asset transfers, or check after stat
creation and try again if a race occurred. Future versions of the chain should introduce an extrinsic to avoid this issue

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L103)

___

### removeRestrictions

• **removeRestrictions**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`BigNumber`, `BigNumber`\>

Removes all Count Transfer Restrictions from this Asset

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#removerestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L62)

___

### setRestrictions

• **setRestrictions**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`SetCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetCountTransferRestrictionsParams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Sets all Count Transfer Restrictions on this Asset

**`Note`**

this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Count Transfer Restriction
but not passed into this call then it will be removed

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#setrestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Count.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Fungible/TransferRestrictions/Count.ts#L52)
