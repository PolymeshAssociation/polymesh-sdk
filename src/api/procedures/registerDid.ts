import { ISubmittableResult } from '@polkadot/types/types';

import { Context, Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RegisterDidParams, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { identityIdToString, stringToAccountId } from '~/utils/conversion';
import { asAccount, filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createRegisterDidResolver =
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
export async function prepareRegisterDid(
  this: Procedure<RegisterDidParams, Identity>,
  args: RegisterDidParams
): Promise<TransactionSpec<Identity, ExtrinsicParams<'identity', 'registerDid'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { targetAccount } = args;

  const account = asAccount(targetAccount, context);

  const identityExists = await account.getIdentity();

  if (identityExists) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The target account already has an identity',
    });
  }

  const rawTargetAccount = stringToAccountId(account.address, context);

  return {
    transaction: tx.identity.registerDid,
    args: [rawTargetAccount],
    resolver: createRegisterDidResolver(context),
  };
}

/**
 * @hidden
 */
export const registerDid = (): Procedure<RegisterDidParams, Identity> =>
  new Procedure(prepareRegisterDid, {
    roles: [{ type: RoleType.DidRegistrar }],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.RegisterDid],
    },
  });
