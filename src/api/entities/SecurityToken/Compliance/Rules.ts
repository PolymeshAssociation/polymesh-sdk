import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import { AssetTransferRules, IdentityId } from 'polymesh-types/types';

import { setTokenRules, SetTokenRulesParams, togglePauseRules } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { Rule, SubCallback, UnsubCallback } from '~/types';
import { assetTransferRuleToRule, identityIdToString, stringToTicker } from '~/utils';

import { SecurityToken } from '../';

/**
 * Handles all Security Token Rules related functionality
 */
export class Rules extends Namespace<SecurityToken> {
  /**
   * Configure transfer rules for the Security Token. This operation will replace all existing rules with a new rule set
   *
   * This requires two transactions
   *
   * @param args.rules - array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   *
   * @example Say A, B, C, D and E are rules and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set(args: SetTokenRulesParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setTokenRules.prepare({ ticker, ...args }, context);
  }

  /**
   * Retrieve all of the Security Token's transfer rules
   *
   * @note can be subscribed to
   */
  public get(): Promise<Rule[]>;
  public get(callback: SubCallback<Rule[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(callback?: SubCallback<Rule[]>): Promise<Rule[] | UnsubCallback> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { complianceManager },
          queryMulti,
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = ([transferRules, claimIssuers]: [
      AssetTransferRules,
      Vec<IdentityId>
    ]): Rule[] => {
      const defaultTrustedClaimIssuers = claimIssuers.map(identityIdToString);

      return transferRules.rules.map(assetTransferRule => {
        const rule = assetTransferRuleToRule(assetTransferRule);

        rule.conditions.forEach(condition => {
          if (!condition.trustedClaimIssuers || !condition.trustedClaimIssuers.length) {
            condition.trustedClaimIssuers = defaultTrustedClaimIssuers;
          }
        });

        return rule;
      });
    };

    if (callback) {
      return queryMulti<[AssetTransferRules, Vec<IdentityId>]>(
        [
          [complianceManager.assetRulesMap as QueryableStorageEntry<'promise'>, rawTicker],
          [complianceManager.trustedClaimIssuer as QueryableStorageEntry<'promise'>, rawTicker],
        ],
        res => {
          callback(assembleResult(res));
        }
      );
    }

    const result = await queryMulti<[AssetTransferRules, Vec<IdentityId>]>([
      [complianceManager.assetRulesMap as QueryableStorageEntry<'promise'>, rawTicker],
      [complianceManager.trustedClaimIssuer as QueryableStorageEntry<'promise'>, rawTicker],
    ]);

    return assembleResult(result);
  }

  /**
   * Detele all the current rules for the Security Token.
   */
  public reset(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setTokenRules.prepare({ ticker, rules: [] }, context);
  }

  /**
   * Pause all the Security Token's rules. This means that all transfers and token issuance will be allowed until rules are unpaused
   */
  public pause(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return togglePauseRules.prepare({ ticker, pause: true }, context);
  }

  /**
   * Un-pause all the Security Token's current rules
   */
  public unpause(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return togglePauseRules.prepare({ ticker, pause: false }, context);
  }
}
