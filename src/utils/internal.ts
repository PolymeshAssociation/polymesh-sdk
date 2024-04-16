import { RistrettoPoint } from '@noble/curves/ed25519';
import { hexStripPrefix } from '@polkadot/util';
import { getMissingAssetPermissions } from '@polymeshassociation/polymesh-sdk/api/entities/Account/helpers';
import {
  Account,
  DefaultPortfolio,
  ErrorCode,
  GenericPolymeshTransaction,
  Identity,
  NumberedPortfolio,
  PermissionType,
  ProcedureOpts,
  SectionPermissions,
  SignerType,
} from '@polymeshassociation/polymesh-sdk/types';
import { UnionOfProcedureFuncs } from '@polymeshassociation/polymesh-sdk/types/utils';
import {
  identityIdToString,
  portfolioIdToPortfolio,
  portfolioToPortfolioId,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  isCddProviderRole,
  isIdentityRole,
  isPortfolioCustodianRole,
  isTickerOwnerRole,
  isVenueOwnerRole,
} from '@polymeshassociation/polymesh-sdk/utils/typeguards';
import P from 'bluebird';
import { difference, differenceWith, intersection, intersectionWith, isEqual, union } from 'lodash';

import {
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialVenue,
  Context,
  PolymeshError,
  TickerReservation,
  Venue,
} from '~/internal';
import {
  ConfidentialCheckRolesResult,
  ConfidentialNoArgsProcedureMethod,
  ConfidentialOptionalArgsProcedureMethod,
  ConfidentialProcedureAuthorizationStatus,
  ConfidentialProcedureMethod,
  ModuleName,
  Role,
  TransactionPermissions,
  TxTag,
  TxTags,
} from '~/types';
import { CheckPermissionsResult, SimplePermissions } from '~/types/internal';
import { ConfidentialProcedureFunc } from '~/types/utils';
import { isConfidentialAssetOwnerRole, isConfidentialVenueOwnerRole } from '~/utils';

export * from '~/generated/utils';

/**
 * @hidden
 */
export function assertElgamalPubKeyValid(publicKey: string): void {
  try {
    RistrettoPoint.fromHex(hexStripPrefix(publicKey));
  } catch (err) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied public key is not a valid ElGamal public key',
      data: { publicKey },
    });
  }
}

/**
 * @hidden
 */
export function assertCaAssetValid(id: string): string {
  if (id.length >= 32) {
    let assetId = id;

    if (id.length === 32) {
      assetId = `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(
        12,
        16
      )}-${id.substring(16, 20)}-${id.substring(20)}`;
    }

    const assetIdRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (assetIdRegex.test(assetId)) {
      return assetId;
    }
  }

  throw new PolymeshError({
    code: ErrorCode.ValidationError,
    message: 'The supplied ID is not a valid confidential Asset ID',
    data: { id },
  });
}

/**
 * @hidden
 */
export function asConfidentialAccount(
  account: string | ConfidentialAccount,
  context: Context
): ConfidentialAccount {
  if (account instanceof ConfidentialAccount) {
    return account;
  }

  return new ConfidentialAccount({ publicKey: account }, context);
}

/**
 * @hidden
 */
export function asConfidentialAsset(
  asset: string | ConfidentialAsset,
  context: Context
): ConfidentialAsset {
  if (asset instanceof ConfidentialAsset) {
    return asset;
  }

  return new ConfidentialAsset({ id: asset }, context);
}

/**
 * Create a method that prepares a procedure
 */
export function createConfidentialProcedureMethod<
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: () => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    voidArgs: true;
  },
  context: Context
): ConfidentialNoArgsProcedureMethod<ProcedureReturnValue, ProcedureReturnValue>;
export function createConfidentialProcedureMethod<
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: () => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    voidArgs: true;
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): ConfidentialNoArgsProcedureMethod<ProcedureReturnValue, ReturnValue>;
export function createConfidentialProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs?: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    optionalArgs: true;
  },
  context: Context
): ConfidentialOptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ProcedureReturnValue>;
export function createConfidentialProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    optionalArgs: true;
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): ConfidentialOptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>;
export function createConfidentialProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs extends {},
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
  },
  context: Context
): ConfidentialProcedureMethod<MethodArgs, ProcedureReturnValue, ProcedureReturnValue>;
export function createConfidentialProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs extends {},
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): ConfidentialProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>;
// eslint-disable-next-line require-jsdoc
export function createConfidentialProcedureMethod<
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs?: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ConfidentialProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    transformer?: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
    voidArgs?: true;
    optionalArgs?: true;
  },
  context: Context
):
  | ConfidentialProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>
  | ConfidentialOptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>
  | ConfidentialNoArgsProcedureMethod<ProcedureReturnValue, ReturnValue> {
  const { getProcedureAndArgs, transformer, voidArgs, optionalArgs } = args;

  if (voidArgs) {
    const voidMethod = (
      opts: ProcedureOpts = {}
    ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
      const [proc, procArgs] = getProcedureAndArgs();
      return proc().prepare({ args: procArgs, transformer }, context, opts);
    };

    voidMethod.checkAuthorization = async (
      opts: ProcedureOpts = {}
    ): Promise<ConfidentialProcedureAuthorizationStatus> => {
      const [proc, procArgs] = getProcedureAndArgs();

      return proc().checkAuthorization(procArgs, context, opts);
    };

    return voidMethod;
  }

  if (optionalArgs) {
    const methodWithOptionalArgs = (
      methodArgs?: MethodArgs,
      opts: ProcedureOpts = {}
    ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
      const [proc, procArgs] = getProcedureAndArgs(methodArgs);
      return proc().prepare({ args: procArgs, transformer }, context, opts);
    };

    methodWithOptionalArgs.checkAuthorization = async (
      methodArgs?: MethodArgs,
      opts: ProcedureOpts = {}
    ): Promise<ConfidentialProcedureAuthorizationStatus> => {
      const [proc, procArgs] = getProcedureAndArgs(methodArgs);

      return proc().checkAuthorization(procArgs, context, opts);
    };

    return methodWithOptionalArgs;
  }

  const method = (
    methodArgs: MethodArgs,
    opts: ProcedureOpts = {}
  ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);
    return proc().prepare({ args: procArgs, transformer }, context, opts);
  };

  method.checkAuthorization = async (
    methodArgs: MethodArgs,
    opts: ProcedureOpts = {}
  ): Promise<ConfidentialProcedureAuthorizationStatus> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);

    return proc().checkAuthorization(procArgs, context, opts);
  };

  return method;
}

