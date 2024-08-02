import BigNumber from 'bignumber.js';

import {
  Account as AccountClass,
  AuthorizationRequest as AuthorizationRequestClass,
  BaseAsset,
  Checkpoint as CheckpointClass,
  CheckpointSchedule as CheckpointScheduleClass,
  ChildIdentity as ChildIdentityClass,
  CorporateAction as CorporateActionClass,
  CustomPermissionGroup as CustomPermissionGroupClass,
  DefaultPortfolio as DefaultPortfolioClass,
  DefaultTrustedClaimIssuer as DefaultTrustedClaimIssuerClass,
  DividendDistribution as DividendDistributionClass,
  FungibleAsset as FungibleAssetClass,
  Identity as IdentityClass,
  Instruction as InstructionClass,
  KnownPermissionGroup as KnownPermissionGroupClass,
  MetadataEntry as MetadataEntryClass,
  MultiSig as MultiSigClass,
  MultiSigProposal as MultiSigProposalClass,
  Nft as NftClass,
  NftCollection as NftCollectionClass,
  NumberedPortfolio as NumberedPortfolioClass,
  Offering as OfferingClass,
  Subsidy as SubsidyClass,
  TickerReservation as TickerReservationClass,
  Venue as VenueClass,
} from '~/internal';
import {
  CountryCode,
  DividendDistributionDetails,
  ModuleName,
  OfferingDetails,
  Role,
  ScheduleDetails,
  SubsidyData,
  TxGroup,
  TxTag,
} from '~/types';
import { Modify } from '~/types/utils';

export type Account = AccountClass;
export type MultiSig = MultiSigClass;
export type MultiSigProposal = MultiSigProposalClass;
export type AuthorizationRequest = AuthorizationRequestClass;
export type Checkpoint = CheckpointClass;
export type CheckpointSchedule = CheckpointScheduleClass;
export type CorporateAction = CorporateActionClass;
export type CustomPermissionGroup = CustomPermissionGroupClass;
export type DefaultPortfolio = DefaultPortfolioClass;
export type DefaultTrustedClaimIssuer = DefaultTrustedClaimIssuerClass;
export type DividendDistribution = DividendDistributionClass;
export type Identity = IdentityClass;
export type ChildIdentity = ChildIdentityClass;
export type Instruction = InstructionClass;
export type KnownPermissionGroup = KnownPermissionGroupClass;
export type NumberedPortfolio = NumberedPortfolioClass;
export type FungibleAsset = FungibleAssetClass;
export type Nft = NftClass;
export type NftCollection = NftCollectionClass;
export type MetadataEntry = MetadataEntryClass;
export type Offering = OfferingClass;
export type TickerReservation = TickerReservationClass;
export type Venue = VenueClass;
export type Subsidy = SubsidyClass;

export * from './CheckpointSchedule/types';
export * from './CorporateActionBase/types';
export * from './DividendDistribution/types';
export * from './Instruction/types';
export * from './Portfolio/types';
export * from './Asset/types';
export * from './Offering/types';
export * from './TickerReservation/types';
export * from './Venue/types';
export * from './Subsidy/types';
export * from './Account/types';
export * from './Account/MultiSig/types';
export * from './MultiSigProposal/types';
export * from './MetadataEntry/types';

export type SubCallback<T> = (result: T) => void | Promise<void>;

export type UnsubCallback = () => void;

export interface PaginationOptions {
  size: BigNumber;
  start?: string;
}

export type NextKey = string | BigNumber | null;

export interface ResultSet<T> {
  data: T[];
  next: NextKey;
  /**
   * @note methods will have `count` defined when middleware is configured, but be undefined otherwise. This happens when the chain node is queried directly
   */
  count?: BigNumber;
}

export enum SignerType {
  /* eslint-disable @typescript-eslint/no-shadow */
  Identity = 'Identity',
  Account = 'Account',
  /* eslint-enable @typescript-eslint/no-shadow */
}

export interface SignerValue {
  /**
   * whether the signer is an Account or Identity
   */
  type: SignerType;
  /**
   * address or DID (depending on whether the signer is an Account or Identity)
   */
  value: string;
}

/**
 * Type of Authorization Request
 */
export enum AuthorizationType {
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  RotatePrimaryKey = 'RotatePrimaryKey',
  TransferTicker = 'TransferTicker',
  AddMultiSigSigner = 'AddMultiSigSigner',
  TransferAssetOwnership = 'TransferAssetOwnership',
  JoinIdentity = 'JoinIdentity',
  PortfolioCustody = 'PortfolioCustody',
  BecomeAgent = 'BecomeAgent',
  AddRelayerPayingKey = 'AddRelayerPayingKey',
  RotatePrimaryKeyToSecondary = 'RotatePrimaryKeyToSecondary',
}

