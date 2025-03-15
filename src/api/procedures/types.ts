import BigNumber from 'bignumber.js';

import {
  Account,
  AuthorizationRequest,
  CheckpointSchedule,
  ChildIdentity,
  CorporateActionBase,
  CorporateBallot,
  CustomPermissionGroup,
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  KnownPermissionGroup,
  MultiSig,
  Nft,
  NumberedPortfolio,
  PolymeshTransaction,
  PolymeshTransactionBatch,
  Venue,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  AddCountStatInput,
  AssetDocument,
  CheckPermissionsResult,
  CheckRolesResult,
  ClaimCountStatInput,
  ClaimCountTransferRestriction,
  ClaimPercentageTransferRestriction,
  ClaimTarget,
  CorporateActionTargets,
  CountTransferRestriction,
  InputCaCheckpoint,
  InputCondition,
  InputStatClaim,
  InputStatType,
  InputTargets,
  InputTaxWithholding,
  InputTrustedClaimIssuer,
  KnownAssetType,
  KnownNftType,
  MetadataSpec,
  MetadataType,
  MetadataValueDetails,
  NftCollection,
  OfferingTier,
  PercentageTransferRestriction,
  PermissionedAccount,
  PermissionsLike,
  PortfolioLike,
  PortfolioMovement,
  Requirement,
  Scope,
  SecurityIdentifier,
  Signer,
  SignerType,
  StatClaimIssuer,
  StatType,
  TaxWithholding,
  TransactionPermissions,
  TxTag,
  VenueType,
} from '~/types';
import { Modify } from '~/types/utils';

export interface ProcedureAuthorizationStatus {
  /**
   * whether the Identity complies with all required Agent permissions
   */
  agentPermissions: CheckPermissionsResult<SignerType.Identity>;
  /**
   * whether the Account complies with all required Signer permissions
   */
  signerPermissions: CheckPermissionsResult<SignerType.Account>;
  /**
   * whether the Identity complies with all required Roles
   */
  roles: CheckRolesResult;
  /**
   * whether the Account is frozen (i.e. can't perform any transactions)
   */
  accountFrozen: boolean;
  /**
   * true only if the Procedure requires an Identity but the signing Account
   *   doesn't have one associated
   */
  noIdentity: boolean;
}

export interface SkipChecksOpt {
  /**
   * whether to skip the roles check
   */
  roles?: boolean;
  /**
   * whether to skip the signer permissions check
   */
  signerPermissions?: boolean;
  /**
   * whether to skip the agent permissions check
   */
  agentPermissions?: boolean;
  /**
   * whether to skip the account frozen check
   */
  accountFrozen?: boolean;
  /**
   * whether to skip the identity check (i.e. whether the signing Account has an associated Identity)
   */
  identity?: boolean;
}

export interface ProcedureOpts {
  /**
   * Account or address of a signing key to replace the current one (for this procedure only)
   */
  signingAccount?: string | Account;

  /**
   * nonce value for signing the transaction
   *
   * An {@link api/entities/Account!Account} can directly fetch its current nonce by calling {@link api/entities/Account!Account.getCurrentNonce | account.getCurrentNonce}. More information can be found at: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
   *
   * @note the passed value can be either the nonce itself or a function that returns the nonce. This allows, for example, passing a closure that increases the returned value every time it's called, or a function that fetches the nonce from the chain or a different source
   */
  nonce?: BigNumber | Promise<BigNumber> | (() => BigNumber | Promise<BigNumber>);

  /**
   * This option allows for transactions that never expire, aka "immortal". By default, a transaction is only valid for approximately 5 minutes (250 blocks) after its construction. Allows for transaction construction to be decoupled from its submission, such as requiring manual approval for the signing or providing "at least once" guarantees.
   *
   * More information can be found [here](https://wiki.polkadot.network/docs/build-protocol-info#transaction-mortality). Note the Polymesh chain will **never** reap Accounts, so the risk of a replay attack is mitigated.
   */
  mortality?: MortalityProcedureOpt;

  /**
   * These options will only apply when the `signingAccount` is a MultiSig signer and the transaction is being wrapped as a proposal
   */
  multiSigOpts?: MultiSigProcedureOpt;

  /**
   * This option allows for skipping checks for the Procedure. By default, all checks are performed.
   *
   * This can be useful while batching transactions which could have failed due to insufficient roles or permissions individually, but you don't want to fail the entire batch.
   *
   * @note even if the checks are skipped from being validated on the SDK, they will still be validated on the chain
   */
  skipChecks?: SkipChecksOpt;
}

/**
 * This transaction will never expire
 */
export interface ImmortalProcedureOptValue {
  readonly immortal: true;
}

/**
 * This transaction will be rejected if not included in a block after a while (default: ~5 minutes)
 */
export interface MortalProcedureOptValue {
  readonly immortal: false;
  /**
   * The number of blocks the for which the transaction remains valid. Target block time is 6 seconds. The default should suffice for most use cases
   *
   * @note this value will get rounded up to the closest power of 2, e.g. `65` rounds up to `128`
   * @note this value should not exceed 4096, which is the chain's `BlockHashCount` as the lesser of the two will be used.
   */
  readonly lifetime?: BigNumber;
}

export interface MultiSigProcedureOpt {
  /**
   * The block number for which the proposal expires
   */
  expiry?: Date;
}

export type MortalityProcedureOpt = ImmortalProcedureOptValue | MortalProcedureOptValue;

