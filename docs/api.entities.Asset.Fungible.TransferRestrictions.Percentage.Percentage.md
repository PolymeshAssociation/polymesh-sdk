# Class: Percentage

[api/entities/Asset/Fungible/TransferRestrictions/Percentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage).Percentage

Handles all Percentage Transfer Restriction related functionality

## Hierarchy

- [`TransferRestrictionBase`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)\<[`Percentage`](../wiki/api.procedures.types.TransferRestrictionType#percentage)\>

  ↳ **`Percentage`**

## Table of contents

### Properties

- [addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#addrestriction)
- [disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#disablestat)
- [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#enablestat)
- [get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#get)
- [removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#removerestrictions)
- [setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#setrestrictions)

## Properties

### addRestriction

• **addRestriction**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddPercentageTransferRestrictionParams`](../wiki/api.procedures.types#addpercentagetransferrestrictionparams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Add a Percentage Transfer Restriction to this Asset. This limits the total percentage of the supply
a single investor can acquire without an exemption

**`Throws`**

if the Balance statistic is not enabled for this Asset. [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage#enablestat) should be called before this method

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#addrestriction)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L28)

___

### disableStat

• **disableStat**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`void`, `void`\>

Disables the investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
involving the Asset, disabling unused stats will reduce gas fees for investors when they transact with the Asset

**`Throws`**

if the stat is being used by a restriction or is not set

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#disablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L65)

___

### enableStat

• **enableStat**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`void`, `void`\>

Enables investor balance statistic for the Asset, which is required before creating restrictions
that limit the total ownership of the Assets' supply

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L57)

___

### get

• **get**: () => `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`PercentageTransferRestriction`](../wiki/api.entities.types.PercentageTransferRestriction)\>\>

#### Type declaration

▸ (): `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`PercentageTransferRestriction`](../wiki/api.entities.types.PercentageTransferRestriction)\>\>

Retrieve all active Percentage Transfer Restrictions

##### Returns

`Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`PercentageTransferRestriction`](../wiki/api.entities.types.PercentageTransferRestriction)\>\>

**`Note`**

there is a maximum number of restrictions allowed across all types.
  The `availableSlots` property of the result represents how many more restrictions can be added
  before reaching that limit

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#get)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L74)

___

### removeRestrictions

• **removeRestrictions**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`BigNumber`, `BigNumber`\>

Removes all Percentage Transfer Restrictions from this Asset

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#removerestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L51)

___

### setRestrictions

• **setRestrictions**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`SetPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetPercentageTransferRestrictionsParams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Sets all Percentage Transfer Restrictions on this Asset

**`Note`**

this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Percentage Transfer Restriction
but not passed into this call then it will be removed

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#setrestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts:41](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/Percentage.ts#L41)
