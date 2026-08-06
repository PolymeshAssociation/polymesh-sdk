[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/TransferRestrictions

# api/entities/Asset/Fungible/TransferRestrictions

## Classes

### TransferRestrictions

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L64)

Handles all Transfer Restriction related functionality.

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### addExemptions()

> **addExemptions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:704](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L704)

Exempt identities from Transfer Restrictions. These identities will not be subject to Transfer Restriction rules.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferRestrictionExemptionParams`](../wiki/api.procedures.types#transferrestrictionexemptionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addExemptions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### getExemptions()

> **getExemptions**(): `Promise`\<[`TransferRestrictionExemption`](../wiki/api.entities.Asset.types#transferrestrictionexemption)[]\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:641](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L641)

Return identities with exemptions.

###### Returns

`Promise`\<[`TransferRestrictionExemption`](../wiki/api.entities.Asset.types#transferrestrictionexemption)[]\>

##### getRestrictions()

> **getRestrictions**(): `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.Asset.types#activetransferrestrictions)\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L141)

Get all current restrictions for this asset.

###### Returns

`Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.Asset.types#activetransferrestrictions)\>

##### getStats()

> **getStats**(): `Promise`\<[`AssetStat`](../wiki/api.entities.Asset.types#assetstat)[]\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:161](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L161)

Return active asset stats.

###### Returns

`Promise`\<[`AssetStat`](../wiki/api.entities.Asset.types#assetstat)[]\>

##### getValues()

> **getValues**(): `Promise`\<[`TransferRestrictionStatValues`](../wiki/api.entities.Asset.types#transferrestrictionstatvalues)[]\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:501](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L501)

Get the values of all active transfer restrictions for this Asset

###### Returns

`Promise`\<[`TransferRestrictionStatValues`](../wiki/api.entities.Asset.types#transferrestrictionstatvalues)[]\>

an array of objects containing the values of all active transfer restrictions for this Asset

##### removeExemptions()

> **removeExemptions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:711](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L711)

Remove identities from Transfer Restriction exemptions.

The given identities will no longer be exempt from Transfer Restrictions.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferRestrictionExemptionParams`](../wiki/api.procedures.types#transferrestrictionexemptionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeExemptions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### setRestrictions()

> **setRestrictions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:684](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L684)

Set all Transfer Restrictions on this Asset.

Transfer Restrictions control ownership requirements based on investor statistics.
For example, TransferRestrictionType.Count can limit the number of investors.
TransferRestrictionType.Percentage can limit the maximum percentage an individual investor may hold.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferRestrictionParams`](../wiki/api.procedures.types#transferrestrictionparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

The relevant stat must be enabled by including it in setStats before the restriction can be created.

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setRestrictions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### setStats()

> **setStats**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Fungible/TransferRestrictions/index.ts:699](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L699)

Set the enabled statistics for an Asset.

Transfer Restrictions require the relevant stat to be enabled before they can be set.
Calling this method will override the currently enabled stats with the provided set,
which means it can also be used to remove previously enabled stats.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SetTransferRestrictionStatParams`](../wiki/api.procedures.types#settransferrestrictionstatparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

If you attempt to remove a stat that is currently required by an active transfer restriction,
the chain will throw an error.

###### Note

Count-based stats must be given an initial value. The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
As such, the initial value for the stat should be passed in, which can be fetched with [FungibleAsset.investorCount](../wiki/api.entities.Asset.Fungible#investorcount).

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setStats.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
