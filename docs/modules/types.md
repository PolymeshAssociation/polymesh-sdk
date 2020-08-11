# Module: types

## Index

### References

* [AuthorizationRequest](types.md#authorizationrequest)
* [Identity](types.md#identity)
* [IdentityBalance](types.md#identitybalance)
* [Order](types.md#order)
* [PolymeshTransaction](types.md#polymeshtransaction)
* [Proposal](types.md#proposal)
* [SecurityToken](types.md#securitytoken)
* [SecurityTokenDetails](types.md#securitytokendetails)
* [TickerReservation](types.md#tickerreservation)
* [TickerReservationDetails](types.md#tickerreservationdetails)
* [TickerReservationStatus](types.md#tickerreservationstatus)
* [TokenHolderOptions](types.md#tokenholderoptions)
* [TokenHolderProperties](types.md#tokenholderproperties)
* [TransactionQueue](types.md#transactionqueue)

### Enumerations

* [AuthorizationType](../enums/types.authorizationtype.md)
* [ClaimOperation](../enums/types.claimoperation.md)
* [ClaimType](../enums/types.claimtype.md)
* [ConditionTarget](../enums/types.conditiontarget.md)
* [ConditionType](../enums/types.conditiontype.md)
* [ErrorCode](../enums/types.errorcode.md)
* [KnownTokenType](../enums/types.knowntokentype.md)
* [LinkType](../enums/types.linktype.md)
* [RoleType](../enums/types.roletype.md)
* [SignerType](../enums/types.signertype.md)
* [TokenIdentifierType](../enums/types.tokenidentifiertype.md)
* [TransactionArgumentType](../enums/types.transactionargumenttype.md)
* [TransactionQueueStatus](../enums/types.transactionqueuestatus.md)
* [TransactionStatus](../enums/types.transactionstatus.md)
* [TransferStatus](../enums/types.transferstatus.md)

### Interfaces

* [AccountBalance](../interfaces/types.accountbalance.md)
* [ArrayTransactionArgument](../interfaces/types.arraytransactionargument.md)
* [AuthTarget](../interfaces/types.authtarget.md)
* [CddProviderRole](../interfaces/types.cddproviderrole.md)
* [ClaimData](../interfaces/types.claimdata.md)
* [ClaimTargets](../interfaces/types.claimtargets.md)
* [ComplexTransactionArgument](../interfaces/types.complextransactionargument.md)
* [EventIdentifier](../interfaces/types.eventidentifier.md)
* [Fees](../interfaces/types.fees.md)
* [GraphqlQuery](../interfaces/types.graphqlquery.md)
* [IdentityWithClaims](../interfaces/types.identitywithclaims.md)
* [IssuanceData](../interfaces/types.issuancedata.md)
* [KeyringPair](../interfaces/types.keyringpair.md)
* [MiddlewareConfig](../interfaces/types.middlewareconfig.md)
* [NetworkProperties](../interfaces/types.networkproperties.md)
* [PaginationOptions](../interfaces/types.paginationoptions.md)
* [PlainTransactionArgument](../interfaces/types.plaintransactionargument.md)
* [ResultSet](../interfaces/types.resultset.md)
* [Rule](../interfaces/types.rule.md)
* [Signer](../interfaces/types.signer.md)
* [SimpleEnumTransactionArgument](../interfaces/types.simpleenumtransactionargument.md)
* [TickerOwnerRole](../interfaces/types.tickerownerrole.md)
* [TokenDocument](../interfaces/types.tokendocument.md)
* [TokenIdentifier](../interfaces/types.tokenidentifier.md)
* [TokenOwnerRole](../interfaces/types.tokenownerrole.md)
* [TransactionSpec](../interfaces/types.transactionspec.md)
* [UiKeyring](../interfaces/types.uikeyring.md)

### Type aliases

* [Authorization](types.md#authorization)
* [Claim](types.md#claim)
* [CommonKeyring](types.md#commonkeyring)
* [Condition](types.md#condition)
* [ConditionBase](types.md#conditionbase)
* [Ensured](types.md#ensured)
* [Extrinsics](types.md#extrinsics)
* [MapMaybePostTransactionValue](types.md#mapmaybeposttransactionvalue)
* [MaybePostTransactionValue](types.md#maybeposttransactionvalue)
* [MultiClaimCondition](types.md#multiclaimcondition)
* [NextKey](types.md#nextkey)
* [PolymeshTx](types.md#polymeshtx)
* [PostTransactionValueArray](types.md#posttransactionvaluearray)
* [Queries](types.md#queries)
* [ResolverFunctionArray](types.md#resolverfunctionarray)
* [Role](types.md#role)
* [ScopedClaim](types.md#scopedclaim)
* [SingleClaimCondition](types.md#singleclaimcondition)
* [SubCallback](types.md#subcallback)
* [TokenType](types.md#tokentype)
* [TransactionArgument](types.md#transactionargument)
* [UnscopedClaim](types.md#unscopedclaim)
* [UnsubCallback](types.md#unsubcallback)

## References

###  AuthorizationRequest

• **AuthorizationRequest**:

___

###  Identity

• **Identity**:

___

###  IdentityBalance

• **IdentityBalance**:

___

###  Order

• **Order**:

___

###  PolymeshTransaction

• **PolymeshTransaction**:

___

###  Proposal

• **Proposal**:

___

###  SecurityToken

• **SecurityToken**:

___

###  SecurityTokenDetails

• **SecurityTokenDetails**:

___

###  TickerReservation

• **TickerReservation**:

___

###  TickerReservationDetails

• **TickerReservationDetails**:

___

###  TickerReservationStatus

• **TickerReservationStatus**:

___

###  TokenHolderOptions

• **TokenHolderOptions**:

___

###  TokenHolderProperties

• **TokenHolderProperties**:

___

###  TransactionQueue

• **TransactionQueue**:

## Type aliases

###  Authorization

Ƭ **Authorization**: *object | object*

*Defined in [src/types/index.ts:166](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L166)*

Authorization request data corresponding to type

___

###  Claim

Ƭ **Claim**: *[ScopedClaim](types.md#scopedclaim) | [UnscopedClaim](types.md#unscopedclaim)*

*Defined in [src/types/index.ts:201](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L201)*

___

###  CommonKeyring

Ƭ **CommonKeyring**: *Pick‹Keyring, "getPair" | "getPairs" | "addFromSeed" | "addFromUri"›*

*Defined in [src/types/index.ts:325](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L325)*

___

###  Condition

Ƭ **Condition**: *[SingleClaimCondition](types.md#singleclaimcondition) | [MultiClaimCondition](types.md#multiclaimcondition)*

*Defined in [src/types/index.ts:244](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L244)*

___

###  ConditionBase

Ƭ **ConditionBase**: *object*

*Defined in [src/types/index.ts:232](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L232)*

#### Type declaration:

* **target**: *[ConditionTarget](../enums/types.conditiontarget.md)*

* **trustedClaimIssuers**? : *string[]*

___

###  Ensured

Ƭ **Ensured**: *Required‹Pick‹T, K››*

*Defined in [src/types/index.ts:318](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L318)*

___

###  Extrinsics

Ƭ **Extrinsics**: *SubmittableExtrinsics‹"promise"›*

*Defined in [src/types/internal.ts:17](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L17)*

Polkadot's `tx` submodule

___

###  MapMaybePostTransactionValue

Ƭ **MapMaybePostTransactionValue**: *object*

*Defined in [src/types/internal.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L58)*

Apply the [MaybePostTransactionValue](types.md#maybeposttransactionvalue) type to all members of a tuple

#### Type declaration:

___

###  MaybePostTransactionValue

Ƭ **MaybePostTransactionValue**: *PostTransactionValue‹T› | T*

*Defined in [src/types/internal.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L53)*

Either a specific type or a [[PostTransactionValue]] that wraps a value of that type

___

###  MultiClaimCondition

Ƭ **MultiClaimCondition**: *[ConditionBase](types.md#conditionbase) & object*

*Defined in [src/types/index.ts:239](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L239)*

___

###  NextKey

Ƭ **NextKey**: *string | number | null*

*Defined in [src/types/index.ts:351](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L351)*

___

###  PolymeshTx

Ƭ **PolymeshTx**: *AugmentedSubmittable‹function›*

*Defined in [src/types/internal.ts:29](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L29)*

Low level transaction method in the polkadot API

___

###  PostTransactionValueArray

Ƭ **PostTransactionValueArray**: *object*

*Defined in [src/types/internal.ts:46](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L46)*

Transforms a tuple of types into an array of [[PostTransactionValue]].
For each type in the tuple, the corresponding [[PostTransactionValue]] resolves to that type

#### Type declaration:

___

###  Queries

Ƭ **Queries**: *QueryableStorage‹"promise"›*

*Defined in [src/types/internal.ts:22](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L22)*

Polkadot's `query` submodule

___

###  ResolverFunctionArray

Ƭ **ResolverFunctionArray**: *object*

*Defined in [src/types/internal.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L36)*

Transforms a tuple of types into an array of resolver functions. For each type in the tuple, the corresponding resolver function returns that type wrapped in a promise

#### Type declaration:

___

###  Role

Ƭ **Role**: *[TickerOwnerRole](../interfaces/types.tickerownerrole.md) | [TokenOwnerRole](../interfaces/types.tokenownerrole.md) | [CddProviderRole](../interfaces/types.cddproviderrole.md)*

*Defined in [src/types/index.ts:104](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L104)*

___

###  ScopedClaim

Ƭ **ScopedClaim**: *object | object*

*Defined in [src/types/index.ts:195](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L195)*

___

###  SingleClaimCondition

Ƭ **SingleClaimCondition**: *[ConditionBase](types.md#conditionbase) & object*

*Defined in [src/types/index.ts:234](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L234)*

___

###  SubCallback

Ƭ **SubCallback**: *function*

*Defined in [src/types/index.ts:314](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L314)*

#### Type declaration:

▸ (`result`: T): *void | Promise‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`result` | T |

___

###  TokenType

Ƭ **TokenType**: *[KnownTokenType](../enums/types.knowntokentype.md) | object*

*Defined in [src/types/index.ts:121](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L121)*

Type of security that the token represents

___

###  TransactionArgument

Ƭ **TransactionArgument**: *object & [PlainTransactionArgument](../interfaces/types.plaintransactionargument.md) | [ArrayTransactionArgument](../interfaces/types.arraytransactionargument.md) | [SimpleEnumTransactionArgument](../interfaces/types.simpleenumtransactionargument.md) | [ComplexTransactionArgument](../interfaces/types.complextransactionargument.md)*

*Defined in [src/types/index.ts:428](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L428)*

___

###  UnscopedClaim

Ƭ **UnscopedClaim**: *object*

*Defined in [src/types/index.ts:199](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L199)*

#### Type declaration:

* **type**: *[NoData](../enums/types.claimtype.md#nodata) | [CustomerDueDiligence](../enums/types.claimtype.md#customerduediligence)*

___

###  UnsubCallback

Ƭ **UnsubCallback**: *function*

*Defined in [src/types/index.ts:316](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/index.ts#L316)*

#### Type declaration:

▸ (): *void*
