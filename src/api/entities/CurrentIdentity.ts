import { u64 } from '@polkadot/types';
import P from 'bluebird';
import { chunk, flatten, uniqBy } from 'lodash';
import { Instruction as MeshInstruction } from 'polymesh-types/types';

import { Identity, Instruction, Venue } from '~/api/entities';
import {
  createVenue,
  CreateVenueParams,
  inviteAccount,
  InviteAccountParams,
  removeSecondaryKeys,
} from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { SecondaryKey, Signer, SubCallback, UnsubCallback } from '~/types';
import { MAX_CONCURRENT_REQUESTS } from '~/utils/constants';
import {
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  u64ToBigNumber,
} from '~/utils/conversion';

/**
 * Represents the Identity associated to the current [[Account]]
 */
export class CurrentIdentity extends Identity {
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
  public removeSecondaryKeys(args: { signers: Signer[] }): Promise<TransactionQueue<void>> {
    return removeSecondaryKeys.prepare(args, this.context);
  }

  /**
   * Send an invitation to an Account to join to your Identity
   *
   * @note this may create AuthorizationRequest which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   */
  public inviteAccount(args: InviteAccountParams): Promise<TransactionQueue<void>> {
    return inviteAccount.prepare(args, this.context);
  }

  /**
   * Create a Venue
   */
  public createVenue(args: CreateVenueParams): Promise<TransactionQueue<Venue>> {
    return createVenue.prepare(args, this.context);
  }

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

    const [ownedCustodiedPortfolios, custodiedPortfolios] = await Promise.all([
      P.filter(ownedPortfolios, portfolio => portfolio.isCustodiedBy({ identity: did })),
      this.portfolios.getCustodiedPortfolios(),
    ]);

    const allPortfolios = [...ownedCustodiedPortfolios, ...custodiedPortfolios];

    const portfolioIds = await P.map(allPortfolios, portfolio =>
      portfolioLikeToPortfolioId(portfolio, context)
    );

    const portfolioIdChunks = chunk(portfolioIds, MAX_CONCURRENT_REQUESTS);

    const chunkedInstructions = await P.mapSeries(portfolioIdChunks, async portfolioIdChunk => {
      const auths = await P.map(portfolioIdChunk, portfolioId =>
        settlement.userAuths.entries(portfolioIdToMeshPortfolioId(portfolioId, context))
      );

      const instructionIds = uniqBy(
        flatten(auths).map(([key]) => key.args[1] as u64),
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
