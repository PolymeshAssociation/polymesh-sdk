import { ISubmittableResult } from '@polkadot/types/types';

import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { identityIdToString } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createSelfRegisterDidResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Identity => {
    const [record] = filterEventRecords(receipt, 'identity', 'DidCreated');

    const { data } = record!;

    const did = identityIdToString(data[0]);

    return new Identity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareSelfRegisterDid(
  this: Procedure<void, Identity>
): Promise<TransactionSpec<Identity, ExtrinsicParams<'identity', 'selfRegisterDid'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  if (context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'selfRegisterDid is only supported in chain v8',
    });
  }

  const actingAccount = await context.getActingAccount();

  const identityExists = await actingAccount.getIdentity();

  if (identityExists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The signing Account already has an Identity',
    });
  }

  return {
    transaction: tx.identity.selfRegisterDid,
    resolver: createSelfRegisterDidResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(): ProcedureAuthorization {
  return {
    signerPermissions: true,
  };
}

/**
 * @hidden
 */
export const selfRegisterDid = (): Procedure<void, Identity> =>
  new Procedure(prepareSelfRegisterDid, getAuthorization);
