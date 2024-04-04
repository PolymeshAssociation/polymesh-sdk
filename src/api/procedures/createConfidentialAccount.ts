import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAccount, PolymeshError } from '~/internal';
import { CreateConfidentialAccountParams, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';

/**
 * @hidden
 */
export type Params = CreateConfidentialAccountParams;

/**
 * @hidden
 */
export async function prepareCreateAccount(
  this: ConfidentialProcedure<Params, ConfidentialAccount>,
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
export const createConfidentialAccount = (): ConfidentialProcedure<Params, ConfidentialAccount> =>
  new ConfidentialProcedure(prepareCreateAccount, {
    permissions: {
      transactions: [TxTags.confidentialAsset.CreateAccount],
      assets: [],
      portfolios: [],
    },
  });
