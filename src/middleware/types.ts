export type Connection<T> = {
  nodes: Array<Maybe<T>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
export type OneToManyFilter<T> = {
  every?: InputMaybe<T>;
  some?: InputMaybe<T>;
  none?: InputMaybe<T>;
};
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<
  T extends {
    [key: string]: unknown;
  }
> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends {
    [key: string]: unknown;
  },
  K extends keyof T
> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: {
    input: string;
    output: string;
  };
  String: {
    input: string;
    output: string;
  };
  Boolean: {
    input: boolean;
    output: boolean;
  };
  Int: {
    input: number;
    output: number;
  };
  Float: {
    input: number;
    output: number;
  };
  BigFloat: {
    input: any;
    output: any;
  };
  BigInt: {
    input: any;
    output: any;
  };
  Cursor: {
    input: any;
    output: any;
  };
  Date: {
    input: any;
    output: any;
  };
  Datetime: {
    input: any;
    output: any;
  };
  JSON: {
    input: any;
    output: any;
  };
};
export type Account = Node & {
  accountBalances: Connection<AccountBalance>;
  accountsByAssetAllowanceOwnerIdAndSpenderId: Connection<Account>;
  accountsByAssetAllowanceSpenderIdAndOwnerId: Connection<Account>;
  accountsByAssetTransactionFromAccountIdAndToAccountId: Connection<Account>;
  accountsByAssetTransactionToAccountIdAndFromAccountId: Connection<Account>;
  accountsByInstructionAffirmationAccountIdAndSignerId: Connection<Account>;
  accountsByInstructionAffirmationSignerIdAndAccountId: Connection<Account>;
  accountsByInstructionEventAccountIdAndSignerId: Connection<Account>;
  accountsByInstructionEventSignerIdAndAccountId: Connection<Account>;
  accountsByLegFromAccountIdAndToAccountId: Connection<Account>;
  accountsByLegToAccountIdAndFromAccountId: Connection<Account>;
  accountsByMultiSigAccountIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigCreatorAccountIdAndAccountId: Connection<Account>;
  accountsByNftApprovalOwnerIdAndSpenderId: Connection<Account>;
  accountsByNftApprovalSpenderIdAndOwnerId: Connection<Account>;
  accountsByNftOperatorApprovalOperatorIdAndOwnerId: Connection<Account>;
  accountsByNftOperatorApprovalOwnerIdAndOperatorId: Connection<Account>;
  accountsByStakingEventRewardDestinationAccountIdAndStashId: Connection<Account>;
  accountsByStakingEventStashIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingPositionControllerIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingPositionControllerIdAndStashId: Connection<Account>;
  accountsByStakingPositionRewardDestinationAccountIdAndControllerId: Connection<Account>;
  accountsByStakingPositionRewardDestinationAccountIdAndStashId: Connection<Account>;
  accountsByStakingPositionStashIdAndControllerId: Connection<Account>;
  accountsByStakingPositionStashIdAndRewardDestinationAccountId: Connection<Account>;
  accountsBySubsidyBeneficiaryAccountIdAndPayingAccountId: Connection<Account>;
  accountsBySubsidyPayingAccountIdAndBeneficiaryAccountId: Connection<Account>;
  address: Scalars['String']['output'];
  allowancesGranted: Connection<AssetAllowance>;
  allowancesReceived: Connection<AssetAllowance>;
  assetHoldersByHoldingAccountIdAndAssetHolderId: Connection<AssetHolder>;
  assetsByAssetAllowanceOwnerIdAndAssetId: Connection<Asset>;
  assetsByAssetAllowanceSpenderIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionFromAccountIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionToAccountIdAndAssetId: Connection<Asset>;
  assetsByHoldingAccountIdAndAssetId: Connection<Asset>;
  assetsByLegFromAccountIdAndAssetId: Connection<Asset>;
  assetsByLegToAccountIdAndAssetId: Connection<Asset>;
  assetsByNftApprovalOwnerIdAndAssetId: Connection<Asset>;
  assetsByNftApprovalSpenderIdAndAssetId: Connection<Asset>;
  assetsByNftOperatorApprovalOperatorIdAndAssetId: Connection<Asset>;
  assetsByNftOperatorApprovalOwnerIdAndAssetId: Connection<Asset>;
  authorizationsReceived: Connection<Authorization>;
  blocksByEvmAccountMappingAccountIdAndCreatedBlockId: Connection<Block>;
  blocksByEvmAccountMappingAccountIdAndUpdatedBlockId: Connection<Block>;
  blocksByEvmTransactionFromAccountIdAndBlockId: Connection<Block>;
  blocksByIdentityKeyAccountIdAndValidFromBlockId: Connection<Block>;
  blocksByIdentityKeyAccountIdAndValidToBlockId: Connection<Block>;
  bridgeEventsByRecipientId: Connection<BridgeEvent>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByAccountBalanceAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAllowanceOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAllowanceOwnerIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAllowanceSpenderIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAllowanceSpenderIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetTransactionFromAccountIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionToAccountIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationToAccountIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationToAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByBridgeEventRecipientIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingAccountIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityKeyAccountIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityKeyAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityPrimaryAccountIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityPrimaryAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationAccountIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationSignerIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationSignerIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionEventAccountIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionEventSignerIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionRejectedBySignerIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionRejectedBySignerIdAndUpdatedEventId: Connection<Event>;
  eventsByLegFromAccountIdAndCreatedEventId: Connection<Event>;
  eventsByLegFromAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByLegToAccountIdAndCreatedEventId: Connection<Event>;
  eventsByLegToAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigAccountIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigCreatorAccountIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigCreatorAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatorAccountIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatorAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigSignerSignerAccountIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigSignerSignerAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByNftApprovalOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByNftApprovalOwnerIdAndUpdatedEventId: Connection<Event>;
  eventsByNftApprovalSpenderIdAndCreatedEventId: Connection<Event>;
  eventsByNftApprovalSpenderIdAndUpdatedEventId: Connection<Event>;
  eventsByNftOperatorApprovalOperatorIdAndCreatedEventId: Connection<Event>;
  eventsByNftOperatorApprovalOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByOffChainReceiptSignerIdAndCreatedEventId: Connection<Event>;
  eventsByOffChainReceiptSignerIdAndUpdatedEventId: Connection<Event>;
  eventsByPolyxEntryAccountIdAndCreatedEventId: Connection<Event>;
  eventsByProposalVoteAccountIdAndCreatedEventId: Connection<Event>;
  eventsByProposalVoteAccountIdAndUpdatedEventId: Connection<Event>;
  eventsBySlashAccountIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventRewardDestinationAccountIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventStashIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionControllerIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionControllerIdAndUpdatedEventId: Connection<Event>;
  eventsByStakingPositionRewardDestinationAccountIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionRewardDestinationAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByStakingPositionStashIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionStashIdAndUpdatedEventId: Connection<Event>;
  eventsBySubsidyBeneficiaryAccountIdAndCreatedEventId: Connection<Event>;
  eventsBySubsidyBeneficiaryAccountIdAndUpdatedEventId: Connection<Event>;
  eventsBySubsidyPayingAccountIdAndCreatedEventId: Connection<Event>;
  eventsBySubsidyPayingAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByValidatorAccountIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorAccountIdAndUpdatedEventId: Connection<Event>;
  evmAccountMappings: Connection<EvmAccountMapping>;
  evmAddress?: Maybe<Scalars['String']['output']>;
  evmTransactionsByFromAccountId: Connection<EvmTransaction>;
  extrinsicsByEvmTransactionFromAccountIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByMultiSigProposalCreatorAccountIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxEntryAccountIdAndExtrinsicId: Connection<Extrinsic>;
  holdings: Connection<Holding>;
  id: Scalars['String']['output'];
  identitiesByAccountBalanceAccountIdAndIdentityId: Connection<Identity>;
  identitiesByAssetTransactionFromAccountIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionFromAccountIdAndToIdentityId: Connection<Identity>;
  identitiesByAssetTransactionToAccountIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionToAccountIdAndToIdentityId: Connection<Identity>;
  identitiesByAuthorizationToAccountIdAndFromId: Connection<Identity>;
  identitiesByAuthorizationToAccountIdAndToId: Connection<Identity>;
  identitiesByBridgeEventRecipientIdAndIdentityId: Connection<Identity>;
  identitiesByHoldingAccountIdAndIdentityId: Connection<Identity>;
  identitiesByIdentityKeyAccountIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationAccountIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationAccountIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationSignerIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationSignerIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionEventAccountIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionEventSignerIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionRejectedBySignerIdAndRejectedById: Connection<Identity>;
  identitiesByLegFromAccountIdAndFromId: Connection<Identity>;
  identitiesByLegFromAccountIdAndToId: Connection<Identity>;
  identitiesByLegToAccountIdAndFromId: Connection<Identity>;
  identitiesByLegToAccountIdAndToId: Connection<Identity>;
  identitiesByMultiSigAccountIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigCreatorAccountIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigProposalCreatorAccountIdAndCreatorId: Connection<Identity>;
  identitiesByPolyxEntryAccountIdAndCounterpartyIdentityId: Connection<Identity>;
  identitiesByPolyxEntryAccountIdAndIdentityId: Connection<Identity>;
  identitiesByPrimaryAccountId: Connection<Identity>;
  identitiesByStakingEventRewardDestinationAccountIdAndIdentityId: Connection<Identity>;
  identitiesByStakingEventStashIdAndIdentityId: Connection<Identity>;
  identitiesByStakingPositionControllerIdAndIdentityId: Connection<Identity>;
  identitiesByStakingPositionRewardDestinationAccountIdAndIdentityId: Connection<Identity>;
  identitiesByStakingPositionStashIdAndIdentityId: Connection<Identity>;
  identitiesByValidatorAccountIdAndIdentityId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  instructionAffirmations: Connection<InstructionAffirmation>;
  instructionAffirmationsBySignerId: Connection<InstructionAffirmation>;
  instructionEvents: Connection<InstructionEvent>;
  instructionEventsBySignerId: Connection<InstructionEvent>;
  instructionPartiesByInstructionAffirmationAccountIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationSignerIdAndPartyId: Connection<InstructionParty>;
  instructionsByAssetTransactionFromAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByAssetTransactionToAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationSignerIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventSignerIdAndInstructionId: Connection<Instruction>;
  instructionsByLegFromAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByLegToAccountIdAndInstructionId: Connection<Instruction>;
  instructionsByRejectedBySignerId: Connection<Instruction>;
  keyAssignments: Connection<IdentityKey>;
  keyRole: AccountKeyRole;
  keyType: Scalars['String']['output'];
  legsByOffChainReceiptSignerIdAndLegId: Connection<Leg>;
  legsIn: Connection<Leg>;
  legsOut: Connection<Leg>;
  multiSigProposalsByCreatorAccountId: Connection<MultiSigProposal>;
  multiSigs: Connection<MultiSig>;
  multiSigsByCreatorAccountId: Connection<MultiSig>;
  multiSigsByMultiSigProposalCreatorAccountIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigSignerSignerAccountIdAndMultisigId: Connection<MultiSig>;
  nftApprovalsGranted: Connection<NftApproval>;
  nftApprovalsReceived: Connection<NftApproval>;
  nftOperatorApprovalsGranted: Connection<NftOperatorApproval>;
  nftOperatorApprovalsReceived: Connection<NftOperatorApproval>;
  nftsByNftApprovalOwnerIdAndNftId: Connection<Nft>;
  nftsByNftApprovalSpenderIdAndNftId: Connection<Nft>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationAccountIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationSignerIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventAccountIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventSignerIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsBySignerId: Connection<OffChainReceipt>;
  polyxEntries: Connection<PolyxEntry>;
  portfoliosByAssetTransactionFromAccountIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionFromAccountIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToAccountIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToAccountIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByHoldingAccountIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationAccountIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationSignerIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventAccountIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventSignerIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByLegFromAccountIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegFromAccountIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByLegToAccountIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegToAccountIdAndToPortfolioId: Connection<Portfolio>;
  proposalVotes: Connection<ProposalVote>;
  proposalsByProposalVoteAccountIdAndProposalId: Connection<Proposal>;
  signerOf: Connection<MultiSigSigner>;
  slashes: Connection<Slash>;
  stakingEvents: Connection<StakingEvent>;
  stakingEventsByRewardDestinationAccountId: Connection<StakingEvent>;
  stakingPositionsByControllerId: Connection<StakingPosition>;
  stakingPositionsByRewardDestinationAccountId: Connection<StakingPosition>;
  stakingPositionsByStakingEventRewardDestinationAccountIdAndPositionId: Connection<StakingPosition>;
  stakingPositionsByStakingEventStashIdAndPositionId: Connection<StakingPosition>;
  stakingPositionsByStashId: Connection<StakingPosition>;
  subsidiesPaid: Connection<Subsidy>;
  subsidiesReceived: Connection<Subsidy>;
  transfersIn: Connection<AssetTransaction>;
  transfersOut: Connection<AssetTransaction>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  validators: Connection<Validator>;
  validatorsBySlashAccountIdAndValidatorId: Connection<Validator>;
  validatorsByStakingEventRewardDestinationAccountIdAndValidatorId: Connection<Validator>;
  validatorsByStakingEventStashIdAndValidatorId: Connection<Validator>;
  venuesByInstructionRejectedBySignerIdAndVenueId: Connection<Venue>;
};
export type AccountBalance = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  bonded: Scalars['BigFloat']['output'];
  free: Scalars['BigFloat']['output'];
  frozen: Scalars['BigFloat']['output'];
  holds?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  lifetimeByKind?: Maybe<Scalars['JSON']['output']>;
  locks?: Maybe<Scalars['JSON']['output']>;
  movementCount: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  otherReserved: Scalars['BigFloat']['output'];
  reserved: Scalars['BigFloat']['output'];
  total: Scalars['BigFloat']['output'];
  totalFeesPaid: Scalars['BigFloat']['output'];
  totalReceived: Scalars['BigFloat']['output'];
  totalRewards: Scalars['BigFloat']['output'];
  totalSent: Scalars['BigFloat']['output'];
  totalSlashed: Scalars['BigFloat']['output'];
  transferable: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AccountBalanceFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<AccountBalanceFilter>>;
  bonded?: InputMaybe<BigFloatFilter>;
  free?: InputMaybe<BigFloatFilter>;
  frozen?: InputMaybe<BigFloatFilter>;
  holds?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  lifetimeByKind?: InputMaybe<JsonFilter>;
  locks?: InputMaybe<JsonFilter>;
  movementCount?: InputMaybe<IntFilter>;
  not?: InputMaybe<AccountBalanceFilter>;
  or?: InputMaybe<Array<AccountBalanceFilter>>;
  otherReserved?: InputMaybe<BigFloatFilter>;
  reserved?: InputMaybe<BigFloatFilter>;
  total?: InputMaybe<BigFloatFilter>;
  totalFeesPaid?: InputMaybe<BigFloatFilter>;
  totalReceived?: InputMaybe<BigFloatFilter>;
  totalRewards?: InputMaybe<BigFloatFilter>;
  totalSent?: InputMaybe<BigFloatFilter>;
  totalSlashed?: InputMaybe<BigFloatFilter>;
  transferable?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AccountBalancesOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  BondedAsc = 'BONDED_ASC',
  BondedDesc = 'BONDED_DESC',
  FreeAsc = 'FREE_ASC',
  FreeDesc = 'FREE_DESC',
  FrozenAsc = 'FROZEN_ASC',
  FrozenDesc = 'FROZEN_DESC',
  HoldsAsc = 'HOLDS_ASC',
  HoldsDesc = 'HOLDS_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LocksAsc = 'LOCKS_ASC',
  LocksDesc = 'LOCKS_DESC',
  Natural = 'NATURAL',
  OtherReservedAsc = 'OTHER_RESERVED_ASC',
  OtherReservedDesc = 'OTHER_RESERVED_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReservedAsc = 'RESERVED_ASC',
  ReservedDesc = 'RESERVED_DESC',
  TotalAsc = 'TOTAL_ASC',
  TotalDesc = 'TOTAL_DESC',
  TotalFeesPaidAsc = 'TOTAL_FEES_PAID_ASC',
  TotalFeesPaidDesc = 'TOTAL_FEES_PAID_DESC',
  TotalReceivedAsc = 'TOTAL_RECEIVED_ASC',
  TotalReceivedDesc = 'TOTAL_RECEIVED_DESC',
  TotalRewardsAsc = 'TOTAL_REWARDS_ASC',
  TotalRewardsDesc = 'TOTAL_REWARDS_DESC',
  TotalSentAsc = 'TOTAL_SENT_ASC',
  TotalSentDesc = 'TOTAL_SENT_DESC',
  TotalSlashedAsc = 'TOTAL_SLASHED_ASC',
  TotalSlashedDesc = 'TOTAL_SLASHED_DESC',
  TransferableAsc = 'TRANSFERABLE_ASC',
  TransferableDesc = 'TRANSFERABLE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AccountFilter = {
  accountBalances?: InputMaybe<OneToManyFilter<AccountBalanceFilter>>;
  address?: InputMaybe<StringFilter>;
  allowancesGranted?: InputMaybe<OneToManyFilter<AssetAllowanceFilter>>;
  allowancesReceived?: InputMaybe<OneToManyFilter<AssetAllowanceFilter>>;
  and?: InputMaybe<Array<AccountFilter>>;
  authorizationsReceived?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  bridgeEventsByRecipientId?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  evmAccountMappings?: InputMaybe<OneToManyFilter<EvmAccountMappingFilter>>;
  evmAddress?: InputMaybe<StringFilter>;
  evmTransactionsByFromAccountId?: InputMaybe<OneToManyFilter<EvmTransactionFilter>>;
  holdings?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  identitiesByPrimaryAccountId?: InputMaybe<OneToManyFilter<IdentityFilter>>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  instructionAffirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionAffirmationsBySignerId?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionEvents?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionEventsBySignerId?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionsByRejectedBySignerId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  keyAssignments?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  keyRole?: InputMaybe<AccountKeyRoleFilter>;
  keyType?: InputMaybe<StringFilter>;
  legsIn?: InputMaybe<OneToManyFilter<LegFilter>>;
  legsOut?: InputMaybe<OneToManyFilter<LegFilter>>;
  multiSigProposalsByCreatorAccountId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigs?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  multiSigsByCreatorAccountId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  nftApprovalsGranted?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  nftApprovalsReceived?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  nftOperatorApprovalsGranted?: InputMaybe<OneToManyFilter<NftOperatorApprovalFilter>>;
  nftOperatorApprovalsReceived?: InputMaybe<OneToManyFilter<NftOperatorApprovalFilter>>;
  not?: InputMaybe<AccountFilter>;
  offChainReceiptsBySignerId?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  or?: InputMaybe<Array<AccountFilter>>;
  polyxEntries?: InputMaybe<OneToManyFilter<PolyxEntryFilter>>;
  proposalVotes?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
  signerOf?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  slashes?: InputMaybe<OneToManyFilter<SlashFilter>>;
  stakingEvents?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stakingEventsByRewardDestinationAccountId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stakingPositionsByControllerId?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  stakingPositionsByRewardDestinationAccountId?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  stakingPositionsByStashId?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  subsidiesPaid?: InputMaybe<OneToManyFilter<SubsidyFilter>>;
  subsidiesReceived?: InputMaybe<OneToManyFilter<SubsidyFilter>>;
  transfersIn?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  transfersOut?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  validators?: InputMaybe<OneToManyFilter<ValidatorFilter>>;
};
export enum AccountKeyRole {
  MultiSigSigner = 'MultiSigSigner',
  PrimaryKey = 'PrimaryKey',
  SecondaryKey = 'SecondaryKey',
  Unlinked = 'Unlinked',
}
export type AccountKeyRoleFilter = {
  distinctFrom?: InputMaybe<AccountKeyRole>;
  equalTo?: InputMaybe<AccountKeyRole>;
  greaterThan?: InputMaybe<AccountKeyRole>;
  greaterThanOrEqualTo?: InputMaybe<AccountKeyRole>;
  in?: InputMaybe<Array<AccountKeyRole>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AccountKeyRole>;
  lessThanOrEqualTo?: InputMaybe<AccountKeyRole>;
  notDistinctFrom?: InputMaybe<AccountKeyRole>;
  notEqualTo?: InputMaybe<AccountKeyRole>;
  notIn?: InputMaybe<Array<AccountKeyRole>>;
};
export enum AccountsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EvmAddressAsc = 'EVM_ADDRESS_ASC',
  EvmAddressDesc = 'EVM_ADDRESS_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KeyRoleAsc = 'KEY_ROLE_ASC',
  KeyRoleDesc = 'KEY_ROLE_DESC',
  KeyTypeAsc = 'KEY_TYPE_ASC',
  KeyTypeDesc = 'KEY_TYPE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AffirmStatusEnum {
  Affirmed = 'Affirmed',
  Pending = 'Pending',
}
export type AffirmStatusEnumFilter = {
  distinctFrom?: InputMaybe<AffirmStatusEnum>;
  equalTo?: InputMaybe<AffirmStatusEnum>;
  greaterThan?: InputMaybe<AffirmStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<AffirmStatusEnum>;
  in?: InputMaybe<Array<AffirmStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AffirmStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<AffirmStatusEnum>;
  notDistinctFrom?: InputMaybe<AffirmStatusEnum>;
  notEqualTo?: InputMaybe<AffirmStatusEnum>;
  notIn?: InputMaybe<Array<AffirmStatusEnum>>;
};
export enum AffirmingPartyEnum {
  Mediator = 'Mediator',
  Receiver = 'Receiver',
  Sender = 'Sender',
}
export type AffirmingPartyEnumFilter = {
  distinctFrom?: InputMaybe<AffirmingPartyEnum>;
  equalTo?: InputMaybe<AffirmingPartyEnum>;
  greaterThan?: InputMaybe<AffirmingPartyEnum>;
  greaterThanOrEqualTo?: InputMaybe<AffirmingPartyEnum>;
  in?: InputMaybe<Array<AffirmingPartyEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AffirmingPartyEnum>;
  lessThanOrEqualTo?: InputMaybe<AffirmingPartyEnum>;
  notDistinctFrom?: InputMaybe<AffirmingPartyEnum>;
  notEqualTo?: InputMaybe<AffirmingPartyEnum>;
  notIn?: InputMaybe<Array<AffirmingPartyEnum>>;
};
export type AgentGroup = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByAgentGroupMembershipGroupIdAndCreatedEventId: Connection<Event>;
  eventsByAgentGroupMembershipGroupIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByAgentGroupMembershipGroupIdAndMemberId: Connection<Identity>;
  members: Connection<AgentGroupMembership>;
  nodeId: Scalars['ID']['output'];
  permissions: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AgentGroupFilter = {
  and?: InputMaybe<Array<AgentGroupFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  members?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  not?: InputMaybe<AgentGroupFilter>;
  or?: InputMaybe<Array<AgentGroupFilter>>;
  permissions?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type AgentGroupMembership = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  group?: Maybe<AgentGroup>;
  groupId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  member?: Maybe<Identity>;
  memberId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AgentGroupMembershipFilter = {
  and?: InputMaybe<Array<AgentGroupMembershipFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  group?: InputMaybe<AgentGroupFilter>;
  groupId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  member?: InputMaybe<IdentityFilter>;
  memberId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AgentGroupMembershipFilter>;
  or?: InputMaybe<Array<AgentGroupMembershipFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AgentGroupMembershipsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  GroupIdAsc = 'GROUP_ID_ASC',
  GroupIdDesc = 'GROUP_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemberIdAsc = 'MEMBER_ID_ASC',
  MemberIdDesc = 'MEMBER_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AgentGroupsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AgentHistoryType {
  AgentAdded = 'AgentAdded',
  AgentPermissionsChanged = 'AgentPermissionsChanged',
  AgentRemoved = 'AgentRemoved',
  GroupChanged = 'GroupChanged',
}
export type AgentHistoryTypeFilter = {
  distinctFrom?: InputMaybe<AgentHistoryType>;
  equalTo?: InputMaybe<AgentHistoryType>;
  greaterThan?: InputMaybe<AgentHistoryType>;
  greaterThanOrEqualTo?: InputMaybe<AgentHistoryType>;
  in?: InputMaybe<Array<AgentHistoryType>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AgentHistoryType>;
  lessThanOrEqualTo?: InputMaybe<AgentHistoryType>;
  notDistinctFrom?: InputMaybe<AgentHistoryType>;
  notEqualTo?: InputMaybe<AgentHistoryType>;
  notIn?: InputMaybe<Array<AgentHistoryType>>;
};
export enum AnomalyKind {
  ArityMismatch = 'ArityMismatch',
  DeferredWrite = 'DeferredWrite',
  FieldNotFound = 'FieldNotFound',
  HandlerError = 'HandlerError',
  MissingReferencedEntity = 'MissingReferencedEntity',
  NoDecoderForSpecVersion = 'NoDecoderForSpecVersion',
  UnknownEnumValue = 'UnknownEnumValue',
  UnreadableValue = 'UnreadableValue',
}
export type AnomalyKindFilter = {
  distinctFrom?: InputMaybe<AnomalyKind>;
  equalTo?: InputMaybe<AnomalyKind>;
  greaterThan?: InputMaybe<AnomalyKind>;
  greaterThanOrEqualTo?: InputMaybe<AnomalyKind>;
  in?: InputMaybe<Array<AnomalyKind>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AnomalyKind>;
  lessThanOrEqualTo?: InputMaybe<AnomalyKind>;
  notDistinctFrom?: InputMaybe<AnomalyKind>;
  notEqualTo?: InputMaybe<AnomalyKind>;
  notIn?: InputMaybe<Array<AnomalyKind>>;
};
export type Asset = Node & {
  accountsByAssetAllowanceAssetIdAndOwnerId: Connection<Account>;
  accountsByAssetAllowanceAssetIdAndSpenderId: Connection<Account>;
  accountsByAssetTransactionAssetIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionAssetIdAndToAccountId: Connection<Account>;
  accountsByHoldingAssetIdAndAccountId: Connection<Account>;
  accountsByLegAssetIdAndFromAccountId: Connection<Account>;
  accountsByLegAssetIdAndToAccountId: Connection<Account>;
  accountsByNftApprovalAssetIdAndOwnerId: Connection<Account>;
  accountsByNftApprovalAssetIdAndSpenderId: Connection<Account>;
  accountsByNftOperatorApprovalAssetIdAndOperatorId: Connection<Account>;
  accountsByNftOperatorApprovalAssetIdAndOwnerId: Connection<Account>;
  agentActions: Connection<AssetAgentAction>;
  agentGroups: Connection<AgentGroup>;
  agentHistory: Connection<AssetAgentHistory>;
  agents: Connection<AssetAgent>;
  allowances: Connection<AssetAllowance>;
  assetHoldersByHoldingAssetIdAndAssetHolderId: Connection<AssetHolder>;
  assetId: Scalars['String']['output'];
  assetsByDistributionAssetIdAndCurrencyId: Connection<Asset>;
  assetsByDistributionCurrencyIdAndAssetId: Connection<Asset>;
  assetsByInvestmentOfferingAssetIdAndRaisingAssetId: Connection<Asset>;
  assetsByInvestmentRaisingAssetIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoOfferingAssetIdAndRaisingAssetId: Connection<Asset>;
  assetsByStoRaisingAssetIdAndOfferingAssetId: Connection<Asset>;
  ballots: Connection<CorporateBallot>;
  checkpointSchedules: Connection<CheckpointSchedule>;
  checkpointSchedulesByCheckpointAssetIdAndScheduleId: Connection<CheckpointSchedule>;
  checkpoints: Connection<Checkpoint>;
  checkpointsByCorporateActionAssetIdAndCheckpointId: Connection<Checkpoint>;
  compliance: Connection<Compliance>;
  corporateActionDefaultConfigs: Connection<CorporateActionDefaultConfig>;
  corporateActions: Connection<CorporateAction>;
  corporateActionsByCorporateBallotAssetIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByDistributionAssetIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByDistributionCurrencyIdAndCorporateActionId: Connection<CorporateAction>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  customClaimTypesByStatTypeAssetIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  distributions: Connection<Distribution>;
  distributionsByCurrencyId: Connection<Distribution>;
  documents: Connection<AssetDocument>;
  eventsByAgentGroupAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAgentGroupAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentActionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentActionAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentHistoryAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAllowanceAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAllowanceAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetDocumentAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetDocumentAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetHolderAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetHolderAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMetadatumAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMetadatumAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetPreApprovalAssetIdAndCreatedEventId: Connection<Event>;
  eventsByAssetPreApprovalAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetTransactionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCheckpointAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCheckpointScheduleAssetIdAndCompletedEventId: Connection<Event>;
  eventsByCheckpointScheduleAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCheckpointScheduleAssetIdAndRemovedEventId: Connection<Event>;
  eventsByComplianceAssetIdAndCreatedEventId: Connection<Event>;
  eventsByComplianceAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateActionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateActionAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateActionDefaultConfigAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateActionDefaultConfigAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateBallotAssetIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionCurrencyIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionCurrencyIdAndUpdatedEventId: Connection<Event>;
  eventsByFundingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByInvestmentOfferingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByInvestmentOfferingAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByInvestmentRaisingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByInvestmentRaisingAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByLegAssetIdAndCreatedEventId: Connection<Event>;
  eventsByLegAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByNftApprovalAssetIdAndCreatedEventId: Connection<Event>;
  eventsByNftApprovalAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByNftAssetIdAndBurnedEventId: Connection<Event>;
  eventsByNftAssetIdAndCreatedEventId: Connection<Event>;
  eventsByNftAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByNftOperatorApprovalAssetIdAndCreatedEventId: Connection<Event>;
  eventsByStatTypeAssetIdAndCreatedEventId: Connection<Event>;
  eventsByStatTypeAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByStoOfferingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByStoOfferingAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByStoRaisingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByStoRaisingAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByTickerReservationAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTickerReservationAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerAssetIdAndUpdatedEventId: Connection<Event>;
  fundingRound?: Maybe<Scalars['String']['output']>;
  fundings: Connection<Funding>;
  holderCount: Scalars['Int']['output'];
  holders: Connection<AssetHolder>;
  holdings: Connection<Holding>;
  holdingsByNftAssetIdAndHoldingId: Connection<Holding>;
  id: Scalars['String']['output'];
  identifiers: Scalars['JSON']['output'];
  identitiesByAssetAgentActionAssetIdAndCallerId: Connection<Identity>;
  identitiesByAssetAgentAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetAgentHistoryAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetHolderAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorAssetIdAndAddedById: Connection<Identity>;
  identitiesByAssetMandatoryMediatorAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetPreApprovalAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetTransactionAssetIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionAssetIdAndToIdentityId: Connection<Identity>;
  identitiesByDistributionAssetIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionCurrencyIdAndIdentityId: Connection<Identity>;
  identitiesByHoldingAssetIdAndIdentityId: Connection<Identity>;
  identitiesByInvestmentOfferingAssetIdAndInvestorId: Connection<Identity>;
  identitiesByInvestmentRaisingAssetIdAndInvestorId: Connection<Identity>;
  identitiesByLegAssetIdAndFromId: Connection<Identity>;
  identitiesByLegAssetIdAndToId: Connection<Identity>;
  identitiesByStatTypeAssetIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStoOfferingAssetIdAndCreatorId: Connection<Identity>;
  identitiesByStoRaisingAssetIdAndCreatorId: Connection<Identity>;
  identitiesByTickerReservationAssetIdAndIdentityId: Connection<Identity>;
  identitiesByTransferComplianceAssetIdAndClaimIssuerId: Connection<Identity>;
  identitiesByTransferComplianceExemptionAssetIdAndExemptedEntityId: Connection<Identity>;
  identitiesByTrustedClaimIssuerAssetIdAndIssuerId: Connection<Identity>;
  instructionsByAssetTransactionAssetIdAndInstructionId: Connection<Instruction>;
  instructionsByLegAssetIdAndInstructionId: Connection<Instruction>;
  investmentsByOfferingAssetId: Connection<Investment>;
  investmentsByRaisingAssetId: Connection<Investment>;
  isCompliancePaused: Scalars['Boolean']['output'];
  isDivisible: Scalars['Boolean']['output'];
  isFrozen: Scalars['Boolean']['output'];
  isNftCollection: Scalars['Boolean']['output'];
  legs: Connection<Leg>;
  mandatoryMediators: Connection<AssetMandatoryMediator>;
  metadata: Connection<AssetMetadatum>;
  name?: Maybe<Scalars['String']['output']>;
  nftApprovals: Connection<NftApproval>;
  nftOperatorApprovals: Connection<NftOperatorApproval>;
  nfts: Connection<Nft>;
  nftsByNftApprovalAssetIdAndNftId: Connection<Nft>;
  nodeId: Scalars['ID']['output'];
  offerings: Connection<Sto>;
  owner?: Maybe<Identity>;
  ownerId: Scalars['String']['output'];
  portfoliosByAssetTransactionAssetIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionAssetIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionAssetIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionCurrencyIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByHoldingAssetIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByLegAssetIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegAssetIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByStoOfferingAssetIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoOfferingAssetIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByStoRaisingAssetIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoRaisingAssetIdAndRaisingPortfolioId: Connection<Portfolio>;
  preApprovals: Connection<AssetPreApproval>;
  statTypes: Connection<StatType>;
  statTypesByTransferComplianceAssetIdAndStatTypeId: Connection<StatType>;
  stosByInvestmentOfferingAssetIdAndStoId: Connection<Sto>;
  stosByInvestmentRaisingAssetIdAndStoId: Connection<Sto>;
  stosByRaisingAssetId: Connection<Sto>;
  ticker?: Maybe<Scalars['String']['output']>;
  tickerReservations: Connection<TickerReservation>;
  totalSupply: Scalars['BigFloat']['output'];
  totalTransfers: Scalars['BigFloat']['output'];
  transactions: Connection<AssetTransaction>;
  transferComplianceExemptions: Connection<TransferComplianceExemption>;
  transferCompliances: Connection<TransferCompliance>;
  trustedClaimIssuers: Connection<TrustedClaimIssuer>;
  type?: Maybe<Scalars['String']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  venuesByStoOfferingAssetIdAndVenueId: Connection<Venue>;
  venuesByStoRaisingAssetIdAndVenueId: Connection<Venue>;
};
export type AssetAgent = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetAgentAction = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  caller?: Maybe<Identity>;
  callerId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  palletName: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetAgentActionFilter = {
  and?: InputMaybe<Array<AssetAgentActionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  caller?: InputMaybe<IdentityFilter>;
  callerExists?: InputMaybe<Scalars['Boolean']['input']>;
  callerId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetAgentActionFilter>;
  or?: InputMaybe<Array<AssetAgentActionFilter>>;
  palletName?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetAgentActionsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CallerIdAsc = 'CALLER_ID_ASC',
  CallerIdDesc = 'CALLER_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PalletNameAsc = 'PALLET_NAME_ASC',
  PalletNameDesc = 'PALLET_NAME_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetAgentFilter = {
  and?: InputMaybe<Array<AssetAgentFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetAgentFilter>;
  or?: InputMaybe<Array<AssetAgentFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetAgentHistoriesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetAgentHistory = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  permissions?: Maybe<Scalars['String']['output']>;
  type: AgentHistoryType;
};
export type AssetAgentHistoryFilter = {
  and?: InputMaybe<Array<AssetAgentHistoryFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetAgentHistoryFilter>;
  or?: InputMaybe<Array<AssetAgentHistoryFilter>>;
  permissions?: InputMaybe<StringFilter>;
  type?: InputMaybe<AgentHistoryTypeFilter>;
};
export enum AssetAgentsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetAllowance = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Account>;
  ownerId: Scalars['String']['output'];
  spender?: Maybe<Account>;
  spenderId: Scalars['String']['output'];
  totalSpent: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetAllowanceFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<AssetAllowanceFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetAllowanceFilter>;
  or?: InputMaybe<Array<AssetAllowanceFilter>>;
  owner?: InputMaybe<AccountFilter>;
  ownerId?: InputMaybe<StringFilter>;
  spender?: InputMaybe<AccountFilter>;
  spenderId?: InputMaybe<StringFilter>;
  totalSpent?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetAllowancesOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpenderIdAsc = 'SPENDER_ID_ASC',
  SpenderIdDesc = 'SPENDER_ID_DESC',
  TotalSpentAsc = 'TOTAL_SPENT_ASC',
  TotalSpentDesc = 'TOTAL_SPENT_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetDocument = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  contentHash?: Maybe<Scalars['JSON']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  documentId: Scalars['Int']['output'];
  filedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetDocumentFilter = {
  and?: InputMaybe<Array<AssetDocumentFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  contentHash?: InputMaybe<JsonFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  documentId?: InputMaybe<IntFilter>;
  filedAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  link?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetDocumentFilter>;
  or?: InputMaybe<Array<AssetDocumentFilter>>;
  type?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetDocumentsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ContentHashAsc = 'CONTENT_HASH_ASC',
  ContentHashDesc = 'CONTENT_HASH_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DocumentIdAsc = 'DOCUMENT_ID_ASC',
  DocumentIdDesc = 'DOCUMENT_ID_DESC',
  FiledAtAsc = 'FILED_AT_ASC',
  FiledAtDesc = 'FILED_AT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LinkAsc = 'LINK_ASC',
  LinkDesc = 'LINK_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetFilter = {
  agentActions?: InputMaybe<OneToManyFilter<AssetAgentActionFilter>>;
  agentGroups?: InputMaybe<OneToManyFilter<AgentGroupFilter>>;
  agentHistory?: InputMaybe<OneToManyFilter<AssetAgentHistoryFilter>>;
  agents?: InputMaybe<OneToManyFilter<AssetAgentFilter>>;
  allowances?: InputMaybe<OneToManyFilter<AssetAllowanceFilter>>;
  and?: InputMaybe<Array<AssetFilter>>;
  assetId?: InputMaybe<StringFilter>;
  ballots?: InputMaybe<OneToManyFilter<CorporateBallotFilter>>;
  checkpointSchedules?: InputMaybe<OneToManyFilter<CheckpointScheduleFilter>>;
  checkpoints?: InputMaybe<OneToManyFilter<CheckpointFilter>>;
  compliance?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  corporateActionDefaultConfigs?: InputMaybe<OneToManyFilter<CorporateActionDefaultConfigFilter>>;
  corporateActions?: InputMaybe<OneToManyFilter<CorporateActionFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  distributionsByCurrencyId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  documents?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  fundingRound?: InputMaybe<StringFilter>;
  fundings?: InputMaybe<OneToManyFilter<FundingFilter>>;
  holderCount?: InputMaybe<IntFilter>;
  holders?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  holdings?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  identifiers?: InputMaybe<JsonFilter>;
  investmentsByOfferingAssetId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  investmentsByRaisingAssetId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  isCompliancePaused?: InputMaybe<BooleanFilter>;
  isDivisible?: InputMaybe<BooleanFilter>;
  isFrozen?: InputMaybe<BooleanFilter>;
  isNftCollection?: InputMaybe<BooleanFilter>;
  legs?: InputMaybe<OneToManyFilter<LegFilter>>;
  mandatoryMediators?: InputMaybe<OneToManyFilter<AssetMandatoryMediatorFilter>>;
  metadata?: InputMaybe<OneToManyFilter<AssetMetadatumFilter>>;
  name?: InputMaybe<StringFilter>;
  nftApprovals?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  nftOperatorApprovals?: InputMaybe<OneToManyFilter<NftOperatorApprovalFilter>>;
  nfts?: InputMaybe<OneToManyFilter<NftFilter>>;
  not?: InputMaybe<AssetFilter>;
  offerings?: InputMaybe<OneToManyFilter<StoFilter>>;
  or?: InputMaybe<Array<AssetFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerId?: InputMaybe<StringFilter>;
  preApprovals?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  statTypes?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  stosByRaisingAssetId?: InputMaybe<OneToManyFilter<StoFilter>>;
  ticker?: InputMaybe<StringFilter>;
  tickerReservations?: InputMaybe<OneToManyFilter<TickerReservationFilter>>;
  totalSupply?: InputMaybe<BigFloatFilter>;
  totalTransfers?: InputMaybe<BigFloatFilter>;
  transactions?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  transferComplianceExemptions?: InputMaybe<OneToManyFilter<TransferComplianceExemptionFilter>>;
  transferCompliances?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  trustedClaimIssuers?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  type?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type AssetHolder = Node & {
  accountsByHoldingAssetHolderIdAndAccountId: Connection<Account>;
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByHoldingAssetHolderIdAndAssetId: Connection<Asset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByHoldingAssetHolderIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingAssetHolderIdAndUpdatedEventId: Connection<Event>;
  holdings: Connection<Holding>;
  id: Scalars['String']['output'];
  identitiesByHoldingAssetHolderIdAndIdentityId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nftCount: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  portfoliosByHoldingAssetHolderIdAndPortfolioId: Connection<Portfolio>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetHolderFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<AssetHolderFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  holdings?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  nftCount?: InputMaybe<IntFilter>;
  not?: InputMaybe<AssetHolderFilter>;
  or?: InputMaybe<Array<AssetHolderFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetHoldersOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetMandatoryMediator = Node & {
  addedBy?: Maybe<Identity>;
  addedById?: Maybe<Scalars['String']['output']>;
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetMandatoryMediatorFilter = {
  addedBy?: InputMaybe<IdentityFilter>;
  addedByExists?: InputMaybe<Scalars['Boolean']['input']>;
  addedById?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<AssetMandatoryMediatorFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetMandatoryMediatorFilter>;
  or?: InputMaybe<Array<AssetMandatoryMediatorFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetMandatoryMediatorsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AssetMetadataOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsLockedAsc = 'IS_LOCKED_ASC',
  IsLockedDesc = 'IS_LOCKED_DESC',
  KeyIdAsc = 'KEY_ID_ASC',
  KeyIdDesc = 'KEY_ID_DESC',
  LockedUntilAsc = 'LOCKED_UNTIL_ASC',
  LockedUntilDesc = 'LOCKED_UNTIL_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetMetadatum = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  expiry?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  isLocked: Scalars['Boolean']['output'];
  keyId: Scalars['String']['output'];
  lockedUntil?: Maybe<Scalars['Datetime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  scope: MetadataScope;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};
export type AssetMetadatumFilter = {
  and?: InputMaybe<Array<AssetMetadatumFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  isLocked?: InputMaybe<BooleanFilter>;
  keyId?: InputMaybe<StringFilter>;
  lockedUntil?: InputMaybe<DatetimeFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetMetadatumFilter>;
  or?: InputMaybe<Array<AssetMetadatumFilter>>;
  scope?: InputMaybe<MetadataScopeFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
};
export type AssetPreApproval = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AssetPreApprovalFilter = {
  and?: InputMaybe<Array<AssetPreApprovalFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetPreApprovalFilter>;
  or?: InputMaybe<Array<AssetPreApprovalFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AssetPreApprovalsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetTransaction = Node & {
  address?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['BigFloat']['output']>;
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventId: EventIdEnum;
  fromAccount?: Maybe<Account>;
  fromAccountId?: Maybe<Scalars['String']['output']>;
  fromIdentity?: Maybe<Identity>;
  fromIdentityId?: Maybe<Scalars['String']['output']>;
  fromPortfolio?: Maybe<Portfolio>;
  fromPortfolioId?: Maybe<Scalars['String']['output']>;
  fundingRound?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId?: Maybe<Scalars['String']['output']>;
  instructionMemo?: Maybe<Scalars['String']['output']>;
  isInternalTransfer?: Maybe<Scalars['Boolean']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  toAccount?: Maybe<Account>;
  toAccountId?: Maybe<Scalars['String']['output']>;
  toIdentity?: Maybe<Identity>;
  toIdentityId?: Maybe<Scalars['String']['output']>;
  toPortfolio?: Maybe<Portfolio>;
  toPortfolioId?: Maybe<Scalars['String']['output']>;
};
export type AssetTransactionFilter = {
  address?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<AssetTransactionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  fromAccount?: InputMaybe<AccountFilter>;
  fromAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromAccountId?: InputMaybe<StringFilter>;
  fromIdentity?: InputMaybe<IdentityFilter>;
  fromIdentityExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromIdentityId?: InputMaybe<StringFilter>;
  fromPortfolio?: InputMaybe<PortfolioFilter>;
  fromPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromPortfolioId?: InputMaybe<StringFilter>;
  fundingRound?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionExists?: InputMaybe<Scalars['Boolean']['input']>;
  instructionId?: InputMaybe<StringFilter>;
  instructionMemo?: InputMaybe<StringFilter>;
  isInternalTransfer?: InputMaybe<BooleanFilter>;
  memo?: InputMaybe<StringFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<AssetTransactionFilter>;
  or?: InputMaybe<Array<AssetTransactionFilter>>;
  toAccount?: InputMaybe<AccountFilter>;
  toAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  toAccountId?: InputMaybe<StringFilter>;
  toIdentity?: InputMaybe<IdentityFilter>;
  toIdentityExists?: InputMaybe<Scalars['Boolean']['input']>;
  toIdentityId?: InputMaybe<StringFilter>;
  toPortfolio?: InputMaybe<PortfolioFilter>;
  toPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  toPortfolioId?: InputMaybe<StringFilter>;
};
export enum AssetTransactionsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  FromAccountIdAsc = 'FROM_ACCOUNT_ID_ASC',
  FromAccountIdDesc = 'FROM_ACCOUNT_ID_DESC',
  FromIdentityIdAsc = 'FROM_IDENTITY_ID_ASC',
  FromIdentityIdDesc = 'FROM_IDENTITY_ID_DESC',
  FromPortfolioIdAsc = 'FROM_PORTFOLIO_ID_ASC',
  FromPortfolioIdDesc = 'FROM_PORTFOLIO_ID_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  InstructionMemoAsc = 'INSTRUCTION_MEMO_ASC',
  InstructionMemoDesc = 'INSTRUCTION_MEMO_DESC',
  IsInternalTransferAsc = 'IS_INTERNAL_TRANSFER_ASC',
  IsInternalTransferDesc = 'IS_INTERNAL_TRANSFER_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ToAccountIdAsc = 'TO_ACCOUNT_ID_ASC',
  ToAccountIdDesc = 'TO_ACCOUNT_ID_DESC',
  ToIdentityIdAsc = 'TO_IDENTITY_ID_ASC',
  ToIdentityIdDesc = 'TO_IDENTITY_ID_DESC',
  ToPortfolioIdAsc = 'TO_PORTFOLIO_ID_ASC',
  ToPortfolioIdDesc = 'TO_PORTFOLIO_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AssetsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdentifiersAsc = 'IDENTIFIERS_ASC',
  IdentifiersDesc = 'IDENTIFIERS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsCompliancePausedAsc = 'IS_COMPLIANCE_PAUSED_ASC',
  IsCompliancePausedDesc = 'IS_COMPLIANCE_PAUSED_DESC',
  IsDivisibleAsc = 'IS_DIVISIBLE_ASC',
  IsDivisibleDesc = 'IS_DIVISIBLE_DESC',
  IsFrozenAsc = 'IS_FROZEN_ASC',
  IsFrozenDesc = 'IS_FROZEN_DESC',
  IsNftCollectionAsc = 'IS_NFT_COLLECTION_ASC',
  IsNftCollectionDesc = 'IS_NFT_COLLECTION_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  TotalTransfersAsc = 'TOTAL_TRANSFERS_ASC',
  TotalTransfersDesc = 'TOTAL_TRANSFERS_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AuthTypeEnum {
  AddMultiSigSigner = 'AddMultiSigSigner',
  AddRelayerPayingKey = 'AddRelayerPayingKey',
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  BecomeAgent = 'BecomeAgent',
  Custom = 'Custom',
  JoinIdentity = 'JoinIdentity',
  NoData = 'NoData',
  PortfolioCustody = 'PortfolioCustody',
  RotatePrimaryKey = 'RotatePrimaryKey',
  RotatePrimaryKeyToSecondary = 'RotatePrimaryKeyToSecondary',
  TransferAssetOwnership = 'TransferAssetOwnership',
  TransferPrimaryIssuanceAgent = 'TransferPrimaryIssuanceAgent',
  TransferTicker = 'TransferTicker',
}
export type AuthTypeEnumFilter = {
  distinctFrom?: InputMaybe<AuthTypeEnum>;
  equalTo?: InputMaybe<AuthTypeEnum>;
  greaterThan?: InputMaybe<AuthTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<AuthTypeEnum>;
  in?: InputMaybe<Array<AuthTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AuthTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<AuthTypeEnum>;
  notDistinctFrom?: InputMaybe<AuthTypeEnum>;
  notEqualTo?: InputMaybe<AuthTypeEnum>;
  notIn?: InputMaybe<Array<AuthTypeEnum>>;
};
export type Authorization = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  data?: Maybe<Scalars['String']['output']>;
  expiry?: Maybe<Scalars['Datetime']['output']>;
  from?: Maybe<Identity>;
  fromId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  status: AuthorizationStatusEnum;
  to?: Maybe<Identity>;
  toAccount?: Maybe<Account>;
  toAccountId?: Maybe<Scalars['String']['output']>;
  toId?: Maybe<Scalars['String']['output']>;
  type: AuthTypeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type AuthorizationFilter = {
  and?: InputMaybe<Array<AuthorizationFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  from?: InputMaybe<IdentityFilter>;
  fromId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<AuthorizationFilter>;
  or?: InputMaybe<Array<AuthorizationFilter>>;
  status?: InputMaybe<AuthorizationStatusEnumFilter>;
  to?: InputMaybe<IdentityFilter>;
  toAccount?: InputMaybe<AccountFilter>;
  toAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  toAccountId?: InputMaybe<StringFilter>;
  toExists?: InputMaybe<Scalars['Boolean']['input']>;
  toId?: InputMaybe<StringFilter>;
  type?: InputMaybe<AuthTypeEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum AuthorizationStatusEnum {
  Consumed = 'Consumed',
  Pending = 'Pending',
  Rejected = 'Rejected',
  RetryLimitReached = 'RetryLimitReached',
  Revoked = 'Revoked',
}
export type AuthorizationStatusEnumFilter = {
  distinctFrom?: InputMaybe<AuthorizationStatusEnum>;
  equalTo?: InputMaybe<AuthorizationStatusEnum>;
  greaterThan?: InputMaybe<AuthorizationStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  in?: InputMaybe<Array<AuthorizationStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AuthorizationStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  notDistinctFrom?: InputMaybe<AuthorizationStatusEnum>;
  notEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  notIn?: InputMaybe<Array<AuthorizationStatusEnum>>;
};
export enum AuthorizationsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  ToAccountIdAsc = 'TO_ACCOUNT_ID_ASC',
  ToAccountIdDesc = 'TO_ACCOUNT_ID_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type BigFloatFilter = {
  distinctFrom?: InputMaybe<Scalars['BigFloat']['input']>;
  equalTo?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThan?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['BigFloat']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notIn?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};
export type BigIntFilter = {
  distinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  equalTo?: InputMaybe<Scalars['BigInt']['input']>;
  greaterThan?: InputMaybe<Scalars['BigInt']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['BigInt']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  notIn?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};
export type Block = Node & {
  accountsByEvmAccountMappingCreatedBlockIdAndAccountId: Connection<Account>;
  accountsByEvmAccountMappingUpdatedBlockIdAndAccountId: Connection<Account>;
  accountsByEvmTransactionBlockIdAndFromAccountId: Connection<Account>;
  accountsByIdentityKeyValidFromBlockIdAndAccountId: Connection<Account>;
  accountsByIdentityKeyValidToBlockIdAndAccountId: Connection<Account>;
  blockId: Scalars['Int']['output'];
  blocksByEvmAccountMappingCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByEvmAccountMappingUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByIdentityKeyValidFromBlockIdAndValidToBlockId: Connection<Block>;
  blocksByIdentityKeyValidToBlockIdAndValidFromBlockId: Connection<Block>;
  chainUpgradesByFirstBlockId: Connection<ChainUpgrade>;
  countEvents: Scalars['Int']['output'];
  countExtrinsics: Scalars['Int']['output'];
  countExtrinsicsError: Scalars['Int']['output'];
  countExtrinsicsSigned: Scalars['Int']['output'];
  countExtrinsicsSuccess: Scalars['Int']['output'];
  countExtrinsicsUnsigned: Scalars['Int']['output'];
  datetime: Scalars['Datetime']['output'];
  events: Connection<Event>;
  eventsByIdentityKeyValidFromBlockIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityKeyValidFromBlockIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityKeyValidToBlockIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityKeyValidToBlockIdAndUpdatedEventId: Connection<Event>;
  evmAccountMappingsByCreatedBlockId: Connection<EvmAccountMapping>;
  evmAccountMappingsByUpdatedBlockId: Connection<EvmAccountMapping>;
  evmTransactions: Connection<EvmTransaction>;
  extrinsics: Connection<Extrinsic>;
  extrinsicsByEventBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByEvmTransactionBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsRoot: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identitiesByIdentityKeyValidFromBlockIdAndIdentityId: Connection<Identity>;
  identitiesByIdentityKeyValidToBlockIdAndIdentityId: Connection<Identity>;
  identityKeysByValidFromBlockId: Connection<IdentityKey>;
  identityKeysByValidToBlockId: Connection<IdentityKey>;
  indexerAnomalies: Connection<IndexerAnomaly>;
  nodeId: Scalars['ID']['output'];
  parentHash: Scalars['String']['output'];
  parentId: Scalars['Int']['output'];
  specVersionId: Scalars['Int']['output'];
  stateRoot: Scalars['String']['output'];
};
export type BlockFilter = {
  and?: InputMaybe<Array<BlockFilter>>;
  blockId?: InputMaybe<IntFilter>;
  chainUpgradesByFirstBlockId?: InputMaybe<OneToManyFilter<ChainUpgradeFilter>>;
  countEvents?: InputMaybe<IntFilter>;
  countExtrinsics?: InputMaybe<IntFilter>;
  countExtrinsicsError?: InputMaybe<IntFilter>;
  countExtrinsicsSigned?: InputMaybe<IntFilter>;
  countExtrinsicsSuccess?: InputMaybe<IntFilter>;
  countExtrinsicsUnsigned?: InputMaybe<IntFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  events?: InputMaybe<OneToManyFilter<EventFilter>>;
  evmAccountMappingsByCreatedBlockId?: InputMaybe<OneToManyFilter<EvmAccountMappingFilter>>;
  evmAccountMappingsByUpdatedBlockId?: InputMaybe<OneToManyFilter<EvmAccountMappingFilter>>;
  evmTransactions?: InputMaybe<OneToManyFilter<EvmTransactionFilter>>;
  extrinsics?: InputMaybe<OneToManyFilter<ExtrinsicFilter>>;
  extrinsicsRoot?: InputMaybe<StringFilter>;
  hash?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identityKeysByValidFromBlockId?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  identityKeysByValidToBlockId?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  indexerAnomalies?: InputMaybe<OneToManyFilter<IndexerAnomalyFilter>>;
  not?: InputMaybe<BlockFilter>;
  or?: InputMaybe<Array<BlockFilter>>;
  parentHash?: InputMaybe<StringFilter>;
  parentId?: InputMaybe<IntFilter>;
  specVersionId?: InputMaybe<IntFilter>;
  stateRoot?: InputMaybe<StringFilter>;
};
export enum BlocksOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CountEventsAsc = 'COUNT_EVENTS_ASC',
  CountEventsDesc = 'COUNT_EVENTS_DESC',
  CountExtrinsicsAsc = 'COUNT_EXTRINSICS_ASC',
  CountExtrinsicsDesc = 'COUNT_EXTRINSICS_DESC',
  CountExtrinsicsErrorAsc = 'COUNT_EXTRINSICS_ERROR_ASC',
  CountExtrinsicsErrorDesc = 'COUNT_EXTRINSICS_ERROR_DESC',
  CountExtrinsicsSignedAsc = 'COUNT_EXTRINSICS_SIGNED_ASC',
  CountExtrinsicsSignedDesc = 'COUNT_EXTRINSICS_SIGNED_DESC',
  CountExtrinsicsSuccessAsc = 'COUNT_EXTRINSICS_SUCCESS_ASC',
  CountExtrinsicsSuccessDesc = 'COUNT_EXTRINSICS_SUCCESS_DESC',
  CountExtrinsicsUnsignedAsc = 'COUNT_EXTRINSICS_UNSIGNED_ASC',
  CountExtrinsicsUnsignedDesc = 'COUNT_EXTRINSICS_UNSIGNED_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  ExtrinsicsRootAsc = 'EXTRINSICS_ROOT_ASC',
  ExtrinsicsRootDesc = 'EXTRINSICS_ROOT_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  ParentHashAsc = 'PARENT_HASH_ASC',
  ParentHashDesc = 'PARENT_HASH_DESC',
  ParentIdAsc = 'PARENT_ID_ASC',
  ParentIdDesc = 'PARENT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  StateRootAsc = 'STATE_ROOT_ASC',
  StateRootDesc = 'STATE_ROOT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type BooleanFilter = {
  distinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  equalTo?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThan?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Boolean']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  notEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notIn?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};
export type BridgeEvent = Node & {
  amount: Scalars['BigFloat']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  recipient?: Maybe<Account>;
  recipientId: Scalars['String']['output'];
  txHash: Scalars['String']['output'];
};
export type BridgeEventFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<BridgeEventFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<BridgeEventFilter>;
  or?: InputMaybe<Array<BridgeEventFilter>>;
  recipient?: InputMaybe<AccountFilter>;
  recipientId?: InputMaybe<StringFilter>;
  txHash?: InputMaybe<StringFilter>;
};
export enum BridgeEventsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RecipientIdAsc = 'RECIPIENT_ID_ASC',
  RecipientIdDesc = 'RECIPIENT_ID_DESC',
  TxHashAsc = 'TX_HASH_ASC',
  TxHashDesc = 'TX_HASH_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum CallIdEnum {
  Abdicate = 'abdicate',
  AbdicateMembership = 'abdicate_membership',
  AcceptAssetOwnershipTransfer = 'accept_asset_ownership_transfer',
  AcceptAuthorization = 'accept_authorization',
  AcceptBecomeAgent = 'accept_become_agent',
  AcceptMasterKey = 'accept_master_key',
  AcceptMultisigSigner = 'accept_multisig_signer',
  AcceptMultisigSignerAsIdentity = 'accept_multisig_signer_as_identity',
  AcceptMultisigSignerAsKey = 'accept_multisig_signer_as_key',
  AcceptPayingKey = 'accept_paying_key',
  AcceptPortfolioCustody = 'accept_portfolio_custody',
  AcceptPrimaryIssuanceAgentTransfer = 'accept_primary_issuance_agent_transfer',
  AcceptPrimaryKey = 'accept_primary_key',
  AcceptSubsidy = 'accept_subsidy',
  AcceptTickerTransfer = 'accept_ticker_transfer',
  AddActiveRule = 'add_active_rule',
  AddAdmin = 'add_admin',
  AddAndAffirmInstruction = 'add_and_affirm_instruction',
  AddAndAffirmInstructionWithMemo = 'add_and_affirm_instruction_with_memo',
  AddAndAffirmInstructionWithMemoV2 = 'add_and_affirm_instruction_with_memo_v2',
  AddAndAffirmWithMediators = 'add_and_affirm_with_mediators',
  AddAndAuthorizeInstruction = 'add_and_authorize_instruction',
  AddAuthorization = 'add_authorization',
  AddBallot = 'add_ballot',
  AddClaim = 'add_claim',
  AddComplianceRequirement = 'add_compliance_requirement',
  AddDefaultTrustedClaimIssuer = 'add_default_trusted_claim_issuer',
  AddDocuments = 'add_documents',
  AddExemptedEntities = 'add_exempted_entities',
  AddExtension = 'add_extension',
  AddFreezeAdmin = 'add_freeze_admin',
  AddInstruction = 'add_instruction',
  AddInstructionWithMediators = 'add_instruction_with_mediators',
  AddInstructionWithMemo = 'add_instruction_with_memo',
  AddInstructionWithMemoV2 = 'add_instruction_with_memo_v2',
  AddInvestorUniquenessClaim = 'add_investor_uniqueness_claim',
  AddInvestorUniquenessClaimV2 = 'add_investor_uniqueness_claim_v2',
  AddMandatoryMediators = 'add_mandatory_mediators',
  AddMediatorAccount = 'add_mediator_account',
  AddMember = 'add_member',
  AddMultisigSigner = 'add_multisig_signer',
  AddMultisigSigners = 'add_multisig_signers',
  AddMultisigSignersViaAdmin = 'add_multisig_signers_via_admin',
  AddMultisigSignersViaCreator = 'add_multisig_signers_via_creator',
  AddPermissionedValidator = 'add_permissioned_validator',
  AddRangeProof = 'add_range_proof',
  AddSecondaryKeysWithAuthorization = 'add_secondary_keys_with_authorization',
  AddSecondaryKeysWithAuthorizationOld = 'add_secondary_keys_with_authorization_old',
  AddTransaction = 'add_transaction',
  AddTransferManager = 'add_transfer_manager',
  AddVerifyRangeProof = 'add_verify_range_proof',
  AffirmInstruction = 'affirm_instruction',
  AffirmInstructionAsMediator = 'affirm_instruction_as_mediator',
  AffirmInstructionV2 = 'affirm_instruction_v2',
  AffirmInstructionWithCount = 'affirm_instruction_with_count',
  AffirmTransactions = 'affirm_transactions',
  AffirmWithReceipts = 'affirm_with_receipts',
  AffirmWithReceiptsWithCount = 'affirm_with_receipts_with_count',
  AllowIdentityToCreatePortfolios = 'allow_identity_to_create_portfolios',
  AllowVenues = 'allow_venues',
  AmendProposal = 'amend_proposal',
  ApplyAuthorizedUpgrade = 'apply_authorized_upgrade',
  ApplyIncomingBalance = 'apply_incoming_balance',
  ApplyIncomingBalances = 'apply_incoming_balances',
  Approve = 'approve',
  ApproveAsIdentity = 'approve_as_identity',
  ApproveAsKey = 'approve_as_key',
  ApproveCommitteeProposal = 'approve_committee_proposal',
  ApproveJoinIdentity = 'approve_join_identity',
  ApproveSubsidy = 'approve_subsidy',
  ArchiveExtension = 'archive_extension',
  AsDerivative = 'as_derivative',
  AttachBallot = 'attach_ballot',
  AuthorizeInstruction = 'authorize_instruction',
  AuthorizeUpgrade = 'authorize_upgrade',
  AuthorizeUpgradeWithoutChecks = 'authorize_upgrade_without_checks',
  AuthorizeWithReceipts = 'authorize_with_receipts',
  Batch = 'batch',
  BatchAcceptAuthorization = 'batch_accept_authorization',
  BatchAddAuthorization = 'batch_add_authorization',
  BatchAddClaim = 'batch_add_claim',
  BatchAddDefaultTrustedClaimIssuer = 'batch_add_default_trusted_claim_issuer',
  BatchAddDocument = 'batch_add_document',
  BatchAddSecondaryKeyWithAuthorization = 'batch_add_secondary_key_with_authorization',
  BatchAddSigningKeyWithAuthorization = 'batch_add_signing_key_with_authorization',
  BatchAll = 'batch_all',
  BatchAtomic = 'batch_atomic',
  BatchChangeAssetRule = 'batch_change_asset_rule',
  BatchChangeComplianceRequirement = 'batch_change_compliance_requirement',
  BatchForceHandleBridgeTx = 'batch_force_handle_bridge_tx',
  BatchFreezeTx = 'batch_freeze_tx',
  BatchHandleBridgeTx = 'batch_handle_bridge_tx',
  BatchIssue = 'batch_issue',
  BatchOld = 'batch_old',
  BatchOptimistic = 'batch_optimistic',
  BatchProposeBridgeTx = 'batch_propose_bridge_tx',
  BatchRemoveAuthorization = 'batch_remove_authorization',
  BatchRemoveDefaultTrustedClaimIssuer = 'batch_remove_default_trusted_claim_issuer',
  BatchRemoveDocument = 'batch_remove_document',
  BatchRevokeClaim = 'batch_revoke_claim',
  BatchUnfreezeTx = 'batch_unfreeze_tx',
  BatchUpdateAssetStats = 'batch_update_asset_stats',
  BatchedSettlement = 'batched_settlement',
  Bond = 'bond',
  BondAdditionalDeposit = 'bond_additional_deposit',
  BondExtra = 'bond_extra',
  Burn = 'burn',
  BurnAccountBalance = 'burn_account_balance',
  BuyTokens = 'buy_tokens',
  Call = 'call',
  CallOldWeight = 'call_old_weight',
  Cancel = 'cancel',
  CancelBallot = 'cancel_ballot',
  CancelDeferredSlash = 'cancel_deferred_slash',
  CancelNamed = 'cancel_named',
  CancelProposal = 'cancel_proposal',
  CancelRetry = 'cancel_retry',
  CancelRetryNamed = 'cancel_retry_named',
  CddRegisterDid = 'cdd_register_did',
  CddRegisterDidWithCdd = 'cdd_register_did_with_cdd',
  ChangeAdmin = 'change_admin',
  ChangeAllSignersAndSigsRequired = 'change_all_signers_and_sigs_required',
  ChangeAssetRule = 'change_asset_rule',
  ChangeBaseFee = 'change_base_fee',
  ChangeBridgeExempted = 'change_bridge_exempted',
  ChangeBridgeLimit = 'change_bridge_limit',
  ChangeCddRequirementForMkRotation = 'change_cdd_requirement_for_mk_rotation',
  ChangeCoefficient = 'change_coefficient',
  ChangeComplianceRequirement = 'change_compliance_requirement',
  ChangeController = 'change_controller',
  ChangeEnd = 'change_end',
  ChangeGroup = 'change_group',
  ChangeMeta = 'change_meta',
  ChangeRcv = 'change_rcv',
  ChangeReceiptValidity = 'change_receipt_validity',
  ChangeRecordDate = 'change_record_date',
  ChangeSigsRequired = 'change_sigs_required',
  ChangeSigsRequiredViaAdmin = 'change_sigs_required_via_admin',
  ChangeSigsRequiredViaCreator = 'change_sigs_required_via_creator',
  ChangeSlashingAllowedFor = 'change_slashing_allowed_for',
  ChangeTemplateFees = 'change_template_fees',
  ChangeTemplateMetaUrl = 'change_template_meta_url',
  ChangeTimelock = 'change_timelock',
  Chill = 'chill',
  ChillFromGovernance = 'chill_from_governance',
  ChillOther = 'chill_other',
  Claim = 'claim',
  ClaimClassicTicker = 'claim_classic_ticker',
  ClaimItnReward = 'claim_itn_reward',
  ClaimReceipt = 'claim_receipt',
  ClaimSurcharge = 'claim_surcharge',
  ClaimUnclaimed = 'claim_unclaimed',
  ClearHistoric = 'clear_historic',
  ClearSnapshot = 'clear_snapshot',
  Close = 'close',
  ContinueMigrate = 'continue_migrate',
  ControlAutoMigration = 'control_auto_migration',
  ControllerRedeem = 'controller_redeem',
  ControllerTransfer = 'controller_transfer',
  ControllerTransferTo = 'controller_transfer_to',
  CreateAccount = 'create_account',
  CreateAndChangeCustomGroup = 'create_and_change_custom_group',
  CreateAsset = 'create_asset',
  CreateAssetAndMint = 'create_asset_and_mint',
  CreateAssetWithCustomType = 'create_asset_with_custom_type',
  CreateCheckpoint = 'create_checkpoint',
  CreateChildIdentities = 'create_child_identities',
  CreateChildIdentity = 'create_child_identity',
  CreateCustodyPortfolio = 'create_custody_portfolio',
  CreateFundraiser = 'create_fundraiser',
  CreateGroup = 'create_group',
  CreateGroupAndAddAuth = 'create_group_and_add_auth',
  CreateMultisig = 'create_multisig',
  CreateNftCollection = 'create_nft_collection',
  CreateOrApproveProposalAsIdentity = 'create_or_approve_proposal_as_identity',
  CreateOrApproveProposalAsKey = 'create_or_approve_proposal_as_key',
  CreatePortfolio = 'create_portfolio',
  CreateProposal = 'create_proposal',
  CreateProposalAsIdentity = 'create_proposal_as_identity',
  CreateProposalAsKey = 'create_proposal_as_key',
  CreateSchedule = 'create_schedule',
  CreateSettlement = 'create_settlement',
  CreateVenue = 'create_venue',
  DecreasePolyxLimit = 'decrease_polyx_limit',
  DeletePortfolio = 'delete_portfolio',
  DepositBlockRewardReserveBalance = 'deposit_block_reward_reserve_balance',
  DeprecateControllerBatch = 'deprecate_controller_batch',
  DisableMember = 'disable_member',
  DisallowVenues = 'disallow_venues',
  Disbursement = 'disbursement',
  DispatchAs = 'dispatch_as',
  DispatchAsFallbackAccount = 'dispatch_as_fallback_account',
  Distribute = 'distribute',
  EmergencyReferendum = 'emergency_referendum',
  EnableIndividualCommissions = 'enable_individual_commissions',
  EnableOffchainFunding = 'enable_offchain_funding',
  EnactReferendum = 'enact_referendum',
  EnactSnapshotResults = 'enact_snapshot_results',
  EnsureUpdated = 'ensure_updated',
  EthCall = 'eth_call',
  EthInstantiateWithCode = 'eth_instantiate_with_code',
  EthSubstrateCall = 'eth_substrate_call',
  EthTransact = 'eth_transact',
  ExecuteInstantSettlement = 'execute_instant_settlement',
  ExecuteManualInstruction = 'execute_manual_instruction',
  ExecuteScheduledInstruction = 'execute_scheduled_instruction',
  ExecuteScheduledInstructionV2 = 'execute_scheduled_instruction_v2',
  ExecuteScheduledInstructionV3 = 'execute_scheduled_instruction_v3',
  ExecuteScheduledPip = 'execute_scheduled_pip',
  ExecuteScheduledProposal = 'execute_scheduled_proposal',
  ExecuteTransaction = 'execute_transaction',
  ExemptAssetAffirmation = 'exempt_asset_affirmation',
  ExemptTickerAffirmation = 'exempt_ticker_affirmation',
  ExpireScheduledPip = 'expire_scheduled_pip',
  FastTrackProposal = 'fast_track_proposal',
  FillBlock = 'fill_block',
  FinalHint = 'final_hint',
  ForceAdjustTotalIssuance = 'force_adjust_total_issuance',
  ForceApplyMinCommission = 'force_apply_min_commission',
  ForceBatch = 'force_batch',
  ForceHandleBridgeTx = 'force_handle_bridge_tx',
  ForceNewEra = 'force_new_era',
  ForceNewEraAlways = 'force_new_era_always',
  ForceNoEras = 'force_no_eras',
  ForceOnboardMbms = 'force_onboard_mbms',
  ForceSetActiveCursor = 'force_set_active_cursor',
  ForceSetBalance = 'force_set_balance',
  ForceSetCursor = 'force_set_cursor',
  ForceSetProgress = 'force_set_progress',
  ForceTransfer = 'force_transfer',
  ForceUnreserve = 'force_unreserve',
  ForceUnstake = 'force_unstake',
  ForwardedCall = 'forwarded_call',
  Free = 'free',
  Freeze = 'freeze',
  FreezeFundraiser = 'freeze_fundraiser',
  FreezeInstantiation = 'freeze_instantiation',
  FreezePartialTokens = 'freeze_partial_tokens',
  FreezeSecondaryKeys = 'freeze_secondary_keys',
  FreezeSigningKeys = 'freeze_signing_keys',
  FreezeTxs = 'freeze_txs',
  GcAddCddClaim = 'gc_add_cdd_claim',
  GcRevokeCddClaim = 'gc_revoke_cdd_claim',
  GetCddOf = 'get_cdd_of',
  GetMyDid = 'get_my_did',
  GovernanceFallback = 'governance_fallback',
  HandleBridgeTx = 'handle_bridge_tx',
  HandleScheduledBridgeTx = 'handle_scheduled_bridge_tx',
  Heartbeat = 'heartbeat',
  IncreaseCustodyAllowance = 'increase_custody_allowance',
  IncreaseCustodyAllowanceOf = 'increase_custody_allowance_of',
  IncreasePolyxLimit = 'increase_polyx_limit',
  IncreaseValidatorCount = 'increase_validator_count',
  InitiateCorporateAction = 'initiate_corporate_action',
  InitiateCorporateActionAndBallot = 'initiate_corporate_action_and_ballot',
  InitiateCorporateActionAndDistribute = 'initiate_corporate_action_and_distribute',
  InstantReceiverAffirmation = 'instant_receiver_affirmation',
  InstantSenderAffirmation = 'instant_sender_affirmation',
  Instantiate = 'instantiate',
  InstantiateOldWeight = 'instantiate_old_weight',
  InstantiateWithCode = 'instantiate_with_code',
  InstantiateWithCodeAsPrimaryKey = 'instantiate_with_code_as_primary_key',
  InstantiateWithCodeOldWeight = 'instantiate_with_code_old_weight',
  InstantiateWithCodePerms = 'instantiate_with_code_perms',
  InstantiateWithHashAsPrimaryKey = 'instantiate_with_hash_as_primary_key',
  InstantiateWithHashPerms = 'instantiate_with_hash_perms',
  InvalidateCddClaims = 'invalidate_cdd_claims',
  Invest = 'invest',
  IsIssuable = 'is_issuable',
  Issue = 'issue',
  IssueNft = 'issue_nft',
  JoinIdentity = 'join_identity',
  JoinIdentityAsIdentity = 'join_identity_as_identity',
  JoinIdentityAsKey = 'join_identity_as_key',
  Kick = 'kick',
  KillPrefix = 'kill_prefix',
  KillProposal = 'kill_proposal',
  KillStorage = 'kill_storage',
  LaunchSto = 'launch_sto',
  LeaveIdentityAsIdentity = 'leave_identity_as_identity',
  LeaveIdentityAsKey = 'leave_identity_as_key',
  LegacySetPermissionToSigner = 'legacy_set_permission_to_signer',
  LinkCaDoc = 'link_ca_doc',
  LinkTickerToAssetId = 'link_ticker_to_asset_id',
  LockInstruction = 'lock_instruction',
  MakeDivisible = 'make_divisible',
  MakeMultisigPrimary = 'make_multisig_primary',
  MakeMultisigSecondary = 'make_multisig_secondary',
  MakeMultisigSigner = 'make_multisig_signer',
  ManualSlash = 'manual_slash',
  MapAccount = 'map_account',
  MediatorAffirmTransaction = 'mediator_affirm_transaction',
  MediatorAffirmation = 'mediator_affirmation',
  MediatorUnaffirmTransaction = 'mediator_unaffirm_transaction',
  Migrate = 'migrate',
  MigrateCurrency = 'migrate_currency',
  MigrateCustomChild = 'migrate_custom_child',
  MigrateCustomTop = 'migrate_custom_top',
  Mint = 'mint',
  MintAsset = 'mint_asset',
  MockCddRegisterDid = 'mock_cdd_register_did',
  ModifyExemptionList = 'modify_exemption_list',
  ModifyFundraiserWindow = 'modify_fundraiser_window',
  MoveAssets = 'move_assets',
  MovePortfolioFunds = 'move_portfolio_funds',
  MovePortfolioFundsV2 = 'move_portfolio_funds_v2',
  New = 'new',
  Nominate = 'nominate',
  NotePreimage = 'note_preimage',
  NoteStalled = 'note_stalled',
  OverrideReferendumEnactmentPeriod = 'override_referendum_enactment_period',
  PauseAssetCompliance = 'pause_asset_compliance',
  PauseAssetRules = 'pause_asset_rules',
  PauseSto = 'pause_sto',
  PayoutStakers = 'payout_stakers',
  PayoutStakersByPage = 'payout_stakers_by_page',
  PayoutStakersBySystem = 'payout_stakers_by_system',
  PlaceholderAddAndAffirmInstruction = 'placeholder_add_and_affirm_instruction',
  PlaceholderAddAndAffirmInstructionWithMemo = 'placeholder_add_and_affirm_instruction_with_memo',
  PlaceholderAddInstruction = 'placeholder_add_instruction',
  PlaceholderAddInstructionWithMemo = 'placeholder_add_instruction_with_memo',
  PlaceholderAffirmInstruction = 'placeholder_affirm_instruction',
  PlaceholderClaimReceipt = 'placeholder_claim_receipt',
  PlaceholderFillBlock = 'placeholder_fill_block',
  PlaceholderLegacySetPermissionToSigner = 'placeholder_legacy_set_permission_to_signer',
  PlaceholderRejectInstruction = 'placeholder_reject_instruction',
  PlaceholderUnclaimReceipt = 'placeholder_unclaim_receipt',
  PlaceholderWithdrawAffirmation = 'placeholder_withdraw_affirmation',
  PlanConfigChange = 'plan_config_change',
  PokeDeposit = 'poke_deposit',
  PreApproveAsset = 'pre_approve_asset',
  PreApprovePortfolio = 'pre_approve_portfolio',
  PreApproveTicker = 'pre_approve_ticker',
  Propose = 'propose',
  ProposeBridgeTx = 'propose_bridge_tx',
  PruneProposal = 'prune_proposal',
  PurgeKeys = 'purge_keys',
  PushBenefit = 'push_benefit',
  PutCode = 'put_code',
  QuitPortfolioCustody = 'quit_portfolio_custody',
  ReapStash = 'reap_stash',
  Rebond = 'rebond',
  ReceiverAffirmAssetTransfer = 'receiver_affirm_asset_transfer',
  ReceiverAffirmTransaction = 'receiver_affirm_transaction',
  ReceiverAffirmation = 'receiver_affirmation',
  ReceiverClaim = 'receiver_claim',
  ReceiverRevertAffirmation = 'receiver_revert_affirmation',
  ReceiverUnaffirmTransaction = 'receiver_unaffirm_transaction',
  Reclaim = 'reclaim',
  Redeem = 'redeem',
  RedeemFrom = 'redeem_from',
  RedeemFromPortfolio = 'redeem_from_portfolio',
  RedeemNft = 'redeem_nft',
  RegisterAccountAssets = 'register_account_assets',
  RegisterAccounts = 'register_accounts',
  RegisterAndSetLocalAssetMetadata = 'register_and_set_local_asset_metadata',
  RegisterAssetMetadataGlobalType = 'register_asset_metadata_global_type',
  RegisterAssetMetadataLocalType = 'register_asset_metadata_local_type',
  RegisterCustomAssetType = 'register_custom_asset_type',
  RegisterCustomClaimType = 'register_custom_claim_type',
  RegisterDid = 'register_did',
  RegisterEncryptionKeys = 'register_encryption_keys',
  RegisterFeeAccounts = 'register_fee_accounts',
  RegisterTicker = 'register_ticker',
  RegisterUniqueTicker = 'register_unique_ticker',
  Reimbursement = 'reimbursement',
  Reject = 'reject',
  RejectAsIdentity = 'reject_as_identity',
  RejectAsKey = 'reject_as_key',
  RejectAssetTransfer = 'reject_asset_transfer',
  RejectInstruction = 'reject_instruction',
  RejectInstructionAsMediator = 'reject_instruction_as_mediator',
  RejectInstructionV2 = 'reject_instruction_v2',
  RejectInstructionWithCount = 'reject_instruction_with_count',
  RejectProposal = 'reject_proposal',
  RejectReferendum = 'reject_referendum',
  RejectTransaction = 'reject_transaction',
  RelayTx = 'relay_tx',
  RelayerSubmitBatchedProofs = 'relayer_submit_batched_proofs',
  Remark = 'remark',
  RemarkWithEvent = 'remark_with_event',
  RemoveActiveRule = 'remove_active_rule',
  RemoveAdmin = 'remove_admin',
  RemoveAdminViaAdmin = 'remove_admin_via_admin',
  RemoveAgent = 'remove_agent',
  RemoveAssetAffirmationExemption = 'remove_asset_affirmation_exemption',
  RemoveAssetPreApproval = 'remove_asset_pre_approval',
  RemoveAuthorization = 'remove_authorization',
  RemoveBallot = 'remove_ballot',
  RemoveCa = 'remove_ca',
  RemoveCode = 'remove_code',
  RemoveComplianceRequirement = 'remove_compliance_requirement',
  RemoveCreatorControls = 'remove_creator_controls',
  RemoveDefaultTrustedClaimIssuer = 'remove_default_trusted_claim_issuer',
  RemoveDistribution = 'remove_distribution',
  RemoveDocuments = 'remove_documents',
  RemoveExemptedEntities = 'remove_exempted_entities',
  RemoveFreezeAdmin = 'remove_freeze_admin',
  RemoveKey = 'remove_key',
  RemoveLocalMetadataKey = 'remove_local_metadata_key',
  RemoveMandatoryMediators = 'remove_mandatory_mediators',
  RemoveMember = 'remove_member',
  RemoveMetadataValue = 'remove_metadata_value',
  RemoveMultisigSigner = 'remove_multisig_signer',
  RemoveMultisigSigners = 'remove_multisig_signers',
  RemoveMultisigSignersViaAdmin = 'remove_multisig_signers_via_admin',
  RemoveMultisigSignersViaCreator = 'remove_multisig_signers_via_creator',
  RemovePayer = 'remove_payer',
  RemovePayerViaPayer = 'remove_payer_via_payer',
  RemovePayingKey = 'remove_paying_key',
  RemovePermissionedValidator = 'remove_permissioned_validator',
  RemovePortfolioPreApproval = 'remove_portfolio_pre_approval',
  RemovePrimaryIssuanceAgent = 'remove_primary_issuance_agent',
  RemoveSchedule = 'remove_schedule',
  RemoveSecondaryKeys = 'remove_secondary_keys',
  RemoveSecondaryKeysOld = 'remove_secondary_keys_old',
  RemoveSigningKeys = 'remove_signing_keys',
  RemoveSmartExtension = 'remove_smart_extension',
  RemoveSubsidy = 'remove_subsidy',
  RemoveTickerAffirmationExemption = 'remove_ticker_affirmation_exemption',
  RemoveTickerPreApproval = 'remove_ticker_pre_approval',
  RemoveTransferManager = 'remove_transfer_manager',
  RemoveTxs = 'remove_txs',
  RenameAsset = 'rename_asset',
  RenamePortfolio = 'rename_portfolio',
  ReplaceAssetCompliance = 'replace_asset_compliance',
  ReplaceAssetRules = 'replace_asset_rules',
  ReportDoubleVoting = 'report_double_voting',
  ReportDoubleVotingUnsigned = 'report_double_voting_unsigned',
  ReportEquivocation = 'report_equivocation',
  ReportEquivocationUnsigned = 'report_equivocation_unsigned',
  ReportForkVoting = 'report_fork_voting',
  ReportForkVotingUnsigned = 'report_fork_voting_unsigned',
  ReportFutureBlockVoting = 'report_future_block_voting',
  ReportFutureBlockVotingUnsigned = 'report_future_block_voting_unsigned',
  RequestPreimage = 'request_preimage',
  RescheduleExecution = 'reschedule_execution',
  RescheduleInstruction = 'reschedule_instruction',
  ReserveClassicTicker = 'reserve_classic_ticker',
  ResetActiveRules = 'reset_active_rules',
  ResetAssetCompliance = 'reset_asset_compliance',
  ResetCaa = 'reset_caa',
  ResetMembers = 'reset_members',
  RestoreLedger = 'restore_ledger',
  ResumeAssetCompliance = 'resume_asset_compliance',
  ResumeAssetRules = 'resume_asset_rules',
  RevokeClaim = 'revoke_claim',
  RevokeClaimByIndex = 'revoke_claim_by_index',
  RevokeCreatePortfoliosPermission = 'revoke_create_portfolios_permission',
  RevokeOffchainAuthorization = 'revoke_offchain_authorization',
  RevokeSubsidy = 'revoke_subsidy',
  RotatePrimaryKeyToSecondary = 'rotate_primary_key_to_secondary',
  ScaleValidatorCount = 'scale_validator_count',
  Schedule = 'schedule',
  ScheduleAfter = 'schedule_after',
  ScheduleNamed = 'schedule_named',
  ScheduleNamedAfter = 'schedule_named_after',
  SelfRegisterDid = 'self_register_did',
  SenderAffirmTransaction = 'sender_affirm_transaction',
  SenderAffirmation = 'sender_affirmation',
  SenderRevertAffirmation = 'sender_revert_affirmation',
  SenderUnaffirmTransaction = 'sender_unaffirm_transaction',
  SenderUpdateCounter = 'sender_update_counter',
  Set = 'set',
  SetAccountAssetFrozen = 'set_account_asset_frozen',
  SetActiveAssetStats = 'set_active_asset_stats',
  SetActiveMembersLimit = 'set_active_members_limit',
  SetActivePipLimit = 'set_active_pip_limit',
  SetApprovalForAll = 'set_approval_for_all',
  SetAssetFrozen = 'set_asset_frozen',
  SetAssetMetadata = 'set_asset_metadata',
  SetAssetMetadataDetails = 'set_asset_metadata_details',
  SetAssetTransferCompliance = 'set_asset_transfer_compliance',
  SetBalance = 'set_balance',
  SetChangesTrieConfig = 'set_changes_trie_config',
  SetCode = 'set_code',
  SetCodeWithoutChecks = 'set_code_without_checks',
  SetCommissionCap = 'set_commission_cap',
  SetController = 'set_controller',
  SetDefaultEnactmentPeriod = 'set_default_enactment_period',
  SetDefaultTargets = 'set_default_targets',
  SetDefaultWithholdingTax = 'set_default_withholding_tax',
  SetDidWithholdingTax = 'set_did_withholding_tax',
  SetDisableFees = 'set_disable_fees',
  SetEmergencyElectionResult = 'set_emergency_election_result',
  SetEntitiesExempt = 'set_entities_exempt',
  SetExpiresAfter = 'set_expires_after',
  SetFrozenTokens = 'set_frozen_tokens',
  SetFundingRound = 'set_funding_round',
  SetGlobalCommission = 'set_global_commission',
  SetGroupPermissions = 'set_group_permissions',
  SetHeapPages = 'set_heap_pages',
  SetHistoryDepth = 'set_history_depth',
  SetHolderFrozen = 'set_holder_frozen',
  SetInvulnerables = 'set_invulnerables',
  SetItnRewardStatus = 'set_itn_reward_status',
  SetKey = 'set_key',
  SetKeys = 'set_keys',
  SetMandatoryReceiverAffirmation = 'set_mandatory_receiver_affirmation',
  SetMasterKey = 'set_master_key',
  SetMaxDetailsLength = 'set_max_details_length',
  SetMaxPipSkipCount = 'set_max_pip_skip_count',
  SetMinBondThreshold = 'set_min_bond_threshold',
  SetMinCommission = 'set_min_commission',
  SetMinProposalDeposit = 'set_min_proposal_deposit',
  SetMinimumUntrustedScore = 'set_minimum_untrusted_score',
  SetNewGenesis = 'set_new_genesis',
  SetPayee = 'set_payee',
  SetPayingKey = 'set_paying_key',
  SetPendingPipExpiry = 'set_pending_pip_expiry',
  SetPermissionToSigner = 'set_permission_to_signer',
  SetPrimaryKey = 'set_primary_key',
  SetProposalCoolOffPeriod = 'set_proposal_cool_off_period',
  SetProposalDuration = 'set_proposal_duration',
  SetPruneHistoricalPips = 'set_prune_historical_pips',
  SetReleaseCoordinator = 'set_release_coordinator',
  SetRetry = 'set_retry',
  SetRetryNamed = 'set_retry_named',
  SetSchedulesMaxComplexity = 'set_schedules_max_complexity',
  SetSecondaryKeyPermissions = 'set_secondary_key_permissions',
  SetSignedMaxLimits = 'set_signed_max_limits',
  SetStakingConfigs = 'set_staking_configs',
  SetStorage = 'set_storage',
  SetUncles = 'set_uncles',
  SetValidatorCount = 'set_validator_count',
  SetVenueFiltering = 'set_venue_filtering',
  SetVoteThreshold = 'set_vote_threshold',
  Snapshot = 'snapshot',
  Stop = 'stop',
  Submit = 'submit',
  SubmitBatchedProofs = 'submit_batched_proofs',
  SubmitElectionSolution = 'submit_election_solution',
  SubmitElectionSolutionUnsigned = 'submit_election_solution_unsigned',
  SubmitUnsigned = 'submit_unsigned',
  Sudo = 'sudo',
  SudoAs = 'sudo_as',
  SudoUncheckedWeight = 'sudo_unchecked_weight',
  SwapMember = 'swap_member',
  TopupFeeAccounts = 'topup_fee_accounts',
  Transfer = 'transfer',
  TransferAll = 'transfer_all',
  TransferAllowDeath = 'transfer_allow_death',
  TransferAsset = 'transfer_asset',
  TransferFunds = 'transfer_funds',
  TransferKeepAlive = 'transfer_keep_alive',
  TransferNft = 'transfer_nft',
  TransferWithMemo = 'transfer_with_memo',
  Unbond = 'unbond',
  UnclaimReceipt = 'unclaim_receipt',
  Unfreeze = 'unfreeze',
  UnfreezeFundraiser = 'unfreeze_fundraiser',
  UnfreezePartialTokens = 'unfreeze_partial_tokens',
  UnfreezeSecondaryKeys = 'unfreeze_secondary_keys',
  UnfreezeTxs = 'unfreeze_txs',
  Unknown = 'unknown',
  UnlinkChildIdentity = 'unlink_child_identity',
  UnlinkTickerFromAssetId = 'unlink_ticker_from_asset_id',
  UnlockInstruction = 'unlock_instruction',
  UnmapAccount = 'unmap_account',
  UnnotePreimage = 'unnote_preimage',
  UnrequestPreimage = 'unrequest_preimage',
  UpdateAssetType = 'update_asset_type',
  UpdateCallRuntimeWhitelist = 'update_call_runtime_whitelist',
  UpdateGlobalMetadataSpec = 'update_global_metadata_spec',
  UpdateIdentifiers = 'update_identifiers',
  UpdatePayee = 'update_payee',
  UpdatePermissionedValidatorIntendedCount = 'update_permissioned_validator_intended_count',
  UpdatePolyxLimit = 'update_polyx_limit',
  UpdateVenueDetails = 'update_venue_details',
  UpdateVenueSigners = 'update_venue_signers',
  UpdateVenueType = 'update_venue_type',
  UpgradeAccounts = 'upgrade_accounts',
  UpgradeApi = 'upgrade_api',
  UploadCode = 'upload_code',
  Validate = 'validate',
  ValidateCddExpiryNominators = 'validate_cdd_expiry_nominators',
  Vote = 'vote',
  VoteOrPropose = 'vote_or_propose',
  WithWeight = 'with_weight',
  WithdrawAffirmation = 'withdraw_affirmation',
  WithdrawAffirmationAsMediator = 'withdraw_affirmation_as_mediator',
  WithdrawAffirmationV2 = 'withdraw_affirmation_v2',
  WithdrawAffirmationWithCount = 'withdraw_affirmation_with_count',
  WithdrawUnbonded = 'withdraw_unbonded',
}
export type CallIdEnumFilter = {
  distinctFrom?: InputMaybe<CallIdEnum>;
  equalTo?: InputMaybe<CallIdEnum>;
  greaterThan?: InputMaybe<CallIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<CallIdEnum>;
  in?: InputMaybe<Array<CallIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<CallIdEnum>;
  lessThanOrEqualTo?: InputMaybe<CallIdEnum>;
  notDistinctFrom?: InputMaybe<CallIdEnum>;
  notEqualTo?: InputMaybe<CallIdEnum>;
  notIn?: InputMaybe<Array<CallIdEnum>>;
};
export type ChainUpgrade = Node & {
  firstBlock?: Maybe<Block>;
  firstBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  specVersionId: Scalars['Int']['output'];
  transactionVersion: Scalars['Int']['output'];
};
export type ChainUpgradeFilter = {
  and?: InputMaybe<Array<ChainUpgradeFilter>>;
  firstBlock?: InputMaybe<BlockFilter>;
  firstBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ChainUpgradeFilter>;
  or?: InputMaybe<Array<ChainUpgradeFilter>>;
  specVersionId?: InputMaybe<IntFilter>;
  transactionVersion?: InputMaybe<IntFilter>;
};
export enum ChainUpgradesOrderBy {
  FirstBlockIdAsc = 'FIRST_BLOCK_ID_ASC',
  FirstBlockIdDesc = 'FIRST_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  TransactionVersionAsc = 'TRANSACTION_VERSION_ASC',
  TransactionVersionDesc = 'TRANSACTION_VERSION_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Checkpoint = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByCorporateActionCheckpointIdAndAssetId: Connection<Asset>;
  checkpointId: Scalars['Int']['output'];
  corporateActions: Connection<CorporateAction>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventsByCorporateActionCheckpointIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateActionCheckpointIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  schedule?: Maybe<CheckpointSchedule>;
  scheduleId?: Maybe<Scalars['String']['output']>;
  totalSupply: Scalars['BigFloat']['output'];
};
export type CheckpointFilter = {
  and?: InputMaybe<Array<CheckpointFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  checkpointId?: InputMaybe<IntFilter>;
  corporateActions?: InputMaybe<OneToManyFilter<CorporateActionFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<CheckpointFilter>;
  or?: InputMaybe<Array<CheckpointFilter>>;
  schedule?: InputMaybe<CheckpointScheduleFilter>;
  scheduleExists?: InputMaybe<Scalars['Boolean']['input']>;
  scheduleId?: InputMaybe<StringFilter>;
  totalSupply?: InputMaybe<BigFloatFilter>;
};
export type CheckpointSchedule = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByCheckpointScheduleIdAndAssetId: Connection<Asset>;
  checkpoints: Connection<Checkpoint>;
  completedEvent?: Maybe<Event>;
  completedEventId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByCheckpointScheduleIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  nextCheckpointAt?: Maybe<Scalars['Datetime']['output']>;
  nodeId: Scalars['ID']['output'];
  period?: Maybe<Scalars['String']['output']>;
  remaining?: Maybe<Scalars['Int']['output']>;
  removedEvent?: Maybe<Event>;
  removedEventId?: Maybe<Scalars['String']['output']>;
  scheduleId: Scalars['Int']['output'];
  scheduledCheckpoints?: Maybe<Scalars['JSON']['output']>;
  start?: Maybe<Scalars['Datetime']['output']>;
};
export type CheckpointScheduleFilter = {
  and?: InputMaybe<Array<CheckpointScheduleFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  checkpoints?: InputMaybe<OneToManyFilter<CheckpointFilter>>;
  completedEvent?: InputMaybe<EventFilter>;
  completedEventExists?: InputMaybe<Scalars['Boolean']['input']>;
  completedEventId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  nextCheckpointAt?: InputMaybe<DatetimeFilter>;
  not?: InputMaybe<CheckpointScheduleFilter>;
  or?: InputMaybe<Array<CheckpointScheduleFilter>>;
  period?: InputMaybe<StringFilter>;
  remaining?: InputMaybe<IntFilter>;
  removedEvent?: InputMaybe<EventFilter>;
  removedEventExists?: InputMaybe<Scalars['Boolean']['input']>;
  removedEventId?: InputMaybe<StringFilter>;
  scheduleId?: InputMaybe<IntFilter>;
  scheduledCheckpoints?: InputMaybe<JsonFilter>;
  start?: InputMaybe<DatetimeFilter>;
};
export enum CheckpointSchedulesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CompletedEventIdAsc = 'COMPLETED_EVENT_ID_ASC',
  CompletedEventIdDesc = 'COMPLETED_EVENT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NextCheckpointAtAsc = 'NEXT_CHECKPOINT_AT_ASC',
  NextCheckpointAtDesc = 'NEXT_CHECKPOINT_AT_DESC',
  PeriodAsc = 'PERIOD_ASC',
  PeriodDesc = 'PERIOD_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemainingAsc = 'REMAINING_ASC',
  RemainingDesc = 'REMAINING_DESC',
  RemovedEventIdAsc = 'REMOVED_EVENT_ID_ASC',
  RemovedEventIdDesc = 'REMOVED_EVENT_ID_DESC',
  ScheduledCheckpointsAsc = 'SCHEDULED_CHECKPOINTS_ASC',
  ScheduledCheckpointsDesc = 'SCHEDULED_CHECKPOINTS_DESC',
  ScheduleIdAsc = 'SCHEDULE_ID_ASC',
  ScheduleIdDesc = 'SCHEDULE_ID_DESC',
  StartAsc = 'START_ASC',
  StartDesc = 'START_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum CheckpointsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CheckpointIdAsc = 'CHECKPOINT_ID_ASC',
  CheckpointIdDesc = 'CHECKPOINT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScheduleIdAsc = 'SCHEDULE_ID_ASC',
  ScheduleIdDesc = 'SCHEDULE_ID_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Claim = Node & {
  cddId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeId?: Maybe<Scalars['String']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry: Scalars['BigFloat']['output'];
  id: Scalars['String']['output'];
  issuanceDate: Scalars['BigFloat']['output'];
  issuer?: Maybe<Identity>;
  issuerId: Scalars['String']['output'];
  jurisdiction?: Maybe<Scalars['String']['output']>;
  lastUpdateDate: Scalars['BigFloat']['output'];
  nodeId: Scalars['ID']['output'];
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
  scope?: Maybe<Scalars['JSON']['output']>;
  target?: Maybe<Identity>;
  targetId: Scalars['String']['output'];
  type: ClaimTypeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ClaimAggregates = {
  average?: Maybe<ClaimAverageAggregates>;
  distinctCount?: Maybe<ClaimDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']['output']>>;
  max?: Maybe<ClaimMaxAggregates>;
  min?: Maybe<ClaimMinAggregates>;
  stddevPopulation?: Maybe<ClaimStddevPopulationAggregates>;
  stddevSample?: Maybe<ClaimStddevSampleAggregates>;
  sum?: Maybe<ClaimSumAggregates>;
  variancePopulation?: Maybe<ClaimVariancePopulationAggregates>;
  varianceSample?: Maybe<ClaimVarianceSampleAggregates>;
};
export type ClaimAverageAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimDistinctCountAggregates = {
  _blockRange?: Maybe<Scalars['BigInt']['output']>;
  _id?: Maybe<Scalars['BigInt']['output']>;
  cddId?: Maybe<Scalars['BigInt']['output']>;
  createdEventId?: Maybe<Scalars['BigInt']['output']>;
  customClaimTypeId?: Maybe<Scalars['BigInt']['output']>;
  expiry?: Maybe<Scalars['BigInt']['output']>;
  filterExpiry?: Maybe<Scalars['BigInt']['output']>;
  id?: Maybe<Scalars['BigInt']['output']>;
  issuanceDate?: Maybe<Scalars['BigInt']['output']>;
  issuerId?: Maybe<Scalars['BigInt']['output']>;
  jurisdiction?: Maybe<Scalars['BigInt']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigInt']['output']>;
  revokeDate?: Maybe<Scalars['BigInt']['output']>;
  scope?: Maybe<Scalars['BigInt']['output']>;
  targetId?: Maybe<Scalars['BigInt']['output']>;
  type?: Maybe<Scalars['BigInt']['output']>;
  updatedEventId?: Maybe<Scalars['BigInt']['output']>;
};
export type ClaimFilter = {
  and?: InputMaybe<Array<ClaimFilter>>;
  cddId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  customClaimType?: InputMaybe<CustomClaimTypeFilter>;
  customClaimTypeExists?: InputMaybe<Scalars['Boolean']['input']>;
  customClaimTypeId?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<BigFloatFilter>;
  filterExpiry?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<StringFilter>;
  issuanceDate?: InputMaybe<BigFloatFilter>;
  issuer?: InputMaybe<IdentityFilter>;
  issuerId?: InputMaybe<StringFilter>;
  jurisdiction?: InputMaybe<StringFilter>;
  lastUpdateDate?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<ClaimFilter>;
  or?: InputMaybe<Array<ClaimFilter>>;
  revokeDate?: InputMaybe<BigFloatFilter>;
  scope?: InputMaybe<JsonFilter>;
  target?: InputMaybe<IdentityFilter>;
  targetId?: InputMaybe<StringFilter>;
  type?: InputMaybe<ClaimTypeEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type ClaimMaxAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimMinAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimStddevPopulationAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimStddevSampleAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimSumAggregates = {
  expiry: Scalars['BigFloat']['output'];
  filterExpiry: Scalars['BigFloat']['output'];
  issuanceDate: Scalars['BigFloat']['output'];
  lastUpdateDate: Scalars['BigFloat']['output'];
  revokeDate: Scalars['BigFloat']['output'];
};
export enum ClaimTypeEnum {
  Accredited = 'Accredited',
  Affiliate = 'Affiliate',
  Blocked = 'Blocked',
  BuyLockup = 'BuyLockup',
  Custom = 'Custom',
  CustomerDueDiligence = 'CustomerDueDiligence',
  Exempted = 'Exempted',
  Jurisdiction = 'Jurisdiction',
  KnowYourCustomer = 'KnowYourCustomer',
  NoType = 'NoType',
  SellLockup = 'SellLockup',
}
export type ClaimTypeEnumFilter = {
  distinctFrom?: InputMaybe<ClaimTypeEnum>;
  equalTo?: InputMaybe<ClaimTypeEnum>;
  greaterThan?: InputMaybe<ClaimTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<ClaimTypeEnum>;
  in?: InputMaybe<Array<ClaimTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ClaimTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<ClaimTypeEnum>;
  notDistinctFrom?: InputMaybe<ClaimTypeEnum>;
  notEqualTo?: InputMaybe<ClaimTypeEnum>;
  notIn?: InputMaybe<Array<ClaimTypeEnum>>;
};
export type ClaimVariancePopulationAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimVarianceSampleAggregates = {
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimsConnection = {
  groupedAggregates?: Maybe<Array<ClaimAggregates>>;
  nodes: Array<Maybe<Claim>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
export enum ClaimsOrderBy {
  CddIdAsc = 'CDD_ID_ASC',
  CddIdDesc = 'CDD_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CustomClaimTypeIdAsc = 'CUSTOM_CLAIM_TYPE_ID_ASC',
  CustomClaimTypeIdDesc = 'CUSTOM_CLAIM_TYPE_ID_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  FilterExpiryAsc = 'FILTER_EXPIRY_ASC',
  FilterExpiryDesc = 'FILTER_EXPIRY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IssuanceDateAsc = 'ISSUANCE_DATE_ASC',
  IssuanceDateDesc = 'ISSUANCE_DATE_DESC',
  IssuerIdAsc = 'ISSUER_ID_ASC',
  IssuerIdDesc = 'ISSUER_ID_DESC',
  JurisdictionAsc = 'JURISDICTION_ASC',
  JurisdictionDesc = 'JURISDICTION_DESC',
  LastUpdateDateAsc = 'LAST_UPDATE_DATE_ASC',
  LastUpdateDateDesc = 'LAST_UPDATE_DATE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RevokeDateAsc = 'REVOKE_DATE_ASC',
  RevokeDateDesc = 'REVOKE_DATE_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  TargetIdAsc = 'TARGET_ID_ASC',
  TargetIdDesc = 'TARGET_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Compliance = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  complianceId: Scalars['Int']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  data: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ComplianceFilter = {
  and?: InputMaybe<Array<ComplianceFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  complianceId?: InputMaybe<IntFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ComplianceFilter>;
  or?: InputMaybe<Array<ComplianceFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum CompliancesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ComplianceIdAsc = 'COMPLIANCE_ID_ASC',
  ComplianceIdDesc = 'COMPLIANCE_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAccount = Node & {
  assets: Connection<ConfidentialAccountAsset>;
  confidentialAssetsByConfidentialAccountAssetAccountIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetKeyAccountIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialEncryptionKeysByConfidentialAssetKeyAccountIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  encryptionKey?: Maybe<ConfidentialEncryptionKey>;
  encryptionKeyId: Scalars['String']['output'];
  eventsByConfidentialAccountAssetAccountIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountAssetAccountIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAssetKeyAccountIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  mediatorOf: Connection<ConfidentialAssetKey>;
  nodeId: Scalars['ID']['output'];
  publicKey: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialAccountAsset = Node & {
  account?: Maybe<ConfidentialAccount>;
  accountId: Scalars['String']['output'];
  asset?: Maybe<ConfidentialAsset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialAccountAssetFilter = {
  account?: InputMaybe<ConfidentialAccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialAccountAssetFilter>>;
  asset?: InputMaybe<ConfidentialAssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAccountAssetFilter>;
  or?: InputMaybe<Array<ConfidentialAccountAssetFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialAccountAssetsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAccountFilter = {
  and?: InputMaybe<Array<ConfidentialAccountFilter>>;
  assets?: InputMaybe<OneToManyFilter<ConfidentialAccountAssetFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  encryptionKey?: InputMaybe<ConfidentialEncryptionKeyFilter>;
  encryptionKeyId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  mediatorOf?: InputMaybe<OneToManyFilter<ConfidentialAssetKeyFilter>>;
  not?: InputMaybe<ConfidentialAccountFilter>;
  or?: InputMaybe<Array<ConfidentialAccountFilter>>;
  publicKey?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialAccountsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EncryptionKeyIdAsc = 'ENCRYPTION_KEY_ID_ASC',
  EncryptionKeyIdDesc = 'ENCRYPTION_KEY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  PublicKeyAsc = 'PUBLIC_KEY_ASC',
  PublicKeyDesc = 'PUBLIC_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ConfidentialAffirmationStatusEnum {
  Affirmed = 'Affirmed',
  Finalized = 'Finalized',
  Rejected = 'Rejected',
  Reverted = 'Reverted',
}
export type ConfidentialAffirmationStatusEnumFilter = {
  distinctFrom?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  equalTo?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  greaterThan?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  in?: InputMaybe<Array<ConfidentialAffirmationStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  notDistinctFrom?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  notEqualTo?: InputMaybe<ConfidentialAffirmationStatusEnum>;
  notIn?: InputMaybe<Array<ConfidentialAffirmationStatusEnum>>;
};
export type ConfidentialAsset = Node & {
  assetId: Scalars['Int']['output'];
  confidentialAccountsByConfidentialAccountAssetAssetIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetKeyAssetIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialEncryptionKeysByConfidentialAssetKeyAssetIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  data?: Maybe<Scalars['String']['output']>;
  decimals: Scalars['Int']['output'];
  eventsByConfidentialAccountAssetAssetIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountAssetAssetIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAssetKeyAssetIdAndCreatedEventId: Connection<Event>;
  holders: Connection<ConfidentialAccountAsset>;
  id: Scalars['String']['output'];
  keys: Connection<ConfidentialAssetKey>;
  name?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  symbol?: Maybe<Scalars['String']['output']>;
  totalSupply: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialAssetFilter = {
  and?: InputMaybe<Array<ConfidentialAssetFilter>>;
  assetId?: InputMaybe<IntFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  decimals?: InputMaybe<IntFilter>;
  holders?: InputMaybe<OneToManyFilter<ConfidentialAccountAssetFilter>>;
  id?: InputMaybe<StringFilter>;
  keys?: InputMaybe<OneToManyFilter<ConfidentialAssetKeyFilter>>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAssetFilter>;
  or?: InputMaybe<Array<ConfidentialAssetFilter>>;
  symbol?: InputMaybe<StringFilter>;
  totalSupply?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type ConfidentialAssetKey = Node & {
  account?: Maybe<ConfidentialAccount>;
  accountId?: Maybe<Scalars['String']['output']>;
  asset?: Maybe<ConfidentialAsset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  encryptionKey?: Maybe<ConfidentialEncryptionKey>;
  encryptionKeyId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  role: ConfidentialKeyRole;
};
export type ConfidentialAssetKeyFilter = {
  account?: InputMaybe<ConfidentialAccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialAssetKeyFilter>>;
  asset?: InputMaybe<ConfidentialAssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  encryptionKey?: InputMaybe<ConfidentialEncryptionKeyFilter>;
  encryptionKeyId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAssetKeyFilter>;
  or?: InputMaybe<Array<ConfidentialAssetKeyFilter>>;
  role?: InputMaybe<ConfidentialKeyRoleFilter>;
};
export enum ConfidentialAssetKeysOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EncryptionKeyIdAsc = 'ENCRYPTION_KEY_ID_ASC',
  EncryptionKeyIdDesc = 'ENCRYPTION_KEY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RoleAsc = 'ROLE_ASC',
  RoleDesc = 'ROLE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ConfidentialAssetsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  DecimalsAsc = 'DECIMALS_ASC',
  DecimalsDesc = 'DECIMALS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SymbolAsc = 'SYMBOL_ASC',
  SymbolDesc = 'SYMBOL_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ConfidentialCurveTreeEnum {
  Account = 'Account',
  Asset = 'Asset',
  FeeAccount = 'FeeAccount',
}
export type ConfidentialCurveTreeEnumFilter = {
  distinctFrom?: InputMaybe<ConfidentialCurveTreeEnum>;
  equalTo?: InputMaybe<ConfidentialCurveTreeEnum>;
  greaterThan?: InputMaybe<ConfidentialCurveTreeEnum>;
  greaterThanOrEqualTo?: InputMaybe<ConfidentialCurveTreeEnum>;
  in?: InputMaybe<Array<ConfidentialCurveTreeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ConfidentialCurveTreeEnum>;
  lessThanOrEqualTo?: InputMaybe<ConfidentialCurveTreeEnum>;
  notDistinctFrom?: InputMaybe<ConfidentialCurveTreeEnum>;
  notEqualTo?: InputMaybe<ConfidentialCurveTreeEnum>;
  notIn?: InputMaybe<Array<ConfidentialCurveTreeEnum>>;
};
export type ConfidentialCurveTreeLeaf = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  leafIndex: Scalars['BigFloat']['output'];
  nodeId: Scalars['ID']['output'];
  tree: ConfidentialCurveTreeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  value: Scalars['String']['output'];
};
export type ConfidentialCurveTreeLeafFilter = {
  and?: InputMaybe<Array<ConfidentialCurveTreeLeafFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  leafIndex?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<ConfidentialCurveTreeLeafFilter>;
  or?: InputMaybe<Array<ConfidentialCurveTreeLeafFilter>>;
  tree?: InputMaybe<ConfidentialCurveTreeEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
};
export enum ConfidentialCurveTreeLeavesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LeafIndexAsc = 'LEAF_INDEX_ASC',
  LeafIndexDesc = 'LEAF_INDEX_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TreeAsc = 'TREE_ASC',
  TreeDesc = 'TREE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialEncryptionKey = Node & {
  accounts: Connection<ConfidentialAccount>;
  assetRoles: Connection<ConfidentialAssetKey>;
  confidentialAccountsByConfidentialAssetKeyEncryptionKeyIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAssetsByConfidentialAssetKeyEncryptionKeyIdAndAssetId: Connection<ConfidentialAsset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  encryptionKey: Scalars['String']['output'];
  eventsByConfidentialAccountEncryptionKeyIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountEncryptionKeyIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAssetKeyEncryptionKeyIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByConfidentialAccountEncryptionKeyIdAndCreatorId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialEncryptionKeyFilter = {
  accounts?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  and?: InputMaybe<Array<ConfidentialEncryptionKeyFilter>>;
  assetRoles?: InputMaybe<OneToManyFilter<ConfidentialAssetKeyFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  encryptionKey?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialEncryptionKeyFilter>;
  or?: InputMaybe<Array<ConfidentialEncryptionKeyFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialEncryptionKeysOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EncryptionKeyAsc = 'ENCRYPTION_KEY_ASC',
  EncryptionKeyDesc = 'ENCRYPTION_KEY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ConfidentialKeyRole {
  Auditor = 'Auditor',
  Mediator = 'Mediator',
}
export type ConfidentialKeyRoleFilter = {
  distinctFrom?: InputMaybe<ConfidentialKeyRole>;
  equalTo?: InputMaybe<ConfidentialKeyRole>;
  greaterThan?: InputMaybe<ConfidentialKeyRole>;
  greaterThanOrEqualTo?: InputMaybe<ConfidentialKeyRole>;
  in?: InputMaybe<Array<ConfidentialKeyRole>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ConfidentialKeyRole>;
  lessThanOrEqualTo?: InputMaybe<ConfidentialKeyRole>;
  notDistinctFrom?: InputMaybe<ConfidentialKeyRole>;
  notEqualTo?: InputMaybe<ConfidentialKeyRole>;
  notIn?: InputMaybe<Array<ConfidentialKeyRole>>;
};
export type ConfidentialLeg = Node & {
  affirmations: Connection<ConfidentialLegAffirmation>;
  confidentialSettlementsByConfidentialLegAffirmationLegIdAndSettlementId: Connection<ConfidentialSettlement>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  encryptedData: Scalars['String']['output'];
  eventsByConfidentialLegAffirmationLegIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialLegAffirmationLegIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  legId: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  settlement?: Maybe<ConfidentialSettlement>;
  settlementId: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialLegAffirmation = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keyIndex?: Maybe<Scalars['Int']['output']>;
  leg?: Maybe<ConfidentialLeg>;
  legId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  party: AffirmingPartyEnum;
  settlement?: Maybe<ConfidentialSettlement>;
  settlementId: Scalars['String']['output'];
  status: ConfidentialAffirmationStatusEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialLegAffirmationFilter = {
  and?: InputMaybe<Array<ConfidentialLegAffirmationFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  keyIndex?: InputMaybe<IntFilter>;
  leg?: InputMaybe<ConfidentialLegFilter>;
  legId?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialLegAffirmationFilter>;
  or?: InputMaybe<Array<ConfidentialLegAffirmationFilter>>;
  party?: InputMaybe<AffirmingPartyEnumFilter>;
  settlement?: InputMaybe<ConfidentialSettlementFilter>;
  settlementId?: InputMaybe<StringFilter>;
  status?: InputMaybe<ConfidentialAffirmationStatusEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialLegAffirmationsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KeyIndexAsc = 'KEY_INDEX_ASC',
  KeyIndexDesc = 'KEY_INDEX_DESC',
  LegIdAsc = 'LEG_ID_ASC',
  LegIdDesc = 'LEG_ID_DESC',
  Natural = 'NATURAL',
  PartyAsc = 'PARTY_ASC',
  PartyDesc = 'PARTY_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SettlementIdAsc = 'SETTLEMENT_ID_ASC',
  SettlementIdDesc = 'SETTLEMENT_ID_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialLegFilter = {
  affirmations?: InputMaybe<OneToManyFilter<ConfidentialLegAffirmationFilter>>;
  and?: InputMaybe<Array<ConfidentialLegFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  encryptedData?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  legId?: InputMaybe<IntFilter>;
  not?: InputMaybe<ConfidentialLegFilter>;
  or?: InputMaybe<Array<ConfidentialLegFilter>>;
  settlement?: InputMaybe<ConfidentialSettlementFilter>;
  settlementId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialLegsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EncryptedDataAsc = 'ENCRYPTED_DATA_ASC',
  EncryptedDataDesc = 'ENCRYPTED_DATA_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LegIdAsc = 'LEG_ID_ASC',
  LegIdDesc = 'LEG_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SettlementIdAsc = 'SETTLEMENT_ID_ASC',
  SettlementIdDesc = 'SETTLEMENT_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialSettlement = Node & {
  assetRootBlock?: Maybe<Scalars['Int']['output']>;
  confidentialLegAffirmationsBySettlementId: Connection<ConfidentialLegAffirmation>;
  confidentialLegsByConfidentialLegAffirmationSettlementIdAndLegId: Connection<ConfidentialLeg>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByConfidentialLegAffirmationSettlementIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialLegAffirmationSettlementIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialLegSettlementIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialLegSettlementIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  legCount: Scalars['Int']['output'];
  legs: Connection<ConfidentialLeg>;
  memo?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  status: ConfidentialSettlementStatusEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ConfidentialSettlementFilter = {
  and?: InputMaybe<Array<ConfidentialSettlementFilter>>;
  assetRootBlock?: InputMaybe<IntFilter>;
  confidentialLegAffirmationsBySettlementId?: InputMaybe<
    OneToManyFilter<ConfidentialLegAffirmationFilter>
  >;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  legCount?: InputMaybe<IntFilter>;
  legs?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  memo?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialSettlementFilter>;
  or?: InputMaybe<Array<ConfidentialSettlementFilter>>;
  status?: InputMaybe<ConfidentialSettlementStatusEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ConfidentialSettlementStatusEnum {
  Executed = 'Executed',
  Finalized = 'Finalized',
  Pending = 'Pending',
  Rejected = 'Rejected',
}
export type ConfidentialSettlementStatusEnumFilter = {
  distinctFrom?: InputMaybe<ConfidentialSettlementStatusEnum>;
  equalTo?: InputMaybe<ConfidentialSettlementStatusEnum>;
  greaterThan?: InputMaybe<ConfidentialSettlementStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<ConfidentialSettlementStatusEnum>;
  in?: InputMaybe<Array<ConfidentialSettlementStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ConfidentialSettlementStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<ConfidentialSettlementStatusEnum>;
  notDistinctFrom?: InputMaybe<ConfidentialSettlementStatusEnum>;
  notEqualTo?: InputMaybe<ConfidentialSettlementStatusEnum>;
  notIn?: InputMaybe<Array<ConfidentialSettlementStatusEnum>>;
};
export enum ConfidentialSettlementsOrderBy {
  AssetRootBlockAsc = 'ASSET_ROOT_BLOCK_ASC',
  AssetRootBlockDesc = 'ASSET_ROOT_BLOCK_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CorporateAction = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByCorporateBallotCorporateActionIdAndAssetId: Connection<Asset>;
  assetsByDistributionCorporateActionIdAndAssetId: Connection<Asset>;
  assetsByDistributionCorporateActionIdAndCurrencyId: Connection<Asset>;
  checkpoint?: Maybe<Checkpoint>;
  checkpointId?: Maybe<Scalars['String']['output']>;
  corporateBallots: Connection<CorporateBallot>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  declarationDate: Scalars['Datetime']['output'];
  defaultWithholdingTax?: Maybe<Scalars['BigFloat']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  didWithholdingTax?: Maybe<Scalars['JSON']['output']>;
  distributions: Connection<Distribution>;
  documents?: Maybe<Scalars['JSON']['output']>;
  eventsByCorporateBallotCorporateActionIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotCorporateActionIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionCorporateActionIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionCorporateActionIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByDistributionCorporateActionIdAndIdentityId: Connection<Identity>;
  isRemoved: Scalars['Boolean']['output'];
  kind: CorporateActionKind;
  localId: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  portfoliosByDistributionCorporateActionIdAndPortfolioId: Connection<Portfolio>;
  recordDate?: Maybe<Scalars['Datetime']['output']>;
  targetIdentities?: Maybe<Scalars['JSON']['output']>;
  targetTreatment?: Maybe<TargetTreatment>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type CorporateActionDefaultConfig = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  defaultWithholdingTax?: Maybe<Scalars['BigFloat']['output']>;
  didWithholdingTax?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  targetIdentities?: Maybe<Scalars['JSON']['output']>;
  targetTreatment?: Maybe<TargetTreatment>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type CorporateActionDefaultConfigFilter = {
  and?: InputMaybe<Array<CorporateActionDefaultConfigFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  defaultWithholdingTax?: InputMaybe<BigFloatFilter>;
  didWithholdingTax?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<CorporateActionDefaultConfigFilter>;
  or?: InputMaybe<Array<CorporateActionDefaultConfigFilter>>;
  targetIdentities?: InputMaybe<JsonFilter>;
  targetTreatment?: InputMaybe<TargetTreatmentFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum CorporateActionDefaultConfigsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DefaultWithholdingTaxAsc = 'DEFAULT_WITHHOLDING_TAX_ASC',
  DefaultWithholdingTaxDesc = 'DEFAULT_WITHHOLDING_TAX_DESC',
  DidWithholdingTaxAsc = 'DID_WITHHOLDING_TAX_ASC',
  DidWithholdingTaxDesc = 'DID_WITHHOLDING_TAX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TargetIdentitiesAsc = 'TARGET_IDENTITIES_ASC',
  TargetIdentitiesDesc = 'TARGET_IDENTITIES_DESC',
  TargetTreatmentAsc = 'TARGET_TREATMENT_ASC',
  TargetTreatmentDesc = 'TARGET_TREATMENT_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CorporateActionFilter = {
  and?: InputMaybe<Array<CorporateActionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  checkpoint?: InputMaybe<CheckpointFilter>;
  checkpointExists?: InputMaybe<Scalars['Boolean']['input']>;
  checkpointId?: InputMaybe<StringFilter>;
  corporateBallots?: InputMaybe<OneToManyFilter<CorporateBallotFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  declarationDate?: InputMaybe<DatetimeFilter>;
  defaultWithholdingTax?: InputMaybe<BigFloatFilter>;
  details?: InputMaybe<StringFilter>;
  didWithholdingTax?: InputMaybe<JsonFilter>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  documents?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  isRemoved?: InputMaybe<BooleanFilter>;
  kind?: InputMaybe<CorporateActionKindFilter>;
  localId?: InputMaybe<IntFilter>;
  not?: InputMaybe<CorporateActionFilter>;
  or?: InputMaybe<Array<CorporateActionFilter>>;
  recordDate?: InputMaybe<DatetimeFilter>;
  targetIdentities?: InputMaybe<JsonFilter>;
  targetTreatment?: InputMaybe<TargetTreatmentFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum CorporateActionKind {
  IssuerNotice = 'IssuerNotice',
  Other = 'Other',
  PredictableBenefit = 'PredictableBenefit',
  Reorganization = 'Reorganization',
  UnpredictableBenefit = 'UnpredictableBenefit',
}
export type CorporateActionKindFilter = {
  distinctFrom?: InputMaybe<CorporateActionKind>;
  equalTo?: InputMaybe<CorporateActionKind>;
  greaterThan?: InputMaybe<CorporateActionKind>;
  greaterThanOrEqualTo?: InputMaybe<CorporateActionKind>;
  in?: InputMaybe<Array<CorporateActionKind>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<CorporateActionKind>;
  lessThanOrEqualTo?: InputMaybe<CorporateActionKind>;
  notDistinctFrom?: InputMaybe<CorporateActionKind>;
  notEqualTo?: InputMaybe<CorporateActionKind>;
  notIn?: InputMaybe<Array<CorporateActionKind>>;
};
export enum CorporateActionsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CheckpointIdAsc = 'CHECKPOINT_ID_ASC',
  CheckpointIdDesc = 'CHECKPOINT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DeclarationDateAsc = 'DECLARATION_DATE_ASC',
  DeclarationDateDesc = 'DECLARATION_DATE_DESC',
  DefaultWithholdingTaxAsc = 'DEFAULT_WITHHOLDING_TAX_ASC',
  DefaultWithholdingTaxDesc = 'DEFAULT_WITHHOLDING_TAX_DESC',
  DetailsAsc = 'DETAILS_ASC',
  DetailsDesc = 'DETAILS_DESC',
  DidWithholdingTaxAsc = 'DID_WITHHOLDING_TAX_ASC',
  DidWithholdingTaxDesc = 'DID_WITHHOLDING_TAX_DESC',
  DocumentsAsc = 'DOCUMENTS_ASC',
  DocumentsDesc = 'DOCUMENTS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsRemovedAsc = 'IS_REMOVED_ASC',
  IsRemovedDesc = 'IS_REMOVED_DESC',
  KindAsc = 'KIND_ASC',
  KindDesc = 'KIND_DESC',
  LocalIdAsc = 'LOCAL_ID_ASC',
  LocalIdDesc = 'LOCAL_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RecordDateAsc = 'RECORD_DATE_ASC',
  RecordDateDesc = 'RECORD_DATE_DESC',
  TargetIdentitiesAsc = 'TARGET_IDENTITIES_ASC',
  TargetIdentitiesDesc = 'TARGET_IDENTITIES_DESC',
  TargetTreatmentAsc = 'TARGET_TREATMENT_ASC',
  TargetTreatmentDesc = 'TARGET_TREATMENT_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CorporateBallot = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  corporateAction?: Maybe<CorporateAction>;
  corporateActionId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  endDate: Scalars['Datetime']['output'];
  eventsByCorporateBallotVoteBallotIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotVoteBallotIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByCorporateBallotVoteBallotIdAndVoterId: Connection<Identity>;
  isRemoved: Scalars['Boolean']['output'];
  meta?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  rcv: Scalars['Boolean']['output'];
  startDate: Scalars['Datetime']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  votes: Connection<CorporateBallotVote>;
};
export type CorporateBallotFilter = {
  and?: InputMaybe<Array<CorporateBallotFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  corporateAction?: InputMaybe<CorporateActionFilter>;
  corporateActionExists?: InputMaybe<Scalars['Boolean']['input']>;
  corporateActionId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  endDate?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  isRemoved?: InputMaybe<BooleanFilter>;
  meta?: InputMaybe<StringFilter>;
  not?: InputMaybe<CorporateBallotFilter>;
  or?: InputMaybe<Array<CorporateBallotFilter>>;
  rcv?: InputMaybe<BooleanFilter>;
  startDate?: InputMaybe<DatetimeFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<CorporateBallotVoteFilter>>;
};
export type CorporateBallotVote = Node & {
  ballot?: Maybe<CorporateBallot>;
  ballotId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  voter?: Maybe<Identity>;
  voterId: Scalars['String']['output'];
  votes?: Maybe<Scalars['JSON']['output']>;
};
export type CorporateBallotVoteFilter = {
  and?: InputMaybe<Array<CorporateBallotVoteFilter>>;
  ballot?: InputMaybe<CorporateBallotFilter>;
  ballotId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<CorporateBallotVoteFilter>;
  or?: InputMaybe<Array<CorporateBallotVoteFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  voter?: InputMaybe<IdentityFilter>;
  voterId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<JsonFilter>;
};
export enum CorporateBallotVotesOrderBy {
  BallotIdAsc = 'BALLOT_ID_ASC',
  BallotIdDesc = 'BALLOT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  VoterIdAsc = 'VOTER_ID_ASC',
  VoterIdDesc = 'VOTER_ID_DESC',
  VotesAsc = 'VOTES_ASC',
  VotesDesc = 'VOTES_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum CorporateBallotsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CorporateActionIdAsc = 'CORPORATE_ACTION_ID_ASC',
  CorporateActionIdDesc = 'CORPORATE_ACTION_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EndDateAsc = 'END_DATE_ASC',
  EndDateDesc = 'END_DATE_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsRemovedAsc = 'IS_REMOVED_ASC',
  IsRemovedDesc = 'IS_REMOVED_DESC',
  MetaAsc = 'META_ASC',
  MetaDesc = 'META_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RcvAsc = 'RCV_ASC',
  RcvDesc = 'RCV_DESC',
  StartDateAsc = 'START_DATE_ASC',
  StartDateDesc = 'START_DATE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CustomAssetType = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type CustomAssetTypeFilter = {
  and?: InputMaybe<Array<CustomAssetTypeFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<CustomAssetTypeFilter>;
  or?: InputMaybe<Array<CustomAssetTypeFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum CustomAssetTypesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CustomClaimType = Node & {
  assetsByStatTypeCustomClaimTypeIdAndAssetId: Connection<Asset>;
  claims: ClaimsConnection;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByClaimCustomClaimTypeIdAndCreatedEventId: Connection<Event>;
  eventsByClaimCustomClaimTypeIdAndUpdatedEventId: Connection<Event>;
  eventsByStatTypeCustomClaimTypeIdAndCreatedEventId: Connection<Event>;
  eventsByStatTypeCustomClaimTypeIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByClaimCustomClaimTypeIdAndIssuerId: Connection<Identity>;
  identitiesByClaimCustomClaimTypeIdAndTargetId: Connection<Identity>;
  identitiesByStatTypeCustomClaimTypeIdAndClaimIssuerId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  statTypes: Connection<StatType>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type CustomClaimTypeFilter = {
  and?: InputMaybe<Array<CustomClaimTypeFilter>>;
  claims?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<CustomClaimTypeFilter>;
  or?: InputMaybe<Array<CustomClaimTypeFilter>>;
  statTypes?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum CustomClaimTypesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type DatetimeFilter = {
  distinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  equalTo?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThan?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Datetime']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  notEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notIn?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};
export type Distribution = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  corporateAction?: Maybe<CorporateAction>;
  corporateActionId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  currency?: Maybe<Asset>;
  currencyId: Scalars['String']['output'];
  eventsByDistributionPaymentDistributionIdAndCreatedEventId: Connection<Event>;
  expiresAt?: Maybe<Scalars['BigFloat']['output']>;
  id: Scalars['String']['output'];
  identitiesByDistributionPaymentDistributionIdAndTargetId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  localId: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  paymentAt: Scalars['BigFloat']['output'];
  payments: Connection<DistributionPayment>;
  perShare: Scalars['BigFloat']['output'];
  portfolio?: Maybe<Portfolio>;
  portfolioId: Scalars['String']['output'];
  remaining: Scalars['BigFloat']['output'];
  taxes: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type DistributionFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<DistributionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  corporateAction?: InputMaybe<CorporateActionFilter>;
  corporateActionExists?: InputMaybe<Scalars['Boolean']['input']>;
  corporateActionId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  currency?: InputMaybe<AssetFilter>;
  currencyId?: InputMaybe<StringFilter>;
  expiresAt?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  localId?: InputMaybe<IntFilter>;
  not?: InputMaybe<DistributionFilter>;
  or?: InputMaybe<Array<DistributionFilter>>;
  paymentAt?: InputMaybe<BigFloatFilter>;
  payments?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  perShare?: InputMaybe<BigFloatFilter>;
  portfolio?: InputMaybe<PortfolioFilter>;
  portfolioId?: InputMaybe<StringFilter>;
  remaining?: InputMaybe<BigFloatFilter>;
  taxes?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type DistributionPayment = Node & {
  amount: Scalars['BigFloat']['output'];
  amountAfterTax: Scalars['BigFloat']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  distribution?: Maybe<Distribution>;
  distributionId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  reclaimed: Scalars['Boolean']['output'];
  target?: Maybe<Identity>;
  targetId: Scalars['String']['output'];
  tax: Scalars['BigFloat']['output'];
};
export type DistributionPaymentFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  amountAfterTax?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<DistributionPaymentFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  distribution?: InputMaybe<DistributionFilter>;
  distributionId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<DistributionPaymentFilter>;
  or?: InputMaybe<Array<DistributionPaymentFilter>>;
  reclaimed?: InputMaybe<BooleanFilter>;
  target?: InputMaybe<IdentityFilter>;
  targetId?: InputMaybe<StringFilter>;
  tax?: InputMaybe<BigFloatFilter>;
};
export enum DistributionPaymentsOrderBy {
  AmountAfterTaxAsc = 'AMOUNT_AFTER_TAX_ASC',
  AmountAfterTaxDesc = 'AMOUNT_AFTER_TAX_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DistributionIdAsc = 'DISTRIBUTION_ID_ASC',
  DistributionIdDesc = 'DISTRIBUTION_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReclaimedAsc = 'RECLAIMED_ASC',
  ReclaimedDesc = 'RECLAIMED_DESC',
  TargetIdAsc = 'TARGET_ID_ASC',
  TargetIdDesc = 'TARGET_ID_DESC',
  TaxAsc = 'TAX_ASC',
  TaxDesc = 'TAX_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum DistributionsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CorporateActionIdAsc = 'CORPORATE_ACTION_ID_ASC',
  CorporateActionIdDesc = 'CORPORATE_ACTION_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CurrencyIdAsc = 'CURRENCY_ID_ASC',
  CurrencyIdDesc = 'CURRENCY_ID_DESC',
  ExpiresAtAsc = 'EXPIRES_AT_ASC',
  ExpiresAtDesc = 'EXPIRES_AT_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LocalIdAsc = 'LOCAL_ID_ASC',
  LocalIdDesc = 'LOCAL_ID_DESC',
  Natural = 'NATURAL',
  PaymentAtAsc = 'PAYMENT_AT_ASC',
  PaymentAtDesc = 'PAYMENT_AT_DESC',
  PerShareAsc = 'PER_SHARE_ASC',
  PerShareDesc = 'PER_SHARE_DESC',
  PortfolioIdAsc = 'PORTFOLIO_ID_ASC',
  PortfolioIdDesc = 'PORTFOLIO_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemainingAsc = 'REMAINING_ASC',
  RemainingDesc = 'REMAINING_DESC',
  TaxesAsc = 'TAXES_ASC',
  TaxesDesc = 'TAXES_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum EntryDirection {
  Credit = 'Credit',
  Debit = 'Debit',
}
export type EntryDirectionFilter = {
  distinctFrom?: InputMaybe<EntryDirection>;
  equalTo?: InputMaybe<EntryDirection>;
  greaterThan?: InputMaybe<EntryDirection>;
  greaterThanOrEqualTo?: InputMaybe<EntryDirection>;
  in?: InputMaybe<Array<EntryDirection>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<EntryDirection>;
  lessThanOrEqualTo?: InputMaybe<EntryDirection>;
  notDistinctFrom?: InputMaybe<EntryDirection>;
  notEqualTo?: InputMaybe<EntryDirection>;
  notIn?: InputMaybe<Array<EntryDirection>>;
};
export type Era = Node & {
  endEvent?: Maybe<Event>;
  endEventId?: Maybe<Scalars['String']['output']>;
  eraIndex: Scalars['Int']['output'];
  eventsByValidatorEraEraIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorEraEraIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByValidatorEraEraIdAndIdentityId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  remainder?: Maybe<Scalars['BigFloat']['output']>;
  startEvent?: Maybe<Event>;
  startEventId: Scalars['String']['output'];
  totalPoints?: Maybe<Scalars['Int']['output']>;
  totalStaked?: Maybe<Scalars['BigFloat']['output']>;
  validatorCount?: Maybe<Scalars['Int']['output']>;
  validatorPayout?: Maybe<Scalars['BigFloat']['output']>;
  validators: Connection<ValidatorEra>;
  validatorsByValidatorEraEraIdAndValidatorId: Connection<Validator>;
};
export type EraFilter = {
  and?: InputMaybe<Array<EraFilter>>;
  endEvent?: InputMaybe<EventFilter>;
  endEventExists?: InputMaybe<Scalars['Boolean']['input']>;
  endEventId?: InputMaybe<StringFilter>;
  eraIndex?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<EraFilter>;
  or?: InputMaybe<Array<EraFilter>>;
  remainder?: InputMaybe<BigFloatFilter>;
  startEvent?: InputMaybe<EventFilter>;
  startEventId?: InputMaybe<StringFilter>;
  totalPoints?: InputMaybe<IntFilter>;
  totalStaked?: InputMaybe<BigFloatFilter>;
  validatorCount?: InputMaybe<IntFilter>;
  validatorPayout?: InputMaybe<BigFloatFilter>;
  validators?: InputMaybe<OneToManyFilter<ValidatorEraFilter>>;
};
export enum ErasOrderBy {
  EndEventIdAsc = 'END_EVENT_ID_ASC',
  EndEventIdDesc = 'END_EVENT_ID_DESC',
  EraIndexAsc = 'ERA_INDEX_ASC',
  EraIndexDesc = 'ERA_INDEX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemainderAsc = 'REMAINDER_ASC',
  RemainderDesc = 'REMAINDER_DESC',
  StartEventIdAsc = 'START_EVENT_ID_ASC',
  StartEventIdDesc = 'START_EVENT_ID_DESC',
  TotalPointsAsc = 'TOTAL_POINTS_ASC',
  TotalPointsDesc = 'TOTAL_POINTS_DESC',
  TotalStakedAsc = 'TOTAL_STAKED_ASC',
  TotalStakedDesc = 'TOTAL_STAKED_DESC',
  ValidatorPayoutAsc = 'VALIDATOR_PAYOUT_ASC',
  ValidatorPayoutDesc = 'VALIDATOR_PAYOUT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Event = Node & {
  accountBalancesByUpdatedEventId: Connection<AccountBalance>;
  accountsByAccountBalanceUpdatedEventIdAndAccountId: Connection<Account>;
  accountsByAssetAllowanceCreatedEventIdAndOwnerId: Connection<Account>;
  accountsByAssetAllowanceCreatedEventIdAndSpenderId: Connection<Account>;
  accountsByAssetAllowanceUpdatedEventIdAndOwnerId: Connection<Account>;
  accountsByAssetAllowanceUpdatedEventIdAndSpenderId: Connection<Account>;
  accountsByAssetTransactionCreatedEventIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionCreatedEventIdAndToAccountId: Connection<Account>;
  accountsByAuthorizationCreatedEventIdAndToAccountId: Connection<Account>;
  accountsByAuthorizationUpdatedEventIdAndToAccountId: Connection<Account>;
  accountsByBridgeEventCreatedEventIdAndRecipientId: Connection<Account>;
  accountsByCreatedEventId: Connection<Account>;
  accountsByHoldingCreatedEventIdAndAccountId: Connection<Account>;
  accountsByHoldingUpdatedEventIdAndAccountId: Connection<Account>;
  accountsByIdentityCreatedEventIdAndPrimaryAccountId: Connection<Account>;
  accountsByIdentityKeyCreatedEventIdAndAccountId: Connection<Account>;
  accountsByIdentityKeyUpdatedEventIdAndAccountId: Connection<Account>;
  accountsByIdentityUpdatedEventIdAndPrimaryAccountId: Connection<Account>;
  accountsByInstructionAffirmationCreatedEventIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationCreatedEventIdAndSignerId: Connection<Account>;
  accountsByInstructionAffirmationUpdatedEventIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationUpdatedEventIdAndSignerId: Connection<Account>;
  accountsByInstructionCreatedEventIdAndRejectedBySignerId: Connection<Account>;
  accountsByInstructionEventCreatedEventIdAndAccountId: Connection<Account>;
  accountsByInstructionEventCreatedEventIdAndSignerId: Connection<Account>;
  accountsByInstructionUpdatedEventIdAndRejectedBySignerId: Connection<Account>;
  accountsByLegCreatedEventIdAndFromAccountId: Connection<Account>;
  accountsByLegCreatedEventIdAndToAccountId: Connection<Account>;
  accountsByLegUpdatedEventIdAndFromAccountId: Connection<Account>;
  accountsByLegUpdatedEventIdAndToAccountId: Connection<Account>;
  accountsByMultiSigCreatedEventIdAndAccountId: Connection<Account>;
  accountsByMultiSigCreatedEventIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigProposalCreatedEventIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigProposalUpdatedEventIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigSignerCreatedEventIdAndSignerAccountId: Connection<Account>;
  accountsByMultiSigSignerUpdatedEventIdAndSignerAccountId: Connection<Account>;
  accountsByMultiSigUpdatedEventIdAndAccountId: Connection<Account>;
  accountsByMultiSigUpdatedEventIdAndCreatorAccountId: Connection<Account>;
  accountsByNftApprovalCreatedEventIdAndOwnerId: Connection<Account>;
  accountsByNftApprovalCreatedEventIdAndSpenderId: Connection<Account>;
  accountsByNftApprovalUpdatedEventIdAndOwnerId: Connection<Account>;
  accountsByNftApprovalUpdatedEventIdAndSpenderId: Connection<Account>;
  accountsByNftOperatorApprovalCreatedEventIdAndOperatorId: Connection<Account>;
  accountsByNftOperatorApprovalCreatedEventIdAndOwnerId: Connection<Account>;
  accountsByOffChainReceiptCreatedEventIdAndSignerId: Connection<Account>;
  accountsByOffChainReceiptUpdatedEventIdAndSignerId: Connection<Account>;
  accountsByPolyxEntryCreatedEventIdAndAccountId: Connection<Account>;
  accountsByProposalVoteCreatedEventIdAndAccountId: Connection<Account>;
  accountsByProposalVoteUpdatedEventIdAndAccountId: Connection<Account>;
  accountsBySlashCreatedEventIdAndAccountId: Connection<Account>;
  accountsByStakingEventCreatedEventIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingEventCreatedEventIdAndStashId: Connection<Account>;
  accountsByStakingPositionCreatedEventIdAndControllerId: Connection<Account>;
  accountsByStakingPositionCreatedEventIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingPositionCreatedEventIdAndStashId: Connection<Account>;
  accountsByStakingPositionUpdatedEventIdAndControllerId: Connection<Account>;
  accountsByStakingPositionUpdatedEventIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingPositionUpdatedEventIdAndStashId: Connection<Account>;
  accountsBySubsidyCreatedEventIdAndBeneficiaryAccountId: Connection<Account>;
  accountsBySubsidyCreatedEventIdAndPayingAccountId: Connection<Account>;
  accountsBySubsidyUpdatedEventIdAndBeneficiaryAccountId: Connection<Account>;
  accountsBySubsidyUpdatedEventIdAndPayingAccountId: Connection<Account>;
  accountsByUpdatedEventId: Connection<Account>;
  accountsByValidatorCreatedEventIdAndAccountId: Connection<Account>;
  accountsByValidatorUpdatedEventIdAndAccountId: Connection<Account>;
  agentGroupMembershipsByCreatedEventId: Connection<AgentGroupMembership>;
  agentGroupMembershipsByUpdatedEventId: Connection<AgentGroupMembership>;
  agentGroupsByAgentGroupMembershipCreatedEventIdAndGroupId: Connection<AgentGroup>;
  agentGroupsByAgentGroupMembershipUpdatedEventIdAndGroupId: Connection<AgentGroup>;
  agentGroupsByCreatedEventId: Connection<AgentGroup>;
  agentGroupsByUpdatedEventId: Connection<AgentGroup>;
  args?: Maybe<Scalars['JSON']['output']>;
  assetAgentActionsByCreatedEventId: Connection<AssetAgentAction>;
  assetAgentActionsByUpdatedEventId: Connection<AssetAgentAction>;
  assetAgentHistoriesByCreatedEventId: Connection<AssetAgentHistory>;
  assetAgentsByCreatedEventId: Connection<AssetAgent>;
  assetAgentsByUpdatedEventId: Connection<AssetAgent>;
  assetAllowancesByCreatedEventId: Connection<AssetAllowance>;
  assetAllowancesByUpdatedEventId: Connection<AssetAllowance>;
  assetDocumentsByCreatedEventId: Connection<AssetDocument>;
  assetDocumentsByUpdatedEventId: Connection<AssetDocument>;
  assetHoldersByCreatedEventId: Connection<AssetHolder>;
  assetHoldersByHoldingCreatedEventIdAndAssetHolderId: Connection<AssetHolder>;
  assetHoldersByHoldingUpdatedEventIdAndAssetHolderId: Connection<AssetHolder>;
  assetHoldersByUpdatedEventId: Connection<AssetHolder>;
  assetMandatoryMediatorsByCreatedEventId: Connection<AssetMandatoryMediator>;
  assetMandatoryMediatorsByUpdatedEventId: Connection<AssetMandatoryMediator>;
  assetMetadataByCreatedEventId: Connection<AssetMetadatum>;
  assetMetadataByUpdatedEventId: Connection<AssetMetadatum>;
  assetPreApprovalsByCreatedEventId: Connection<AssetPreApproval>;
  assetPreApprovalsByUpdatedEventId: Connection<AssetPreApproval>;
  assetTransactionsByCreatedEventId: Connection<AssetTransaction>;
  assetsByAgentGroupCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAgentGroupUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentActionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentActionUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentHistoryCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAllowanceCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetAllowanceUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetDocumentCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetDocumentUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetHolderCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetHolderUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetMetadatumCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetMetadatumUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCheckpointCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCheckpointScheduleCompletedEventIdAndAssetId: Connection<Asset>;
  assetsByCheckpointScheduleCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCheckpointScheduleRemovedEventIdAndAssetId: Connection<Asset>;
  assetsByComplianceCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByComplianceUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateActionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateActionDefaultConfigCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateActionDefaultConfigUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateActionUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateBallotCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCorporateBallotUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByCreatedEventId: Connection<Asset>;
  assetsByDistributionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByDistributionCreatedEventIdAndCurrencyId: Connection<Asset>;
  assetsByDistributionUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByDistributionUpdatedEventIdAndCurrencyId: Connection<Asset>;
  assetsByFundingCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByHoldingCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByHoldingUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByInvestmentCreatedEventIdAndOfferingAssetId: Connection<Asset>;
  assetsByInvestmentCreatedEventIdAndRaisingAssetId: Connection<Asset>;
  assetsByInvestmentUpdatedEventIdAndOfferingAssetId: Connection<Asset>;
  assetsByInvestmentUpdatedEventIdAndRaisingAssetId: Connection<Asset>;
  assetsByLegCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByLegUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByNftApprovalCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByNftApprovalUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByNftBurnedEventIdAndAssetId: Connection<Asset>;
  assetsByNftCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByNftOperatorApprovalCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByNftUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByStatTypeCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByStatTypeUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByStoCreatedEventIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoCreatedEventIdAndRaisingAssetId: Connection<Asset>;
  assetsByStoUpdatedEventIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoUpdatedEventIdAndRaisingAssetId: Connection<Asset>;
  assetsByTickerReservationCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTickerReservationUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceExemptionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceExemptionUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerUpdatedEventIdAndAssetId: Connection<Asset>;
  assetsByUpdatedEventId: Connection<Asset>;
  authorizationsByCreatedEventId: Connection<Authorization>;
  authorizationsByUpdatedEventId: Connection<Authorization>;
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  blocksByIdentityKeyCreatedEventIdAndValidFromBlockId: Connection<Block>;
  blocksByIdentityKeyCreatedEventIdAndValidToBlockId: Connection<Block>;
  blocksByIdentityKeyUpdatedEventIdAndValidFromBlockId: Connection<Block>;
  blocksByIdentityKeyUpdatedEventIdAndValidToBlockId: Connection<Block>;
  bridgeEventsByCreatedEventId: Connection<BridgeEvent>;
  checkpointSchedulesByCheckpointCreatedEventIdAndScheduleId: Connection<CheckpointSchedule>;
  checkpointSchedulesByCompletedEventId: Connection<CheckpointSchedule>;
  checkpointSchedulesByCreatedEventId: Connection<CheckpointSchedule>;
  checkpointSchedulesByRemovedEventId: Connection<CheckpointSchedule>;
  checkpointsByCorporateActionCreatedEventIdAndCheckpointId: Connection<Checkpoint>;
  checkpointsByCorporateActionUpdatedEventIdAndCheckpointId: Connection<Checkpoint>;
  checkpointsByCreatedEventId: Connection<Checkpoint>;
  claimsByCreatedEventId: ClaimsConnection;
  claimsByUpdatedEventId: ClaimsConnection;
  compliancesByCreatedEventId: Connection<Compliance>;
  compliancesByUpdatedEventId: Connection<Compliance>;
  confidentialAccountAssetsByCreatedEventId: Connection<ConfidentialAccountAsset>;
  confidentialAccountAssetsByUpdatedEventId: Connection<ConfidentialAccountAsset>;
  confidentialAccountsByConfidentialAccountAssetCreatedEventIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAccountAssetUpdatedEventIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetKeyCreatedEventIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByCreatedEventId: Connection<ConfidentialAccount>;
  confidentialAccountsByUpdatedEventId: Connection<ConfidentialAccount>;
  confidentialAssetKeysByCreatedEventId: Connection<ConfidentialAssetKey>;
  confidentialAssetsByConfidentialAccountAssetCreatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAccountAssetUpdatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetKeyCreatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByCreatedEventId: Connection<ConfidentialAsset>;
  confidentialAssetsByUpdatedEventId: Connection<ConfidentialAsset>;
  confidentialCurveTreeLeavesByCreatedEventId: Connection<ConfidentialCurveTreeLeaf>;
  confidentialCurveTreeLeavesByUpdatedEventId: Connection<ConfidentialCurveTreeLeaf>;
  confidentialEncryptionKeysByConfidentialAccountCreatedEventIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  confidentialEncryptionKeysByConfidentialAccountUpdatedEventIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  confidentialEncryptionKeysByConfidentialAssetKeyCreatedEventIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  confidentialEncryptionKeysByCreatedEventId: Connection<ConfidentialEncryptionKey>;
  confidentialEncryptionKeysByUpdatedEventId: Connection<ConfidentialEncryptionKey>;
  confidentialLegAffirmationsByCreatedEventId: Connection<ConfidentialLegAffirmation>;
  confidentialLegAffirmationsByUpdatedEventId: Connection<ConfidentialLegAffirmation>;
  confidentialLegsByConfidentialLegAffirmationCreatedEventIdAndLegId: Connection<ConfidentialLeg>;
  confidentialLegsByConfidentialLegAffirmationUpdatedEventIdAndLegId: Connection<ConfidentialLeg>;
  confidentialLegsByCreatedEventId: Connection<ConfidentialLeg>;
  confidentialLegsByUpdatedEventId: Connection<ConfidentialLeg>;
  confidentialSettlementsByConfidentialLegAffirmationCreatedEventIdAndSettlementId: Connection<ConfidentialSettlement>;
  confidentialSettlementsByConfidentialLegAffirmationUpdatedEventIdAndSettlementId: Connection<ConfidentialSettlement>;
  confidentialSettlementsByConfidentialLegCreatedEventIdAndSettlementId: Connection<ConfidentialSettlement>;
  confidentialSettlementsByConfidentialLegUpdatedEventIdAndSettlementId: Connection<ConfidentialSettlement>;
  confidentialSettlementsByCreatedEventId: Connection<ConfidentialSettlement>;
  confidentialSettlementsByUpdatedEventId: Connection<ConfidentialSettlement>;
  corporateActionDefaultConfigsByCreatedEventId: Connection<CorporateActionDefaultConfig>;
  corporateActionDefaultConfigsByUpdatedEventId: Connection<CorporateActionDefaultConfig>;
  corporateActionsByCorporateBallotCreatedEventIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByCorporateBallotUpdatedEventIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByCreatedEventId: Connection<CorporateAction>;
  corporateActionsByDistributionCreatedEventIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByDistributionUpdatedEventIdAndCorporateActionId: Connection<CorporateAction>;
  corporateActionsByUpdatedEventId: Connection<CorporateAction>;
  corporateBallotVotesByCreatedEventId: Connection<CorporateBallotVote>;
  corporateBallotVotesByUpdatedEventId: Connection<CorporateBallotVote>;
  corporateBallotsByCorporateBallotVoteCreatedEventIdAndBallotId: Connection<CorporateBallot>;
  corporateBallotsByCorporateBallotVoteUpdatedEventIdAndBallotId: Connection<CorporateBallot>;
  corporateBallotsByCreatedEventId: Connection<CorporateBallot>;
  corporateBallotsByUpdatedEventId: Connection<CorporateBallot>;
  customAssetTypesByCreatedEventId: Connection<CustomAssetType>;
  customAssetTypesByUpdatedEventId: Connection<CustomAssetType>;
  customClaimTypesByClaimCreatedEventIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByClaimUpdatedEventIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByCreatedEventId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeCreatedEventIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeUpdatedEventIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByUpdatedEventId: Connection<CustomClaimType>;
  distributionPaymentsByCreatedEventId: Connection<DistributionPayment>;
  distributionsByCreatedEventId: Connection<Distribution>;
  distributionsByDistributionPaymentCreatedEventIdAndDistributionId: Connection<Distribution>;
  distributionsByUpdatedEventId: Connection<Distribution>;
  erasByEndEventId: Connection<Era>;
  erasByStartEventId: Connection<Era>;
  erasByValidatorEraCreatedEventIdAndEraId: Connection<Era>;
  erasByValidatorEraUpdatedEventIdAndEraId: Connection<Era>;
  eventId: EventIdEnum;
  eventIdText: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  eventsByAccountCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAccountUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAgentGroupCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAgentGroupMembershipCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAgentGroupMembershipUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAgentGroupUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentActionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentActionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAllowanceCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAllowanceUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetDocumentCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetDocumentUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetHolderCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetHolderUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMetadatumCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMetadatumUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetPreApprovalCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetPreApprovalUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAssetUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByAuthorizationUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCheckpointScheduleCompletedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCheckpointScheduleCompletedEventIdAndRemovedEventId: Connection<Event>;
  eventsByCheckpointScheduleCreatedEventIdAndCompletedEventId: Connection<Event>;
  eventsByCheckpointScheduleCreatedEventIdAndRemovedEventId: Connection<Event>;
  eventsByCheckpointScheduleRemovedEventIdAndCompletedEventId: Connection<Event>;
  eventsByCheckpointScheduleRemovedEventIdAndCreatedEventId: Connection<Event>;
  eventsByClaimCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByClaimUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByComplianceCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByComplianceUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountAssetCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAccountAssetUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAccountUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAssetUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialCurveTreeLeafCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialCurveTreeLeafUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialEncryptionKeyCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialEncryptionKeyUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialLegAffirmationCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialLegAffirmationUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialLegCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialLegUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialSettlementCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialSettlementUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateActionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateActionDefaultConfigCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateActionDefaultConfigUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateActionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateBallotUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotVoteCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateBallotVoteUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCustomAssetTypeCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCustomAssetTypeUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByCustomClaimTypeCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByCustomClaimTypeUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByEraEndEventIdAndStartEventId: Connection<Event>;
  eventsByEraStartEventIdAndEndEventId: Connection<Event>;
  eventsByGlobalMetadataKeyCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByGlobalMetadataKeyUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByHoldingUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityKeyCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityKeyUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionPartyCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionPartyUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByInvestmentCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByInvestmentUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByLegCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByLegUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigAdminCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigAdminUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigSignerCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigSignerUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByNftApprovalCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByNftApprovalUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByNftBurnedEventIdAndCreatedEventId: Connection<Event>;
  eventsByNftBurnedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByNftCreatedEventIdAndBurnedEventId: Connection<Event>;
  eventsByNftCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByNftUpdatedEventIdAndBurnedEventId: Connection<Event>;
  eventsByNftUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByOffChainReceiptCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByOffChainReceiptUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByPortfolioUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByProposalClosedEventIdAndCreatedEventId: Connection<Event>;
  eventsByProposalClosedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByProposalCreatedEventIdAndClosedEventId: Connection<Event>;
  eventsByProposalCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByProposalUpdatedEventIdAndClosedEventId: Connection<Event>;
  eventsByProposalUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByProposalVoteCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByProposalVoteUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByStakingPositionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByStatTypeCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByStatTypeUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByStoCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByStoUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsBySubsidyCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsBySubsidyUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByTickerReservationCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByTickerReservationUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByValidatorEraCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByValidatorEraUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorUpdatedEventIdAndCreatedEventId: Connection<Event>;
  eventsByVenueCreatedEventIdAndUpdatedEventId: Connection<Event>;
  eventsByVenueUpdatedEventIdAndCreatedEventId: Connection<Event>;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  extrinsicIdx?: Maybe<Scalars['Int']['output']>;
  extrinsicsByMultiSigProposalCreatedEventIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByMultiSigProposalUpdatedEventIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxEntryCreatedEventIdAndExtrinsicId: Connection<Extrinsic>;
  fundingsByCreatedEventId: Connection<Funding>;
  globalMetadataKeysByCreatedEventId: Connection<GlobalMetadataKey>;
  globalMetadataKeysByUpdatedEventId: Connection<GlobalMetadataKey>;
  holdingsByCreatedEventId: Connection<Holding>;
  holdingsByNftBurnedEventIdAndHoldingId: Connection<Holding>;
  holdingsByNftCreatedEventIdAndHoldingId: Connection<Holding>;
  holdingsByNftUpdatedEventIdAndHoldingId: Connection<Holding>;
  holdingsByUpdatedEventId: Connection<Holding>;
  id: Scalars['String']['output'];
  identitiesByAccountBalanceUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAccountCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAccountUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAgentGroupMembershipCreatedEventIdAndMemberId: Connection<Identity>;
  identitiesByAgentGroupMembershipUpdatedEventIdAndMemberId: Connection<Identity>;
  identitiesByAssetAgentActionCreatedEventIdAndCallerId: Connection<Identity>;
  identitiesByAssetAgentActionUpdatedEventIdAndCallerId: Connection<Identity>;
  identitiesByAssetAgentCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetAgentHistoryCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetAgentUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetCreatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByAssetHolderCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetHolderUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorCreatedEventIdAndAddedById: Connection<Identity>;
  identitiesByAssetMandatoryMediatorCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorUpdatedEventIdAndAddedById: Connection<Identity>;
  identitiesByAssetMandatoryMediatorUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetPreApprovalCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetPreApprovalUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByAssetTransactionCreatedEventIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionCreatedEventIdAndToIdentityId: Connection<Identity>;
  identitiesByAssetUpdatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByAuthorizationCreatedEventIdAndFromId: Connection<Identity>;
  identitiesByAuthorizationCreatedEventIdAndToId: Connection<Identity>;
  identitiesByAuthorizationUpdatedEventIdAndFromId: Connection<Identity>;
  identitiesByAuthorizationUpdatedEventIdAndToId: Connection<Identity>;
  identitiesByBridgeEventCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByClaimCreatedEventIdAndIssuerId: Connection<Identity>;
  identitiesByClaimCreatedEventIdAndTargetId: Connection<Identity>;
  identitiesByClaimUpdatedEventIdAndIssuerId: Connection<Identity>;
  identitiesByClaimUpdatedEventIdAndTargetId: Connection<Identity>;
  identitiesByConfidentialAccountCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAccountUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAssetCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAssetUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialEncryptionKeyCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialEncryptionKeyUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByCorporateBallotVoteCreatedEventIdAndVoterId: Connection<Identity>;
  identitiesByCorporateBallotVoteUpdatedEventIdAndVoterId: Connection<Identity>;
  identitiesByCreatedEventId: Connection<Identity>;
  identitiesByCustomClaimTypeCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByCustomClaimTypeUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionPaymentCreatedEventIdAndTargetId: Connection<Identity>;
  identitiesByDistributionUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByHoldingCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByHoldingUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByIdentityKeyCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByIdentityKeyUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationCreatedEventIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationUpdatedEventIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionCreatedEventIdAndRejectedById: Connection<Identity>;
  identitiesByInstructionEventCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionPartyCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionPartyUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionUpdatedEventIdAndRejectedById: Connection<Identity>;
  identitiesByInvestmentCreatedEventIdAndInvestorId: Connection<Identity>;
  identitiesByInvestmentUpdatedEventIdAndInvestorId: Connection<Identity>;
  identitiesByLegCreatedEventIdAndFromId: Connection<Identity>;
  identitiesByLegCreatedEventIdAndToId: Connection<Identity>;
  identitiesByLegUpdatedEventIdAndFromId: Connection<Identity>;
  identitiesByLegUpdatedEventIdAndToId: Connection<Identity>;
  identitiesByMultiSigAdminCreatedEventIdAndAdminId: Connection<Identity>;
  identitiesByMultiSigAdminUpdatedEventIdAndAdminId: Connection<Identity>;
  identitiesByMultiSigCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigProposalCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigProposalUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByPolyxEntryCreatedEventIdAndCounterpartyIdentityId: Connection<Identity>;
  identitiesByPolyxEntryCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioCreatedEventIdAndCustodianId: Connection<Identity>;
  identitiesByPortfolioCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioUpdatedEventIdAndCustodianId: Connection<Identity>;
  identitiesByPortfolioUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByProposalClosedEventIdAndOwnerId: Connection<Identity>;
  identitiesByProposalCreatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByProposalUpdatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByStakingEventCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByStakingPositionCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByStakingPositionUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByStatTypeCreatedEventIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStatTypeUpdatedEventIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStoCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByStoUpdatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByTickerReservationCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByTickerReservationUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByTransferComplianceCreatedEventIdAndClaimIssuerId: Connection<Identity>;
  identitiesByTransferComplianceExemptionCreatedEventIdAndExemptedEntityId: Connection<Identity>;
  identitiesByTransferComplianceExemptionUpdatedEventIdAndExemptedEntityId: Connection<Identity>;
  identitiesByTransferComplianceUpdatedEventIdAndClaimIssuerId: Connection<Identity>;
  identitiesByTrustedClaimIssuerCreatedEventIdAndIssuerId: Connection<Identity>;
  identitiesByTrustedClaimIssuerUpdatedEventIdAndIssuerId: Connection<Identity>;
  identitiesByUpdatedEventId: Connection<Identity>;
  identitiesByValidatorCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByValidatorEraCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByValidatorEraUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByValidatorUpdatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByVenueCreatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByVenueUpdatedEventIdAndOwnerId: Connection<Identity>;
  identityKeysByCreatedEventId: Connection<IdentityKey>;
  identityKeysByUpdatedEventId: Connection<IdentityKey>;
  instructionAffirmationsByCreatedEventId: Connection<InstructionAffirmation>;
  instructionAffirmationsByUpdatedEventId: Connection<InstructionAffirmation>;
  instructionEventsByCreatedEventId: Connection<InstructionEvent>;
  instructionPartiesByCreatedEventId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationCreatedEventIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationUpdatedEventIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByUpdatedEventId: Connection<InstructionParty>;
  instructionsByAssetTransactionCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByCreatedEventId: Connection<Instruction>;
  instructionsByInstructionAffirmationCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationUpdatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionPartyCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionPartyUpdatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByLegCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByLegUpdatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByUpdatedEventId: Connection<Instruction>;
  investmentsByCreatedEventId: Connection<Investment>;
  investmentsByUpdatedEventId: Connection<Investment>;
  legsByCreatedEventId: Connection<Leg>;
  legsByOffChainReceiptCreatedEventIdAndLegId: Connection<Leg>;
  legsByOffChainReceiptUpdatedEventIdAndLegId: Connection<Leg>;
  legsByUpdatedEventId: Connection<Leg>;
  moduleId: ModuleIdEnum;
  moduleIdText: Scalars['String']['output'];
  multiSigAdminsByCreatedEventId: Connection<MultiSigAdmin>;
  multiSigAdminsByUpdatedEventId: Connection<MultiSigAdmin>;
  multiSigProposalVotesByCreatedEventId: Connection<MultiSigProposalVote>;
  multiSigProposalVotesByUpdatedEventId: Connection<MultiSigProposalVote>;
  multiSigProposalsByCreatedEventId: Connection<MultiSigProposal>;
  multiSigProposalsByMultiSigProposalVoteCreatedEventIdAndProposalId: Connection<MultiSigProposal>;
  multiSigProposalsByMultiSigProposalVoteUpdatedEventIdAndProposalId: Connection<MultiSigProposal>;
  multiSigProposalsByUpdatedEventId: Connection<MultiSigProposal>;
  multiSigSignersByCreatedEventId: Connection<MultiSigSigner>;
  multiSigSignersByMultiSigProposalVoteCreatedEventIdAndSignerId: Connection<MultiSigSigner>;
  multiSigSignersByMultiSigProposalVoteUpdatedEventIdAndSignerId: Connection<MultiSigSigner>;
  multiSigSignersByUpdatedEventId: Connection<MultiSigSigner>;
  multiSigsByCreatedEventId: Connection<MultiSig>;
  multiSigsByMultiSigAdminCreatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigAdminUpdatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigProposalCreatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigProposalUpdatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigSignerCreatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigSignerUpdatedEventIdAndMultisigId: Connection<MultiSig>;
  multiSigsByUpdatedEventId: Connection<MultiSig>;
  nftApprovalsByCreatedEventId: Connection<NftApproval>;
  nftApprovalsByUpdatedEventId: Connection<NftApproval>;
  nftOperatorApprovalsByCreatedEventId: Connection<NftOperatorApproval>;
  nftsByBurnedEventId: Connection<Nft>;
  nftsByCreatedEventId: Connection<Nft>;
  nftsByNftApprovalCreatedEventIdAndNftId: Connection<Nft>;
  nftsByNftApprovalUpdatedEventIdAndNftId: Connection<Nft>;
  nftsByUpdatedEventId: Connection<Nft>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByCreatedEventId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationCreatedEventIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationUpdatedEventIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventCreatedEventIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByUpdatedEventId: Connection<OffChainReceipt>;
  polyxEntriesByCreatedEventId: Connection<PolyxEntry>;
  portfoliosByAssetTransactionCreatedEventIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionCreatedEventIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByCreatedEventId: Connection<Portfolio>;
  portfoliosByDistributionCreatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionUpdatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByHoldingCreatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByHoldingUpdatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationCreatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationUpdatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventCreatedEventIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByLegCreatedEventIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegCreatedEventIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByLegUpdatedEventIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegUpdatedEventIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatedEventIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatedEventIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByStoUpdatedEventIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoUpdatedEventIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByUpdatedEventId: Connection<Portfolio>;
  proposalVotesByCreatedEventId: Connection<ProposalVote>;
  proposalVotesByUpdatedEventId: Connection<ProposalVote>;
  proposalsByClosedEventId: Connection<Proposal>;
  proposalsByCreatedEventId: Connection<Proposal>;
  proposalsByProposalVoteCreatedEventIdAndProposalId: Connection<Proposal>;
  proposalsByProposalVoteUpdatedEventIdAndProposalId: Connection<Proposal>;
  proposalsByUpdatedEventId: Connection<Proposal>;
  refs?: Maybe<Scalars['JSON']['output']>;
  slashesByCreatedEventId: Connection<Slash>;
  specVersionId: Scalars['Int']['output'];
  stakingEventsByCreatedEventId: Connection<StakingEvent>;
  stakingPositionsByCreatedEventId: Connection<StakingPosition>;
  stakingPositionsByStakingEventCreatedEventIdAndPositionId: Connection<StakingPosition>;
  stakingPositionsByUpdatedEventId: Connection<StakingPosition>;
  statTypesByCreatedEventId: Connection<StatType>;
  statTypesByTransferComplianceCreatedEventIdAndStatTypeId: Connection<StatType>;
  statTypesByTransferComplianceUpdatedEventIdAndStatTypeId: Connection<StatType>;
  statTypesByUpdatedEventId: Connection<StatType>;
  stosByCreatedEventId: Connection<Sto>;
  stosByInvestmentCreatedEventIdAndStoId: Connection<Sto>;
  stosByInvestmentUpdatedEventIdAndStoId: Connection<Sto>;
  stosByUpdatedEventId: Connection<Sto>;
  subsidiesByCreatedEventId: Connection<Subsidy>;
  subsidiesByUpdatedEventId: Connection<Subsidy>;
  tickerReservationsByCreatedEventId: Connection<TickerReservation>;
  tickerReservationsByUpdatedEventId: Connection<TickerReservation>;
  transferComplianceExemptionsByCreatedEventId: Connection<TransferComplianceExemption>;
  transferComplianceExemptionsByUpdatedEventId: Connection<TransferComplianceExemption>;
  transferCompliancesByCreatedEventId: Connection<TransferCompliance>;
  transferCompliancesByUpdatedEventId: Connection<TransferCompliance>;
  trustedClaimIssuersByCreatedEventId: Connection<TrustedClaimIssuer>;
  trustedClaimIssuersByUpdatedEventId: Connection<TrustedClaimIssuer>;
  validatorErasByCreatedEventId: Connection<ValidatorEra>;
  validatorErasByUpdatedEventId: Connection<ValidatorEra>;
  validatorsByCreatedEventId: Connection<Validator>;
  validatorsBySlashCreatedEventIdAndValidatorId: Connection<Validator>;
  validatorsByStakingEventCreatedEventIdAndValidatorId: Connection<Validator>;
  validatorsByUpdatedEventId: Connection<Validator>;
  validatorsByValidatorEraCreatedEventIdAndValidatorId: Connection<Validator>;
  validatorsByValidatorEraUpdatedEventIdAndValidatorId: Connection<Validator>;
  venuesByCreatedEventId: Connection<Venue>;
  venuesByInstructionCreatedEventIdAndVenueId: Connection<Venue>;
  venuesByInstructionUpdatedEventIdAndVenueId: Connection<Venue>;
  venuesByStoCreatedEventIdAndVenueId: Connection<Venue>;
  venuesByStoUpdatedEventIdAndVenueId: Connection<Venue>;
  venuesByUpdatedEventId: Connection<Venue>;
};
export type EventFilter = {
  accountBalancesByUpdatedEventId?: InputMaybe<OneToManyFilter<AccountBalanceFilter>>;
  accountsByCreatedEventId?: InputMaybe<OneToManyFilter<AccountFilter>>;
  accountsByUpdatedEventId?: InputMaybe<OneToManyFilter<AccountFilter>>;
  agentGroupMembershipsByCreatedEventId?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  agentGroupMembershipsByUpdatedEventId?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  agentGroupsByCreatedEventId?: InputMaybe<OneToManyFilter<AgentGroupFilter>>;
  agentGroupsByUpdatedEventId?: InputMaybe<OneToManyFilter<AgentGroupFilter>>;
  and?: InputMaybe<Array<EventFilter>>;
  args?: InputMaybe<JsonFilter>;
  assetAgentActionsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetAgentActionFilter>>;
  assetAgentActionsByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetAgentActionFilter>>;
  assetAgentHistoriesByCreatedEventId?: InputMaybe<OneToManyFilter<AssetAgentHistoryFilter>>;
  assetAgentsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetAgentFilter>>;
  assetAgentsByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetAgentFilter>>;
  assetAllowancesByCreatedEventId?: InputMaybe<OneToManyFilter<AssetAllowanceFilter>>;
  assetAllowancesByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetAllowanceFilter>>;
  assetDocumentsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  assetDocumentsByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  assetHoldersByCreatedEventId?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  assetHoldersByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  assetMandatoryMediatorsByCreatedEventId?: InputMaybe<
    OneToManyFilter<AssetMandatoryMediatorFilter>
  >;
  assetMandatoryMediatorsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<AssetMandatoryMediatorFilter>
  >;
  assetMetadataByCreatedEventId?: InputMaybe<OneToManyFilter<AssetMetadatumFilter>>;
  assetMetadataByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetMetadatumFilter>>;
  assetPreApprovalsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetPreApprovalsByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetTransactionsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  assetsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  assetsByUpdatedEventId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  authorizationsByCreatedEventId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  authorizationsByUpdatedEventId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  bridgeEventsByCreatedEventId?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  checkpointSchedulesByCompletedEventId?: InputMaybe<OneToManyFilter<CheckpointScheduleFilter>>;
  checkpointSchedulesByCreatedEventId?: InputMaybe<OneToManyFilter<CheckpointScheduleFilter>>;
  checkpointSchedulesByRemovedEventId?: InputMaybe<OneToManyFilter<CheckpointScheduleFilter>>;
  checkpointsByCreatedEventId?: InputMaybe<OneToManyFilter<CheckpointFilter>>;
  claimsByCreatedEventId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  claimsByUpdatedEventId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  compliancesByCreatedEventId?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  compliancesByUpdatedEventId?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  confidentialAccountAssetsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialAccountAssetFilter>
  >;
  confidentialAccountAssetsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialAccountAssetFilter>
  >;
  confidentialAccountsByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAccountsByUpdatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAssetKeysByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAssetKeyFilter>>;
  confidentialAssetsByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialAssetsByUpdatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialCurveTreeLeavesByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialCurveTreeLeafFilter>
  >;
  confidentialCurveTreeLeavesByUpdatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialCurveTreeLeafFilter>
  >;
  confidentialEncryptionKeysByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialEncryptionKeyFilter>
  >;
  confidentialEncryptionKeysByUpdatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialEncryptionKeyFilter>
  >;
  confidentialLegAffirmationsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialLegAffirmationFilter>
  >;
  confidentialLegAffirmationsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialLegAffirmationFilter>
  >;
  confidentialLegsByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialLegsByUpdatedEventId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialSettlementsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialSettlementFilter>
  >;
  confidentialSettlementsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialSettlementFilter>
  >;
  corporateActionDefaultConfigsByCreatedEventId?: InputMaybe<
    OneToManyFilter<CorporateActionDefaultConfigFilter>
  >;
  corporateActionDefaultConfigsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<CorporateActionDefaultConfigFilter>
  >;
  corporateActionsByCreatedEventId?: InputMaybe<OneToManyFilter<CorporateActionFilter>>;
  corporateActionsByUpdatedEventId?: InputMaybe<OneToManyFilter<CorporateActionFilter>>;
  corporateBallotVotesByCreatedEventId?: InputMaybe<OneToManyFilter<CorporateBallotVoteFilter>>;
  corporateBallotVotesByUpdatedEventId?: InputMaybe<OneToManyFilter<CorporateBallotVoteFilter>>;
  corporateBallotsByCreatedEventId?: InputMaybe<OneToManyFilter<CorporateBallotFilter>>;
  corporateBallotsByUpdatedEventId?: InputMaybe<OneToManyFilter<CorporateBallotFilter>>;
  customAssetTypesByCreatedEventId?: InputMaybe<OneToManyFilter<CustomAssetTypeFilter>>;
  customAssetTypesByUpdatedEventId?: InputMaybe<OneToManyFilter<CustomAssetTypeFilter>>;
  customClaimTypesByCreatedEventId?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  customClaimTypesByUpdatedEventId?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  distributionPaymentsByCreatedEventId?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  distributionsByCreatedEventId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  distributionsByUpdatedEventId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  erasByEndEventId?: InputMaybe<OneToManyFilter<EraFilter>>;
  erasByStartEventId?: InputMaybe<OneToManyFilter<EraFilter>>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdText?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  fundingsByCreatedEventId?: InputMaybe<OneToManyFilter<FundingFilter>>;
  globalMetadataKeysByCreatedEventId?: InputMaybe<OneToManyFilter<GlobalMetadataKeyFilter>>;
  globalMetadataKeysByUpdatedEventId?: InputMaybe<OneToManyFilter<GlobalMetadataKeyFilter>>;
  holdingsByCreatedEventId?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  holdingsByUpdatedEventId?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  identitiesByCreatedEventId?: InputMaybe<OneToManyFilter<IdentityFilter>>;
  identitiesByUpdatedEventId?: InputMaybe<OneToManyFilter<IdentityFilter>>;
  identityKeysByCreatedEventId?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  identityKeysByUpdatedEventId?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  instructionAffirmationsByCreatedEventId?: InputMaybe<
    OneToManyFilter<InstructionAffirmationFilter>
  >;
  instructionAffirmationsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<InstructionAffirmationFilter>
  >;
  instructionEventsByCreatedEventId?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionPartiesByCreatedEventId?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  instructionPartiesByUpdatedEventId?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  instructionsByCreatedEventId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  instructionsByUpdatedEventId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  investmentsByCreatedEventId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  investmentsByUpdatedEventId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  legsByCreatedEventId?: InputMaybe<OneToManyFilter<LegFilter>>;
  legsByUpdatedEventId?: InputMaybe<OneToManyFilter<LegFilter>>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  moduleIdText?: InputMaybe<StringFilter>;
  multiSigAdminsByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  multiSigAdminsByUpdatedEventId?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  multiSigProposalVotesByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
  multiSigProposalVotesByUpdatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
  multiSigProposalsByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigProposalsByUpdatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigSignersByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  multiSigSignersByUpdatedEventId?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  multiSigsByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  multiSigsByUpdatedEventId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  nftApprovalsByCreatedEventId?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  nftApprovalsByUpdatedEventId?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  nftOperatorApprovalsByCreatedEventId?: InputMaybe<OneToManyFilter<NftOperatorApprovalFilter>>;
  nftsByBurnedEventId?: InputMaybe<OneToManyFilter<NftFilter>>;
  nftsByCreatedEventId?: InputMaybe<OneToManyFilter<NftFilter>>;
  nftsByUpdatedEventId?: InputMaybe<OneToManyFilter<NftFilter>>;
  not?: InputMaybe<EventFilter>;
  offChainReceiptsByCreatedEventId?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  offChainReceiptsByUpdatedEventId?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  or?: InputMaybe<Array<EventFilter>>;
  polyxEntriesByCreatedEventId?: InputMaybe<OneToManyFilter<PolyxEntryFilter>>;
  portfoliosByCreatedEventId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  portfoliosByUpdatedEventId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  proposalVotesByCreatedEventId?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
  proposalVotesByUpdatedEventId?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
  proposalsByClosedEventId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  proposalsByCreatedEventId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  proposalsByUpdatedEventId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  refs?: InputMaybe<JsonFilter>;
  slashesByCreatedEventId?: InputMaybe<OneToManyFilter<SlashFilter>>;
  specVersionId?: InputMaybe<IntFilter>;
  stakingEventsByCreatedEventId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stakingPositionsByCreatedEventId?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  stakingPositionsByUpdatedEventId?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  statTypesByCreatedEventId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  statTypesByUpdatedEventId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  stosByCreatedEventId?: InputMaybe<OneToManyFilter<StoFilter>>;
  stosByUpdatedEventId?: InputMaybe<OneToManyFilter<StoFilter>>;
  subsidiesByCreatedEventId?: InputMaybe<OneToManyFilter<SubsidyFilter>>;
  subsidiesByUpdatedEventId?: InputMaybe<OneToManyFilter<SubsidyFilter>>;
  tickerReservationsByCreatedEventId?: InputMaybe<OneToManyFilter<TickerReservationFilter>>;
  tickerReservationsByUpdatedEventId?: InputMaybe<OneToManyFilter<TickerReservationFilter>>;
  transferComplianceExemptionsByCreatedEventId?: InputMaybe<
    OneToManyFilter<TransferComplianceExemptionFilter>
  >;
  transferComplianceExemptionsByUpdatedEventId?: InputMaybe<
    OneToManyFilter<TransferComplianceExemptionFilter>
  >;
  transferCompliancesByCreatedEventId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  transferCompliancesByUpdatedEventId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  trustedClaimIssuersByCreatedEventId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  trustedClaimIssuersByUpdatedEventId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  validatorErasByCreatedEventId?: InputMaybe<OneToManyFilter<ValidatorEraFilter>>;
  validatorErasByUpdatedEventId?: InputMaybe<OneToManyFilter<ValidatorEraFilter>>;
  validatorsByCreatedEventId?: InputMaybe<OneToManyFilter<ValidatorFilter>>;
  validatorsByUpdatedEventId?: InputMaybe<OneToManyFilter<ValidatorFilter>>;
  venuesByCreatedEventId?: InputMaybe<OneToManyFilter<VenueFilter>>;
  venuesByUpdatedEventId?: InputMaybe<OneToManyFilter<VenueFilter>>;
};
export enum EventIdEnum {
  AcceptedPayingKey = 'AcceptedPayingKey',
  AcceptedSubsidy = 'AcceptedSubsidy',
  AccountAssetFrozen = 'AccountAssetFrozen',
  AccountAssetRegistered = 'AccountAssetRegistered',
  AccountAssetUnfrozen = 'AccountAssetUnfrozen',
  AccountBalanceBurned = 'AccountBalanceBurned',
  AccountCreated = 'AccountCreated',
  AccountCurveTreeRootUpdated = 'AccountCurveTreeRootUpdated',
  AccountDeposit = 'AccountDeposit',
  AccountDepositIncoming = 'AccountDepositIncoming',
  AccountRegistered = 'AccountRegistered',
  AccountStateLeafInserted = 'AccountStateLeafInserted',
  AccountWithdraw = 'AccountWithdraw',
  ActiveLimitChanged = 'ActiveLimitChanged',
  ActivePipLimitChanged = 'ActivePipLimitChanged',
  AdminChanged = 'AdminChanged',
  AffirmationWithdrawn = 'AffirmationWithdrawn',
  AgendaIncomplete = 'AgendaIncomplete',
  AgentAdded = 'AgentAdded',
  AgentRemoved = 'AgentRemoved',
  AllGood = 'AllGood',
  AllowIdentityToCreatePortfolios = 'AllowIdentityToCreatePortfolios',
  AllowanceSpent = 'AllowanceSpent',
  ApiHashUpdated = 'ApiHashUpdated',
  Approval = 'Approval',
  Approved = 'Approved',
  ApprovedSubsidy = 'ApprovedSubsidy',
  AssetAffirmationExemption = 'AssetAffirmationExemption',
  AssetBalanceUpdated = 'AssetBalanceUpdated',
  AssetCompliancePaused = 'AssetCompliancePaused',
  AssetComplianceReplaced = 'AssetComplianceReplaced',
  AssetComplianceReset = 'AssetComplianceReset',
  AssetComplianceResumed = 'AssetComplianceResumed',
  AssetCreated = 'AssetCreated',
  AssetCurveTreeRootUpdated = 'AssetCurveTreeRootUpdated',
  AssetDidRegistered = 'AssetDidRegistered',
  AssetFrozen = 'AssetFrozen',
  AssetMediatorsAdded = 'AssetMediatorsAdded',
  AssetMediatorsRemoved = 'AssetMediatorsRemoved',
  AssetMinted = 'AssetMinted',
  AssetOwnershipTransferred = 'AssetOwnershipTransferred',
  AssetPurchased = 'AssetPurchased',
  AssetRenamed = 'AssetRenamed',
  AssetRuleChanged = 'AssetRuleChanged',
  AssetRuleRemoved = 'AssetRuleRemoved',
  AssetRulesPaused = 'AssetRulesPaused',
  AssetRulesReplaced = 'AssetRulesReplaced',
  AssetRulesReset = 'AssetRulesReset',
  AssetRulesResumed = 'AssetRulesResumed',
  AssetStateLeafUpdated = 'AssetStateLeafUpdated',
  AssetStatsUpdated = 'AssetStatsUpdated',
  AssetTypeChanged = 'AssetTypeChanged',
  AssetUnfrozen = 'AssetUnfrozen',
  AssetUpdated = 'AssetUpdated',
  AuthorizationAdded = 'AuthorizationAdded',
  AuthorizationConsumed = 'AuthorizationConsumed',
  AuthorizationRejected = 'AuthorizationRejected',
  AuthorizationRetryLimitReached = 'AuthorizationRetryLimitReached',
  AuthorizationRevoked = 'AuthorizationRevoked',
  AuthorizedPayingKey = 'AuthorizedPayingKey',
  AutoMigrationFinished = 'AutoMigrationFinished',
  AutomaticPayoutFinished = 'AutomaticPayoutFinished',
  BalanceSet = 'BalanceSet',
  BallotCancelled = 'BallotCancelled',
  BallotCreated = 'BallotCreated',
  BatchCompleted = 'BatchCompleted',
  BatchCompletedOld = 'BatchCompletedOld',
  BatchCompletedWithErrors = 'BatchCompletedWithErrors',
  BatchInterrupted = 'BatchInterrupted',
  BatchInterruptedOld = 'BatchInterruptedOld',
  BatchOptimisticFailed = 'BatchOptimisticFailed',
  BenefitClaimed = 'BenefitClaimed',
  Bonded = 'Bonded',
  BridgeLimitUpdated = 'BridgeLimitUpdated',
  BridgeTxFailed = 'BridgeTxFailed',
  BridgeTxScheduleFailed = 'BridgeTxScheduleFailed',
  BridgeTxScheduled = 'BridgeTxScheduled',
  Bridged = 'Bridged',
  Burned = 'Burned',
  BurnedDebt = 'BurnedDebt',
  BurnedHeld = 'BurnedHeld',
  CaaTransferred = 'CAATransferred',
  CaInitiated = 'CAInitiated',
  CaLinkedToDoc = 'CALinkedToDoc',
  CaRemoved = 'CARemoved',
  CallLookupFailed = 'CallLookupFailed',
  CallUnavailable = 'CallUnavailable',
  Called = 'Called',
  Canceled = 'Canceled',
  CddClaimsInvalidated = 'CddClaimsInvalidated',
  CddRequirementForMasterKeyUpdated = 'CddRequirementForMasterKeyUpdated',
  CddRequirementForPrimaryKeyUpdated = 'CddRequirementForPrimaryKeyUpdated',
  CddStatus = 'CddStatus',
  CheckpointCreated = 'CheckpointCreated',
  ChildDidCreated = 'ChildDidCreated',
  ChildDidUnlinked = 'ChildDidUnlinked',
  Chilled = 'Chilled',
  ClaimAdded = 'ClaimAdded',
  ClaimRevoked = 'ClaimRevoked',
  ClassicTickerClaimed = 'ClassicTickerClaimed',
  Cleared = 'Cleared',
  Closed = 'Closed',
  CodeRemoved = 'CodeRemoved',
  CodeStored = 'CodeStored',
  CodeUpdated = 'CodeUpdated',
  CoefficientSet = 'CoefficientSet',
  CommissionCapUpdated = 'CommissionCapUpdated',
  ComplianceRequirementChanged = 'ComplianceRequirementChanged',
  ComplianceRequirementCreated = 'ComplianceRequirementCreated',
  ComplianceRequirementRemoved = 'ComplianceRequirementRemoved',
  ContractCodeUpdated = 'ContractCodeUpdated',
  ContractEmitted = 'ContractEmitted',
  ContractExecution = 'ContractExecution',
  ControllerBatchDeprecated = 'ControllerBatchDeprecated',
  ControllerChanged = 'ControllerChanged',
  ControllerRedemption = 'ControllerRedemption',
  ControllerTransfer = 'ControllerTransfer',
  ControllerTransferTo = 'ControllerTransferTo',
  Created = 'Created',
  CreatedAssetTransfer = 'CreatedAssetTransfer',
  CurrencyMigrated = 'CurrencyMigrated',
  CustodyAllowanceChanged = 'CustodyAllowanceChanged',
  CustodyTransfer = 'CustodyTransfer',
  CustomAssetTypeExists = 'CustomAssetTypeExists',
  CustomAssetTypeRegistered = 'CustomAssetTypeRegistered',
  CustomClaimTypeAdded = 'CustomClaimTypeAdded',
  DefaultEnactmentPeriodChanged = 'DefaultEnactmentPeriodChanged',
  DefaultTargetIdentitiesChanged = 'DefaultTargetIdentitiesChanged',
  DefaultWithholdingTaxChanged = 'DefaultWithholdingTaxChanged',
  DelegateCalled = 'DelegateCalled',
  Deposit = 'Deposit',
  DepositPoked = 'DepositPoked',
  DidCreated = 'DidCreated',
  DidStatus = 'DidStatus',
  DidWithholdingTaxChanged = 'DidWithholdingTaxChanged',
  Dispatched = 'Dispatched',
  DispatchedAs = 'DispatchedAs',
  DividendCanceled = 'DividendCanceled',
  DividendCreated = 'DividendCreated',
  DividendPaidOutToUser = 'DividendPaidOutToUser',
  DividendRemainingClaimed = 'DividendRemainingClaimed',
  DivisibilityChanged = 'DivisibilityChanged',
  DocumentAdded = 'DocumentAdded',
  DocumentRemoved = 'DocumentRemoved',
  Dummy = 'Dummy',
  DustLost = 'DustLost',
  ElectionFailed = 'ElectionFailed',
  ElectionFinalized = 'ElectionFinalized',
  EncryptionKeyRegistered = 'EncryptionKeyRegistered',
  Endowed = 'Endowed',
  EraPaid = 'EraPaid',
  EraPayout = 'EraPayout',
  EthExtrinsicRevert = 'EthExtrinsicRevert',
  Evicted = 'Evicted',
  Executed = 'Executed',
  ExecutionCancellingFailed = 'ExecutionCancellingFailed',
  ExecutionScheduled = 'ExecutionScheduled',
  ExecutionSchedulingFailed = 'ExecutionSchedulingFailed',
  ExemptedUpdated = 'ExemptedUpdated',
  ExemptionListModified = 'ExemptionListModified',
  ExemptionsAdded = 'ExemptionsAdded',
  ExemptionsRemoved = 'ExemptionsRemoved',
  ExpiresAfterUpdated = 'ExpiresAfterUpdated',
  ExpiryScheduled = 'ExpiryScheduled',
  ExpirySchedulingFailed = 'ExpirySchedulingFailed',
  ExtensionAdded = 'ExtensionAdded',
  ExtensionArchived = 'ExtensionArchived',
  ExtensionRemoved = 'ExtensionRemoved',
  ExtensionUnArchive = 'ExtensionUnArchive',
  ExtrinsicFailed = 'ExtrinsicFailed',
  ExtrinsicSuccess = 'ExtrinsicSuccess',
  FailedToExecuteInstruction = 'FailedToExecuteInstruction',
  FeeAccountCurveTreeRootUpdated = 'FeeAccountCurveTreeRootUpdated',
  FeeAccountDeposited = 'FeeAccountDeposited',
  FeeAccountStateLeafInserted = 'FeeAccountStateLeafInserted',
  FeeAccountUpdated = 'FeeAccountUpdated',
  FeeAccountWithdrawn = 'FeeAccountWithdrawn',
  FeeCharged = 'FeeCharged',
  FeeSet = 'FeeSet',
  FinalVotes = 'FinalVotes',
  ForceEra = 'ForceEra',
  FreezeAdminAdded = 'FreezeAdminAdded',
  FreezeAdminRemoved = 'FreezeAdminRemoved',
  Frozen = 'Frozen',
  FrozenBalanceSet = 'FrozenBalanceSet',
  FrozenTx = 'FrozenTx',
  FundingRoundSet = 'FundingRoundSet',
  FundraiserClosed = 'FundraiserClosed',
  FundraiserCreated = 'FundraiserCreated',
  FundraiserFrozen = 'FundraiserFrozen',
  FundraiserOffchainFundingEnabled = 'FundraiserOffchainFundingEnabled',
  FundraiserUnfrozen = 'FundraiserUnfrozen',
  FundraiserWindowModifed = 'FundraiserWindowModifed',
  FundraiserWindowModified = 'FundraiserWindowModified',
  FundsMoved = 'FundsMoved',
  FundsMovedBetweenPortfolios = 'FundsMovedBetweenPortfolios',
  FundsRaised = 'FundsRaised',
  FundsTransferred = 'FundsTransferred',
  FungibleTokensMovedBetweenPortfolios = 'FungibleTokensMovedBetweenPortfolios',
  GlobalCommissionUpdated = 'GlobalCommissionUpdated',
  GlobalMetadataSpecUpdated = 'GlobalMetadataSpecUpdated',
  GroupChanged = 'GroupChanged',
  GroupCreated = 'GroupCreated',
  GroupPermissionsUpdated = 'GroupPermissionsUpdated',
  Halted = 'Halted',
  HeartbeatReceived = 'HeartbeatReceived',
  Held = 'Held',
  HistoricCleared = 'HistoricCleared',
  HistoricalPipsPruned = 'HistoricalPipsPruned',
  IdentifiersUpdated = 'IdentifiersUpdated',
  IndexAssigned = 'IndexAssigned',
  IndexFreed = 'IndexFreed',
  IndexFrozen = 'IndexFrozen',
  IndividualCommissionEnabled = 'IndividualCommissionEnabled',
  Instantiated = 'Instantiated',
  InstantiationFeeChanged = 'InstantiationFeeChanged',
  InstantiationFreezed = 'InstantiationFreezed',
  InstantiationUnFreezed = 'InstantiationUnFreezed',
  InstructionAffirmed = 'InstructionAffirmed',
  InstructionAuthorized = 'InstructionAuthorized',
  InstructionAutomaticallyAffirmed = 'InstructionAutomaticallyAffirmed',
  InstructionCreated = 'InstructionCreated',
  InstructionExecuted = 'InstructionExecuted',
  InstructionFailed = 'InstructionFailed',
  InstructionLocked = 'InstructionLocked',
  InstructionMediators = 'InstructionMediators',
  InstructionRejected = 'InstructionRejected',
  InstructionRescheduled = 'InstructionRescheduled',
  InstructionUnauthorized = 'InstructionUnauthorized',
  InstructionUnlocked = 'InstructionUnlocked',
  InstructionV2Created = 'InstructionV2Created',
  InvalidatedNominators = 'InvalidatedNominators',
  Invested = 'Invested',
  InvestorUniquenessClaimNotAllowed = 'InvestorUniquenessClaimNotAllowed',
  IsIssuable = 'IsIssuable',
  Issued = 'Issued',
  IssuedNft = 'IssuedNFT',
  ItemCompleted = 'ItemCompleted',
  ItemFailed = 'ItemFailed',
  ItnRewardClaimed = 'ItnRewardClaimed',
  KeyChanged = 'KeyChanged',
  KeyRemoved = 'KeyRemoved',
  Kicked = 'Kicked',
  KilledAccount = 'KilledAccount',
  LegFailedExecution = 'LegFailedExecution',
  LocalMetadataKeyDeleted = 'LocalMetadataKeyDeleted',
  Locked = 'Locked',
  MandatoryReceiverAffirmationSet = 'MandatoryReceiverAffirmationSet',
  MasterKeyUpdated = 'MasterKeyUpdated',
  MaxDetailsLengthChanged = 'MaxDetailsLengthChanged',
  MaxPipSkipCountChanged = 'MaxPipSkipCountChanged',
  MaximumSchedulesComplexityChanged = 'MaximumSchedulesComplexityChanged',
  MediatorAffirmationReceived = 'MediatorAffirmationReceived',
  MediatorAffirmationWithdrawn = 'MediatorAffirmationWithdrawn',
  MediatorAffirmed = 'MediatorAffirmed',
  MediatorRejected = 'MediatorRejected',
  MemberAdded = 'MemberAdded',
  MemberRemoved = 'MemberRemoved',
  MemberRevoked = 'MemberRevoked',
  MembersReset = 'MembersReset',
  MembersSwapped = 'MembersSwapped',
  MetaChanged = 'MetaChanged',
  MetadataValueDeleted = 'MetadataValueDeleted',
  Migrated = 'Migrated',
  MigrationAdvanced = 'MigrationAdvanced',
  MigrationCompleted = 'MigrationCompleted',
  MigrationFailed = 'MigrationFailed',
  MigrationSkipped = 'MigrationSkipped',
  MinimumBondThresholdUpdated = 'MinimumBondThresholdUpdated',
  MinimumProposalDepositChanged = 'MinimumProposalDepositChanged',
  Minted = 'Minted',
  MintedCredit = 'MintedCredit',
  MockInvestorUidCreated = 'MockInvestorUIDCreated',
  MovedBetweenPortfolios = 'MovedBetweenPortfolios',
  MultiSigAddedAdmin = 'MultiSigAddedAdmin',
  MultiSigCreated = 'MultiSigCreated',
  MultiSigRemovedAdmin = 'MultiSigRemovedAdmin',
  MultiSigRemovedPayingDid = 'MultiSigRemovedPayingDid',
  MultiSigSignaturesRequiredChanged = 'MultiSigSignaturesRequiredChanged',
  MultiSigSignerAdded = 'MultiSigSignerAdded',
  MultiSigSignerAuthorized = 'MultiSigSignerAuthorized',
  MultiSigSignerRemoved = 'MultiSigSignerRemoved',
  MultiSigSignersAuthorized = 'MultiSigSignersAuthorized',
  MultiSigSignersRemoved = 'MultiSigSignersRemoved',
  MultiSigSignersRequiredChanged = 'MultiSigSignersRequiredChanged',
  NftApproval = 'NFTApproval',
  NftApprovalForAll = 'NFTApprovalForAll',
  NftApprovalSpent = 'NFTApprovalSpent',
  NftHoldingsUpdated = 'NFTHoldingsUpdated',
  NftPortfolioUpdated = 'NFTPortfolioUpdated',
  NfTsMovedBetweenPortfolios = 'NFTsMovedBetweenPortfolios',
  NewAccount = 'NewAccount',
  NewAssetRuleCreated = 'NewAssetRuleCreated',
  NewAuthorities = 'NewAuthorities',
  NewQueued = 'NewQueued',
  NewSession = 'NewSession',
  NftCollectionCreated = 'NftCollectionCreated',
  Nominated = 'Nominated',
  Noted = 'Noted',
  OffChainAuthorizationRevoked = 'OffChainAuthorizationRevoked',
  Offence = 'Offence',
  OldSlashingReportDiscarded = 'OldSlashingReportDiscarded',
  Paused = 'Paused',
  PayoutStarted = 'PayoutStarted',
  PendingPipExpiryChanged = 'PendingPipExpiryChanged',
  PeriodicFailed = 'PeriodicFailed',
  PermanentlyOverweight = 'PermanentlyOverweight',
  PermissionedIdentityAdded = 'PermissionedIdentityAdded',
  PermissionedIdentityRemoved = 'PermissionedIdentityRemoved',
  PermissionedValidatorAdded = 'PermissionedValidatorAdded',
  PermissionedValidatorRemoved = 'PermissionedValidatorRemoved',
  PermissionedValidatorStatusChanged = 'PermissionedValidatorStatusChanged',
  PhaseTransitioned = 'PhaseTransitioned',
  PipClosed = 'PipClosed',
  PipSkipped = 'PipSkipped',
  PlaceholderFillBlock = 'PlaceholderFillBlock',
  PortfolioCreated = 'PortfolioCreated',
  PortfolioCustodianChanged = 'PortfolioCustodianChanged',
  PortfolioDeleted = 'PortfolioDeleted',
  PortfolioRenamed = 'PortfolioRenamed',
  PreApprovedAsset = 'PreApprovedAsset',
  PreApprovedPortfolio = 'PreApprovedPortfolio',
  PrimaryIssuanceAgentTransfered = 'PrimaryIssuanceAgentTransfered',
  PrimaryIssuanceAgentTransferred = 'PrimaryIssuanceAgentTransferred',
  PrimaryKeyUpdated = 'PrimaryKeyUpdated',
  ProposalAdded = 'ProposalAdded',
  ProposalApprovalVote = 'ProposalApprovalVote',
  ProposalApproved = 'ProposalApproved',
  ProposalBondAdjusted = 'ProposalBondAdjusted',
  ProposalCoolOffPeriodChanged = 'ProposalCoolOffPeriodChanged',
  ProposalCreated = 'ProposalCreated',
  ProposalDetailsAmended = 'ProposalDetailsAmended',
  ProposalDurationChanged = 'ProposalDurationChanged',
  ProposalExecuted = 'ProposalExecuted',
  ProposalExecutionFailed = 'ProposalExecutionFailed',
  ProposalFailedToExecute = 'ProposalFailedToExecute',
  ProposalRefund = 'ProposalRefund',
  ProposalRejected = 'ProposalRejected',
  ProposalRejectionVote = 'ProposalRejectionVote',
  ProposalStateUpdated = 'ProposalStateUpdated',
  Proposed = 'Proposed',
  PutCodeFlagChanged = 'PutCodeFlagChanged',
  QuorumThresholdChanged = 'QuorumThresholdChanged',
  RcvChanged = 'RCVChanged',
  RangeChanged = 'RangeChanged',
  RangeProofAdded = 'RangeProofAdded',
  RangeProofVerified = 'RangeProofVerified',
  ReceiptClaimed = 'ReceiptClaimed',
  ReceiptUnclaimed = 'ReceiptUnclaimed',
  ReceiptValidityChanged = 'ReceiptValidityChanged',
  ReceiverAffirmationReverted = 'ReceiverAffirmationReverted',
  ReceiverAffirmed = 'ReceiverAffirmed',
  ReceiverClaimed = 'ReceiverClaimed',
  Reclaimed = 'Reclaimed',
  RecordDateChanged = 'RecordDateChanged',
  Redeemed = 'Redeemed',
  RedeemedNft = 'RedeemedNFT',
  ReferendumCreated = 'ReferendumCreated',
  ReferendumScheduled = 'ReferendumScheduled',
  ReferendumStateUpdated = 'ReferendumStateUpdated',
  RegisterAssetMetadataGlobalType = 'RegisterAssetMetadataGlobalType',
  RegisterAssetMetadataLocalType = 'RegisterAssetMetadataLocalType',
  Rejected = 'Rejected',
  RejectedInvalidAuthorizedUpgrade = 'RejectedInvalidAuthorizedUpgrade',
  RelayedTx = 'RelayedTx',
  RelayerBatchedProofs = 'RelayerBatchedProofs',
  ReleaseCoordinatorUpdated = 'ReleaseCoordinatorUpdated',
  Released = 'Released',
  Remarked = 'Remarked',
  RemoveAssetAffirmationExemption = 'RemoveAssetAffirmationExemption',
  RemovePreApprovedAsset = 'RemovePreApprovedAsset',
  Removed = 'Removed',
  RemovedPayingKey = 'RemovedPayingKey',
  RemovedPendingSubsidy = 'RemovedPendingSubsidy',
  RemovedSubsidy = 'RemovedSubsidy',
  Requested = 'Requested',
  Rescinded = 'Rescinded',
  ReserveRepatriated = 'ReserveRepatriated',
  Reserved = 'Reserved',
  Restored = 'Restored',
  Resumed = 'Resumed',
  RetryCancelled = 'RetryCancelled',
  RetryFailed = 'RetryFailed',
  RetrySet = 'RetrySet',
  RevokeCreatePortfoliosPermission = 'RevokeCreatePortfoliosPermission',
  RevokePreApprovedPortfolio = 'RevokePreApprovedPortfolio',
  Reward = 'Reward',
  RewardPaymentSchedulingInterrupted = 'RewardPaymentSchedulingInterrupted',
  Rewarded = 'Rewarded',
  RootStored = 'RootStored',
  RootsPruned = 'RootsPruned',
  ScRuntimeCall = 'SCRuntimeCall',
  ScheduleCreated = 'ScheduleCreated',
  ScheduleRemoved = 'ScheduleRemoved',
  ScheduleUpdated = 'ScheduleUpdated',
  Scheduled = 'Scheduled',
  SchedulingFailed = 'SchedulingFailed',
  SecondaryKeyLeftIdentity = 'SecondaryKeyLeftIdentity',
  SecondaryKeyPermissionsUpdated = 'SecondaryKeyPermissionsUpdated',
  SecondaryKeysAdded = 'SecondaryKeysAdded',
  SecondaryKeysFrozen = 'SecondaryKeysFrozen',
  SecondaryKeysRemoved = 'SecondaryKeysRemoved',
  SecondaryKeysUnfrozen = 'SecondaryKeysUnfrozen',
  SecondaryPermissionsUpdated = 'SecondaryPermissionsUpdated',
  Seeded = 'Seeded',
  SenderAffirmationReverted = 'SenderAffirmationReverted',
  SenderAffirmed = 'SenderAffirmed',
  SenderCounterUpdated = 'SenderCounterUpdated',
  SetAccountFreeze = 'SetAccountFreeze',
  SetAssetMediators = 'SetAssetMediators',
  SetAssetMetadataValue = 'SetAssetMetadataValue',
  SetAssetMetadataValueDetails = 'SetAssetMetadataValueDetails',
  SetAssetTransferCompliance = 'SetAssetTransferCompliance',
  SettlementCreated = 'SettlementCreated',
  SettlementManuallyExecuted = 'SettlementManuallyExecuted',
  SettlementStatusUpdated = 'SettlementStatusUpdated',
  SignerLeft = 'SignerLeft',
  SigningKeysAdded = 'SigningKeysAdded',
  SigningKeysFrozen = 'SigningKeysFrozen',
  SigningKeysRemoved = 'SigningKeysRemoved',
  SigningKeysUnfrozen = 'SigningKeysUnfrozen',
  SigningPermissionsUpdated = 'SigningPermissionsUpdated',
  Slash = 'Slash',
  SlashReported = 'SlashReported',
  Slashed = 'Slashed',
  SlashingAllowedForChanged = 'SlashingAllowedForChanged',
  SlashingParamsUpdated = 'SlashingParamsUpdated',
  SnapshotCleared = 'SnapshotCleared',
  SnapshotResultsEnacted = 'SnapshotResultsEnacted',
  SnapshotTaken = 'SnapshotTaken',
  SnapshotTargetsSizeExceeded = 'SnapshotTargetsSizeExceeded',
  SnapshotVotersSizeExceeded = 'SnapshotVotersSizeExceeded',
  SolutionStored = 'SolutionStored',
  SomeOffline = 'SomeOffline',
  StakersElected = 'StakersElected',
  StakingElection = 'StakingElection',
  StakingElectionFailed = 'StakingElectionFailed',
  StatTypesAdded = 'StatTypesAdded',
  StatTypesRemoved = 'StatTypesRemoved',
  StorageDepositTransferredAndHeld = 'StorageDepositTransferredAndHeld',
  StorageDepositTransferredAndReleased = 'StorageDepositTransferredAndReleased',
  SubsidyDebited = 'SubsidyDebited',
  Sudid = 'Sudid',
  SudoAsDone = 'SudoAsDone',
  Suspended = 'Suspended',
  TemplateInstantiationFeeChanged = 'TemplateInstantiationFeeChanged',
  TemplateMetaUrlChanged = 'TemplateMetaUrlChanged',
  TemplateOwnershipTransferred = 'TemplateOwnershipTransferred',
  TemplateUsageFeeChanged = 'TemplateUsageFeeChanged',
  Terminated = 'Terminated',
  Thawed = 'Thawed',
  TickerLinkedToAsset = 'TickerLinkedToAsset',
  TickerRegistered = 'TickerRegistered',
  TickerTransferred = 'TickerTransferred',
  TickerUnlinkedFromAsset = 'TickerUnlinkedFromAsset',
  TimelockChanged = 'TimelockChanged',
  TotalIssuanceForced = 'TotalIssuanceForced',
  TransactionAffirmed = 'TransactionAffirmed',
  TransactionCreated = 'TransactionCreated',
  TransactionExecuted = 'TransactionExecuted',
  TransactionFeePaid = 'TransactionFeePaid',
  TransactionRejected = 'TransactionRejected',
  Transfer = 'Transfer',
  TransferAndHold = 'TransferAndHold',
  TransferConditionExemptionsAdded = 'TransferConditionExemptionsAdded',
  TransferConditionExemptionsRemoved = 'TransferConditionExemptionsRemoved',
  TransferManagerAdded = 'TransferManagerAdded',
  TransferManagerRemoved = 'TransferManagerRemoved',
  TransferOnHold = 'TransferOnHold',
  TransferWithData = 'TransferWithData',
  TransferWithMemo = 'TransferWithMemo',
  TreasuryDidSet = 'TreasuryDidSet',
  TreasuryDisbursement = 'TreasuryDisbursement',
  TreasuryDisbursementFailed = 'TreasuryDisbursementFailed',
  TreasuryReimbursement = 'TreasuryReimbursement',
  TrustedDefaultClaimIssuerAdded = 'TrustedDefaultClaimIssuerAdded',
  TrustedDefaultClaimIssuerRemoved = 'TrustedDefaultClaimIssuerRemoved',
  TxRemoved = 'TxRemoved',
  TxsHandled = 'TxsHandled',
  Unbonded = 'Unbonded',
  Unexpected = 'Unexpected',
  UnexpectedError = 'UnexpectedError',
  Unfrozen = 'Unfrozen',
  UnfrozenTx = 'UnfrozenTx',
  Unknown = 'Unknown',
  Unlocked = 'Unlocked',
  Unreserved = 'Unreserved',
  UpdatedPolyxLimit = 'UpdatedPolyxLimit',
  UpgradeAuthorized = 'UpgradeAuthorized',
  UpgradeCompleted = 'UpgradeCompleted',
  UpgradeFailed = 'UpgradeFailed',
  UpgradeStarted = 'UpgradeStarted',
  Upgraded = 'Upgraded',
  UserPortfolios = 'UserPortfolios',
  ValidatorDisabled = 'ValidatorDisabled',
  ValidatorPayoutFailed = 'ValidatorPayoutFailed',
  ValidatorPrefsSet = 'ValidatorPrefsSet',
  ValidatorReenabled = 'ValidatorReenabled',
  VenueCreated = 'VenueCreated',
  VenueDetailsUpdated = 'VenueDetailsUpdated',
  VenueFiltering = 'VenueFiltering',
  VenueSignersUpdated = 'VenueSignersUpdated',
  VenueTypeUpdated = 'VenueTypeUpdated',
  VenueUnauthorized = 'VenueUnauthorized',
  VenueUpdated = 'VenueUpdated',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
  VoteCast = 'VoteCast',
  VoteEnactReferendum = 'VoteEnactReferendum',
  VoteRejectReferendum = 'VoteRejectReferendum',
  VoteRetracted = 'VoteRetracted',
  VoteThresholdUpdated = 'VoteThresholdUpdated',
  Voted = 'Voted',
  Withdraw = 'Withdraw',
  Withdrawn = 'Withdrawn',
}
export type EventIdEnumFilter = {
  distinctFrom?: InputMaybe<EventIdEnum>;
  equalTo?: InputMaybe<EventIdEnum>;
  greaterThan?: InputMaybe<EventIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<EventIdEnum>;
  in?: InputMaybe<Array<EventIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<EventIdEnum>;
  lessThanOrEqualTo?: InputMaybe<EventIdEnum>;
  notDistinctFrom?: InputMaybe<EventIdEnum>;
  notEqualTo?: InputMaybe<EventIdEnum>;
  notIn?: InputMaybe<Array<EventIdEnum>>;
};
export enum EventsOrderBy {
  ArgsAsc = 'ARGS_ASC',
  ArgsDesc = 'ARGS_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  EventIdTextAsc = 'EVENT_ID_TEXT_ASC',
  EventIdTextDesc = 'EVENT_ID_TEXT_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  ModuleIdTextAsc = 'MODULE_ID_TEXT_ASC',
  ModuleIdTextDesc = 'MODULE_ID_TEXT_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RefsAsc = 'REFS_ASC',
  RefsDesc = 'REFS_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type EvmAccountMapping = Node & {
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']['output']>;
  address: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  evmAddress: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mapped: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type EvmAccountMappingFilter = {
  account?: InputMaybe<AccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<EvmAccountMappingFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  evmAddress?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  mapped?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<EvmAccountMappingFilter>;
  or?: InputMaybe<Array<EvmAccountMappingFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum EvmAccountMappingsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EvmAddressAsc = 'EVM_ADDRESS_ASC',
  EvmAddressDesc = 'EVM_ADDRESS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MappedAsc = 'MAPPED_ASC',
  MappedDesc = 'MAPPED_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum EvmCallKindEnum {
  Call = 'call',
  Instantiate = 'instantiate',
  SubstrateCall = 'substrateCall',
}
export type EvmCallKindEnumFilter = {
  distinctFrom?: InputMaybe<EvmCallKindEnum>;
  equalTo?: InputMaybe<EvmCallKindEnum>;
  greaterThan?: InputMaybe<EvmCallKindEnum>;
  greaterThanOrEqualTo?: InputMaybe<EvmCallKindEnum>;
  in?: InputMaybe<Array<EvmCallKindEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<EvmCallKindEnum>;
  lessThanOrEqualTo?: InputMaybe<EvmCallKindEnum>;
  notDistinctFrom?: InputMaybe<EvmCallKindEnum>;
  notEqualTo?: InputMaybe<EvmCallKindEnum>;
  notIn?: InputMaybe<Array<EvmCallKindEnum>>;
};
export type EvmTransaction = Node & {
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  callKind: EvmCallKindEnum;
  chainId?: Maybe<Scalars['String']['output']>;
  contractAddress?: Maybe<Scalars['String']['output']>;
  ethNonce: Scalars['BigFloat']['output'];
  ethTxHash: Scalars['String']['output'];
  ethTxType: Scalars['Int']['output'];
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId: Scalars['String']['output'];
  fromAccount?: Maybe<Account>;
  fromAccountId: Scalars['String']['output'];
  fromEthAddress: Scalars['String']['output'];
  gasLimit: Scalars['String']['output'];
  gasPrice?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  input: Scalars['String']['output'];
  maxFeePerGas?: Maybe<Scalars['String']['output']>;
  maxPriorityFeePerGas?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  revertReason?: Maybe<Scalars['String']['output']>;
  reverted: Scalars['Boolean']['output'];
  toEthAddress?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};
export type EvmTransactionFilter = {
  and?: InputMaybe<Array<EvmTransactionFilter>>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  callKind?: InputMaybe<EvmCallKindEnumFilter>;
  chainId?: InputMaybe<StringFilter>;
  contractAddress?: InputMaybe<StringFilter>;
  ethNonce?: InputMaybe<BigFloatFilter>;
  ethTxHash?: InputMaybe<StringFilter>;
  ethTxType?: InputMaybe<IntFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicId?: InputMaybe<StringFilter>;
  fromAccount?: InputMaybe<AccountFilter>;
  fromAccountId?: InputMaybe<StringFilter>;
  fromEthAddress?: InputMaybe<StringFilter>;
  gasLimit?: InputMaybe<StringFilter>;
  gasPrice?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  input?: InputMaybe<StringFilter>;
  maxFeePerGas?: InputMaybe<StringFilter>;
  maxPriorityFeePerGas?: InputMaybe<StringFilter>;
  not?: InputMaybe<EvmTransactionFilter>;
  or?: InputMaybe<Array<EvmTransactionFilter>>;
  revertReason?: InputMaybe<StringFilter>;
  reverted?: InputMaybe<BooleanFilter>;
  toEthAddress?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
};
export enum EvmTransactionsOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CallKindAsc = 'CALL_KIND_ASC',
  CallKindDesc = 'CALL_KIND_DESC',
  ChainIdAsc = 'CHAIN_ID_ASC',
  ChainIdDesc = 'CHAIN_ID_DESC',
  ContractAddressAsc = 'CONTRACT_ADDRESS_ASC',
  ContractAddressDesc = 'CONTRACT_ADDRESS_DESC',
  EthNonceAsc = 'ETH_NONCE_ASC',
  EthNonceDesc = 'ETH_NONCE_DESC',
  EthTxHashAsc = 'ETH_TX_HASH_ASC',
  EthTxHashDesc = 'ETH_TX_HASH_DESC',
  EthTxTypeAsc = 'ETH_TX_TYPE_ASC',
  EthTxTypeDesc = 'ETH_TX_TYPE_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  FromAccountIdAsc = 'FROM_ACCOUNT_ID_ASC',
  FromAccountIdDesc = 'FROM_ACCOUNT_ID_DESC',
  FromEthAddressAsc = 'FROM_ETH_ADDRESS_ASC',
  FromEthAddressDesc = 'FROM_ETH_ADDRESS_DESC',
  GasLimitAsc = 'GAS_LIMIT_ASC',
  GasLimitDesc = 'GAS_LIMIT_DESC',
  GasPriceAsc = 'GAS_PRICE_ASC',
  GasPriceDesc = 'GAS_PRICE_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InputAsc = 'INPUT_ASC',
  InputDesc = 'INPUT_DESC',
  MaxFeePerGasAsc = 'MAX_FEE_PER_GAS_ASC',
  MaxFeePerGasDesc = 'MAX_FEE_PER_GAS_DESC',
  MaxPriorityFeePerGasAsc = 'MAX_PRIORITY_FEE_PER_GAS_ASC',
  MaxPriorityFeePerGasDesc = 'MAX_PRIORITY_FEE_PER_GAS_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RevertedAsc = 'REVERTED_ASC',
  RevertedDesc = 'REVERTED_DESC',
  RevertReasonAsc = 'REVERT_REASON_ASC',
  RevertReasonDesc = 'REVERT_REASON_DESC',
  ToEthAddressAsc = 'TO_ETH_ADDRESS_ASC',
  ToEthAddressDesc = 'TO_ETH_ADDRESS_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Extrinsic = Node & {
  accountsByEvmTransactionExtrinsicIdAndFromAccountId: Connection<Account>;
  accountsByMultiSigProposalExtrinsicIdAndCreatorAccountId: Connection<Account>;
  accountsByPolyxEntryExtrinsicIdAndAccountId: Connection<Account>;
  address?: Maybe<Scalars['String']['output']>;
  args?: Maybe<Scalars['JSON']['output']>;
  batchFailed: Scalars['Boolean']['output'];
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  blocksByEventExtrinsicIdAndBlockId: Connection<Block>;
  blocksByEvmTransactionExtrinsicIdAndBlockId: Connection<Block>;
  callId: CallIdEnum;
  callIdText: Scalars['String']['output'];
  ethAddress?: Maybe<Scalars['String']['output']>;
  ethTxHash?: Maybe<Scalars['String']['output']>;
  events: Connection<Event>;
  eventsByMultiSigProposalExtrinsicIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalExtrinsicIdAndUpdatedEventId: Connection<Event>;
  eventsByPolyxEntryExtrinsicIdAndCreatedEventId: Connection<Event>;
  evmTransactions: Connection<EvmTransaction>;
  extrinsicHash?: Maybe<Scalars['String']['output']>;
  extrinsicIdx: Scalars['Int']['output'];
  extrinsicLength: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identitiesByMultiSigProposalExtrinsicIdAndCreatorId: Connection<Identity>;
  identitiesByPolyxEntryExtrinsicIdAndCounterpartyIdentityId: Connection<Identity>;
  identitiesByPolyxEntryExtrinsicIdAndIdentityId: Connection<Identity>;
  moduleId: ModuleIdEnum;
  moduleIdText: Scalars['String']['output'];
  multiSigProposals: Connection<MultiSigProposal>;
  multiSigsByMultiSigProposalExtrinsicIdAndMultisigId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  nonce?: Maybe<Scalars['Int']['output']>;
  polyxEntries: Connection<PolyxEntry>;
  signed: Scalars['Int']['output'];
  signedbyAddress: Scalars['Int']['output'];
  specVersionId: Scalars['Int']['output'];
  success: Scalars['Int']['output'];
};
export type ExtrinsicFilter = {
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ExtrinsicFilter>>;
  args?: InputMaybe<JsonFilter>;
  batchFailed?: InputMaybe<BooleanFilter>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  callId?: InputMaybe<CallIdEnumFilter>;
  callIdText?: InputMaybe<StringFilter>;
  ethAddress?: InputMaybe<StringFilter>;
  ethTxHash?: InputMaybe<StringFilter>;
  events?: InputMaybe<OneToManyFilter<EventFilter>>;
  evmTransactions?: InputMaybe<OneToManyFilter<EvmTransactionFilter>>;
  extrinsicHash?: InputMaybe<StringFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  extrinsicLength?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  moduleIdText?: InputMaybe<StringFilter>;
  multiSigProposals?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  nonce?: InputMaybe<IntFilter>;
  not?: InputMaybe<ExtrinsicFilter>;
  or?: InputMaybe<Array<ExtrinsicFilter>>;
  polyxEntries?: InputMaybe<OneToManyFilter<PolyxEntryFilter>>;
  signed?: InputMaybe<IntFilter>;
  signedbyAddress?: InputMaybe<IntFilter>;
  specVersionId?: InputMaybe<IntFilter>;
  success?: InputMaybe<IntFilter>;
};
export enum ExtrinsicsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  ArgsAsc = 'ARGS_ASC',
  ArgsDesc = 'ARGS_DESC',
  BatchFailedAsc = 'BATCH_FAILED_ASC',
  BatchFailedDesc = 'BATCH_FAILED_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  CallIdTextAsc = 'CALL_ID_TEXT_ASC',
  CallIdTextDesc = 'CALL_ID_TEXT_DESC',
  EthAddressAsc = 'ETH_ADDRESS_ASC',
  EthAddressDesc = 'ETH_ADDRESS_DESC',
  EthTxHashAsc = 'ETH_TX_HASH_ASC',
  EthTxHashDesc = 'ETH_TX_HASH_DESC',
  ExtrinsicHashAsc = 'EXTRINSIC_HASH_ASC',
  ExtrinsicHashDesc = 'EXTRINSIC_HASH_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicLengthAsc = 'EXTRINSIC_LENGTH_ASC',
  ExtrinsicLengthDesc = 'EXTRINSIC_LENGTH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  ModuleIdTextAsc = 'MODULE_ID_TEXT_ASC',
  ModuleIdTextDesc = 'MODULE_ID_TEXT_DESC',
  Natural = 'NATURAL',
  NonceAsc = 'NONCE_ASC',
  NonceDesc = 'NONCE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignedbyAddressAsc = 'SIGNEDBY_ADDRESS_ASC',
  SignedbyAddressDesc = 'SIGNEDBY_ADDRESS_DESC',
  SignedAsc = 'SIGNED_ASC',
  SignedDesc = 'SIGNED_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  SuccessAsc = 'SUCCESS_ASC',
  SuccessDesc = 'SUCCESS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Funding = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  fundingRound: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  totalFundingAmount: Scalars['BigFloat']['output'];
};
export type FundingFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<FundingFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  fundingRound?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<FundingFilter>;
  or?: InputMaybe<Array<FundingFilter>>;
  totalFundingAmount?: InputMaybe<BigFloatFilter>;
};
export enum FundingsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TotalFundingAmountAsc = 'TOTAL_FUNDING_AMOUNT_ASC',
  TotalFundingAmountDesc = 'TOTAL_FUNDING_AMOUNT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type GlobalMetadataKey = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  spec?: Maybe<Scalars['String']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type GlobalMetadataKeyFilter = {
  and?: InputMaybe<Array<GlobalMetadataKeyFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<GlobalMetadataKeyFilter>;
  or?: InputMaybe<Array<GlobalMetadataKeyFilter>>;
  spec?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum GlobalMetadataKeysOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecAsc = 'SPEC_ASC',
  SpecDesc = 'SPEC_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type HavingBigfloatFilter = {
  equalTo?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThan?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThan?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
};
export type HavingDatetimeFilter = {
  equalTo?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThan?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  lessThan?: InputMaybe<Scalars['Datetime']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
};
export type HavingIntFilter = {
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
};
export enum HoldReason {
  Preimage = 'Preimage',
  Revive = 'Revive',
  Session = 'Session',
  Staking = 'Staking',
  Unknown = 'Unknown',
}
export type HoldReasonFilter = {
  distinctFrom?: InputMaybe<HoldReason>;
  equalTo?: InputMaybe<HoldReason>;
  greaterThan?: InputMaybe<HoldReason>;
  greaterThanOrEqualTo?: InputMaybe<HoldReason>;
  in?: InputMaybe<Array<HoldReason>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<HoldReason>;
  lessThanOrEqualTo?: InputMaybe<HoldReason>;
  notDistinctFrom?: InputMaybe<HoldReason>;
  notEqualTo?: InputMaybe<HoldReason>;
  notIn?: InputMaybe<Array<HoldReason>>;
};
export enum HolderKind {
  Account = 'Account',
  Portfolio = 'Portfolio',
}
export type HolderKindFilter = {
  distinctFrom?: InputMaybe<HolderKind>;
  equalTo?: InputMaybe<HolderKind>;
  greaterThan?: InputMaybe<HolderKind>;
  greaterThanOrEqualTo?: InputMaybe<HolderKind>;
  in?: InputMaybe<Array<HolderKind>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<HolderKind>;
  lessThanOrEqualTo?: InputMaybe<HolderKind>;
  notDistinctFrom?: InputMaybe<HolderKind>;
  notEqualTo?: InputMaybe<HolderKind>;
  notIn?: InputMaybe<Array<HolderKind>>;
};
export type Holding = Node & {
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']['output']>;
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetHolder?: Maybe<AssetHolder>;
  assetHolderId?: Maybe<Scalars['String']['output']>;
  assetId: Scalars['String']['output'];
  assetsByNftHoldingIdAndAssetId: Connection<Asset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByNftHoldingIdAndBurnedEventId: Connection<Event>;
  eventsByNftHoldingIdAndCreatedEventId: Connection<Event>;
  eventsByNftHoldingIdAndUpdatedEventId: Connection<Event>;
  frozen: Scalars['BigFloat']['output'];
  frozenSince?: Maybe<Scalars['Datetime']['output']>;
  holderKind: HolderKind;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nftCount: Scalars['Int']['output'];
  nfts: Connection<Nft>;
  nodeId: Scalars['ID']['output'];
  portfolio?: Maybe<Portfolio>;
  portfolioId?: Maybe<Scalars['String']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type HoldingFilter = {
  account?: InputMaybe<AccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<HoldingFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetHolder?: InputMaybe<AssetHolderFilter>;
  assetHolderExists?: InputMaybe<Scalars['Boolean']['input']>;
  assetHolderId?: InputMaybe<StringFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  frozen?: InputMaybe<BigFloatFilter>;
  frozenSince?: InputMaybe<DatetimeFilter>;
  holderKind?: InputMaybe<HolderKindFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  nftCount?: InputMaybe<IntFilter>;
  nfts?: InputMaybe<OneToManyFilter<NftFilter>>;
  not?: InputMaybe<HoldingFilter>;
  or?: InputMaybe<Array<HoldingFilter>>;
  portfolio?: InputMaybe<PortfolioFilter>;
  portfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum HoldingsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetHolderIdAsc = 'ASSET_HOLDER_ID_ASC',
  AssetHolderIdDesc = 'ASSET_HOLDER_ID_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  FrozenAsc = 'FROZEN_ASC',
  FrozenDesc = 'FROZEN_DESC',
  FrozenSinceAsc = 'FROZEN_SINCE_ASC',
  FrozenSinceDesc = 'FROZEN_SINCE_DESC',
  HolderKindAsc = 'HOLDER_KIND_ASC',
  HolderKindDesc = 'HOLDER_KIND_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PortfolioIdAsc = 'PORTFOLIO_ID_ASC',
  PortfolioIdDesc = 'PORTFOLIO_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum IdentitiesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryAccountIdAsc = 'PRIMARY_ACCOUNT_ID_ASC',
  PrimaryAccountIdDesc = 'PRIMARY_ACCOUNT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SecondaryKeysFrozenAsc = 'SECONDARY_KEYS_FROZEN_ASC',
  SecondaryKeysFrozenDesc = 'SECONDARY_KEYS_FROZEN_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Identity = Node & {
  accountBalances: Connection<AccountBalance>;
  accounts: Connection<Account>;
  accountsByAccountBalanceIdentityIdAndAccountId: Connection<Account>;
  accountsByAssetTransactionFromIdentityIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionFromIdentityIdAndToAccountId: Connection<Account>;
  accountsByAssetTransactionToIdentityIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionToIdentityIdAndToAccountId: Connection<Account>;
  accountsByAuthorizationFromIdAndToAccountId: Connection<Account>;
  accountsByAuthorizationToIdAndToAccountId: Connection<Account>;
  accountsByBridgeEventIdentityIdAndRecipientId: Connection<Account>;
  accountsByHoldingIdentityIdAndAccountId: Connection<Account>;
  accountsByIdentityKeyIdentityIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationAffirmedByIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationAffirmedByIdAndSignerId: Connection<Account>;
  accountsByInstructionAffirmationIdentityIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationIdentityIdAndSignerId: Connection<Account>;
  accountsByInstructionEventIdentityIdAndAccountId: Connection<Account>;
  accountsByInstructionEventIdentityIdAndSignerId: Connection<Account>;
  accountsByInstructionRejectedByIdAndRejectedBySignerId: Connection<Account>;
  accountsByLegFromIdAndFromAccountId: Connection<Account>;
  accountsByLegFromIdAndToAccountId: Connection<Account>;
  accountsByLegToIdAndFromAccountId: Connection<Account>;
  accountsByLegToIdAndToAccountId: Connection<Account>;
  accountsByMultiSigCreatorIdAndAccountId: Connection<Account>;
  accountsByMultiSigCreatorIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigProposalCreatorIdAndCreatorAccountId: Connection<Account>;
  accountsByPolyxEntryCounterpartyIdentityIdAndAccountId: Connection<Account>;
  accountsByPolyxEntryIdentityIdAndAccountId: Connection<Account>;
  accountsByStakingEventIdentityIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingEventIdentityIdAndStashId: Connection<Account>;
  accountsByStakingPositionIdentityIdAndControllerId: Connection<Account>;
  accountsByStakingPositionIdentityIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingPositionIdentityIdAndStashId: Connection<Account>;
  accountsByValidatorIdentityIdAndAccountId: Connection<Account>;
  agentGroupMembershipsByMemberId: Connection<AgentGroupMembership>;
  agentGroupsByAgentGroupMembershipMemberIdAndGroupId: Connection<AgentGroup>;
  agentOf: Connection<AssetAgent>;
  assetAgentActionsByCallerId: Connection<AssetAgentAction>;
  assetAgentHistories: Connection<AssetAgentHistory>;
  assetHoldersByHoldingIdentityIdAndAssetHolderId: Connection<AssetHolder>;
  assetMandatoryMediators: Connection<AssetMandatoryMediator>;
  assetMandatoryMediatorsByAddedById: Connection<AssetMandatoryMediator>;
  assetPreApprovals: Connection<AssetPreApproval>;
  assetsByAssetAgentActionCallerIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentHistoryIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetAgentIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetHolderIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorAddedByIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionFromIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionToIdentityIdAndAssetId: Connection<Asset>;
  assetsByDistributionIdentityIdAndAssetId: Connection<Asset>;
  assetsByDistributionIdentityIdAndCurrencyId: Connection<Asset>;
  assetsByHoldingIdentityIdAndAssetId: Connection<Asset>;
  assetsByInvestmentInvestorIdAndOfferingAssetId: Connection<Asset>;
  assetsByInvestmentInvestorIdAndRaisingAssetId: Connection<Asset>;
  assetsByLegFromIdAndAssetId: Connection<Asset>;
  assetsByLegToIdAndAssetId: Connection<Asset>;
  assetsByStatTypeClaimIssuerIdAndAssetId: Connection<Asset>;
  assetsByStoCreatorIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoCreatorIdAndRaisingAssetId: Connection<Asset>;
  assetsByTickerReservationIdentityIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceClaimIssuerIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceExemptionExemptedEntityIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerIssuerIdAndAssetId: Connection<Asset>;
  assetsOwned: Connection<Asset>;
  authorizationsByFromId: Connection<Authorization>;
  authorizationsReceived: Connection<Authorization>;
  blocksByIdentityKeyIdentityIdAndValidFromBlockId: Connection<Block>;
  blocksByIdentityKeyIdentityIdAndValidToBlockId: Connection<Block>;
  bridgeEvents: Connection<BridgeEvent>;
  claims: ClaimsConnection;
  claimsIssued: ClaimsConnection;
  confidentialAccounts: Connection<ConfidentialAccount>;
  confidentialAssets: Connection<ConfidentialAsset>;
  confidentialEncryptionKeysByConfidentialAccountCreatorIdAndEncryptionKeyId: Connection<ConfidentialEncryptionKey>;
  confidentialEncryptionKeysByCreatorId: Connection<ConfidentialEncryptionKey>;
  corporateActionsByDistributionIdentityIdAndCorporateActionId: Connection<CorporateAction>;
  corporateBallotVotesByVoterId: Connection<CorporateBallotVote>;
  corporateBallotsByCorporateBallotVoteVoterIdAndBallotId: Connection<CorporateBallot>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  custodiedPortfolios: Connection<Portfolio>;
  customClaimTypes: Connection<CustomClaimType>;
  customClaimTypesByClaimIssuerIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByClaimTargetIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeClaimIssuerIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  did: Scalars['String']['output'];
  distributionPayments: Connection<DistributionPayment>;
  distributions: Connection<Distribution>;
  distributionsByDistributionPaymentTargetIdAndDistributionId: Connection<Distribution>;
  erasByValidatorEraIdentityIdAndEraId: Connection<Era>;
  eventsByAccountBalanceIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAccountIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAccountIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAgentGroupMembershipMemberIdAndCreatedEventId: Connection<Event>;
  eventsByAgentGroupMembershipMemberIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentActionCallerIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentActionCallerIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetAgentHistoryIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetAgentIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetHolderIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetHolderIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorAddedByIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorAddedByIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetMandatoryMediatorIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByAssetOwnerIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetPreApprovalIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetPreApprovalIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByAssetTransactionFromIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionToIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationFromIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationFromIdAndUpdatedEventId: Connection<Event>;
  eventsByAuthorizationToIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationToIdAndUpdatedEventId: Connection<Event>;
  eventsByBridgeEventIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByClaimIssuerIdAndCreatedEventId: Connection<Event>;
  eventsByClaimIssuerIdAndUpdatedEventId: Connection<Event>;
  eventsByClaimTargetIdAndCreatedEventId: Connection<Event>;
  eventsByClaimTargetIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAccountCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialAssetCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByConfidentialEncryptionKeyCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialEncryptionKeyCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByCorporateBallotVoteVoterIdAndCreatedEventId: Connection<Event>;
  eventsByCorporateBallotVoteVoterIdAndUpdatedEventId: Connection<Event>;
  eventsByCustomClaimTypeIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByCustomClaimTypeIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByDistributionPaymentTargetIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByIdentityKeyIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByIdentityKeyIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationAffirmedByIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationAffirmedByIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionEventIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionPartyIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionPartyIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionRejectedByIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionRejectedByIdAndUpdatedEventId: Connection<Event>;
  eventsByInvestmentInvestorIdAndCreatedEventId: Connection<Event>;
  eventsByInvestmentInvestorIdAndUpdatedEventId: Connection<Event>;
  eventsByLegFromIdAndCreatedEventId: Connection<Event>;
  eventsByLegFromIdAndUpdatedEventId: Connection<Event>;
  eventsByLegToIdAndCreatedEventId: Connection<Event>;
  eventsByLegToIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigAdminAdminIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigAdminAdminIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByPolyxEntryCounterpartyIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByPolyxEntryIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioCustodianIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioCustodianIdAndUpdatedEventId: Connection<Event>;
  eventsByPortfolioIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByProposalOwnerIdAndClosedEventId: Connection<Event>;
  eventsByProposalOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByProposalOwnerIdAndUpdatedEventId: Connection<Event>;
  eventsByStakingEventIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByStakingPositionIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByStatTypeClaimIssuerIdAndCreatedEventId: Connection<Event>;
  eventsByStatTypeClaimIssuerIdAndUpdatedEventId: Connection<Event>;
  eventsByStoCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByStoCreatorIdAndUpdatedEventId: Connection<Event>;
  eventsByTickerReservationIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByTickerReservationIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceClaimIssuerIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceClaimIssuerIdAndUpdatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionExemptedEntityIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceExemptionExemptedEntityIdAndUpdatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerIssuerIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerIssuerIdAndUpdatedEventId: Connection<Event>;
  eventsByValidatorEraIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorEraIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByValidatorIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorIdentityIdAndUpdatedEventId: Connection<Event>;
  eventsByVenueOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByVenueOwnerIdAndUpdatedEventId: Connection<Event>;
  extrinsicsByMultiSigProposalCreatorIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxEntryCounterpartyIdentityIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxEntryIdentityIdAndExtrinsicId: Connection<Extrinsic>;
  heldAssets: Connection<AssetHolder>;
  holdings: Connection<Holding>;
  id: Scalars['String']['output'];
  identitiesByAssetMandatoryMediatorAddedByIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorIdentityIdAndAddedById: Connection<Identity>;
  identitiesByAssetTransactionFromIdentityIdAndToIdentityId: Connection<Identity>;
  identitiesByAssetTransactionToIdentityIdAndFromIdentityId: Connection<Identity>;
  identitiesByAuthorizationFromIdAndToId: Connection<Identity>;
  identitiesByAuthorizationToIdAndFromId: Connection<Identity>;
  identitiesByClaimIssuerIdAndTargetId: Connection<Identity>;
  identitiesByClaimTargetIdAndIssuerId: Connection<Identity>;
  identitiesByInstructionAffirmationAffirmedByIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationIdentityIdAndAffirmedById: Connection<Identity>;
  identitiesByLegFromIdAndToId: Connection<Identity>;
  identitiesByLegToIdAndFromId: Connection<Identity>;
  identitiesByPolyxEntryCounterpartyIdentityIdAndIdentityId: Connection<Identity>;
  identitiesByPolyxEntryIdentityIdAndCounterpartyIdentityId: Connection<Identity>;
  identitiesByPortfolioCustodianIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioIdentityIdAndCustodianId: Connection<Identity>;
  instructionAffirmations: Connection<InstructionAffirmation>;
  instructionAffirmationsByAffirmedById: Connection<InstructionAffirmation>;
  instructionEvents: Connection<InstructionEvent>;
  instructionParties: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationAffirmedByIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationIdentityIdAndPartyId: Connection<InstructionParty>;
  instructionsByAssetTransactionFromIdentityIdAndInstructionId: Connection<Instruction>;
  instructionsByAssetTransactionToIdentityIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationAffirmedByIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationIdentityIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventIdentityIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionPartyIdentityIdAndInstructionId: Connection<Instruction>;
  instructionsByLegFromIdAndInstructionId: Connection<Instruction>;
  instructionsByLegToIdAndInstructionId: Connection<Instruction>;
  instructionsByRejectedById: Connection<Instruction>;
  investments: Connection<Investment>;
  keys: Connection<IdentityKey>;
  legsByFromId: Connection<Leg>;
  legsByToId: Connection<Leg>;
  multiSigAdminsByAdminId: Connection<MultiSigAdmin>;
  multiSigProposalsByCreatorId: Connection<MultiSigProposal>;
  multiSigsByCreatorId: Connection<MultiSig>;
  multiSigsByMultiSigAdminAdminIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigProposalCreatorIdAndMultisigId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationAffirmedByIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationIdentityIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventIdentityIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offeringsCreated: Connection<Sto>;
  polyxEntries: Connection<PolyxEntry>;
  polyxEntriesByCounterpartyIdentityId: Connection<PolyxEntry>;
  portfolios: Connection<Portfolio>;
  portfoliosByAssetTransactionFromIdentityIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionFromIdentityIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToIdentityIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToIdentityIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionIdentityIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByHoldingIdentityIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationAffirmedByIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationIdentityIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventIdentityIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByLegFromIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegFromIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByLegToIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegToIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatorIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatorIdAndRaisingPortfolioId: Connection<Portfolio>;
  primaryAccount?: Maybe<Account>;
  primaryAccountId?: Maybe<Scalars['String']['output']>;
  proposalsByOwnerId: Connection<Proposal>;
  secondaryKeysFrozen: Scalars['Boolean']['output'];
  stakingEvents: Connection<StakingEvent>;
  stakingPositions: Connection<StakingPosition>;
  stakingPositionsByStakingEventIdentityIdAndPositionId: Connection<StakingPosition>;
  statTypesByClaimIssuerId: Connection<StatType>;
  statTypesByTransferComplianceClaimIssuerIdAndStatTypeId: Connection<StatType>;
  stosByInvestmentInvestorIdAndStoId: Connection<Sto>;
  tickerReservations: Connection<TickerReservation>;
  transferComplianceExemptionsByExemptedEntityId: Connection<TransferComplianceExemption>;
  transferCompliancesByClaimIssuerId: Connection<TransferCompliance>;
  transfersIn: Connection<AssetTransaction>;
  transfersOut: Connection<AssetTransaction>;
  trustedClaimIssuersByIssuerId: Connection<TrustedClaimIssuer>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  validatorEras: Connection<ValidatorEra>;
  validators: Connection<Validator>;
  validatorsByStakingEventIdentityIdAndValidatorId: Connection<Validator>;
  validatorsByValidatorEraIdentityIdAndValidatorId: Connection<Validator>;
  venues: Connection<Venue>;
  venuesByInstructionRejectedByIdAndVenueId: Connection<Venue>;
  venuesByStoCreatorIdAndVenueId: Connection<Venue>;
};
export type IdentityFilter = {
  accountBalances?: InputMaybe<OneToManyFilter<AccountBalanceFilter>>;
  accounts?: InputMaybe<OneToManyFilter<AccountFilter>>;
  agentGroupMembershipsByMemberId?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  agentOf?: InputMaybe<OneToManyFilter<AssetAgentFilter>>;
  and?: InputMaybe<Array<IdentityFilter>>;
  assetAgentActionsByCallerId?: InputMaybe<OneToManyFilter<AssetAgentActionFilter>>;
  assetAgentHistories?: InputMaybe<OneToManyFilter<AssetAgentHistoryFilter>>;
  assetMandatoryMediators?: InputMaybe<OneToManyFilter<AssetMandatoryMediatorFilter>>;
  assetMandatoryMediatorsByAddedById?: InputMaybe<OneToManyFilter<AssetMandatoryMediatorFilter>>;
  assetPreApprovals?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetsOwned?: InputMaybe<OneToManyFilter<AssetFilter>>;
  authorizationsByFromId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  authorizationsReceived?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  bridgeEvents?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  claims?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  claimsIssued?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  confidentialAccounts?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAssets?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialEncryptionKeysByCreatorId?: InputMaybe<
    OneToManyFilter<ConfidentialEncryptionKeyFilter>
  >;
  corporateBallotVotesByVoterId?: InputMaybe<OneToManyFilter<CorporateBallotVoteFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  custodiedPortfolios?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  customClaimTypes?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  did?: InputMaybe<StringFilter>;
  distributionPayments?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  heldAssets?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  holdings?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  instructionAffirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionAffirmationsByAffirmedById?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionEvents?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionParties?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  instructionsByRejectedById?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  investments?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  keys?: InputMaybe<OneToManyFilter<IdentityKeyFilter>>;
  legsByFromId?: InputMaybe<OneToManyFilter<LegFilter>>;
  legsByToId?: InputMaybe<OneToManyFilter<LegFilter>>;
  multiSigAdminsByAdminId?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  multiSigProposalsByCreatorId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigsByCreatorId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  not?: InputMaybe<IdentityFilter>;
  offeringsCreated?: InputMaybe<OneToManyFilter<StoFilter>>;
  or?: InputMaybe<Array<IdentityFilter>>;
  polyxEntries?: InputMaybe<OneToManyFilter<PolyxEntryFilter>>;
  polyxEntriesByCounterpartyIdentityId?: InputMaybe<OneToManyFilter<PolyxEntryFilter>>;
  portfolios?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  primaryAccount?: InputMaybe<AccountFilter>;
  primaryAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  primaryAccountId?: InputMaybe<StringFilter>;
  proposalsByOwnerId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  secondaryKeysFrozen?: InputMaybe<BooleanFilter>;
  stakingEvents?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stakingPositions?: InputMaybe<OneToManyFilter<StakingPositionFilter>>;
  statTypesByClaimIssuerId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  tickerReservations?: InputMaybe<OneToManyFilter<TickerReservationFilter>>;
  transferComplianceExemptionsByExemptedEntityId?: InputMaybe<
    OneToManyFilter<TransferComplianceExemptionFilter>
  >;
  transferCompliancesByClaimIssuerId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  transfersIn?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  transfersOut?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  trustedClaimIssuersByIssuerId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  validatorEras?: InputMaybe<OneToManyFilter<ValidatorEraFilter>>;
  validators?: InputMaybe<OneToManyFilter<ValidatorFilter>>;
  venues?: InputMaybe<OneToManyFilter<VenueFilter>>;
};
export type IdentityKey = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  addedReason: EventIdEnum;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  permissions?: Maybe<Scalars['JSON']['output']>;
  removedReason?: Maybe<EventIdEnum>;
  role: IdentityKeyRole;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  validFromBlock?: Maybe<Block>;
  validFromBlockId: Scalars['String']['output'];
  validToBlock?: Maybe<Block>;
  validToBlockId?: Maybe<Scalars['String']['output']>;
};
export type IdentityKeyFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  addedReason?: InputMaybe<EventIdEnumFilter>;
  and?: InputMaybe<Array<IdentityKeyFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<IdentityKeyFilter>;
  or?: InputMaybe<Array<IdentityKeyFilter>>;
  permissions?: InputMaybe<JsonFilter>;
  removedReason?: InputMaybe<EventIdEnumFilter>;
  role?: InputMaybe<IdentityKeyRoleFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  validFromBlock?: InputMaybe<BlockFilter>;
  validFromBlockId?: InputMaybe<StringFilter>;
  validToBlock?: InputMaybe<BlockFilter>;
  validToBlockExists?: InputMaybe<Scalars['Boolean']['input']>;
  validToBlockId?: InputMaybe<StringFilter>;
};
export enum IdentityKeyRole {
  PrimaryKey = 'PrimaryKey',
  SecondaryKey = 'SecondaryKey',
}
export type IdentityKeyRoleFilter = {
  distinctFrom?: InputMaybe<IdentityKeyRole>;
  equalTo?: InputMaybe<IdentityKeyRole>;
  greaterThan?: InputMaybe<IdentityKeyRole>;
  greaterThanOrEqualTo?: InputMaybe<IdentityKeyRole>;
  in?: InputMaybe<Array<IdentityKeyRole>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<IdentityKeyRole>;
  lessThanOrEqualTo?: InputMaybe<IdentityKeyRole>;
  notDistinctFrom?: InputMaybe<IdentityKeyRole>;
  notEqualTo?: InputMaybe<IdentityKeyRole>;
  notIn?: InputMaybe<Array<IdentityKeyRole>>;
};
export enum IdentityKeysOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AddedReasonAsc = 'ADDED_REASON_ASC',
  AddedReasonDesc = 'ADDED_REASON_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemovedReasonAsc = 'REMOVED_REASON_ASC',
  RemovedReasonDesc = 'REMOVED_REASON_DESC',
  RoleAsc = 'ROLE_ASC',
  RoleDesc = 'ROLE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValidFromBlockIdAsc = 'VALID_FROM_BLOCK_ID_ASC',
  ValidFromBlockIdDesc = 'VALID_FROM_BLOCK_ID_DESC',
  ValidToBlockIdAsc = 'VALID_TO_BLOCK_ID_ASC',
  ValidToBlockIdDesc = 'VALID_TO_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type IndexOrigin = Node & {
  datetime: Scalars['Datetime']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  relativeFields: Scalars['JSON']['output'];
  specVersion: Scalars['Int']['output'];
  startBlock: Scalars['Int']['output'];
  startBlockHash: Scalars['String']['output'];
};
export type IndexOriginFilter = {
  and?: InputMaybe<Array<IndexOriginFilter>>;
  datetime?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<IndexOriginFilter>;
  or?: InputMaybe<Array<IndexOriginFilter>>;
  relativeFields?: InputMaybe<JsonFilter>;
  specVersion?: InputMaybe<IntFilter>;
  startBlock?: InputMaybe<IntFilter>;
  startBlockHash?: InputMaybe<StringFilter>;
};
export enum IndexOriginsOrderBy {
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RelativeFieldsAsc = 'RELATIVE_FIELDS_ASC',
  RelativeFieldsDesc = 'RELATIVE_FIELDS_DESC',
  SpecVersionAsc = 'SPEC_VERSION_ASC',
  SpecVersionDesc = 'SPEC_VERSION_DESC',
  StartBlockAsc = 'START_BLOCK_ASC',
  StartBlockDesc = 'START_BLOCK_DESC',
  StartBlockHashAsc = 'START_BLOCK_HASH_ASC',
  StartBlockHashDesc = 'START_BLOCK_HASH_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum IndexerAnomaliesOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  DetailAsc = 'DETAIL_ASC',
  DetailDesc = 'DETAIL_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KindAsc = 'KIND_ASC',
  KindDesc = 'KIND_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
}
export type IndexerAnomaly = Node & {
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  detail: Scalars['String']['output'];
  eventId?: Maybe<EventIdEnum>;
  id: Scalars['String']['output'];
  kind: AnomalyKind;
  moduleId?: Maybe<ModuleIdEnum>;
  nodeId: Scalars['ID']['output'];
  specVersionId: Scalars['Int']['output'];
};
export type IndexerAnomalyFilter = {
  and?: InputMaybe<Array<IndexerAnomalyFilter>>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DatetimeFilter>;
  detail?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  kind?: InputMaybe<AnomalyKindFilter>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  not?: InputMaybe<IndexerAnomalyFilter>;
  or?: InputMaybe<Array<IndexerAnomalyFilter>>;
  specVersionId?: InputMaybe<IntFilter>;
};
export type Instruction = Node & {
  accountsByAssetTransactionInstructionIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionInstructionIdAndToAccountId: Connection<Account>;
  accountsByInstructionAffirmationInstructionIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationInstructionIdAndSignerId: Connection<Account>;
  accountsByInstructionEventInstructionIdAndAccountId: Connection<Account>;
  accountsByInstructionEventInstructionIdAndSignerId: Connection<Account>;
  accountsByLegInstructionIdAndFromAccountId: Connection<Account>;
  accountsByLegInstructionIdAndToAccountId: Connection<Account>;
  affirmations: Connection<InstructionAffirmation>;
  assetsByAssetTransactionInstructionIdAndAssetId: Connection<Asset>;
  assetsByLegInstructionIdAndAssetId: Connection<Asset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  endAfterBlock?: Maybe<Scalars['Int']['output']>;
  endBlock?: Maybe<Scalars['Int']['output']>;
  events: Connection<InstructionEvent>;
  eventsByAssetTransactionInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationInstructionIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionEventInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionPartyInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionPartyInstructionIdAndUpdatedEventId: Connection<Event>;
  eventsByLegInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByLegInstructionIdAndUpdatedEventId: Connection<Event>;
  failureReason?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  identitiesByAssetTransactionInstructionIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionInstructionIdAndToIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationInstructionIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationInstructionIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionEventInstructionIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionPartyInstructionIdAndIdentityId: Connection<Identity>;
  identitiesByLegInstructionIdAndFromId: Connection<Identity>;
  identitiesByLegInstructionIdAndToId: Connection<Identity>;
  instructionPartiesByInstructionAffirmationInstructionIdAndPartyId: Connection<InstructionParty>;
  legCount: Scalars['Int']['output'];
  legs: Connection<Leg>;
  mediators: Scalars['JSON']['output'];
  memo?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationInstructionIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventInstructionIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  parties: Connection<InstructionParty>;
  portfoliosByAssetTransactionInstructionIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionInstructionIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionAffirmationInstructionIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventInstructionIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByLegInstructionIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegInstructionIdAndToPortfolioId: Connection<Portfolio>;
  rejectedBy?: Maybe<Identity>;
  rejectedById?: Maybe<Scalars['String']['output']>;
  rejectedBySigner?: Maybe<Account>;
  rejectedBySignerId?: Maybe<Scalars['String']['output']>;
  status: InstructionStatusEnum;
  tradeDate?: Maybe<Scalars['Datetime']['output']>;
  transfers: Connection<AssetTransaction>;
  type: InstructionTypeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  valueDate?: Maybe<Scalars['Datetime']['output']>;
  venue?: Maybe<Venue>;
  venueId?: Maybe<Scalars['String']['output']>;
};
export type InstructionAffirmation = Node & {
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']['output']>;
  affirmedBy?: Maybe<Identity>;
  affirmedById?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  expiry?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  isAutomaticallyAffirmed: Scalars['Boolean']['output'];
  isMediator: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptId?: Maybe<Scalars['String']['output']>;
  party?: Maybe<InstructionParty>;
  partyId: Scalars['String']['output'];
  portfolio?: Maybe<Portfolio>;
  portfolioId?: Maybe<Scalars['String']['output']>;
  signer?: Maybe<Account>;
  signerId?: Maybe<Scalars['String']['output']>;
  status: AffirmStatusEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type InstructionAffirmationFilter = {
  account?: InputMaybe<AccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  affirmedBy?: InputMaybe<IdentityFilter>;
  affirmedByExists?: InputMaybe<Scalars['Boolean']['input']>;
  affirmedById?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<InstructionAffirmationFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  isAutomaticallyAffirmed?: InputMaybe<BooleanFilter>;
  isMediator?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<InstructionAffirmationFilter>;
  offChainReceipt?: InputMaybe<OffChainReceiptFilter>;
  offChainReceiptExists?: InputMaybe<Scalars['Boolean']['input']>;
  offChainReceiptId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InstructionAffirmationFilter>>;
  party?: InputMaybe<InstructionPartyFilter>;
  partyId?: InputMaybe<StringFilter>;
  portfolio?: InputMaybe<PortfolioFilter>;
  portfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioId?: InputMaybe<StringFilter>;
  signer?: InputMaybe<AccountFilter>;
  signerExists?: InputMaybe<Scalars['Boolean']['input']>;
  signerId?: InputMaybe<StringFilter>;
  status?: InputMaybe<AffirmStatusEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum InstructionAffirmationsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  IsAutomaticallyAffirmedAsc = 'IS_AUTOMATICALLY_AFFIRMED_ASC',
  IsAutomaticallyAffirmedDesc = 'IS_AUTOMATICALLY_AFFIRMED_DESC',
  IsMediatorAsc = 'IS_MEDIATOR_ASC',
  IsMediatorDesc = 'IS_MEDIATOR_DESC',
  Natural = 'NATURAL',
  OffChainReceiptIdAsc = 'OFF_CHAIN_RECEIPT_ID_ASC',
  OffChainReceiptIdDesc = 'OFF_CHAIN_RECEIPT_ID_DESC',
  PartyIdAsc = 'PARTY_ID_ASC',
  PartyIdDesc = 'PARTY_ID_DESC',
  PortfolioIdAsc = 'PORTFOLIO_ID_ASC',
  PortfolioIdDesc = 'PORTFOLIO_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionEvent = Node & {
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  event: InstructionEventEnum;
  failureReason?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptId?: Maybe<Scalars['String']['output']>;
  portfolio?: Maybe<Portfolio>;
  portfolioId?: Maybe<Scalars['String']['output']>;
  signer?: Maybe<Account>;
  signerId?: Maybe<Scalars['String']['output']>;
};
export enum InstructionEventEnum {
  AffirmationWithdrawn = 'AffirmationWithdrawn',
  FailedToExecuteInstruction = 'FailedToExecuteInstruction',
  InstructionAffirmed = 'InstructionAffirmed',
  InstructionAutomaticallyAffirmed = 'InstructionAutomaticallyAffirmed',
  InstructionCreated = 'InstructionCreated',
  InstructionExecuted = 'InstructionExecuted',
  InstructionFailed = 'InstructionFailed',
  InstructionLocked = 'InstructionLocked',
  InstructionMediators = 'InstructionMediators',
  InstructionRejected = 'InstructionRejected',
  InstructionRescheduled = 'InstructionRescheduled',
  InstructionUnlocked = 'InstructionUnlocked',
  LegFailedExecution = 'LegFailedExecution',
  MediatorAffirmationReceived = 'MediatorAffirmationReceived',
  MediatorAffirmationWithdrawn = 'MediatorAffirmationWithdrawn',
  ReceiptClaimed = 'ReceiptClaimed',
  SchedulingFailed = 'SchedulingFailed',
  SettlementManuallyExecuted = 'SettlementManuallyExecuted',
  VenueCreated = 'VenueCreated',
  VenueDetailsUpdated = 'VenueDetailsUpdated',
  VenueFiltering = 'VenueFiltering',
  VenueSignersUpdated = 'VenueSignersUpdated',
  VenueTypeUpdated = 'VenueTypeUpdated',
  VenueUnauthorized = 'VenueUnauthorized',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
}
export type InstructionEventEnumFilter = {
  distinctFrom?: InputMaybe<InstructionEventEnum>;
  equalTo?: InputMaybe<InstructionEventEnum>;
  greaterThan?: InputMaybe<InstructionEventEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionEventEnum>;
  in?: InputMaybe<Array<InstructionEventEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionEventEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionEventEnum>;
  notDistinctFrom?: InputMaybe<InstructionEventEnum>;
  notEqualTo?: InputMaybe<InstructionEventEnum>;
  notIn?: InputMaybe<Array<InstructionEventEnum>>;
};
export type InstructionEventFilter = {
  account?: InputMaybe<AccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<InstructionEventFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  event?: InputMaybe<InstructionEventEnumFilter>;
  failureReason?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  not?: InputMaybe<InstructionEventFilter>;
  offChainReceipt?: InputMaybe<OffChainReceiptFilter>;
  offChainReceiptExists?: InputMaybe<Scalars['Boolean']['input']>;
  offChainReceiptId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InstructionEventFilter>>;
  portfolio?: InputMaybe<PortfolioFilter>;
  portfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioId?: InputMaybe<StringFilter>;
  signer?: InputMaybe<AccountFilter>;
  signerExists?: InputMaybe<Scalars['Boolean']['input']>;
  signerId?: InputMaybe<StringFilter>;
};
export enum InstructionEventsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventAsc = 'EVENT_ASC',
  EventDesc = 'EVENT_DESC',
  FailureReasonAsc = 'FAILURE_REASON_ASC',
  FailureReasonDesc = 'FAILURE_REASON_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  Natural = 'NATURAL',
  OffChainReceiptIdAsc = 'OFF_CHAIN_RECEIPT_ID_ASC',
  OffChainReceiptIdDesc = 'OFF_CHAIN_RECEIPT_ID_DESC',
  PortfolioIdAsc = 'PORTFOLIO_ID_ASC',
  PortfolioIdDesc = 'PORTFOLIO_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionFilter = {
  affirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  and?: InputMaybe<Array<InstructionFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  endAfterBlock?: InputMaybe<IntFilter>;
  endBlock?: InputMaybe<IntFilter>;
  events?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  failureReason?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  legCount?: InputMaybe<IntFilter>;
  legs?: InputMaybe<OneToManyFilter<LegFilter>>;
  mediators?: InputMaybe<JsonFilter>;
  memo?: InputMaybe<StringFilter>;
  not?: InputMaybe<InstructionFilter>;
  or?: InputMaybe<Array<InstructionFilter>>;
  parties?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  rejectedBy?: InputMaybe<IdentityFilter>;
  rejectedByExists?: InputMaybe<Scalars['Boolean']['input']>;
  rejectedById?: InputMaybe<StringFilter>;
  rejectedBySigner?: InputMaybe<AccountFilter>;
  rejectedBySignerExists?: InputMaybe<Scalars['Boolean']['input']>;
  rejectedBySignerId?: InputMaybe<StringFilter>;
  status?: InputMaybe<InstructionStatusEnumFilter>;
  tradeDate?: InputMaybe<DatetimeFilter>;
  transfers?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  type?: InputMaybe<InstructionTypeEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  valueDate?: InputMaybe<DatetimeFilter>;
  venue?: InputMaybe<VenueFilter>;
  venueExists?: InputMaybe<Scalars['Boolean']['input']>;
  venueId?: InputMaybe<StringFilter>;
};
export enum InstructionPartiesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  IsMediatorAsc = 'IS_MEDIATOR_ASC',
  IsMediatorDesc = 'IS_MEDIATOR_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionParty = Node & {
  accountsByInstructionAffirmationPartyIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationPartyIdAndSignerId: Connection<Account>;
  affirmations: Connection<InstructionAffirmation>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByInstructionAffirmationPartyIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationPartyIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByInstructionAffirmationPartyIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationPartyIdAndIdentityId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  instructionsByInstructionAffirmationPartyIdAndInstructionId: Connection<Instruction>;
  isMediator: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationPartyIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  portfoliosByInstructionAffirmationPartyIdAndPortfolioId: Connection<Portfolio>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type InstructionPartyFilter = {
  affirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  and?: InputMaybe<Array<InstructionPartyFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  isMediator?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<InstructionPartyFilter>;
  or?: InputMaybe<Array<InstructionPartyFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum InstructionStatusEnum {
  Created = 'Created',
  Executed = 'Executed',
  Failed = 'Failed',
  Locked = 'Locked',
  Rejected = 'Rejected',
}
export type InstructionStatusEnumFilter = {
  distinctFrom?: InputMaybe<InstructionStatusEnum>;
  equalTo?: InputMaybe<InstructionStatusEnum>;
  greaterThan?: InputMaybe<InstructionStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionStatusEnum>;
  in?: InputMaybe<Array<InstructionStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionStatusEnum>;
  notDistinctFrom?: InputMaybe<InstructionStatusEnum>;
  notEqualTo?: InputMaybe<InstructionStatusEnum>;
  notIn?: InputMaybe<Array<InstructionStatusEnum>>;
};
export enum InstructionTypeEnum {
  SettleAfterLock = 'SettleAfterLock',
  SettleManual = 'SettleManual',
  SettleOnAffirmation = 'SettleOnAffirmation',
  SettleOnBlock = 'SettleOnBlock',
}
export type InstructionTypeEnumFilter = {
  distinctFrom?: InputMaybe<InstructionTypeEnum>;
  equalTo?: InputMaybe<InstructionTypeEnum>;
  greaterThan?: InputMaybe<InstructionTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionTypeEnum>;
  in?: InputMaybe<Array<InstructionTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionTypeEnum>;
  notDistinctFrom?: InputMaybe<InstructionTypeEnum>;
  notEqualTo?: InputMaybe<InstructionTypeEnum>;
  notIn?: InputMaybe<Array<InstructionTypeEnum>>;
};
export enum InstructionsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EndAfterBlockAsc = 'END_AFTER_BLOCK_ASC',
  EndAfterBlockDesc = 'END_AFTER_BLOCK_DESC',
  EndBlockAsc = 'END_BLOCK_ASC',
  EndBlockDesc = 'END_BLOCK_DESC',
  FailureReasonAsc = 'FAILURE_REASON_ASC',
  FailureReasonDesc = 'FAILURE_REASON_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MediatorsAsc = 'MEDIATORS_ASC',
  MediatorsDesc = 'MEDIATORS_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  TradeDateAsc = 'TRADE_DATE_ASC',
  TradeDateDesc = 'TRADE_DATE_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValueDateAsc = 'VALUE_DATE_ASC',
  ValueDateDesc = 'VALUE_DATE_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type IntFilter = {
  distinctFrom?: InputMaybe<Scalars['Int']['input']>;
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>;
};
export type Investment = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  investor?: Maybe<Identity>;
  investorId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offeringAsset?: Maybe<Asset>;
  offeringAssetId: Scalars['String']['output'];
  offeringToken?: Maybe<Scalars['String']['output']>;
  offeringTokenAmount: Scalars['BigFloat']['output'];
  raiseToken?: Maybe<Scalars['String']['output']>;
  raiseTokenAmount: Scalars['BigFloat']['output'];
  raisingAsset?: Maybe<Asset>;
  raisingAssetId?: Maybe<Scalars['String']['output']>;
  raisingAssetType: RaisingAssetTypeEnum;
  sto?: Maybe<Sto>;
  stoId: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type InvestmentFilter = {
  and?: InputMaybe<Array<InvestmentFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  investor?: InputMaybe<IdentityFilter>;
  investorId?: InputMaybe<StringFilter>;
  not?: InputMaybe<InvestmentFilter>;
  offeringAsset?: InputMaybe<AssetFilter>;
  offeringAssetId?: InputMaybe<StringFilter>;
  offeringToken?: InputMaybe<StringFilter>;
  offeringTokenAmount?: InputMaybe<BigFloatFilter>;
  or?: InputMaybe<Array<InvestmentFilter>>;
  raiseToken?: InputMaybe<StringFilter>;
  raiseTokenAmount?: InputMaybe<BigFloatFilter>;
  raisingAsset?: InputMaybe<AssetFilter>;
  raisingAssetExists?: InputMaybe<Scalars['Boolean']['input']>;
  raisingAssetId?: InputMaybe<StringFilter>;
  raisingAssetType?: InputMaybe<RaisingAssetTypeEnumFilter>;
  sto?: InputMaybe<StoFilter>;
  stoId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum InvestmentsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InvestorIdAsc = 'INVESTOR_ID_ASC',
  InvestorIdDesc = 'INVESTOR_ID_DESC',
  Natural = 'NATURAL',
  OfferingAssetIdAsc = 'OFFERING_ASSET_ID_ASC',
  OfferingAssetIdDesc = 'OFFERING_ASSET_ID_DESC',
  OfferingTokenAmountAsc = 'OFFERING_TOKEN_AMOUNT_ASC',
  OfferingTokenAmountDesc = 'OFFERING_TOKEN_AMOUNT_DESC',
  OfferingTokenAsc = 'OFFERING_TOKEN_ASC',
  OfferingTokenDesc = 'OFFERING_TOKEN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RaiseTokenAmountAsc = 'RAISE_TOKEN_AMOUNT_ASC',
  RaiseTokenAmountDesc = 'RAISE_TOKEN_AMOUNT_DESC',
  RaiseTokenAsc = 'RAISE_TOKEN_ASC',
  RaiseTokenDesc = 'RAISE_TOKEN_DESC',
  RaisingAssetIdAsc = 'RAISING_ASSET_ID_ASC',
  RaisingAssetIdDesc = 'RAISING_ASSET_ID_DESC',
  RaisingAssetTypeAsc = 'RAISING_ASSET_TYPE_ASC',
  RaisingAssetTypeDesc = 'RAISING_ASSET_TYPE_DESC',
  StoIdAsc = 'STO_ID_ASC',
  StoIdDesc = 'STO_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type JsonFilter = {
  containedBy?: InputMaybe<Scalars['JSON']['input']>;
  contains?: InputMaybe<Scalars['JSON']['input']>;
  containsAllKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  containsAnyKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  containsKey?: InputMaybe<Scalars['String']['input']>;
  distinctFrom?: InputMaybe<Scalars['JSON']['input']>;
  equalTo?: InputMaybe<Scalars['JSON']['input']>;
  greaterThan?: InputMaybe<Scalars['JSON']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<Scalars['JSON']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['JSON']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['JSON']['input']>;
  notEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  notIn?: InputMaybe<Array<Scalars['JSON']['input']>>;
};
export type Leg = Node & {
  accountsByOffChainReceiptLegIdAndSignerId: Connection<Account>;
  addresses: Scalars['JSON']['output'];
  amount?: Maybe<Scalars['BigFloat']['output']>;
  asset?: Maybe<Asset>;
  assetId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByOffChainReceiptLegIdAndCreatedEventId: Connection<Event>;
  eventsByOffChainReceiptLegIdAndUpdatedEventId: Connection<Event>;
  from?: Maybe<Identity>;
  fromAccount?: Maybe<Account>;
  fromAccountId?: Maybe<Scalars['String']['output']>;
  fromId?: Maybe<Scalars['String']['output']>;
  fromPortfolio?: Maybe<Portfolio>;
  fromPortfolioId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  legIndex: Scalars['Int']['output'];
  legType: LegTypeEnum;
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  offChainReceipts: Connection<OffChainReceipt>;
  ticker?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Identity>;
  toAccount?: Maybe<Account>;
  toAccountId?: Maybe<Scalars['String']['output']>;
  toId?: Maybe<Scalars['String']['output']>;
  toPortfolio?: Maybe<Portfolio>;
  toPortfolioId?: Maybe<Scalars['String']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type LegFilter = {
  addresses?: InputMaybe<JsonFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<LegFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetExists?: InputMaybe<Scalars['Boolean']['input']>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  from?: InputMaybe<IdentityFilter>;
  fromAccount?: InputMaybe<AccountFilter>;
  fromAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromAccountId?: InputMaybe<StringFilter>;
  fromExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromId?: InputMaybe<StringFilter>;
  fromPortfolio?: InputMaybe<PortfolioFilter>;
  fromPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromPortfolioId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  legIndex?: InputMaybe<IntFilter>;
  legType?: InputMaybe<LegTypeEnumFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<LegFilter>;
  offChainReceipts?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  or?: InputMaybe<Array<LegFilter>>;
  ticker?: InputMaybe<StringFilter>;
  to?: InputMaybe<IdentityFilter>;
  toAccount?: InputMaybe<AccountFilter>;
  toAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  toAccountId?: InputMaybe<StringFilter>;
  toExists?: InputMaybe<Scalars['Boolean']['input']>;
  toId?: InputMaybe<StringFilter>;
  toPortfolio?: InputMaybe<PortfolioFilter>;
  toPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  toPortfolioId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum LegTypeEnum {
  Fungible = 'Fungible',
  NonFungible = 'NonFungible',
  OffChain = 'OffChain',
}
export type LegTypeEnumFilter = {
  distinctFrom?: InputMaybe<LegTypeEnum>;
  equalTo?: InputMaybe<LegTypeEnum>;
  greaterThan?: InputMaybe<LegTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<LegTypeEnum>;
  in?: InputMaybe<Array<LegTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<LegTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<LegTypeEnum>;
  notDistinctFrom?: InputMaybe<LegTypeEnum>;
  notEqualTo?: InputMaybe<LegTypeEnum>;
  notIn?: InputMaybe<Array<LegTypeEnum>>;
};
export enum LegsOrderBy {
  AddressesAsc = 'ADDRESSES_ASC',
  AddressesDesc = 'ADDRESSES_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  FromAccountIdAsc = 'FROM_ACCOUNT_ID_ASC',
  FromAccountIdDesc = 'FROM_ACCOUNT_ID_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  FromPortfolioIdAsc = 'FROM_PORTFOLIO_ID_ASC',
  FromPortfolioIdDesc = 'FROM_PORTFOLIO_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  LegIndexAsc = 'LEG_INDEX_ASC',
  LegIndexDesc = 'LEG_INDEX_DESC',
  LegTypeAsc = 'LEG_TYPE_ASC',
  LegTypeDesc = 'LEG_TYPE_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  ToAccountIdAsc = 'TO_ACCOUNT_ID_ASC',
  ToAccountIdDesc = 'TO_ACCOUNT_ID_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  ToPortfolioIdAsc = 'TO_PORTFOLIO_ID_ASC',
  ToPortfolioIdDesc = 'TO_PORTFOLIO_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum MetadataScope {
  Global = 'Global',
  Local = 'Local',
}
export type MetadataScopeFilter = {
  distinctFrom?: InputMaybe<MetadataScope>;
  equalTo?: InputMaybe<MetadataScope>;
  greaterThan?: InputMaybe<MetadataScope>;
  greaterThanOrEqualTo?: InputMaybe<MetadataScope>;
  in?: InputMaybe<Array<MetadataScope>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MetadataScope>;
  lessThanOrEqualTo?: InputMaybe<MetadataScope>;
  notDistinctFrom?: InputMaybe<MetadataScope>;
  notEqualTo?: InputMaybe<MetadataScope>;
  notIn?: InputMaybe<Array<MetadataScope>>;
};
export type Migration = Node & {
  executed: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  processedBlock: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};
export type MigrationFilter = {
  and?: InputMaybe<Array<MigrationFilter>>;
  executed?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MigrationFilter>;
  number?: InputMaybe<IntFilter>;
  or?: InputMaybe<Array<MigrationFilter>>;
  processedBlock?: InputMaybe<IntFilter>;
  version?: InputMaybe<StringFilter>;
};
export enum MigrationsOrderBy {
  ExecutedAsc = 'EXECUTED_ASC',
  ExecutedDesc = 'EXECUTED_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NumberAsc = 'NUMBER_ASC',
  NumberDesc = 'NUMBER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProcessedBlockAsc = 'PROCESSED_BLOCK_ASC',
  ProcessedBlockDesc = 'PROCESSED_BLOCK_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ModuleIdEnum {
  Asset = 'asset',
  Authoritydiscovery = 'authoritydiscovery',
  Authorship = 'authorship',
  Babe = 'babe',
  Balances = 'balances',
  Base = 'base',
  Beefy = 'beefy',
  Bridge = 'bridge',
  Capitaldistribution = 'capitaldistribution',
  Cddserviceproviders = 'cddserviceproviders',
  Checkpoint = 'checkpoint',
  Committeemembership = 'committeemembership',
  Compliancemanager = 'compliancemanager',
  Confidential = 'confidential',
  Confidentialasset = 'confidentialasset',
  Confidentialassets = 'confidentialassets',
  Contracts = 'contracts',
  Corporateaction = 'corporateaction',
  Corporateballot = 'corporateballot',
  Didregistrars = 'didregistrars',
  Dividend = 'dividend',
  Electionprovidermultiphase = 'electionprovidermultiphase',
  Exemption = 'exemption',
  Externalagents = 'externalagents',
  Finalitytracker = 'finalitytracker',
  Grandpa = 'grandpa',
  Historical = 'historical',
  Identity = 'identity',
  Imonline = 'imonline',
  Indices = 'indices',
  Mmr = 'mmr',
  Mmrleaf = 'mmrleaf',
  Multiblockmigrations = 'multiblockmigrations',
  Multisig = 'multisig',
  Nft = 'nft',
  Offences = 'offences',
  Permissions = 'permissions',
  Pips = 'pips',
  Polymeshcommittee = 'polymeshcommittee',
  Polymeshcontracts = 'polymeshcontracts',
  Polymeshtransactionpayment = 'polymeshtransactionpayment',
  Portfolio = 'portfolio',
  Preimage = 'preimage',
  Protocolfee = 'protocolfee',
  Randomnesscollectiveflip = 'randomnesscollectiveflip',
  Relayer = 'relayer',
  Revive = 'revive',
  Rewards = 'rewards',
  Scheduler = 'scheduler',
  Seeding = 'seeding',
  Session = 'session',
  Settlement = 'settlement',
  Staking = 'staking',
  Statetriemigration = 'statetriemigration',
  Statistics = 'statistics',
  Sto = 'sto',
  Stocapped = 'stocapped',
  Sudo = 'sudo',
  System = 'system',
  Technicalcommittee = 'technicalcommittee',
  Technicalcommitteemembership = 'technicalcommitteemembership',
  Testutils = 'testutils',
  Timestamp = 'timestamp',
  Transactionpayment = 'transactionpayment',
  Treasury = 'treasury',
  Unknown = 'unknown',
  Upgradecommittee = 'upgradecommittee',
  Upgradecommitteemembership = 'upgradecommitteemembership',
  Utility = 'utility',
  Validators = 'validators',
}
export type ModuleIdEnumFilter = {
  distinctFrom?: InputMaybe<ModuleIdEnum>;
  equalTo?: InputMaybe<ModuleIdEnum>;
  greaterThan?: InputMaybe<ModuleIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<ModuleIdEnum>;
  in?: InputMaybe<Array<ModuleIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ModuleIdEnum>;
  lessThanOrEqualTo?: InputMaybe<ModuleIdEnum>;
  notDistinctFrom?: InputMaybe<ModuleIdEnum>;
  notEqualTo?: InputMaybe<ModuleIdEnum>;
  notIn?: InputMaybe<Array<ModuleIdEnum>>;
};
export enum MovementKind {
  BalanceSetAdjustment = 'BalanceSetAdjustment',
  BlockAuthorFee = 'BlockAuthorFee',
  Burn = 'Burn',
  DustLost = 'DustLost',
  Endowment = 'Endowment',
  Fee = 'Fee',
  Hold = 'Hold',
  Mint = 'Mint',
  Release = 'Release',
  ReserveRepatriation = 'ReserveRepatriation',
  Slash = 'Slash',
  StakingReward = 'StakingReward',
  Tip = 'Tip',
  Transfer = 'Transfer',
  TreasuryDisbursement = 'TreasuryDisbursement',
  TreasuryReimbursement = 'TreasuryReimbursement',
}
export type MovementKindFilter = {
  distinctFrom?: InputMaybe<MovementKind>;
  equalTo?: InputMaybe<MovementKind>;
  greaterThan?: InputMaybe<MovementKind>;
  greaterThanOrEqualTo?: InputMaybe<MovementKind>;
  in?: InputMaybe<Array<MovementKind>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MovementKind>;
  lessThanOrEqualTo?: InputMaybe<MovementKind>;
  notDistinctFrom?: InputMaybe<MovementKind>;
  notEqualTo?: InputMaybe<MovementKind>;
  notIn?: InputMaybe<Array<MovementKind>>;
};
export type MultiSig = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  accountsByMultiSigProposalMultisigIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigSignerMultisigIdAndSignerAccountId: Connection<Account>;
  admins: Connection<MultiSigAdmin>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorAccount?: Maybe<Account>;
  creatorAccountId?: Maybe<Scalars['String']['output']>;
  creatorId?: Maybe<Scalars['String']['output']>;
  eventsByMultiSigAdminMultisigIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigAdminMultisigIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigProposalMultisigIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalMultisigIdAndUpdatedEventId: Connection<Event>;
  eventsByMultiSigSignerMultisigIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigSignerMultisigIdAndUpdatedEventId: Connection<Event>;
  extrinsicsByMultiSigProposalMultisigIdAndExtrinsicId: Connection<Extrinsic>;
  id: Scalars['String']['output'];
  identitiesByMultiSigAdminMultisigIdAndAdminId: Connection<Identity>;
  identitiesByMultiSigProposalMultisigIdAndCreatorId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  proposals: Connection<MultiSigProposal>;
  signaturesRequired: Scalars['Int']['output'];
  signers: Connection<MultiSigSigner>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type MultiSigAdmin = Node & {
  admin?: Maybe<Identity>;
  adminId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  status: MultiSigAdminStatusEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type MultiSigAdminFilter = {
  admin?: InputMaybe<IdentityFilter>;
  adminId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<MultiSigAdminFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigAdminFilter>;
  or?: InputMaybe<Array<MultiSigAdminFilter>>;
  status?: InputMaybe<MultiSigAdminStatusEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum MultiSigAdminStatusEnum {
  Authorized = 'Authorized',
  Removed = 'Removed',
}
export type MultiSigAdminStatusEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigAdminStatusEnum>;
  equalTo?: InputMaybe<MultiSigAdminStatusEnum>;
  greaterThan?: InputMaybe<MultiSigAdminStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  in?: InputMaybe<Array<MultiSigAdminStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigAdminStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  notDistinctFrom?: InputMaybe<MultiSigAdminStatusEnum>;
  notEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  notIn?: InputMaybe<Array<MultiSigAdminStatusEnum>>;
};
export enum MultiSigAdminsOrderBy {
  AdminIdAsc = 'ADMIN_ID_ASC',
  AdminIdDesc = 'ADMIN_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type MultiSigFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  admins?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  and?: InputMaybe<Array<MultiSigFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorAccount?: InputMaybe<AccountFilter>;
  creatorAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  creatorAccountId?: InputMaybe<StringFilter>;
  creatorExists?: InputMaybe<Scalars['Boolean']['input']>;
  creatorId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigFilter>;
  or?: InputMaybe<Array<MultiSigFilter>>;
  proposals?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  signaturesRequired?: InputMaybe<IntFilter>;
  signers?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type MultiSigProposal = Node & {
  approvalCount: Scalars['Int']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorAccount?: Maybe<Account>;
  creatorAccountId?: Maybe<Scalars['String']['output']>;
  creatorId?: Maybe<Scalars['String']['output']>;
  eventsByMultiSigProposalVoteProposalIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteProposalIdAndUpdatedEventId: Connection<Event>;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  multiSigSignersByMultiSigProposalVoteProposalIdAndSignerId: Connection<MultiSigSigner>;
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  params: Scalars['JSON']['output'];
  proposalId: Scalars['Int']['output'];
  rejectionCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  votes: Connection<MultiSigProposalVote>;
};
export type MultiSigProposalFilter = {
  and?: InputMaybe<Array<MultiSigProposalFilter>>;
  approvalCount?: InputMaybe<IntFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorAccount?: InputMaybe<AccountFilter>;
  creatorAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  creatorAccountId?: InputMaybe<StringFilter>;
  creatorExists?: InputMaybe<Scalars['Boolean']['input']>;
  creatorId?: InputMaybe<StringFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigProposalFilter>;
  or?: InputMaybe<Array<MultiSigProposalFilter>>;
  params?: InputMaybe<JsonFilter>;
  proposalId?: InputMaybe<IntFilter>;
  rejectionCount?: InputMaybe<IntFilter>;
  status?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
};
export type MultiSigProposalVote = Node & {
  action?: Maybe<MultiSigProposalVoteActionEnum>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  proposal?: Maybe<MultiSigProposal>;
  proposalId: Scalars['String']['output'];
  signer?: Maybe<MultiSigSigner>;
  signerId: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export enum MultiSigProposalVoteActionEnum {
  Approved = 'Approved',
  Rejected = 'Rejected',
}
export type MultiSigProposalVoteActionEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigProposalVoteActionEnum>;
  equalTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  greaterThan?: InputMaybe<MultiSigProposalVoteActionEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  in?: InputMaybe<Array<MultiSigProposalVoteActionEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigProposalVoteActionEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notDistinctFrom?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notIn?: InputMaybe<Array<MultiSigProposalVoteActionEnum>>;
};
export type MultiSigProposalVoteFilter = {
  action?: InputMaybe<MultiSigProposalVoteActionEnumFilter>;
  and?: InputMaybe<Array<MultiSigProposalVoteFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigProposalVoteFilter>;
  or?: InputMaybe<Array<MultiSigProposalVoteFilter>>;
  proposal?: InputMaybe<MultiSigProposalFilter>;
  proposalId?: InputMaybe<StringFilter>;
  signer?: InputMaybe<MultiSigSignerFilter>;
  signerId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum MultiSigProposalVotesOrderBy {
  ActionAsc = 'ACTION_ASC',
  ActionDesc = 'ACTION_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum MultiSigProposalsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorAccountIdAsc = 'CREATOR_ACCOUNT_ID_ASC',
  CreatorAccountIdDesc = 'CREATOR_ACCOUNT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  ParamsAsc = 'PARAMS_ASC',
  ParamsDesc = 'PARAMS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type MultiSigSigner = Node & {
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByMultiSigProposalVoteSignerIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteSignerIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  multiSigProposalsByMultiSigProposalVoteSignerIdAndProposalId: Connection<MultiSigProposal>;
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  signerAccount?: Maybe<Account>;
  signerAccountId?: Maybe<Scalars['String']['output']>;
  signerType: SignerTypeEnum;
  signerValue: Scalars['String']['output'];
  status: MultiSigSignerStatusEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  votes: Connection<MultiSigProposalVote>;
};
export type MultiSigSignerFilter = {
  and?: InputMaybe<Array<MultiSigSignerFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigSignerFilter>;
  or?: InputMaybe<Array<MultiSigSignerFilter>>;
  signerAccount?: InputMaybe<AccountFilter>;
  signerAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  signerAccountId?: InputMaybe<StringFilter>;
  signerType?: InputMaybe<SignerTypeEnumFilter>;
  signerValue?: InputMaybe<StringFilter>;
  status?: InputMaybe<MultiSigSignerStatusEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
};
export enum MultiSigSignerStatusEnum {
  Approved = 'Approved',
  Authorized = 'Authorized',
  Removed = 'Removed',
}
export type MultiSigSignerStatusEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigSignerStatusEnum>;
  equalTo?: InputMaybe<MultiSigSignerStatusEnum>;
  greaterThan?: InputMaybe<MultiSigSignerStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  in?: InputMaybe<Array<MultiSigSignerStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigSignerStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  notDistinctFrom?: InputMaybe<MultiSigSignerStatusEnum>;
  notEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  notIn?: InputMaybe<Array<MultiSigSignerStatusEnum>>;
};
export enum MultiSigSignersOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerAccountIdAsc = 'SIGNER_ACCOUNT_ID_ASC',
  SignerAccountIdDesc = 'SIGNER_ACCOUNT_ID_DESC',
  SignerTypeAsc = 'SIGNER_TYPE_ASC',
  SignerTypeDesc = 'SIGNER_TYPE_DESC',
  SignerValueAsc = 'SIGNER_VALUE_ASC',
  SignerValueDesc = 'SIGNER_VALUE_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum MultiSigsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorAccountIdAsc = 'CREATOR_ACCOUNT_ID_ASC',
  CreatorAccountIdDesc = 'CREATOR_ACCOUNT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignaturesRequiredAsc = 'SIGNATURES_REQUIRED_ASC',
  SignaturesRequiredDesc = 'SIGNATURES_REQUIRED_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Nft = Node & {
  accountsByNftApprovalNftIdAndOwnerId: Connection<Account>;
  accountsByNftApprovalNftIdAndSpenderId: Connection<Account>;
  approvals: Connection<NftApproval>;
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByNftApprovalNftIdAndAssetId: Connection<Asset>;
  burnedEvent?: Maybe<Event>;
  burnedEventId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByNftApprovalNftIdAndCreatedEventId: Connection<Event>;
  eventsByNftApprovalNftIdAndUpdatedEventId: Connection<Event>;
  holding?: Maybe<Holding>;
  holdingId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  nftId: Scalars['BigFloat']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type NftApproval = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nft?: Maybe<Nft>;
  nftId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Account>;
  ownerId: Scalars['String']['output'];
  spender?: Maybe<Account>;
  spenderId: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type NftApprovalFilter = {
  and?: InputMaybe<Array<NftApprovalFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  nft?: InputMaybe<NftFilter>;
  nftExists?: InputMaybe<Scalars['Boolean']['input']>;
  nftId?: InputMaybe<StringFilter>;
  not?: InputMaybe<NftApprovalFilter>;
  or?: InputMaybe<Array<NftApprovalFilter>>;
  owner?: InputMaybe<AccountFilter>;
  ownerId?: InputMaybe<StringFilter>;
  spender?: InputMaybe<AccountFilter>;
  spenderId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum NftApprovalsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NftIdAsc = 'NFT_ID_ASC',
  NftIdDesc = 'NFT_ID_DESC',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpenderIdAsc = 'SPENDER_ID_ASC',
  SpenderIdDesc = 'SPENDER_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type NftFilter = {
  and?: InputMaybe<Array<NftFilter>>;
  approvals?: InputMaybe<OneToManyFilter<NftApprovalFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  burnedEvent?: InputMaybe<EventFilter>;
  burnedEventExists?: InputMaybe<Scalars['Boolean']['input']>;
  burnedEventId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  holding?: InputMaybe<HoldingFilter>;
  holdingExists?: InputMaybe<Scalars['Boolean']['input']>;
  holdingId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  nftId?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<NftFilter>;
  or?: InputMaybe<Array<NftFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type NftOperatorApproval = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  operator?: Maybe<Account>;
  operatorId: Scalars['String']['output'];
  owner?: Maybe<Account>;
  ownerId: Scalars['String']['output'];
};
export type NftOperatorApprovalFilter = {
  and?: InputMaybe<Array<NftOperatorApprovalFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<NftOperatorApprovalFilter>;
  operator?: InputMaybe<AccountFilter>;
  operatorId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<NftOperatorApprovalFilter>>;
  owner?: InputMaybe<AccountFilter>;
  ownerId?: InputMaybe<StringFilter>;
};
export enum NftOperatorApprovalsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OperatorIdAsc = 'OPERATOR_ID_ASC',
  OperatorIdDesc = 'OPERATOR_ID_DESC',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum NftsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  BurnedEventIdAsc = 'BURNED_EVENT_ID_ASC',
  BurnedEventIdDesc = 'BURNED_EVENT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  HoldingIdAsc = 'HOLDING_ID_ASC',
  HoldingIdDesc = 'HOLDING_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NftIdAsc = 'NFT_ID_ASC',
  NftIdDesc = 'NFT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Node = {
  nodeId: Scalars['ID']['output'];
};
export enum NullOrder {
  NullsFirst = 'NULLS_FIRST',
  NullsLast = 'NULLS_LAST',
}
export type OffChainReceipt = Node & {
  accountsByInstructionAffirmationOffChainReceiptIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationOffChainReceiptIdAndSignerId: Connection<Account>;
  accountsByInstructionEventOffChainReceiptIdAndAccountId: Connection<Account>;
  accountsByInstructionEventOffChainReceiptIdAndSignerId: Connection<Account>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByInstructionAffirmationOffChainReceiptIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationOffChainReceiptIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionEventOffChainReceiptIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByInstructionAffirmationOffChainReceiptIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationOffChainReceiptIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionEventOffChainReceiptIdAndIdentityId: Connection<Identity>;
  instructionAffirmations: Connection<InstructionAffirmation>;
  instructionEvents: Connection<InstructionEvent>;
  instructionPartiesByInstructionAffirmationOffChainReceiptIdAndPartyId: Connection<InstructionParty>;
  instructionsByInstructionAffirmationOffChainReceiptIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventOffChainReceiptIdAndInstructionId: Connection<Instruction>;
  leg?: Maybe<Leg>;
  legId?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  portfoliosByInstructionAffirmationOffChainReceiptIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByInstructionEventOffChainReceiptIdAndPortfolioId: Connection<Portfolio>;
  signer?: Maybe<Account>;
  signerId: Scalars['String']['output'];
  uid: Scalars['Int']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type OffChainReceiptFilter = {
  and?: InputMaybe<Array<OffChainReceiptFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instructionAffirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionEvents?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  leg?: InputMaybe<LegFilter>;
  legExists?: InputMaybe<Scalars['Boolean']['input']>;
  legId?: InputMaybe<StringFilter>;
  metadata?: InputMaybe<StringFilter>;
  not?: InputMaybe<OffChainReceiptFilter>;
  or?: InputMaybe<Array<OffChainReceiptFilter>>;
  signer?: InputMaybe<AccountFilter>;
  signerId?: InputMaybe<StringFilter>;
  uid?: InputMaybe<IntFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum OffChainReceiptsOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LegIdAsc = 'LEG_ID_ASC',
  LegIdDesc = 'LEG_ID_DESC',
  MetadataAsc = 'METADATA_ASC',
  MetadataDesc = 'METADATA_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
  UidAsc = 'UID_ASC',
  UidDesc = 'UID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type PageInfo = {
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};
export enum PolyxEntriesOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AmountAbsAsc = 'AMOUNT_ABS_ASC',
  AmountAbsDesc = 'AMOUNT_ABS_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  CounterpartyAddressAsc = 'COUNTERPARTY_ADDRESS_ASC',
  CounterpartyAddressDesc = 'COUNTERPARTY_ADDRESS_DESC',
  CounterpartyIdentityIdAsc = 'COUNTERPARTY_IDENTITY_ID_ASC',
  CounterpartyIdentityIdDesc = 'COUNTERPARTY_IDENTITY_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DateAsc = 'DATE_ASC',
  DateDesc = 'DATE_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  EraIndexAsc = 'ERA_INDEX_ASC',
  EraIndexDesc = 'ERA_INDEX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  FreeAfterAsc = 'FREE_AFTER_ASC',
  FreeAfterDesc = 'FREE_AFTER_DESC',
  FrozenAfterAsc = 'FROZEN_AFTER_ASC',
  FrozenAfterDesc = 'FROZEN_AFTER_DESC',
  HoldReasonAsc = 'HOLD_REASON_ASC',
  HoldReasonDesc = 'HOLD_REASON_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KindAsc = 'KIND_ASC',
  KindDesc = 'KIND_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  MovementIdAsc = 'MOVEMENT_ID_ASC',
  MovementIdDesc = 'MOVEMENT_ID_DESC',
  Natural = 'NATURAL',
  PoolAsc = 'POOL_ASC',
  PoolDesc = 'POOL_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReservedAfterAsc = 'RESERVED_AFTER_ASC',
  ReservedAfterDesc = 'RESERVED_AFTER_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type PolyxEntry = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  amount: Scalars['BigFloat']['output'];
  amountAbs: Scalars['BigFloat']['output'];
  blockId: Scalars['String']['output'];
  callId?: Maybe<CallIdEnum>;
  counterpartyAddress?: Maybe<Scalars['String']['output']>;
  counterpartyIdentity?: Maybe<Identity>;
  counterpartyIdentityId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  date: Scalars['Datetime']['output'];
  direction: EntryDirection;
  eraIndex?: Maybe<Scalars['Int']['output']>;
  eventId: EventIdEnum;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  freeAfter: Scalars['BigFloat']['output'];
  frozenAfter: Scalars['BigFloat']['output'];
  holdReason?: Maybe<HoldReason>;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  kind: MovementKind;
  memo?: Maybe<Scalars['String']['output']>;
  moduleId?: Maybe<ModuleIdEnum>;
  movementId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  pool: PolyxPool;
  reservedAfter: Scalars['BigFloat']['output'];
  specVersionId: Scalars['Int']['output'];
};
export type PolyxEntryFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  amountAbs?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<PolyxEntryFilter>>;
  blockId?: InputMaybe<StringFilter>;
  callId?: InputMaybe<CallIdEnumFilter>;
  counterpartyAddress?: InputMaybe<StringFilter>;
  counterpartyIdentity?: InputMaybe<IdentityFilter>;
  counterpartyIdentityExists?: InputMaybe<Scalars['Boolean']['input']>;
  counterpartyIdentityId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  date?: InputMaybe<DatetimeFilter>;
  direction?: InputMaybe<EntryDirectionFilter>;
  eraIndex?: InputMaybe<IntFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  freeAfter?: InputMaybe<BigFloatFilter>;
  frozenAfter?: InputMaybe<BigFloatFilter>;
  holdReason?: InputMaybe<HoldReasonFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  kind?: InputMaybe<MovementKindFilter>;
  memo?: InputMaybe<StringFilter>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  movementId?: InputMaybe<StringFilter>;
  not?: InputMaybe<PolyxEntryFilter>;
  or?: InputMaybe<Array<PolyxEntryFilter>>;
  pool?: InputMaybe<PolyxPoolFilter>;
  reservedAfter?: InputMaybe<BigFloatFilter>;
  specVersionId?: InputMaybe<IntFilter>;
};
export enum PolyxPool {
  Free = 'Free',
  Reserved = 'Reserved',
}
export type PolyxPoolFilter = {
  distinctFrom?: InputMaybe<PolyxPool>;
  equalTo?: InputMaybe<PolyxPool>;
  greaterThan?: InputMaybe<PolyxPool>;
  greaterThanOrEqualTo?: InputMaybe<PolyxPool>;
  in?: InputMaybe<Array<PolyxPool>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<PolyxPool>;
  lessThanOrEqualTo?: InputMaybe<PolyxPool>;
  notDistinctFrom?: InputMaybe<PolyxPool>;
  notEqualTo?: InputMaybe<PolyxPool>;
  notIn?: InputMaybe<Array<PolyxPool>>;
};
export type Portfolio = Node & {
  accountsByAssetTransactionFromPortfolioIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionFromPortfolioIdAndToAccountId: Connection<Account>;
  accountsByAssetTransactionToPortfolioIdAndFromAccountId: Connection<Account>;
  accountsByAssetTransactionToPortfolioIdAndToAccountId: Connection<Account>;
  accountsByHoldingPortfolioIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationPortfolioIdAndAccountId: Connection<Account>;
  accountsByInstructionAffirmationPortfolioIdAndSignerId: Connection<Account>;
  accountsByInstructionEventPortfolioIdAndAccountId: Connection<Account>;
  accountsByInstructionEventPortfolioIdAndSignerId: Connection<Account>;
  accountsByLegFromPortfolioIdAndFromAccountId: Connection<Account>;
  accountsByLegFromPortfolioIdAndToAccountId: Connection<Account>;
  accountsByLegToPortfolioIdAndFromAccountId: Connection<Account>;
  accountsByLegToPortfolioIdAndToAccountId: Connection<Account>;
  assetHoldersByHoldingPortfolioIdAndAssetHolderId: Connection<AssetHolder>;
  assetsByAssetTransactionFromPortfolioIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionToPortfolioIdAndAssetId: Connection<Asset>;
  assetsByDistributionPortfolioIdAndAssetId: Connection<Asset>;
  assetsByDistributionPortfolioIdAndCurrencyId: Connection<Asset>;
  assetsByHoldingPortfolioIdAndAssetId: Connection<Asset>;
  assetsByLegFromPortfolioIdAndAssetId: Connection<Asset>;
  assetsByLegToPortfolioIdAndAssetId: Connection<Asset>;
  assetsByStoOfferingPortfolioIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoOfferingPortfolioIdAndRaisingAssetId: Connection<Asset>;
  assetsByStoRaisingPortfolioIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoRaisingPortfolioIdAndRaisingAssetId: Connection<Asset>;
  corporateActionsByDistributionPortfolioIdAndCorporateActionId: Connection<CorporateAction>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  custodian?: Maybe<Identity>;
  custodianId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['Datetime']['output']>;
  distributions: Connection<Distribution>;
  eventsByAssetTransactionFromPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionToPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByHoldingPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByHoldingPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionAffirmationPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionAffirmationPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByInstructionEventPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByLegFromPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByLegFromPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByLegToPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByLegToPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByStoOfferingPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByStoOfferingPortfolioIdAndUpdatedEventId: Connection<Event>;
  eventsByStoRaisingPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByStoRaisingPortfolioIdAndUpdatedEventId: Connection<Event>;
  holdings: Connection<Holding>;
  id: Scalars['String']['output'];
  identitiesByAssetTransactionFromPortfolioIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionFromPortfolioIdAndToIdentityId: Connection<Identity>;
  identitiesByAssetTransactionToPortfolioIdAndFromIdentityId: Connection<Identity>;
  identitiesByAssetTransactionToPortfolioIdAndToIdentityId: Connection<Identity>;
  identitiesByDistributionPortfolioIdAndIdentityId: Connection<Identity>;
  identitiesByHoldingPortfolioIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionAffirmationPortfolioIdAndAffirmedById: Connection<Identity>;
  identitiesByInstructionAffirmationPortfolioIdAndIdentityId: Connection<Identity>;
  identitiesByInstructionEventPortfolioIdAndIdentityId: Connection<Identity>;
  identitiesByLegFromPortfolioIdAndFromId: Connection<Identity>;
  identitiesByLegFromPortfolioIdAndToId: Connection<Identity>;
  identitiesByLegToPortfolioIdAndFromId: Connection<Identity>;
  identitiesByLegToPortfolioIdAndToId: Connection<Identity>;
  identitiesByStoOfferingPortfolioIdAndCreatorId: Connection<Identity>;
  identitiesByStoRaisingPortfolioIdAndCreatorId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  instructionAffirmations: Connection<InstructionAffirmation>;
  instructionEvents: Connection<InstructionEvent>;
  instructionPartiesByInstructionAffirmationPortfolioIdAndPartyId: Connection<InstructionParty>;
  instructionsByAssetTransactionFromPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByAssetTransactionToPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByLegFromPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByLegToPortfolioIdAndInstructionId: Connection<Instruction>;
  legsIn: Connection<Leg>;
  legsOut: Connection<Leg>;
  name?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  offChainReceiptsByInstructionAffirmationPortfolioIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventPortfolioIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  portfoliosByAssetTransactionFromPortfolioIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToPortfolioIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByLegFromPortfolioIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByLegToPortfolioIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByStoOfferingPortfolioIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByStoRaisingPortfolioIdAndOfferingPortfolioId: Connection<Portfolio>;
  stosByOfferingPortfolioId: Connection<Sto>;
  stosByRaisingPortfolioId: Connection<Sto>;
  transfersIn: Connection<AssetTransaction>;
  transfersOut: Connection<AssetTransaction>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  venuesByStoOfferingPortfolioIdAndVenueId: Connection<Venue>;
  venuesByStoRaisingPortfolioIdAndVenueId: Connection<Venue>;
};
export type PortfolioFilter = {
  and?: InputMaybe<Array<PortfolioFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  custodian?: InputMaybe<IdentityFilter>;
  custodianExists?: InputMaybe<Scalars['Boolean']['input']>;
  custodianId?: InputMaybe<StringFilter>;
  deletedAt?: InputMaybe<DatetimeFilter>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  holdings?: InputMaybe<OneToManyFilter<HoldingFilter>>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  instructionAffirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionEvents?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  legsIn?: InputMaybe<OneToManyFilter<LegFilter>>;
  legsOut?: InputMaybe<OneToManyFilter<LegFilter>>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<PortfolioFilter>;
  number?: InputMaybe<IntFilter>;
  or?: InputMaybe<Array<PortfolioFilter>>;
  stosByOfferingPortfolioId?: InputMaybe<OneToManyFilter<StoFilter>>;
  stosByRaisingPortfolioId?: InputMaybe<OneToManyFilter<StoFilter>>;
  transfersIn?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  transfersOut?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum PortfoliosOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CustodianIdAsc = 'CUSTODIAN_ID_ASC',
  CustodianIdDesc = 'CUSTODIAN_ID_DESC',
  DeletedAtAsc = 'DELETED_AT_ASC',
  DeletedAtDesc = 'DELETED_AT_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  NumberAsc = 'NUMBER_ASC',
  NumberDesc = 'NUMBER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Proposal = Node & {
  accountsByProposalVoteProposalIdAndAccountId: Connection<Account>;
  balance: Scalars['BigFloat']['output'];
  closedEvent?: Maybe<Event>;
  closedEventId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eventsByProposalVoteProposalIdAndCreatedEventId: Connection<Event>;
  eventsByProposalVoteProposalIdAndUpdatedEventId: Connection<Event>;
  executionScheduledAt?: Maybe<Scalars['Int']['output']>;
  expiresAt?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Identity>;
  ownerId?: Maybe<Scalars['String']['output']>;
  proposer: Scalars['JSON']['output'];
  skippedCount?: Maybe<Scalars['Int']['output']>;
  snapshotId?: Maybe<Scalars['Int']['output']>;
  snapshotted: Scalars['Boolean']['output'];
  state: ProposalStateEnum;
  totalAyeWeight: Scalars['BigFloat']['output'];
  totalNayWeight: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
  votes: Connection<ProposalVote>;
};
export type ProposalFilter = {
  and?: InputMaybe<Array<ProposalFilter>>;
  balance?: InputMaybe<BigFloatFilter>;
  closedEvent?: InputMaybe<EventFilter>;
  closedEventExists?: InputMaybe<Scalars['Boolean']['input']>;
  closedEventId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  description?: InputMaybe<StringFilter>;
  executionScheduledAt?: InputMaybe<IntFilter>;
  expiresAt?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ProposalFilter>;
  or?: InputMaybe<Array<ProposalFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerExists?: InputMaybe<Scalars['Boolean']['input']>;
  ownerId?: InputMaybe<StringFilter>;
  proposer?: InputMaybe<JsonFilter>;
  skippedCount?: InputMaybe<IntFilter>;
  snapshotId?: InputMaybe<IntFilter>;
  snapshotted?: InputMaybe<BooleanFilter>;
  state?: InputMaybe<ProposalStateEnumFilter>;
  totalAyeWeight?: InputMaybe<BigFloatFilter>;
  totalNayWeight?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  url?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
};
export enum ProposalStateEnum {
  All = 'All',
  Executed = 'Executed',
  Expired = 'Expired',
  Failed = 'Failed',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Scheduled = 'Scheduled',
}
export type ProposalStateEnumFilter = {
  distinctFrom?: InputMaybe<ProposalStateEnum>;
  equalTo?: InputMaybe<ProposalStateEnum>;
  greaterThan?: InputMaybe<ProposalStateEnum>;
  greaterThanOrEqualTo?: InputMaybe<ProposalStateEnum>;
  in?: InputMaybe<Array<ProposalStateEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ProposalStateEnum>;
  lessThanOrEqualTo?: InputMaybe<ProposalStateEnum>;
  notDistinctFrom?: InputMaybe<ProposalStateEnum>;
  notEqualTo?: InputMaybe<ProposalStateEnum>;
  notIn?: InputMaybe<Array<ProposalStateEnum>>;
};
export type ProposalVote = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  proposal?: Maybe<Proposal>;
  proposalId: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  vote: Scalars['Boolean']['output'];
  weight: Scalars['BigFloat']['output'];
};
export type ProposalVoteFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ProposalVoteFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ProposalVoteFilter>;
  or?: InputMaybe<Array<ProposalVoteFilter>>;
  proposal?: InputMaybe<ProposalFilter>;
  proposalId?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  vote?: InputMaybe<BooleanFilter>;
  weight?: InputMaybe<BigFloatFilter>;
};
export enum ProposalVotesOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  VoteAsc = 'VOTE_ASC',
  VoteDesc = 'VOTE_DESC',
  WeightAsc = 'WEIGHT_ASC',
  WeightDesc = 'WEIGHT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ProposalsOrderBy {
  BalanceAsc = 'BALANCE_ASC',
  BalanceDesc = 'BALANCE_DESC',
  ClosedEventIdAsc = 'CLOSED_EVENT_ID_ASC',
  ClosedEventIdDesc = 'CLOSED_EVENT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  ExecutionScheduledAtAsc = 'EXECUTION_SCHEDULED_AT_ASC',
  ExecutionScheduledAtDesc = 'EXECUTION_SCHEDULED_AT_DESC',
  ExpiresAtAsc = 'EXPIRES_AT_ASC',
  ExpiresAtDesc = 'EXPIRES_AT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposerAsc = 'PROPOSER_ASC',
  ProposerDesc = 'PROPOSER_DESC',
  SnapshottedAsc = 'SNAPSHOTTED_ASC',
  SnapshottedDesc = 'SNAPSHOTTED_DESC',
  SnapshotIdAsc = 'SNAPSHOT_ID_ASC',
  SnapshotIdDesc = 'SNAPSHOT_ID_DESC',
  StateAsc = 'STATE_ASC',
  StateDesc = 'STATE_DESC',
  TotalAyeWeightAsc = 'TOTAL_AYE_WEIGHT_ASC',
  TotalAyeWeightDesc = 'TOTAL_AYE_WEIGHT_DESC',
  TotalNayWeightAsc = 'TOTAL_NAY_WEIGHT_ASC',
  TotalNayWeightDesc = 'TOTAL_NAY_WEIGHT_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  UrlAsc = 'URL_ASC',
  UrlDesc = 'URL_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Query = Node & {
  _metadata?: Maybe<_Metadata>;
  _metadatas?: Maybe<_Metadatas>;
  account?: Maybe<Account>;
  accountBalance?: Maybe<AccountBalance>;
  accountBalanceByNodeId?: Maybe<AccountBalance>;
  accountBalances?: Maybe<Connection<AccountBalance>>;
  accountByNodeId?: Maybe<Account>;
  accounts?: Maybe<Connection<Account>>;
  agentGroup?: Maybe<AgentGroup>;
  agentGroupByNodeId?: Maybe<AgentGroup>;
  agentGroupMembership?: Maybe<AgentGroupMembership>;
  agentGroupMembershipByNodeId?: Maybe<AgentGroupMembership>;
  agentGroupMemberships?: Maybe<Connection<AgentGroupMembership>>;
  agentGroups?: Maybe<Connection<AgentGroup>>;
  asset?: Maybe<Asset>;
  assetAgent?: Maybe<AssetAgent>;
  assetAgentAction?: Maybe<AssetAgentAction>;
  assetAgentActionByNodeId?: Maybe<AssetAgentAction>;
  assetAgentActions?: Maybe<Connection<AssetAgentAction>>;
  assetAgentByNodeId?: Maybe<AssetAgent>;
  assetAgentHistories?: Maybe<Connection<AssetAgentHistory>>;
  assetAgentHistory?: Maybe<AssetAgentHistory>;
  assetAgentHistoryByNodeId?: Maybe<AssetAgentHistory>;
  assetAgents?: Maybe<Connection<AssetAgent>>;
  assetAllowance?: Maybe<AssetAllowance>;
  assetAllowanceByNodeId?: Maybe<AssetAllowance>;
  assetAllowances?: Maybe<Connection<AssetAllowance>>;
  assetByNodeId?: Maybe<Asset>;
  assetDocument?: Maybe<AssetDocument>;
  assetDocumentByNodeId?: Maybe<AssetDocument>;
  assetDocuments?: Maybe<Connection<AssetDocument>>;
  assetHolder?: Maybe<AssetHolder>;
  assetHolderByNodeId?: Maybe<AssetHolder>;
  assetHolders?: Maybe<Connection<AssetHolder>>;
  assetMandatoryMediator?: Maybe<AssetMandatoryMediator>;
  assetMandatoryMediatorByNodeId?: Maybe<AssetMandatoryMediator>;
  assetMandatoryMediators?: Maybe<Connection<AssetMandatoryMediator>>;
  assetMetadata?: Maybe<Connection<AssetMetadatum>>;
  assetMetadatum?: Maybe<AssetMetadatum>;
  assetMetadatumByNodeId?: Maybe<AssetMetadatum>;
  assetPreApproval?: Maybe<AssetPreApproval>;
  assetPreApprovalByNodeId?: Maybe<AssetPreApproval>;
  assetPreApprovals?: Maybe<Connection<AssetPreApproval>>;
  assetTransaction?: Maybe<AssetTransaction>;
  assetTransactionByNodeId?: Maybe<AssetTransaction>;
  assetTransactions?: Maybe<Connection<AssetTransaction>>;
  assets?: Maybe<Connection<Asset>>;
  authorization?: Maybe<Authorization>;
  authorizationByNodeId?: Maybe<Authorization>;
  authorizations?: Maybe<Connection<Authorization>>;
  block?: Maybe<Block>;
  blockByNodeId?: Maybe<Block>;
  blocks?: Maybe<Connection<Block>>;
  bridgeEvent?: Maybe<BridgeEvent>;
  bridgeEventByNodeId?: Maybe<BridgeEvent>;
  bridgeEvents?: Maybe<Connection<BridgeEvent>>;
  chainUpgrade?: Maybe<ChainUpgrade>;
  chainUpgradeByNodeId?: Maybe<ChainUpgrade>;
  chainUpgrades?: Maybe<Connection<ChainUpgrade>>;
  checkpoint?: Maybe<Checkpoint>;
  checkpointByNodeId?: Maybe<Checkpoint>;
  checkpointSchedule?: Maybe<CheckpointSchedule>;
  checkpointScheduleByNodeId?: Maybe<CheckpointSchedule>;
  checkpointSchedules?: Maybe<Connection<CheckpointSchedule>>;
  checkpoints?: Maybe<Connection<Checkpoint>>;
  claim?: Maybe<Claim>;
  claimByNodeId?: Maybe<Claim>;
  claims?: Maybe<ClaimsConnection>;
  compliance?: Maybe<Compliance>;
  complianceByNodeId?: Maybe<Compliance>;
  compliances?: Maybe<Connection<Compliance>>;
  confidentialAccount?: Maybe<ConfidentialAccount>;
  confidentialAccountAsset?: Maybe<ConfidentialAccountAsset>;
  confidentialAccountAssetByNodeId?: Maybe<ConfidentialAccountAsset>;
  confidentialAccountAssets?: Maybe<Connection<ConfidentialAccountAsset>>;
  confidentialAccountByNodeId?: Maybe<ConfidentialAccount>;
  confidentialAccounts?: Maybe<Connection<ConfidentialAccount>>;
  confidentialAsset?: Maybe<ConfidentialAsset>;
  confidentialAssetByNodeId?: Maybe<ConfidentialAsset>;
  confidentialAssetKey?: Maybe<ConfidentialAssetKey>;
  confidentialAssetKeyByNodeId?: Maybe<ConfidentialAssetKey>;
  confidentialAssetKeys?: Maybe<Connection<ConfidentialAssetKey>>;
  confidentialAssets?: Maybe<Connection<ConfidentialAsset>>;
  confidentialCurveTreeLeaf?: Maybe<ConfidentialCurveTreeLeaf>;
  confidentialCurveTreeLeafByNodeId?: Maybe<ConfidentialCurveTreeLeaf>;
  confidentialCurveTreeLeaves?: Maybe<Connection<ConfidentialCurveTreeLeaf>>;
  confidentialEncryptionKey?: Maybe<ConfidentialEncryptionKey>;
  confidentialEncryptionKeyByNodeId?: Maybe<ConfidentialEncryptionKey>;
  confidentialEncryptionKeys?: Maybe<Connection<ConfidentialEncryptionKey>>;
  confidentialLeg?: Maybe<ConfidentialLeg>;
  confidentialLegAffirmation?: Maybe<ConfidentialLegAffirmation>;
  confidentialLegAffirmationByNodeId?: Maybe<ConfidentialLegAffirmation>;
  confidentialLegAffirmations?: Maybe<Connection<ConfidentialLegAffirmation>>;
  confidentialLegByNodeId?: Maybe<ConfidentialLeg>;
  confidentialLegs?: Maybe<Connection<ConfidentialLeg>>;
  confidentialSettlement?: Maybe<ConfidentialSettlement>;
  confidentialSettlementByNodeId?: Maybe<ConfidentialSettlement>;
  confidentialSettlements?: Maybe<Connection<ConfidentialSettlement>>;
  corporateAction?: Maybe<CorporateAction>;
  corporateActionByNodeId?: Maybe<CorporateAction>;
  corporateActionDefaultConfig?: Maybe<CorporateActionDefaultConfig>;
  corporateActionDefaultConfigByNodeId?: Maybe<CorporateActionDefaultConfig>;
  corporateActionDefaultConfigs?: Maybe<Connection<CorporateActionDefaultConfig>>;
  corporateActions?: Maybe<Connection<CorporateAction>>;
  corporateBallot?: Maybe<CorporateBallot>;
  corporateBallotByNodeId?: Maybe<CorporateBallot>;
  corporateBallotVote?: Maybe<CorporateBallotVote>;
  corporateBallotVoteByNodeId?: Maybe<CorporateBallotVote>;
  corporateBallotVotes?: Maybe<Connection<CorporateBallotVote>>;
  corporateBallots?: Maybe<Connection<CorporateBallot>>;
  customAssetType?: Maybe<CustomAssetType>;
  customAssetTypeByNodeId?: Maybe<CustomAssetType>;
  customAssetTypes?: Maybe<Connection<CustomAssetType>>;
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeByNodeId?: Maybe<CustomClaimType>;
  customClaimTypes?: Maybe<Connection<CustomClaimType>>;
  distribution?: Maybe<Distribution>;
  distributionByNodeId?: Maybe<Distribution>;
  distributionPayment?: Maybe<DistributionPayment>;
  distributionPaymentByNodeId?: Maybe<DistributionPayment>;
  distributionPayments?: Maybe<Connection<DistributionPayment>>;
  distributions?: Maybe<Connection<Distribution>>;
  era?: Maybe<Era>;
  eraByNodeId?: Maybe<Era>;
  eras?: Maybe<Connection<Era>>;
  event?: Maybe<Event>;
  eventByNodeId?: Maybe<Event>;
  events?: Maybe<Connection<Event>>;
  evmAccountMapping?: Maybe<EvmAccountMapping>;
  evmAccountMappingByNodeId?: Maybe<EvmAccountMapping>;
  evmAccountMappings?: Maybe<Connection<EvmAccountMapping>>;
  evmTransaction?: Maybe<EvmTransaction>;
  evmTransactionByNodeId?: Maybe<EvmTransaction>;
  evmTransactions?: Maybe<Connection<EvmTransaction>>;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicByNodeId?: Maybe<Extrinsic>;
  extrinsics?: Maybe<Connection<Extrinsic>>;
  funding?: Maybe<Funding>;
  fundingByNodeId?: Maybe<Funding>;
  fundings?: Maybe<Connection<Funding>>;
  globalMetadataKey?: Maybe<GlobalMetadataKey>;
  globalMetadataKeyByNodeId?: Maybe<GlobalMetadataKey>;
  globalMetadataKeys?: Maybe<Connection<GlobalMetadataKey>>;
  holding?: Maybe<Holding>;
  holdingByNodeId?: Maybe<Holding>;
  holdings?: Maybe<Connection<Holding>>;
  identities?: Maybe<Connection<Identity>>;
  identity?: Maybe<Identity>;
  identityByNodeId?: Maybe<Identity>;
  identityKey?: Maybe<IdentityKey>;
  identityKeyByNodeId?: Maybe<IdentityKey>;
  identityKeys?: Maybe<Connection<IdentityKey>>;
  indexOrigin?: Maybe<IndexOrigin>;
  indexOriginByNodeId?: Maybe<IndexOrigin>;
  indexOrigins?: Maybe<Connection<IndexOrigin>>;
  indexerAnomalies?: Maybe<Connection<IndexerAnomaly>>;
  indexerAnomaly?: Maybe<IndexerAnomaly>;
  indexerAnomalyByNodeId?: Maybe<IndexerAnomaly>;
  instruction?: Maybe<Instruction>;
  instructionAffirmation?: Maybe<InstructionAffirmation>;
  instructionAffirmationByNodeId?: Maybe<InstructionAffirmation>;
  instructionAffirmations?: Maybe<Connection<InstructionAffirmation>>;
  instructionByNodeId?: Maybe<Instruction>;
  instructionEvent?: Maybe<InstructionEvent>;
  instructionEventByNodeId?: Maybe<InstructionEvent>;
  instructionEvents?: Maybe<Connection<InstructionEvent>>;
  instructionParties?: Maybe<Connection<InstructionParty>>;
  instructionParty?: Maybe<InstructionParty>;
  instructionPartyByNodeId?: Maybe<InstructionParty>;
  instructions?: Maybe<Connection<Instruction>>;
  investment?: Maybe<Investment>;
  investmentByNodeId?: Maybe<Investment>;
  investments?: Maybe<Connection<Investment>>;
  leg?: Maybe<Leg>;
  legByNodeId?: Maybe<Leg>;
  legs?: Maybe<Connection<Leg>>;
  migration?: Maybe<Migration>;
  migrationByNodeId?: Maybe<Migration>;
  migrations?: Maybe<Connection<Migration>>;
  multiSig?: Maybe<MultiSig>;
  multiSigAdmin?: Maybe<MultiSigAdmin>;
  multiSigAdminByNodeId?: Maybe<MultiSigAdmin>;
  multiSigAdmins?: Maybe<Connection<MultiSigAdmin>>;
  multiSigByNodeId?: Maybe<MultiSig>;
  multiSigProposal?: Maybe<MultiSigProposal>;
  multiSigProposalByNodeId?: Maybe<MultiSigProposal>;
  multiSigProposalVote?: Maybe<MultiSigProposalVote>;
  multiSigProposalVoteByNodeId?: Maybe<MultiSigProposalVote>;
  multiSigProposalVotes?: Maybe<Connection<MultiSigProposalVote>>;
  multiSigProposals?: Maybe<Connection<MultiSigProposal>>;
  multiSigSigner?: Maybe<MultiSigSigner>;
  multiSigSignerByNodeId?: Maybe<MultiSigSigner>;
  multiSigSigners?: Maybe<Connection<MultiSigSigner>>;
  multiSigs?: Maybe<Connection<MultiSig>>;
  nft?: Maybe<Nft>;
  nftApproval?: Maybe<NftApproval>;
  nftApprovalByNodeId?: Maybe<NftApproval>;
  nftApprovals?: Maybe<Connection<NftApproval>>;
  nftByNodeId?: Maybe<Nft>;
  nftOperatorApproval?: Maybe<NftOperatorApproval>;
  nftOperatorApprovalByNodeId?: Maybe<NftOperatorApproval>;
  nftOperatorApprovals?: Maybe<Connection<NftOperatorApproval>>;
  nfts?: Maybe<Connection<Nft>>;
  node?: Maybe<
    | Account
    | AccountBalance
    | AgentGroup
    | AgentGroupMembership
    | Asset
    | AssetAgent
    | AssetAgentAction
    | AssetAgentHistory
    | AssetAllowance
    | AssetDocument
    | AssetHolder
    | AssetMandatoryMediator
    | AssetMetadatum
    | AssetPreApproval
    | AssetTransaction
    | Authorization
    | Block
    | BridgeEvent
    | ChainUpgrade
    | Checkpoint
    | CheckpointSchedule
    | Claim
    | Compliance
    | ConfidentialAccount
    | ConfidentialAccountAsset
    | ConfidentialAsset
    | ConfidentialAssetKey
    | ConfidentialCurveTreeLeaf
    | ConfidentialEncryptionKey
    | ConfidentialLeg
    | ConfidentialLegAffirmation
    | ConfidentialSettlement
    | CorporateAction
    | CorporateActionDefaultConfig
    | CorporateBallot
    | CorporateBallotVote
    | CustomAssetType
    | CustomClaimType
    | Distribution
    | DistributionPayment
    | Era
    | Event
    | EvmAccountMapping
    | EvmTransaction
    | Extrinsic
    | Funding
    | GlobalMetadataKey
    | Holding
    | Identity
    | IdentityKey
    | IndexOrigin
    | IndexerAnomaly
    | Instruction
    | InstructionAffirmation
    | InstructionEvent
    | InstructionParty
    | Investment
    | Leg
    | Migration
    | MultiSig
    | MultiSigAdmin
    | MultiSigProposal
    | MultiSigProposalVote
    | MultiSigSigner
    | Nft
    | NftApproval
    | NftOperatorApproval
    | OffChainReceipt
    | PolyxEntry
    | Portfolio
    | Proposal
    | ProposalVote
    | Query
    | Slash
    | StakingEvent
    | StakingPosition
    | StatType
    | Sto
    | SubqueryVersion
    | Subsidy
    | TickerReservation
    | TransferCompliance
    | TransferComplianceExemption
    | TrustedClaimIssuer
    | Validator
    | ValidatorEra
    | Venue
  >;
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptByNodeId?: Maybe<OffChainReceipt>;
  offChainReceipts?: Maybe<Connection<OffChainReceipt>>;
  polyxEntries?: Maybe<Connection<PolyxEntry>>;
  polyxEntry?: Maybe<PolyxEntry>;
  polyxEntryByNodeId?: Maybe<PolyxEntry>;
  portfolio?: Maybe<Portfolio>;
  portfolioByNodeId?: Maybe<Portfolio>;
  portfolios?: Maybe<Connection<Portfolio>>;
  proposal?: Maybe<Proposal>;
  proposalByNodeId?: Maybe<Proposal>;
  proposalVote?: Maybe<ProposalVote>;
  proposalVoteByNodeId?: Maybe<ProposalVote>;
  proposalVotes?: Maybe<Connection<ProposalVote>>;
  proposals?: Maybe<Connection<Proposal>>;
  query: Query;
  slash?: Maybe<Slash>;
  slashByNodeId?: Maybe<Slash>;
  slashes?: Maybe<Connection<Slash>>;
  stakingEvent?: Maybe<StakingEvent>;
  stakingEventByNodeId?: Maybe<StakingEvent>;
  stakingEvents?: Maybe<Connection<StakingEvent>>;
  stakingPosition?: Maybe<StakingPosition>;
  stakingPositionByNodeId?: Maybe<StakingPosition>;
  stakingPositions?: Maybe<Connection<StakingPosition>>;
  statType?: Maybe<StatType>;
  statTypeByNodeId?: Maybe<StatType>;
  statTypes?: Maybe<Connection<StatType>>;
  sto?: Maybe<Sto>;
  stoByNodeId?: Maybe<Sto>;
  stos?: Maybe<Connection<Sto>>;
  subqueryVersion?: Maybe<SubqueryVersion>;
  subqueryVersionByNodeId?: Maybe<SubqueryVersion>;
  subqueryVersions?: Maybe<Connection<SubqueryVersion>>;
  subsidies?: Maybe<Connection<Subsidy>>;
  subsidy?: Maybe<Subsidy>;
  subsidyByNodeId?: Maybe<Subsidy>;
  tickerReservation?: Maybe<TickerReservation>;
  tickerReservationByNodeId?: Maybe<TickerReservation>;
  tickerReservations?: Maybe<Connection<TickerReservation>>;
  transferCompliance?: Maybe<TransferCompliance>;
  transferComplianceByNodeId?: Maybe<TransferCompliance>;
  transferComplianceExemption?: Maybe<TransferComplianceExemption>;
  transferComplianceExemptionByNodeId?: Maybe<TransferComplianceExemption>;
  transferComplianceExemptions?: Maybe<Connection<TransferComplianceExemption>>;
  transferCompliances?: Maybe<Connection<TransferCompliance>>;
  trustedClaimIssuer?: Maybe<TrustedClaimIssuer>;
  trustedClaimIssuerByNodeId?: Maybe<TrustedClaimIssuer>;
  trustedClaimIssuers?: Maybe<Connection<TrustedClaimIssuer>>;
  validator?: Maybe<Validator>;
  validatorByNodeId?: Maybe<Validator>;
  validatorEra?: Maybe<ValidatorEra>;
  validatorEraByNodeId?: Maybe<ValidatorEra>;
  validatorEras?: Maybe<Connection<ValidatorEra>>;
  validators?: Maybe<Connection<Validator>>;
  venue?: Maybe<Venue>;
  venueByNodeId?: Maybe<Venue>;
  venues?: Maybe<Connection<Venue>>;
};
export enum RaisingAssetTypeEnum {
  OffChain = 'OffChain',
  OnChain = 'OnChain',
}
export type RaisingAssetTypeEnumFilter = {
  distinctFrom?: InputMaybe<RaisingAssetTypeEnum>;
  equalTo?: InputMaybe<RaisingAssetTypeEnum>;
  greaterThan?: InputMaybe<RaisingAssetTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  in?: InputMaybe<Array<RaisingAssetTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<RaisingAssetTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  notDistinctFrom?: InputMaybe<RaisingAssetTypeEnum>;
  notEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  notIn?: InputMaybe<Array<RaisingAssetTypeEnum>>;
};
export enum SignerTypeEnum {
  Account = 'Account',
  Identity = 'Identity',
}
export type SignerTypeEnumFilter = {
  distinctFrom?: InputMaybe<SignerTypeEnum>;
  equalTo?: InputMaybe<SignerTypeEnum>;
  greaterThan?: InputMaybe<SignerTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<SignerTypeEnum>;
  in?: InputMaybe<Array<SignerTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<SignerTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<SignerTypeEnum>;
  notDistinctFrom?: InputMaybe<SignerTypeEnum>;
  notEqualTo?: InputMaybe<SignerTypeEnum>;
  notIn?: InputMaybe<Array<SignerTypeEnum>>;
};
export type Slash = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  amount: Scalars['BigFloat']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eraIndex?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offenceEraIndex?: Maybe<Scalars['Int']['output']>;
  validator?: Maybe<Validator>;
  validatorId?: Maybe<Scalars['String']['output']>;
};
export type SlashFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<SlashFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eraIndex?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<SlashFilter>;
  offenceEraIndex?: InputMaybe<IntFilter>;
  or?: InputMaybe<Array<SlashFilter>>;
  validator?: InputMaybe<ValidatorFilter>;
  validatorExists?: InputMaybe<Scalars['Boolean']['input']>;
  validatorId?: InputMaybe<StringFilter>;
};
export enum SlashesOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EraIndexAsc = 'ERA_INDEX_ASC',
  EraIndexDesc = 'ERA_INDEX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OffenceEraIndexAsc = 'OFFENCE_ERA_INDEX_ASC',
  OffenceEraIndexDesc = 'OFFENCE_ERA_INDEX_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ValidatorIdAsc = 'VALIDATOR_ID_ASC',
  ValidatorIdDesc = 'VALIDATOR_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type StakingEvent = Node & {
  amount?: Maybe<Scalars['BigFloat']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eraIndex?: Maybe<Scalars['Int']['output']>;
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  nominatedValidators?: Maybe<Scalars['JSON']['output']>;
  position?: Maybe<StakingPosition>;
  positionId?: Maybe<Scalars['String']['output']>;
  rewardDestination?: Maybe<Scalars['String']['output']>;
  rewardDestinationAccount?: Maybe<Account>;
  rewardDestinationAccountId?: Maybe<Scalars['String']['output']>;
  stash?: Maybe<Account>;
  stashId?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  validator?: Maybe<Validator>;
  validatorId?: Maybe<Scalars['String']['output']>;
};
export type StakingEventFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<StakingEventFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eraIndex?: InputMaybe<IntFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  nominatedValidators?: InputMaybe<JsonFilter>;
  not?: InputMaybe<StakingEventFilter>;
  or?: InputMaybe<Array<StakingEventFilter>>;
  position?: InputMaybe<StakingPositionFilter>;
  positionExists?: InputMaybe<Scalars['Boolean']['input']>;
  positionId?: InputMaybe<StringFilter>;
  rewardDestination?: InputMaybe<StringFilter>;
  rewardDestinationAccount?: InputMaybe<AccountFilter>;
  rewardDestinationAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  rewardDestinationAccountId?: InputMaybe<StringFilter>;
  stash?: InputMaybe<AccountFilter>;
  stashExists?: InputMaybe<Scalars['Boolean']['input']>;
  stashId?: InputMaybe<StringFilter>;
  transactionId?: InputMaybe<StringFilter>;
  validator?: InputMaybe<ValidatorFilter>;
  validatorExists?: InputMaybe<Scalars['Boolean']['input']>;
  validatorId?: InputMaybe<StringFilter>;
};
export enum StakingEventsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EraIndexAsc = 'ERA_INDEX_ASC',
  EraIndexDesc = 'ERA_INDEX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NominatedValidatorsAsc = 'NOMINATED_VALIDATORS_ASC',
  NominatedValidatorsDesc = 'NOMINATED_VALIDATORS_DESC',
  PositionIdAsc = 'POSITION_ID_ASC',
  PositionIdDesc = 'POSITION_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RewardDestinationAccountIdAsc = 'REWARD_DESTINATION_ACCOUNT_ID_ASC',
  RewardDestinationAccountIdDesc = 'REWARD_DESTINATION_ACCOUNT_ID_DESC',
  RewardDestinationAsc = 'REWARD_DESTINATION_ASC',
  RewardDestinationDesc = 'REWARD_DESTINATION_DESC',
  StashIdAsc = 'STASH_ID_ASC',
  StashIdDesc = 'STASH_ID_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  ValidatorIdAsc = 'VALIDATOR_ID_ASC',
  ValidatorIdDesc = 'VALIDATOR_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type StakingPosition = Node & {
  accountsByStakingEventPositionIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingEventPositionIdAndStashId: Connection<Account>;
  bonded: Scalars['BigFloat']['output'];
  controller?: Maybe<Account>;
  controllerId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventsByStakingEventPositionIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByStakingEventPositionIdAndIdentityId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  rewardDestination?: Maybe<Scalars['String']['output']>;
  rewardDestinationAccount?: Maybe<Account>;
  rewardDestinationAccountId?: Maybe<Scalars['String']['output']>;
  stakingEventsByPositionId: Connection<StakingEvent>;
  stash?: Maybe<Account>;
  stashId: Scalars['String']['output'];
  totalRewarded: Scalars['BigFloat']['output'];
  totalSlashed: Scalars['BigFloat']['output'];
  unbonding: Scalars['BigFloat']['output'];
  unlocking?: Maybe<Scalars['JSON']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  validatorsByStakingEventPositionIdAndValidatorId: Connection<Validator>;
};
export type StakingPositionFilter = {
  and?: InputMaybe<Array<StakingPositionFilter>>;
  bonded?: InputMaybe<BigFloatFilter>;
  controller?: InputMaybe<AccountFilter>;
  controllerExists?: InputMaybe<Scalars['Boolean']['input']>;
  controllerId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<StakingPositionFilter>;
  or?: InputMaybe<Array<StakingPositionFilter>>;
  rewardDestination?: InputMaybe<StringFilter>;
  rewardDestinationAccount?: InputMaybe<AccountFilter>;
  rewardDestinationAccountExists?: InputMaybe<Scalars['Boolean']['input']>;
  rewardDestinationAccountId?: InputMaybe<StringFilter>;
  stakingEventsByPositionId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stash?: InputMaybe<AccountFilter>;
  stashId?: InputMaybe<StringFilter>;
  totalRewarded?: InputMaybe<BigFloatFilter>;
  totalSlashed?: InputMaybe<BigFloatFilter>;
  unbonding?: InputMaybe<BigFloatFilter>;
  unlocking?: InputMaybe<JsonFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum StakingPositionsOrderBy {
  BondedAsc = 'BONDED_ASC',
  BondedDesc = 'BONDED_DESC',
  ControllerIdAsc = 'CONTROLLER_ID_ASC',
  ControllerIdDesc = 'CONTROLLER_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RewardDestinationAccountIdAsc = 'REWARD_DESTINATION_ACCOUNT_ID_ASC',
  RewardDestinationAccountIdDesc = 'REWARD_DESTINATION_ACCOUNT_ID_DESC',
  RewardDestinationAsc = 'REWARD_DESTINATION_ASC',
  RewardDestinationDesc = 'REWARD_DESTINATION_DESC',
  StashIdAsc = 'STASH_ID_ASC',
  StashIdDesc = 'STASH_ID_DESC',
  TotalRewardedAsc = 'TOTAL_REWARDED_ASC',
  TotalRewardedDesc = 'TOTAL_REWARDED_DESC',
  TotalSlashedAsc = 'TOTAL_SLASHED_ASC',
  TotalSlashedDesc = 'TOTAL_SLASHED_DESC',
  UnbondingAsc = 'UNBONDING_ASC',
  UnbondingDesc = 'UNBONDING_DESC',
  UnlockingAsc = 'UNLOCKING_ASC',
  UnlockingDesc = 'UNLOCKING_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum StatOpTypeEnum {
  Balance = 'Balance',
  Count = 'Count',
}
export type StatOpTypeEnumFilter = {
  distinctFrom?: InputMaybe<StatOpTypeEnum>;
  equalTo?: InputMaybe<StatOpTypeEnum>;
  greaterThan?: InputMaybe<StatOpTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<StatOpTypeEnum>;
  in?: InputMaybe<Array<StatOpTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<StatOpTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<StatOpTypeEnum>;
  notDistinctFrom?: InputMaybe<StatOpTypeEnum>;
  notEqualTo?: InputMaybe<StatOpTypeEnum>;
  notIn?: InputMaybe<Array<StatOpTypeEnum>>;
};
export type StatType = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByTransferComplianceStatTypeIdAndAssetId: Connection<Asset>;
  claimIssuer?: Maybe<Identity>;
  claimIssuerId?: Maybe<Scalars['String']['output']>;
  claimType?: Maybe<ClaimTypeEnum>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeId?: Maybe<Scalars['String']['output']>;
  eventsByTransferComplianceStatTypeIdAndCreatedEventId: Connection<Event>;
  eventsByTransferComplianceStatTypeIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByTransferComplianceStatTypeIdAndClaimIssuerId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  opType: StatOpTypeEnum;
  transferCompliances: Connection<TransferCompliance>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type StatTypeFilter = {
  and?: InputMaybe<Array<StatTypeFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimIssuer?: InputMaybe<IdentityFilter>;
  claimIssuerExists?: InputMaybe<Scalars['Boolean']['input']>;
  claimIssuerId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  customClaimType?: InputMaybe<CustomClaimTypeFilter>;
  customClaimTypeExists?: InputMaybe<Scalars['Boolean']['input']>;
  customClaimTypeId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<StatTypeFilter>;
  opType?: InputMaybe<StatOpTypeEnumFilter>;
  or?: InputMaybe<Array<StatTypeFilter>>;
  transferCompliances?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum StatTypesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimIssuerIdAsc = 'CLAIM_ISSUER_ID_ASC',
  ClaimIssuerIdDesc = 'CLAIM_ISSUER_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CustomClaimTypeIdAsc = 'CUSTOM_CLAIM_TYPE_ID_ASC',
  CustomClaimTypeIdDesc = 'CUSTOM_CLAIM_TYPE_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OpTypeAsc = 'OP_TYPE_ASC',
  OpTypeDesc = 'OP_TYPE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Sto = Node & {
  assetsByInvestmentStoIdAndOfferingAssetId: Connection<Asset>;
  assetsByInvestmentStoIdAndRaisingAssetId: Connection<Asset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  end?: Maybe<Scalars['Datetime']['output']>;
  eventsByInvestmentStoIdAndCreatedEventId: Connection<Event>;
  eventsByInvestmentStoIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByInvestmentStoIdAndInvestorId: Connection<Identity>;
  investments: Connection<Investment>;
  minimumInvestment: Scalars['BigFloat']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offChainFundingEnabled: Scalars['Boolean']['output'];
  offChainFundingToken?: Maybe<Scalars['String']['output']>;
  offeringAsset?: Maybe<Asset>;
  offeringAssetId: Scalars['String']['output'];
  offeringPortfolio?: Maybe<Portfolio>;
  offeringPortfolioId: Scalars['String']['output'];
  raisingAsset?: Maybe<Asset>;
  raisingAssetId?: Maybe<Scalars['String']['output']>;
  raisingPortfolio?: Maybe<Portfolio>;
  raisingPortfolioId: Scalars['String']['output'];
  raisingTicker?: Maybe<Scalars['String']['output']>;
  start?: Maybe<Scalars['Datetime']['output']>;
  status: StoStatus;
  stoId: Scalars['Int']['output'];
  tiers: Scalars['JSON']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  venue?: Maybe<Venue>;
  venueId: Scalars['String']['output'];
};
export type StoFilter = {
  and?: InputMaybe<Array<StoFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  end?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  investments?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  minimumInvestment?: InputMaybe<BigFloatFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<StoFilter>;
  offChainFundingEnabled?: InputMaybe<BooleanFilter>;
  offChainFundingToken?: InputMaybe<StringFilter>;
  offeringAsset?: InputMaybe<AssetFilter>;
  offeringAssetId?: InputMaybe<StringFilter>;
  offeringPortfolio?: InputMaybe<PortfolioFilter>;
  offeringPortfolioId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<StoFilter>>;
  raisingAsset?: InputMaybe<AssetFilter>;
  raisingAssetExists?: InputMaybe<Scalars['Boolean']['input']>;
  raisingAssetId?: InputMaybe<StringFilter>;
  raisingPortfolio?: InputMaybe<PortfolioFilter>;
  raisingPortfolioId?: InputMaybe<StringFilter>;
  raisingTicker?: InputMaybe<StringFilter>;
  start?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StoStatusFilter>;
  stoId?: InputMaybe<IntFilter>;
  tiers?: InputMaybe<JsonFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  venue?: InputMaybe<VenueFilter>;
  venueId?: InputMaybe<StringFilter>;
};
export enum StoStatus {
  Closed = 'Closed',
  ClosedEarly = 'ClosedEarly',
  Frozen = 'Frozen',
  Live = 'Live',
}
export type StoStatusFilter = {
  distinctFrom?: InputMaybe<StoStatus>;
  equalTo?: InputMaybe<StoStatus>;
  greaterThan?: InputMaybe<StoStatus>;
  greaterThanOrEqualTo?: InputMaybe<StoStatus>;
  in?: InputMaybe<Array<StoStatus>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<StoStatus>;
  lessThanOrEqualTo?: InputMaybe<StoStatus>;
  notDistinctFrom?: InputMaybe<StoStatus>;
  notEqualTo?: InputMaybe<StoStatus>;
  notIn?: InputMaybe<Array<StoStatus>>;
};
export enum StosOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EndAsc = 'END_ASC',
  EndDesc = 'END_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MinimumInvestmentAsc = 'MINIMUM_INVESTMENT_ASC',
  MinimumInvestmentDesc = 'MINIMUM_INVESTMENT_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OfferingAssetIdAsc = 'OFFERING_ASSET_ID_ASC',
  OfferingAssetIdDesc = 'OFFERING_ASSET_ID_DESC',
  OfferingPortfolioIdAsc = 'OFFERING_PORTFOLIO_ID_ASC',
  OfferingPortfolioIdDesc = 'OFFERING_PORTFOLIO_ID_DESC',
  OffChainFundingEnabledAsc = 'OFF_CHAIN_FUNDING_ENABLED_ASC',
  OffChainFundingEnabledDesc = 'OFF_CHAIN_FUNDING_ENABLED_DESC',
  OffChainFundingTokenAsc = 'OFF_CHAIN_FUNDING_TOKEN_ASC',
  OffChainFundingTokenDesc = 'OFF_CHAIN_FUNDING_TOKEN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RaisingAssetIdAsc = 'RAISING_ASSET_ID_ASC',
  RaisingAssetIdDesc = 'RAISING_ASSET_ID_DESC',
  RaisingPortfolioIdAsc = 'RAISING_PORTFOLIO_ID_ASC',
  RaisingPortfolioIdDesc = 'RAISING_PORTFOLIO_ID_DESC',
  RaisingTickerAsc = 'RAISING_TICKER_ASC',
  RaisingTickerDesc = 'RAISING_TICKER_DESC',
  StartAsc = 'START_ASC',
  StartDesc = 'START_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  StoIdAsc = 'STO_ID_ASC',
  StoIdDesc = 'STO_ID_DESC',
  TiersAsc = 'TIERS_ASC',
  TiersDesc = 'TIERS_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type StringFilter = {
  distinctFrom?: InputMaybe<Scalars['String']['input']>;
  distinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  endsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  equalTo?: InputMaybe<Scalars['String']['input']>;
  equalToInsensitive?: InputMaybe<Scalars['String']['input']>;
  greaterThan?: InputMaybe<Scalars['String']['input']>;
  greaterThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  inInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  includes?: InputMaybe<Scalars['String']['input']>;
  includesInsensitive?: InputMaybe<Scalars['String']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['String']['input']>;
  lessThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  likeInsensitive?: InputMaybe<Scalars['String']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['String']['input']>;
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEndsWith?: InputMaybe<Scalars['String']['input']>;
  notEndsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEqualTo?: InputMaybe<Scalars['String']['input']>;
  notEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  notInInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludes?: InputMaybe<Scalars['String']['input']>;
  notIncludesInsensitive?: InputMaybe<Scalars['String']['input']>;
  notLike?: InputMaybe<Scalars['String']['input']>;
  notLikeInsensitive?: InputMaybe<Scalars['String']['input']>;
  notStartsWith?: InputMaybe<Scalars['String']['input']>;
  notStartsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
  startsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
};
export type SubqueryVersion = Node & {
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  version: Scalars['String']['output'];
};
export type SubqueryVersionFilter = {
  and?: InputMaybe<Array<SubqueryVersionFilter>>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<SubqueryVersionFilter>;
  or?: InputMaybe<Array<SubqueryVersionFilter>>;
  version?: InputMaybe<StringFilter>;
};
export enum SubqueryVersionsOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum SubsidiesOrderBy {
  AllowanceAsc = 'ALLOWANCE_ASC',
  AllowanceDesc = 'ALLOWANCE_DESC',
  BeneficiaryAccountIdAsc = 'BENEFICIARY_ACCOUNT_ID_ASC',
  BeneficiaryAccountIdDesc = 'BENEFICIARY_ACCOUNT_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsAcceptedAsc = 'IS_ACCEPTED_ASC',
  IsAcceptedDesc = 'IS_ACCEPTED_DESC',
  IsRemovedAsc = 'IS_REMOVED_ASC',
  IsRemovedDesc = 'IS_REMOVED_DESC',
  Natural = 'NATURAL',
  PayingAccountIdAsc = 'PAYING_ACCOUNT_ID_ASC',
  PayingAccountIdDesc = 'PAYING_ACCOUNT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TotalDebitedAsc = 'TOTAL_DEBITED_ASC',
  TotalDebitedDesc = 'TOTAL_DEBITED_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Subsidy = Node & {
  allowance: Scalars['BigFloat']['output'];
  beneficiaryAccount?: Maybe<Account>;
  beneficiaryAccountId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isAccepted: Scalars['Boolean']['output'];
  isRemoved: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  payingAccount?: Maybe<Account>;
  payingAccountId: Scalars['String']['output'];
  totalDebited?: Maybe<Scalars['BigFloat']['output']>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type SubsidyFilter = {
  allowance?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<SubsidyFilter>>;
  beneficiaryAccount?: InputMaybe<AccountFilter>;
  beneficiaryAccountId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  isAccepted?: InputMaybe<BooleanFilter>;
  isRemoved?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<SubsidyFilter>;
  or?: InputMaybe<Array<SubsidyFilter>>;
  payingAccount?: InputMaybe<AccountFilter>;
  payingAccountId?: InputMaybe<StringFilter>;
  totalDebited?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export type TableEstimate = {
  estimate?: Maybe<Scalars['Int']['output']>;
  table?: Maybe<Scalars['String']['output']>;
};
export enum TargetTreatment {
  Exclude = 'Exclude',
  Include = 'Include',
}
export type TargetTreatmentFilter = {
  distinctFrom?: InputMaybe<TargetTreatment>;
  equalTo?: InputMaybe<TargetTreatment>;
  greaterThan?: InputMaybe<TargetTreatment>;
  greaterThanOrEqualTo?: InputMaybe<TargetTreatment>;
  in?: InputMaybe<Array<TargetTreatment>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<TargetTreatment>;
  lessThanOrEqualTo?: InputMaybe<TargetTreatment>;
  notDistinctFrom?: InputMaybe<TargetTreatment>;
  notEqualTo?: InputMaybe<TargetTreatment>;
  notIn?: InputMaybe<Array<TargetTreatment>>;
};
export type TickerReservation = Node & {
  asset?: Maybe<Asset>;
  assetId?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  expiry?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  ticker: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type TickerReservationFilter = {
  and?: InputMaybe<Array<TickerReservationFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetExists?: InputMaybe<Scalars['Boolean']['input']>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<TickerReservationFilter>;
  or?: InputMaybe<Array<TickerReservationFilter>>;
  ticker?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum TickerReservationsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TransferCompliance = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  claimIssuer?: Maybe<Identity>;
  claimIssuerId?: Maybe<Scalars['String']['output']>;
  claimType?: Maybe<ClaimTypeEnum>;
  claimValue?: Maybe<Scalars['String']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  max?: Maybe<Scalars['BigFloat']['output']>;
  min?: Maybe<Scalars['BigFloat']['output']>;
  nodeId: Scalars['ID']['output'];
  statType?: Maybe<StatType>;
  statTypeId: Scalars['String']['output'];
  type: TransferComplianceTypeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  value?: Maybe<Scalars['BigFloat']['output']>;
};
export type TransferComplianceExemption = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  claimType?: Maybe<ClaimTypeEnum>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  exemptedEntity?: Maybe<Identity>;
  exemptedEntityId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  opType: StatOpTypeEnum;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type TransferComplianceExemptionFilter = {
  and?: InputMaybe<Array<TransferComplianceExemptionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  exemptedEntity?: InputMaybe<IdentityFilter>;
  exemptedEntityId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<TransferComplianceExemptionFilter>;
  opType?: InputMaybe<StatOpTypeEnumFilter>;
  or?: InputMaybe<Array<TransferComplianceExemptionFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum TransferComplianceExemptionsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  ExemptedEntityIdAsc = 'EXEMPTED_ENTITY_ID_ASC',
  ExemptedEntityIdDesc = 'EXEMPTED_ENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OpTypeAsc = 'OP_TYPE_ASC',
  OpTypeDesc = 'OP_TYPE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TransferComplianceFilter = {
  and?: InputMaybe<Array<TransferComplianceFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimIssuer?: InputMaybe<IdentityFilter>;
  claimIssuerExists?: InputMaybe<Scalars['Boolean']['input']>;
  claimIssuerId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  claimValue?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  max?: InputMaybe<BigFloatFilter>;
  min?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<TransferComplianceFilter>;
  or?: InputMaybe<Array<TransferComplianceFilter>>;
  statType?: InputMaybe<StatTypeFilter>;
  statTypeId?: InputMaybe<StringFilter>;
  type?: InputMaybe<TransferComplianceTypeEnumFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  value?: InputMaybe<BigFloatFilter>;
};
export enum TransferComplianceTypeEnum {
  ClaimCount = 'ClaimCount',
  ClaimOwnership = 'ClaimOwnership',
  MaxInvestorCount = 'MaxInvestorCount',
  MaxInvestorOwnership = 'MaxInvestorOwnership',
}
export type TransferComplianceTypeEnumFilter = {
  distinctFrom?: InputMaybe<TransferComplianceTypeEnum>;
  equalTo?: InputMaybe<TransferComplianceTypeEnum>;
  greaterThan?: InputMaybe<TransferComplianceTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  in?: InputMaybe<Array<TransferComplianceTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<TransferComplianceTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  notDistinctFrom?: InputMaybe<TransferComplianceTypeEnum>;
  notEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  notIn?: InputMaybe<Array<TransferComplianceTypeEnum>>;
};
export enum TransferCompliancesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimIssuerIdAsc = 'CLAIM_ISSUER_ID_ASC',
  ClaimIssuerIdDesc = 'CLAIM_ISSUER_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  ClaimValueAsc = 'CLAIM_VALUE_ASC',
  ClaimValueDesc = 'CLAIM_VALUE_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MaxAsc = 'MAX_ASC',
  MaxDesc = 'MAX_DESC',
  MinAsc = 'MIN_ASC',
  MinDesc = 'MIN_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatTypeIdAsc = 'STAT_TYPE_ID_ASC',
  StatTypeIdDesc = 'STAT_TYPE_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TrustedClaimIssuer = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  issuer?: Maybe<Identity>;
  issuerId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type TrustedClaimIssuerFilter = {
  and?: InputMaybe<Array<TrustedClaimIssuerFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  issuer?: InputMaybe<IdentityFilter>;
  issuerId?: InputMaybe<StringFilter>;
  not?: InputMaybe<TrustedClaimIssuerFilter>;
  or?: InputMaybe<Array<TrustedClaimIssuerFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum TrustedClaimIssuersOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IssuerIdAsc = 'ISSUER_ID_ASC',
  IssuerIdDesc = 'ISSUER_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Validator = Node & {
  account?: Maybe<Account>;
  accountId: Scalars['String']['output'];
  accountsBySlashValidatorIdAndAccountId: Connection<Account>;
  accountsByStakingEventValidatorIdAndRewardDestinationAccountId: Connection<Account>;
  accountsByStakingEventValidatorIdAndStashId: Connection<Account>;
  blocked: Scalars['Boolean']['output'];
  commission?: Maybe<Scalars['BigFloat']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eras: Connection<ValidatorEra>;
  erasByValidatorEraValidatorIdAndEraId: Connection<Era>;
  eventsBySlashValidatorIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventValidatorIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorEraValidatorIdAndCreatedEventId: Connection<Event>;
  eventsByValidatorEraValidatorIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByStakingEventValidatorIdAndIdentityId: Connection<Identity>;
  identitiesByValidatorEraValidatorIdAndIdentityId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  isPermissioned: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  slashes: Connection<Slash>;
  stakingEvents: Connection<StakingEvent>;
  stakingPositionsByStakingEventValidatorIdAndPositionId: Connection<StakingPosition>;
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type ValidatorEra = Node & {
  blocked?: Maybe<Scalars['Boolean']['output']>;
  commission?: Maybe<Scalars['BigFloat']['output']>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  era?: Maybe<Era>;
  eraId: Scalars['String']['output'];
  eraIndex: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  nominatorCount: Scalars['Int']['output'];
  ownStake: Scalars['BigFloat']['output'];
  points?: Maybe<Scalars['Int']['output']>;
  totalStake: Scalars['BigFloat']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
  validator?: Maybe<Validator>;
  validatorId: Scalars['String']['output'];
};
export type ValidatorEraFilter = {
  and?: InputMaybe<Array<ValidatorEraFilter>>;
  blocked?: InputMaybe<BooleanFilter>;
  commission?: InputMaybe<BigFloatFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  era?: InputMaybe<EraFilter>;
  eraId?: InputMaybe<StringFilter>;
  eraIndex?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  nominatorCount?: InputMaybe<IntFilter>;
  not?: InputMaybe<ValidatorEraFilter>;
  or?: InputMaybe<Array<ValidatorEraFilter>>;
  ownStake?: InputMaybe<BigFloatFilter>;
  points?: InputMaybe<IntFilter>;
  totalStake?: InputMaybe<BigFloatFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
  validator?: InputMaybe<ValidatorFilter>;
  validatorId?: InputMaybe<StringFilter>;
};
export enum ValidatorErasOrderBy {
  BlockedAsc = 'BLOCKED_ASC',
  BlockedDesc = 'BLOCKED_DESC',
  CommissionAsc = 'COMMISSION_ASC',
  CommissionDesc = 'COMMISSION_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EraIdAsc = 'ERA_ID_ASC',
  EraIdDesc = 'ERA_ID_DESC',
  EraIndexAsc = 'ERA_INDEX_ASC',
  EraIndexDesc = 'ERA_INDEX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnStakeAsc = 'OWN_STAKE_ASC',
  OwnStakeDesc = 'OWN_STAKE_DESC',
  PointsAsc = 'POINTS_ASC',
  PointsDesc = 'POINTS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TotalStakeAsc = 'TOTAL_STAKE_ASC',
  TotalStakeDesc = 'TOTAL_STAKE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  ValidatorIdAsc = 'VALIDATOR_ID_ASC',
  ValidatorIdDesc = 'VALIDATOR_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ValidatorFilter = {
  account?: InputMaybe<AccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ValidatorFilter>>;
  blocked?: InputMaybe<BooleanFilter>;
  commission?: InputMaybe<BigFloatFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eras?: InputMaybe<OneToManyFilter<ValidatorEraFilter>>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  isActive?: InputMaybe<BooleanFilter>;
  isPermissioned?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<ValidatorFilter>;
  or?: InputMaybe<Array<ValidatorFilter>>;
  slashes?: InputMaybe<OneToManyFilter<SlashFilter>>;
  stakingEvents?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum ValidatorsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  BlockedAsc = 'BLOCKED_ASC',
  BlockedDesc = 'BLOCKED_DESC',
  CommissionAsc = 'COMMISSION_ASC',
  CommissionDesc = 'COMMISSION_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsActiveAsc = 'IS_ACTIVE_ASC',
  IsActiveDesc = 'IS_ACTIVE_DESC',
  IsPermissionedAsc = 'IS_PERMISSIONED_ASC',
  IsPermissionedDesc = 'IS_PERMISSIONED_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Venue = Node & {
  accountsByInstructionVenueIdAndRejectedBySignerId: Connection<Account>;
  assetsByStoVenueIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoVenueIdAndRaisingAssetId: Connection<Asset>;
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  eventsByInstructionVenueIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionVenueIdAndUpdatedEventId: Connection<Event>;
  eventsByStoVenueIdAndCreatedEventId: Connection<Event>;
  eventsByStoVenueIdAndUpdatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByInstructionVenueIdAndRejectedById: Connection<Identity>;
  identitiesByStoVenueIdAndCreatorId: Connection<Identity>;
  instructions: Connection<Instruction>;
  nodeId: Scalars['ID']['output'];
  offerings: Connection<Sto>;
  owner?: Maybe<Identity>;
  ownerId: Scalars['String']['output'];
  portfoliosByStoVenueIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoVenueIdAndRaisingPortfolioId: Connection<Portfolio>;
  signers: Scalars['JSON']['output'];
  type: Scalars['String']['output'];
  updatedEvent?: Maybe<Event>;
  updatedEventId: Scalars['String']['output'];
};
export type VenueFilter = {
  and?: InputMaybe<Array<VenueFilter>>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  details?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instructions?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  not?: InputMaybe<VenueFilter>;
  offerings?: InputMaybe<OneToManyFilter<StoFilter>>;
  or?: InputMaybe<Array<VenueFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerId?: InputMaybe<StringFilter>;
  signers?: InputMaybe<JsonFilter>;
  type?: InputMaybe<StringFilter>;
  updatedEvent?: InputMaybe<EventFilter>;
  updatedEventId?: InputMaybe<StringFilter>;
};
export enum VenuesOrderBy {
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DetailsAsc = 'DETAILS_ASC',
  DetailsDesc = 'DETAILS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignersAsc = 'SIGNERS_ASC',
  SignersDesc = 'SIGNERS_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedEventIdAsc = 'UPDATED_EVENT_ID_ASC',
  UpdatedEventIdDesc = 'UPDATED_EVENT_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type _Metadata = {
  chain?: Maybe<Scalars['String']['output']>;
  dbSize?: Maybe<Scalars['BigInt']['output']>;
  deployments?: Maybe<Scalars['JSON']['output']>;
  dynamicDatasources?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  evmChainId?: Maybe<Scalars['String']['output']>;
  genesisHash?: Maybe<Scalars['String']['output']>;
  indexerHealthy?: Maybe<Scalars['Boolean']['output']>;
  indexerNodeVersion?: Maybe<Scalars['String']['output']>;
  lastCreatedPoiHeight?: Maybe<Scalars['Int']['output']>;
  lastFinalizedVerifiedHeight?: Maybe<Scalars['Int']['output']>;
  lastProcessedHeight?: Maybe<Scalars['Int']['output']>;
  lastProcessedTimestamp?: Maybe<Scalars['Date']['output']>;
  latestSyncedPoiHeight?: Maybe<Scalars['Int']['output']>;
  queryNodeVersion?: Maybe<Scalars['String']['output']>;
  rowCountEstimate?: Maybe<Array<Maybe<TableEstimate>>>;
  specName?: Maybe<Scalars['String']['output']>;
  startHeight?: Maybe<Scalars['Int']['output']>;
  targetHeight?: Maybe<Scalars['Int']['output']>;
  unfinalizedBlocks?: Maybe<Scalars['String']['output']>;
};
export type _Metadatas = {
  nodes: Array<Maybe<_Metadata>>;
  totalCount: Scalars['Int']['output'];
};