export enum ConditionTarget {
  Sender = 'Sender',
  Receiver = 'Receiver',
  Both = 'Both',
}

export enum ScopeType {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Identity = 'Identity',
  /**
   * @deprecated in favour of Asset
   */
  Ticker = 'Ticker',
  Asset = 'Asset',
  Custom = 'Custom',
}

export interface Scope {
  type: ScopeType;
  value: string;
}

export enum ClaimType {
  Accredited = 'Accredited',
  Affiliate = 'Affiliate',
  BuyLockup = 'BuyLockup',
  SellLockup = 'SellLockup',
  CustomerDueDiligence = 'CustomerDueDiligence',
  KnowYourCustomer = 'KnowYourCustomer',
  Jurisdiction = 'Jurisdiction',
  Exempted = 'Exempted',
  Blocked = 'Blocked',
  Custom = 'Custom',
}

export interface AccreditedClaim {
  type: ClaimType.Accredited;
  scope: Scope;
}

export interface AffiliateClaim {
  type: ClaimType.Affiliate;
  scope: Scope;
}

export interface BuyLockupClaim {
  type: ClaimType.BuyLockup;
  scope: Scope;
}

export interface SellLockupClaim {
  type: ClaimType.SellLockup;
  scope: Scope;
}

export interface CddClaim {
  type: ClaimType.CustomerDueDiligence;
  id: string;
}

export interface KycClaim {
  type: ClaimType.KnowYourCustomer;
  scope: Scope;
}

export interface JurisdictionClaim {
  type: ClaimType.Jurisdiction;
  code: CountryCode;
  scope: Scope;
}

export interface ExemptedClaim {
  type: ClaimType.Exempted;
  scope: Scope;
}

export interface CustomClaim {
  type: ClaimType.Custom;
  scope: Scope;
  customClaimTypeId: BigNumber;
}

export interface BlockedClaim {
  type: ClaimType.Blocked;
  scope: Scope;
}

export type ScopedClaim =
  | JurisdictionClaim
  | AccreditedClaim
  | AffiliateClaim
  | BuyLockupClaim
  | SellLockupClaim
  | KycClaim
  | ExemptedClaim
  | BlockedClaim
  | CustomClaim;

export type UnscopedClaim = CddClaim;

export type Claim = ScopedClaim | UnscopedClaim;

export interface ClaimData<ClaimType = Claim> {
  target: Identity;
  issuer: Identity;
  issuedAt: Date;
  lastUpdatedAt: Date;
  expiry: Date | null;
  claim: ClaimType;
}

export type StatClaimType = ClaimType.Accredited | ClaimType.Affiliate | ClaimType.Jurisdiction;

export interface StatJurisdictionClaimInput {
  type: ClaimType.Jurisdiction;
  countryCode?: CountryCode;
}

export interface StatAccreditedClaimInput {
  type: ClaimType.Accredited;
  accredited: boolean;
}

export interface StatAffiliateClaimInput {
  type: ClaimType.Affiliate;
  affiliate: boolean;
}

export type InputStatClaim =
  | StatJurisdictionClaimInput
  | StatAccreditedClaimInput
  | StatAffiliateClaimInput;

export type InputStatType =
  | {
      type: StatType.Count | StatType.Balance;
    }
  | {
      type: StatType.ScopedCount | StatType.ScopedBalance;
      claimIssuer: StatClaimIssuer;
    };

/**
 * Represents the StatType from the `statistics` module.
 *
 * @note the chain doesn't use "Scoped" types, but they are needed here to discriminate the input instead of having an optional input
 */
export enum StatType {
  Count = 'Count',
  Balance = 'Balance',
  /**
   * ScopedCount is an SDK only type, on chain it is `Count` with a claimType option present
   */
  ScopedCount = 'ScopedCount',
  /**
   * ScopedPercentage is an SDK only type, on chain it is `Balance` with a claimType option present
   */
  ScopedBalance = 'ScopedBalance',
}
export interface IdentityWithClaims {
  identity: Identity;
  claims: ClaimData[];
}

export interface ClaimScope {
  scope: Scope | null;
  ticker?: string;
}

/**
 * @param IsDefault - whether the Identity is a default trusted claim issuer for an asset or just
 *   for a specific compliance condition. Defaults to false
 */
