# Module: middleware

## Index

### Enumerations

* [AuthStatusEnum](../enums/middleware.authstatusenum.md)
* [AuthTypeEnum](../enums/middleware.authtypeenum.md)
* [CacheControlScope](../enums/middleware.cachecontrolscope.md)
* [CallIdEnum](../enums/middleware.callidenum.md)
* [ClaimTypeEnum](../enums/middleware.claimtypeenum.md)
* [EventIdEnum](../enums/middleware.eventidenum.md)
* [ModuleIdEnum](../enums/middleware.moduleidenum.md)
* [Order](../enums/middleware.order.md)
* [ProposalOrderFields](../enums/middleware.proposalorderfields.md)
* [ProposalState](../enums/middleware.proposalstate.md)
* [ProposalVotesOrderFields](../enums/middleware.proposalvotesorderfields.md)
* [TransactionOrderFields](../enums/middleware.transactionorderfields.md)

### Type aliases

* [Account](middleware.md#account)
* [AccountTransactionsArgs](middleware.md#accounttransactionsargs)
* [Authorization](middleware.md#authorization)
* [Block](middleware.md#block)
* [ChainInfo](middleware.md#chaininfo)
* [Claim](middleware.md#claim)
* [ClaimScope](middleware.md#claimscope)
* [Event](middleware.md#event)
* [Exact](middleware.md#exact)
* [Extrinsic](middleware.md#extrinsic)
* [ExtrinsicResult](middleware.md#extrinsicresult)
* [FailedPolyxTransfer](middleware.md#failedpolyxtransfer)
* [FailedTokenTransfer](middleware.md#failedtokentransfer)
* [IdentityWithClaims](middleware.md#identitywithclaims)
* [IdentityWithClaimsResult](middleware.md#identitywithclaimsresult)
* [Maybe](middleware.md#maybe)
* [PolyxTransfer](middleware.md#polyxtransfer)
* [Proposal](middleware.md#proposal)
* [ProposalOrderByInput](middleware.md#proposalorderbyinput)
* [ProposalVote](middleware.md#proposalvote)
* [ProposalVotesOrderByInput](middleware.md#proposalvotesorderbyinput)
* [Query](middleware.md#query)
* [QueryAccountByAddressArgs](middleware.md#queryaccountbyaddressargs)
* [QueryAuthorizationsArgs](middleware.md#queryauthorizationsargs)
* [QueryBlockByHashArgs](middleware.md#queryblockbyhashargs)
* [QueryBlockByIdArgs](middleware.md#queryblockbyidargs)
* [QueryBlocksArgs](middleware.md#queryblocksargs)
* [QueryBridgedEventByTxHashArgs](middleware.md#querybridgedeventbytxhashargs)
* [QueryDidsWithClaimsArgs](middleware.md#querydidswithclaimsargs)
* [QueryEventByIndexedArgsArgs](middleware.md#queryeventbyindexedargsargs)
* [QueryEventsArgs](middleware.md#queryeventsargs)
* [QueryEventsByIndexedArgsArgs](middleware.md#queryeventsbyindexedargsargs)
* [QueryIssuerDidsWithClaimsByTargetArgs](middleware.md#queryissuerdidswithclaimsbytargetargs)
* [QueryPolyxTransfersFailedArgs](middleware.md#querypolyxtransfersfailedargs)
* [QueryPolyxTransfersReceivedArgs](middleware.md#querypolyxtransfersreceivedargs)
* [QueryPolyxTransfersSentArgs](middleware.md#querypolyxtransferssentargs)
* [QueryProposalArgs](middleware.md#queryproposalargs)
* [QueryProposalVotesArgs](middleware.md#queryproposalvotesargs)
* [QueryProposalsArgs](middleware.md#queryproposalsargs)
* [QueryReferendumVotesArgs](middleware.md#queryreferendumvotesargs)
* [QueryScopesByIdentityArgs](middleware.md#queryscopesbyidentityargs)
* [QueryTokenTransfersFailedArgs](middleware.md#querytokentransfersfailedargs)
* [QueryTokenTransfersReceivedArgs](middleware.md#querytokentransfersreceivedargs)
* [QueryTokenTransfersSentArgs](middleware.md#querytokentransferssentargs)
* [QueryTokensByTrustedClaimIssuerArgs](middleware.md#querytokensbytrustedclaimissuerargs)
* [QueryTokensHeldByDidArgs](middleware.md#querytokensheldbydidargs)
* [QueryTransactionByHashArgs](middleware.md#querytransactionbyhashargs)
* [QueryTransactionByIdArgs](middleware.md#querytransactionbyidargs)
* [QueryTransactionsArgs](middleware.md#querytransactionsargs)
* [Scalars](middleware.md#scalars)
* [StringResult](middleware.md#stringresult)
* [TokenTransfer](middleware.md#tokentransfer)
* [TransactionOrderByInput](middleware.md#transactionorderbyinput)
* [VoteResult](middleware.md#voteresult)

## Type aliases

###  Account

Ƭ **Account**: *object*

*Defined in [src/middleware/types.ts:870](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L870)*

#### Type declaration:

* **__typename**? : *undefined | "Account"*

* **address**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **balance**? : *[Maybe](middleware.md#maybe)‹Scalars["Float"]›*

* **count_reaped**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **created_at_block**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **id**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **is_contract**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **is_nominator**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **is_reaped**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **is_validator**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **transactions**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›››*

* **updated_at_block**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  AccountTransactionsArgs

Ƭ **AccountTransactionsArgs**: *object*

*Defined in [src/middleware/types.ts:885](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L885)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  Authorization

Ƭ **Authorization**: *object*

*Defined in [src/middleware/types.ts:1003](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1003)*

#### Type declaration:

* **__typename**? : *undefined | "Authorization"*

* **authId**: *Scalars["Int"]*

* **data**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **expiry**? : *[Maybe](middleware.md#maybe)‹Scalars["BigInt"]›*

* **fromDID**: *Scalars["String"]*

* **status**: *[AuthStatusEnum](../enums/middleware.authstatusenum.md)*

* **toDID**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **toKey**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **type**: *[AuthTypeEnum](../enums/middleware.authtypeenum.md)*

___

###  Block

Ƭ **Block**: *object*

*Defined in [src/middleware/types.ts:274](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L274)*

#### Type declaration:

* **__typename**? : *undefined | "Block"*

* **count_accounts**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_accounts_new**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_accounts_reaped**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_contracts_new**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_events**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_events_extrinsic**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_events_finalization**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_events_module**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_events_system**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_error**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signed**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signedby_address**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signedby_index**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_success**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_unsigned**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_log**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **count_sessions_new**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **datetime**? : *[Maybe](middleware.md#maybe)‹Scalars["DateTime"]›*

* **day**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **debug_info**? : *[Maybe](middleware.md#maybe)‹Scalars["Object"]›*

* **events**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Event](middleware.md#event)›››*

* **extrinsics**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›››*

* **extrinsics_root**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **full_day**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **full_hour**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **full_month**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **full_week**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **hash**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **hour**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **inherents**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›››*

* **logs**? : *[Maybe](middleware.md#maybe)‹Scalars["Object"]›*

* **month**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **parentBlock**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **parent_hash**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **parent_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **range10000**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **range100000**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **range1000000**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **state_root**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **transactions**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›››*

* **week**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **year**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  ChainInfo

Ƭ **ChainInfo**: *object*

*Defined in [src/middleware/types.ts:256](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L256)*

#### Type declaration:

* **__typename**? : *undefined | "ChainInfo"*

* **creationFee**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **epochDuration**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **existentialDeposit**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **expectedBlockTime**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **implementationName**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **implementationVersion**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **minimumPeriod**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **sessionsPerEra**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **specName**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **specVersion**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **transactionBaseFee**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **transactionByteFee**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **transferFee**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  Claim

Ƭ **Claim**: *object*

*Defined in [src/middleware/types.ts:936](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L936)*

#### Type declaration:

* **__typename**? : *undefined | "Claim"*

* **expiry**? : *[Maybe](middleware.md#maybe)‹Scalars["BigInt"]›*

* **issuance_date**: *Scalars["BigInt"]*

* **issuer**: *Scalars["String"]*

* **jurisdiction**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **last_update_date**: *Scalars["BigInt"]*

* **scope**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **targetDID**: *Scalars["String"]*

* **type**: *[ClaimTypeEnum](../enums/middleware.claimtypeenum.md)*

___

###  ClaimScope

Ƭ **ClaimScope**: *object*

*Defined in [src/middleware/types.ts:948](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L948)*

#### Type declaration:

* **__typename**? : *undefined | "ClaimScope"*

* **scope**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **ticker**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  Event

Ƭ **Event**: *object*

*Defined in [src/middleware/types.ts:324](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L324)*

#### Type declaration:

* **__typename**? : *undefined | "Event"*

* **attributes**? : *[Maybe](middleware.md#maybe)‹Scalars["Object"]›*

* **block**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **block_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **claim_expiry**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **claim_issuer**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **claim_scope**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **claim_type**? : *[Maybe](middleware.md#maybe)‹[ClaimTypeEnum](../enums/middleware.claimtypeenum.md)›*

* **codec_error**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **event_arg_0**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **event_arg_1**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **event_arg_2**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **event_id**? : *[Maybe](middleware.md#maybe)‹[EventIdEnum](../enums/middleware.eventidenum.md)›*

* **event_idx**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **extrinsic**? : *[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›*

* **extrinsic_idx**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **module**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **module_id**? : *[Maybe](middleware.md#maybe)‹[ModuleIdEnum](../enums/middleware.moduleidenum.md)›*

* **phase**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **system**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **type**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  Exact

Ƭ **Exact**: *object*

*Defined in [src/middleware/types.ts:2](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L2)*

#### Type declaration:

___

###  Extrinsic

Ƭ **Extrinsic**: *object*

*Defined in [src/middleware/types.ts:604](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L604)*

#### Type declaration:

* **__typename**? : *undefined | "Extrinsic"*

* **account_idx**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **account_index**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **address**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **addressAccount**? : *[Maybe](middleware.md#maybe)‹[Account](middleware.md#account)›*

* **address_length**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **block**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **block_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **call**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **call_id**? : *[Maybe](middleware.md#maybe)‹[CallIdEnum](../enums/middleware.callidenum.md)›*

* **codec_error**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **era**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **error**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **extrinsic_hash**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **extrinsic_idx**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **extrinsic_length**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **extrinsic_version**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **module_id**? : *[Maybe](middleware.md#maybe)‹[ModuleIdEnum](../enums/middleware.moduleidenum.md)›*

* **nonce**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **params**? : *[Maybe](middleware.md#maybe)‹Scalars["Object"]›*

* **signature**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **signed**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **signedby_address**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **signedby_index**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **success**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **unsigned**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  ExtrinsicResult

Ƭ **ExtrinsicResult**: *object*

*Defined in [src/middleware/types.ts:907](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L907)*

#### Type declaration:

* **__typename**? : *undefined | "ExtrinsicResult"*

* **items**: *Array‹[Extrinsic](middleware.md#extrinsic)›*

* **totalCount**: *Scalars["Int"]*

___

###  FailedPolyxTransfer

Ƭ **FailedPolyxTransfer**: *object*

*Defined in [src/middleware/types.ts:960](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L960)*

#### Type declaration:

* **__typename**? : *undefined | "FailedPolyxTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **description**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventIdx**: *Scalars["Int"]*

* **fromAccount**: *Scalars["String"]*

* **toAccount**: *Scalars["String"]*

___

###  FailedTokenTransfer

Ƭ **FailedTokenTransfer**: *object*

*Defined in [src/middleware/types.ts:981](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L981)*

#### Type declaration:

* **__typename**? : *undefined | "FailedTokenTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **data**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventIdx**: *Scalars["Int"]*

* **fromAccount**: *Scalars["String"]*

* **ticker**: *Scalars["String"]*

* **toDid**: *Scalars["String"]*

___

###  IdentityWithClaims

Ƭ **IdentityWithClaims**: *object*

*Defined in [src/middleware/types.ts:930](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L930)*

#### Type declaration:

* **__typename**? : *undefined | "IdentityWithClaims"*

* **claims**: *Array‹[Claim](middleware.md#claim)›*

* **did**: *Scalars["String"]*

___

###  IdentityWithClaimsResult

Ƭ **IdentityWithClaimsResult**: *object*

*Defined in [src/middleware/types.ts:924](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L924)*

#### Type declaration:

* **__typename**? : *undefined | "IdentityWithClaimsResult"*

* **items**: *Array‹[IdentityWithClaims](middleware.md#identitywithclaims)›*

* **totalCount**: *Scalars["Int"]*

___

###  Maybe

Ƭ **Maybe**: *T | null*

*Defined in [src/middleware/types.ts:1](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1)*

___

###  PolyxTransfer

Ƭ **PolyxTransfer**: *object*

*Defined in [src/middleware/types.ts:913](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L913)*

#### Type declaration:

* **__typename**? : *undefined | "PolyxTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **eventIdx**: *Scalars["Int"]*

* **fromAccount**: *Scalars["String"]*

* **fromDID**: *Scalars["String"]*

* **toAccount**: *Scalars["String"]*

* **toDID**: *Scalars["String"]*

___

###  Proposal

Ƭ **Proposal**: *object*

*Defined in [src/middleware/types.ts:1029](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1029)*

#### Type declaration:

* **__typename**? : *undefined | "Proposal"*

* **coolOffEndBlock**: *Scalars["Int"]*

* **createdAt**: *Scalars["Int"]*

* **description**: *Scalars["String"]*

* **endBlock**: *Scalars["Int"]*

* **lastState**: *[ProposalState](../enums/middleware.proposalstate.md)*

* **lastStateUpdatedAt**: *Scalars["Int"]*

* **pipId**: *Scalars["Int"]*

* **proposal**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **proposer**: *Scalars["String"]*

* **totalAyesWeight**: *Scalars["BigInt"]*

* **totalNaysWeight**: *Scalars["BigInt"]*

* **totalVotes**: *Scalars["Int"]*

* **url**: *Scalars["String"]*

___

###  ProposalOrderByInput

Ƭ **ProposalOrderByInput**: *object*

*Defined in [src/middleware/types.ts:1054](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1054)*

#### Type declaration:

* **field**: *[ProposalOrderFields](../enums/middleware.proposalorderfields.md)*

* **order**: *[Order](../enums/middleware.order.md)*

___

###  ProposalVote

Ƭ **ProposalVote**: *object*

*Defined in [src/middleware/types.ts:1077](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1077)*

#### Type declaration:

* **__typename**? : *undefined | "ProposalVote"*

* **account**: *Scalars["String"]*

* **blockId**: *Scalars["Int"]*

* **eventIdx**: *Scalars["Int"]*

* **vote**: *Scalars["CustomBoolean"]*

* **weight**: *Scalars["BigInt"]*

___

###  ProposalVotesOrderByInput

Ƭ **ProposalVotesOrderByInput**: *object*

*Defined in [src/middleware/types.ts:1066](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1066)*

#### Type declaration:

* **field**: *[ProposalVotesOrderFields](../enums/middleware.proposalvotesorderfields.md)*

* **order**: *[Order](../enums/middleware.order.md)*

___

###  Query

Ƭ **Query**: *object*

*Defined in [src/middleware/types.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L19)*

#### Type declaration:

* **__typename**? : *undefined | "Query"*

* **accountByAddress**? : *[Maybe](middleware.md#maybe)‹[Account](middleware.md#account)›*

* **authorizations**: *Array‹[Authorization](middleware.md#authorization)›*

* **blockByHash**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **blockById**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **blocks**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›››*

* **bridgedEventByTxHash**? : *[Maybe](middleware.md#maybe)‹[Event](middleware.md#event)›*

* **chainInfo**? : *[Maybe](middleware.md#maybe)‹[ChainInfo](middleware.md#chaininfo)›*

* **didsWithClaims**: *[IdentityWithClaimsResult](middleware.md#identitywithclaimsresult)*

* **eventByIndexedArgs**? : *[Maybe](middleware.md#maybe)‹[Event](middleware.md#event)›*

* **events**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Event](middleware.md#event)›››*

* **eventsByIndexedArgs**? : *[Maybe](middleware.md#maybe)‹Array‹[Maybe](middleware.md#maybe)‹[Event](middleware.md#event)›››*

* **heartbeat**: *Scalars["Boolean"]*

* **issuerDidsWithClaimsByTarget**: *[IdentityWithClaimsResult](middleware.md#identitywithclaimsresult)*

* **latestBlock**? : *[Maybe](middleware.md#maybe)‹[Block](middleware.md#block)›*

* **polyxTransfersFailed**: *Array‹[FailedPolyxTransfer](middleware.md#failedpolyxtransfer)›*

* **polyxTransfersReceived**: *Array‹[PolyxTransfer](middleware.md#polyxtransfer)›*

* **polyxTransfersSent**: *Array‹[PolyxTransfer](middleware.md#polyxtransfer)›*

* **proposal**: *[Proposal](middleware.md#proposal)*

* **proposalVotes**: *Array‹[ProposalVote](middleware.md#proposalvote)›*

* **proposals**: *Array‹[Proposal](middleware.md#proposal)›*

* **referendumVotes**: *[VoteResult](middleware.md#voteresult)*

* **scopesByIdentity**: *Array‹[ClaimScope](middleware.md#claimscope)›*

* **tokenTransfersFailed**: *Array‹[FailedTokenTransfer](middleware.md#failedtokentransfer)›*

* **tokenTransfersReceived**: *Array‹[TokenTransfer](middleware.md#tokentransfer)›*

* **tokenTransfersSent**: *Array‹[TokenTransfer](middleware.md#tokentransfer)›*

* **tokensByTrustedClaimIssuer**: *Array‹Scalars["String"]›*

* **tokensHeldByDid**: *[StringResult](middleware.md#stringresult)*

* **transactionByHash**? : *[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›*

* **transactionById**? : *[Maybe](middleware.md#maybe)‹[Extrinsic](middleware.md#extrinsic)›*

* **transactions**: *[ExtrinsicResult](middleware.md#extrinsicresult)*

___

###  QueryAccountByAddressArgs

Ƭ **QueryAccountByAddressArgs**: *object*

*Defined in [src/middleware/types.ts:140](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L140)*

#### Type declaration:

* **address**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  QueryAuthorizationsArgs

Ƭ **QueryAuthorizationsArgs**: *object*

*Defined in [src/middleware/types.ts:223](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L223)*

#### Type declaration:

* **accountKey**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **authorizationTypes**? : *[Maybe](middleware.md#maybe)‹Array‹[AuthTypeEnum](../enums/middleware.authtypeenum.md)››*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryBlockByHashArgs

Ƭ **QueryBlockByHashArgs**: *object*

*Defined in [src/middleware/types.ts:91](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L91)*

#### Type declaration:

* **blockHash**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  QueryBlockByIdArgs

Ƭ **QueryBlockByIdArgs**: *object*

*Defined in [src/middleware/types.ts:87](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L87)*

#### Type declaration:

* **blockId**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryBlocksArgs

Ƭ **QueryBlocksArgs**: *object*

*Defined in [src/middleware/types.ts:82](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L82)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryBridgedEventByTxHashArgs

Ƭ **QueryBridgedEventByTxHashArgs**: *object*

*Defined in [src/middleware/types.ts:144](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L144)*

#### Type declaration:

* **ethTransactionHash**: *Scalars["String"]*

___

###  QueryDidsWithClaimsArgs

Ƭ **QueryDidsWithClaimsArgs**: *object*

*Defined in [src/middleware/types.ts:155](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L155)*

#### Type declaration:

* **claimTypes**? : *[Maybe](middleware.md#maybe)‹Array‹[ClaimTypeEnum](../enums/middleware.claimtypeenum.md)››*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **dids**? : *[Maybe](middleware.md#maybe)‹Array‹Scalars["String"]››*

* **includeExpired**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **scope**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **trustedClaimIssuers**? : *[Maybe](middleware.md#maybe)‹Array‹Scalars["String"]››*

___

###  QueryEventByIndexedArgsArgs

Ƭ **QueryEventByIndexedArgsArgs**: *object*

*Defined in [src/middleware/types.ts:102](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L102)*

#### Type declaration:

* **eventArg0**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventArg1**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventArg2**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventId**: *[EventIdEnum](../enums/middleware.eventidenum.md)*

* **moduleId**: *[ModuleIdEnum](../enums/middleware.moduleidenum.md)*

___

###  QueryEventsArgs

Ƭ **QueryEventsArgs**: *object*

*Defined in [src/middleware/types.ts:95](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L95)*

#### Type declaration:

* **eventId**: *[EventIdEnum](../enums/middleware.eventidenum.md)*

* **fromBlock**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **moduleId**: *[ModuleIdEnum](../enums/middleware.moduleidenum.md)*

* **toBlock**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryEventsByIndexedArgsArgs

Ƭ **QueryEventsByIndexedArgsArgs**: *object*

*Defined in [src/middleware/types.ts:110](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L110)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **eventArg0**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventArg1**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventArg2**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **eventId**: *[EventIdEnum](../enums/middleware.eventidenum.md)*

* **moduleId**: *[ModuleIdEnum](../enums/middleware.moduleidenum.md)*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryIssuerDidsWithClaimsByTargetArgs

Ƭ **QueryIssuerDidsWithClaimsByTargetArgs**: *object*

*Defined in [src/middleware/types.ts:165](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L165)*

#### Type declaration:

* **claimTypes**? : *[Maybe](middleware.md#maybe)‹Array‹[ClaimTypeEnum](../enums/middleware.claimtypeenum.md)››*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **includeExpired**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

* **scope**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **target**: *Scalars["String"]*

* **trustedClaimIssuers**? : *[Maybe](middleware.md#maybe)‹Array‹Scalars["String"]››*

___

###  QueryPolyxTransfersFailedArgs

Ƭ **QueryPolyxTransfersFailedArgs**: *object*

*Defined in [src/middleware/types.ts:191](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L191)*

#### Type declaration:

* **account**: *Scalars["String"]*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryPolyxTransfersReceivedArgs

Ƭ **QueryPolyxTransfersReceivedArgs**: *object*

*Defined in [src/middleware/types.ts:197](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L197)*

#### Type declaration:

* **account**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryPolyxTransfersSentArgs

Ƭ **QueryPolyxTransfersSentArgs**: *object*

*Defined in [src/middleware/types.ts:148](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L148)*

#### Type declaration:

* **account**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryProposalArgs

Ƭ **QueryProposalArgs**: *object*

*Defined in [src/middleware/types.ts:235](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L235)*

#### Type declaration:

* **pipId**: *Scalars["Int"]*

___

###  QueryProposalVotesArgs

Ƭ **QueryProposalVotesArgs**: *object*

*Defined in [src/middleware/types.ts:248](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L248)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **orderBy**? : *[Maybe](middleware.md#maybe)‹[ProposalVotesOrderByInput](middleware.md#proposalvotesorderbyinput)›*

* **pipId**: *Scalars["Int"]*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **vote**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

___

###  QueryProposalsArgs

Ƭ **QueryProposalsArgs**: *object*

*Defined in [src/middleware/types.ts:239](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L239)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **orderBy**? : *[Maybe](middleware.md#maybe)‹[ProposalOrderByInput](middleware.md#proposalorderbyinput)›*

* **pipIds**? : *[Maybe](middleware.md#maybe)‹Array‹Scalars["Int"]››*

* **proposers**? : *[Maybe](middleware.md#maybe)‹Array‹Scalars["String"]››*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **states**? : *[Maybe](middleware.md#maybe)‹Array‹[ProposalState](../enums/middleware.proposalstate.md)››*

___

###  QueryReferendumVotesArgs

Ƭ **QueryReferendumVotesArgs**: *object*

*Defined in [src/middleware/types.ts:231](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L231)*

#### Type declaration:

* **proposalId**: *Scalars["Int"]*

___

###  QueryScopesByIdentityArgs

Ƭ **QueryScopesByIdentityArgs**: *object*

*Defined in [src/middleware/types.ts:175](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L175)*

#### Type declaration:

* **did**: *Scalars["String"]*

___

###  QueryTokenTransfersFailedArgs

Ƭ **QueryTokenTransfersFailedArgs**: *object*

*Defined in [src/middleware/types.ts:216](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L216)*

#### Type declaration:

* **account**: *Scalars["String"]*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **ticker**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  QueryTokenTransfersReceivedArgs

Ƭ **QueryTokenTransfersReceivedArgs**: *object*

*Defined in [src/middleware/types.ts:204](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L204)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryTokenTransfersSentArgs

Ƭ **QueryTokenTransfersSentArgs**: *object*

*Defined in [src/middleware/types.ts:210](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L210)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryTokensByTrustedClaimIssuerArgs

Ƭ **QueryTokensByTrustedClaimIssuerArgs**: *object*

*Defined in [src/middleware/types.ts:179](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L179)*

#### Type declaration:

* **claimIssuerDid**: *Scalars["String"]*

* **order**? : *[Maybe](middleware.md#maybe)‹[Order](../enums/middleware.order.md)›*

___

###  QueryTokensHeldByDidArgs

Ƭ **QueryTokensHeldByDidArgs**: *object*

*Defined in [src/middleware/types.ts:184](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L184)*

#### Type declaration:

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **order**? : *[Maybe](middleware.md#maybe)‹[Order](../enums/middleware.order.md)›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryTransactionByHashArgs

Ƭ **QueryTransactionByHashArgs**: *object*

*Defined in [src/middleware/types.ts:131](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L131)*

#### Type declaration:

* **transactionHash**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

___

###  QueryTransactionByIdArgs

Ƭ **QueryTransactionByIdArgs**: *object*

*Defined in [src/middleware/types.ts:135](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L135)*

#### Type declaration:

* **blockId**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **transactionIdx**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

___

###  QueryTransactionsArgs

Ƭ **QueryTransactionsArgs**: *object*

*Defined in [src/middleware/types.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L120)*

#### Type declaration:

* **address**? : *[Maybe](middleware.md#maybe)‹Scalars["String"]›*

* **block_id**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **call_id**? : *[Maybe](middleware.md#maybe)‹[CallIdEnum](../enums/middleware.callidenum.md)›*

* **count**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **module_id**? : *[Maybe](middleware.md#maybe)‹[ModuleIdEnum](../enums/middleware.moduleidenum.md)›*

* **orderBy**? : *[Maybe](middleware.md#maybe)‹[TransactionOrderByInput](middleware.md#transactionorderbyinput)›*

* **skip**? : *[Maybe](middleware.md#maybe)‹Scalars["Int"]›*

* **success**? : *[Maybe](middleware.md#maybe)‹Scalars["Boolean"]›*

___

###  Scalars

Ƭ **Scalars**: *object*

*Defined in [src/middleware/types.ts:4](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L4)*

All built-in and custom scalars, mapped to their actual values

#### Type declaration:

* **BigInt**: *any*

* **Boolean**: *boolean*

* **CustomBoolean**: *boolean*

* **DateTime**: *Date*

* **Float**: *number*

* **ID**: *string*

* **Int**: *number*

* **Object**: *any*

* **String**: *string*

___

###  StringResult

Ƭ **StringResult**: *object*

*Defined in [src/middleware/types.ts:954](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L954)*

#### Type declaration:

* **__typename**? : *undefined | "StringResult"*

* **items**: *Array‹Scalars["String"]›*

* **totalCount**: *Scalars["Int"]*

___

###  TokenTransfer

Ƭ **TokenTransfer**: *object*

*Defined in [src/middleware/types.ts:970](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L970)*

#### Type declaration:

* **__typename**? : *undefined | "TokenTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **callerDID**: *Scalars["String"]*

* **eventIdx**: *Scalars["Int"]*

* **fromDID**: *Scalars["String"]*

* **ticker**: *Scalars["String"]*

* **toDID**: *Scalars["String"]*

___

###  TransactionOrderByInput

Ƭ **TransactionOrderByInput**: *object*

*Defined in [src/middleware/types.ts:890](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L890)*

#### Type declaration:

* **field**: *[TransactionOrderFields](../enums/middleware.transactionorderfields.md)*

* **order**: *[Order](../enums/middleware.order.md)*

___

###  VoteResult

Ƭ **VoteResult**: *object*

*Defined in [src/middleware/types.ts:1023](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/middleware/types.ts#L1023)*

#### Type declaration:

* **__typename**? : *undefined | "VoteResult"*

* **ayes**: *Array‹Scalars["String"]›*

* **nays**: *Array‹Scalars["String"]›*
