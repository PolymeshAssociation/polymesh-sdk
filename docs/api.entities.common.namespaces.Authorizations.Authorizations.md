# Class: Authorizations\<Parent\>

[api/entities/common/namespaces/Authorizations](../wiki/api.entities.common.namespaces.Authorizations).Authorizations

Handles all Authorization related functionality

## Type parameters

| Name | Type |
| :------ | :------ |
| `Parent` | extends [`Signer`](../wiki/api.entities.types#signer) |

## Hierarchy

- `Namespace`\<`Parent`\>

  ↳ **`Authorizations`**

  ↳↳ [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations)

## Table of contents

### Methods

- [getHistoricalAuthorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#gethistoricalauthorizations)
- [getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)
- [getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived)

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

#### Defined in

[api/entities/common/namespaces/Authorizations.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/common/namespaces/Authorizations.ts#L150)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

Retrieve a single Authorization Request targeting this Signer by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

**`Throws`**

if there is no Authorization Request with the passed ID targeting this Signer

#### Defined in

[api/entities/common/namespaces/Authorizations.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/common/namespaces/Authorizations.ts#L80)

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

#### Defined in

[api/entities/common/namespaces/Authorizations.ts:42](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/common/namespaces/Authorizations.ts#L42)