export interface TrustedClaimIssuer<IsDefault extends boolean = false> {
  identity: IsDefault extends true ? DefaultTrustedClaimIssuer : Identity;
  /**
   * a null value means that the issuer is trusted for all claim types
   */
  trustedFor: ClaimType[] | null;
}

export type InputTrustedClaimIssuer = Modify<
  TrustedClaimIssuer,
  {
    identity: string | Identity;
  }
>;

export enum ConditionType {
  IsPresent = 'IsPresent',
  IsAbsent = 'IsAbsent',
  IsAnyOf = 'IsAnyOf',
  IsNoneOf = 'IsNoneOf',
  IsExternalAgent = 'IsExternalAgent',
  IsIdentity = 'IsIdentity',
}

export interface ConditionBase {
  target: ConditionTarget;
  /**
   * if undefined, the default trusted claim issuers for the Asset are used
   */
  trustedClaimIssuers?: TrustedClaimIssuer[];
}

export type InputConditionBase = Modify<
  ConditionBase,
  {
    /**
     * if undefined, the default trusted claim issuers for the Asset are used
     */
    trustedClaimIssuers?: InputTrustedClaimIssuer[];
  }
>;

export interface SingleClaimCondition {
  type: ConditionType.IsPresent | ConditionType.IsAbsent;
  claim: Claim;
}

export interface MultiClaimCondition {
  type: ConditionType.IsAnyOf | ConditionType.IsNoneOf;
  claims: Claim[];
}

export interface IdentityCondition {
  type: ConditionType.IsIdentity;
  identity: Identity;
}

export interface ExternalAgentCondition {
  type: ConditionType.IsExternalAgent;
}

export type Condition = (
  | SingleClaimCondition
  | MultiClaimCondition
  | IdentityCondition
  | ExternalAgentCondition
) &
  ConditionBase;

export type InputCondition = (
  | SingleClaimCondition
  | MultiClaimCondition
  | Modify<
      IdentityCondition,
      {
        identity: string | Identity;
      }
    >
  | ExternalAgentCondition
) &
  InputConditionBase;

export interface Requirement {
  id: BigNumber;
  conditions: Condition[];
}

export interface ComplianceRequirements {
  requirements: Requirement[];
  /**
   * used for conditions where no trusted claim issuers were specified
   */
  defaultTrustedClaimIssuers: TrustedClaimIssuer[];
}

export type InputRequirement = Modify<Requirement, { conditions: InputCondition[] }>;

export interface ConditionCompliance {
  condition: Condition;
  complies: boolean;
}

export interface RequirementCompliance {
  id: BigNumber;
  conditions: ConditionCompliance[];
  complies: boolean;
}

export interface Compliance {
  requirements: RequirementCompliance[];
  complies: boolean;
}

export interface ClaimTarget {
  target: string | Identity;
  claim: Claim;
  expiry?: Date;
}

export type AttestPrimaryKeyRotationAuthorizationData = {
  type: AuthorizationType.AttestPrimaryKeyRotation;
  value: Identity;
};

export type RotatePrimaryKeyAuthorizationData = {
  type: AuthorizationType.RotatePrimaryKey;
};

export type RotatePrimaryKeyToSecondaryData = {
  type: AuthorizationType.RotatePrimaryKeyToSecondary;
  value: Permissions;
};

export type JoinIdentityAuthorizationData = {
  type: AuthorizationType.JoinIdentity;
  value: Permissions;
};

export type PortfolioCustodyAuthorizationData = {
  type: AuthorizationType.PortfolioCustody;
  value: NumberedPortfolio | DefaultPortfolio;
};

export type BecomeAgentAuthorizationData = {
  type: AuthorizationType.BecomeAgent;
  value: KnownPermissionGroup | CustomPermissionGroup;
};

export type AddRelayerPayingKeyAuthorizationData = {
  type: AuthorizationType.AddRelayerPayingKey;
  value: SubsidyData;
};

export type GenericAuthorizationData = {
  type: Exclude<
    AuthorizationType,
    | AuthorizationType.RotatePrimaryKey
    | AuthorizationType.JoinIdentity
    | AuthorizationType.PortfolioCustody
    | AuthorizationType.BecomeAgent
    | AuthorizationType.AddRelayerPayingKey
    | AuthorizationType.RotatePrimaryKeyToSecondary
    | AuthorizationType.AttestPrimaryKeyRotation
  >;
  value: string;
};
/**
 * Authorization request data corresponding to type
 */
