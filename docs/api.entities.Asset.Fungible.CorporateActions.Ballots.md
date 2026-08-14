[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Fungible/CorporateActions/Ballots

# api/entities/Asset/Fungible/CorporateActions/Ballots

## Classes

### Ballots

Defined in: [api/entities/Asset/Fungible/CorporateActions/Ballots.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L21)

Handles all Asset Ballots related functionality

#### Extends

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### create()

> **create**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails), [`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)\>\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Ballots.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L25)

Create a Ballot for an Asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateBallotParams`](../wiki/api.procedures.types#createballotparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails), [`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### get()

> **get**(): `Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)[]\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Ballots.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L72)

Retrieve all Ballots associated to this Asset

###### Returns

`Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)[]\>

##### getOne()

> **getOne**(`args`): `Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)\>

Defined in: [api/entities/Asset/Fungible/CorporateActions/Ballots.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L45)

Retrieve a single Ballot associated to this Asset by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types#corporateballotwithdetails)\>

###### Throws

if there is no Ballot assigned to the provided Corporate Action with the passed ID

###### Throws

if the provided Corporate Action does not exist
