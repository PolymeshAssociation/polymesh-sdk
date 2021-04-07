import { DividendDistribution, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  boolToBoolean,
  corporateActionIdentifierToCaId,
  identityIdToString,
  stringToIdentityId,
} from '~/utils/conversion';

export interface PushBenefitParams {
  targets: (string | Identity)[];
}

/**
 * @hidden
 */
export type Params = { distribution: DividendDistribution } & PushBenefitParams;

/**
 * @hidden
 */
export async function preparePushBenefit(
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
    distribution: { id: localId, ticker, paymentDate, expiryDate },
    targets,
  } = args;

  const now = new Date();

  if (paymentDate > now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Distribution's benefits date hasn't been reached",
      data: { paymentDate },
    });
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }

  const rawDids = targets.map(target => {
    if (typeof target === 'string') {
      return stringToIdentityId(target, context);
    }
    return stringToIdentityId(target.did, context);
  });

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  const holderPaidList = await Promise.all(
    rawDids.map(rawDid => query.capitalDistribution.holderPaid([rawCaId, rawDid]))
  );

  const alreadyClaimedList: number[] = [];
  holderPaidList.forEach((holderPaid, i) => {
    if (boolToBoolean(holderPaid)) {
      alreadyClaimedList.push(i);
    }
  });

  if (alreadyClaimedList.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the supplied targets has already claimed their benefits',
      data: {
        targets: alreadyClaimedList.map(
          i => new Identity({ did: identityIdToString(rawDids[i]) }, context)
        ),
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
export const pushBenefit = new Procedure(preparePushBenefit, getAuthorization);
