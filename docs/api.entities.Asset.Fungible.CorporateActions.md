[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/CorporateActions

# api/entities/Asset/Fungible/CorporateActions

## Classes

### CorporateActions

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L31)

Handles all Asset Corporate Actions related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Properties

##### ballots

> **ballots**: [`Ballots`](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots#ballots)

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L33)

##### distributions

> **distributions**: [`Distributions`](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions#distributions)

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L32)

##### initiate

> **initiate**: [`ProcedureMethod`](../wiki/api.procedures.types#proceduremethod)\<[`InitiateCorporateActionParams`](../wiki/api.procedures.types#initiatecorporateactionparams), [`CorporateAction`](../wiki/api.entities.CorporateAction#corporateaction)\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:148](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L148)

#### Methods

##### getAgents()

> **getAgents**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)[]\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L77)

Retrieve a list of agent Identities

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity)[]\>

##### getDefaultConfig()

> **getDefaultConfig**(): `Promise`\<[`CorporateActionDefaultConfig`](../wiki/api.entities.Asset.Fungible.CorporateActions.types#corporateactiondefaultconfig)\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L113)

Retrieve default config comprising of targets, global tax withholding percentage and per-Identity tax withholding percentages.

###### Returns

`Promise`\<[`CorporateActionDefaultConfig`](../wiki/api.entities.Asset.Fungible.CorporateActions.types#corporateactiondefaultconfig)\>

###### Note

This config is applied to every Corporate Action that is created until they are modified. Modifying the default config
  does not impact existing Corporate Actions.
  When creating a Corporate Action, values passed explicitly will override this default config

##### remove()

> **remove**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L72)

Remove a Corporate Action

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveCorporateActionParams`](../wiki/api.procedures.types#removecorporateactionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### setDefaultConfig()

> **setDefaultConfig**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/index.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/CorporateActions/index.ts#L67)

Assign default config values(targets, global tax withholding percentage and per-Identity tax withholding percentages)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyCaDefaultConfigParams`](../wiki/api.procedures.types#modifycadefaultconfigparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

These config values are applied to every Corporate Action that is created until they are modified. Modifying these values
  does not impact existing Corporate Actions.
  When creating a Corporate Action, values passed explicitly will override these default config values

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setDefaultConfig.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
