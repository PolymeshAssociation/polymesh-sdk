import BigNumber from 'bignumber.js';

import { assertCaTargetsValid, assertCaTaxWithholdingsValid } from '~/api/procedures/utils';
import { Asset, PolymeshError, Procedure } from '~/internal';
import {
  CorporateActionTargets,
  ErrorCode,
  InputTargets,
  InputTaxWithholding,
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
import { hasSameElements } from '~/utils/internal';

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

/**
 * @hidden
 */
export type Params = { ticker: string } & ModifyCaDefaultConfigParams;

const areSameTargets = (targets: CorporateActionTargets, newTargets: InputTargets): boolean => {
  const { identities: newIdentities, treatment: newTreatment } = newTargets;
  const { identities, treatment } = targets;

  return (
    hasSameElements(
      identities,
      newIdentities,
      (identity, newIdentity) => signerToString(identity) === signerToString(newIdentity)
    ) && treatment === newTreatment
  );
};

/**
 * @hidden
 */
export async function prepareModifyCaDefaultConfig(
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
      code: ErrorCode.NoDataChange,
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

  const asset = new Asset({ ticker }, context);

  const {
    targets,
    defaultTaxWithholding,
    taxWithholdings,
  } = await asset.corporateActions.getDefaultConfig();

  if (newTargets) {
    if (areSameTargets(targets, newTargets)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
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
        code: ErrorCode.NoDataChange,
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
    const areSameWithholdings = hasSameElements(
      taxWithholdings,
      newTaxWithholdings,
      ({ identity, percentage }, { identity: newIdentity, percentage: newPercentage }) =>
        signerToString(identity) === signerToString(newIdentity) && percentage.eq(newPercentage)
    );

    if (areSameWithholdings) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
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
    permissions: {
      transactions,
      portfolios: [],
      assets: [new Asset({ ticker }, this.context)],
    },
  };
}

/**
 * @hidden
 */
export const modifyCaDefaultConfig = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaDefaultConfig, getAuthorization);
