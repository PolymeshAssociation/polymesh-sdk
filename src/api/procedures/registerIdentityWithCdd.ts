import { ISubmittableResult } from '@polkadot/types/types';

import { Context, Identity, Procedure } from '~/internal';
import { RegisterIdentityParams, RegisterIdentityWithCddParams, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  dateToMoment,
  identityIdToString,
  permissionsLikeToPermissions,
  secondaryAccountToMeshSecondaryKey,
  signerToString,
  stringToAccountId,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export const createRegisterIdentityWithDidResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Identity => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'DidCreated');
    const did = identityIdToString(data[0]);

    return new Identity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareRegisterIdentityWithCdd(
  this: Procedure<RegisterIdentityParams, Identity>,
  args: RegisterIdentityWithCddParams
): Promise<TransactionSpec<Identity, ExtrinsicParams<'identity', 'cddRegisterDidWithCdd'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const { targetAccount, secondaryAccounts = [], expiry } = args;

  const rawTargetAccount = stringToAccountId(signerToString(targetAccount), context);
  const rawSecondaryKeys = secondaryAccounts.map(({ permissions, ...rest }) =>
    secondaryAccountToMeshSecondaryKey(
      { ...rest, permissions: permissionsLikeToPermissions(permissions, context) },
      context
    )
  );
  const cddExpiry = optionize(dateToMoment)(expiry, context);

  return {
    transaction: identity.cddRegisterDidWithCdd,
    args: [rawTargetAccount, rawSecondaryKeys, cddExpiry],
    resolver: createRegisterIdentityWithDidResolver(context),
  };
}

/**
 * @hidden
 */
export const registerIdentityWithCdd = (): Procedure<RegisterIdentityWithCddParams, Identity> =>
  new Procedure(prepareRegisterIdentityWithCdd, {
    roles: [{ type: RoleType.CddProvider }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.CddRegisterDidWithCdd],
    },
  });
