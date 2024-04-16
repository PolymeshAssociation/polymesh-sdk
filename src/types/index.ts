/* istanbul ignore file */

import { BaseAsset } from '@polymeshassociation/polymesh-sdk/internal';
import { ConfidentialTransactionStatusEnum } from '@polymeshassociation/polymesh-sdk/middleware/types';
import {
  CddProviderRole,
  DefaultPortfolio,
  EventIdEnum,
  GenericPolymeshTransaction,
  IdentityRole,
  NumberedPortfolio,
  PortfolioCustodianRole,
  ProcedureAuthorizationStatus,
  ProcedureOpts,
  SectionPermissions,
  SignerType,
  TickerOwnerRole,
  VenueOwnerRole,
} from '@polymeshassociation/polymesh-sdk/types';
import BigNumber from 'bignumber.js';

import { CountryCode, ModuleName, TxTag, TxTags } from '~/generated/types';
import { CheckPermissionsResult } from '~/types/internal';

export { EventRecord } from '@polkadot/types/interfaces';
export { ConnectParams } from '~/api/client/Polymesh';
export * from '~/api/entities/types';
export * from '~/api/procedures/types';
export * from '@polymeshassociation/polymesh-sdk/base/types';
export * from '~/generated/types';

export {
  AssetHoldersOrderBy,
  AuthTypeEnum,
  AuthorizationStatusEnum,
  BalanceTypeEnum,
  CallIdEnum,
  EventIdEnum,
  ExtrinsicsOrderBy,
  InstructionStatusEnum,
  ModuleIdEnum,
  MultiSigProposalVoteActionEnum,
  NftHoldersOrderBy,
  Scalars,
  SettlementResultEnum,
} from '@polymeshassociation/polymesh-sdk/middleware/types';
export {
  ClaimScopeTypeEnum,
  MiddlewareScope,
  SettlementDirectionEnum,
} from '@polymeshassociation/polymesh-sdk/middleware/typesV1';
export { CountryCode, ModuleName, TxTag, TxTags };

// Roles

export enum RoleType {
  TickerOwner = 'TickerOwner',
  CddProvider = 'CddProvider',
  VenueOwner = 'VenueOwner',
  PortfolioCustodian = 'PortfolioCustodian',
  CorporateActionsAgent = 'CorporateActionsAgent',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Identity = 'Identity',
  ConfidentialAssetOwner = 'ConfidentialAssetOwner',
  ConfidentialVenueOwner = 'ConfidentialVenueOwner',
}
export interface ConfidentialAssetOwnerRole {
  type: RoleType.ConfidentialAssetOwner;
  assetId: string;
}

export interface ConfidentialVenueOwnerRole {
  type: RoleType.ConfidentialVenueOwner;
  venueId: BigNumber;
}

export type Role =
  | TickerOwnerRole
  | CddProviderRole
  | VenueOwnerRole
  | PortfolioCustodianRole
  | IdentityRole
  | ConfidentialAssetOwnerRole
  | ConfidentialVenueOwnerRole;

export interface ConfidentialOptionalArgsProcedureMethod<
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

/**
 * Represents the permissions that a signer must have in order to run a Procedure. In some cases, this must be determined
 *   in a special way for the specific Procedure. In those cases, the resulting value will either be `true` if the signer can
 *   run the procedure, or a string message indicating why the signer *CAN'T* run the Procedure
 */
export interface ConfidentialProcedureAuthorization {
  /**
   * general permissions that apply to both Secondary Key Accounts and External
   *   Agent Identities. Overridden by `signerPermissions` and `agentPermissions` respectively
   */
  permissions?: ConfidentialSimplePermissions | true | string;
  /**
   * permissions specific to secondary Accounts. This value takes precedence over `permissions` for
   *   secondary Accounts
   */
  signerPermissions?: ConfidentialSimplePermissions | true | string;
  /**
   * permissions specific to External Agent Identities. This value takes precedence over `permissions` for
   *   External Agents
   */
  agentPermissions?: Omit<ConfidentialSimplePermissions, 'portfolios'> | true | string;
  roles?: Role[] | true | string;
}

/**
 * This represents positive permissions (i.e. only "includes"). It is used
 *   for specifying procedure requirements and querying if an Account has certain
 *   permissions. Null values represent full permissions in that category
 */
export interface ConfidentialSimplePermissions {
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
export interface ConfidentialCheckRolesResult {
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

export interface ConfidentialProcedureAuthorizationStatus {
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
  roles: ConfidentialCheckRolesResult;
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

export interface ConfidentialProcedureMethod<
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
  ) => Promise<ConfidentialProcedureAuthorizationStatus>;
}

export interface ConfidentialNoArgsProcedureMethod<
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue
> {
  (opts?: ProcedureOpts): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>>;
  checkAuthorization: (opts?: ProcedureOpts) => Promise<ConfidentialProcedureAuthorizationStatus>;
}

export type ConfidentialAssetHistoryByConfidentialAccountArgs = {
  accountId: string;
  eventId?:
    | EventIdEnum.AccountDepositIncoming
    | EventIdEnum.AccountDeposit
    | EventIdEnum.AccountWithdraw;
  assetId?: string;
};

export type ConfidentialTransactionsByConfidentialAccountArgs = {
  accountId: string;
  direction: 'Incoming' | 'Outgoing' | 'All';
  status?: ConfidentialTransactionStatusEnum;
};

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
