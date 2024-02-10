import { ConfidentialAssetsElgamalCipherText } from '@polkadot/types/lookup';
import type { Option, U8aFixed } from '@polkadot/types-codec';

import { ConfidentialAsset, Context, Entity, Identity, PolymeshError } from '~/internal';
import { ConfidentialAssetBalance, ErrorCode } from '~/types';
import {
  confidentialAccountToMeshPublicKey,
  identityIdToString,
  meshConfidentialAssetToAssetId,
  serializeConfidentialAssetId,
} from '~/utils/conversion';
import { asConfidentialAsset } from '~/utils/internal';

/**
 * @hidden
 */
export interface UniqueIdentifiers {
  publicKey: string;
}

/**
 * Represents an confidential Account in the Polymesh blockchain
 */
export class ConfidentialAccount extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { publicKey } = identifier as UniqueIdentifiers;

    return typeof publicKey === 'string';
  }

  /**
   * Public key of the confidential Account. Serves as an identifier
   */
  public publicKey: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { publicKey } = identifiers;

    this.publicKey = publicKey;
  }

  /**
   * Retrieve the Identity associated to this Account (null if there is none)
   */
  public async getIdentity(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      context,
      publicKey,
    } = this;

    const optIdentityId = await confidentialAsset.accountDid(publicKey);

    if (optIdentityId.isNone) {
      return null;
    }

    const did = identityIdToString(optIdentityId.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * Retrieves all incoming balances for this Confidential Account
   */
  public async getIncomingBalances(): Promise<ConfidentialAssetBalance[]> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      context,
      publicKey,
    } = this;

    const rawEntries = await confidentialAsset.incomingBalance.entries(publicKey);

    const assembleResult = (
      rawAssetId: U8aFixed,
      rawBalance: Option<ConfidentialAssetsElgamalCipherText>
    ): ConfidentialAssetBalance => {
      const assetId = meshConfidentialAssetToAssetId(rawAssetId);
      const encryptedBalance = rawBalance.unwrap();
      return {
        asset: new ConfidentialAsset({ id: assetId }, context),
        balance: encryptedBalance.toString(),
      };
    };

    return rawEntries.map(
      ([
        {
          args: [, rawAssetId],
        },
        rawBalance,
      ]) => assembleResult(rawAssetId, rawBalance)
    );
  }

  /**
   * Retrieves incoming balance for a specific Confidential Asset
   */
  public async getIncomingBalance(args: { asset: ConfidentialAsset | string }): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: {
            confidentialAsset: { incomingBalance },
          },
        },
      },
      context,
      publicKey,
    } = this;

    const confidentialAsset = asConfidentialAsset(args.asset, context);

    const rawBalance = await incomingBalance(
      publicKey,
      serializeConfidentialAssetId(confidentialAsset)
    );

    if (rawBalance.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No incoming balance found for the given asset',
        data: {
          assetId: confidentialAsset.id,
        },
      });
    }

    return rawBalance.unwrap().toString();
  }

  /**
   * Determine whether this Account exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawPublicKey = confidentialAccountToMeshPublicKey(this, this.context);

    const didRecord = await confidentialAsset.accountDid(rawPublicKey);
    return didRecord.isSome;
  }

  /**
   * Return the Account's address
   */
  public toHuman(): string {
    return this.publicKey;
  }
}
