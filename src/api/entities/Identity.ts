import { Balance } from '@polymathnetwork/polkadot/types/interfaces';

import { Entity } from '~/base/Entity';
import { PolymeshError } from '~/base/PolymeshError';
import { Context } from '~/Context';
import { ErrorCode } from '~/types';
import { serialize, unserialize } from '~/utils';

/**
 * Properties that uniquely identify an Identity
 */
export interface UniqueIdentifiers {
  did: string;
}

/**
 * Constructor parameters
 */
export type Params = UniqueIdentifiers;

/**
 * @hidden
 * Checks if a value is of type [[UniqueIdentifiers]]
 */
function isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
  const { did } = identifier as UniqueIdentifiers;

  return typeof did === 'string';
}

/**
 * Used to manage an Identity
 */
export class Identity extends Entity {
  /**
   * Generate the Identity's UUID from its identifying properties
   */
  public static generateUuid({ did }: UniqueIdentifiers): string {
    return serialize('identity', {
      did,
    });
  }

  /**
   * Unserialize a serialized entity
   *
   * @param serialized - string with entity information
   */
  public static unserialize(serialized: string): Record<string, unknown> {
    const unserialized = unserialize(serialized);

    if (!isUniqueIdentifiers(unserialized)) {
      throw new PolymeshError({
        code: ErrorCode.InvalidUuid,
        message: 'The string is not related to an Identity Unique Identifier',
      });
    }

    return unserialized;
  }

  /**
   * Universal unique identifier for entity Identity
   */
  public uuid: string;

  /**
   * Identity ID as stored in the blockchain
   */
  public did: string;

  protected context: Context;

  /**
   * Create an Identity entity
   */
  constructor(params: Params, context: Context) {
    super();

    const { did } = params;

    this.did = did;

    this.context = context;

    this.uuid = Identity.generateUuid({
      did,
    });
  }

  /**
   * Retrieve the POLY balance of this particular Identity
   */
  public getPolyBalance = async (): Promise<Balance> => {
    const { context, did } = this;
    // TODO MSDK-48 - Create an human readable value conversion
    return context.polymeshApi.query.balances.identityBalance(did);
  };
}
