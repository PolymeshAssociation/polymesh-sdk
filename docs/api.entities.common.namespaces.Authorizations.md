[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/common/namespaces/Authorizations

# api/entities/common/namespaces/Authorizations

## Classes

### Authorizations

Defined in: [api/entities/common/namespaces/Authorizations.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/common/namespaces/Authorizations.ts#L35)

Handles all Authorization related functionality

#### Extends

- `Namespace`\<`Parent`\>

#### Extended by

- [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations#identityauthorizations)

#### Type Parameters

| Type Parameter |
| ------ |
| `Parent` *extends* [`Signer`](../wiki/api.entities.types#signer) |

#### Methods

##### getHistoricalAuthorizations()

> **getHistoricalAuthorizations**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/common/namespaces/Authorizations.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/common/namespaces/Authorizations.ts#L150)

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

##### getOne()

> **getOne**(`args`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>

Defined in: [api/entities/common/namespaces/Authorizations.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/common/namespaces/Authorizations.ts#L80)

Retrieve a single Authorization Request targeting this Signer by its ID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `id`: `BigNumber`; \} |
| `args.id` | `BigNumber` |

###### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>

###### Throws

if there is no Authorization Request with the passed ID targeting this Signer

##### getReceived()

> **getReceived**(`opts?`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)[]\>

Defined in: [api/entities/common/namespaces/Authorizations.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/common/namespaces/Authorizations.ts#L42)

Fetch all pending Authorization Requests for which this Signer is the target

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts?` | \{ `includeExpired?`: `boolean`; `type?`: [`AuthorizationType`](../wiki/api.entities.types#authorizationtype); \} | - |
| `opts.includeExpired?` | `boolean` | whether to include expired authorizations. Defaults to true |
| `opts.type?` | [`AuthorizationType`](../wiki/api.entities.types#authorizationtype) | fetch only authorizations of this type. Fetches all types if not passed |

###### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)[]\>
