import { ConfidentialAccount, PolymeshError, Procedure } from '~/internal';
import { CreateConfidentialAccountParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';

/**
 * @hidden
 */
export type Params = CreateConfidentialAccountParams;

/**
 * @hidden
 */
export async function prepareCreateAccount(
  this: Procedure<Params, ConfidentialAccount>,
  args: Params
): Promise<
  TransactionSpec<ConfidentialAccount, ExtrinsicParams<'confidentialAsset', 'createAccount'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { publicKey } = args;

  const confidentialAccount = new ConfidentialAccount({ publicKey }, context);

  const identity = await confidentialAccount.getIdentity();

  if (identity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Confidential Account already exists for the given key',
      data: {
        publicKey,
      },
    });
  }

  return {
    transaction: tx.confidentialAsset.createAccount,
    args: [publicKey],
    resolver: confidentialAccount,
  };
}

/**
 * @hidden
 */
export const createConfidentialAccount = (): Procedure<Params, ConfidentialAccount> =>
  new Procedure(prepareCreateAccount, {
    permissions: {
      transactions: [TxTags.confidentialAsset.CreateAccount],
      assets: [],
      portfolios: [],
    },
  });
