# Class: AccountManagement

[api/client/AccountManagement](../wiki/api.client.AccountManagement).AccountManagement

Handles functionality related to Account Management

## Table of contents

### Methods

- [acceptPrimaryKey](../wiki/api.client.AccountManagement.AccountManagement#acceptprimarykey)
- [addSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#addsecondaryaccounts)
- [createMultiSigAccount](../wiki/api.client.AccountManagement.AccountManagement#createmultisigaccount)
- [freezeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#freezesecondaryaccounts)
- [generateOffChainAuthSignature](../wiki/api.client.AccountManagement.AccountManagement#generateoffchainauthsignature)
- [getAccount](../wiki/api.client.AccountManagement.AccountManagement#getaccount)
- [getAccountBalance](../wiki/api.client.AccountManagement.AccountManagement#getaccountbalance)
- [getSigningAccount](../wiki/api.client.AccountManagement.AccountManagement#getsigningaccount)
- [getSigningAccounts](../wiki/api.client.AccountManagement.AccountManagement#getsigningaccounts)
- [getSubsidy](../wiki/api.client.AccountManagement.AccountManagement#getsubsidy)
- [inviteAccount](../wiki/api.client.AccountManagement.AccountManagement#inviteaccount)
- [isValidAddress](../wiki/api.client.AccountManagement.AccountManagement#isvalidaddress)
- [leaveIdentity](../wiki/api.client.AccountManagement.AccountManagement#leaveidentity)
- [modifyPermissions](../wiki/api.client.AccountManagement.AccountManagement#modifypermissions)
- [removeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#removesecondaryaccounts)
- [revokePermissions](../wiki/api.client.AccountManagement.AccountManagement#revokepermissions)
- [subsidizeAccount](../wiki/api.client.AccountManagement.AccountManagement#subsidizeaccount)
- [unfreezeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#unfreezesecondaryaccounts)

## Methods

### acceptPrimaryKey

▸ **acceptPrimaryKey**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Accepts the authorization to become the new primary key of the issuing identity.

If a CDD service provider approved this change (or this is not required), primary key of the Identity is updated.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AcceptPrimaryKeyRotationParams`](../wiki/api.procedures.types.AcceptPrimaryKeyRotationParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

The caller (new primary key) must be either a secondary key of the issuing identity, or
unlinked to any identity.

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [acceptPrimaryKey.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L373)

___

### addSecondaryAccounts

▸ **addSecondaryAccounts**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

Adds a list of secondary Accounts to the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AddSecondaryAccountsParams`](../wiki/api.procedures.types.AddSecondaryAccountsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity.Identity), [`Identity`](../wiki/api.entities.Identity.Identity)\>\>

**`Throws`**

if the signing Account is not the primary Account of the Identity

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [addSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:163](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L163)

___

### createMultiSigAccount

▸ **createMultiSigAccount**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig), [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>\>

Create a MultiSig Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateMultiSigParams`](../wiki/api.procedures.types.CreateMultiSigParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig), [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>\>

**`Note`**

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) for each signing Account which will have to be accepted before they can approve transactions. None of the signing Accounts can be associated with an Identity when accepting the Authorization
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createMultiSigAccount.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:249](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L249)

___

### freezeSecondaryAccounts

▸ **freezeSecondaryAccounts**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Freeze all of the secondary Accounts in the signing Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the Accounts are unfrozen via [unfreezeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#unfreezesecondaryaccounts)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [freezeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L211)

___

### generateOffChainAuthSignature

▸ **generateOffChainAuthSignature**(`args`): `Promise`\<\`0x$\{string}\`\>

Generate an offchain authorization signature with a specified signer

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.expiry` | `Date` | date after which the authorization expires |
| `args.signer` | `string` \| [`Account`](../wiki/api.entities.Account.Account) | Signer to be used to generate the off chain auth signature |
| `args.target` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) | DID of the identity to which signer is targeting the authorization |

#### Returns

`Promise`\<\`0x$\{string}\`\>

#### Defined in

[api/client/AccountManagement.ts:384](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L384)

___

### getAccount

▸ **getAccount**(`args`): `Promise`\<[`Account`](../wiki/api.entities.Account.Account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Return an Account instance from an address. If the Account has multiSig signers, the returned value will be a [MultiSig](../wiki/api.entities.Account.MultiSig.MultiSig) instance

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.address` | `string` |

#### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account.Account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

#### Defined in

[api/client/AccountManagement.ts:308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L308)

___

### getAccountBalance

▸ **getAccountBalance**(`args?`): `Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

Get the free/locked POLYX balance of an Account

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.account` | `string` \| [`Account`](../wiki/api.entities.Account.Account) | defaults to the signing Account |

#### Returns

`Promise`\<[`Balance`](../wiki/api.entities.Account.types.Balance)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/client/AccountManagement.ts:260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L260)

▸ **getAccountBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Balance`](../wiki/api.entities.Account.types.Balance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/client/AccountManagement.ts:261](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L261)

▸ **getAccountBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.account` | `string` \| [`Account`](../wiki/api.entities.Account.Account) |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Balance`](../wiki/api.entities.Account.types.Balance)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/client/AccountManagement.ts:262](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L262)

___

### getSigningAccount

▸ **getSigningAccount**(): ``null`` \| [`Account`](../wiki/api.entities.Account.Account)

Return the signing Account, or null if no signing Account has been set

#### Returns

``null`` \| [`Account`](../wiki/api.entities.Account.Account)

#### Defined in

[api/client/AccountManagement.ts:315](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L315)

___

### getSigningAccounts

▸ **getSigningAccounts**(): `Promise`\<[`Account`](../wiki/api.entities.Account.Account)[]\>

Return a list that contains all the signing Accounts associated to the SDK instance's Signing Manager

#### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account.Account)[]\>

**`Throws`**

— if there is no Signing Manager attached to the SDK

#### Defined in

[api/client/AccountManagement.ts:328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L328)

___

### getSubsidy

▸ **getSubsidy**(`args`): [`Subsidy`](../wiki/api.entities.Subsidy.Subsidy)

Return an Subsidy instance for a pair of beneficiary and subsidizer Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.beneficiary` | `string` \| [`Account`](../wiki/api.entities.Account.Account) |
| `args.subsidizer` | `string` \| [`Account`](../wiki/api.entities.Account.Account) |

#### Returns

[`Subsidy`](../wiki/api.entities.Subsidy.Subsidy)

#### Defined in

[api/client/AccountManagement.ts:335](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L335)

___

### inviteAccount

▸ **inviteAccount**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an invitation to an Account to join the signing Identity as a secondary Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InviteAccountParams`](../wiki/api.procedures.types.InviteAccountParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `targetAccount`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [inviteAccount.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L201)

___

### isValidAddress

▸ **isValidAddress**(`args`): `boolean`

Returns `true`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.address` | `string` | is a valid ss58 address for the connected network |

#### Returns

`boolean`

#### Defined in

[api/client/AccountManagement.ts:352](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L352)

___

### leaveIdentity

▸ **leaveIdentity**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Disassociate the signing Account from its Identity. This operation can only be done if the signing Account is a secondary Account

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [leaveIdentity.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L141)

___

### modifyPermissions

▸ **modifyPermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify all permissions of a list of secondary Accounts associated with the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifySignerPermissionsParams`](../wiki/api.procedures.types.ModifySignerPermissionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being modified

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modifyPermissions.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L187)

___

### removeSecondaryAccounts

▸ **removeSecondaryAccounts**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove a list of secondary Accounts associated with the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveSecondaryAccountsParams`](../wiki/api.procedures.types.RemoveSecondaryAccountsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [removeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:151](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L151)

___

### revokePermissions

▸ **revokePermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Revoke all permissions of a list of secondary Accounts associated with the signing Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.secondaryAccounts` | (`string` \| [`Account`](../wiki/api.entities.Account.Account))[] |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being revoked

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [revokePermissions.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:175](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L175)

___

### subsidizeAccount

▸ **subsidizeAccount**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an Authorization Request to an Account to subsidize its transaction fees

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SubsidizeAccountParams`](../wiki/api.procedures.types.SubsidizeAccountParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `beneficiary` Account.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [subsidizeAccount.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L235)

___

### unfreezeSecondaryAccounts

▸ **unfreezeSecondaryAccounts**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Unfreeze all of the secondary Accounts in the signing Identity. This will restore their permissions as they were before being frozen

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [unfreezeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/AccountManagement.ts:221](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/AccountManagement.ts#L221)
