# Class: Subsidies

[api/entities/Subsidies](../wiki/api.entities.Subsidies).Subsidies

Handles all Account Subsidies related functionality

## Hierarchy

- `Namespace`\<[`Account`](../wiki/api.entities.Account.Account)\>

  ↳ **`Subsidies`**

## Table of contents

### Methods

- [getBeneficiaries](../wiki/api.entities.Subsidies.Subsidies#getbeneficiaries)
- [getSubsidizer](../wiki/api.entities.Subsidies.Subsidies#getsubsidizer)

## Methods

### getBeneficiaries

▸ **getBeneficiaries**(): `Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)[]\>

Get the list of Subsidy relationship along with their subsidized amount for which this Account is the subsidizer

#### Returns

`Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)[]\>

#### Defined in

[api/entities/Subsidies.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Subsidies.ts#L12)

___

### getSubsidizer

▸ **getSubsidizer**(): `Promise`\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.
If this Account isn't being subsidized, return null

#### Returns

`Promise`\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Subsidies.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Subsidies.ts#L61)

▸ **getSubsidizer**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Subsidies.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Subsidies.ts#L62)
