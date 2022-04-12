import BigNumber from 'bignumber.js';

import { UniqueIdentifiers } from '~/api/entities/Account';
import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { modifyMultiSigAccount } from '~/api/procedures/modifyMultiSig';
import { Account, Context, Identity, PolymeshError } from '~/internal';
import { ErrorCode, ProcedureMethod, Signer } from '~/types';
import {
  accountIdToString,
  addressToKey,
  identityIdToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

interface MultiSigDetails {
  signers: Signer[];
  signaturesRequired: BigNumber;
}

/**
 * Represents a MultiSig Account. MultiSig functions like an { @link Account } except submitted extrinsics need to be approved by a number of signers
 */
export class MultiSig extends Account {
  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.modify = createProcedureMethod(
      {
        getProcedureAndArgs: modifyArgs => [
          modifyMultiSigAccount,
          { multiSig: this, ...modifyArgs },
        ],
      },
      context
    );
  }

  /**
   * Returns details about this MultiSig such as the signing accounts and the required number of signatures to execute a MultiSigProposal
   */
  public async details(): Promise<MultiSigDetails> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      address,
    } = this;
    const [rawSigners, rawSignersRequired] = await Promise.all([
      multiSig.multiSigSigners.entries(address),
      multiSig.multiSigSignsRequired(address),
    ]);
    const signers = rawSigners.map(([, signatory]) => {
      if (signatory.isAccount) {
        const signatoryAddress = accountIdToString(signatory.asAccount);
        return new Account({ address: signatoryAddress }, this.context);
      } else {
        const did = identityIdToString(signatory.asIdentity);
        return new Identity({ did }, this.context);
      }
    });
    const signaturesRequired = u64ToBigNumber(rawSignersRequired);
    return { signers, signaturesRequired };
  }

  /**
   * Given an ID fetches a { @link MultiSigProposal } for this MultiSig
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
   * Returns all { @link MultiSigProposal | MultiSigProposals } for this MultiSig Account
   */
  public async getProposals(): Promise<MultiSigProposal[]> {
    const {
      context: {
        polymeshApi: {
          query: { multiSig },
        },
      },
      address,
    } = this;

    const rawProposals = await multiSig.proposalIds.entries(address);
    return rawProposals.map(([, rawId]) => {
      if (rawId.isSome) {
        const id = u64ToBigNumber(rawId.unwrap());
        return new MultiSigProposal(
          { multiSigAddress: address, id: new BigNumber(id) },
          this.context
        );
      } else {
        throw new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'A Proposal was missing its ID. Perhaps it was already executed',
        });
      }
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
    } = this;

    const rawAddress = addressToKey(this.address, context);
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
   * Modify the signers for the MultiSig. The signingAccount must belong to the Identity of the creator of the MultiSig
   */
  public modify: ProcedureMethod<{ signers: Signer[] }, void>;
}
