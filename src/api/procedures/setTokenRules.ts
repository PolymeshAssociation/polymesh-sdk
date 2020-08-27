import { differenceWith, isEqual } from 'lodash';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { Condition, ErrorCode, Role, RoleType } from '~/types';
import { assetTransferRuleToRule, ruleToAssetTransferRule, stringToTicker } from '~/utils';

export interface SetTokenRulesParams {
  rules: Condition[][];
}

/**
 * @hidden
 */
export type Params = SetTokenRulesParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareSetTokenRules(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, rules } = args;

  const rawTicker = stringToTicker(ticker, context);

  const currentRulesRaw = await query.complianceManager.assetRulesMap(rawTicker);

  const currentRules = currentRulesRaw.rules.map(rule => assetTransferRuleToRule(rule).conditions);

  const comparator = (a: Condition[], b: Condition[]): boolean => {
    return !differenceWith(a, b, isEqual).length && a.length === b.length;
  };

  if (
    !differenceWith(rules, currentRules, comparator).length &&
    rules.length === currentRules.length
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied rule list is equal to the current one',
    });
  }

  const rawRules = rules.map(rule => {
    const { sender_rules: senderRules, receiver_rules: receiverRules } = ruleToAssetTransferRule(
      { conditions: rule, id: 1 },
      context
    );

    return {
      senderRules,
      receiverRules,
    };
  });

  if (currentRules.length) {
    this.addTransaction(tx.complianceManager.resetActiveRules, {}, rawTicker);
  }

  rawRules.forEach(({ senderRules, receiverRules }) => {
    this.addTransaction(
      tx.complianceManager.addActiveRule,
      {},
      rawTicker,
      senderRules,
      receiverRules
    );
  });

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const setTokenRules = new Procedure(prepareSetTokenRules, getRequiredRoles);
