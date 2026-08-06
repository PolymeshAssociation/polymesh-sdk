[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/Issuance

# api/entities/Asset/Fungible/Issuance

## Classes

### Issuance

Defined in: [api/entities/Asset/Fungible/Issuance/index.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Issuance/index.ts#L8)

Handles all Asset Issuance related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### issue()

> **issue**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/entities/Asset/Fungible/Issuance/index.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Fungible/Issuance/index.ts#L24)

Issue a certain amount of Asset tokens to the caller's default portfolio

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`IssueTokensParams`](../wiki/api.procedures.types#issuetokensparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [issue.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it
