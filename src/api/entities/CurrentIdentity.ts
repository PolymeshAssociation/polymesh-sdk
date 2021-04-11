import P from 'bluebird';
import { chunk, flatten, uniqBy } from 'lodash';
import { Instruction as MeshInstruction } from 'polymesh-types/types';

import { UniqueIdentifiers } from '~/api/entities/Identity';
import { assertPortfolioExists } from '~/api/procedures/utils';
import {
  Context,
  createVenue,
  CreateVenueParams,
  Identity,
  Instruction,
  inviteAccount,
  InviteAccountParams,
  modifySignerPermissions,
  ModifySignerPermissionsParams,
  removeSecondaryKeys,
  RemoveSecondaryKeysParams,
  Venue,
} from '~/internal';
import { SecondaryKey, Signer, SubCallback, UnsubCallback } from '~/types';
import { ProcedureMethod } from '~/types/internal';
import { MAX_CONCURRENT_REQUESTS } from '~/utils/constants';
import {
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Represents the Identity associated to the current [[Account]]
 */
export class CurrentIdentity extends Identity {
  /**
   * Create a CurrentIdentity entity
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.removeSecondaryKeys = createProcedureMethod(
      { getProcedureAndArgs: args => [removeSecondaryKeys, args] },
      context
    );
    this.revokePermissions = createProcedureMethod<
      { secondaryKeys: Signer[] },
      ModifySignerPermissionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => {
          const { secondaryKeys } = args;
          const signers = secondaryKeys.map(signer => {
            return {
              signer,
              permissions: { tokens: [], transactions: [], portfolios: [] },
            };
          });
          return [modifySignerPermissions, { secondaryKeys: signers }];
        },
      },
      context
    );
    this.modifyPermissions = createProcedureMethod(
      { getProcedureAndArgs: args => [modifySignerPermissions, args] },
      context
    );
    this.inviteAccount = createProcedureMethod(
      { getProcedureAndArgs: args => [inviteAccount, args] },
      context
    );
    this.createVenue = createProcedureMethod(
      { getProcedureAndArgs: args => [createVenue, args] },
      context
    );
  }

  /**
   * Get the list of secondary keys related to the Identity
   *
   * @note can be subscribed to
   */
  public async getSecondaryKeys(): Promise<SecondaryKey[]>;
  public async getSecondaryKeys(callback: SubCallback<SecondaryKey[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getSecondaryKeys(
    callback?: SubCallback<SecondaryKey[]>
  ): Promise<SecondaryKey[] | UnsubCallback> {
    const { context } = this;

    if (callback) {
      return context.getSecondaryKeys(callback);
    }

    return context.getSecondaryKeys();
  }

  /**
   * Remove a list of secondary keys associated with the Identity
   */
  public removeSecondaryKeys: ProcedureMethod<RemoveSecondaryKeysParams, void>;

  /**
   * Revoke all permissions of a list of secondary keys associated with the Identity
   */
  public revokePermissions: ProcedureMethod<{ secondaryKeys: Signer[] }, void>;

  /**
   * Modify all permissions of a list of secondary keys associated with the Identity
   *
   * @param args.secondaryKeys.permissions - list of permissions
   * @param args.secondaryKeys.permissions.tokens - array of Security Tokens on which to grant permissions. A null value represents full permissions
   * @param args.secondaryKeys.permissions.transactions - array of transaction tags that the Secondary Key has permission to execute. A null value represents full permissions
   * @param args.secondaryKeys.permissions.portfolios - array of Portfolios for which to grant permissions. A null value represents full permissions
   */
  public modifyPermissions: ProcedureMethod<ModifySignerPermissionsParams, void>;

  /**
   * Send an invitation to an Account to join this Identity
   *
   * @note this may create AuthorizationRequest which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @param args.permissions - list of allowed permissions (optional, defaults to no permissions)
   * @param args.permissions.tokens - array of Security Tokens (or tickers) for which to allow permission. Set null to allow all (optional, no permissions if not passed)
   * @param args.permissions.transactions - array of tags associated with the transaction that will be executed for which to allow permission. Set null to allow all (optional, no permissions if not passed)
   * @param args.permissions.portfolios - array of portfolios for which to allow permission. Set null to allow all (optional, no permissions if not passed)
   */
  public inviteAccount: ProcedureMethod<InviteAccountParams, void>;

  /**
   * Create a Venue
   */
  public createVenue: ProcedureMethod<CreateVenueParams, Venue>;

  /**
   * Retrieve all pending Instructions involving the Current Identity
   */
  public async getPendingInstructions(): Promise<Instruction[]> {
    const {
      context: {
        polymeshApi: {
          query: { settlement },
        },
      },
      did,
      portfolios,
      context,
    } = this;

    const ownedPortfolios = await portfolios.getPortfolios();

    const [ownedCustodiedPortfolios, { data: custodiedPortfolios }] = await Promise.all([
      P.filter(ownedPortfolios, portfolio => portfolio.isCustodiedBy({ identity: did })),
      this.portfolios.getCustodiedPortfolios(),
    ]);

    const allPortfolios = [...ownedCustodiedPortfolios, ...custodiedPortfolios];

    const portfolioIds = allPortfolios.map(portfolioLikeToPortfolioId);

    await P.map(portfolioIds, portfolioId => assertPortfolioExists(portfolioId, context));

    const portfolioIdChunks = chunk(portfolioIds, MAX_CONCURRENT_REQUESTS);

    const chunkedInstructions = await P.mapSeries(portfolioIdChunks, async portfolioIdChunk => {
      const auths = await P.map(portfolioIdChunk, portfolioId =>
        settlement.userAffirmations.entries(portfolioIdToMeshPortfolioId(portfolioId, context))
      );

      const instructionIds = uniqBy(
        flatten(auths).map(([key]) => key.args[1]),
        id => id.toNumber()
      );
      return settlement.instructionDetails.multi<MeshInstruction>(instructionIds);
    });

    const rawInstructions = flatten(chunkedInstructions);

    return rawInstructions
      .filter(({ status }) => status.isPending)
      .map(({ instruction_id: id }) => new Instruction({ id: u64ToBigNumber(id) }, context));
  }
}
