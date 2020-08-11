# Module: "src/middleware/types"

## Index

### Enumerations

* [AuthStatusEnum](../enums/_src_middleware_types_.authstatusenum.md)
* [AuthTypeEnum](../enums/_src_middleware_types_.authtypeenum.md)
* [CacheControlScope](../enums/_src_middleware_types_.cachecontrolscope.md)
* [CallIdEnum](../enums/_src_middleware_types_.callidenum.md)
* [ClaimTypeEnum](../enums/_src_middleware_types_.claimtypeenum.md)
* [EventIdEnum](../enums/_src_middleware_types_.eventidenum.md)
* [ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)
* [Order](../enums/_src_middleware_types_.order.md)
* [ProposalOrderFields](../enums/_src_middleware_types_.proposalorderfields.md)
* [ProposalState](../enums/_src_middleware_types_.proposalstate.md)
* [ProposalVotesOrderFields](../enums/_src_middleware_types_.proposalvotesorderfields.md)

### Type aliases

* [Account](_src_middleware_types_.md#account)
* [AccountTransactionsArgs](_src_middleware_types_.md#accounttransactionsargs)
* [Authorization](_src_middleware_types_.md#authorization)
* [Block](_src_middleware_types_.md#block)
* [ChainInfo](_src_middleware_types_.md#chaininfo)
* [Claim](_src_middleware_types_.md#claim)
* [Event](_src_middleware_types_.md#event)
* [Extrinsic](_src_middleware_types_.md#extrinsic)
* [FailedPolyxTransfer](_src_middleware_types_.md#failedpolyxtransfer)
* [FailedTokenTransfer](_src_middleware_types_.md#failedtokentransfer)
* [IdentityWithClaims](_src_middleware_types_.md#identitywithclaims)
* [IdentityWithClaimsResult](_src_middleware_types_.md#identitywithclaimsresult)
* [Maybe](_src_middleware_types_.md#maybe)
* [PolyxTransfer](_src_middleware_types_.md#polyxtransfer)
* [Proposal](_src_middleware_types_.md#proposal)
* [ProposalOrderByInput](_src_middleware_types_.md#proposalorderbyinput)
* [ProposalVote](_src_middleware_types_.md#proposalvote)
* [ProposalVotesOrderByInput](_src_middleware_types_.md#proposalvotesorderbyinput)
* [Query](_src_middleware_types_.md#query)
* [QueryAccountByAddressArgs](_src_middleware_types_.md#queryaccountbyaddressargs)
* [QueryAuthorizationsArgs](_src_middleware_types_.md#queryauthorizationsargs)
* [QueryBlockByHashArgs](_src_middleware_types_.md#queryblockbyhashargs)
* [QueryBlockByIdArgs](_src_middleware_types_.md#queryblockbyidargs)
* [QueryBlocksArgs](_src_middleware_types_.md#queryblocksargs)
* [QueryBridgedEventByTxHashArgs](_src_middleware_types_.md#querybridgedeventbytxhashargs)
* [QueryDidsWithClaimsArgs](_src_middleware_types_.md#querydidswithclaimsargs)
* [QueryEventByIndexedArgsArgs](_src_middleware_types_.md#queryeventbyindexedargsargs)
* [QueryEventsArgs](_src_middleware_types_.md#queryeventsargs)
* [QueryEventsByIndexedArgsArgs](_src_middleware_types_.md#queryeventsbyindexedargsargs)
* [QueryPolyxTransfersFailedArgs](_src_middleware_types_.md#querypolyxtransfersfailedargs)
* [QueryPolyxTransfersReceivedArgs](_src_middleware_types_.md#querypolyxtransfersreceivedargs)
* [QueryPolyxTransfersSentArgs](_src_middleware_types_.md#querypolyxtransferssentargs)
* [QueryProposalArgs](_src_middleware_types_.md#queryproposalargs)
* [QueryProposalVotesArgs](_src_middleware_types_.md#queryproposalvotesargs)
* [QueryProposalsArgs](_src_middleware_types_.md#queryproposalsargs)
* [QueryReferendumVotes2Args](_src_middleware_types_.md#queryreferendumvotes2args)
* [QueryReferendumVotesArgs](_src_middleware_types_.md#queryreferendumvotesargs)
* [QueryTokenTransfersFailedArgs](_src_middleware_types_.md#querytokentransfersfailedargs)
* [QueryTokenTransfersReceivedArgs](_src_middleware_types_.md#querytokentransfersreceivedargs)
* [QueryTokenTransfersSentArgs](_src_middleware_types_.md#querytokentransferssentargs)
* [QueryTokensHeldByDidArgs](_src_middleware_types_.md#querytokensheldbydidargs)
* [QueryTransactionByHashArgs](_src_middleware_types_.md#querytransactionbyhashargs)
* [QueryTransactionByIdArgs](_src_middleware_types_.md#querytransactionbyidargs)
* [QueryTransactionsArgs](_src_middleware_types_.md#querytransactionsargs)
* [Scalars](_src_middleware_types_.md#scalars)
* [TokenTransfer](_src_middleware_types_.md#tokentransfer)
* [VoteResult](_src_middleware_types_.md#voteresult)

## Type aliases

###  Account

Ƭ **Account**: *object*

*Defined in [src/middleware/types.ts:793](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L793)*

#### Type declaration:

* **__typename**? : *undefined | "Account"*

* **address**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **balance**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Float"]›*

* **count_reaped**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **created_at_block**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **is_contract**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Boolean"]›*

* **is_nominator**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Boolean"]›*

* **is_reaped**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Boolean"]›*

* **is_validator**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Boolean"]›*

* **transactions**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›››*

* **updated_at_block**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  AccountTransactionsArgs

Ƭ **AccountTransactionsArgs**: *object*

*Defined in [src/middleware/types.ts:808](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L808)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  Authorization

Ƭ **Authorization**: *object*

*Defined in [src/middleware/types.ts:891](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L891)*

#### Type declaration:

* **__typename**? : *undefined | "Authorization"*

* **authId**: *Scalars["Int"]*

* **data**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **expiry**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["BigInt"]›*

* **fromDID**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **fromKey**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **status**: *[AuthStatusEnum](../enums/_src_middleware_types_.authstatusenum.md)*

* **toDID**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **toKey**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **type**: *[AuthTypeEnum](../enums/_src_middleware_types_.authtypeenum.md)*

___

###  Block

Ƭ **Block**: *object*

*Defined in [src/middleware/types.ts:247](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L247)*

#### Type declaration:

* **__typename**? : *undefined | "Block"*

* **count_accounts**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_accounts_new**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_accounts_reaped**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_contracts_new**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_events**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_events_extrinsic**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_events_finalization**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_events_module**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_events_system**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_error**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signed**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signedby_address**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_signedby_index**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_success**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_extrinsics_unsigned**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_log**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **count_sessions_new**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **datetime**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["DateTime"]›*

* **day**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **debug_info**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Object"]›*

* **events**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Event](_src_middleware_types_.md#event)›››*

* **extrinsics**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›››*

* **extrinsics_root**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **full_day**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **full_hour**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **full_month**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **full_week**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **hash**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **hour**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **inherents**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›››*

* **logs**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Object"]›*

* **month**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **parentBlock**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **parent_hash**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **parent_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **range10000**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **range100000**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **range1000000**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **state_root**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **transactions**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›››*

* **week**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **year**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  ChainInfo

Ƭ **ChainInfo**: *object*

*Defined in [src/middleware/types.ts:229](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L229)*

#### Type declaration:

* **__typename**? : *undefined | "ChainInfo"*

* **creationFee**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **epochDuration**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **existentialDeposit**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **expectedBlockTime**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **implementationName**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **implementationVersion**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **minimumPeriod**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **sessionsPerEra**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **specName**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **specVersion**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **transactionBaseFee**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **transactionByteFee**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **transferFee**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  Claim

Ƭ **Claim**: *object*

*Defined in [src/middleware/types.ts:836](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L836)*

#### Type declaration:

* **__typename**? : *undefined | "Claim"*

* **expiry**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["BigInt"]›*

* **issuance_date**: *Scalars["BigInt"]*

* **issuer**: *Scalars["String"]*

* **jurisdiction**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **last_update_date**: *Scalars["BigInt"]*

* **scope**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **targetDID**: *Scalars["String"]*

* **type**: *[ClaimTypeEnum](../enums/_src_middleware_types_.claimtypeenum.md)*

___

###  Event

Ƭ **Event**: *object*

*Defined in [src/middleware/types.ts:297](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L297)*

#### Type declaration:

* **__typename**? : *undefined | "Event"*

* **attributes**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Object"]›*

* **block**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **block_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **claim_expiry**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **claim_issuer**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **claim_scope**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **claim_type**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ClaimTypeEnum](../enums/_src_middleware_types_.claimtypeenum.md)›*

* **codec_error**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **event_arg_0**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **event_arg_1**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **event_arg_2**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **event_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹[EventIdEnum](../enums/_src_middleware_types_.eventidenum.md)›*

* **event_idx**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **extrinsic**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›*

* **extrinsic_idx**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **module**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **module_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)›*

* **phase**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **system**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **type**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

___

###  Extrinsic

Ƭ **Extrinsic**: *object*

*Defined in [src/middleware/types.ts:545](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L545)*

#### Type declaration:

* **__typename**? : *undefined | "Extrinsic"*

* **account_idx**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **account_index**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **address**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **addressAccount**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Account](_src_middleware_types_.md#account)›*

* **address_length**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **block**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **block_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **call**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **call_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹[CallIdEnum](../enums/_src_middleware_types_.callidenum.md)›*

* **codec_error**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **era**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **error**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **extrinsic_hash**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **extrinsic_idx**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **extrinsic_length**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **extrinsic_version**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **module_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)›*

* **nonce**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **params**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Object"]›*

* **signature**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **signed**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **signedby_address**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **signedby_index**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **spec_version_id**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **success**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **unsigned**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  FailedPolyxTransfer

Ƭ **FailedPolyxTransfer**: *object*

*Defined in [src/middleware/types.ts:848](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L848)*

#### Type declaration:

* **__typename**? : *undefined | "FailedPolyxTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **description**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventIdx**: *Scalars["Int"]*

* **fromAccount**: *Scalars["String"]*

* **toAccount**: *Scalars["String"]*

___

###  FailedTokenTransfer

Ƭ **FailedTokenTransfer**: *object*

*Defined in [src/middleware/types.ts:869](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L869)*

#### Type declaration:

* **__typename**? : *undefined | "FailedTokenTransfer"*

* **balance**: *Scalars["Float"]*

* **blockId**: *Scalars["Int"]*

* **data**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventIdx**: *Scalars["Int"]*

* **fromAccount**: *Scalars["String"]*

* **ticker**: *Scalars["String"]*

* **toDid**: *Scalars["String"]*

___

###  IdentityWithClaims

Ƭ **IdentityWithClaims**: *object*

*Defined in [src/middleware/types.ts:830](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L830)*

#### Type declaration:

* **__typename**? : *undefined | "IdentityWithClaims"*

* **claims**: *Array‹[Claim](_src_middleware_types_.md#claim)›*

* **did**: *Scalars["String"]*

___

###  IdentityWithClaimsResult

Ƭ **IdentityWithClaimsResult**: *object*

*Defined in [src/middleware/types.ts:824](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L824)*

#### Type declaration:

* **__typename**? : *undefined | "IdentityWithClaimsResult"*

* **items**: *Array‹[IdentityWithClaims](_src_middleware_types_.md#identitywithclaims)›*

* **totalCount**: *Scalars["Int"]*

___

###  Maybe

Ƭ **Maybe**: *T | null*

*Defined in [src/middleware/types.ts:1](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L1)*

___

###  PolyxTransfer

Ƭ **PolyxTransfer**: *object*

*Defined in [src/middleware/types.ts:813](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L813)*

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

*Defined in [src/middleware/types.ts:918](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L918)*

#### Type declaration:

* **__typename**? : *undefined | "Proposal"*

* **coolOffEndBlock**: *Scalars["Int"]*

* **createdAt**: *Scalars["Int"]*

* **description**: *Scalars["String"]*

* **endBlock**: *Scalars["Int"]*

* **lastState**: *[ProposalState](../enums/_src_middleware_types_.proposalstate.md)*

* **lastStateUpdatedAt**: *Scalars["Int"]*

* **pipId**: *Scalars["Int"]*

* **proposal**: *Scalars["String"]*

* **proposer**: *Scalars["String"]*

* **totalAyesWeight**: *Scalars["BigInt"]*

* **totalNaysWeight**: *Scalars["BigInt"]*

* **totalVotes**: *Scalars["Int"]*

* **url**: *Scalars["String"]*

___

###  ProposalOrderByInput

Ƭ **ProposalOrderByInput**: *object*

*Defined in [src/middleware/types.ts:943](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L943)*

#### Type declaration:

* **field**: *[ProposalOrderFields](../enums/_src_middleware_types_.proposalorderfields.md)*

* **order**: *[Order](../enums/_src_middleware_types_.order.md)*

___

###  ProposalVote

Ƭ **ProposalVote**: *object*

*Defined in [src/middleware/types.ts:971](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L971)*

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

*Defined in [src/middleware/types.ts:960](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L960)*

#### Type declaration:

* **field**: *[ProposalVotesOrderFields](../enums/_src_middleware_types_.proposalvotesorderfields.md)*

* **order**: *[Order](../enums/_src_middleware_types_.order.md)*

___

###  Query

Ƭ **Query**: *object*

*Defined in [src/middleware/types.ts:18](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L18)*

#### Type declaration:

* **__typename**? : *undefined | "Query"*

* **accountByAddress**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Account](_src_middleware_types_.md#account)›*

* **authorizations**: *Array‹[Authorization](_src_middleware_types_.md#authorization)›*

* **blockByHash**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **blockById**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **blocks**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›››*

* **bridgedEventByTxHash**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Event](_src_middleware_types_.md#event)›*

* **chainInfo**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ChainInfo](_src_middleware_types_.md#chaininfo)›*

* **didsWithClaims**: *[IdentityWithClaimsResult](_src_middleware_types_.md#identitywithclaimsresult)*

* **eventByIndexedArgs**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Event](_src_middleware_types_.md#event)›*

* **events**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Event](_src_middleware_types_.md#event)›››*

* **eventsByIndexedArgs**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Event](_src_middleware_types_.md#event)›››*

* **heartbeat**: *Scalars["Boolean"]*

* **latestBlock**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Block](_src_middleware_types_.md#block)›*

* **polyxTransfersFailed**: *Array‹[FailedPolyxTransfer](_src_middleware_types_.md#failedpolyxtransfer)›*

* **polyxTransfersReceived**: *Array‹[PolyxTransfer](_src_middleware_types_.md#polyxtransfer)›*

* **polyxTransfersSent**: *Array‹[PolyxTransfer](_src_middleware_types_.md#polyxtransfer)›*

* **proposal**: *[Proposal](_src_middleware_types_.md#proposal)*

* **proposalVotes**: *Array‹[ProposalVote](_src_middleware_types_.md#proposalvote)›*

* **proposals**: *Array‹[Proposal](_src_middleware_types_.md#proposal)›*

* **referendumVotes**: *[VoteResult](_src_middleware_types_.md#voteresult)*

* **referendumVotes2**: *[VoteResult](_src_middleware_types_.md#voteresult)*

* **tokenTransfersFailed**: *Array‹[FailedTokenTransfer](_src_middleware_types_.md#failedtokentransfer)›*

* **tokenTransfersReceived**: *Array‹[TokenTransfer](_src_middleware_types_.md#tokentransfer)›*

* **tokenTransfersSent**: *Array‹[TokenTransfer](_src_middleware_types_.md#tokentransfer)›*

* **tokensHeldByDid**: *Array‹Scalars["String"]›*

* **transactionByHash**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›*

* **transactionById**? : *[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›*

* **transactions**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[Maybe](_src_middleware_types_.md#maybe)‹[Extrinsic](_src_middleware_types_.md#extrinsic)›››*

___

###  QueryAccountByAddressArgs

Ƭ **QueryAccountByAddressArgs**: *object*

*Defined in [src/middleware/types.ts:129](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L129)*

#### Type declaration:

* **address**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

___

###  QueryAuthorizationsArgs

Ƭ **QueryAuthorizationsArgs**: *object*

*Defined in [src/middleware/types.ts:191](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L191)*

#### Type declaration:

* **accountKey**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **authorizationTypes**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[AuthTypeEnum](../enums/_src_middleware_types_.authtypeenum.md)››*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryBlockByHashArgs

Ƭ **QueryBlockByHashArgs**: *object*

*Defined in [src/middleware/types.ts:86](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L86)*

#### Type declaration:

* **blockHash**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

___

###  QueryBlockByIdArgs

Ƭ **QueryBlockByIdArgs**: *object*

*Defined in [src/middleware/types.ts:82](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L82)*

#### Type declaration:

* **blockId**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryBlocksArgs

Ƭ **QueryBlocksArgs**: *object*

*Defined in [src/middleware/types.ts:77](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L77)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryBridgedEventByTxHashArgs

Ƭ **QueryBridgedEventByTxHashArgs**: *object*

*Defined in [src/middleware/types.ts:133](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L133)*

#### Type declaration:

* **ethTransactionHash**: *Scalars["String"]*

___

###  QueryDidsWithClaimsArgs

Ƭ **QueryDidsWithClaimsArgs**: *object*

*Defined in [src/middleware/types.ts:144](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L144)*

#### Type declaration:

* **claimTypes**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[ClaimTypeEnum](../enums/_src_middleware_types_.claimtypeenum.md)››*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **dids**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹Scalars["String"]››*

* **scope**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **trustedClaimIssuers**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹Scalars["String"]››*

___

###  QueryEventByIndexedArgsArgs

Ƭ **QueryEventByIndexedArgsArgs**: *object*

*Defined in [src/middleware/types.ts:97](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L97)*

#### Type declaration:

* **eventArg0**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventArg1**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventArg2**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventId**: *[EventIdEnum](../enums/_src_middleware_types_.eventidenum.md)*

* **moduleId**: *[ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)*

___

###  QueryEventsArgs

Ƭ **QueryEventsArgs**: *object*

*Defined in [src/middleware/types.ts:90](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L90)*

#### Type declaration:

* **eventId**: *[EventIdEnum](../enums/_src_middleware_types_.eventidenum.md)*

* **fromBlock**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **moduleId**: *[ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)*

* **toBlock**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryEventsByIndexedArgsArgs

Ƭ **QueryEventsByIndexedArgsArgs**: *object*

*Defined in [src/middleware/types.ts:105](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L105)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **eventArg0**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventArg1**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventArg2**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **eventId**: *[EventIdEnum](../enums/_src_middleware_types_.eventidenum.md)*

* **moduleId**: *[ModuleIdEnum](../enums/_src_middleware_types_.moduleidenum.md)*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryPolyxTransfersFailedArgs

Ƭ **QueryPolyxTransfersFailedArgs**: *object*

*Defined in [src/middleware/types.ts:159](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L159)*

#### Type declaration:

* **account**: *Scalars["String"]*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryPolyxTransfersReceivedArgs

Ƭ **QueryPolyxTransfersReceivedArgs**: *object*

*Defined in [src/middleware/types.ts:165](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L165)*

#### Type declaration:

* **account**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryPolyxTransfersSentArgs

Ƭ **QueryPolyxTransfersSentArgs**: *object*

*Defined in [src/middleware/types.ts:137](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L137)*

#### Type declaration:

* **account**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryProposalArgs

Ƭ **QueryProposalArgs**: *object*

*Defined in [src/middleware/types.ts:208](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L208)*

#### Type declaration:

* **pipId**: *Scalars["Int"]*

___

###  QueryProposalVotesArgs

Ƭ **QueryProposalVotesArgs**: *object*

*Defined in [src/middleware/types.ts:221](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L221)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **orderBy**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ProposalVotesOrderByInput](_src_middleware_types_.md#proposalvotesorderbyinput)›*

* **pipId**: *Scalars["Int"]*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **vote**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Boolean"]›*

___

###  QueryProposalsArgs

Ƭ **QueryProposalsArgs**: *object*

*Defined in [src/middleware/types.ts:212](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L212)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **orderBy**? : *[Maybe](_src_middleware_types_.md#maybe)‹[ProposalOrderByInput](_src_middleware_types_.md#proposalorderbyinput)›*

* **pipIds**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹Scalars["Int"]››*

* **proposers**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹Scalars["String"]››*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **states**? : *[Maybe](_src_middleware_types_.md#maybe)‹Array‹[ProposalState](../enums/_src_middleware_types_.proposalstate.md)››*

___

###  QueryReferendumVotes2Args

Ƭ **QueryReferendumVotes2Args**: *object*

*Defined in [src/middleware/types.ts:204](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L204)*

#### Type declaration:

* **proposalId**: *Scalars["Int"]*

___

###  QueryReferendumVotesArgs

Ƭ **QueryReferendumVotesArgs**: *object*

*Defined in [src/middleware/types.ts:199](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L199)*

#### Type declaration:

* **ayesHash**: *Scalars["String"]*

* **naysHash**: *Scalars["String"]*

___

###  QueryTokenTransfersFailedArgs

Ƭ **QueryTokenTransfersFailedArgs**: *object*

*Defined in [src/middleware/types.ts:184](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L184)*

#### Type declaration:

* **account**: *Scalars["String"]*

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **ticker**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

___

###  QueryTokenTransfersReceivedArgs

Ƭ **QueryTokenTransfersReceivedArgs**: *object*

*Defined in [src/middleware/types.ts:172](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L172)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryTokenTransfersSentArgs

Ƭ **QueryTokenTransfersSentArgs**: *object*

*Defined in [src/middleware/types.ts:178](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L178)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryTokensHeldByDidArgs

Ƭ **QueryTokensHeldByDidArgs**: *object*

*Defined in [src/middleware/types.ts:153](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L153)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **did**: *Scalars["String"]*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryTransactionByHashArgs

Ƭ **QueryTransactionByHashArgs**: *object*

*Defined in [src/middleware/types.ts:120](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L120)*

#### Type declaration:

* **transactionHash**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["String"]›*

___

###  QueryTransactionByIdArgs

Ƭ **QueryTransactionByIdArgs**: *object*

*Defined in [src/middleware/types.ts:124](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L124)*

#### Type declaration:

* **blockId**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **transactionIdx**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  QueryTransactionsArgs

Ƭ **QueryTransactionsArgs**: *object*

*Defined in [src/middleware/types.ts:115](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L115)*

#### Type declaration:

* **count**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

* **skip**? : *[Maybe](_src_middleware_types_.md#maybe)‹Scalars["Int"]›*

___

###  Scalars

Ƭ **Scalars**: *object*

*Defined in [src/middleware/types.ts:3](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L3)*

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

###  TokenTransfer

Ƭ **TokenTransfer**: *object*

*Defined in [src/middleware/types.ts:858](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L858)*

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

###  VoteResult

Ƭ **VoteResult**: *object*

*Defined in [src/middleware/types.ts:912](https://github.com/PolymathNetwork/polymesh-sdk/blob/6f0a424/src/middleware/types.ts#L912)*

#### Type declaration:

* **__typename**? : *undefined | "VoteResult"*

* **ayes**: *Array‹Scalars["String"]›*

* **nays**: *Array‹Scalars["String"]›*
