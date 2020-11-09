import BigNumber from 'bignumber.js';

import { Account, DefaultPortfolio, NumberedPortfolio } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationType, ErrorCode } from '~/types';
import { SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils';

export interface SetCustodianParams {
  targetAccount: string | Account;
  expiry?: Date;
}

/**
 * @hidden
 */
export type Params = { did: string; id?: BigNumber } & SetCustodianParams;

/**
 * @hidden
 */
export async function prepareSetCustodian(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const { targetAccount, expiry, did, id } = args;

  const portfolio = id
    ? new NumberedPortfolio({ did, id }, context)
    : new DefaultPortfolio({ did }, context);

  const address = signerToString(targetAccount);
  const currentIdentity = await context.getCurrentIdentity();
  const authorizationRequests = await currentIdentity.authorizations.getSent();

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data,
      data: { type },
    } = authorizationRequest;

    if (type === AuthorizationType.PortfolioCustody) {
      const authorizationData = data as { value: NumberedPortfolio | DefaultPortfolio };

      return (
        signerToString(target) === address &&
        !authorizationRequest.isExpired() &&
        type === AuthorizationType.PortfolioCustody &&
        authorizationData.value.uuid === portfolio.uuid
      );
    }

    return false;
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The target Account already has a pending invitation to be the custodian for the portfolio',
    });
  }

  // TODO @shuffledex: validate owner and custodian properties

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Account, value: address },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.PortfolioCustody, value: portfolio },
    context
  );

  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
export const setCustodian = new Procedure(prepareSetCustodian);
