import {
  difference,
  differenceBy,
  differenceWith,
  intersection,
  intersectionBy,
  intersectionWith,
  isEqual,
  union,
} from 'lodash';

import { BaseAsset } from '~/internal';
import {
  DefaultPortfolio,
  ModuleName,
  NumberedPortfolio,
  PermissionType,
  SectionPermissions,
  SimplePermissions,
  TransactionPermissions,
  TxTag,
  TxTags,
} from '~/types';
import { portfolioToPortfolioId } from '~/utils/conversion';
import { isModuleOrTagMatch } from '~/utils/internal';

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
 *
 * Calculate the difference between the required Asset permissions and the current ones
 */
export function getMissingAssetPermissions(
  requiredPermissions: BaseAsset[] | null | undefined,
  currentPermissions: SectionPermissions<BaseAsset> | null
): SimplePermissions['assets'] {
  if (currentPermissions === null) {
    return undefined;
  } else if (requiredPermissions === null) {
    return null;
  } else if (requiredPermissions) {
    const { type: permissionType, values: assetValues } = currentPermissions;

    if (requiredPermissions.length) {
      let missingPermissions: BaseAsset[];

      if (permissionType === PermissionType.Include) {
        missingPermissions = differenceBy(requiredPermissions, assetValues, 'ticker');
      } else {
        missingPermissions = intersectionBy(requiredPermissions, assetValues, 'ticker');
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
