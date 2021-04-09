import { bool } from '@polkadot/types';

import { DividendDistribution, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TargetTreatment, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  boolToBoolean,
  corporateActionIdentifierToCaId,
  signerToString,
  stringToIdentityId,
} from '~/utils/conversion';
import { assertDistributionOpen, xor } from '~/utils/internal';

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
      polymeshApi: { tx, query },
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
    const targetdDid = signerToString(target);
    const found = !!identities.find(({ did }) => did === targetdDid);
    if (xor(found, treatment === TargetTreatment.Include)) {
      excluded.push(new Identity({ did: targetdDid }, context));
    }
  });

  if (excluded.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied Identities are not included in this Distribution',
      data: { excluded },
    });
  }

  const rawDids = targets.map(target => stringToIdentityId(signerToString(target), context));

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  const holderPaidList = await query.capitalDistribution.holderPaid.multi<bool>(
    rawDids.map(rawDid => tuple(rawCaId, rawDid))
  );

  const alreadyClaimedList: Identity[] = [];
  holderPaidList.forEach((holderPaid, i) => {
    if (boolToBoolean(holderPaid)) {
      alreadyClaimedList.push(new Identity({ did: signerToString(targets[i]) }, context));
    }
  });

  if (alreadyClaimedList.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
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
  this: Procedure<Params, void>,
  { distribution: { ticker } }: Params
): Promise<ProcedureAuthorization> {
  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions: [TxTags.capitalDistribution.PushBenefit],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const payDividends = new Procedure(preparePayDividends, getAuthorization);
