[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Identity/IdentityAuthorizations

# api/entities/Identity/IdentityAuthorizations

## Classes

### IdentityAuthorizations

Defined in: [api/entities/Identity/IdentityAuthorizations.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/IdentityAuthorizations.ts#L12)

Handles all Identity Authorization related functionality

#### Extends

- [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations)\<[`Identity`](../wiki/api.entities.Identity#identity)\>

#### Methods

##### getHistoricalAuthorizations()

> **getHistoricalAuthorizations**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/common/namespaces/Authorizations.ts:159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/common/namespaces/Authorizations.ts#L159)

Fetch all historical Authorization Requests for which this Signer is the target

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; `status?`: [`AuthorizationStatusEnum`](../wiki/types#authorizationstatusenum); `type?`: [`AuthTypeEnum`](../wiki/types#authtypeenum); \} | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.status?` | [`AuthorizationStatusEnum`](../wiki/types#authorizationstatusenum) | fetch only authorizations with this status. Fetches all statuses if not passed |
| `opts.type?` | [`AuthTypeEnum`](../wiki/types#authtypeenum) | fetch only authorizations of this type. Fetches all types if not passed |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

supports pagination

###### Note

uses the middlewareV2

###### Inherited from

[`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations).[`getHistoricalAuthorizations`](../wiki/api.entities.common.namespaces.Authorizations#gethistoricalauthorizations)

##### getOne()

> **getOne**(`args`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>

Defined in: [api/entities/Identity/IdentityAuthorizations.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/IdentityAuthorizations.ts#L60)

Retrieve a single Authorization Request targeting or issued by this Identity by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>

###### Throws

if there is no Authorization Request with the passed ID targeting or issued by this Identity

###### Overrides

[`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations).[`getOne`](../wiki/api.entities.common.namespaces.Authorizations#getone)

##### getReceived()

> **getReceived**(`opts?`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)[]\>

Defined in: [api/entities/common/namespaces/Authorizations.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/common/namespaces/Authorizations.ts#L42)

Fetch all pending Authorization Requests for which this Signer is the target

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts?` | \{ `includeExpired?`: `boolean`; `type?`: [`AuthorizationType`](../wiki/api.entities.types#authorizationtype); \} | - |
| `opts.includeExpired?` | `boolean` | whether to include expired authorizations. Defaults to true |
| `opts.type?` | [`AuthorizationType`](../wiki/api.entities.types#authorizationtype) | fetch only authorizations of this type. Fetches all types if not passed |

###### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)[]\>

###### Inherited from

[`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations#authorizations).[`getReceived`](../wiki/api.entities.common.namespaces.Authorizations#getreceived)

##### getSent()

> **getSent**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/Identity/IdentityAuthorizations.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/IdentityAuthorizations.ts#L18)

Fetch all pending authorization requests issued by this Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

supports pagination
