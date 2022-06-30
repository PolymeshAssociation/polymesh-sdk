import { assertDistributionOpen } from '~/api/procedures/utils';
import { DividendDistribution, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, PayDividendsParams, TargetTreatment, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { QueryReturnType, tuple } from '~/types/utils';
import {
  boolToBoolean,
  corporateActionIdentifierToCaId,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';
import { asIdentity, xor } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { distribution: DividendDistribution } & PayDividendsParams;

/**
 * @hidden
 */
export async function preparePayDividends(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { capitalDistribution },
      },
    },
    context,
  } = this;
  const {
    distribution: {
      targets: { identities, treatment },
      id: localId,
      asset: { ticker },
      paymentDate,
      expiryDate,
    },
    targets,
  } = args;

  assertDistributionOpen(paymentDate, expiryDate);

  const excluded: Identity[] = [];
  targets.forEach(target => {
    const targetIdentity = asIdentity(target, context);
    const found = !!identities.find(identity => identity.isEqual(targetIdentity));
    if (xor(found, treatment === TargetTreatment.Include)) {
      excluded.push(targetIdentity);
    }
  });

  if (excluded.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the supplied Identities are not included in this Distribution',
      data: { excluded },
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  const rawArgs = targets.map(target =>
    tuple(rawCaId, stringToIdentityId(signerToString(target), context))
  );

  const holderPaidList = await capitalDistribution.holderPaid.multi<
    QueryReturnType<typeof capitalDistribution.holderPaid>
  >(rawArgs);

  const alreadyClaimedList: Identity[] = [];
  holderPaidList.forEach((holderPaid, i) => {
    if (boolToBoolean(holderPaid)) {
      alreadyClaimedList.push(new Identity({ did: signerToString(targets[i]) }, context));
    }
  });

  if (alreadyClaimedList.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'Some of the supplied Identities have already either been paid or claimed their share of the Distribution',
      data: {
        targets: alreadyClaimedList,
      },
    });
  }

  const transaction = tx.capitalDistribution.pushBenefit;

  this.addBatchTransaction({
    transactions: rawArgs.map(txArgs => ({
      transaction,
      args: txArgs,
    })),
  });
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void>
): Promise<ProcedureAuthorization> {
  return {
    permissions: {
      transactions: [TxTags.capitalDistribution.PushBenefit],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const payDividends = (): Procedure<Params, void> =>
  new Procedure(preparePayDividends, getAuthorization);