/**
 * @hidden
 * Compare two tags/modules and return true if they are equal, or if one is the other one's module
 */
export function isModuleOrTagMatch(a: TxTag | ModuleName, b: TxTag | ModuleName): boolean {
  const aIsTag = a.includes('.');
  const bIsTag = b.includes('.');

  // a tag b module
  if (aIsTag && !bIsTag) {
    return a.split('.')[0] === b;
  }

  // a module b tag
  if (!aIsTag && bIsTag) {
    return a === b.split('.')[0];
  }

  // both tags or both modules
  return a === b;
}

/**
 * @hidden
 *
 * Calculate the difference between the required Transaction permissions and the current ones
 */
export function getMissingTransactionPermissions(
  requiredPermissions: TxTag[] | null | undefined,
  currentPermissions: TransactionPermissions | null
): SimplePermissions['transactions'] {
  // these transactions are allowed to any Account, independent of permissions
  const exemptedTransactions: (TxTag | ModuleName)[] = [
    TxTags.identity.LeaveIdentityAsKey,
    TxTags.identity.JoinIdentityAsKey,
    TxTags.multiSig.AcceptMultisigSignerAsKey,
    ...difference(Object.values(TxTags.balances), [
      TxTags.balances.DepositBlockRewardReserveBalance,
      TxTags.balances.BurnAccountBalance,
    ]),
    ModuleName.Staking,
    ModuleName.Sudo,
    ModuleName.Session,
    ModuleName.Authorship,
    ModuleName.Babe,
    ModuleName.Grandpa,
    ModuleName.ImOnline,
    ModuleName.Indices,
    ModuleName.Scheduler,
    ModuleName.System,
    ModuleName.Timestamp,
  ];

  if (currentPermissions === null) {
    return undefined;
  }

  if (requiredPermissions === null) {
    return null;
  }

  if (!requiredPermissions?.length) {
    return undefined;
  }

  const {
    type: transactionsType,
    values: transactionsValues,
    exceptions = [],
  } = currentPermissions;

  let missingPermissions: TxTag[];

  const exceptionMatches = intersection(requiredPermissions, exceptions);

  if (transactionsType === PermissionType.Include) {
    const includedTransactions = union(transactionsValues, exemptedTransactions);

    missingPermissions = union(
      differenceWith(requiredPermissions, includedTransactions, isModuleOrTagMatch),
      exceptionMatches
    );
  } else {
    /*
     * if the exclusion is a module, we only remove it from the list if the module itself is present in `exemptedTransactions`.
     *   Otherwise, if, for example, `transactionsValues` contains `ModuleName.Identity`,
     *   since `exemptedTransactions` contains `TxTags.identity.LeaveIdentityAsKey`, we would be
     *   removing the entire Identity module from the result, which doesn't make sense
     */
    const txComparator = (tx: TxTag | ModuleName, exemptedTx: TxTag | ModuleName): boolean => {
      if (!tx.includes('.')) {
        return tx === exemptedTx;
      }

      return isModuleOrTagMatch(tx, exemptedTx);
    };

    const excludedTransactions = differenceWith(
      transactionsValues,
      exemptedTransactions,
      txComparator
    );

    missingPermissions = difference(
      intersectionWith(requiredPermissions, excludedTransactions, isModuleOrTagMatch),
      exceptionMatches
    );
  }

  if (missingPermissions.length) {
    return missingPermissions;
  }

  return undefined;
}

/**
 * Calculate the difference between the required Transaction permissions and the current ones
 */
