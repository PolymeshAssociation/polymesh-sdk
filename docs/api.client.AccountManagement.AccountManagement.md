# Class: AccountManagement

[api/client/AccountManagement](../wiki/api.client.AccountManagement).AccountManagement

Handles functionality related to Account Management

## Table of contents

### Methods

- [acceptPrimaryKey](../wiki/api.client.AccountManagement.AccountManagement#acceptprimarykey)
- [createMultiSigAccount](../wiki/api.client.AccountManagement.AccountManagement#createmultisigaccount)
- [freezeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#freezesecondaryaccounts)
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

▸ **acceptPrimaryKey**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Accepts the authorization to become the new primary key of the issuing identity.

If a CDD service provider approved this change (or this is not required), primary key of the Identity is updated.

**`Note`**

 The caller (new primary key) must be either a secondary key of the issuing identity, or
unlinked to any identity.

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [acceptPrimaryKey.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`AcceptPrimaryKeyRotationParams`](../wiki/api.procedures.types.AcceptPrimaryKeyRotationParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### createMultiSigAccount

▸ **createMultiSigAccount**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig), [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>\>

Create a MultiSig Account

**`Note`**

 this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) for each signing Account which will have to be accepted before they can approve transactions. None of the signing Accounts can be associated with an Identity when accepting the Authorization
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [createMultiSigAccount.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateMultiSigParams`](../wiki/api.procedures.types.CreateMultiSigParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig), [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>\>

___

### freezeSecondaryAccounts

▸ **freezeSecondaryAccounts**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Freeze all of the secondary Accounts in the signing Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the Accounts are unfrozen via [unfreezeSecondaryAccounts](../wiki/api.client.AccountManagement.AccountManagement#unfreezesecondaryaccounts)

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [freezeSecondaryAccounts.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### getAccount

▸ **getAccount**(`args`): `Promise`<[`Account`](../wiki/api.entities.Account.Account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

Return an Account instance from an address. If the Account has multiSig signers, the returned value will be a [MultiSig](../wiki/api.entities.Account.MultiSig.MultiSig) instance

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.address` | `string` |

#### Returns

`Promise`<[`Account`](../wiki/api.entities.Account.Account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)\>

___

### getAccountBalance

▸ **getAccountBalance**(`args?`): `Promise`<[`Balance`](../wiki/types.Balance)\>

Get the free/locked POLYX balance of an Account

**`Note`**

 can be subscribed to

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args?` | `Object` | - |
| `args.account` | `string` \| [`Account`](../wiki/api.entities.Account.Account) | defaults to the signing Account |

#### Returns

`Promise`<[`Balance`](../wiki/types.Balance)\>

▸ **getAccountBalance**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`Balance`](../wiki/types.Balance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

▸ **getAccountBalance**(`args`, `callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.account` | `string` \| [`Account`](../wiki/api.entities.Account.Account) |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`Balance`](../wiki/types.Balance)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

___

### getSigningAccount

▸ **getSigningAccount**(): ``null`` \| [`Account`](../wiki/api.entities.Account.Account)

Return the signing Account, or null if no signing Account has been set

#### Returns

``null`` \| [`Account`](../wiki/api.entities.Account.Account)

___

### getSigningAccounts

▸ **getSigningAccounts**(): `Promise`<[`Account`](../wiki/api.entities.Account.Account)[]\>

Return a list that contains all the signing Accounts associated to the SDK instance's Signing Manager

**`Throws`**

 — if there is no Signing Manager attached to the SDK

#### Returns

`Promise`<[`Account`](../wiki/api.entities.Account.Account)[]\>

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

___

### inviteAccount

▸ **inviteAccount**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an invitation to an Account to join the signing Identity as a secondary Account

**`Note`**

 this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `targetAccount`.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [inviteAccount.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InviteAccountParams`](../wiki/api.procedures.types.InviteAccountParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

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

___

### leaveIdentity

▸ **leaveIdentity**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Disassociate the signing Account from its Identity. This operation can only be done if the signing Account is a secondary Account

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [leaveIdentity.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### modifyPermissions

▸ **modifyPermissions**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Modify all permissions of a list of secondary Accounts associated with the signing Identity

**`Throws`**

 if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being modified

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [modifyPermissions.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifySignerPermissionsParams`](../wiki/api.procedures.types.ModifySignerPermissionsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### removeSecondaryAccounts

▸ **removeSecondaryAccounts**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Remove a list of secondary Accounts associated with the signing Identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [removeSecondaryAccounts.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RemoveSecondaryAccountsParams`](../wiki/api.procedures.types.RemoveSecondaryAccountsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### revokePermissions

▸ **revokePermissions**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Revoke all permissions of a list of secondary Accounts associated with the signing Identity

**`Throws`**

 if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being revoked

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [revokePermissions.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.secondaryAccounts` | (`string` \| [`Account`](../wiki/api.entities.Account.Account))[] |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### subsidizeAccount

▸ **subsidizeAccount**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Send an Authorization Request to an Account to subsidize its transaction fees

**`Note`**

 this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `beneficiary` Account.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [subsidizeAccount.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SubsidizeAccountParams`](../wiki/api.procedures.types.SubsidizeAccountParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

___

### unfreezeSecondaryAccounts

▸ **unfreezeSecondaryAccounts**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Unfreeze all of the secondary Accounts in the signing Identity. This will restore their permissions as they were before being frozen

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [unfreezeSecondaryAccounts.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>
