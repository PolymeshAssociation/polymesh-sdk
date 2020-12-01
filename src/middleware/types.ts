export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Object: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: Date;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1.  */
  BigInt: any;
  /** Converts strings into boolean */
  CustomBoolean: boolean;
};

export type Query = {
  __typename?: 'Query';
  /** Returns true as a heartbeat */
  heartbeat: Scalars['Boolean'];
  /** Get the chain  information */
  chainInfo?: Maybe<ChainInfo>;
  latestBlock: Block;
  /** Get all blocks */
  blocks?: Maybe<Array<Maybe<Block>>>;
  /** Get a block by block number */
  blockById?: Maybe<Block>;
  /** Get a block by hash */
  blockByHash?: Maybe<Block>;
  /** Get events by moduleId and eventId */
  events?: Maybe<Array<Maybe<Event>>>;
  /** Get a single event by any of its indexed arguments. If there is more than one result, it returns the most recent by block. */
  eventByIndexedArgs?: Maybe<Event>;
  /** Get events by any of its indexed arguments */
  eventsByIndexedArgs?: Maybe<Array<Maybe<Event>>>;
  /** Get transactions */
  transactions: ExtrinsicResult;
  /** Get transaction by hash */
  transactionByHash?: Maybe<Extrinsic>;
  /** Get transaction by number */
  transactionById?: Maybe<Extrinsic>;
  /** Get account by address */
  accountByAddress?: Maybe<Account>;
  /** Get Bridged event by Ethereum transaction hash */
  bridgedEventByTxHash?: Maybe<Event>;
  /** Get all POLYX transfers sent by the given did and/or account */
  polyxTransfersSent: Array<PolyxTransfer>;
  /** Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers */
  didsWithClaims: IdentityWithClaimsResult;
  /** Get issuer dids with at least one claim for given target */
  issuerDidsWithClaimsByTarget: IdentityWithClaimsResult;
  /** Get all scopes with at least one claim for a given identityId */
  scopesByIdentity: Array<ClaimScope>;
  /** Get all token tickers where given Did is a default Trusted Claim Issuer */
  tokensByTrustedClaimIssuer: Array<Scalars['String']>;
  /** Get all tickers of tokens that were held at some point by the given did */
  tokensHeldByDid: StringResult;
  /** Get all POLYX transfers (send) failed by the given account */
  polyxTransfersFailed: Array<FailedPolyxTransfer>;
  /** Get all POLYX transfers received by the given did and/or account */
  polyxTransfersReceived: Array<PolyxTransfer>;
  /** Get all token transfers received by the given account */
  tokenTransfersReceived: Array<TokenTransfer>;
  /** Get all token transfers sent by the given did */
  tokenTransfersSent: Array<TokenTransfer>;
  /** Get all Token transfers (send) failed by the given account */
  tokenTransfersFailed: Array<FailedTokenTransfer>;
  /** Get all authorizations with their status optionally filtered by did, account key or type */
  authorizations: Array<Authorization>;
  /** Get the current vote results for given pipId */
  referendumVotes: VoteResult;
  /** Get a proposal by its pipId */
  proposal: Proposal;
  /** Get all proposals optionally filtered by pipId, proposer or state */
  proposals: Array<Proposal>;
  /** Get the current voters list for given pipId */
  proposalVotes: Array<ProposalVote>;
};

export type QueryBlocksArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryBlockByIdArgs = {
  blockId?: Maybe<Scalars['Int']>;
};

export type QueryBlockByHashArgs = {
  blockHash?: Maybe<Scalars['String']>;
};

export type QueryEventsArgs = {
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
  fromBlock?: Maybe<Scalars['Int']>;
  toBlock?: Maybe<Scalars['Int']>;
};

export type QueryEventByIndexedArgsArgs = {
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
  eventArg0?: Maybe<Scalars['String']>;
  eventArg1?: Maybe<Scalars['String']>;
  eventArg2?: Maybe<Scalars['String']>;
};

