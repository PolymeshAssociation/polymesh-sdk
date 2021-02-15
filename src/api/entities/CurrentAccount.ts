import { difference, differenceBy, differenceWith, isEqual, union } from 'lodash';

import { Account, CurrentIdentity } from '~/internal';
import { Permissions, PermissionsLike, TxTags } from '~/types';
import {
  permissionsLikeToPermissions,
  portfolioToPortfolioId,
  signerToString,
} from '~/utils/conversion';

/**
 * Represents the current account that is bound to the SDK instance
 */
export class CurrentAccount extends Account {
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
  public async hasPermissions(permissions: PermissionsLike): Promise<boolean> {
    const { tokens, transactions, portfolios } = permissionsLikeToPermissions(
      permissions,
      this.context
    );

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
    } else {
      hasTokens = tokens.length === 0 || !differenceBy(tokens, currentTokens, 'ticker').length;
    }

    // these transactions are allowed to any account, independent of permissions
    const exemptedTransactions = [
      ...difference(Object.values(TxTags.balances), [
        TxTags.balances.DepositBlockRewardReserveBalance,
        TxTags.balances.BurnAccountBalance,
      ]),
      ...Object.values(TxTags.staking),
      ...Object.values(TxTags.sudo),
      ...Object.values(TxTags.session),
    ];

    let hasTransactions;
    if (currentTransactions === null) {
      hasTransactions = true;
    } else if (transactions === null) {
      hasTransactions = false;
    } else {
      hasTransactions =
        transactions.length === 0 ||
        !difference(transactions, union(currentTransactions, exemptedTransactions)).length;
    }

    let hasPortfolios;
    if (currentPortfolios === null) {
      hasPortfolios = true;
    } else if (portfolios === null) {
      hasPortfolios = false;
    } else {
      hasPortfolios =
        portfolios.length === 0 ||
        !differenceWith(portfolios, currentPortfolios, (a, b) => {
          const aId = portfolioToPortfolioId(a);
          const bId = portfolioToPortfolioId(b);

          return isEqual(aId, bId);
        }).length;
    }

    return hasTokens && hasTransactions && hasPortfolios;
  }
}
