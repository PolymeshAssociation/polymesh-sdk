# Class: Subsidies

[api/entities/Subsidies](../wiki/api.entities.Subsidies).Subsidies

Handles all Account Subsidies related functionality

## Hierarchy

- `Namespace`<[`Account`](../wiki/api.entities.Account.Account)\>

  ↳ **`Subsidies`**

## Table of contents

### Methods

- [getBeneficiaries](../wiki/api.entities.Subsidies.Subsidies#getbeneficiaries)
- [getSubsidizer](../wiki/api.entities.Subsidies.Subsidies#getsubsidizer)

## Methods

### getBeneficiaries

▸ **getBeneficiaries**(): `Promise`<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)[]\>

Get the list of Subsidy relationship along with their subsidized amount for which this Account is the subsidizer

#### Returns

`Promise`<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)[]\>

___

### getSubsidizer

▸ **getSubsidizer**(): `Promise`<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.
If this Account isn't being subsidized, return null

**`Note`**

 can be subscribed to

#### Returns

`Promise`<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

▸ **getSubsidizer**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>
