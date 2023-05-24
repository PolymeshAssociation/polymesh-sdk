import BigNumber from 'bignumber.js';

import {
  Account,
  Asset,
  AuthorizationRequest,
  CheckpointSchedule,
  CorporateActionBase,
  CustomPermissionGroup,
  DefaultPortfolio,
  Identity,
  KnownPermissionGroup,
  MultiSig,
  NumberedPortfolio,
  Venue,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  AddCountStatInput,
  AssetDocument,
  CalendarPeriod,
  ClaimCountStatInput,
  ClaimCountTransferRestriction,
  ClaimPercentageTransferRestriction,
  ClaimTarget,
  CountTransferRestriction,
  InputCaCheckpoint,
  InputCondition,
  InputCorporateActionTargets,
  InputCorporateActionTaxWithholdings,
  InputStatClaim,
  InputStatType,
  InputTargets,
  InputTaxWithholding,
  InputTrustedClaimIssuer,
  MetadataSpec,
  MetadataValueDetails,
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
  StatClaimIssuer,
  StatType,
  TransactionArray,
  TransactionPermissions,
  TxGroup,
  VenueType,
} from '~/types';
import { Modify } from '~/types/utils';

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

export type RemoveAssetStatParams = { ticker: string } & (
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

export type AddAssetStatParams = { ticker: string } & (
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

export interface TransferRestriction {
  type: TransferRestrictionType;
  value: BigNumber;
}

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
   * whether a single Asset token can be divided into decimal parts
   */
  isDivisible: boolean;
  /**
   * type of security that the Asset represents (e.g. Equity, Debt, Commodity). Common values are included in the
   *   {@link types!KnownAssetType} enum, but custom values can be used as well. Custom values must be registered on-chain the first time
   *   they're used, requiring an additional transaction. They aren't tied to a specific Asset
   */
  assetType: string;
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
   * If you do need to create a stat for an Asset after creation, you can use the { @link api/entities/Asset/TransferRestrictions/TransferRestrictionBase!TransferRestrictionBase.enableStat | enableStat } method in
   * the appropriate namespace
   */
  initialStatistics?: InputStatType[];
}

export interface CreateAssetWithTickerParams extends CreateAssetParams {
  ticker: string;
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

export type AddInstructionParams = {
  /**
   * array of Asset movements (amount, from, to, asset)
   */
  legs: {
    amount: BigNumber;
    from: PortfolioLike;
    to: PortfolioLike;
    asset: string | Asset;
  }[];
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
  venueId: BigNumber;
};

export interface AffirmInstructionParams {
  id: BigNumber;
}

export enum InstructionAffirmationOperation {
  Affirm = 'Affirm',
  Withdraw = 'Withdraw',
  Reject = 'Reject',
}

export interface ModifyInstructionAffirmationParams {
  id: BigNumber;
  operation: InstructionAffirmationOperation;
}

export interface ExecuteManualInstructionParams {
  id: BigNumber;
}

export interface CreateVenueParams {
  description: string;
  type: VenueType;
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

export type ModifyAssetParams =
  | {
      /**
       * makes an indivisible Asset divisible
       */
      makeDivisible?: true;
      name: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible: true;
      name?: string;
      fundingRound?: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound: string;
      identifiers?: SecurityIdentifier[];
    }
  | {
      makeDivisible?: true;
      name?: string;
      fundingRound?: string;
      identifiers: SecurityIdentifier[];
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
  amount: BigNumber;
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
   * The date from which to begin creating snapshots. A null value indicates immediately
   */
  start: Date | null;
  /**
   * The cadence with which to make Checkpoints.
   * @note A null value indicates to create only one Checkpoint, regardless of repetitions specified. This can be used to schedule the creation of a Checkpoint in the future
   */
  period: CalendarPeriod | null;
  /**
   * The number of snapshots to take. A null value indicates snapshots should be made indefinitely
   */
  repetitions: BigNumber | null;
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
  asset: string | Asset;
}

export interface AssetBase {
  /**
   * Asset over which the Identity will be granted permissions
   */
  asset: string | Asset;
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
  signers: Signer[];
  requiredSignatures: BigNumber;
}

export interface ModifyMultiSigParams {
  /**
   * The MultiSig to be modified
   */
  multiSig: MultiSig;
  /**
   * The signers to set for the MultiSig
   */
  signers: Signer[];
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
