import P from 'bluebird';

import { Account, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { TxTag } from '~/polkadot/types';
import {
  AuthorizationType,
  DefaultPortfolio,
  ErrorCode,
  NumberedPortfolio,
  Permissions,
  PortfolioLike,
} from '~/types';
import { SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  portfolioLikeToPortfolio,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface InviteAccountParams {
  targetAccount: string | Account;
  permissions?: {
    tokens?: (string | SecurityToken)[] | null;
    transactions?: TxTag[] | null;
    portfolios?: PortfolioLike[] | null;
  };
  expiry?: Date;
}

/**
 * @hidden
 */
export async function prepareInviteAccount(
  this: Procedure<InviteAccountParams, void>,
  args: InviteAccountParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const { targetAccount, permissions, expiry } = args;

  const address = signerToString(targetAccount);

  let account: Account;

  if (targetAccount instanceof Account) {
    account = targetAccount;
  } else {
    account = new Account({ address: targetAccount }, context);
  }

  const currentIdentity = await context.getCurrentIdentity();

  const [authorizationRequests, secondaryKeys, existingIdentity] = await Promise.all([
    currentIdentity.authorizations.getSent(),
    context.getSecondaryKeys(),
    account.getIdentity(),
  ] as const);

  if (existingIdentity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is already part of an Identity',
    });
  }

  const isPresent = !!secondaryKeys.find(({ signer }) => signerToString(signer) === address);

  if (isPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is already a secondary key for this Identity',
    });
  }

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(target) === address &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.JoinIdentity
    );
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account already has a pending invitation to join this Identity',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Account, value: address },
    context
  );

  let authorizationValue: Permissions = {
    tokens: [],
    transactions: [],
    portfolios: [],
  };

  let tokenPermissions: SecurityToken[] | null = [];
  let transactionPermissions: TxTag[] | null = [];
  let portfolioPermissions: (DefaultPortfolio | NumberedPortfolio)[] | null = [];

  if (permissions) {
    const { tokens, transactions, portfolios } = permissions;

    if (tokens === null) {
      tokenPermissions = null;
    } else if (tokens) {
      tokenPermissions = tokens.map(ticker =>
        typeof ticker !== 'string' ? ticker : new SecurityToken({ ticker }, context)
      );
    }

    if (transactions === null) {
      transactionPermissions = null;
    } else if (transactions) {
      transactionPermissions = transactions;
    }

    if (portfolios === null) {
      portfolioPermissions = null;
    } else if (portfolios) {
      portfolioPermissions = await P.map(portfolios, portfolio =>
        portfolioLikeToPortfolio(portfolio, context)
      );
    }

    authorizationValue = {
      tokens: tokenPermissions,
      transactions: transactionPermissions,
      portfolios: portfolioPermissions,
    };
  }

  const rawAuthorizationData = authorizationToAuthorizationData(
    {
      type: AuthorizationType.JoinIdentity,
      value: authorizationValue,
    },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
export const inviteAccount = new Procedure(prepareInviteAccount);
