import { Context, Entity, Identity } from '~/internal';
import { confidentialAccountToMeshPublicKey, identityIdToString } from '~/utils/conversion';

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
