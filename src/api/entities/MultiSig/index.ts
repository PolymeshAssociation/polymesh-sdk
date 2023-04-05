import BigNumber from 'bignumber.js';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, Identity, modifyMultiSig, PolymeshError } from '~/internal';
import {
  AccountType,
  ErrorCode,
  ModifyMultiSigParams,
  MultiSigDetails,
  ProcedureMethod,
} from '~/types';
import {
  addressToKey,
  identityIdToString,
  signatoryToSignerValue,
  signerValueToSigner,
  stringToAccountId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Represents a MultiSig Account. A MultiSig Account is composed of one or more signing Accounts. In order to submit a transaction, a specific amount of those signing Accounts must approve it first
 */
export class MultiSig extends Account {
  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, AccountType.MultiSig, context);
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
        return signerValueToSigner(signatoryToSignerValue(signatory), context);
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
   * Return all { @link api/entities/MultiSigProposal!MultiSigProposal } for this MultiSig Account
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

    const rawProposals = await multiSig.proposalIds.entries(rawAddress);

    return rawProposals.map(([, rawId]) => {
      const id = u64ToBigNumber(rawId.unwrap());

      return new MultiSigProposal({ multiSigAddress: address, id }, context);
    });
  }

  /**
   * Returns the Identity of the MultiSig creator. This Identity can add or remove signers directly without creating a MultiSigProposal first.
   */
  public async getCreator(): Promise<Identity> {
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
    const rawCreatorDid = await multiSig.multiSigToIdentity(rawAddress);
    if (rawCreatorDid.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No creator was found for this MultiSig address',
      });
    }

    const did = identityIdToString(rawCreatorDid);

    return new Identity({ did }, context);
  }

  /**
   * Modify the signers for the MultiSig. The signing Account must belong to the Identity of the creator of the MultiSig
   */
  public modify: ProcedureMethod<Pick<ModifyMultiSigParams, 'signers'>, void>;
}