export type QueryEventsByIndexedArgsArgs = {
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
  eventArg0?: Maybe<Scalars['String']>;
  eventArg1?: Maybe<Scalars['String']>;
  eventArg2?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTransactionsArgs = {
  block_id?: Maybe<Scalars['Int']>;
  address?: Maybe<Scalars['String']>;
  module_id?: Maybe<ModuleIdEnum>;
  call_id?: Maybe<CallIdEnum>;
  success?: Maybe<Scalars['Boolean']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<TransactionOrderByInput>;
};

export type QueryTransactionByHashArgs = {
  transactionHash?: Maybe<Scalars['String']>;
};

export type QueryTransactionByIdArgs = {
  blockId?: Maybe<Scalars['Int']>;
  transactionIdx?: Maybe<Scalars['Int']>;
};

export type QueryAccountByAddressArgs = {
  address?: Maybe<Scalars['String']>;
};

export type QueryBridgedEventByTxHashArgs = {
  ethTransactionHash: Scalars['String'];
};

export type QueryPolyxTransfersSentArgs = {
  did?: Maybe<Scalars['String']>;
  account?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryDidsWithClaimsArgs = {
  dids?: Maybe<Array<Scalars['String']>>;
  scope?: Maybe<ScopeInput>;
  trustedClaimIssuers?: Maybe<Array<Scalars['String']>>;
  claimTypes?: Maybe<Array<ClaimTypeEnum>>;
  includeExpired?: Maybe<Scalars['Boolean']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryIssuerDidsWithClaimsByTargetArgs = {
  target: Scalars['String'];
  scope?: Maybe<ScopeInput>;
  trustedClaimIssuers?: Maybe<Array<Scalars['String']>>;
  claimTypes?: Maybe<Array<ClaimTypeEnum>>;
  includeExpired?: Maybe<Scalars['Boolean']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryScopesByIdentityArgs = {
  did: Scalars['String'];
};

export type QueryTokensByTrustedClaimIssuerArgs = {
  claimIssuerDid: Scalars['String'];
  order?: Maybe<Order>;
};

export type QueryTokensHeldByDidArgs = {
  did: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  order?: Maybe<Order>;
};

export type QueryPolyxTransfersFailedArgs = {
  account: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryPolyxTransfersReceivedArgs = {
  did?: Maybe<Scalars['String']>;
  account?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTokenTransfersReceivedArgs = {
  did: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTokenTransfersSentArgs = {
  did: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTokenTransfersFailedArgs = {
  account: Scalars['String'];
  ticker?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryAuthorizationsArgs = {
  did?: Maybe<Scalars['String']>;
  accountKey?: Maybe<Scalars['String']>;
  authorizationTypes?: Maybe<Array<AuthTypeEnum>>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryReferendumVotesArgs = {
  proposalId: Scalars['Int'];
};

export type QueryProposalArgs = {
  pipId: Scalars['Int'];
};

export type QueryProposalsArgs = {
  pipIds?: Maybe<Array<Scalars['Int']>>;
  proposers?: Maybe<Array<Scalars['String']>>;
  states?: Maybe<Array<ProposalState>>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<ProposalOrderByInput>;
};

export type QueryProposalVotesArgs = {
  pipId: Scalars['Int'];
  vote?: Maybe<Scalars['Boolean']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<ProposalVotesOrderByInput>;
};

export type ChainInfo = {
  __typename?: 'ChainInfo';
  /** Chain information */
  implementationName?: Maybe<Scalars['String']>;
  specName?: Maybe<Scalars['String']>;
  implementationVersion?: Maybe<Scalars['Int']>;
  specVersion?: Maybe<Scalars['Int']>;
  epochDuration?: Maybe<Scalars['Int']>;
  expectedBlockTime?: Maybe<Scalars['Int']>;
  minimumPeriod?: Maybe<Scalars['Int']>;
  existentialDeposit?: Maybe<Scalars['Int']>;
  transferFee?: Maybe<Scalars['Int']>;
  creationFee?: Maybe<Scalars['Int']>;
  transactionBaseFee?: Maybe<Scalars['Int']>;
  transactionByteFee?: Maybe<Scalars['Int']>;
  sessionsPerEra?: Maybe<Scalars['Int']>;
};

export type Block = {
  __typename?: 'Block';
  /** Block details */
  id: Scalars['Int'];
  parent_id?: Maybe<Scalars['Int']>;
  hash?: Maybe<Scalars['String']>;
  parent_hash?: Maybe<Scalars['String']>;
  state_root?: Maybe<Scalars['String']>;
  extrinsics_root?: Maybe<Scalars['String']>;
  count_extrinsics?: Maybe<Scalars['Int']>;
  count_events?: Maybe<Scalars['Int']>;
  spec_version_id?: Maybe<Scalars['String']>;
  debug_info?: Maybe<Scalars['Object']>;
  count_accounts_new?: Maybe<Scalars['Int']>;
  count_events_extrinsic?: Maybe<Scalars['Int']>;
  count_events_finalization?: Maybe<Scalars['Int']>;
  count_events_module?: Maybe<Scalars['Int']>;
  count_events_system?: Maybe<Scalars['Int']>;
  count_extrinsics_error?: Maybe<Scalars['Int']>;
  count_extrinsics_signed?: Maybe<Scalars['Int']>;
  count_extrinsics_signedby_address?: Maybe<Scalars['Int']>;
  count_extrinsics_signedby_index?: Maybe<Scalars['Int']>;
  count_extrinsics_success?: Maybe<Scalars['Int']>;
  count_extrinsics_unsigned?: Maybe<Scalars['Int']>;
  datetime: Scalars['DateTime'];
  day?: Maybe<Scalars['Int']>;
  hour?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  range10000?: Maybe<Scalars['Int']>;
  range100000?: Maybe<Scalars['Int']>;
  range1000000?: Maybe<Scalars['Int']>;
  week?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
  logs?: Maybe<Scalars['Object']>;
  full_day?: Maybe<Scalars['Int']>;
  full_hour?: Maybe<Scalars['Int']>;
  full_month?: Maybe<Scalars['Int']>;
  full_week?: Maybe<Scalars['Int']>;
  count_accounts?: Maybe<Scalars['Int']>;
  count_accounts_reaped?: Maybe<Scalars['Int']>;
  count_contracts_new?: Maybe<Scalars['Int']>;
  count_log?: Maybe<Scalars['Int']>;
  count_sessions_new?: Maybe<Scalars['Int']>;
  parentBlock?: Maybe<Block>;
  events?: Maybe<Array<Maybe<Event>>>;
  extrinsics?: Maybe<Array<Maybe<Extrinsic>>>;
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
  inherents?: Maybe<Array<Maybe<Extrinsic>>>;
};

export type Event = {
  __typename?: 'Event';
  /** Blockchain event */
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
  extrinsic_idx?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
  spec_version_id?: Maybe<Scalars['Int']>;
  module_id?: Maybe<ModuleIdEnum>;
  event_id?: Maybe<EventIdEnum>;
  system?: Maybe<Scalars['Int']>;
  module?: Maybe<Scalars['Int']>;
  phase?: Maybe<Scalars['Int']>;
  attributes?: Maybe<Scalars['Object']>;
  event_arg_0?: Maybe<Scalars['String']>;
  event_arg_1?: Maybe<Scalars['String']>;
  event_arg_2?: Maybe<Scalars['String']>;
  claim_type?: Maybe<ClaimTypeEnum>;
  claim_scope?: Maybe<Scope>;
  claim_issuer?: Maybe<Scalars['String']>;
  claim_expiry?: Maybe<Scalars['String']>;
  codec_error?: Maybe<Scalars['Int']>;
  block?: Maybe<Block>;
  extrinsic?: Maybe<Extrinsic>;
};

export enum ModuleIdEnum {
  System = 'system',
  Babe = 'babe',
  Timestamp = 'timestamp',
  Indices = 'indices',
  Balances = 'balances',
  Transactionpayment = 'transactionpayment',
  Authorship = 'authorship',
  Staking = 'staking',
  Offences = 'offences',
  Session = 'session',
  Finalitytracker = 'finalitytracker',
  Grandpa = 'grandpa',
  Imonline = 'imonline',
  Authoritydiscovery = 'authoritydiscovery',
  Randomnesscollectiveflip = 'randomnesscollectiveflip',
  Historical = 'historical',
  Sudo = 'sudo',
  Multisig = 'multisig',
  Contracts = 'contracts',
  Treasury = 'treasury',
  Polymeshcommittee = 'polymeshcommittee',
  Committeemembership = 'committeemembership',
  Pips = 'pips',
  Asset = 'asset',
  Dividend = 'dividend',
  Identity = 'identity',
  Bridge = 'bridge',
  Compliancemanager = 'compliancemanager',
  Voting = 'voting',
  Stocapped = 'stocapped',
  Exemption = 'exemption',
  Settlement = 'settlement',
  Sto = 'sto',
  Cddserviceproviders = 'cddserviceproviders',
  Statistic = 'statistic',
  Protocolfee = 'protocolfee',
  Utility = 'utility',
  Portfolio = 'portfolio',
  Confidential = 'confidential',
}

export enum EventIdEnum {
  ExtrinsicSuccess = 'ExtrinsicSuccess',
  ExtrinsicFailed = 'ExtrinsicFailed',
  CodeUpdated = 'CodeUpdated',
  NewAccount = 'NewAccount',
  KilledAccount = 'KilledAccount',
  IndexAssigned = 'IndexAssigned',
  IndexFreed = 'IndexFreed',
  IndexFrozen = 'IndexFrozen',
  Endowed = 'Endowed',
  Transfer = 'Transfer',
  BalanceSet = 'BalanceSet',
  AccountBalanceBurned = 'AccountBalanceBurned',
  Reserved = 'Reserved',
  Unreserved = 'Unreserved',
  ReserveRepatriated = 'ReserveRepatriated',
  EraPayout = 'EraPayout',
  Reward = 'Reward',
  Slash = 'Slash',
  OldSlashingReportDiscarded = 'OldSlashingReportDiscarded',
  StakingElection = 'StakingElection',
  SolutionStored = 'SolutionStored',
  Bonded = 'Bonded',
  Unbonded = 'Unbonded',
  Nominated = 'Nominated',
  Withdrawn = 'Withdrawn',
  PermissionedValidatorAdded = 'PermissionedValidatorAdded',
  PermissionedValidatorRemoved = 'PermissionedValidatorRemoved',
  PermissionedValidatorStatusChanged = 'PermissionedValidatorStatusChanged',
  InvalidatedNominators = 'InvalidatedNominators',
  IndividualCommissionEnabled = 'IndividualCommissionEnabled',
  GlobalCommissionUpdated = 'GlobalCommissionUpdated',
  MinimumBondThresholdUpdated = 'MinimumBondThresholdUpdated',
  Offence = 'Offence',
  NewSession = 'NewSession',
  NewAuthorities = 'NewAuthorities',
  Paused = 'Paused',
  Resumed = 'Resumed',
  HeartbeatReceived = 'HeartbeatReceived',
  AllGood = 'AllGood',
  SomeOffline = 'SomeOffline',
  SlashingParamsUpdated = 'SlashingParamsUpdated',
  Sudid = 'Sudid',
  KeyChanged = 'KeyChanged',
  SudoAsDone = 'SudoAsDone',
  MultiSigCreated = 'MultiSigCreated',
  ProposalAdded = 'ProposalAdded',
  ProposalExecuted = 'ProposalExecuted',
  MultiSigSignerAdded = 'MultiSigSignerAdded',
  MultiSigSignerAuthorized = 'MultiSigSignerAuthorized',
  MultiSigSignerRemoved = 'MultiSigSignerRemoved',
  MultiSigSignaturesRequiredChanged = 'MultiSigSignaturesRequiredChanged',
  ProposalApproved = 'ProposalApproved',
  ProposalRejectionVote = 'ProposalRejectionVote',
  ProposalRejected = 'ProposalRejected',
  Instantiated = 'Instantiated',
  Evicted = 'Evicted',
  Restored = 'Restored',
  CodeStored = 'CodeStored',
  ScheduleUpdated = 'ScheduleUpdated',
  ContractExecution = 'ContractExecution',
  TreasuryDisbursement = 'TreasuryDisbursement',
  TreasuryReimbursement = 'TreasuryReimbursement',
  Proposed = 'Proposed',
  Voted = 'Voted',
  VoteRetracted = 'VoteRetracted',
  FinalVotes = 'FinalVotes',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Executed = 'Executed',
  Closed = 'Closed',
  ReleaseCoordinatorUpdated = 'ReleaseCoordinatorUpdated',
  VoteThresholdUpdated = 'VoteThresholdUpdated',
  VoteEnactReferendum = 'VoteEnactReferendum',
  VoteRejectReferendum = 'VoteRejectReferendum',
  MemberAdded = 'MemberAdded',
  MemberRemoved = 'MemberRemoved',
  MemberRevoked = 'MemberRevoked',
  MembersSwapped = 'MembersSwapped',
  MembersReset = 'MembersReset',
  Dummy = 'Dummy',
  HistoricalPipsPruned = 'HistoricalPipsPruned',
  ProposalCreated = 'ProposalCreated',
  ProposalDetailsAmended = 'ProposalDetailsAmended',
  ProposalBondAdjusted = 'ProposalBondAdjusted',
  ProposalStateUpdated = 'ProposalStateUpdated',
  PipClosed = 'PipClosed',
  ReferendumCreated = 'ReferendumCreated',
  ReferendumScheduled = 'ReferendumScheduled',
  ReferendumStateUpdated = 'ReferendumStateUpdated',
  DefaultEnactmentPeriodChanged = 'DefaultEnactmentPeriodChanged',
  MinimumProposalDepositChanged = 'MinimumProposalDepositChanged',
  QuorumThresholdChanged = 'QuorumThresholdChanged',
  ProposalCoolOffPeriodChanged = 'ProposalCoolOffPeriodChanged',
  ProposalDurationChanged = 'ProposalDurationChanged',
  ProposalRefund = 'ProposalRefund',
  Approval = 'Approval',
  Issued = 'Issued',
  Redeemed = 'Redeemed',
  ControllerTransfer = 'ControllerTransfer',
  ControllerRedemption = 'ControllerRedemption',
  AssetCreated = 'AssetCreated',
  IdentifiersUpdated = 'IdentifiersUpdated',
  DivisibilityChanged = 'DivisibilityChanged',
  TransferWithData = 'TransferWithData',
  IsIssuable = 'IsIssuable',
  TickerRegistered = 'TickerRegistered',
  TickerTransferred = 'TickerTransferred',
  AssetOwnershipTransferred = 'AssetOwnershipTransferred',
  AssetFrozen = 'AssetFrozen',
  AssetUnfrozen = 'AssetUnfrozen',
  AssetRenamed = 'AssetRenamed',
  FundingRoundSet = 'FundingRoundSet',
  ExtensionAdded = 'ExtensionAdded',
  ExtensionArchived = 'ExtensionArchived',
  ExtensionUnArchived = 'ExtensionUnArchived',
  CheckpointCreated = 'CheckpointCreated',
  PrimaryIssuanceAgentTransfered = 'PrimaryIssuanceAgentTransfered',
  DocumentAdded = 'DocumentAdded',
  DocumentRemoved = 'DocumentRemoved',
  ExtensionRemoved = 'ExtensionRemoved',
  ClassicTickerClaimed = 'ClassicTickerClaimed',
  DividendCreated = 'DividendCreated',
  DividendCanceled = 'DividendCanceled',
  DividendPaidOutToUser = 'DividendPaidOutToUser',
  DividendRemainingClaimed = 'DividendRemainingClaimed',
  DidCreated = 'DidCreated',
  SecondaryKeysAdded = 'SecondaryKeysAdded',
  SecondaryKeysRemoved = 'SecondaryKeysRemoved',
  SignerLeft = 'SignerLeft',
  SecondaryPermissionsUpdated = 'SecondaryPermissionsUpdated',
  PrimaryKeyUpdated = 'PrimaryKeyUpdated',
  ClaimAdded = 'ClaimAdded',
  ClaimRevoked = 'ClaimRevoked',
  DidStatus = 'DidStatus',
  CddStatus = 'CddStatus',
  AssetDidRegistered = 'AssetDidRegistered',
  AuthorizationAdded = 'AuthorizationAdded',
  AuthorizationRevoked = 'AuthorizationRevoked',
  AuthorizationRejected = 'AuthorizationRejected',
  AuthorizationConsumed = 'AuthorizationConsumed',
  OffChainAuthorizationRevoked = 'OffChainAuthorizationRevoked',
  CddRequirementForPrimaryKeyUpdated = 'CddRequirementForPrimaryKeyUpdated',
  CddClaimsInvalidated = 'CddClaimsInvalidated',
  SecondaryKeysFrozen = 'SecondaryKeysFrozen',
  SecondaryKeysUnfrozen = 'SecondaryKeysUnfrozen',
  ControllerChanged = 'ControllerChanged',
  AdminChanged = 'AdminChanged',
  TimelockChanged = 'TimelockChanged',
  Bridged = 'Bridged',
  Frozen = 'Frozen',
  Unfrozen = 'Unfrozen',
  FrozenTx = 'FrozenTx',
  UnfrozenTx = 'UnfrozenTx',
  ExemptedUpdated = 'ExemptedUpdated',
  BridgeLimitUpdated = 'BridgeLimitUpdated',
  TxsHandled = 'TxsHandled',
  BridgeTxScheduled = 'BridgeTxScheduled',
  ComplianceRequirementCreated = 'ComplianceRequirementCreated',
  ComplianceRequirementRemoved = 'ComplianceRequirementRemoved',
  AssetComplianceReplaced = 'AssetComplianceReplaced',
  AssetComplianceReset = 'AssetComplianceReset',
  AssetComplianceResumed = 'AssetComplianceResumed',
  AssetCompliancePaused = 'AssetCompliancePaused',
  ComplianceRequirementChanged = 'ComplianceRequirementChanged',
  TrustedDefaultClaimIssuerAdded = 'TrustedDefaultClaimIssuerAdded',
  TrustedDefaultClaimIssuerRemoved = 'TrustedDefaultClaimIssuerRemoved',
  BallotCreated = 'BallotCreated',
  VoteCast = 'VoteCast',
  BallotCancelled = 'BallotCancelled',
  AssetPurchased = 'AssetPurchased',
  ExemptionListModified = 'ExemptionListModified',
  VenueCreated = 'VenueCreated',
  VenueUpdated = 'VenueUpdated',
  InstructionCreated = 'InstructionCreated',
  InstructionAuthorized = 'InstructionAuthorized',
  InstructionUnauthorized = 'InstructionUnauthorized',
  InstructionRejected = 'InstructionRejected',
  ReceiptClaimed = 'ReceiptClaimed',
  ReceiptUnclaimed = 'ReceiptUnclaimed',
  VenueFiltering = 'VenueFiltering',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
  LegFailedExecution = 'LegFailedExecution',
  InstructionFailed = 'InstructionFailed',
  InstructionExecuted = 'InstructionExecuted',
  VenueUnauthorized = 'VenueUnauthorized',
  FundraiserCreated = 'FundraiserCreated',
  FundsRaised = 'FundsRaised',
  FeeSet = 'FeeSet',
  CoefficientSet = 'CoefficientSet',
  FeeCharged = 'FeeCharged',
  BatchInterrupted = 'BatchInterrupted',
  BatchOptimisticFailed = 'BatchOptimisticFailed',
  BatchCompleted = 'BatchCompleted',
  PortfolioCreated = 'PortfolioCreated',
  PortfolioDeleted = 'PortfolioDeleted',
  MovedBetweenPortfolios = 'MovedBetweenPortfolios',
  PortfolioRenamed = 'PortfolioRenamed',
  UserPortfolios = 'UserPortfolios',
  PortfolioCustodianChanged = 'PortfolioCustodianChanged',
  RangeProofAdded = 'RangeProofAdded',
  RangeProofVerified = 'RangeProofVerified',
}

export enum ClaimTypeEnum {
  Accredited = 'Accredited',
  Affiliate = 'Affiliate',
  BuyLockup = 'BuyLockup',
  SellLockup = 'SellLockup',
  CustomerDueDiligence = 'CustomerDueDiligence',
  KnowYourCustomer = 'KnowYourCustomer',
  Jurisdiction = 'Jurisdiction',
  Exempted = 'Exempted',
  Blocked = 'Blocked',
  NoData = 'NoData',
}

export type Scope = {
  __typename?: 'Scope';
  type: ClaimScopeTypeEnum;
  value: Scalars['String'];
};

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  Ticker = 'Ticker',
  Custom = 'Custom',
}

export type Extrinsic = {
  __typename?: 'Extrinsic';
  /** Extrinsic details */
  block_id: Scalars['Int'];
  extrinsic_idx: Scalars['Int'];
  extrinsic_length?: Maybe<Scalars['String']>;
  extrinsic_version?: Maybe<Scalars['String']>;
  signed?: Maybe<Scalars['Int']>;
  unsigned?: Maybe<Scalars['Int']>;
  address_length?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  account_index?: Maybe<Scalars['String']>;
  signature?: Maybe<Scalars['String']>;
  nonce?: Maybe<Scalars['Int']>;
  era?: Maybe<Scalars['String']>;
  call?: Maybe<Scalars['String']>;
  module_id: ModuleIdEnum;
  call_id: CallIdEnum;
  params: Array<Maybe<Scalars['Object']>>;
  success: Scalars['Int'];
  error?: Maybe<Scalars['Int']>;
  spec_version_id: Scalars['Int'];
  codec_error?: Maybe<Scalars['Int']>;
  extrinsic_hash?: Maybe<Scalars['String']>;
  account_idx?: Maybe<Scalars['Int']>;
  signedby_address?: Maybe<Scalars['Int']>;
  signedby_index?: Maybe<Scalars['Int']>;
  block?: Maybe<Block>;
  addressAccount?: Maybe<Account>;
};

export enum CallIdEnum {
  FillBlock = 'fill_block',
  Remark = 'remark',
  SetHeapPages = 'set_heap_pages',
  SetCode = 'set_code',
  SetCodeWithoutChecks = 'set_code_without_checks',
  SetChangesTrieConfig = 'set_changes_trie_config',
  SetStorage = 'set_storage',
  KillStorage = 'kill_storage',
  KillPrefix = 'kill_prefix',
  Suicide = 'suicide',
  ReportEquivocation = 'report_equivocation',
  ReportEquivocationUnsigned = 'report_equivocation_unsigned',
  Set = 'set',
  Claim = 'claim',
  Transfer = 'transfer',
  Free = 'free',
  ForceTransfer = 'force_transfer',
  Freeze = 'freeze',
  TransferWithMemo = 'transfer_with_memo',
  DepositBlockRewardReserveBalance = 'deposit_block_reward_reserve_balance',
  SetBalance = 'set_balance',
  BurnAccountBalance = 'burn_account_balance',
  SetUncles = 'set_uncles',
  Bond = 'bond',
  BondExtra = 'bond_extra',
  Unbond = 'unbond',
  WithdrawUnbonded = 'withdraw_unbonded',
  Validate = 'validate',
  Nominate = 'nominate',
  Chill = 'chill',
  SetPayee = 'set_payee',
  SetController = 'set_controller',
  SetValidatorCount = 'set_validator_count',
  IncreaseValidatorCount = 'increase_validator_count',
  ScaleValidatorCount = 'scale_validator_count',
  AddPermissionedValidator = 'add_permissioned_validator',
  RemovePermissionedValidator = 'remove_permissioned_validator',
  ValidateCddExpiryNominators = 'validate_cdd_expiry_nominators',
  EnableIndividualCommissions = 'enable_individual_commissions',
  SetGlobalCommission = 'set_global_commission',
  SetMinBondThreshold = 'set_min_bond_threshold',
  ForceNoEras = 'force_no_eras',
  ForceNewEra = 'force_new_era',
  SetInvulnerables = 'set_invulnerables',
  ForceUnstake = 'force_unstake',
  ForceNewEraAlways = 'force_new_era_always',
  CancelDeferredSlash = 'cancel_deferred_slash',
  PayoutStakers = 'payout_stakers',
  Rebond = 'rebond',
  SetHistoryDepth = 'set_history_depth',
  ReapStash = 'reap_stash',
  SubmitElectionSolution = 'submit_election_solution',
  SubmitElectionSolutionUnsigned = 'submit_election_solution_unsigned',
  SetKeys = 'set_keys',
  PurgeKeys = 'purge_keys',
  FinalHint = 'final_hint',
  NoteStalled = 'note_stalled',
  Heartbeat = 'heartbeat',
  SetSlashingParams = 'set_slashing_params',
  Sudo = 'sudo',
  SudoUncheckedWeight = 'sudo_unchecked_weight',
  SetKey = 'set_key',
  SudoAs = 'sudo_as',
  CreateMultisig = 'create_multisig',
  CreateOrApproveProposalAsIdentity = 'create_or_approve_proposal_as_identity',
  CreateOrApproveProposalAsKey = 'create_or_approve_proposal_as_key',
  CreateProposalAsIdentity = 'create_proposal_as_identity',
  CreateProposalAsKey = 'create_proposal_as_key',
  ApproveAsIdentity = 'approve_as_identity',
  ApproveAsKey = 'approve_as_key',
  RejectAsIdentity = 'reject_as_identity',
  RejectAsKey = 'reject_as_key',
  AcceptMultisigSignerAsIdentity = 'accept_multisig_signer_as_identity',
  AcceptMultisigSignerAsKey = 'accept_multisig_signer_as_key',
  AddMultisigSigner = 'add_multisig_signer',
  RemoveMultisigSigner = 'remove_multisig_signer',
  AddMultisigSignersViaCreator = 'add_multisig_signers_via_creator',
  RemoveMultisigSignersViaCreator = 'remove_multisig_signers_via_creator',
  ChangeSigsRequired = 'change_sigs_required',
  ChangeAllSignersAndSigsRequired = 'change_all_signers_and_sigs_required',
  MakeMultisigSigner = 'make_multisig_signer',
  MakeMultisigPrimary = 'make_multisig_primary',
  UpdateSchedule = 'update_schedule',
  PutCode = 'put_code',
  Call = 'call',
  Instantiate = 'instantiate',
  ClaimSurcharge = 'claim_surcharge',
  Disbursement = 'disbursement',
  Reimbursement = 'reimbursement',
  SetVoteThreshold = 'set_vote_threshold',
  Close = 'close',
  SetReleaseCoordinator = 'set_release_coordinator',
  VoteEnactReferendum = 'vote_enact_referendum',
  VoteRejectReferendum = 'vote_reject_referendum',
  DisableMember = 'disable_member',
  AddMember = 'add_member',
  RemoveMember = 'remove_member',
  SwapMember = 'swap_member',
  ResetMembers = 'reset_members',
  AbdicateMembership = 'abdicate_membership',
  SetPruneHistoricalPips = 'set_prune_historical_pips',
  SetMinProposalDeposit = 'set_min_proposal_deposit',
  SetQuorumThreshold = 'set_quorum_threshold',
  SetProposalDuration = 'set_proposal_duration',
  SetProposalCoolOffPeriod = 'set_proposal_cool_off_period',
  SetDefaultEnactmentPeriod = 'set_default_enactment_period',
  Propose = 'propose',
  AmendProposal = 'amend_proposal',
  CancelProposal = 'cancel_proposal',
  BondAdditionalDeposit = 'bond_additional_deposit',
  UnbondDeposit = 'unbond_deposit',
  Vote = 'vote',
  KillProposal = 'kill_proposal',
  PruneProposal = 'prune_proposal',
  FastTrackProposal = 'fast_track_proposal',
  EmergencyReferendum = 'emergency_referendum',
  EnactReferendum = 'enact_referendum',
  RejectReferendum = 'reject_referendum',
  OverrideReferendumEnactmentPeriod = 'override_referendum_enactment_period',
  RegisterTicker = 'register_ticker',
  AcceptTickerTransfer = 'accept_ticker_transfer',
  AcceptPrimaryIssuanceAgentTransfer = 'accept_primary_issuance_agent_transfer',
  AcceptAssetOwnershipTransfer = 'accept_asset_ownership_transfer',
  CreateAsset = 'create_asset',
  Unfreeze = 'unfreeze',
  RenameAsset = 'rename_asset',
  CreateCheckpoint = 'create_checkpoint',
  Issue = 'issue',
  MakeDivisible = 'make_divisible',
  BatchAddDocument = 'batch_add_document',
  BatchRemoveDocument = 'batch_remove_document',
  SetFundingRound = 'set_funding_round',
  UpdateIdentifiers = 'update_identifiers',
  AddExtension = 'add_extension',
  ArchiveExtension = 'archive_extension',
  UnarchiveExtension = 'unarchive_extension',
  RemovePrimaryIssuanceAgent = 'remove_primary_issuance_agent',
  RemoveSmartExtension = 'remove_smart_extension',
  ClaimClassicTicker = 'claim_classic_ticker',
  New = 'new',
  Cancel = 'cancel',
  ClaimUnclaimed = 'claim_unclaimed',
  RegisterDid = 'register_did',
  CddRegisterDid = 'cdd_register_did',
  MockCddRegisterDid = 'mock_cdd_register_did',
  InvalidateCddClaims = 'invalidate_cdd_claims',
  RemoveSecondaryKeys = 'remove_secondary_keys',
  SetPrimaryKey = 'set_primary_key',
  AcceptPrimaryKey = 'accept_primary_key',
  ChangeCddRequirementForMkRotation = 'change_cdd_requirement_for_mk_rotation',
  JoinIdentityAsKey = 'join_identity_as_key',
  JoinIdentityAsIdentity = 'join_identity_as_identity',
  LeaveIdentityAsKey = 'leave_identity_as_key',
  LeaveIdentityAsIdentity = 'leave_identity_as_identity',
  AddClaim = 'add_claim',
  BatchAddClaim = 'batch_add_claim',
  ForwardedCall = 'forwarded_call',
  RevokeClaim = 'revoke_claim',
  BatchRevokeClaim = 'batch_revoke_claim',
  SetPermissionToSigner = 'set_permission_to_signer',
  FreezeSecondaryKeys = 'freeze_secondary_keys',
  UnfreezeSecondaryKeys = 'unfreeze_secondary_keys',
  GetMyDid = 'get_my_did',
  GetCddOf = 'get_cdd_of',
  AddAuthorization = 'add_authorization',
  BatchAddAuthorization = 'batch_add_authorization',
  RemoveAuthorization = 'remove_authorization',
  BatchRemoveAuthorization = 'batch_remove_authorization',
  AcceptAuthorization = 'accept_authorization',
  BatchAcceptAuthorization = 'batch_accept_authorization',
  BatchAddSecondaryKeyWithAuthorization = 'batch_add_secondary_key_with_authorization',
  RevokeOffchainAuthorization = 'revoke_offchain_authorization',
  ChangeController = 'change_controller',
  ChangeAdmin = 'change_admin',
  ChangeTimelock = 'change_timelock',
  ChangeBridgeLimit = 'change_bridge_limit',
  ChangeBridgeExempted = 'change_bridge_exempted',
  ForceHandleBridgeTx = 'force_handle_bridge_tx',
  BatchForceHandleBridgeTx = 'batch_force_handle_bridge_tx',
  ProposeBridgeTx = 'propose_bridge_tx',
  BatchProposeBridgeTx = 'batch_propose_bridge_tx',
  HandleBridgeTx = 'handle_bridge_tx',
  BatchHandleBridgeTx = 'batch_handle_bridge_tx',
  BatchFreezeTx = 'batch_freeze_tx',
  BatchUnfreezeTx = 'batch_unfreeze_tx',
  AddComplianceRequirement = 'add_compliance_requirement',
  RemoveComplianceRequirement = 'remove_compliance_requirement',
  ReplaceAssetCompliance = 'replace_asset_compliance',
  ResetAssetCompliance = 'reset_asset_compliance',
  PauseAssetCompliance = 'pause_asset_compliance',
  ResumeAssetCompliance = 'resume_asset_compliance',
  AddDefaultTrustedClaimIssuer = 'add_default_trusted_claim_issuer',
  RemoveDefaultTrustedClaimIssuer = 'remove_default_trusted_claim_issuer',
  BatchAddDefaultTrustedClaimIssuer = 'batch_add_default_trusted_claim_issuer',
  BatchRemoveDefaultTrustedClaimIssuer = 'batch_remove_default_trusted_claim_issuer',
  ChangeComplianceRequirement = 'change_compliance_requirement',
  BatchChangeComplianceRequirement = 'batch_change_compliance_requirement',
  AddBallot = 'add_ballot',
  CancelBallot = 'cancel_ballot',
  LaunchSto = 'launch_sto',
  BuyTokens = 'buy_tokens',
  PauseSto = 'pause_sto',
  UnpauseSto = 'unpause_sto',
  ModifyExemptionList = 'modify_exemption_list',
  CreateVenue = 'create_venue',
  UpdateVenue = 'update_venue',
  AddInstruction = 'add_instruction',
  AddAndAuthorizeInstruction = 'add_and_authorize_instruction',
  AuthorizeInstruction = 'authorize_instruction',
  UnauthorizeInstruction = 'unauthorize_instruction',
  RejectInstruction = 'reject_instruction',
  AuthorizeWithReceipts = 'authorize_with_receipts',
  ClaimReceipt = 'claim_receipt',
  UnclaimReceipt = 'unclaim_receipt',
  SetVenueFiltering = 'set_venue_filtering',
  AllowVenues = 'allow_venues',
  DisallowVenues = 'disallow_venues',
  CreateFundraiser = 'create_fundraiser',
  Invest = 'invest',
  ChangeCoefficient = 'change_coefficient',
  ChangeBaseFee = 'change_base_fee',
  Batch = 'batch',
  BatchAtomic = 'batch_atomic',
  BatchOptimistic = 'batch_optimistic',
  RelayTx = 'relay_tx',
  CreatePortfolio = 'create_portfolio',
  DeletePortfolio = 'delete_portfolio',
  MovePortfolioFunds = 'move_portfolio_funds',
  RenamePortfolio = 'rename_portfolio',
  AddRangeProof = 'add_range_proof',
  AddVerifyRangeProof = 'add_verify_range_proof',
}

export type Account = {
  __typename?: 'Account';
  id?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  created_at_block?: Maybe<Scalars['Int']>;
  balance?: Maybe<Scalars['Float']>;
  count_reaped?: Maybe<Scalars['Int']>;
  is_contract?: Maybe<Scalars['Boolean']>;
  is_nominator?: Maybe<Scalars['Boolean']>;
  is_reaped?: Maybe<Scalars['Boolean']>;
  is_validator?: Maybe<Scalars['Boolean']>;
  updated_at_block?: Maybe<Scalars['Int']>;
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
};

export type AccountTransactionsArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type TransactionOrderByInput = {
  field: TransactionOrderFields;
  order: Order;
};

export enum TransactionOrderFields {
  BlockId = 'block_id',
  Address = 'address',
  ModuleId = 'module_id',
  CallId = 'call_id',
}

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type ExtrinsicResult = {
  __typename?: 'ExtrinsicResult';
  totalCount: Scalars['Int'];
  items: Array<Extrinsic>;
};

export type PolyxTransfer = {
  __typename?: 'PolyxTransfer';
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  fromDID: Scalars['String'];
  fromAccount: Scalars['String'];
  toDID: Scalars['String'];
  toAccount: Scalars['String'];
  balance: Scalars['Float'];
};

export type ScopeInput = {
  type: ClaimScopeTypeEnum;
  value: Scalars['String'];
};

export type IdentityWithClaimsResult = {
  __typename?: 'IdentityWithClaimsResult';
  totalCount: Scalars['Int'];
  items: Array<IdentityWithClaims>;
};

export type IdentityWithClaims = {
  __typename?: 'IdentityWithClaims';
  did: Scalars['String'];
  claims: Array<Claim>;
};

export type Claim = {
  __typename?: 'Claim';
  targetDID: Scalars['String'];
  issuer: Scalars['String'];
  issuance_date: Scalars['BigInt'];
  last_update_date: Scalars['BigInt'];
  expiry?: Maybe<Scalars['BigInt']>;
  type: ClaimTypeEnum;
  jurisdiction?: Maybe<Scalars['String']>;
  scope?: Maybe<Scope>;
  cdd_id?: Maybe<Scalars['String']>;
};

export type ClaimScope = {
  __typename?: 'ClaimScope';
  scope?: Maybe<Scope>;
  ticker?: Maybe<Scalars['String']>;
};

export type StringResult = {
  __typename?: 'StringResult';
  totalCount: Scalars['Int'];
  items: Array<Scalars['String']>;
};

export type FailedPolyxTransfer = {
  __typename?: 'FailedPolyxTransfer';
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  fromAccount: Scalars['String'];
  toAccount: Scalars['String'];
  balance: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
};

export type TokenTransfer = {
  __typename?: 'TokenTransfer';
  callerDID: Scalars['String'];
  ticker: Scalars['String'];
  fromDID: Scalars['String'];
  toDID: Scalars['String'];
  balance: Scalars['Float'];
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
};

export type FailedTokenTransfer = {
  __typename?: 'FailedTokenTransfer';
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  ticker: Scalars['String'];
  fromAccount: Scalars['String'];
  toDid: Scalars['String'];
  balance: Scalars['Float'];
  data?: Maybe<Scalars['String']>;
};

export enum AuthTypeEnum {
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  RotatePrimaryKey = 'RotatePrimaryKey',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  TransferPrimaryIssuanceAgent = 'TransferPrimaryIssuanceAgent',
  JoinIdentity = 'JoinIdentity',
  PortfolioCustody = 'PortfolioCustody',
  Custom = 'Custom',
  NoData = 'NoData',
}

export type Authorization = {
  __typename?: 'Authorization';
  authId: Scalars['Int'];
  fromDID: Scalars['String'];
  toDID?: Maybe<Scalars['String']>;
  toKey?: Maybe<Scalars['String']>;
  type: AuthTypeEnum;
  data?: Maybe<Scalars['String']>;
  expiry?: Maybe<Scalars['BigInt']>;
  status: AuthStatusEnum;
};

export enum AuthStatusEnum {
  Pending = 'Pending',
  Consumed = 'Consumed',
  Rejected = 'Rejected',
  Revoked = 'Revoked',
  Expired = 'Expired',
}

export type VoteResult = {
  __typename?: 'VoteResult';
  ayes: Array<Scalars['String']>;
  nays: Array<Scalars['String']>;
};

export type Proposal = {
  __typename?: 'Proposal';
  pipId: Scalars['Int'];
  proposer: Scalars['String'];
  createdAt: Scalars['Int'];
  url: Scalars['String'];
  description: Scalars['String'];
  coolOffEndBlock: Scalars['Int'];
  endBlock: Scalars['Int'];
  proposal?: Maybe<Scalars['String']>;
  lastState: ProposalState;
  lastStateUpdatedAt: Scalars['Int'];
  totalVotes: Scalars['Int'];
  totalAyesWeight: Scalars['BigInt'];
  totalNaysWeight: Scalars['BigInt'];
};

export enum ProposalState {
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  Killed = 'Killed',
  Rejected = 'Rejected',
  Referendum = 'Referendum',
}

export type ProposalOrderByInput = {
  field: ProposalOrderFields;
  order: Order;
};

export enum ProposalOrderFields {
  CreatedAt = 'createdAt',
  EndBlock = 'endBlock',
  LastState = 'lastState',
  TotalVotes = 'totalVotes',
}

export type ProposalVotesOrderByInput = {
  field: ProposalVotesOrderFields;
  order: Order;
};

export enum ProposalVotesOrderFields {
  BlockId = 'block_id',
  Vote = 'vote',
  Weight = 'weight',
}

export type ProposalVote = {
  __typename?: 'ProposalVote';
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  account: Scalars['String'];
  vote: Scalars['CustomBoolean'];
  weight: Scalars['BigInt'];
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}
