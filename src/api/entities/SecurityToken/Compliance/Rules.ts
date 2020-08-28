import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import { AssetTransferRules, AssetTransferRulesResult, IdentityId } from 'polymesh-types/types';

import { Identity } from '~/api/entities';
import { setTokenRules, SetTokenRulesParams, togglePauseRules } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { Rule, RuleCompliance, SubCallback, UnsubCallback } from '~/types';
import {
  assetTransferRulesResultToRuleCompliance,
  assetTransferRuleToRule,
  boolToBoolean,
  identityIdToString,
  stringToIdentityId,
  stringToTicker,
  valueToDid,
} from '~/utils';

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

  /**
   * Check whether transferring from one identity to another complies with all the rules of this asset
   *
   * @param args.from - sender identity (optional, defaults to the current identity)
   * @param args.to - receiver identity
   */
  public async checkTransfer(args: {
    from?: string | Identity;
    to: string | Identity;
  }): Promise<RuleCompliance> {
    const { from = await this.context.getCurrentIdentity(), to } = args;
    return this._checkTransfer({ from, to });
  }

  /**
   * Check whether minting to an identity complies with all the rules of this asset
   *
   * @param args.to - receiver identity
   */
  public async checkMint(args: { to: string | Identity }): Promise<RuleCompliance> {
    return this._checkTransfer({
      ...args,
      from: null,
    });
  }

  /**
   * Check whether compliance rules are paused or not
   */
  public async arePaused(): Promise<boolean> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { is_paused: isPaused } = await complianceManager.assetRulesMap(rawTicker);

    return boolToBoolean(isPaused);
  }

  /**
   * @hidden
   */
  private async _checkTransfer(args: {
    from?: null | string | Identity;
    to: string | Identity;
  }): Promise<RuleCompliance> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { rpc },
      },
      context,
    } = this;

    const { from, to } = args;

    let fromDid = null;
    if (from) {
      fromDid = stringToIdentityId(valueToDid(from), context);
    }
    const toDid = valueToDid(to);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: AssetTransferRulesResult = await (rpc as any).compliance.canTransfer(
      stringToTicker(ticker, context),
      fromDid,
      stringToIdentityId(toDid, context)
    );

    return assetTransferRulesResultToRuleCompliance(res);
  }
}
