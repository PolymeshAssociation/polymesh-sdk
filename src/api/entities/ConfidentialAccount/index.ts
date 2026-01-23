import BigNumber from 'bignumber.js';

import { ConfidentialAccountDetails } from '~/api/entities/ConfidentialAccount/types';
import { Context, Entity, Identity, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { identityIdToString } from '~/utils/conversion';

export interface UniqueIdentifiers {
  /**
   * The DART account public key (hex string)
   */
  publicKey: string;
}

/**
 * Represents a DART Confidential Account on the Polymesh blockchain.
 *
 * Confidential Accounts are used for holding and transferring confidential assets
 * using zero-knowledge proofs and CurveTrees.
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
   * The DART account public key (hex string)
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
   * @hidden
   * Helper to get the confidentialAssets query module
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getConfidentialAssetsQuery(): any {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidentialAssets = (query as any).confidentialAssets;
    if (!confidentialAssets) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential assets module is not available on this chain',
      });
    }

    return confidentialAssets;
  }

  /**
   * Determine whether this Confidential Account exists on chain
   */
  public async exists(): Promise<boolean> {
    const identity = await this.getIdentity();

    return identity !== null;
  }

  /**
   * Retrieve the Identity associated with this Confidential Account
   *
   * @returns Identity if the account exists, null otherwise
   */
  public async getIdentity(): Promise<Identity | null> {
    const { publicKey, context } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawDid = await confidentialAssets.accountDid(publicKey);

    if (rawDid.isNone) {
      return null;
    }

    return new Identity({ did: identityIdToString(rawDid.unwrap()) }, context);
  }

  /**
   * Get the details of this Confidential Account
   *
   * @throws if the Confidential Account does not exist
   */
  public async getDetails(): Promise<ConfidentialAccountDetails> {
    const { publicKey, context } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const [rawDid, rawEncryptionKey] = await Promise.all([
      confidentialAssets.accountDid(publicKey),
      confidentialAssets.accountEncryptionKey(publicKey),
    ]);

    if (rawDid.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Account does not exist',
      });
    }

    const identity = new Identity({ did: identityIdToString(rawDid.unwrap()) }, context);

    let encryptionKey = '';
    if (rawEncryptionKey.isSome) {
      encryptionKey = rawEncryptionKey.unwrap().toString();
    }

    return {
      identity,
      encryptionKey,
    };
  }

  /**
   * Check if this account is registered for a specific confidential asset
   *
   * @param args.assetId - The confidential asset ID to check
   */
  public async isRegisteredForAsset(args: { assetId: BigNumber }): Promise<boolean> {
    const { publicKey } = this;
    const { assetId } = args;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const isRegistered = await confidentialAssets.accountAssetRegistrations(
      publicKey,
      assetId.toNumber()
    );

    return isRegistered.isTrue;
  }

  /**
   * Get all confidential assets this account is registered for
   *
   * @note This iterates through all asset registrations for this account
   */
  public async getRegisteredAssets(): Promise<BigNumber[]> {
    const { publicKey } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const entries = await confidentialAssets.accountAssetRegistrations.entries(publicKey);

    return entries
      .filter(([, isRegistered]: [unknown, { isTrue: boolean }]) => isRegistered.isTrue)
      .map(
        ([
          {
            args: [, rawAssetId],
          },
        ]: [{ args: [unknown, { toNumber(): number }] }, unknown]) =>
          new BigNumber(rawAssetId.toNumber())
      );
  }

  /**
   * Return the Confidential Account's public key
   */
  public toHuman(): string {
    return this.publicKey;
  }
}
