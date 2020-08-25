# Module: types

## Index

### References

* [AuthorizationRequest](types.md#authorizationrequest)
* [Identity](types.md#identity)
* [IdentityBalance](types.md#identitybalance)
* [Order](types.md#order)
* [PolymeshError](types.md#polymesherror)
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
* [Permission](../enums/types.permission.md)
* [RoleType](../enums/types.roletype.md)
* [SignerType](../enums/types.signertype.md)
* [TokenIdentifierType](../enums/types.tokenidentifiertype.md)
* [TransactionArgumentType](../enums/types.transactionargumenttype.md)
* [TransactionQueueStatus](../enums/types.transactionqueuestatus.md)
* [TransactionStatus](../enums/types.transactionstatus.md)
* [TransferStatus](../enums/types.transferstatus.md)
* [TrustedClaimIssuerOperation](../enums/types.trustedclaimissueroperation.md)

### Interfaces

* [AccountBalance](../interfaces/types.accountbalance.md)
* [ArrayTransactionArgument](../interfaces/types.arraytransactionargument.md)
* [AuthTarget](../interfaces/types.authtarget.md)
* [CddProviderRole](../interfaces/types.cddproviderrole.md)
* [ClaimData](../interfaces/types.claimdata.md)
* [ClaimScope](../interfaces/types.claimscope.md)
* [ClaimTarget](../interfaces/types.claimtarget.md)
* [ComplexTransactionArgument](../interfaces/types.complextransactionargument.md)
* [EventIdentifier](../interfaces/types.eventidentifier.md)
* [ExtrinsicData](../interfaces/types.extrinsicdata.md)
* [ExtrinsicIdentifier](../interfaces/types.extrinsicidentifier.md)
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
* [RuleCompliance](../interfaces/types.rulecompliance.md)
* [Signer](../interfaces/types.signer.md)
* [SimpleEnumTransactionArgument](../interfaces/types.simpleenumtransactionargument.md)
* [TickerOwnerRole](../interfaces/types.tickerownerrole.md)
* [TokenDocument](../interfaces/types.tokendocument.md)
* [TokenDocumentData](../interfaces/types.tokendocumentdata.md)
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

###  PolymeshError

• **PolymeshError**:

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

Ƭ **Authorization**: *object | object | object*

*Defined in [src/types/index.ts:167](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L167)*

Authorization request data corresponding to type

___

###  Claim

Ƭ **Claim**: *[ScopedClaim](types.md#scopedclaim) | [UnscopedClaim](types.md#unscopedclaim)*

*Defined in [src/types/index.ts:205](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L205)*

___

###  CommonKeyring

Ƭ **CommonKeyring**: *Pick‹Keyring, "getPair" | "getPairs" | "addFromSeed" | "addFromUri"›*

*Defined in [src/types/index.ts:353](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L353)*

___

###  Condition

Ƭ **Condition**: *[SingleClaimCondition](types.md#singleclaimcondition) | [MultiClaimCondition](types.md#multiclaimcondition)*

*Defined in [src/types/index.ts:265](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L265)*

___

###  ConditionBase

Ƭ **ConditionBase**: *object*

*Defined in [src/types/index.ts:253](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L253)*

#### Type declaration:

* **target**: *[ConditionTarget](../enums/types.conditiontarget.md)*

* **trustedClaimIssuers**? : *string[]*

___

###  Ensured

Ƭ **Ensured**: *Required‹Pick‹T, K››*

*Defined in [src/types/index.ts:346](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L346)*

___

###  Extrinsics

Ƭ **Extrinsics**: *SubmittableExtrinsics‹"promise"›*

*Defined in [src/types/internal.ts:18](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L18)*

Polkadot's `tx` submodule

___

###  MapMaybePostTransactionValue

Ƭ **MapMaybePostTransactionValue**: *object*

*Defined in [src/types/internal.ts:59](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L59)*

Apply the [MaybePostTransactionValue](types.md#maybeposttransactionvalue) type to all members of a tuple

#### Type declaration:

___

###  MaybePostTransactionValue

Ƭ **MaybePostTransactionValue**: *PostTransactionValue‹T› | T*

*Defined in [src/types/internal.ts:54](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L54)*

Either a specific type or a [[PostTransactionValue]] that wraps a value of that type

___

###  MultiClaimCondition

Ƭ **MultiClaimCondition**: *[ConditionBase](types.md#conditionbase) & object*

*Defined in [src/types/index.ts:260](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L260)*

___

###  NextKey

Ƭ **NextKey**: *string | number | null*

*Defined in [src/types/index.ts:379](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L379)*

___

###  PolymeshTx

Ƭ **PolymeshTx**: *AugmentedSubmittable‹function›*

*Defined in [src/types/internal.ts:30](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L30)*

Low level transaction method in the polkadot API

___

###  PostTransactionValueArray

Ƭ **PostTransactionValueArray**: *object*

*Defined in [src/types/internal.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L47)*

Transforms a tuple of types into an array of [[PostTransactionValue]].
For each type in the tuple, the corresponding [[PostTransactionValue]] resolves to that type

#### Type declaration:

___

###  Queries

Ƭ **Queries**: *QueryableStorage‹"promise"›*

*Defined in [src/types/internal.ts:23](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L23)*

Polkadot's `query` submodule

___

###  ResolverFunctionArray

Ƭ **ResolverFunctionArray**: *object*

*Defined in [src/types/internal.ts:37](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L37)*

Transforms a tuple of types into an array of resolver functions. For each type in the tuple, the corresponding resolver function returns that type wrapped in a promise

#### Type declaration:

___

###  Role

Ƭ **Role**: *[TickerOwnerRole](../interfaces/types.tickerownerrole.md) | [TokenOwnerRole](../interfaces/types.tokenownerrole.md) | [CddProviderRole](../interfaces/types.cddproviderrole.md)*

*Defined in [src/types/index.ts:105](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L105)*

___

###  ScopedClaim

Ƭ **ScopedClaim**: *object | object*

*Defined in [src/types/index.ts:199](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L199)*

___

###  SingleClaimCondition

Ƭ **SingleClaimCondition**: *[ConditionBase](types.md#conditionbase) & object*

*Defined in [src/types/index.ts:255](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L255)*

___

###  SubCallback

Ƭ **SubCallback**: *function*

*Defined in [src/types/index.ts:342](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L342)*

#### Type declaration:

▸ (`result`: T): *void | Promise‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`result` | T |

___

###  TokenType

Ƭ **TokenType**: *[KnownTokenType](../enums/types.knowntokentype.md) | object*

*Defined in [src/types/index.ts:122](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L122)*

Type of security that the token represents

___

###  TransactionArgument

Ƭ **TransactionArgument**: *object & [PlainTransactionArgument](../interfaces/types.plaintransactionargument.md) | [ArrayTransactionArgument](../interfaces/types.arraytransactionargument.md) | [SimpleEnumTransactionArgument](../interfaces/types.simpleenumtransactionargument.md) | [ComplexTransactionArgument](../interfaces/types.complextransactionargument.md)*

*Defined in [src/types/index.ts:456](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L456)*

___

###  UnscopedClaim

Ƭ **UnscopedClaim**: *object*

*Defined in [src/types/index.ts:203](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L203)*

#### Type declaration:

* **type**: *[NoData](../enums/types.claimtype.md#nodata) | [CustomerDueDiligence](../enums/types.claimtype.md#customerduediligence)*

___

###  UnsubCallback

Ƭ **UnsubCallback**: *function*

*Defined in [src/types/index.ts:344](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/index.ts#L344)*

#### Type declaration:

▸ (): *void*