export type Authorization =
  | AttestPrimaryKeyRotationAuthorizationData
  | RotatePrimaryKeyAuthorizationData
  | JoinIdentityAuthorizationData
  | PortfolioCustodyAuthorizationData
  | BecomeAgentAuthorizationData
  | AddRelayerPayingKeyAuthorizationData
  | RotatePrimaryKeyToSecondaryData
  | GenericAuthorizationData;

interface TransferRestrictionBase {
  /**
   * array of Identity IDs that are exempted from the Restriction
   */
  exemptedIds?: string[];
}

export interface CountTransferRestriction extends TransferRestrictionBase {
  count: BigNumber;
}

export interface PercentageTransferRestriction extends TransferRestrictionBase {
  /**
   * maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once
   */
  percentage: BigNumber;
}
export interface ClaimCountTransferRestriction extends TransferRestrictionBase {
  /**
   * The type of investors this restriction applies to. e.g. non-accredited
   */
  claim: InputStatClaim;
  /**
   * The minimum amount of investors the must meet the Claim criteria
   */
  min: BigNumber;
  /**
   * The maximum amount of investors that must meet the Claim criteria
   */
  max?: BigNumber;

  issuer: Identity;
}
export interface ClaimPercentageTransferRestriction extends TransferRestrictionBase {
  /**
   * The type of investors this restriction applies to. e.g. Canadian investor
   */
  claim: InputStatClaim;
  /**
   * The minimum percentage of the total supply that investors meeting the Claim criteria must hold
   */
  min: BigNumber;
  /**
   * The maximum percentage of the total supply that investors meeting the Claim criteria must hold
   */
  max: BigNumber;

  issuer: Identity;
}

export interface ActiveTransferRestrictions<
  Restriction extends
    | CountTransferRestriction
    | PercentageTransferRestriction
    | ClaimCountTransferRestriction
    | ClaimPercentageTransferRestriction
> {
  restrictions: Restriction[];
  /**
   * amount of restrictions that can be added before reaching the shared limit
   */
  availableSlots: BigNumber;
}

export interface AddCountStatInput {
  count: BigNumber;
}

export interface StatClaimIssuer {
  issuer: Identity;
  claimType: StatClaimType;
}

export type ClaimCountStatInput =
  | {
      issuer: Identity;
      claimType: ClaimType.Accredited;
      value: { accredited: BigNumber; nonAccredited: BigNumber };
    }
  | {
      issuer: Identity;
      claimType: ClaimType.Affiliate;
      value: { affiliate: BigNumber; nonAffiliate: BigNumber };
    }
  | {
      issuer: Identity;
      claimType: ClaimType.Jurisdiction;
      value: { countryCode: CountryCode; count: BigNumber }[];
    };

export interface ScheduleWithDetails {
  schedule: CheckpointSchedule;
  details: ScheduleDetails;
}

export interface DistributionWithDetails {
  distribution: DividendDistribution;
  details: DividendDistributionDetails;
}

export interface DistributionPayment {
  blockNumber: BigNumber;
  blockHash: string;
  date: Date;
  target: Identity;
  amount: BigNumber;
  /**
   * percentage (0-100) of tax withholding for the `target` identity
   */
  withheldTax: BigNumber;
}

export enum PermissionType {
  Include = 'Include',
  Exclude = 'Exclude',
}

/**
 * Signer/agent permissions for a specific type
 *
 * @param T - type of Permissions (Asset, Transaction, Portfolio, etc)
 */
export interface SectionPermissions<T> {
  /**
   * Values to be included/excluded
   */
  values: T[];
  /**
   * Whether the permissions are inclusive or exclusive
   */
  type: PermissionType;
}

/**
 * Permissions related to Transactions. Can include/exclude individual transactions or entire modules
 */
export interface TransactionPermissions extends SectionPermissions<TxTag | ModuleName> {
  /**
   * Transactions to be exempted from inclusion/exclusion. This allows more granularity when
   *   setting permissions. For example, let's say we want to include only the `asset` and `staking` modules,
   *   but exclude the `asset.registerTicker` transaction. We could add both modules to `values`, and add
   *   `TxTags.asset.registerTicker` to `exceptions`
   */
  exceptions?: TxTag[];
}

/**
 * Permissions a Secondary Key has over the Identity. A null value means the key has
 *   all permissions of that type (e.g. if `assets` is null, the key has permissions over all
 *   of the Identity's Assets)
 */
