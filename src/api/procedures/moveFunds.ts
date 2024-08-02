import { PalletConfidentialAssetConfidentialMoveFunds } from '@polkadot/types/lookup';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { Context, PolymeshError } from '~/internal';
import {
  ConfidentialProcedureAuthorization,
  MoveFundsArgs,
  MoveFundsParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { serializeConfidentialAssetMoves } from '~/utils/conversion';
import { asConfidentialAccount, asConfidentialAsset } from '~/utils/internal';

/**
 * @hidden
 */
export async function checkArgs(
  args: MoveFundsParams,
  context: Context
): Promise<PalletConfidentialAssetConfidentialMoveFunds> {
  const { from, to, proofs } = args;

  const sendingAccount = asConfidentialAccount(from, context);
  const receivingAccount = asConfidentialAccount(to, context);

  const [sendingAccountExists, receivingAccountExists] = await Promise.all([
    sendingAccount.exists(),
    receivingAccount.exists(),
  ]);

  if (!sendingAccountExists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The sending Confidential Account does not exist',
    });
  }

  if (!receivingAccountExists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The receiving Confidential Account does not exist',
    });
  }

  const [signingIdentity, senderIdentity, receiverIdentity] = await Promise.all([
    context.getSigningIdentity(),
    sendingAccount.getIdentity(),
    receivingAccount.getIdentity(),
  ]);

  if (!senderIdentity?.exists() || !receiverIdentity?.exists()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });
  }

  if (!signingIdentity.isEqual(senderIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only the owner of the sender account can move funds',
    });
  }

  if (!senderIdentity.isEqual(receiverIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have the same identity',
    });
  }

  const checkAssetExists = proofs.map(({ asset }) => {
    const confidentialAsset = asConfidentialAsset(asset, context);

    return confidentialAsset.exists();
  });

  const assetExists = await Promise.all(checkAssetExists);

  if (!assetExists.every(v => v)) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'One or more of the specified Confidential Assets do not exist',
    });
  }

  const checkIsAssetFrozenPromises = proofs.map(({ asset }) => {
    const confidentialAsset = asConfidentialAsset(asset, context);

    return confidentialAsset.isFrozen();
  });

  const isFrozenResult = await Promise.all(checkIsAssetFrozenPromises);

  if (isFrozenResult.some(v => v)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The asset is frozen',
    });
  }

  const checkIsSenderAccountFrozenPromises = proofs.map(({ asset }) => {
    const confidentialAsset = asConfidentialAsset(asset, context);

    return confidentialAsset.isAccountFrozen(from);
  });

  const isSenderFrozen = await Promise.all(checkIsSenderAccountFrozenPromises);

  if (isSenderFrozen.some(v => v)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The sender account is frozen for trading specified asset',
    });
  }

  const checkIsReceiverAccountFrozenPromises = proofs.map(({ asset }) => {
    const confidentialAsset = asConfidentialAsset(asset, context);

    return confidentialAsset.isAccountFrozen(to);
  });

  const isReceiverFrozen = await Promise.all(checkIsReceiverAccountFrozenPromises);

  if (isReceiverFrozen.some(v => v)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The receiver account is frozen for trading specified asset',
    });
  }

  return serializeConfidentialAssetMoves(sendingAccount, receivingAccount, proofs, context);
}

/**
 * @hidden
 */
export async function prepareMoveFunds(
  this: ConfidentialProcedure<MoveFundsArgs, void>,
  args: MoveFundsArgs
): Promise<TransactionSpec<void, ExtrinsicParams<'confidentialAsset', 'moveAssets'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;

  const verifiedArgs = await Promise.all(args.map(arg => checkArgs(arg, context)));

  return {
    transaction: confidentialAsset.moveAssets,
    args: [verifiedArgs],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<MoveFundsArgs, void>
): ConfidentialProcedureAuthorization {
  return {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.confidentialAsset.MoveAssets],
    },
  };
}

/**
 * @hidden
 */
export const moveFunds = (): ConfidentialProcedure<MoveFundsArgs, void> =>
  new ConfidentialProcedure(prepareMoveFunds, getAuthorization);