export function getMissingPortfolioPermissions(
  requiredPermissions: (DefaultPortfolio | NumberedPortfolio)[] | null | undefined,
  currentPermissions: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null
): SimplePermissions['portfolios'] {
  if (currentPermissions === null) {
    return undefined;
  } else if (requiredPermissions === null) {
    return null;
  } else if (requiredPermissions) {
    const { type: portfoliosType, values: portfoliosValues } = currentPermissions;

    if (requiredPermissions.length) {
      let missingPermissions: (DefaultPortfolio | NumberedPortfolio)[];

      const portfolioComparator = (
        a: DefaultPortfolio | NumberedPortfolio,
        b: DefaultPortfolio | NumberedPortfolio
      ): boolean => {
        const aId = portfolioToPortfolioId(a);
        const bId = portfolioToPortfolioId(b);

        return isEqual(aId, bId);
      };

      if (portfoliosType === PermissionType.Include) {
        missingPermissions = differenceWith(
          requiredPermissions,
          portfoliosValues,
          portfolioComparator
        );
      } else {
        missingPermissions = intersectionWith(
          requiredPermissions,
          portfoliosValues,
          portfolioComparator
        );
      }

      if (missingPermissions.length) {
        return missingPermissions;
      }
    }
  }

  return undefined;
}

/**
 * @hidden
 * Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity
 *
 * @return which permissions the Account is missing (if any) and the final result
 */
export const checkConfidentialPermissions = async (
  account: Account,
  permissions: SimplePermissions
): Promise<CheckPermissionsResult<SignerType.Account>> => {
  const { assets, transactions, portfolios } = permissions;
  const {
    assets: currentAssets,
    transactions: currentTransactions,
    portfolios: currentPortfolios,
  } = await account.getPermissions();

  const missingPermissions: SimplePermissions = {};

  const missingAssetPermissions = getMissingAssetPermissions(assets, currentAssets);

  const hasAssets = missingAssetPermissions === undefined;
  if (!hasAssets) {
    missingPermissions.assets = missingAssetPermissions;
  }

  const missingTransactionPermissions = getMissingTransactionPermissions(
    transactions,
    currentTransactions
  );

  const hasTransactions = missingTransactionPermissions === undefined;
  if (!hasTransactions) {
    missingPermissions.transactions = missingTransactionPermissions;
  }

  const missingPortfolioPermissions = getMissingPortfolioPermissions(portfolios, currentPortfolios);

  const hasPortfolios = missingPortfolioPermissions === undefined;
  if (!hasPortfolios) {
    missingPermissions.portfolios = missingPortfolioPermissions;
  }

  const result = hasAssets && hasTransactions && hasPortfolios;

  if (result) {
    return { result };
  }

  return {
    result,
    missingPermissions,
  };
};

/**
 * Check whether an Identity possesses the specified Role
 */
const hasRole = async (identity: Identity, role: Role, context: Context): Promise<boolean> => {
  const { did } = identity;

  if (isConfidentialAssetOwnerRole(role)) {
    const { assetId } = role;

    const confidentialAsset = new ConfidentialAsset({ id: assetId }, context);
    const { owner } = await confidentialAsset.details();

    return identity.isEqual(owner);
  } else if (isConfidentialVenueOwnerRole(role)) {
    const confidentialVenue = new ConfidentialVenue({ id: role.venueId }, context);

    const owner = await confidentialVenue.creator();

    return identity.isEqual(owner);
  } else if (isTickerOwnerRole(role)) {
    const { ticker } = role;

    const reservation = new TickerReservation({ ticker }, context);
    const { owner } = await reservation.details();

    return owner ? identity.isEqual(owner) : false;
  } else if (isCddProviderRole(role)) {
    const {
      polymeshApi: {
        query: { cddServiceProviders },
      },
    } = context;

    const activeMembers = await cddServiceProviders.activeMembers();
    const memberDids = activeMembers.map(identityIdToString);

    return memberDids.includes(did);
  } else if (isVenueOwnerRole(role)) {
    const venue = new Venue({ id: role.venueId }, context);

    const { owner } = await venue.details();

    return identity.isEqual(owner);
  } else if (isPortfolioCustodianRole(role)) {
    const { portfolioId } = role;

    const portfolio = portfolioIdToPortfolio(portfolioId, context);

    return portfolio.isCustodiedBy();
  } else if (isIdentityRole(role)) {
    return did === role.did;
  }

  /* istanbul ignore next: */
  throw new PolymeshError({
    code: ErrorCode.ValidationError,
    message: `Unrecognized role "${JSON.stringify(role)}"`,
  });
};

/**
 * Check whether this Identity possesses all specified roles
 */
export const checkConfidentialRoles = async (
  identity: Identity,
  roles: Role[],
  context: Context
): Promise<ConfidentialCheckRolesResult> => {
  const missingRoles = await P.filter(roles, async role => {
    const idHasRole = await hasRole(identity, role, context);

    return !idHasRole;
  });

  if (missingRoles.length) {
    return {
      missingRoles,
      result: false,
    };
  }

  return {
    result: true,
  };
};
