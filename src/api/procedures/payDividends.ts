import { assertDistributionOpen } from '~/api/procedures/utils';
import { DividendDistribution, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TargetTreatment, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { QueryReturnType, tuple } from '~/types/utils';
import {
  boolToBoolean,
  corporateActionIdentifierToCaId,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';
import { xor } from '~/utils/internal';

export interface PayDividendsParams {
  targets: (string | Identity)[];
}

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
      ticker,
      paymentDate,
      expiryDate,
    },
    targets,
  } = args;

  assertDistributionOpen(paymentDate, expiryDate);

  const excluded: Identity[] = [];
  targets.forEach(target => {
    const targetassertDistributionOpenDid = signerToString(target);
    const found = !!identities.find(({ did }) => did === targetassertDistributionOpenDid);
    if (xor(found, treatment === TargetTreatment.Include)) {
      excluded.push(new Identity({ did: targetassertDistributionOpenDid }, context));
    }
  });

  if (excluded.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the supplied Identities are not included in this Distribution',
      data: { excluded },
    });
  }

  const rawDids = targets.map(target => stringToIdentityId(signerToString(target), context));

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  const holderPaidList = await capitalDistribution.holderPaid.multi<
    QueryReturnType<typeof capitalDistribution.holderPaid>
  >(rawDids.map(rawDid => tuple(rawCaId, rawDid)));

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

  this.addBatchTransaction(
    tx.capitalDistribution.pushBenefit,
    {},
    rawDids.map(rawDid => tuple(rawCaId, rawDid))
  );
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
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const payDividends = (): Procedure<Params, void> =>
  new Procedure(preparePayDividends, getAuthorization);
