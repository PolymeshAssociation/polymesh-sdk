import BigNumber from 'bignumber.js';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { setMultiSigAdmin } from '~/api/procedures/setMultiSigAdmin';
import {
  Account,
  Context,
  Identity,
  modifyMultiSig,
  PolymeshError,
  removeMultiSigPayer,
} from '~/internal';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { CallIdEnum, ModuleIdEnum, Query, Scalars } from '~/middleware/types';
import { MultiSigProposalStatusEnum } from '~/middleware/typesV1';
import {
  AnyJson,
  ErrorCode,
  HistoricalMultiSigProposal,
  ModifyMultiSigParams,
  MultiSigDetails,
  NoArgsProcedureMethod,
  ProcedureMethod,
  ProposalStatus,
  ResultSet,
  SetMultiSigAdminParams,
  TxTag,
  UtilityTx,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  accountIdToString,
  addressToKey,
  extrinsicIdentifierToTxTag,
  identityIdToString,
  meshProposalStateToProposalStatus,
  middlewareProposalStateToProposalStatus,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod } from '~/utils/internal';

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

    this.setAdmin = createProcedureMethod(
      { getProcedureAndArgs: adminArgs => [setMultiSigAdmin, { multiSig: this, ...adminArgs }] },
      context
    );

    this.removePayer = createProcedureMethod(
      {
        getProcedureAndArgs: () => [removeMultiSigPayer, { multiSig: this }],
        voidArgs: true,
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
  }): Promise<ResultSet<HistoricalMultiSigProposal>> {
    const { context, address } = this;
    const { size, start } = opts ?? {};

    const {
      data: {
        multiSigProposals: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'multiSigProposals'>>(
      multiSigProposalsQuery(address, size, start)
    );

    const getTxTagAndArgs = (
      proposal: Scalars['JSON']['output']
    ): Pick<HistoricalMultiSigProposal, 'txTag' | 'args'> => ({
      txTag: extrinsicIdentifierToTxTag({
        moduleId: proposal.module.toLowerCase() as ModuleIdEnum,
        callId: proposal.call as CallIdEnum,
      }),
      args: proposal.args,
    });

    const data = nodes.map(({ proposalId, status, approvalCount, rejectionCount, params }) => {
      const { expiry, proposals, isBatch } = params;

      let txTag: TxTag;
      let args: AnyJson;

      if (isBatch) {
        txTag = UtilityTx.Batch;
        args = proposals.map(getTxTagAndArgs);
      } else {
        ({ txTag, args } = getTxTagAndArgs(proposals[0]));
      }

      return {
        proposal: new MultiSigProposal(
          { id: new BigNumber(proposalId), multiSigAddress: address },
          context
        ),
        status: middlewareProposalStateToProposalStatus(status as MultiSigProposalStatusEnum),
        approvalAmount: new BigNumber(approvalCount),
        rejectionAmount: new BigNumber(rejectionCount),
        expiry: expiry ? new Date(+expiry.replaceAll(',', '')) : null,
        txTag,
        args,
      } as HistoricalMultiSigProposal;
    });

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
  public async getAdmin(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      context,
      address,
    } = this;

    const rawAddress = addressToKey(address, context);
    const rawAdminDid = await multiSig.adminDid(rawAddress);

    if (rawAdminDid.isNone) {
      return null;
    }

    const did = identityIdToString(rawAdminDid.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * Returns the payer for the MultiSig, if set the primary account of the identity will pay for any fees the MultiSig may incur
   */
  public async getPayer(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      context,
      address,
    } = this;

    const rawAddress = addressToKey(address, context);
    const rawPayingDid = await multiSig.payingDid(rawAddress);
    if (rawPayingDid.isNone) {
      return null;
    }

    const did = identityIdToString(rawPayingDid.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig
   */
  public modify: ProcedureMethod<
    Pick<ModifyMultiSigParams, 'signers' | 'requiredSignatures'>,
    void
  >;

  /**
   * Set an admin for the MultiSig. When setting an admin it must be signed by one of the MultiSig signers and ran
   * as a proposal. When removing an admin it must be called by account belonging to the admin's identity
   */
  public setAdmin: ProcedureMethod<SetMultiSigAdminParams, void>;

  /**
   * A MultiSig's creator is initially responsible for any fees the MultiSig may incur. This method allows for the
   * MultiSig to pay for it's own fees.
   *
   * @note This method must be called by one of the MultiSig signer's or by the paying identity.
   */
  public removePayer: NoArgsProcedureMethod<void>;
}
