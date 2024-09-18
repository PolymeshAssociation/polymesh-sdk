# Class: CorporateActions

[api/entities/Asset/Fungible/CorporateActions](../wiki/api.entities.Asset.Fungible.CorporateActions).CorporateActions

Handles all Asset Corporate Actions related functionality

## Hierarchy

- `Namespace`<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`CorporateActions`**

## Table of contents

### Properties

- [distributions](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions#distributions)

### Methods

- [getAgents](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions#getagents)
- [getDefaultConfig](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions#getdefaultconfig)
- [remove](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions#remove)
- [setDefaultConfig](../wiki/api.entities.Asset.Fungible.CorporateActions.CorporateActions#setdefaultconfig)

## Properties

### distributions

• **distributions**: [`Distributions`](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions.Distributions)

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/index.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L26)

## Methods

### getAgents

▸ **getAgents**(): `Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

Retrieve a list of agent Identities

#### Returns

`Promise`<[`Identity`](../wiki/api.entities.Identity.Identity)[]\>

___

### getDefaultConfig

▸ **getDefaultConfig**(): `Promise`<[`CorporateActionDefaultConfig`](../wiki/api.entities.Asset.Fungible.CorporateActions.types.CorporateActionDefaultConfig)\>

Retrieve default config comprising of targets, global tax withholding percentage and per-Identity tax withholding percentages.

**`Note`**

 This config is applied to every Corporate Action that is created until they are modified. Modifying the default config
  does not impact existing Corporate Actions.
  When creating a Corporate Action, values passed explicitly will override this default config

#### Returns

`Promise`<[`CorporateActionDefaultConfig`](../wiki/api.entities.Asset.Fungible.CorporateActions.types.CorporateActionDefaultConfig)\>

___

### remove

▸ **remove**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Remove a Corporate Action

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveCorporateActionParams`](../wiki/api.procedures.types.RemoveCorporateActionParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### setDefaultConfig

▸ **setDefaultConfig**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Assign default config values(targets, global tax withholding percentage and per-Identity tax withholding percentages)

**`Note`**

 These config values are applied to every Corporate Action that is created until they are modified. Modifying these values
  does not impact existing Corporate Actions.
  When creating a Corporate Action, values passed explicitly will override these default config values

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [setDefaultConfig.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyCaDefaultConfigParams`](../wiki/api.procedures.types#modifycadefaultconfigparams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
