export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1.  */
  BigInt: any;
  /** Converts strings into boolean */
  CustomBoolean: boolean;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: string;
  Object: any;
};

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

export type AgentAdded = AgentHistoryEvent & {
  __typename?: 'AgentAdded';
  datetime: Scalars['DateTime'];
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
  permissions: ExtrinsicPermissions;
};

export type AgentHistory = {
  __typename?: 'AgentHistory';
  did: Scalars['String'];
  history: Array<AgentHistoryEvent>;
};

export type AgentHistoryEvent = {
  datetime: Scalars['DateTime'];
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
};

export type AgentPermissionsChanged = AgentHistoryEvent & {
  __typename?: 'AgentPermissionsChanged';
  datetime: Scalars['DateTime'];
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
  permissions: ExtrinsicPermissions;
};

export type AgentRemoved = AgentHistoryEvent & {
  __typename?: 'AgentRemoved';
  datetime: Scalars['DateTime'];
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
};

export type AggregatedInvestment = {
  __typename?: 'AggregatedInvestment';
  investor: Scalars['String'];
  offeringToken: Scalars['String'];
  raiseToken: Scalars['String'];
  offeringTokenAmount: Scalars['BigInt'];
  raiseTokenAmount: Scalars['BigInt'];
};

export type AggregatedInvestmentResult = {
  __typename?: 'AggregatedInvestmentResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<AggregatedInvestment>>>;
};

export enum AuthStatusEnum {
  Pending = 'Pending',
  Consumed = 'Consumed',
  Rejected = 'Rejected',
  Revoked = 'Revoked',
  Expired = 'Expired',
}

export enum AuthTypeEnum {
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  RotatePrimaryKey = 'RotatePrimaryKey',
  RotatePrimaryKeyToSecondary = 'RotatePrimaryKeyToSecondary',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  JoinIdentity = 'JoinIdentity',
  PortfolioCustody = 'PortfolioCustody',
  BecomeAgent = 'BecomeAgent',
  AddRelayerPayingKey = 'AddRelayerPayingKey',
  TransferPrimaryIssuanceAgent = 'TransferPrimaryIssuanceAgent',
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
  count_extrinsics_error?: Maybe<Scalars['Int']>;
  count_extrinsics_signed?: Maybe<Scalars['Int']>;
  count_extrinsics_success?: Maybe<Scalars['Int']>;
  count_extrinsics_unsigned?: Maybe<Scalars['Int']>;
  datetime: Scalars['DateTime'];
  parentBlock?: Maybe<Block>;
  events?: Maybe<Array<Maybe<Event>>>;
  extrinsics?: Maybe<Array<Maybe<Extrinsic>>>;
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
  inherents?: Maybe<Array<Maybe<Extrinsic>>>;
};