export interface Permissions {
  /**
   * Assets over which this key has permissions
   */
  assets: SectionPermissions<FungibleAsset> | null;
  /**
   * Transactions this key can execute
   */
  transactions: TransactionPermissions | null;
  /**
   * list of Transaction Groups this key can execute. Having permissions over a TxGroup
   *   means having permissions over every TxTag in said group. Partial group permissions are not
   *   covered by this value. For a full picture of transaction permissions, see the `transactions` property
   *
   * NOTE: If transactions is null, ignore this value
   */
  transactionGroups: TxGroup[];
  /* list of Portfolios over which this key has permissions */
  portfolios: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null;
}

/**
 * Asset permissions shared by agents in a group
 */
export type GroupPermissions = Pick<Permissions, 'transactions' | 'transactionGroups'>;

/**
 * All Permission Groups of a specific Asset, separated by `known` and `custom`
 */
export interface PermissionGroups {
  known: KnownPermissionGroup[];
  custom: CustomPermissionGroup[];
}

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an Account has certain
 *   permissions. Null values represent full permissions in that category
 */
export interface SimplePermissions {
  /**
   * list of required Asset permissions
   */
  assets?: BaseAsset[] | null;
  /**
   * list of required Transaction permissions
   */
  transactions?: TxTag[] | null;
  /* list of required Portfolio permissions */
  portfolios?: (DefaultPortfolio | NumberedPortfolio)[] | null;
}

/**
 * Result of a `checkRoles` call
 */
export interface CheckRolesResult {
  /**
   * required roles which the Identity *DOESN'T* have. Only present if `result` is `false`
   */
  missingRoles?: Role[];
  /**
   * whether the signer possesses all the required roles or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}

/**
 * Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
 *   has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
 *   Identity has all the necessary external agent Permissions
 */
export interface CheckPermissionsResult<Type extends SignerType> {
  /**
   * required permissions which the signer *DOESN'T* have. Only present if `result` is `false`
   */
  missingPermissions?: Type extends SignerType.Account ? SimplePermissions : TxTag[] | null;
  /**
   * whether the signer complies with the required permissions or not
   */
  result: boolean;
  /**
   * optional message explaining the reason for failure in special cases
   */
  message?: string;
}

export enum PermissionGroupType {
  /**
   * all transactions authorized
   */
  Full = 'Full',
  /**
   * not authorized:
   *   - externalAgents
   */
  ExceptMeta = 'ExceptMeta',
  /**
   * authorized:
   *   - corporateAction
   *   - corporateBallot
   *   - capitalDistribution
   */
  PolymeshV1Caa = 'PolymeshV1Caa',
  /**
   * authorized:
   *   - asset.issue
   *   - asset.redeem
   *   - asset.controllerTransfer
   *   - sto (except for sto.invest)
   */
  PolymeshV1Pia = 'PolymeshV1Pia',
}

export type Signer = Identity | Account;

export interface OfferingWithDetails {
  offering: Offering;
  details: OfferingDetails;
}

export interface CheckpointWithData {
  checkpoint: Checkpoint;
  createdAt: Date;
  totalSupply: BigNumber;
}

export interface PermissionedAccount {
  account: Account | MultiSig;
  permissions: Permissions;
}

export type PortfolioLike =
  | string
  | Identity
  | NumberedPortfolio
  | DefaultPortfolio
  | { identity: string | Identity; id: BigNumber };

/**
 * Permissions to grant to a Signer over an Identity
 *
 * {@link Permissions}
 *
 * @note TxGroups in the `transactionGroups` array will be transformed into their corresponding `TxTag`s
 */
export type PermissionsLike = {
  /**
   * Assets on which to grant permissions. A null value represents full permissions
   */
  assets?: SectionPermissions<string | FungibleAsset> | null;
  /**
   * Portfolios on which to grant permissions. A null value represents full permissions
   */
  portfolios?: SectionPermissions<PortfolioLike> | null;
  /**
   * transaction that the Secondary Key has permission to execute. A null value represents full permissions
   */
} & (
  | {
      transactions?: TransactionPermissions | null;
    }
  | {
      transactionGroups?: TxGroup[];
    }
);

export interface FungiblePortfolioMovement {
  asset: string | FungibleAsset;
  amount: BigNumber;
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
}

export type NonFungiblePortfolioMovement = {
  asset: NftCollection | string;
  nfts: (Nft | BigNumber)[];
  /**
   * identifier string to help differentiate transfers
   */
  memo?: string;
};

export type PortfolioMovement = FungiblePortfolioMovement | NonFungiblePortfolioMovement;

export type ActiveStats = {
  isSet: boolean;
  claims?: { claimType: ClaimType; issuer: Identity }[];
};
