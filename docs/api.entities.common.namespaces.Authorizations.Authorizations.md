# Class: Authorizations<Parent\>

[api/entities/common/namespaces/Authorizations](../wiki/api.entities.common.namespaces.Authorizations).Authorizations

Handles all Authorization related functionality

## Type parameters

| Name | Type |
| :------ | :------ |
| `Parent` | extends [`Signer`](../wiki/types#signer) |

## Hierarchy

- `Namespace`<`Parent`\>

  ↳ **`Authorizations`**

  ↳↳ [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations)

## Table of contents

### Methods

- [getHistoricalAuthorizations](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#gethistoricalauthorizations)
- [getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)
- [getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived)

## Methods

### getHistoricalAuthorizations

▸ **getHistoricalAuthorizations**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Fetch all historical Authorization Requests for which this Signer is the target

**`Note`**

 supports pagination

**`Note`**

 uses the middlewareV2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |
| `opts.status?` | [`AuthorizationStatusEnum`](../wiki/types.AuthorizationStatusEnum) | fetch only authorizations with this status. Fetches all statuses if not passed |
| `opts.type?` | [`AuthTypeEnum`](../wiki/types.AuthTypeEnum) | fetch only authorizations of this type. Fetches all types if not passed |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

___

### getOne

▸ **getOne**(`args`): `Promise`<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

Retrieve a single Authorization Request targeting this Signer by its ID

**`Throws`**

 if there is no Authorization Request with the passed ID targeting this Signer

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>

___

### getReceived

▸ **getReceived**(`opts?`): `Promise`<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)[]\>

Fetch all pending Authorization Requests for which this Signer is the target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts?` | `Object` | - |
| `opts.includeExpired?` | `boolean` | whether to include expired authorizations. Defaults to true |
| `opts.type?` | [`AuthorizationType`](../wiki/types.AuthorizationType) | fetch only authorizations of this type. Fetches all types if not passed |

#### Returns

`Promise`<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)[]\>
