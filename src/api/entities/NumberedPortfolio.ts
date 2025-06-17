import BigNumber from 'bignumber.js';

import { Context, PolymeshError, Portfolio, renamePortfolio, setCustodian } from '~/internal';
import { portfolioQuery } from '~/middleware/queries/portfolios';
import { Query } from '~/middleware/types';
import {
  AuthorizationRequest,
  ErrorCode,
  EventIdentifier,
  ProcedureMethod,
  RenamePortfolioParams,
  SetCustodianParams,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  bigNumberToU64,
  bytesToString,
  middlewareEventDetailsToEventIdentifier,
  stringToIdentityId,
} from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  id: BigNumber;
}

/**
 * Represents a numbered (non-default) Portfolio for an Identity
 */
export class NumberedPortfolio extends Portfolio {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && id instanceof BigNumber;
  }

  /**
   * Portfolio identifier number
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, did } = identifiers;

    this.id = id;

    this.modifyName = createProcedureMethod(
      { getProcedureAndArgs: args => [renamePortfolio, { ...args, did, id }] },
      context
    );

    this.setCustodian = createProcedureMethod(
      { getProcedureAndArgs: args => [setCustodian, { ...args, did, id }] },
      context
    );
  }

  /**
   * Rename portfolio
   *
   * @note Only the owner is allowed to rename the Portfolio.
   */
  public modifyName: ProcedureMethod<RenamePortfolioParams, NumberedPortfolio>;

  /**
   * Return the Portfolio name
   */
  public async getName(): Promise<string> {
    const {
      owner: { did },
      id,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;
    const rawPortfolioName = await portfolio.portfolios(did, bigNumberToU64(id, context));

    if (rawPortfolioName.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The Portfolio doesn't exist",
      });
    }

    return bytesToString(rawPortfolioName.unwrap());
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Portfolio was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const {
      owner: { did },
      id,
      context,
    } = this;

    const {
      data: {
        portfolios: {
          nodes: [node],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'portfolios'>>(
      portfolioQuery({
        identityId: did,
        number: id.toNumber(),
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(node?.createdBlock, node?.eventIdx);
  }

  /**
   * Return whether this Portfolio exists
   */
  public async exists(): Promise<boolean> {
    const {
      owner: { did },
      id,
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const identityId = stringToIdentityId(did, context);
    const rawPortfolioNumber = bigNumberToU64(id, context);
    const size = await portfolio.portfolios.size(identityId, rawPortfolioNumber);

    return !size.isZero();
  }

  /**
   * Send an invitation to an Identity to assign it as custodian for this Numbered Portfolio
   *
   * @note this will create an {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `targetIdentity`.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public setCustodian: ProcedureMethod<SetCustodianParams, AuthorizationRequest>;
}
