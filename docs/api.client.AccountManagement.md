[@polymeshassociation/polymesh-sdk](../wiki/README) / api/client/AccountManagement

# api/client/AccountManagement

## Classes

### AccountManagement

Defined in: [api/client/AccountManagement.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L52)

Handles functionality related to Account Management

#### Methods

##### acceptPrimaryKey()

> **acceptPrimaryKey**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L364)

Accepts the authorization to become the new primary key of the issuing identity.

If a CDD service provider approved this change (or this is not required), primary key of the Identity is updated.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AcceptPrimaryKeyRotationParams`](../wiki/api.procedures.types#acceptprimarykeyrotationparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

The caller (new primary key) must be either a secondary key of the issuing identity, or
unlinked to any identity.

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [acceptPrimaryKey.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### acceptSubsidy()

> **acceptSubsidy**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:212](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L212)

Accepts a pending subsidy request from subsidizer

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AcceptSubsidyParams`](../wiki/api.procedures.types#acceptsubsidyparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

Only the beneficiary can accept an already approved subsidy request. Pending subsidies for a beneficiary can be fetched by calling [subsidies.getPendingSubsidies](../wiki/api.entities.Subsidies#getpendingsubsidies).

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [acceptSubsidy.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### addSecondaryAccounts()

> **addSecondaryAccounts**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

Defined in: [api/client/AccountManagement.ts:161](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L161)

Adds a list of secondary Accounts to the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`AddSecondaryAccountsParams`](../wiki/api.procedures.types#addsecondaryaccountsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Identity`](../wiki/api.entities.Identity#identity), [`Identity`](../wiki/api.entities.Identity#identity)\>\>

###### Throws

if the signing Account is not the primary Account of the Identity

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [addSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### approveSubsidy()

> **approveSubsidy**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L205)

Approves a subsidy request

This is to be called in by the paying key to approve allowance with respect to a beneficiary key.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`SubsidizeAccountParams`](../wiki/api.procedures.types#subsidizeaccountparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this will create a pending subsidies entry, which has to be accepted by the `beneficiary` Account. Pending subsidies for a beneficiary can be fetched by calling [subsidies.getPendingSubsidies](../wiki/api.entities.Subsidies#getpendingsubsidies).

###### Throws

if same allowance amount is pending for acceptance with respect to same beneficiary

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [approveSubsidy.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### createMultiSigAccount()

> **createMultiSigAccount**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig), [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)\>\>

Defined in: [api/client/AccountManagement.ts:228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L228)

Create a MultiSig Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateMultiSigParams`](../wiki/api.procedures.types#createmultisigparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig), [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)\>\>

###### Note

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest#authorizationrequest) for each signing Account which will have to be accepted before they can approve transactions. None of the signing Accounts can be associated with an Identity when accepting the Authorization
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.types#identity-5) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createMultiSigAccount.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### freezeSecondaryAccounts()

> **freezeSecondaryAccounts**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L189)

Freeze all of the secondary Accounts in the signing Identity. This means revoking their permission to perform any operation on the blockchain and freezing their funds until the Accounts are unfrozen via [unfreezeSecondaryAccounts](../wiki/#unfreezesecondaryaccounts)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [freezeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### generateOffChainAuthSignature()

> **generateOffChainAuthSignature**(`args`): `Promise`\<`` `0x${string}` ``\>

Defined in: [api/client/AccountManagement.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L373)

Generate an offchain authorization signature with a specified signer

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `expiry`: `Date`; `signer`: `string` \| [`Account`](../wiki/api.entities.Account#account); `target`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \} | - |
| `args.expiry` | `Date` | date after which the authorization expires |
| `args.signer` | `string` \| [`Account`](../wiki/api.entities.Account#account) | Signer to be used to generate the off chain auth signature |
| `args.target` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | DID of the identity to which signer is targeting the authorization |

###### Returns

`Promise`\<`` `0x${string}` ``\>

##### getAccount()

> **getAccount**(`args`): `Promise`\<[`Account`](../wiki/api.entities.Account#account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)\>

Defined in: [api/client/AccountManagement.ts:302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L302)

Return an Account instance from an address. If the Account has multiSig signers, the returned value will be a [MultiSig](../wiki/api.entities.Account.MultiSig#multisig) instance

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `address`: `string`; \} |
| `args.address` | `string` |

###### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account#account) \| [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)\>

##### getAccountBalance()

###### Call Signature

> **getAccountBalance**(`args?`): `Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

Defined in: [api/client/AccountManagement.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L237)

Get the free/locked POLYX balance of an Account

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args?` | \{ `account`: `string` \| [`Account`](../wiki/api.entities.Account#account); \} | - |
| `args.account?` | `string` \| [`Account`](../wiki/api.entities.Account#account) | The account to get balance for (defaults to the signing Account) |

###### Returns

`Promise`\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\>

The account's POLYX balance information

###### Note

can be subscribed to, if connected to node using a web socket

###### Call Signature

> **getAccountBalance**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/client/AccountManagement.ts:246](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L246)

Get the free/locked POLYX balance of the signing Account (with subscription)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\> | Callback function to receive balance updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

An unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Call Signature

> **getAccountBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/client/AccountManagement.ts:256](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L256)

Get the free/locked POLYX balance of an Account (with subscription)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `account`: `string` \| [`Account`](../wiki/api.entities.Account#account); \} | - |
| `args.account` | `string` \| [`Account`](../wiki/api.entities.Account#account) | The account to get balance for |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`AccountBalance`](../wiki/api.entities.Account.types#accountbalance)\> | Callback function to receive balance updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

An unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### getSigningAccount()

> **getSigningAccount**(): [`Account`](../wiki/api.entities.Account#account) \| `null`

Defined in: [api/client/AccountManagement.ts:309](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L309)

Return the signing Account, or null if no signing Account has been set

###### Returns

[`Account`](../wiki/api.entities.Account#account) \| `null`

##### getSigningAccounts()

> **getSigningAccounts**(): `Promise`\<[`Account`](../wiki/api.entities.Account#account)[]\>

Defined in: [api/client/AccountManagement.ts:322](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L322)

Return a list that contains all the signing Accounts associated to the SDK instance's Signing Manager

###### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account#account)[]\>

###### Throws

— if there is no Signing Manager attached to the SDK

##### getSubsidy()

> **getSubsidy**(`args`): [`Subsidy`](../wiki/api.entities.Subsidy#subsidy)

Defined in: [api/client/AccountManagement.ts:329](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L329)

Return an Subsidy instance for a pair of beneficiary and subsidizer Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `beneficiary`: `string` \| [`Account`](../wiki/api.entities.Account#account); `subsidizer`: `string` \| [`Account`](../wiki/api.entities.Account#account); \} |
| `args.beneficiary` | `string` \| [`Account`](../wiki/api.entities.Account#account) |
| `args.subsidizer` | `string` \| [`Account`](../wiki/api.entities.Account#account) |

###### Returns

[`Subsidy`](../wiki/api.entities.Subsidy#subsidy)

##### inviteAccount()

> **inviteAccount**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/client/AccountManagement.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L184)

Send an invitation to an Account to join the signing Identity as a secondary Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`InviteAccountParams`](../wiki/api.procedures.types#inviteaccountparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

this will create an [Authorization Request](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which has to be accepted by the `targetAccount`.
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.types#identity-5) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [inviteAccount.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### isValidAddress()

> **isValidAddress**(`args`): `boolean`

Defined in: [api/client/AccountManagement.ts:346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L346)

Returns `true`

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `address`: `string`; \} | - |
| `args.address` | `string` | is a valid ss58 address for the connected network |

###### Returns

`boolean`

##### leaveIdentity()

> **leaveIdentity**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L149)

Disassociate the signing Account from its Identity. This operation can only be done if the signing Account is a secondary Account

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [leaveIdentity.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### modifyPermissions()

> **modifyPermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:175](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L175)

Modify all permissions of a list of secondary Accounts associated with the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifySignerPermissionsParams`](../wiki/api.procedures.types#modifysignerpermissionsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being modified

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyPermissions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### removeSecondaryAccounts()

> **removeSecondaryAccounts**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L154)

Remove a list of secondary Accounts associated with the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RemoveSecondaryAccountsParams`](../wiki/api.procedures.types#removesecondaryaccountsparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [removeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### revokePermissions()

> **revokePermissions**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L168)

Revoke all permissions of a list of secondary Accounts associated with the signing Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `secondaryAccounts`: (`string` \| [`Account`](../wiki/api.entities.Account#account))[]; \} |
| `args.secondaryAccounts` | (`string` \| [`Account`](../wiki/api.entities.Account#account))[] |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if the signing Account is not the primary Account of the Identity whose secondary Account permissions are being revoked

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [revokePermissions.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### revokeSubsidy()

> **revokeSubsidy**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:219](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L219)

Revokes an already approved subsidy request

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`RevokeSubsidyParams`](../wiki/api.procedures.types#revokesubsidyparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

Only the subsidizer can revoke an already approved subsidy request. Pending subsidies for a beneficiary can be fetched by calling [subsidies.getPendingSubsidies](../wiki/api.entities.Subsidies#getpendingsubsidies).

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [revokeSubsidy.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### unfreezeSecondaryAccounts()

> **unfreezeSecondaryAccounts**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/client/AccountManagement.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/client/AccountManagement.ts#L194)

Unfreeze all of the secondary Accounts in the signing Identity. This will restore their permissions as they were before being frozen

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unfreezeSecondaryAccounts.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it
