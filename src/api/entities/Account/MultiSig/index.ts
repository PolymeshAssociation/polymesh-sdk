import BigNumber from 'bignumber.js';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { setMultiSigAdmin } from '~/api/procedures/setMultiSigAdmin';
import {
  Account,
  Context,
  Identity,
  joinCreator,
  modifyMultiSig,
  PolymeshError,
  removeMultiSigPayer,
} from '~/internal';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  JoinCreatorParams,
  ModifyMultiSigParams,
  MultiSigDetails,
  NoArgsProcedureMethod,
  OptionalArgsProcedureMethod,
  ProcedureMethod,
  ProposalStatus,
  ResultSet,
  SetMultiSigAdminParams,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  accountIdToString,
  addressToKey,
  identityIdToString,
  meshProposalStateToProposalStatus,
  meshProposalStatusToProposalStatus, // NOSONAR
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

    this.joinCreator = createProcedureMethod(
      {
        getProcedureAndArgs: joinArgs => [joinCreator, { multiSig: this, ...joinArgs }],
        optionalArgs: true,
      },
      context
    ); // NOSONAR
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
        /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
        if (isV6) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return signerValueToSigner(signatoryToSignerValue(signatory as any), context); // NOSONAR
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

    /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details: any[] = await (multiSig as any).proposalDetail.multi(queries); // NOSONAR

      const statuses = details.map(({ status: rawStatus, expiry: rawExpiry }) => {
        const expiry = optionize(momentToDate)(rawExpiry.unwrapOr(null));

        return meshProposalStatusToProposalStatus(rawStatus, expiry); // NOSONAR
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
  public async getAdmin(): Promise<Identity | null> {
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

    /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
    if (isV6) {
      return this.getCreator(); // NOSONAR
    }

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
        isV6,
      },
      context,
      address,
    } = this;

    /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
    if (isV6) {
      return this.getCreator(); // NOSONAR
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

    /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
    if (isV6) {
      const rawAddress = addressToKey(address, context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawCreatorDid = await (multiSig as any).multiSigToIdentity(rawAddress); // NOSONAR

      if (rawCreatorDid.isNone || rawCreatorDid.isEmpty) {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'No creator was found for this MultiSig address',
        });
      }

      const did = identityIdToString(rawCreatorDid);

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

  /**
   * Attach a MultiSig directly to the creator's identity. This method bypasses the usual authorization step to join an identity
   *
   * @note the caller should be the MultiSig creator's primary key
   *
   * @note To attach the MultiSig to an identity other than the creator's, {@link api/client/AccountManagement!AccountManagement.inviteAccount | inviteAccount} can be used instead. The MultiSig will then need to accept the created authorization
   *
   * @deprecated this method is only available in v6 as in v7 the MultiSig is automatically attached to the creator's identity
   */
  public joinCreator: OptionalArgsProcedureMethod<JoinCreatorParams, void> | (() => never);
}