export type CaId = {
  ticker: Scalars['String'];
  localId: Scalars['Int'];
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

export enum CallIdEnum {
  FillBlock = 'fill_block',
  Remark = 'remark',
  SetHeapPages = 'set_heap_pages',
  SetCode = 'set_code',
  SetCodeWithoutChecks = 'set_code_without_checks',
  SetStorage = 'set_storage',
  KillStorage = 'kill_storage',
  KillPrefix = 'kill_prefix',
  RemarkWithEvent = 'remark_with_event',
  ReportEquivocation = 'report_equivocation',
  ReportEquivocationUnsigned = 'report_equivocation_unsigned',
  PlanConfigChange = 'plan_config_change',
  Set = 'set',
  Claim = 'claim',
  Transfer = 'transfer',
  Free = 'free',
  ForceTransfer = 'force_transfer',
  Freeze = 'freeze',
  SetUncles = 'set_uncles',
  TransferWithMemo = 'transfer_with_memo',
  DepositBlockRewardReserveBalance = 'deposit_block_reward_reserve_balance',
  SetBalance = 'set_balance',
  BurnAccountBalance = 'burn_account_balance',
  CddRegisterDid = 'cdd_register_did',
  InvalidateCddClaims = 'invalidate_cdd_claims',
  RemoveSecondaryKeysOld = 'remove_secondary_keys_old',
  AcceptPrimaryKey = 'accept_primary_key',
  ChangeCddRequirementForMkRotation = 'change_cdd_requirement_for_mk_rotation',
  JoinIdentityAsKey = 'join_identity_as_key',
  LeaveIdentityAsKey = 'leave_identity_as_key',
  AddClaim = 'add_claim',
  RevokeClaim = 'revoke_claim',
  SetPermissionToSigner = 'set_permission_to_signer',
  PlaceholderLegacySetPermissionToSigner = 'placeholder_legacy_set_permission_to_signer',
  FreezeSecondaryKeys = 'freeze_secondary_keys',
  UnfreezeSecondaryKeys = 'unfreeze_secondary_keys',
  AddAuthorization = 'add_authorization',
  RemoveAuthorization = 'remove_authorization',
  AddSecondaryKeysWithAuthorizationOld = 'add_secondary_keys_with_authorization_old',
  AddInvestorUniquenessClaim = 'add_investor_uniqueness_claim',
  GcAddCddClaim = 'gc_add_cdd_claim',
  GcRevokeCddClaim = 'gc_revoke_cdd_claim',
  AddInvestorUniquenessClaimV2 = 'add_investor_uniqueness_claim_v2',
  RevokeClaimByIndex = 'revoke_claim_by_index',
  RotatePrimaryKeyToSecondary = 'rotate_primary_key_to_secondary',
  AddSecondaryKeysWithAuthorization = 'add_secondary_keys_with_authorization',
  SetSecondaryKeyPermissions = 'set_secondary_key_permissions',
  RemoveSecondaryKeys = 'remove_secondary_keys',
  SetActiveMembersLimit = 'set_active_members_limit',
  DisableMember = 'disable_member',
  AddMember = 'add_member',
  RemoveMember = 'remove_member',
  SwapMember = 'swap_member',
  ResetMembers = 'reset_members',
  AbdicateMembership = 'abdicate_membership',
  SetVoteThreshold = 'set_vote_threshold',
  SetReleaseCoordinator = 'set_release_coordinator',
  SetExpiresAfter = 'set_expires_after',
  VoteOrPropose = 'vote_or_propose',
  Vote = 'vote',
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
  MakeMultisigSecondary = 'make_multisig_secondary',
  MakeMultisigPrimary = 'make_multisig_primary',
  ExecuteScheduledProposal = 'execute_scheduled_proposal',
  ChangeController = 'change_controller',
  ChangeAdmin = 'change_admin',
  ChangeTimelock = 'change_timelock',
  ChangeBridgeLimit = 'change_bridge_limit',
  ChangeBridgeExempted = 'change_bridge_exempted',
  ForceHandleBridgeTx = 'force_handle_bridge_tx',
  BatchProposeBridgeTx = 'batch_propose_bridge_tx',
  ProposeBridgeTx = 'propose_bridge_tx',
  HandleBridgeTx = 'handle_bridge_tx',
  FreezeTxs = 'freeze_txs',
  UnfreezeTxs = 'unfreeze_txs',
  HandleScheduledBridgeTx = 'handle_scheduled_bridge_tx',
  AddFreezeAdmin = 'add_freeze_admin',
  RemoveFreezeAdmin = 'remove_freeze_admin',
  RemoveTxs = 'remove_txs',
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
  SetCommissionCap = 'set_commission_cap',
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
  PayoutStakersBySystem = 'payout_stakers_by_system',
  ChangeSlashingAllowedFor = 'change_slashing_allowed_for',
  UpdatePermissionedValidatorIntendedCount = 'update_permissioned_validator_intended_count',
  SetKeys = 'set_keys',
  PurgeKeys = 'purge_keys',
  NoteStalled = 'note_stalled',
  Heartbeat = 'heartbeat',
  Sudo = 'sudo',
  SudoUncheckedWeight = 'sudo_unchecked_weight',
  SetKey = 'set_key',
  SudoAs = 'sudo_as',
  RegisterTicker = 'register_ticker',
  AcceptTickerTransfer = 'accept_ticker_transfer',
  AcceptAssetOwnershipTransfer = 'accept_asset_ownership_transfer',
  CreateAsset = 'create_asset',
  Unfreeze = 'unfreeze',
  RenameAsset = 'rename_asset',
  Issue = 'issue',
  Redeem = 'redeem',
  MakeDivisible = 'make_divisible',
  AddDocuments = 'add_documents',
  RemoveDocuments = 'remove_documents',
  SetFundingRound = 'set_funding_round',
  UpdateIdentifiers = 'update_identifiers',
  ClaimClassicTicker = 'claim_classic_ticker',
  ReserveClassicTicker = 'reserve_classic_ticker',
  ControllerTransfer = 'controller_transfer',
  RegisterCustomAssetType = 'register_custom_asset_type',
  CreateAssetWithCustomType = 'create_asset_with_custom_type',
  SetAssetMetadata = 'set_asset_metadata',
  SetAssetMetadataDetails = 'set_asset_metadata_details',
  RegisterAndSetLocalAssetMetadata = 'register_and_set_local_asset_metadata',
  RegisterAssetMetadataLocalType = 'register_asset_metadata_local_type',
  RegisterAssetMetadataGlobalType = 'register_asset_metadata_global_type',
  Distribute = 'distribute',
  PushBenefit = 'push_benefit',
  Reclaim = 'reclaim',
  RemoveDistribution = 'remove_distribution',
  CreateCheckpoint = 'create_checkpoint',
  SetSchedulesMaxComplexity = 'set_schedules_max_complexity',
  CreateSchedule = 'create_schedule',
  RemoveSchedule = 'remove_schedule',
  AddComplianceRequirement = 'add_compliance_requirement',
  RemoveComplianceRequirement = 'remove_compliance_requirement',
  ReplaceAssetCompliance = 'replace_asset_compliance',
  ResetAssetCompliance = 'reset_asset_compliance',
  PauseAssetCompliance = 'pause_asset_compliance',
  ResumeAssetCompliance = 'resume_asset_compliance',
  AddDefaultTrustedClaimIssuer = 'add_default_trusted_claim_issuer',
  RemoveDefaultTrustedClaimIssuer = 'remove_default_trusted_claim_issuer',
  ChangeComplianceRequirement = 'change_compliance_requirement',
  SetMaxDetailsLength = 'set_max_details_length',
  SetDefaultTargets = 'set_default_targets',
  SetDefaultWithholdingTax = 'set_default_withholding_tax',
  SetDidWithholdingTax = 'set_did_withholding_tax',
  InitiateCorporateAction = 'initiate_corporate_action',
  LinkCaDoc = 'link_ca_doc',
  RemoveCa = 'remove_ca',
  ChangeRecordDate = 'change_record_date',
  InitiateCorporateActionAndDistribute = 'initiate_corporate_action_and_distribute',
  AttachBallot = 'attach_ballot',
  ChangeEnd = 'change_end',
  ChangeMeta = 'change_meta',
  ChangeRcv = 'change_rcv',
  RemoveBallot = 'remove_ballot',
  SetPruneHistoricalPips = 'set_prune_historical_pips',
  SetMinProposalDeposit = 'set_min_proposal_deposit',
  SetDefaultEnactmentPeriod = 'set_default_enactment_period',
  SetPendingPipExpiry = 'set_pending_pip_expiry',
  SetMaxPipSkipCount = 'set_max_pip_skip_count',
  SetActivePipLimit = 'set_active_pip_limit',
  Propose = 'propose',
  ApproveCommitteeProposal = 'approve_committee_proposal',
  RejectProposal = 'reject_proposal',
  PruneProposal = 'prune_proposal',
  RescheduleExecution = 'reschedule_execution',
  ClearSnapshot = 'clear_snapshot',
  Snapshot = 'snapshot',
  EnactSnapshotResults = 'enact_snapshot_results',
  ExecuteScheduledPip = 'execute_scheduled_pip',
  ExpireScheduledPip = 'expire_scheduled_pip',
  CreatePortfolio = 'create_portfolio',
  DeletePortfolio = 'delete_portfolio',
  MovePortfolioFunds = 'move_portfolio_funds',
  RenamePortfolio = 'rename_portfolio',
  QuitPortfolioCustody = 'quit_portfolio_custody',
  AcceptPortfolioCustody = 'accept_portfolio_custody',
  ChangeCoefficient = 'change_coefficient',
  ChangeBaseFee = 'change_base_fee',
  Schedule = 'schedule',
  Cancel = 'cancel',
  ScheduleNamed = 'schedule_named',
  CancelNamed = 'cancel_named',
  ScheduleAfter = 'schedule_after',
  ScheduleNamedAfter = 'schedule_named_after',
  CreateVenue = 'create_venue',
  UpdateVenueDetails = 'update_venue_details',
  UpdateVenueType = 'update_venue_type',
  AddInstruction = 'add_instruction',
  AddAndAffirmInstruction = 'add_and_affirm_instruction',
  AffirmInstruction = 'affirm_instruction',
  WithdrawAffirmation = 'withdraw_affirmation',
  RejectInstruction = 'reject_instruction',
  AffirmWithReceipts = 'affirm_with_receipts',
  ClaimReceipt = 'claim_receipt',
  UnclaimReceipt = 'unclaim_receipt',
  SetVenueFiltering = 'set_venue_filtering',
  AllowVenues = 'allow_venues',
  DisallowVenues = 'disallow_venues',
  ChangeReceiptValidity = 'change_receipt_validity',
  ExecuteScheduledInstruction = 'execute_scheduled_instruction',
  RescheduleInstruction = 'reschedule_instruction',
  SetActiveAssetStats = 'set_active_asset_stats',
  BatchUpdateAssetStats = 'batch_update_asset_stats',
  SetAssetTransferCompliance = 'set_asset_transfer_compliance',
  SetEntitiesExempt = 'set_entities_exempt',
  CreateFundraiser = 'create_fundraiser',
  Invest = 'invest',
  FreezeFundraiser = 'freeze_fundraiser',
  UnfreezeFundraiser = 'unfreeze_fundraiser',
  ModifyFundraiserWindow = 'modify_fundraiser_window',
  Stop = 'stop',
  Disbursement = 'disbursement',
  Reimbursement = 'reimbursement',
  Batch = 'batch',
  BatchAtomic = 'batch_atomic',
  BatchOptimistic = 'batch_optimistic',
  RelayTx = 'relay_tx',
  CreateGroup = 'create_group',
  SetGroupPermissions = 'set_group_permissions',
  RemoveAgent = 'remove_agent',
  Abdicate = 'abdicate',
  ChangeGroup = 'change_group',
  AcceptBecomeAgent = 'accept_become_agent',
  CreateGroupAndAddAuth = 'create_group_and_add_auth',
  CreateAndChangeCustomGroup = 'create_and_change_custom_group',
  SetPayingKey = 'set_paying_key',
  AcceptPayingKey = 'accept_paying_key',
  RemovePayingKey = 'remove_paying_key',
  UpdatePolyxLimit = 'update_polyx_limit',
  IncreasePolyxLimit = 'increase_polyx_limit',
  DecreasePolyxLimit = 'decrease_polyx_limit',
  ClaimItnReward = 'claim_itn_reward',
  SetItnRewardStatus = 'set_itn_reward_status',
  Call = 'call',
  InstantiateWithCode = 'instantiate_with_code',
  Instantiate = 'instantiate',
  UploadCode = 'upload_code',
  RemoveCode = 'remove_code',
  InstantiateWithCodePerms = 'instantiate_with_code_perms',
  InstantiateWithHashPerms = 'instantiate_with_hash_perms',
  NotePreimage = 'note_preimage',
  UnnotePreimage = 'unnote_preimage',
  RequestPreimage = 'request_preimage',
  UnrequestPreimage = 'unrequest_preimage',
  RegisterDid = 'register_did',
  MockCddRegisterDid = 'mock_cdd_register_did',
  GetMyDid = 'get_my_did',
  GetCddOf = 'get_cdd_of',
  AcceptAuthorization = 'accept_authorization',
  AcceptMasterKey = 'accept_master_key',
  AcceptPrimaryIssuanceAgentTransfer = 'accept_primary_issuance_agent_transfer',
  AddActiveRule = 'add_active_rule',
  AddAndAuthorizeInstruction = 'add_and_authorize_instruction',
  AddBallot = 'add_ballot',
  AddExtension = 'add_extension',
  AddRangeProof = 'add_range_proof',
  AddTransferManager = 'add_transfer_manager',
  AddVerifyRangeProof = 'add_verify_range_proof',
  AmendProposal = 'amend_proposal',
  Approve = 'approve',
  ArchiveExtension = 'archive_extension',
  AuthorizeInstruction = 'authorize_instruction',
  AuthorizeWithReceipts = 'authorize_with_receipts',
  BatchAcceptAuthorization = 'batch_accept_authorization',
  BatchAddAuthorization = 'batch_add_authorization',
  BatchAddClaim = 'batch_add_claim',
  BatchAddDefaultTrustedClaimIssuer = 'batch_add_default_trusted_claim_issuer',
  BatchAddDocument = 'batch_add_document',
  BatchAddSecondaryKeyWithAuthorization = 'batch_add_secondary_key_with_authorization',
  BatchAddSigningKeyWithAuthorization = 'batch_add_signing_key_with_authorization',
  BatchChangeAssetRule = 'batch_change_asset_rule',
  BatchChangeComplianceRequirement = 'batch_change_compliance_requirement',
  BatchForceHandleBridgeTx = 'batch_force_handle_bridge_tx',
  BatchFreezeTx = 'batch_freeze_tx',
  BatchHandleBridgeTx = 'batch_handle_bridge_tx',
  BatchIssue = 'batch_issue',
  BatchRemoveAuthorization = 'batch_remove_authorization',
  BatchRemoveDefaultTrustedClaimIssuer = 'batch_remove_default_trusted_claim_issuer',
  BatchRemoveDocument = 'batch_remove_document',
  BatchRevokeClaim = 'batch_revoke_claim',
  BatchUnfreezeTx = 'batch_unfreeze_tx',
  BondAdditionalDeposit = 'bond_additional_deposit',
  BuyTokens = 'buy_tokens',
  CancelBallot = 'cancel_ballot',
  CancelProposal = 'cancel_proposal',
  ChangeAllSignersAndSigsRequired = 'change_all_signers_and_sigs_required',
  ChangeAssetRule = 'change_asset_rule',
  ChangeTemplateFees = 'change_template_fees',
  ChangeTemplateMetaUrl = 'change_template_meta_url',
  ClaimSurcharge = 'claim_surcharge',
  ClaimUnclaimed = 'claim_unclaimed',
  Close = 'close',
  ControllerRedeem = 'controller_redeem',
  CreateAssetAndMint = 'create_asset_and_mint',
  EmergencyReferendum = 'emergency_referendum',
  EnableIndividualCommissions = 'enable_individual_commissions',
  EnactReferendum = 'enact_referendum',
  FastTrackProposal = 'fast_track_proposal',
  FinalHint = 'final_hint',
  ForwardedCall = 'forwarded_call',
  FreezeInstantiation = 'freeze_instantiation',
  FreezeSigningKeys = 'freeze_signing_keys',
  IncreaseCustodyAllowance = 'increase_custody_allowance',
  IncreaseCustodyAllowanceOf = 'increase_custody_allowance_of',
  IsIssuable = 'is_issuable',
  JoinIdentityAsIdentity = 'join_identity_as_identity',
  KillProposal = 'kill_proposal',
  LaunchSto = 'launch_sto',
  LeaveIdentityAsIdentity = 'leave_identity_as_identity',
  LegacySetPermissionToSigner = 'legacy_set_permission_to_signer',
  MakeMultisigSigner = 'make_multisig_signer',
  ModifyExemptionList = 'modify_exemption_list',
  New = 'new',
  OverrideReferendumEnactmentPeriod = 'override_referendum_enactment_period',
  PauseAssetRules = 'pause_asset_rules',
  PauseSto = 'pause_sto',
  PutCode = 'put_code',
  RedeemFrom = 'redeem_from',
  RejectReferendum = 'reject_referendum',
  RemoveActiveRule = 'remove_active_rule',
  RemoveExemptedEntities = 'remove_exempted_entities',
  RemovePrimaryIssuanceAgent = 'remove_primary_issuance_agent',
  RemoveSigningKeys = 'remove_signing_keys',
  RemoveSmartExtension = 'remove_smart_extension',
  RemoveTransferManager = 'remove_transfer_manager',
  ReplaceAssetRules = 'replace_asset_rules',
  ResetActiveRules = 'reset_active_rules',
  ResetCaa = 'reset_caa',
  ResumeAssetRules = 'resume_asset_rules',
  RevokeOffchainAuthorization = 'revoke_offchain_authorization',
  SetChangesTrieConfig = 'set_changes_trie_config',
  SetGlobalCommission = 'set_global_commission',
  SetMasterKey = 'set_master_key',
  SetPrimaryKey = 'set_primary_key',
  SetProposalCoolOffPeriod = 'set_proposal_cool_off_period',
  SetProposalDuration = 'set_proposal_duration',
}

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

export enum ClaimScopeTypeEnum {
  Identity = 'Identity',
  Ticker = 'Ticker',
  Custom = 'Custom',
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
  InvestorUniqueness = 'InvestorUniqueness',
  NoData = 'NoData',
  InvestorUniquenessV2 = 'InvestorUniquenessV2',
}

export type CorporateActionsWithCaId = {
  __typename?: 'CorporateActionsWithCAId';
  eventId: Scalars['String'];
  datetime: Scalars['DateTime'];
  identityId?: Maybe<Scalars['String']>;
  eventDid?: Maybe<Scalars['String']>;
  ticker: Scalars['String'];
  localId: Scalars['Int'];
  arg?: Maybe<Scalars['String']>;
};

export type CorporateActionsWithCaIdResult = {
  __typename?: 'CorporateActionsWithCAIdResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<CorporateActionsWithCaId>>>;
};

export type CorporateActionsWithTicker = {
  __typename?: 'CorporateActionsWithTicker';
  eventId: Scalars['String'];
  datetime: Scalars['DateTime'];
  identityId: Scalars['String'];
  ticker: Scalars['String'];
  arg1?: Maybe<Scalars['String']>;
  arg2?: Maybe<Scalars['String']>;
};

export type CorporateActionsWithTickerResult = {
  __typename?: 'CorporateActionsWithTickerResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<CorporateActionsWithTicker>>>;
};

export type DidItnRewardActions = {
  __typename?: 'DidItnRewardActions';
  did: Scalars['String'];
  total: Scalars['Int'];
  rank: Scalars['Int'];
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<ItnRewardAction>>>;
};

export type DispatchableNames =
  | WholeDispatchableNames
  | TheseDispatchableNames
  | ExceptDispatchableNames;

export type Event = {
  __typename?: 'Event';
  /** Blockchain event */
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
  extrinsic_idx?: Maybe<Scalars['Int']>;
  spec_version_id?: Maybe<Scalars['Int']>;
  module_id?: Maybe<ModuleIdEnum>;
  event_id?: Maybe<EventIdEnum>;
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

export enum EventIdEnum {
  ExtrinsicSuccess = 'ExtrinsicSuccess',
  ExtrinsicFailed = 'ExtrinsicFailed',
  CodeUpdated = 'CodeUpdated',
  NewAccount = 'NewAccount',
  KilledAccount = 'KilledAccount',
  Remarked = 'Remarked',
  IndexAssigned = 'IndexAssigned',
  IndexFreed = 'IndexFreed',
  IndexFrozen = 'IndexFrozen',
  Endowed = 'Endowed',
  BalanceSet = 'BalanceSet',
  AccountBalanceBurned = 'AccountBalanceBurned',
  Reserved = 'Reserved',
  Unreserved = 'Unreserved',
  ReserveRepatriated = 'ReserveRepatriated',
  DidCreated = 'DidCreated',
  SecondaryKeysAdded = 'SecondaryKeysAdded',
  SecondaryKeysRemoved = 'SecondaryKeysRemoved',
  SecondaryKeyLeftIdentity = 'SecondaryKeyLeftIdentity',
  SecondaryKeyPermissionsUpdated = 'SecondaryKeyPermissionsUpdated',
  PrimaryKeyUpdated = 'PrimaryKeyUpdated',
  ClaimAdded = 'ClaimAdded',
  ClaimRevoked = 'ClaimRevoked',
  AssetDidRegistered = 'AssetDidRegistered',
  AuthorizationAdded = 'AuthorizationAdded',
  AuthorizationRevoked = 'AuthorizationRevoked',
  AuthorizationRejected = 'AuthorizationRejected',
  AuthorizationConsumed = 'AuthorizationConsumed',
  AuthorizationRetryLimitReached = 'AuthorizationRetryLimitReached',
  CddRequirementForPrimaryKeyUpdated = 'CddRequirementForPrimaryKeyUpdated',
  CddClaimsInvalidated = 'CddClaimsInvalidated',
  SecondaryKeysFrozen = 'SecondaryKeysFrozen',
  SecondaryKeysUnfrozen = 'SecondaryKeysUnfrozen',
  Proposed = 'Proposed',
  VoteRetracted = 'VoteRetracted',
  FinalVotes = 'FinalVotes',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Executed = 'Executed',
  ReleaseCoordinatorUpdated = 'ReleaseCoordinatorUpdated',
  ExpiresAfterUpdated = 'ExpiresAfterUpdated',
  VoteThresholdUpdated = 'VoteThresholdUpdated',
  MemberAdded = 'MemberAdded',
  MemberRemoved = 'MemberRemoved',
  MemberRevoked = 'MemberRevoked',
  MembersSwapped = 'MembersSwapped',
  MembersReset = 'MembersReset',
  ActiveLimitChanged = 'ActiveLimitChanged',
  Dummy = 'Dummy',
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
  ProposalExecutionFailed = 'ProposalExecutionFailed',
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
  BridgeTxScheduleFailed = 'BridgeTxScheduleFailed',
  FreezeAdminAdded = 'FreezeAdminAdded',
  FreezeAdminRemoved = 'FreezeAdminRemoved',
  TxRemoved = 'TxRemoved',
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
  PermissionedIdentityAdded = 'PermissionedIdentityAdded',
  PermissionedIdentityRemoved = 'PermissionedIdentityRemoved',
  InvalidatedNominators = 'InvalidatedNominators',
  CommissionCapUpdated = 'CommissionCapUpdated',
  MinimumBondThresholdUpdated = 'MinimumBondThresholdUpdated',
  RewardPaymentSchedulingInterrupted = 'RewardPaymentSchedulingInterrupted',
  SlashingAllowedForChanged = 'SlashingAllowedForChanged',
  Offence = 'Offence',
  NewSession = 'NewSession',
  NewAuthorities = 'NewAuthorities',
  Paused = 'Paused',
  Resumed = 'Resumed',
  HeartbeatReceived = 'HeartbeatReceived',
  AllGood = 'AllGood',
  SomeOffline = 'SomeOffline',
  Sudid = 'Sudid',
  KeyChanged = 'KeyChanged',
  SudoAsDone = 'SudoAsDone',
  Transfer = 'Transfer',
  Issued = 'Issued',
  Redeemed = 'Redeemed',
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
  DocumentAdded = 'DocumentAdded',
  DocumentRemoved = 'DocumentRemoved',
  ExtensionRemoved = 'ExtensionRemoved',
  ClassicTickerClaimed = 'ClassicTickerClaimed',
  ControllerTransfer = 'ControllerTransfer',
  CustomAssetTypeExists = 'CustomAssetTypeExists',
  CustomAssetTypeRegistered = 'CustomAssetTypeRegistered',
  SetAssetMetadataValue = 'SetAssetMetadataValue',
  SetAssetMetadataValueDetails = 'SetAssetMetadataValueDetails',
  RegisterAssetMetadataLocalType = 'RegisterAssetMetadataLocalType',
  RegisterAssetMetadataGlobalType = 'RegisterAssetMetadataGlobalType',
  Created = 'Created',
  BenefitClaimed = 'BenefitClaimed',
  Reclaimed = 'Reclaimed',
  Removed = 'Removed',
  CheckpointCreated = 'CheckpointCreated',
  MaximumSchedulesComplexityChanged = 'MaximumSchedulesComplexityChanged',
  ScheduleCreated = 'ScheduleCreated',
  ScheduleRemoved = 'ScheduleRemoved',
  ComplianceRequirementCreated = 'ComplianceRequirementCreated',
  ComplianceRequirementRemoved = 'ComplianceRequirementRemoved',
  AssetComplianceReplaced = 'AssetComplianceReplaced',
  AssetComplianceReset = 'AssetComplianceReset',
  AssetComplianceResumed = 'AssetComplianceResumed',
  AssetCompliancePaused = 'AssetCompliancePaused',
  ComplianceRequirementChanged = 'ComplianceRequirementChanged',
  TrustedDefaultClaimIssuerAdded = 'TrustedDefaultClaimIssuerAdded',
  TrustedDefaultClaimIssuerRemoved = 'TrustedDefaultClaimIssuerRemoved',
  MaxDetailsLengthChanged = 'MaxDetailsLengthChanged',
  DefaultTargetIdentitiesChanged = 'DefaultTargetIdentitiesChanged',
  DefaultWithholdingTaxChanged = 'DefaultWithholdingTaxChanged',
  DidWithholdingTaxChanged = 'DidWithholdingTaxChanged',
  CaaTransferred = 'CAATransferred',
  CaInitiated = 'CAInitiated',
  CaLinkedToDoc = 'CALinkedToDoc',
  CaRemoved = 'CARemoved',
  RecordDateChanged = 'RecordDateChanged',
  VoteCast = 'VoteCast',
  RangeChanged = 'RangeChanged',
  MetaChanged = 'MetaChanged',
  RcvChanged = 'RCVChanged',
  HistoricalPipsPruned = 'HistoricalPipsPruned',
  ProposalCreated = 'ProposalCreated',
  ProposalStateUpdated = 'ProposalStateUpdated',
  Voted = 'Voted',
  PipClosed = 'PipClosed',
  ExecutionScheduled = 'ExecutionScheduled',
  DefaultEnactmentPeriodChanged = 'DefaultEnactmentPeriodChanged',
  MinimumProposalDepositChanged = 'MinimumProposalDepositChanged',
  PendingPipExpiryChanged = 'PendingPipExpiryChanged',
  MaxPipSkipCountChanged = 'MaxPipSkipCountChanged',
  ActivePipLimitChanged = 'ActivePipLimitChanged',
  ProposalRefund = 'ProposalRefund',
  SnapshotCleared = 'SnapshotCleared',
  SnapshotTaken = 'SnapshotTaken',
  PipSkipped = 'PipSkipped',
  SnapshotResultsEnacted = 'SnapshotResultsEnacted',
  ExecutionSchedulingFailed = 'ExecutionSchedulingFailed',
  ExpiryScheduled = 'ExpiryScheduled',
  ExpirySchedulingFailed = 'ExpirySchedulingFailed',
  ExecutionCancellingFailed = 'ExecutionCancellingFailed',
  PortfolioCreated = 'PortfolioCreated',
  PortfolioDeleted = 'PortfolioDeleted',
  MovedBetweenPortfolios = 'MovedBetweenPortfolios',
  PortfolioRenamed = 'PortfolioRenamed',
  UserPortfolios = 'UserPortfolios',
  PortfolioCustodianChanged = 'PortfolioCustodianChanged',
  FeeSet = 'FeeSet',
  CoefficientSet = 'CoefficientSet',
  FeeCharged = 'FeeCharged',
  Scheduled = 'Scheduled',
  Canceled = 'Canceled',
  Dispatched = 'Dispatched',
  CallLookupFailed = 'CallLookupFailed',
  VenueCreated = 'VenueCreated',
  VenueDetailsUpdated = 'VenueDetailsUpdated',
  VenueTypeUpdated = 'VenueTypeUpdated',
  InstructionAuthorized = 'InstructionAuthorized',
  InstructionUnauthorized = 'InstructionUnauthorized',
  InstructionCreated = 'InstructionCreated',
  InstructionAffirmed = 'InstructionAffirmed',
  AffirmationWithdrawn = 'AffirmationWithdrawn',
  InstructionRejected = 'InstructionRejected',
  ReceiptClaimed = 'ReceiptClaimed',
  ReceiptValidityChanged = 'ReceiptValidityChanged',
  ReceiptUnclaimed = 'ReceiptUnclaimed',
  VenueFiltering = 'VenueFiltering',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
  LegFailedExecution = 'LegFailedExecution',
  InstructionFailed = 'InstructionFailed',
  InstructionExecuted = 'InstructionExecuted',
  VenueUnauthorized = 'VenueUnauthorized',
  SchedulingFailed = 'SchedulingFailed',
  InstructionRescheduled = 'InstructionRescheduled',
  TransferManagerAdded = 'TransferManagerAdded',
  TransferManagerRemoved = 'TransferManagerRemoved',
  ExemptionsAdded = 'ExemptionsAdded',
  ExemptionsRemoved = 'ExemptionsRemoved',
  StatTypesAdded = 'StatTypesAdded',
  StatTypesRemoved = 'StatTypesRemoved',
  AssetStatsUpdated = 'AssetStatsUpdated',
  SetAssetTransferCompliance = 'SetAssetTransferCompliance',
  TransferConditionExemptionsAdded = 'TransferConditionExemptionsAdded',
  TransferConditionExemptionsRemoved = 'TransferConditionExemptionsRemoved',
  FundraiserCreated = 'FundraiserCreated',
  Invested = 'Invested',
  FundraiserFrozen = 'FundraiserFrozen',
  FundraiserUnfrozen = 'FundraiserUnfrozen',
  FundraiserWindowModified = 'FundraiserWindowModified',
  FundraiserClosed = 'FundraiserClosed',
  TreasuryDisbursement = 'TreasuryDisbursement',
  TreasuryDisbursementFailed = 'TreasuryDisbursementFailed',
  TreasuryReimbursement = 'TreasuryReimbursement',
  BatchInterrupted = 'BatchInterrupted',
  BatchOptimisticFailed = 'BatchOptimisticFailed',
  BatchCompleted = 'BatchCompleted',
  UnexpectedError = 'UnexpectedError',
  GroupCreated = 'GroupCreated',
  GroupPermissionsUpdated = 'GroupPermissionsUpdated',
  AgentAdded = 'AgentAdded',
  AgentRemoved = 'AgentRemoved',
  GroupChanged = 'GroupChanged',
  AuthorizedPayingKey = 'AuthorizedPayingKey',
  AcceptedPayingKey = 'AcceptedPayingKey',
  RemovedPayingKey = 'RemovedPayingKey',
  UpdatedPolyxLimit = 'UpdatedPolyxLimit',
  ItnRewardClaimed = 'ItnRewardClaimed',
  Instantiated = 'Instantiated',
  Terminated = 'Terminated',
  CodeStored = 'CodeStored',
  ContractEmitted = 'ContractEmitted',
  CodeRemoved = 'CodeRemoved',
  ContractCodeUpdated = 'ContractCodeUpdated',
  Noted = 'Noted',
  Requested = 'Requested',
  Cleared = 'Cleared',
  MockInvestorUidCreated = 'MockInvestorUIDCreated',
  DidStatus = 'DidStatus',
  CddStatus = 'CddStatus',
  Approval = 'Approval',
  AssetPurchased = 'AssetPurchased',
  AssetRuleChanged = 'AssetRuleChanged',
  AssetRuleRemoved = 'AssetRuleRemoved',
  AssetRulesPaused = 'AssetRulesPaused',
  AssetRulesReplaced = 'AssetRulesReplaced',
  AssetRulesReset = 'AssetRulesReset',
  AssetRulesResumed = 'AssetRulesResumed',
  BallotCancelled = 'BallotCancelled',
  BallotCreated = 'BallotCreated',
  CddRequirementForMasterKeyUpdated = 'CddRequirementForMasterKeyUpdated',
  Closed = 'Closed',
  ContractExecution = 'ContractExecution',
  ControllerRedemption = 'ControllerRedemption',
  CustodyAllowanceChanged = 'CustodyAllowanceChanged',
  CustodyTransfer = 'CustodyTransfer',
  DividendCanceled = 'DividendCanceled',
  DividendCreated = 'DividendCreated',
  DividendPaidOutToUser = 'DividendPaidOutToUser',
  DividendRemainingClaimed = 'DividendRemainingClaimed',
  Evicted = 'Evicted',
  ExemptionListModified = 'ExemptionListModified',
  ExtensionAdded = 'ExtensionAdded',
  ExtensionArchived = 'ExtensionArchived',
  ExtensionUnArchive = 'ExtensionUnArchive',
  FundraiserWindowModifed = 'FundraiserWindowModifed',
  FundsRaised = 'FundsRaised',
  GlobalCommissionUpdated = 'GlobalCommissionUpdated',
  IndividualCommissionEnabled = 'IndividualCommissionEnabled',
  InstantiationFeeChanged = 'InstantiationFeeChanged',
  InstantiationFreezed = 'InstantiationFreezed',
  InstantiationUnFreezed = 'InstantiationUnFreezed',
  InvestorUniquenessClaimNotAllowed = 'InvestorUniquenessClaimNotAllowed',
  MasterKeyUpdated = 'MasterKeyUpdated',
  NewAssetRuleCreated = 'NewAssetRuleCreated',
  OffChainAuthorizationRevoked = 'OffChainAuthorizationRevoked',
  PermissionedValidatorAdded = 'PermissionedValidatorAdded',
  PermissionedValidatorRemoved = 'PermissionedValidatorRemoved',
  PermissionedValidatorStatusChanged = 'PermissionedValidatorStatusChanged',
  PrimaryIssuanceAgentTransfered = 'PrimaryIssuanceAgentTransfered',
  PrimaryIssuanceAgentTransferred = 'PrimaryIssuanceAgentTransferred',
  ProposalBondAdjusted = 'ProposalBondAdjusted',
  ProposalCoolOffPeriodChanged = 'ProposalCoolOffPeriodChanged',
  ProposalDetailsAmended = 'ProposalDetailsAmended',
  ProposalDurationChanged = 'ProposalDurationChanged',
  PutCodeFlagChanged = 'PutCodeFlagChanged',
  QuorumThresholdChanged = 'QuorumThresholdChanged',
  RangeProofAdded = 'RangeProofAdded',
  RangeProofVerified = 'RangeProofVerified',
  ReferendumCreated = 'ReferendumCreated',
  ReferendumScheduled = 'ReferendumScheduled',
  ReferendumStateUpdated = 'ReferendumStateUpdated',
  Restored = 'Restored',
  ScheduleUpdated = 'ScheduleUpdated',
  SecondaryPermissionsUpdated = 'SecondaryPermissionsUpdated',
  SignerLeft = 'SignerLeft',
  SigningKeysAdded = 'SigningKeysAdded',
  SigningKeysFrozen = 'SigningKeysFrozen',
  SigningKeysRemoved = 'SigningKeysRemoved',
  SigningKeysUnfrozen = 'SigningKeysUnfrozen',
  SigningPermissionsUpdated = 'SigningPermissionsUpdated',
  SlashingParamsUpdated = 'SlashingParamsUpdated',
  TemplateInstantiationFeeChanged = 'TemplateInstantiationFeeChanged',
  TemplateMetaUrlChanged = 'TemplateMetaUrlChanged',
  TemplateOwnershipTransferred = 'TemplateOwnershipTransferred',
  TemplateUsageFeeChanged = 'TemplateUsageFeeChanged',
  TreasuryDidSet = 'TreasuryDidSet',
  VenueUpdated = 'VenueUpdated',
  VoteEnactReferendum = 'VoteEnactReferendum',
  VoteRejectReferendum = 'VoteRejectReferendum',
}

export type ExceptDispatchableNames = {
  __typename?: 'ExceptDispatchableNames';
  Except: Array<Scalars['String']>;
};

export type ExceptExtrinsicPermissions = {
  __typename?: 'ExceptExtrinsicPermissions';
  Except: Array<PalletPermissions>;
};

export type Extrinsic = {
  __typename?: 'Extrinsic';
  /** Extrinsic details */
  block_id: Scalars['Int'];
  nonce?: Maybe<Scalars['Int']>;
  extrinsic_hash?: Maybe<Scalars['String']>;
  extrinsic_idx: Scalars['Int'];
  signed?: Maybe<Scalars['Int']>;
  address?: Maybe<Scalars['String']>;
  module_id: ModuleIdEnum;
  call_id: CallIdEnum;
  params: Array<Maybe<Scalars['Object']>>;
  success: Scalars['Int'];
  spec_version_id: Scalars['Int'];
  signedby_address: Scalars['Int'];
  block?: Maybe<Block>;
};

export type ExtrinsicPermissions =
  | WholeExtrinsicPermissions
  | TheseExtrinsicPermissions
  | ExceptExtrinsicPermissions;

export type ExtrinsicResult = {
  __typename?: 'ExtrinsicResult';
  totalCount: Scalars['Int'];
  items: Array<Extrinsic>;
};

export type FailedBlocksResult = {
  __typename?: 'FailedBlocksResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<Scalars['Int']>>>;
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

export type Funding = {
  __typename?: 'Funding';
  /** Funding */
  block_id: Scalars['Int'];
  fundingName: Scalars['String'];
  value: Scalars['String'];
  totalIssuedInFundingRound: Scalars['String'];
};

export type FundingResults = {
  __typename?: 'FundingResults';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<Funding>>>;
};

export type HistoryOfPaymentEventsForCa = {
  __typename?: 'HistoryOfPaymentEventsForCA';
  blockId: Scalars['Int'];
  eventId: Scalars['String'];
  eventIdx: Scalars['Int'];
  eventDid: Scalars['String'];
  datetime: Scalars['DateTime'];
  ticker: Scalars['String'];
  localId: Scalars['Int'];
  balance: Scalars['Float'];
  tax: Scalars['Int'];
};

export type HistoryOfPaymentEventsForCaResults = {
  __typename?: 'HistoryOfPaymentEventsForCAResults';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<HistoryOfPaymentEventsForCa>>>;
};

export type IdentityWithClaims = {
  __typename?: 'IdentityWithClaims';
  did: Scalars['String'];
  claims: Array<Claim>;
};

export type IdentityWithClaimsResult = {
  __typename?: 'IdentityWithClaimsResult';
  totalCount: Scalars['Int'];
  items: Array<IdentityWithClaims>;
};

export type InstructionIdsForVenueResults = {
  __typename?: 'InstructionIdsForVenueResults';
  items?: Maybe<Array<Scalars['Int']>>;
};

export type Investment = {
  __typename?: 'Investment';
  investor: Scalars['String'];
  offeringToken: Scalars['String'];
  raiseToken: Scalars['String'];
  offeringTokenAmount: Scalars['BigInt'];
  raiseTokenAmount: Scalars['BigInt'];
  datetime: Scalars['DateTime'];
};

export type InvestmentResult = {
  __typename?: 'InvestmentResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<Investment>>>;
};

export type ItnRewardAction = {
  __typename?: 'ItnRewardAction';
  datetime: Scalars['String'];
  blockId: Scalars['Int'];
  action: ItnRewardActionType;
  points: Scalars['Int'];
};

export enum ItnRewardActionType {
  Staking = 'Staking',
  Onboarding = 'Onboarding',
  PolyxTransfer = 'PolyxTransfer',
  SecondaryKey = 'SecondaryKey',
  ReserveTokenTicker = 'ReserveTokenTicker',
  SecurityToken = 'SecurityToken',
  ComplianceRequirement = 'ComplianceRequirement',
  TrustedDefaultClaimIssuerAdded = 'TrustedDefaultClaimIssuerAdded',
  ClaimAdded = 'ClaimAdded',
  DistributeAnAsset = 'DistributeAnAsset',
  AcceptATransferFromAnotherUser = 'AcceptATransferFromAnotherUser',
  ConfigureAdvancedTokenRules = 'ConfigureAdvancedTokenRules',
  CreateSto = 'CreateSTO',
  FindInvestors = 'FindInvestors',
  PortfolioCreated = 'PortfolioCreated',
  AddAssetToAPortfolio = 'AddAssetToAPortfolio',
  AddAPortfolioManager = 'AddAPortfolioManager',
  TransferAssetFromPortfolio = 'TransferAssetFromPortfolio',
  StopStakingAPortion = 'StopStakingAPortion',
  StopStakingAnOperator = 'StopStakingAnOperator',
  StartStakingANewOperator = 'StartStakingANewOperator',
  CreateACorporateAction = 'CreateACorporateAction',
  DistributeADividend = 'DistributeADividend',
  AcceptADividend = 'AcceptADividend',
  CreatePip = 'CreatePip',
  VoteOnPip = 'VoteOnPip',
}

export type ItnRewardRanking = {
  __typename?: 'ItnRewardRanking';
  did: Scalars['String'];
  total: Scalars['Int'];
  rank: Scalars['Int'];
};

export type ItnRewardRankingResult = {
  __typename?: 'ItnRewardRankingResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<ItnRewardRanking>>>;
};

export enum ModuleIdEnum {
  System = 'system',
  Babe = 'babe',
  Timestamp = 'timestamp',
  Indices = 'indices',
  Authorship = 'authorship',
  Balances = 'balances',
  Transactionpayment = 'transactionpayment',
  Identity = 'identity',
  Cddserviceproviders = 'cddserviceproviders',
  Polymeshcommittee = 'polymeshcommittee',
  Committeemembership = 'committeemembership',
  Technicalcommittee = 'technicalcommittee',
  Technicalcommitteemembership = 'technicalcommitteemembership',
  Upgradecommittee = 'upgradecommittee',
  Upgradecommitteemembership = 'upgradecommitteemembership',
  Multisig = 'multisig',
  Bridge = 'bridge',
  Staking = 'staking',
  Offences = 'offences',
  Session = 'session',
  Authoritydiscovery = 'authoritydiscovery',
  Grandpa = 'grandpa',
  Historical = 'historical',
  Imonline = 'imonline',
  Randomnesscollectiveflip = 'randomnesscollectiveflip',
  Sudo = 'sudo',
  Asset = 'asset',
  Capitaldistribution = 'capitaldistribution',
  Checkpoint = 'checkpoint',
  Compliancemanager = 'compliancemanager',
  Corporateaction = 'corporateaction',
  Corporateballot = 'corporateballot',
  Permissions = 'permissions',
  Pips = 'pips',
  Portfolio = 'portfolio',
  Protocolfee = 'protocolfee',
  Scheduler = 'scheduler',
  Settlement = 'settlement',
  Statistics = 'statistics',
  Sto = 'sto',
  Treasury = 'treasury',
  Utility = 'utility',
  Base = 'base',
  Externalagents = 'externalagents',
  Relayer = 'relayer',
  Rewards = 'rewards',
  Contracts = 'contracts',
  Polymeshcontracts = 'polymeshcontracts',
  Preimage = 'preimage',
  Testutils = 'testutils',
  Confidential = 'confidential',
  Dividend = 'dividend',
  Exemption = 'exemption',
  Finalitytracker = 'finalitytracker',
  Stocapped = 'stocapped',
}

export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type PalletPermissions = {
  __typename?: 'PalletPermissions';
  pallet_name: Scalars['String'];
  dispatchable_names: DispatchableNames;
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

export type Portfolio = {
  __typename?: 'Portfolio';
  did: Scalars['String'];
  kind: Scalars['String'];
};

export type Proposal = {
  __typename?: 'Proposal';
  /** Proposal */
  blockId: Scalars['Int'];
  proposalId: Scalars['Int'];
  state: ProposalStateEnum;
  identityId: Scalars['String'];
  balance: Scalars['BigInt'];
  url?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  votesCount: Scalars['Int'];
};

export type ProposalOrderByInput = {
  field: ProposalOrderFields;
  order: Order;
};

export enum ProposalOrderFields {
  ProposalId = 'proposalId',
  VotesCount = 'votesCount',
}

export type ProposalResult = {
  __typename?: 'ProposalResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<Proposal>>>;
};

export enum ProposalStateEnum {
  All = 'All',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Scheduled = 'Scheduled',
  Failed = 'Failed',
  Executed = 'Executed',
  Expired = 'Expired',
}

export type ProposalVote = {
  __typename?: 'ProposalVote';
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  account: Scalars['String'];
  vote: Scalars['CustomBoolean'];
  weight: Scalars['BigInt'];
};

export type ProposalVotesOrderByInput = {
  field: ProposalVotesOrderFields;
  order: Order;
};

export enum ProposalVotesOrderFields {
  BlockId = 'block_id',
  Vote = 'vote',
  Weight = 'weight',
}

export type Query = {
  __typename?: 'Query';
  /** Returns true as a heartbeat */
  heartbeat: Scalars['Boolean'];
  latestBlock: Block;
  /** Get events by moduleId and eventId */
  events?: Maybe<Array<Maybe<Event>>>;
  /** Get staking events by stashAccount, stakingEventIds, fromDate, toDate */
  stakingEvents?: Maybe<StakingEventResult>;
  /** Get settlements where a portfolio is envolved */
  settlements?: Maybe<SettlementResult>;
  /** Get event where trustedClaimIssuer was added */
  eventByAddedTrustedClaimIssuer?: Maybe<Event>;
  /** Get a single event by any of its indexed arguments. If there is more than one result, it returns the most recent by block. */
  eventByIndexedArgs?: Maybe<Event>;
  /** Get events by any of its indexed arguments */
  eventsByIndexedArgs?: Maybe<Array<Maybe<Event>>>;
  /** Get transactions */
  transactions: ExtrinsicResult;
  /** Get transaction by hash */
  transactionByHash?: Maybe<Extrinsic>;
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
  /** Get all authorizations with their status optionally filtered by did, account key or type */
  authorizations: Array<Authorization>;
  /** Get a proposal by its pipId */
  proposal: Proposal;
  /** Fetch governance proposals */
  proposals?: Maybe<ProposalResult>;
  /** Get the current voters list for given pipId */
  proposalVotes: Array<ProposalVote>;
  /** Get investments related to sto id */
  investments?: Maybe<InvestmentResult>;
  /** Get Bridged event by Ethereum transaction hash */
  bridgedEventByTxHash?: Maybe<Event>;
  getWithholdingTaxesOfCA?: Maybe<WithholdingTaxesOfCa>;
  getHistoryOfPaymentEventsForCA: HistoryOfPaymentEventsForCaResults;
  getFundings?: Maybe<FundingResults>;
  getItnRewardRankings?: Maybe<ItnRewardRankingResult>;
  getDidItnRewardRanking?: Maybe<Array<Maybe<ItnRewardRanking>>>;
  getDidItnRewardActions?: Maybe<DidItnRewardActions>;
  updateItnRewardRankings: Scalars['Boolean'];
  getFailedBlocks?: Maybe<FailedBlocksResult>;
  tickerExternalAgentAdded?: Maybe<TickerExternalAgentAddedResult>;
  tickerExternalAgentHistory: Array<AgentHistory>;
  tickerExternalAgentActions: TickerExternalAgentActionsResult;
};

export type QueryEventsArgs = {
  moduleId: ModuleIdEnum;
  eventId: EventIdEnum;
  fromBlock: Scalars['Int'];
  toBlock: Scalars['Int'];
};

export type QueryStakingEventsArgs = {
  stashAccount?: Maybe<Scalars['String']>;
  stakingEventIds?: Maybe<Array<Maybe<StakingEventIdEnum>>>;
  fromDate: Scalars['DateTime'];
  toDate: Scalars['DateTime'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  order?: Maybe<Order>;
};

export type QuerySettlementsArgs = {
  identityId: Scalars['String'];
  portfolioNumber?: Maybe<Scalars['String']>;
  addressFilter?: Maybe<Scalars['String']>;
  tickerFilter?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryEventByAddedTrustedClaimIssuerArgs = {
  ticker: Scalars['String'];
  identityId: Scalars['String'];
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

export type QueryAuthorizationsArgs = {
  did?: Maybe<Scalars['String']>;
  accountKey?: Maybe<Scalars['String']>;
  authorizationTypes?: Maybe<Array<AuthTypeEnum>>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryProposalArgs = {
  pipId: Scalars['Int'];
};

export type QueryProposalsArgs = {
  state?: Maybe<ProposalStateEnum>;
  snapshot?: Maybe<SnapshotEnum>;
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

export type QueryInvestmentsArgs = {
  stoId: Scalars['Int'];
  ticker: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryBridgedEventByTxHashArgs = {
  ethTransactionHash: Scalars['String'];
};

export type QueryGetWithholdingTaxesOfCaArgs = {
  CAId: CaId;
  fromDate?: Maybe<Scalars['DateTime']>;
  toDate?: Maybe<Scalars['DateTime']>;
};

export type QueryGetHistoryOfPaymentEventsForCaArgs = {
  CAId: CaId;
  fromDate?: Maybe<Scalars['DateTime']>;
  toDate?: Maybe<Scalars['DateTime']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryGetFundingsArgs = {
  ticker: Scalars['String'];
  fundingName?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryGetItnRewardRankingsArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryGetDidItnRewardRankingArgs = {
  did: Scalars['String'];
  neighborRange?: Maybe<Scalars['Int']>;
};

export type QueryGetDidItnRewardActionsArgs = {
  did: Scalars['String'];
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  groupByAction?: Maybe<Scalars['Boolean']>;
};

export type QueryGetFailedBlocksArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTickerExternalAgentAddedArgs = {
  ticker: Scalars['String'];
  agentDID: Scalars['String'];
};

export type QueryTickerExternalAgentHistoryArgs = {
  ticker: Scalars['String'];
};

export type QueryTickerExternalAgentActionsArgs = {
  ticker: Scalars['String'];
  caller_did?: Maybe<Scalars['String']>;
  pallet_name?: Maybe<ModuleIdEnum>;
  event_id?: Maybe<EventIdEnum>;
  max_block?: Maybe<Scalars['Int']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  order?: Maybe<Order>;
};

export type Scope = {
  __typename?: 'Scope';
  type: ClaimScopeTypeEnum;
  value: Scalars['String'];
};

export type ScopeInput = {
  type: ClaimScopeTypeEnum;
  value: Scalars['String'];
};

export type Settlement = {
  __typename?: 'Settlement';
  /** Settlement */
  block_id: Scalars['Int'];
  result: SettlementResultEnum;
  addresses?: Maybe<Array<Scalars['String']>>;
  legs: Array<Maybe<SettlementLeg>>;
};

export enum SettlementDirectionEnum {
  None = 'None',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}

export type SettlementLeg = {
  __typename?: 'SettlementLeg';
  /** SettlementLeg */
  ticker: Scalars['String'];
  amount: Scalars['String'];
  direction: SettlementDirectionEnum;
  from: Portfolio;
  to: Portfolio;
};

export type SettlementResult = {
  __typename?: 'SettlementResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<Settlement>>>;
};

export enum SettlementResultEnum {
  None = 'None',
  Executed = 'Executed',
  Failed = 'Failed',
  Rejected = 'Rejected',
}

export enum SnapshotEnum {
  All = 'All',
  InSnapshot = 'InSnapshot',
  NotInSnapshot = 'NotInSnapshot',
}

export type StakingEvent = {
  __typename?: 'StakingEvent';
  date?: Maybe<Scalars['DateTime']>;
  blockId?: Maybe<Scalars['BigInt']>;
  transactionId?: Maybe<Scalars['String']>;
  eventId?: Maybe<StakingEventIdEnum>;
  identityId?: Maybe<Scalars['String']>;
  stashAccount?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['BigInt']>;
  nominatedValidators?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export enum StakingEventIdEnum {
  Bonded = 'Bonded',
  Unbonded = 'Unbonded',
  Nominated = 'Nominated',
  Reward = 'Reward',
  Slash = 'Slash',
}

export type StakingEventResult = {
  __typename?: 'StakingEventResult';
  totalCount: Scalars['Int'];
  items?: Maybe<Array<Maybe<StakingEvent>>>;
};

export type StringResult = {
  __typename?: 'StringResult';
  totalCount: Scalars['Int'];
  items: Array<Scalars['String']>;
};

export type TheseDispatchableNames = {
  __typename?: 'TheseDispatchableNames';
  These: Array<Scalars['String']>;
};

export type TheseExtrinsicPermissions = {
  __typename?: 'TheseExtrinsicPermissions';
  These: Array<PalletPermissions>;
};

export type TickerExternalAgentAction = {
  __typename?: 'TickerExternalAgentAction';
  datetime: Scalars['DateTime'];
  block_id: Scalars['Int'];
  event_idx: Scalars['Int'];
  pallet_name: ModuleIdEnum;
  event_id: EventIdEnum;
  caller_did: Scalars['String'];
};

export type TickerExternalAgentActionsResult = {
  __typename?: 'TickerExternalAgentActionsResult';
  totalCount: Scalars['Int'];
  items: Array<TickerExternalAgentAction>;
};

export type TickerExternalAgentAddedResult = {
  __typename?: 'TickerExternalAgentAddedResult';
  time: Scalars['DateTime'];
  blockId: Scalars['Int'];
  eventIndex: Scalars['Int'];
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

export type VoteResult = {
  __typename?: 'VoteResult';
  ayes: Array<Scalars['String']>;
  nays: Array<Scalars['String']>;
};

export type WholeDispatchableNames = {
  __typename?: 'WholeDispatchableNames';
  Whole?: Maybe<Scalars['Boolean']>;
};

export type WholeExtrinsicPermissions = {
  __typename?: 'WholeExtrinsicPermissions';
  Whole?: Maybe<Scalars['Boolean']>;
};

export type WithholdingTaxesOfCa = {
  __typename?: 'WithholdingTaxesOfCA';
  taxes: Scalars['Float'];
};
