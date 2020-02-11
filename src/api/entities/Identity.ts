import { Entity } from './Entity';
import { serialize, unserialize } from '~/utils';
import { Context } from '~/Context';
import { Balance } from '@polymathnetwork/polkadot/types/interfaces';

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

function isUniqueIdentifiers(identifier: any): identifier is UniqueIdentifiers {
  const { did } = identifier;

  return typeof did === 'string';
}

/**
 * Used to manage an Identity
 */
export class Identity extends Entity {
  public static generateUuid({ did }: UniqueIdentifiers): string {
    return serialize('identity', {
      did,
    });
  }

  /**
   * Unserialize a serialized entity
   *
   * @param serialized string with entity information
   */
  public static unserialize(serialized: string) {
    const unserialized = unserialize(serialized);

    if (!isUniqueIdentifiers(unserialized)) {
      // throw error
    }

    return unserialized;
  }

  /**
   * Universal unique identifier for entity Identity
   */
  public uuid: string;

  /**
   * Unique identifier for an Identity
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
    return context.api.query.balances.identityBalance(did);
  };
}
