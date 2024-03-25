import { ISubmittableResult } from '@polkadot/types/types';

import { Account, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RegisterIdentityParams, RoleType, TxTags } from '~/types';
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
export const createRegisterIdentityResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Identity => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'DidCreated');
    const did = identityIdToString(data[0]);

    return new Identity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareRegisterIdentity(
  this: Procedure<RegisterIdentityParams, Identity>,
  args: RegisterIdentityParams
): Promise<
  | TransactionSpec<Identity, ExtrinsicParams<'identity', 'cddRegisterDid'>>
  | TransactionSpec<Identity, ExtrinsicParams<'identity', 'cddRegisterDidWithCdd'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;
  const { targetAccount, secondaryAccounts = [], createCdd = false, expiry } = args;

  const account = new Account({ address: targetAccount.toString() }, context);

  const identityExists = await account.getIdentity();

  if (identityExists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target account already has an identity',
    });
  }

  const rawTargetAccount = stringToAccountId(signerToString(targetAccount), context);
  const rawSecondaryKeys = secondaryAccounts.map(({ permissions, ...rest }) =>
    secondaryAccountToMeshSecondaryKey(
      { ...rest, permissions: permissionsLikeToPermissions(permissions, context) },
      context
    )
  );

  if (createCdd) {
    const cddExpiry = optionize(dateToMoment)(expiry, context);
    return {
      transaction: identity.cddRegisterDidWithCdd,
      args: [rawTargetAccount, rawSecondaryKeys, cddExpiry],
      resolver: createRegisterIdentityResolver(context),
    };
  } else {
    if (expiry) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Expiry cannot be set unless a CDD claim is being created',
      });
    }

    return {
      transaction: identity.cddRegisterDid,
      args: [rawTargetAccount, rawSecondaryKeys],
      resolver: createRegisterIdentityResolver(context),
    };
  }
}

/**
 * @hidden
 */
export const registerIdentity = (): Procedure<RegisterIdentityParams, Identity> =>
  new Procedure(prepareRegisterIdentity, {
    roles: [{ type: RoleType.CddProvider }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.CddRegisterDid],
    },
  });