export interface CreateTransactionBatchProcedureMethod {
  <ReturnValues extends readonly [...unknown[]]>(
    args: CreateTransactionBatchParams<ReturnValues>,
    opts?: ProcedureOpts
  ): Promise<PolymeshTransactionBatch<ReturnValues, ReturnValues>>;
  checkAuthorization: <ReturnValues extends [...unknown[]]>(
    args: CreateTransactionBatchParams<ReturnValues>,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface ProcedureMethod<
  MethodArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue
> {
  (args: MethodArgs, opts?: ProcedureOpts): Promise<
    GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>
  >;
  checkAuthorization: (
    args: MethodArgs,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface OptionalArgsProcedureMethod<
  MethodArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue
> {
  (args?: MethodArgs, opts?: ProcedureOpts): Promise<
    GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>
  >;
  checkAuthorization: (
    args?: MethodArgs,
    opts?: ProcedureOpts
  ) => Promise<ProcedureAuthorizationStatus>;
}

export interface NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue = ProcedureReturnValue> {
  (opts?: ProcedureOpts): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>>;
  checkAuthorization: (opts?: ProcedureOpts) => Promise<ProcedureAuthorizationStatus>;
}

/**
 * Targets of a corporate action in a flexible structure for input purposes
 */
export type InputCorporateActionTargets = Modify<
  CorporateActionTargets,
  {
    identities: (string | Identity)[];
  }
>;

/**
 * Per-Identity tax withholdings of a corporate action in a flexible structure for input purposes
 */
export type InputCorporateActionTaxWithholdings = Modify<
  TaxWithholding,
  {
    identity: string | Identity;
  }
>[];

export type GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue> =
  | PolymeshTransaction<ProcedureReturnValue, ReturnValue>
  | PolymeshTransactionBatch<ProcedureReturnValue, ReturnValue>;

export type TransactionArray<ReturnValues extends readonly [...unknown[]]> = {
  // The type has to be any here to account for procedures with transformed return values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof ReturnValues]: GenericPolymeshTransaction<any, ReturnValues[K]>;
};

/**
 * Transaction data for display purposes
 */
export interface TxData<Args extends unknown[] = unknown[]> {
  /**
   * transaction string identifier
   */
  tag: TxTag;
  /**
   * arguments with which the transaction will be called
   */
  args: Args;
}

// Roles

export enum RoleType {
  TickerOwner = 'TickerOwner',
  CddProvider = 'CddProvider',
  VenueOwner = 'VenueOwner',
  PortfolioCustodian = 'PortfolioCustodian',
  CorporateActionsAgent = 'CorporateActionsAgent',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Identity = 'Identity',
}

export interface TickerOwnerRole {
  type: RoleType.TickerOwner;
  ticker: string;
}

export interface CddProviderRole {
  type: RoleType.CddProvider;
}

export interface VenueOwnerRole {
  type: RoleType.VenueOwner;
  venueId: BigNumber;
}

export interface PortfolioId {
  did: string;
  number?: BigNumber;
}

export interface PortfolioCustodianRole {
  type: RoleType.PortfolioCustodian;
  portfolioId: PortfolioId;
}

export interface IdentityRole {
  type: RoleType.Identity;
  did: string;
}

export type Role =
  | TickerOwnerRole
  | CddProviderRole
  | VenueOwnerRole
  | PortfolioCustodianRole
  | IdentityRole;

/**
 * Transaction Groups (for permissions purposes)
 */
export enum TxGroup {
  /**
   * - TxTags.identity.AddInvestorUniquenessClaim
   * - TxTags.portfolio.MovePortfolioFunds
   * - TxTags.settlement.AddInstruction
   * - TxTags.settlement.AddInstructionWithMemo
   * - TxTags.settlement.AddAndAffirmInstruction
   * - TxTags.settlement.AddAndAffirmInstructionWithMemo
   * - TxTags.settlement.AffirmInstruction
   * - TxTags.settlement.RejectInstruction
   * - TxTags.settlement.CreateVenue
   */
  PortfolioManagement = 'PortfolioManagement',
  /**
   * - TxTags.asset.MakeDivisible
   * - TxTags.asset.RenameAsset
   * - TxTags.asset.SetFundingRound
   * - TxTags.asset.AddDocuments
   * - TxTags.asset.RemoveDocuments
   */
  AssetManagement = 'AssetManagement',
  /**
   * - TxTags.asset.Freeze
   * - TxTags.asset.Unfreeze
   * - TxTags.identity.AddAuthorization
   * - TxTags.identity.RemoveAuthorization
   */
  AdvancedAssetManagement = 'AdvancedAssetManagement',
  /**
   * - TxTags.identity.AddInvestorUniquenessClaim
   * - TxTags.settlement.CreateVenue
   * - TxTags.settlement.AddInstruction
   * - TxTags.settlement.AddInstructionWithMemo
   * - TxTags.settlement.AddAndAffirmInstruction
   * - TxTags.settlement.AddAndAffirmInstructionWithMemo
   */
  Distribution = 'Distribution',
  /**
   * - TxTags.asset.Issue
   */
  Issuance = 'Issuance',
  /**
   * - TxTags.complianceManager.AddDefaultTrustedClaimIssuer
   * - TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer
   */
  TrustedClaimIssuersManagement = 'TrustedClaimIssuersManagement',
  /**
   * - TxTags.identity.AddClaim
   * - TxTags.identity.RevokeClaim
   */
  ClaimsManagement = 'ClaimsManagement',
  /**
   * - TxTags.complianceManager.AddComplianceRequirement
   * - TxTags.complianceManager.RemoveComplianceRequirement
   * - TxTags.complianceManager.PauseAssetCompliance
   * - TxTags.complianceManager.ResumeAssetCompliance
   * - TxTags.complianceManager.ResetAssetCompliance
   */
  ComplianceRequirementsManagement = 'ComplianceRequirementsManagement',
  /**
   * - TxTags.checkpoint.CreateSchedule,
   * - TxTags.checkpoint.RemoveSchedule,
   * - TxTags.checkpoint.CreateCheckpoint,
   * - TxTags.corporateAction.InitiateCorporateAction,
   * - TxTags.capitalDistribution.Distribute,
   * - TxTags.capitalDistribution.Claim,
   * - TxTags.identity.AddInvestorUniquenessClaim,
   */
  CorporateActionsManagement = 'CorporateActionsManagement',
  /**
   * - TxTags.sto.CreateFundraiser,
   * - TxTags.sto.FreezeFundraiser,
   * - TxTags.sto.Invest,
   * - TxTags.sto.ModifyFundraiserWindow,
   * - TxTags.sto.Stop,
   * - TxTags.sto.UnfreezeFundraiser,
   * - TxTags.identity.AddInvestorUniquenessClaim,
   * - TxTags.asset.Issue,
   * - TxTags.settlement.CreateVenue
   */
  StoManagement = 'StoManagement',
}

export type AddRestrictionParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? AddCountTransferRestrictionParams
    : T extends TransferRestrictionType.Percentage
    ? AddPercentageTransferRestrictionParams
    : T extends TransferRestrictionType.ClaimCount
    ? AddClaimCountTransferRestrictionParams
    : AddClaimPercentageTransferRestrictionParams,
  'type'
>;

export type SetRestrictionsParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? SetCountTransferRestrictionsParams
    : T extends TransferRestrictionType.Percentage
    ? SetPercentageTransferRestrictionsParams
    : T extends TransferRestrictionType.ClaimCount
    ? SetClaimCountTransferRestrictionsParams
    : SetClaimPercentageTransferRestrictionsParams,
  'type'
>;

export type GetTransferRestrictionReturnType<T> = ActiveTransferRestrictions<
  T extends TransferRestrictionType.Count
    ? CountTransferRestriction
    : T extends TransferRestrictionType.Percentage
    ? PercentageTransferRestriction
    : T extends TransferRestrictionType.ClaimCount
    ? ClaimCountTransferRestriction
    : ClaimPercentageTransferRestriction
>;

export type RemoveAssetStatParams = { asset: FungibleAsset } & (
  | RemoveCountStatParams
  | RemoveBalanceStatParams
  | RemoveScopedCountParams
  | RemoveScopedBalanceParams
);

export type AddCountStatParams = AddCountStatInput & {
  type: StatType.Count;
};

export type AddPercentageStatParams = {
  type: StatType.Balance;
};

export type AddClaimCountStatParams = ClaimCountStatInput & {
  type: StatType.ScopedCount;
};

export type AddClaimPercentageStatParams = StatClaimIssuer & {
  type: StatType.ScopedBalance;
};

export type AddAssetStatParams = { asset: FungibleAsset } & (
  | AddCountStatParams
  | AddPercentageStatParams
  | AddClaimCountStatParams
  | AddClaimPercentageStatParams
);

export type RemoveCountStatParams = {
  type: StatType.Count;
};

export type RemoveBalanceStatParams = {
  type: StatType.Balance;
};

export type RemoveScopedCountParams = StatClaimIssuer & {
  type: StatType.ScopedCount;
};

export type RemoveScopedBalanceParams = StatClaimIssuer & {
  type: StatType.ScopedBalance;
};

export type SetAssetStatParams<T> = Omit<
  T extends TransferRestrictionType.Count
    ? AddCountStatParams
    : T extends TransferRestrictionType.Percentage
    ? AddPercentageStatParams
    : T extends TransferRestrictionType.ClaimCount
    ? AddClaimCountStatParams
    : AddClaimPercentageStatParams,
  'type'
>;

export enum TransferRestrictionType {
  Count = 'Count',
  Percentage = 'Percentage',
  ClaimCount = 'ClaimCount',
  ClaimPercentage = 'ClaimPercentage',
}

export interface ClaimCountRestrictionValue {
  min: BigNumber;
  max?: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}

export interface ClaimPercentageRestrictionValue {
  min: BigNumber;
  max: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}

export type TransferRestriction =
  | {
      type: TransferRestrictionType.Count;
      value: BigNumber;
    }
  | { type: TransferRestrictionType.Percentage; value: BigNumber }
  | {
      type: TransferRestrictionType.ClaimCount;
      value: ClaimCountRestrictionValue;
    }
  | {
      type: TransferRestrictionType.ClaimPercentage;
      value: ClaimPercentageRestrictionValue;
    };

interface TransferRestrictionInputBase {
  /**
   * array of Identities (or DIDs) that are exempted from the Restriction
   */
  exemptedIdentities?: (Identity | string)[];
}

export interface CountTransferRestrictionInput extends TransferRestrictionInputBase {
  /**
   * limit on the amount of different (unique) investors that can hold the Asset at once
   */
  count: BigNumber;
}

export interface PercentageTransferRestrictionInput extends TransferRestrictionInputBase {
  /**
   * maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once
   */
  percentage: BigNumber;
}

export interface ClaimCountTransferRestrictionInput extends TransferRestrictionInputBase {
  min: BigNumber;
  max?: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}
export interface ClaimPercentageTransferRestrictionInput extends TransferRestrictionInputBase {
  min: BigNumber;
  max: BigNumber;
  issuer: Identity;
  claim: InputStatClaim;
}

export type AddCountTransferRestrictionParams = CountTransferRestrictionInput & {
  type: TransferRestrictionType.Count;
};

export type AddPercentageTransferRestrictionParams = PercentageTransferRestrictionInput & {
  type: TransferRestrictionType.Percentage;
};

export type AddClaimCountTransferRestrictionParams = ClaimCountTransferRestrictionInput & {
  type: TransferRestrictionType.ClaimCount;
};

export type AddClaimPercentageTransferRestrictionParams =
  ClaimPercentageTransferRestrictionInput & {
    type: TransferRestrictionType.ClaimPercentage;
  };

export interface SetCountTransferRestrictionsParams {
  /**
   * array of Count Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: CountTransferRestrictionInput[];
  type: TransferRestrictionType.Count;
}

export interface SetPercentageTransferRestrictionsParams {
  /**
   * array of Percentage Transfer Restrictions with their corresponding exemptions (if applicable)
   */
  restrictions: PercentageTransferRestrictionInput[];
  type: TransferRestrictionType.Percentage;
}

export interface SetClaimCountTransferRestrictionsParams {
  restrictions: ClaimCountTransferRestrictionInput[];
  type: TransferRestrictionType.ClaimCount;
}

export interface SetClaimPercentageTransferRestrictionsParams {
  restrictions: ClaimPercentageTransferRestrictionInput[];
  type: TransferRestrictionType.ClaimPercentage;
}

export interface InviteAccountParams {
  targetAccount: string | Account;
  permissions?: PermissionsLike;
  expiry?: Date;
}

export interface AcceptPrimaryKeyRotationParams {
  /**
   * Authorization from the owner who initiated the change
   */
  ownerAuth: BigNumber | AuthorizationRequest;
  /**
   * (optional) Authorization from a CDD service provider attesting the rotation of primary key
   */
  cddAuth?: BigNumber | AuthorizationRequest;
}

export interface ModifySignerPermissionsParams {
  /**
   * list of secondary Accounts
   */
  secondaryAccounts: Modify<
    PermissionedAccount,
    { account: string | Account; permissions: PermissionsLike }
  >[];
}

export interface RemoveSecondaryAccountsParams {
  accounts: Account[];
}

export interface AccountWithSignature {
  /**
   * The secondary Account along with its permissions to be added
   *
   * @note This account should not be linked to any other Identity
   */
  secondaryAccount: Modify<
    PermissionedAccount,
    { account: string | Account; permissions: PermissionsLike }
  >;
  /**
   * Off-chain authorization signature generated by `secondaryAccount` signing of the target Id authorization
   *
   * Target Id authorization consists of the target Identity (to which the secondary account will be added),
   * off chain authorization nonce of the target Identity and expiry date (same as `expiresAt` value) until which the off chain authorization will be valid.
   * Signature has to be generated encoding the target Id authorization value in the specified order.
   *
   * @note Nonce value can be fetched using {@link api/entities/Identity!Identity.getOffChainAuthorizationNonce | Identity.getOffChainAuthorizationNonce }
   * Signature can also be generated using the method {@link api/client/AccountManagement!AccountManagement.generateOffChainAuthSignature | accountManagement.generateOffChainAuthSignature }
   */
  authSignature: string;
}

export interface AddSecondaryAccountsParams {
  /**
   * Expiry date until which all the off chain authorizations received from each account is valid
   */
  expiresAt: Date;

  /**
   * List of accounts to be added as secondary accounts along with their off chain authorization signatures
   */
  accounts: AccountWithSignature[];
}

export interface SubsidizeAccountParams {
  /**
   * Account to subsidize
   */
  beneficiary: string | Account;
  /**
   * amount of POLYX to be subsidized. This can be increased/decreased later on
   */
  allowance: BigNumber;
}

export interface CreateAssetParams {
  name: string;
  /**
   * amount of Asset tokens that will be minted on creation (optional, default doesn't mint)
   */
  initialSupply?: BigNumber;
  /**
   * portfolio to which the Asset tokens will be issued on creation (optional, default is the default portfolio)
   */
  portfolioId?: BigNumber;
  /**
   * whether a single Asset token can be divided into decimal parts
   */
  isDivisible: boolean;
  /**
   * type of security that the Asset represents (e.g. Equity, Debt, Commodity). Common values are included in the
   *   {@link types!KnownAssetType} enum, but custom values can be used as well. Custom values must be registered on-chain the first time
   *   they're used, requiring an additional transaction. They aren't tied to a specific Asset
   *   if using a custom type, it can be provided as a string (representing name) or a BigNumber (representing the custom type ID)
   */
  assetType: KnownAssetType | string | BigNumber;
  /**
   * array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)
   */
  securityIdentifiers?: SecurityIdentifier[];
  /**
   * (optional) funding round in which the Asset currently is (e.g. Series A, Series B)
   */
  fundingRound?: string;
  documents?: AssetDocument[];

  /**
   * (optional) type of statistics that should be enabled for the Asset
   *
   * Enabling statistics allows for TransferRestrictions to be made. For example the SEC requires registration for a company that
   * has either more than 2000 investors, or more than 500 non accredited investors. To prevent crossing this limit two restrictions are
   * needed, a `Count` of 2000, and a `ScopedCount` of non accredited with a maximum of 500. [source](https://www.sec.gov/info/smallbus/secg/jobs-act-section-12g-small-business-compliance-guide.htm)
   *
   * These restrictions require a `Count` and `ScopedCount` statistic to be created. Although they an be created after the Asset is made, it is recommended to create statistics
   * before the Asset is circulated. Count statistics made after Asset creation need their initial value set, so it is simpler to create them before investors hold the Asset.
   * If you do need to create a stat for an Asset after creation, you can use the { @link api/entities/Asset/Fungible/TransferRestrictions/TransferRestrictionBase!TransferRestrictionBase.enableStat | enableStat } method in
   * the appropriate namespace
   */
  initialStatistics?: InputStatType[];
}

export interface IssueTokensParams {
  /**
   * amount of Asset tokens to be issued
   */
  amount: BigNumber;
  /**
   * portfolio to which the Asset tokens will be issued (optional, default is the default portfolio)
   */
  portfolioId?: BigNumber;
}

export interface CreateAssetWithTickerParams extends CreateAssetParams {
  /**
   * (optional) ticker to be linked with the Asset
   *
   * @note from 7.x chain, ticker has been made optional. For 6.x chain, it is still mandatory.
   */
  ticker?: string;
}

export interface GlobalCollectionKeyInput {
  type: MetadataType.Global;
  id: BigNumber;
}

export interface LocalCollectionKeyInput {
  type: MetadataType.Local;
  name: string;
  spec: MetadataSpec;
}

/**
 * Global key must be registered. local keys must provide a specification as they are created with the NftCollection
 */
export type CollectionKeyInput = GlobalCollectionKeyInput | LocalCollectionKeyInput;

export interface CreateNftCollectionParams {
  /**
   * The ID of the asset to be used to create the collection.
   * If no assetId is provided, a new asset with `NonFungible` asset type will be created
   *
   * @note for spec version before 7.x, this value is overwritten by `ticker` value
   */
  assetId?: string;
  /**
   * The primary identifier for the collection.
   * The ticker must either be free, or the signer has appropriate permissions if reserved.
   *
   * Since spec version 7.x, this value (if provided) is then linked to `assetId` asset
   *
   * @note This value is mandatory for spec version before 7.x
   */
  ticker?: string;
  /**
   * The collection name. defaults to `ticker`
   */
  name?: string;
  /**
   * @throws if provided string that does not have a custom type
   * @throws if provided a BigNumber that does not correspond to a custom type
   */
  nftType: KnownNftType | string | BigNumber;
  /**
   * array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)
   */
  securityIdentifiers?: SecurityIdentifier[];
  /**
   * The required metadata values each NFT in the collection will have
   *
   * @note Images — Most Polymesh networks (mainnet, testnet, etc.) have global metadata keys registered to help standardize displaying images
   * If `imageUri` is specified as a collection key, then each token will need to be issued with an image URI.
   */
  collectionKeys: CollectionKeyInput[];
  /**
   * Links to off chain documents related to the NftCollection
   */
  documents?: AssetDocument[];

  /**
   * A optional field that can be used to provide information about the funding state of the asset
   */
  fundingRound?: string;
}

export interface ReserveTickerParams {
  /**
   * ticker symbol to reserve
   */
  ticker: string;
  extendPeriod?: boolean;
}

export enum ClaimOperation {
  Revoke = 'Revoke',
  Add = 'Add',
  Edit = 'Edit',
}

export interface AddClaimsParams {
  /**
   * array of claims to be added
   */
  claims: ClaimTarget[];
  operation: ClaimOperation.Add;
}

export interface EditClaimsParams {
  /**
   * array of claims to be edited
   */
  claims: ClaimTarget[];
  operation: ClaimOperation.Edit;
}

export interface RevokeClaimsParams {
  /**
   * array of claims to be revoked
   */
  claims: Omit<ClaimTarget, 'expiry'>[];
  operation: ClaimOperation.Revoke;
}

export type ModifyClaimsParams = AddClaimsParams | EditClaimsParams | RevokeClaimsParams;

export interface ScopeClaimProof {
  proofScopeIdWellFormed: string;
  proofScopeIdCddIdMatch: {
    challengeResponses: [string, string];
    subtractExpressionsRes: string;
    blindedScopeDidHash: string;
  };
}

export interface AddInvestorUniquenessClaimParams {
  scope: Scope;
  cddId: string;
  proof: string | ScopeClaimProof;
  scopeId: string;
  expiry?: Date;
}

export interface RegisterIdentityParams {
  /**
   * The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account
   */
  targetAccount: string | Account;
  /**
   * (optional) secondary accounts for the new Identity with their corresponding permissions.
   * @note Each Account will need to accept the generated authorizations before being linked to the Identity
   */
  secondaryAccounts?: Modify<PermissionedAccount, { permissions: PermissionsLike }>[];
  /**
   * (optional) also issue a CDD claim for the created DID, completing the onboarding process for the Account
   */
  createCdd?: boolean;
  /**
   * (optional) when the generated CDD claim should expire, `createCdd` must be true if specified
   */
  expiry?: Date;
}

export interface AttestPrimaryKeyRotationParams {
  /**
   * The Account that will be attested to become the primary key of the `identity`. Can be ss58 encoded address or an instance of Account
   */
  targetAccount: string | Account;

  /**
   * Identity or the DID of the Identity that is to be rotated
   */
  identity: string | Identity;

  /**
   * (optional) when the generated authorization should expire
   */
  expiry?: Date;
}

export interface RotatePrimaryKeyParams {
  /**
   * The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account
   */
  targetAccount: string | Account;

  /**
   * (optional) when the generated authorization should expire
   */
  expiry?: Date;
}

export type RotatePrimaryKeyToSecondaryParams = {
  permissions: PermissionsLike;
  /**
   * The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account
   */
  targetAccount: string | Account;
  /**
   * (optional) when the generated authorization should expire
   */
  expiry?: Date;
};

export interface TransferPolyxParams {
  /**
   * Account that will receive the POLYX
   */
  to: string | Account;
  /**
   * amount of POLYX to be transferred
   */
  amount: BigNumber;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
}

export interface InstructionFungibleLeg {
  amount: BigNumber;
  from: PortfolioLike;
  to: PortfolioLike;
  asset: string | FungibleAsset;
}

export interface InstructionNftLeg {
  nfts: (BigNumber | Nft)[];
  from: PortfolioLike;
  to: PortfolioLike;
  asset: string | NftCollection;
}

export interface InstructionOffChainLeg {
  from: string | Identity;
  to: string | Identity;
  /**
   * the ticker of the off chain asset
   */
  asset: string;
  offChainAmount: BigNumber;
}

export type InstructionLeg = InstructionFungibleLeg | InstructionNftLeg | InstructionOffChainLeg;

export type AddInstructionParams = {
  /**
   * array of Asset movements
   */
  legs: InstructionLeg[];
  /**
   * date at which the trade was agreed upon (optional, for off chain trades)
   */
  tradeDate?: Date;
  /**
   * date at which the trade was executed (optional, for off chain trades)
   */
  valueDate?: Date;
  /**
   * identifier string to help differentiate instructions
   */
  memo?: string;
  /**
   * additional identities that must affirm the instruction
   */
  mediators?: (string | Identity)[];
} & (
  | {
      /**
       * block at which the Instruction will be executed automatically (optional, the Instruction will be executed when all participants have authorized it if not supplied)
       */
      endBlock?: BigNumber;
    }
  | {
      /**
       * block after which the Instruction can be manually executed (optional, the Instruction will be executed when all participants have authorized it if not supplied)
       */
      endAfterBlock?: BigNumber;
    }
);

export interface AddInstructionsParams {
  /**
   * array of Instructions to be added in the Venue
   */
  instructions: AddInstructionParams[];
}

export type AddInstructionWithVenueIdParams = AddInstructionParams & {
  venueId?: BigNumber;
};

export interface InstructionIdParams {
  id: BigNumber;
}

export enum InstructionAffirmationOperation {
  Affirm = 'Affirm',
  Withdraw = 'Withdraw',
  Reject = 'Reject',
  AffirmAsMediator = 'AffirmAsMediator',
  WithdrawAsMediator = 'WithdrawAsMediator',
  RejectAsMediator = 'RejectAsMediator',
}

export type RejectInstructionParams = {
  /**
   * (optional) Portfolio that the signer controls and wants to reject the instruction
   */
  portfolio?: PortfolioLike;
};

export type WithdrawInstructionParams = {
  /**
   * (optional) Portfolios that the signer controls and wants to affirm the instruction or withdraw affirmation
   *
   * @note if empty, all the legs containing any custodied Portfolios of the signer will be affirmed/affirmation will be withdrawn, based on the operation.
   */
  portfolios?: PortfolioLike[];
};

export enum SignerKeyRingType {
  Ed25519 = 'Ed25519',
  Sr25519 = 'Sr25519',
  Ecdsa = 'Ecdsa',
}

export interface OffChainSignature {
  type: SignerKeyRingType;
  value: `0x${string}`;
}

export interface OffChainAffirmationReceipt {
  /**
   * Unique receipt number set by the signer for their receipts
   */
  uid: BigNumber;
  /**
   * Index of the off chain leg within the instruction to be affirmed
   */
  legId: BigNumber;
  /**
   * Signer of this receipt
   */
  signer: string | Account;
  /**
   * Signature confirming the receipt details
   */
  signature: OffChainSignature;
  /**
   * (optional) Metadata value that can be used to attach messages to the receipt
   */
  metadata?: string;
}

export type AffirmInstructionParams = {
  /**
   * (optional) Portfolios that the signer controls and wants to affirm the instruction
   *
   * @note if empty, all the legs containing any custodied Portfolios of the signer will be affirmed
   */
  portfolios?: PortfolioLike[];

  /**
   * (optional) list of offchain receipts required for affirming offchain legs(if any) in the instruction
   *
   * Receipt can be generated using {@link api/entities/Instruction!Instruction.generateOffChainAffirmationReceipt | generateOffChainAffirmationReceipt} method
   */
  receipts?: OffChainAffirmationReceipt[];
};

export type AffirmAsMediatorParams = {
  expiry?: Date;
};

export type ModifyInstructionAffirmationParams = InstructionIdParams &
  (
    | ({
        operation: InstructionAffirmationOperation.Affirm;
      } & AffirmInstructionParams)
    | ({
        operation: InstructionAffirmationOperation.Withdraw;
      } & WithdrawInstructionParams)
    | ({
        operation:
          | InstructionAffirmationOperation.Reject
          | InstructionAffirmationOperation.RejectAsMediator;
      } & RejectInstructionParams)
    | ({
        operation: InstructionAffirmationOperation.AffirmAsMediator;
      } & AffirmAsMediatorParams)
    | {
        operation:
          | InstructionAffirmationOperation.WithdrawAsMediator
          | InstructionAffirmationOperation.RejectAsMediator;
      }
  );

export interface ExecuteManualInstructionParams {
  /**
   * (optional) Set to `true` to skip affirmation check, useful for batch transactions
   */
  skipAffirmationCheck?: boolean;
}

export interface CreateVenueParams {
  description: string;
  type: VenueType;
  /**
   * (optional) list of signers that are allowed to sign receipts for this venue
   */
  signers?: (string | Account)[];
}

export interface UpdateVenueSignersParams {
  signers: (string | Account)[];
}

export interface ControllerTransferParams {
  /**
   * portfolio (or portfolio ID) from which Assets will be transferred
   */
  originPortfolio: PortfolioLike;
  /**
   * amount of Asset tokens to transfer
   */
  amount: BigNumber;
}

export interface NftControllerTransferParams {
  /**
   * portfolio (or portfolio ID) from which NFTs will be transferred from
   */
  originPortfolio: PortfolioLike;
  /**
   * The NFTs to transfer
   */
  nfts: (Nft | BigNumber)[];

  /**
   * Optional portfolio (or portfolio ID) to which NFTs will be transferred to. Defaults to default. If specified it must be one of the callers own portfolios
   */
  destinationPortfolio?: PortfolioLike;
}

export type ModifyAssetParams =
  | {
      /**
       * makes an indivisible Asset divisible
       */
      makeDivisible?: true;
      name: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
      assetType?: KnownAssetType | string | BigNumber;
    }
  | {
      makeDivisible: true;
      name?: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
      assetType?: KnownAssetType | string | BigNumber;
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound: string;
      identifiers?: SecurityIdentifier[];
      assetType?: KnownAssetType | string | BigNumber;
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound?: string;
      identifiers: SecurityIdentifier[];
      assetType?: KnownAssetType | string | BigNumber;
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
      assetType: KnownAssetType | string | BigNumber;
    };

export type NftMetadataInput = {
  type: MetadataType;
  id: BigNumber;
  value: string;
};

export type IssueNftParams = {
  metadata: NftMetadataInput[];
  /**
   * portfolio to which the NFTCollection will be issued (optional, default is the default portfolio)
   */
  portfolioId?: BigNumber;
};

export interface ModifyPrimaryIssuanceAgentParams {
  /**
   * Identity to be set as primary issuance agent
   */
  target: string | Identity;
  /**
   * date at which the authorization request to modify the primary issuance agent expires (optional, never expires if a date is not provided)
   */
  requestExpiry?: Date;
}

export interface RedeemTokensParams {
  /**
   * amount of Asset tokens to be redeemed
   */
  amount: BigNumber;
  /**
   * portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)
   */
  from?: BigNumber | DefaultPortfolio | NumberedPortfolio;
}

export interface RedeemNftParams {
  /**
   * portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)
   */
  from?: BigNumber | DefaultPortfolio | NumberedPortfolio;
}

export interface TransferAssetOwnershipParams {
  target: string | Identity;
  /**
   * date at which the authorization request for transfer expires (optional)
   */
  expiry?: Date;
}

export interface CreateCheckpointScheduleParams {
  /**
   * The points in time in the future for which to create checkpoints for
   */
  points: Date[];
}

export interface RemoveCheckpointScheduleParams {
  /**
   * schedule (or ID) of the schedule to be removed
   */
  schedule: CheckpointSchedule | BigNumber;
}

export interface AddAssetRequirementParams {
  /**
   * array of conditions that form the requirement that must be added.
   *   Conditions within a requirement are *AND* between them. This means that in order
   *   for a transfer to comply with this requirement, it must fulfill *ALL* conditions
   */
  conditions: InputCondition[];
}

export type ModifyComplianceRequirementParams = {
  /**
   * ID of the Compliance Requirement
   */
  id: BigNumber;
  /**
   * array of conditions to replace the existing array of conditions for the requirement (identified by `id`).
   *   Conditions within a requirement are *AND* between them. This means that in order
   *   for a transfer to comply with this requirement, it must fulfill *ALL* conditions
   */
  conditions: InputCondition[];
};

export interface RemoveAssetRequirementParams {
  requirement: BigNumber | Requirement;
}

export interface SetAssetRequirementsParams {
  /**
   * array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays.
   *   In other words, higher level arrays are *OR* between them, while conditions inside each array are *AND* between them
   */
  requirements: InputCondition[][];
}

export interface ModifyAssetTrustedClaimIssuersAddSetParams {
  claimIssuers: InputTrustedClaimIssuer[];
}

export interface ModifyAssetTrustedClaimIssuersRemoveParams {
  /**
   * array of Identities (or DIDs) of the default claim issuers
   */
  claimIssuers: (string | Identity)[];
}

export interface RemoveCorporateActionParams {
  corporateAction: CorporateActionBase | BigNumber;
}

export interface RemoveCorporateBallotParams {
  ballot: CorporateBallot | BigNumber;
}

export interface ModifyCorporateActionsAgentParams {
  /**
   * Identity to be set as Corporate Actions Agent
   */
  target: string | Identity;
  /**
   * date at which the authorization request to modify the Corporate Actions Agent expires (optional, never expires if a date is not provided)
   */
  requestExpiry?: Date;
}

export type ModifyCaDefaultConfigParams =
  | {
      targets?: InputTargets;
      defaultTaxWithholding: BigNumber;
      taxWithholdings?: InputTaxWithholding[];
    }
  | {
      targets: InputTargets;
      defaultTaxWithholding?: BigNumber;
      taxWithholdings?: InputTaxWithholding[];
    }
  | {
      targets?: InputTargets;
      defaultTaxWithholding?: BigNumber;
      taxWithholdings: InputTaxWithholding[];
    };

export interface ConfigureDividendDistributionParams {
  /**
   * date at which the issuer publicly declared the Dividend Distribution. Optional, defaults to the current date
   */
  declarationDate?: Date;
  description: string;
  /**
   * Asset Holder Identities to be included (or excluded) from the Dividend Distribution. Inclusion/exclusion is controlled by the `treatment`
   *   property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
   *   the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Dividend Distribution
   */
  targets?: InputCorporateActionTargets;
  /**
   * default percentage (0-100) of the Benefits to be held for tax purposes
   */
  defaultTaxWithholding?: BigNumber;
  /**
   * percentage (0-100) of the Benefits to be held for tax purposes from individual Asset Holder Identities.
   *   This overrides the value of `defaultTaxWithholding`
   */
  taxWithholdings?: InputCorporateActionTaxWithholdings;
  /**
   * checkpoint to be used to calculate Dividends. If a Schedule is passed, the next Checkpoint it creates will be used.
   *   If a Date is passed, a Checkpoint will be created at that date and used
   */
  checkpoint: InputCaCheckpoint;
  /**
   * portfolio from which the Dividends will be distributed. Optional, defaults to the Dividend Distributions Agent's Default Portfolio
   */
  originPortfolio?: NumberedPortfolio | BigNumber;
  /**
   * ticker of the currency in which Dividends will be distributed
   */
  currency: string;
  /**
   * amount of `currency` to distribute per each share of the Asset that a target holds
   */
  perShare: BigNumber;
  /**
   * maximum amount of `currency` to distribute in total
   */
  maxAmount: BigNumber;
  /**
   * date from which Asset Holders can claim their Dividends
   */
  paymentDate: Date;
  /**
   * optional, defaults to never expiring
   */
  expiryDate?: Date;
}

export interface SetAssetDocumentsParams {
  /**
   * list of documents
   */
  documents: AssetDocument[];
}

export interface LaunchOfferingParams {
  /**
   * portfolio in which the Asset tokens to be sold are stored
   */
  offeringPortfolio: PortfolioLike;
  /**
   * portfolio in which the raised funds will be stored
   */
  raisingPortfolio: PortfolioLike;
  /**
   * ticker symbol of the currency in which the funds are being raised (e.g. 'USD' or 'CAD').
   *   Other Assets can be used as currency as well
   */
  raisingCurrency: string;
  /**
   * venue through which all offering related trades will be settled
   *   (optional, defaults to the first `Sto` type Venue owned by the owner of the Offering Portfolio.
   *   If passed, it must be of type `Sto`)
   */
  venue?: Venue;
  name: string;
  /**
   * start date of the Offering (optional, defaults to right now)
   */
  start?: Date;
  /**
   * end date of the Offering (optional, defaults to never)
   */
  end?: Date;
  /**
   * array of sale tiers. Each tier consists of an amount of Assets to be sold at a certain price.
   *   Tokens in a tier can only be bought when all tokens in previous tiers have been bought
   */
  tiers: OfferingTier[];
  /**
   * minimum amount that can be spent on this offering
   */
  minInvestment: BigNumber;
}

export interface CreateGroupParams {
  permissions:
    | {
        transactions: TransactionPermissions;
      }
    | {
        transactionGroups: TxGroup[];
      };
}

export interface InviteExternalAgentParams {
  target: string | Identity;
  permissions:
    | KnownPermissionGroup
    | CustomPermissionGroup
    | {
        transactions: TransactionPermissions | null;
      }
    | {
        transactionGroups: TxGroup[];
      };
  /**
   * date at which the authorization request for invitation expires (optional)
   *
   * @note if expiry date is not set, the invitation will never expire
   * @note due to chain limitations, the expiry will be ignored if the passed `permissions` don't correspond to an existing Permission Group
   */
  expiry?: Date;
}

export interface RemoveExternalAgentParams {
  target: string | Identity;
}

export interface LinkCaDocsParams {
  /**
   * list of documents
   */
  documents: AssetDocument[];
}

export interface LinkTickerToAssetParams {
  /**
   * The ticker to attach
   */
  ticker: string;
}

export interface ModifyCaCheckpointParams {
  checkpoint: InputCaCheckpoint | null;
}

export interface SetGroupPermissionsParams {
  permissions:
    | {
        transactions: TransactionPermissions;
      }
    | {
        transactionGroups: TxGroup[];
      };
}

export type ModifyVenueParams =
  | {
      description?: string;
      type: VenueType;
    }
  | {
      description: string;
      type?: VenueType;
    }
  | {
      description: string;
      type: VenueType;
    };

export interface TransferTickerOwnershipParams {
  target: string | Identity;
  /**
   * date at which the authorization request for transfer expires (optional)
   */
  expiry?: Date;
}

export enum AllowanceOperation {
  Set = 'Set',
  Increase = 'Increase',
  Decrease = 'Decrease',
}

export interface IncreaseAllowanceParams {
  /**
   * amount of POLYX to increase the allowance by
   */
  allowance: BigNumber;
  operation: AllowanceOperation.Increase;
}

export interface DecreaseAllowanceParams {
  /**
   * amount of POLYX to decrease the allowance by
   */
  allowance: BigNumber;
  operation: AllowanceOperation.Decrease;
}

export interface SetAllowanceParams {
  /**
   * amount of POLYX to set the allowance to
   */
  allowance: BigNumber;
  operation: AllowanceOperation.Set;
}

export type ModifyOfferingTimesParams =
  | {
      /**
       * new start time (optional, will be left the same if not passed)
       */
      start?: Date;
      /**
       * new end time (optional, will be left th same if not passed). A null value means the Offering doesn't end
       */
      end: Date | null;
    }
  | {
      start: Date;
      end?: Date | null;
    }
  | { start: Date; end: Date | null };

export interface InvestInOfferingParams {
  /**
   * portfolio in which the purchased Asset tokens will be stored
   */
  purchasePortfolio: PortfolioLike;
  /**
   * portfolio from which funds will be withdrawn to pay for the Asset tokens
   */
  fundingPortfolio: PortfolioLike;
  /**
   * amount of Asset tokens to purchase
   */
  purchaseAmount: BigNumber;
  /**
   * maximum average price to pay per Asset token (optional)
   */
  maxPrice?: BigNumber;
}

export interface RenamePortfolioParams {
  name: string;
}

export interface WaivePermissionsParams {
  asset: string | FungibleAsset;
}

export interface AssetBase {
  /**
   * Asset over which the Identity will be granted permissions
   */
  asset: string | FungibleAsset;
}

export interface TransactionsParams extends AssetBase {
  /**
   * a null value means full permissions
   */
  transactions: TransactionPermissions | null;
}

export interface TxGroupParams extends AssetBase {
  transactionGroups: TxGroup[];
}

/**
 * This procedure can be called with:
 *   - An Asset's existing Custom Permission Group. The Identity will be assigned as an Agent of that Group for that Asset
 *   - A Known Permission Group and an Asset. The Identity will be assigned as an Agent of that Group for that Asset
 *   - A set of Transaction Permissions and an Asset. If there is no Custom Permission Group with those permissions, a Custom Permission Group will be created for that Asset with those permissions, and
 *     the Identity will be assigned as an Agent of that Group for that Asset. Otherwise, the existing Group will be used
 *   - An array of {@link types!TxGroup | Transaction Groups} that represent a set of permissions. If there is no Custom Permission Group with those permissions, a Custom Permission Group will be created with those permissions, and
 *     the Identity will be assigned as an Agent of that Group for that Asset. Otherwise, the existing Group will be used
 */
export interface SetPermissionGroupParams {
  group: KnownPermissionGroup | CustomPermissionGroup | TransactionsParams | TxGroupParams;
}

export interface PayDividendsParams {
  targets: (string | Identity)[];
}

export interface SetCustodianParams {
  targetIdentity: string | Identity;
  expiry?: Date;
}

export interface MoveFundsParams {
  /**
   * portfolio (or portfolio ID) that will receive the funds. Optional, if no value is passed, the funds will be moved to the default Portfolio of this Portfolio's owner
   */
  to?: BigNumber | DefaultPortfolio | NumberedPortfolio;
  /**
   * list of Assets (and the corresponding token amounts) that will be moved
   */
  items: PortfolioMovement[];
}

export interface CreateTransactionBatchParams<ReturnValues extends readonly [...unknown[]]> {
  transactions: Readonly<TransactionArray<ReturnValues>>;
}

export interface CreateMultiSigParams {
  /**
   * @note Signer must be an Account as of v7
   */
  signers: Signer[];
  requiredSignatures: BigNumber;
  /**
   * Grants permissions to the MultiSig upon creation. The caller must be the primary key of the Identity for these to work
   */
  permissions?: PermissionsLike;
}

export interface ModifyMultiSigParams {
  /**
   * The MultiSig to be modified
   */
  multiSig: MultiSig;
  /**
   * The signer accounts to set for the MultiSig
   */
  signers?: Account[];
  /**
   * The required number of signatures for the MultiSig
   */
  requiredSignatures?: BigNumber;
}

export interface SetMultiSigAdminParams {
  /**
   * The identity to become an admin for the MultiSig. `null` will remove the current admin
   */
  admin: Identity | string | null;
}

export type SetMetadataParams =
  | { value: string; details?: MetadataValueDetails }
  | { details: MetadataValueDetails };

export type RegisterMetadataParams =
  | {
      name: string;
      specs: MetadataSpec;
    }
  | {
      name: string;
      specs: MetadataSpec;
      value: string;
      details?: MetadataValueDetails;
    };

export type SetVenueFilteringParams = {
  enabled?: boolean;
  allowedVenues?: BigNumber[];
  disallowedVenues?: BigNumber[];
};

export interface CreateChildIdentityParams {
  /**
   * The secondary key that will become the primary key of the new child Identity
   */
  secondaryKey: string | Account;
}

export interface ChildKeyWithAuth {
  /**
   * The key that will become the primary key of the new child Identity
   *
   * @note This key should not be linked to any other Identity
   */
  key: string | Account;
  /**
   * Off-chain authorization signature generated by `key` signing of the target Id authorization
   *
   * Target Id authorization consists of the target Identity (which will become the parent of the child Identity),
   * off chain authorization nonce of the target Identity and expiry date (same as `expiresAt` value) until which the off chain authorization will be valid.
   * Signature has to be generated encoding the target Id authorization value in the specified order.
   *
   * @note Nonce value can be fetched using {@link api/entities/Identity!Identity.getOffChainAuthorizationNonce | Identity.getOffChainAuthorizationNonce }
   * Signature can also be generated using the method {@link api/client/AccountManagement!AccountManagement.generateOffChainAuthSignature | accountManagement.generateOffChainAuthSignature }
   */
  authSignature: `0x${string}`;
}

export interface CreateChildIdentitiesParams {
  /**
   * Expiry date until which all the off chain authorizations received from each key will be valid
   */
  expiresAt: Date;

  /**
   * List of child keys along with their off chain authorization signatures
   */
  childKeyAuths: ChildKeyWithAuth[];
}

export interface UnlinkChildParams {
  child: string | ChildIdentity;
}

export interface RegisterCustomClaimTypeParams {
  name: string;
}

export interface AssetMediatorParams {
  mediators: (Identity | string)[];
}

export type AllowIdentityToCreatePortfoliosParams = {
  did: Identity | string;
};

export type RevokeIdentityToCreatePortfoliosParams = {
  did: Identity | string;
};

export interface RegisterCustomAssetTypeParams {
  name: string;
}

export interface BondPolyxParams {
  /**
   * The controller is the account responsible for managing staked POLYX. This can be the stash,
   * but designating a different key can make it easier to update nomination preferences and maintain
   * the POLYX in a more secure, but inconvenient, stash key.
   */
  controller: Account | string;

  /**
   * The account that should receive the stashing rewards
   */
  payee: Account | string;

  /**
   * Can be set to `true` if `rewardDestination` is the signing account. Auto stake will stake all rewards so the balance will compound
   */
  autoStake: boolean;

  /**
   * The amount of POLYX to bond (up to 6 decimals of precision)
   *
   * @note It is strongly recommended against bonding 100% an account's POLYX balance.
   * At the minimum a stash account needs enough POLYX to sign the unbond extrinsic ()
   */
  amount: BigNumber;
}

export interface SetStakingControllerParams {
  /**
   * The account responsible for managing the signing stash's staking preferences
   */
  controller: Account | string;
}

export interface SetStakingPayeeParams {
  /**
   * The account who will receive the staking rewards
   */
  payee: Account | string;

  /**
   * If set to true then rewards will be auto staked in order to compound
   * @note The payee must be the stash account in order to auto stake
   */
  autoStake: boolean;
}

export interface UpdatePolyxBondParams {
  /**
   * The amount of POLYX to unbond from staking
   */
  amount: BigNumber;
}

export interface NominateValidatorsParams {
  validators: (Account | string)[];
}

export interface BallotMotion {
  title: string;
  infoLink: string;
  choices: string[];
}

export interface BallotMeta {
  title: string;
  motions: BallotMotion[];
}

export interface CreateBallotParams {
  meta: BallotMeta;
  startDate: Date;
  endDate: Date;
  description: string;
  declarationDate?: Date;
  rcv?: boolean;
}

export type CorporateBallotParams = Omit<CreateBallotParams, 'declarationDate' | 'rcv'> & {
  rcv: boolean;
  declarationDate: Date;
};
