/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity } from './Entity';
import { serialize, unserialize } from '~/utils';
import { Context } from '~/Context';
import { Balance } from '@polymathnetwork/polkadot/types/interfaces';
import { Pojo } from '~/types';

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
function isUniqueIdentifiers(identifier: any): identifier is UniqueIdentifiers {
  const { did } = identifier;

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
  public static unserialize(serialized: string): Pojo {
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
    // TODO MSDK-48 - Create an human readable value conversion
    return context.api.query.balances.identityBalance(did);
  };
}
