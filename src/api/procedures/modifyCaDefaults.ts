import BigNumber from 'bignumber.js';
import { differenceWith } from 'lodash';

import { assertCaTargetsValid, assertCaTaxWithholdingsValid } from '~/api/procedures/utils';
import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import {
  CorporateActionTargets,
  ErrorCode,
  InputTargets,
  InputTaxWithholding,
  RoleType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  percentageToPermill,
  signerToString,
  stringToIdentityId,
  stringToTicker,
  targetsToTargetIdentities,
} from '~/utils/conversion';

export type ModifyCaDefaultsParams =
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

/**
 * @hidden
 */
export type Params = { ticker: string } & ModifyCaDefaultsParams;

const areSameTargets = (targets: CorporateActionTargets, newTargets: InputTargets): boolean => {
  const { identities: newIdentities, treatment: newTreatment } = newTargets;
  const { identities, treatment } = targets;

  return (
    !differenceWith(
      identities,
      newIdentities,
      ({ did }, newIdentity) => did === signerToString(newIdentity)
    ).length &&
    identities.length === newIdentities.length &&
    treatment === newTreatment
  );
};

/**
 * @hidden
 */
export async function prepareModifyCaDefaults(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const {
    ticker,
    targets: newTargets,
    defaultTaxWithholding: newDefaultTaxWithholding,
    taxWithholdings: newTaxWithholdings,
  } = args;

  const noArguments =
    newTargets === undefined &&
    newDefaultTaxWithholding === undefined &&
    newTaxWithholdings === undefined;

  if (noArguments) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  if (newTargets) {
    assertCaTargetsValid(newTargets, context);
  }
  if (newTaxWithholdings) {
    assertCaTaxWithholdingsValid(newTaxWithholdings, context);
  }

  const rawTicker = stringToTicker(ticker, context);

  const securityToken = new SecurityToken({ ticker }, context);

  const {
    targets,
    defaultTaxWithholding,
    taxWithholdings,
  } = await securityToken.corporateActions.getDefaults();

  if (newTargets) {
    if (areSameTargets(targets, newTargets)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New targets are the same as the current ones',
      });
    }

    this.addTransaction(
      tx.corporateAction.setDefaultTargets,
      {},
      rawTicker,
      targetsToTargetIdentities(newTargets, context)
    );
  }

  if (newDefaultTaxWithholding) {
    if (newDefaultTaxWithholding.eq(defaultTaxWithholding)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New default tax withholding is the same as the current one',
      });
    }

    this.addTransaction(
      tx.corporateAction.setDefaultWithholdingTax,
      {},
      rawTicker,
      percentageToPermill(newDefaultTaxWithholding, context)
    );
  }

  if (newTaxWithholdings) {
    const areSameWithholdings =
      !differenceWith(
        taxWithholdings,
        newTaxWithholdings,
        ({ identity: { did }, percentage }, { identity: newIdentity, percentage: newPercentage }) =>
          did === signerToString(newIdentity) && percentage.eq(newPercentage)
      ).length && taxWithholdings.length === newTaxWithholdings.length;

    if (areSameWithholdings) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'New per-Identity tax withholding percentages are the same as current ones',
      });
    }

    const batchParams = newTaxWithholdings.map(({ identity, percentage }) =>
      tuple(
        rawTicker,
        stringToIdentityId(signerToString(identity), context),
        percentageToPermill(percentage, context)
      )
    );

    this.addBatchTransaction(tx.corporateAction.setDidWithholdingTax, {}, batchParams);
  }
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker, targets, defaultTaxWithholding, taxWithholdings }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (targets) {
    transactions.push(TxTags.corporateAction.SetDefaultTargets);
  }

  if (defaultTaxWithholding) {
    transactions.push(TxTags.corporateAction.SetDefaultWithholdingTax);
  }

  if (taxWithholdings) {
    transactions.push(TxTags.corporateAction.SetDidWithholdingTax);
  }

  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions,
      portfolios: [],
      tokens: [new SecurityToken({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyCaDefaults = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaDefaults, getAuthorization);
