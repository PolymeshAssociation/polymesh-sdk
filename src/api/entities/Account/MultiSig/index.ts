import BigNumber from 'bignumber.js';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, Identity, modifyMultiSig, PolymeshError } from '~/internal';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  ModifyMultiSigParams,
  MultiSigDetails,
  ProcedureMethod,
  ProposalStatus,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  accountIdToString,
  addressToKey,
  identityIdToString,
  meshProposalStateToProposalStatus,
  meshProposalStatusToProposalStatus,
  momentToDate,
  signatoryToSignerValue,
  signerValueToSigner,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, optionize } from '~/utils/internal';

/**
 * Represents a MultiSig Account. A MultiSig Account is composed of one or more signing Accounts. In order to submit a transaction, a specific amount of those signing Accounts must approve it first
 */
export class MultiSig extends Account {
  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);
    this.modify = createProcedureMethod(
      {
        getProcedureAndArgs: modifyArgs => [modifyMultiSig, { multiSig: this, ...modifyArgs }],
      },
      context
    );
  }

  /**
   * Return details about this MultiSig such as the signing Accounts and the required number of signatures to execute a MultiSigProposal
   */
  public async details(): Promise<MultiSigDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
        isV6,
      },
      context,
      address,
    } = this;

    const rawAddress = stringToAccountId(address, context);
    const [rawSigners, rawSignersRequired] = await Promise.all([
      multiSig.multiSigSigners.entries(rawAddress),
      multiSig.multiSigSignsRequired(rawAddress),
    ]);
    const signers = rawSigners.map(
      ([
        {
          args: [, signatory],
        },
      ]) => {
        if (isV6) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return signerValueToSigner(signatoryToSignerValue(signatory as any), context);
        }
        const signerAddress = accountIdToString(signatory);
        return new Account({ address: signerAddress }, context);
      }
    );
    const requiredSignatures = u64ToBigNumber(rawSignersRequired);

    return { signers, requiredSignatures };
  }

  /**
   * Given an ID, fetch a { @link api/entities/MultiSigProposal!MultiSigProposal } for this MultiSig
   *
   * @throws if the MultiSigProposal is not found
   */
  public async getProposal(args: { id: BigNumber }): Promise<MultiSigProposal> {
    const { id } = args;
    const { address, context } = this;
    const proposal = new MultiSigProposal({ multiSigAddress: address, id }, context);

    const exists = await proposal.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Proposal with ID "${id}" was not found`,
      });
    }

    return proposal;
  }

  /**
   * Return all active { @link api/entities/MultiSigProposal!MultiSigProposal } for this MultiSig Account
   */
  public async getProposals(): Promise<MultiSigProposal[]> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
        isV6,
      },
      context,
      address,
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const rawProposalEntries = await multiSig.proposals.entries(rawAddress);

    const proposals: MultiSigProposal[] = [];

    if (!rawProposalEntries.length) {
      return [];
    }

    const queries = rawProposalEntries.map(
      ([
        {
          args: [rawKey, rawId],
        },
      ]) => {
        proposals.push(
          new MultiSigProposal({ multiSigAddress: address, id: u64ToBigNumber(rawId) }, context)
        );

        return [rawKey, rawId];
      }
    );

    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details: any[] = await (multiSig as any).proposalDetail.multi(queries);

      const statuses = details.map(({ status: rawStatus, expiry: rawExpiry }) => {
        const expiry = optionize(momentToDate)(rawExpiry.unwrapOr(null));

        return meshProposalStatusToProposalStatus(rawStatus, expiry);
      });

      return proposals.filter((_, index) => statuses[index] === ProposalStatus.Active);
    }

    const details = await multiSig.proposalStates.multi(queries);

    const statuses = details.map(stateOpt => {
      if (stateOpt.isSome) {
        const state = stateOpt.unwrap();
        return meshProposalStateToProposalStatus(state);
      }
      return ProposalStatus.Invalid;
    });

    return proposals.filter((_, index) => statuses[index] === ProposalStatus.Active);
  }

  /**
   * Return a set of { @link api/entities/MultiSigProposal!MultiSigProposal | MultiSigProposal } for this MultiSig Account
   *
   * @note uses the middlewareV2
   */
  public async getHistoricalProposals(opts?: {
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<MultiSigProposal>> {
    const { context, address } = this;
    const { size, start } = opts ?? {};

    const {
      data: {
        multiSigProposals: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'multiSigProposals'>>(
      multiSigProposalsQuery(address, size, start)
    );

    const data = nodes.map(
      ({ proposalId }) =>
        new MultiSigProposal({ id: new BigNumber(proposalId), multiSigAddress: address }, context)
    );

    const count = new BigNumber(totalCount);

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Returns the Identity of the MultiSig admin. This Identity can add or remove signers directly without creating a MultiSigProposal first.
   */
  public async getAdmin(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
        isV6,
      },
      context,
      address,
    } = this;

    if (isV6) {
      return this.getCreator();
    }

    const rawAddress = addressToKey(address, context);
    const rawAdminDid = await multiSig.adminDid(rawAddress);
    if (rawAdminDid.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No creator was found for this MultiSig address',
      });
    }

    const did = identityIdToString(rawAdminDid.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * Returns the payer for the MultiSig. If set
   */
  public async getPayer(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
        isV6,
      },
      context,
      address,
    } = this;

    if (isV6) {
      return this.getCreator();
    }

    const rawAddress = addressToKey(address, context);
    const rawPayingDid = await multiSig.payingDid(rawAddress);
    if (rawPayingDid.isNone) {
      return null;
    }

    const did = identityIdToString(rawPayingDid.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * Returns the Identity of the MultiSig creator. This Identity can add or remove signers directly without creating a MultiSigProposal first.
   *
   * @deprecated use `getAdmin` or `getPayer` instead depending on your need
   */
  public async getCreator(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
        isV6,
      },
      context,
      address,
    } = this;

    if (isV6) {
      const rawAddress = addressToKey(address, context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawAdminDid = await (multiSig as any).multiSigToIdentity(rawAddress);
      if (rawAdminDid.isNone) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'No creator was found for this MultiSig address',
        });
      }

      const did = identityIdToString(rawAdminDid.unwrap());

      return new Identity({ did }, context);
    } else {
      const admin = await this.getAdmin();

      if (admin === null) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'No creator was found for this MultiSig address',
        });
      }

      return admin;
    }
  }

  /**
   * Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig
   */
  public modify: ProcedureMethod<Pick<ModifyMultiSigParams, 'signers'>, void>;
}
