import { difference, differenceBy, differenceWith, isEqual, union } from 'lodash';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { Account, Context, CurrentIdentity, leaveIdentity } from '~/internal';
import {
  DefaultPortfolio,
  ModuleName,
  NumberedPortfolio,
  Permissions,
  PermissionType,
  ProcedureMethod,
  SimplePermissions,
  TxTag,
  TxTags,
} from '~/types';
import { portfolioToPortfolioId, signerToString } from '~/utils/conversion';
import { createProcedureMethod, isModuleOrTagMatch } from '~/utils/internal';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.leaveIdentity = createProcedureMethod(
      { getProcedureAndArgs: () => [leaveIdentity, { account: this }] },
      context
    );
  }

  /**
   * Leave the current Identity. This operation can only be done if this Account is a secondary key for the Identity
   */
  public leaveIdentity: ProcedureMethod<void, void>;

  /**
   * Retrieve the current Identity (null if there is none)
   */
  public async getIdentity(): Promise<CurrentIdentity | null> {
    const identity = await super.getIdentity();

    return identity && new CurrentIdentity({ did: identity.did }, this.context);
  }

  /**
   * Retrieve the Permissions this Signer has as a Signing Key for its corresponding Identity
   */
  public async getPermissions(): Promise<Permissions> {
    const { context, address } = this;

    const currentIdentity = await context.getCurrentIdentity();

    const [primaryKey, secondaryKeys] = await Promise.all([
      currentIdentity.getPrimaryKey(),
      currentIdentity.getSecondaryKeys(),
    ]);

    if (address === primaryKey) {
      return {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const key = secondaryKeys.find(({ signer }) => address === signerToString(signer))!;

    return key.permissions;
  }

  /**
   * Check if this Account possesses certain Permissions for its corresponding Identity
   */
  public async hasPermissions(permissions: SimplePermissions): Promise<boolean> {
    const { tokens, transactions, portfolios } = permissions;

    const {
      tokens: currentTokens,
      transactions: currentTransactions,
      portfolios: currentPortfolios,
    } = await this.getPermissions();

    let hasTokens;
    if (currentTokens === null) {
      hasTokens = true;
    } else if (tokens === null) {
      hasTokens = false;
    } else if (tokens) {
      const { type: tokensType, values: tokensValues } = currentTokens;
      if (tokens.length === 0) {
        hasTokens = true;
      } else {
        if (tokensType === PermissionType.Include) {
          hasTokens = !differenceBy(tokens, tokensValues, 'ticker').length;
        } else {
          hasTokens = differenceBy(tokens, tokensValues, 'ticker').length === tokens.length;
        }
      }
    } else {
      hasTokens = true;
    }

    // these transactions are allowed to any account, independent of permissions
    const exemptedTransactions: (TxTag | ModuleName)[] = [
      ...difference(Object.values(TxTags.balances), [
        TxTags.balances.DepositBlockRewardReserveBalance,
        TxTags.balances.BurnAccountBalance,
      ]),
      ModuleName.Staking,
      ModuleName.Sudo,
      ModuleName.Session,
      ModuleName.Authorship,
      ModuleName.Babe,
      ModuleName.FinalityTracker,
      ModuleName.Grandpa,
      ModuleName.ImOnline,
      ModuleName.Indices,
      ModuleName.Scheduler,
      ModuleName.System,
      ModuleName.Timestamp,
    ];

    let hasTransactions;
    if (currentTransactions === null) {
      hasTransactions = true;
    } else if (transactions === null) {
      hasTransactions = false;
    } else if (transactions) {
      const {
        type: transactionsType,
        values: transactionsValues,
        exceptions = [],
      } = currentTransactions;
      if (transactions.length === 0) {
        hasTransactions = true;
      } else {
        if (transactionsType === PermissionType.Include) {
          const includedTransactions = differenceWith(
            union(transactionsValues, exemptedTransactions),
            exceptions,
            isModuleOrTagMatch
          );
          hasTransactions = transactions.every(
            tag => !!includedTransactions.find(included => isModuleOrTagMatch(included, tag))
          );
        } else {
          const excludedTransactions = differenceWith(
            transactionsValues,
            exemptedTransactions,
            exceptions,
            isModuleOrTagMatch
          );
          hasTransactions = !transactions.some(
            tag => !!excludedTransactions.find(excluded => isModuleOrTagMatch(excluded, tag))
          );
        }
      }
    } else {
      hasTransactions = true;
    }

    let hasPortfolios;
    if (currentPortfolios === null) {
      hasPortfolios = true;
    } else if (portfolios === null) {
      hasPortfolios = false;
    } else if (portfolios) {
      const { type: portfoliosType, values: portfoliosValues } = currentPortfolios;

      if (portfolios.length === 0) {
        hasPortfolios = true;
      } else {
        const portfolioComparator = (
          a: DefaultPortfolio | NumberedPortfolio,
          b: DefaultPortfolio | NumberedPortfolio
        ) => {
          const aId = portfolioToPortfolioId(a);
          const bId = portfolioToPortfolioId(b);

          return isEqual(aId, bId);
        };
        if (portfoliosType === PermissionType.Include) {
          hasPortfolios = !differenceWith(portfolios, portfoliosValues, portfolioComparator).length;
        } else {
          hasPortfolios =
            differenceWith(portfolios, portfoliosValues, portfolioComparator).length ===
            portfolios.length;
        }
      }
    } else {
      hasPortfolios = true;
    }

    return hasTokens && hasTransactions && hasPortfolios;
  }
}
