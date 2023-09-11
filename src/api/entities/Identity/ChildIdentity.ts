import { UniqueIdentifiers } from '~/api/entities/Identity';
import { unlinkChildIdentity } from '~/api/procedures/unlinkChildIdentity';
import { Context, Identity } from '~/internal';
import { NoArgsProcedureMethod } from '~/types';
import { identityIdToString, stringToIdentityId } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Represents a child identity
 */
export class ChildIdentity extends Identity {
  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.unlinkFromParent = createProcedureMethod(
      {
        getProcedureAndArgs: () => [unlinkChildIdentity, { child: this }],
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Returns the parent of this Identity (if any)
   */
  public async getParentDid(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
      did,
    } = this;

    const rawIdentityId = stringToIdentityId(did, context);
    const rawParentDid = await identity.parentDid(rawIdentityId);

    if (rawParentDid.isEmpty) {
      return null;
    }

    const parentDid = identityIdToString(rawParentDid.unwrap());

    return new Identity({ did: parentDid }, context);
  }

  /**
   * @hidden
   * since a child Identity doesn't has any other children, this method overrides the base implementation to return empty array
   */
  public override getChildIdentities(): Promise<ChildIdentity[]> {
    return Promise.resolve([]);
  }

  /**
   * Determine whether this child Identity exists
   *
   * @note asset Identities aren't considered to exist for this check
   */
  public override async exists(): Promise<boolean> {
    const parentDid = await this.getParentDid();

    return parentDid !== null;
  }

  /**
   * Unlinks this child identity from its parent
   *
   * @throws if
   *  - this identity doesn't has a parent
   *  - the transaction signer is not the primary key of the child identity
   */
  public unlinkFromParent: NoArgsProcedureMethod<void>;
}
