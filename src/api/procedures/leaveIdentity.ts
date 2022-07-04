import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export async function prepareLeaveIdentity(
  this: Procedure<void, void>
): Promise<TransactionSpec<void, ExtrinsicParams<'identity', 'leaveIdentityAsKey'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const signingAccount = context.getSigningAccount();
  const signingIdentity = await signingAccount.getIdentity();

  if (!signingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There is no Identity associated to the signing Account',
    });
  }

  const secondaryAccounts = await signingIdentity.getSecondaryAccounts();
  const isSecondaryAccount = secondaryAccounts.find(({ account }) =>
    account.isEqual(signingAccount)
  );

  if (!isSecondaryAccount) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only secondary Accounts are allowed to leave an Identity',
    });
  }

  return { transaction: tx.identity.leaveIdentityAsKey, resolver: undefined };
}

/**
 * @hidden
 */
export const leaveIdentity = (): Procedure<void, void> =>
  new Procedure(prepareLeaveIdentity, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.LeaveIdentityAsKey],
    },
  });
