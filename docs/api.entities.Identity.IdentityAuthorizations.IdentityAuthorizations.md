# Class: IdentityAuthorizations

[api/entities/Identity/IdentityAuthorizations](../wiki/api.entities.Identity.IdentityAuthorizations).IdentityAuthorizations

Handles all Identity Authorization related functionality

## Hierarchy

- [`Authorizations`](../wiki/api.entities.common.namespaces.Authorizations.Authorizations)\<[`Identity`](../wiki/api.entities.Identity.Identity)\>

  ↳ **`IdentityAuthorizations`**

## Table of contents

### Methods

- [getHistoricalAuthorizations](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations#gethistoricalauthorizations)
- [getOne](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations#getone)
- [getReceived](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations#getreceived)
- [getSent](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations#getsent)

## Methods

### getHistoricalAuthorizations

▸ **getHistoricalAuthorizations**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Fetch all historical Authorization Requests for which this Signer is the target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.status?` | [`AuthorizationStatusEnum`](../wiki/types.AuthorizationStatusEnum) | fetch only authorizations with this status. Fetches all statuses if not passed |
| `opts.type?` | [`AuthTypeEnum`](../wiki/types.AuthTypeEnum) | fetch only authorizations of this type. Fetches all types if not passed |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

supports pagination

**`Note`**

uses the middlewareV2

#### Inherited from

[Authorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations).[getHistoricalAuthorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#gethistoricalauthorizations)

#### Defined in

[api/entities/common/namespaces/Authorizations.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/common/namespaces/Authorizations.ts#L150)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

Retrieve a single Authorization Request targeting or issued by this Identity by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

**`Throws`**

if there is no Authorization Request with the passed ID targeting or issued by this Identity

#### Overrides

[Authorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations).[getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

#### Defined in

[api/entities/Identity/IdentityAuthorizations.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/IdentityAuthorizations.ts#L60)

___

### getReceived

▸ **getReceived**(`opts?`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)[]\>

Fetch all pending Authorization Requests for which this Signer is the target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts?` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired authorizations. Defaults to true |
| `opts.type?` | [`AuthorizationType`](../wiki/api.entities.types.AuthorizationType) | fetch only authorizations of this type. Fetches all types if not passed |

#### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)[]\>

#### Inherited from

[Authorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations).[getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived)

#### Defined in

[api/entities/common/namespaces/Authorizations.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/common/namespaces/Authorizations.ts#L42)

___

### getSent

▸ **getSent**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Fetch all pending authorization requests issued by this Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

supports pagination

#### Defined in

[api/entities/Identity/IdentityAuthorizations.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/IdentityAuthorizations.ts#L18)
