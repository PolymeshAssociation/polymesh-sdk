import { Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { serialize, unserialize } from '~/utils/internal';

/**
 * Represents an object or resource in the Polymesh Ecosystem with its own set of properties and functionality
 */
export class Entity<UniqueIdentifiers> {
  /**
   * Generate the Entity's UUID from its identifying properties
   *
   * @param identifiers
   */
  public static generateUuid<Identifiers>(identifiers: Identifiers): string {
    return serialize(this.name, identifiers);
  }

  /**
   * Unserialize a UUID into its Unique Identifiers
   *
   * @param serialized - UUID to unserialize
   */
  public static unserialize<Identifiers>(serialized: string): Identifiers {
    const unserialized = unserialize<Identifiers>(serialized);

    if (!this.isUniqueIdentifiers(unserialized)) {
      throw new PolymeshError({
        code: ErrorCode.InvalidUuid,
        message: `The string doesn't correspond to the UUID of type ${this.name}`,
      });
    }

    return unserialized;
  }

  /* istanbul ignore next: this function should always be overridden */
  /**
   * Typeguard that checks whether the object passed corresponds to the unique identifiers of the class. Must be overridden
   *
   * @param identifiers - object to type check
   */
  public static isUniqueIdentifiers(identifiers: unknown): boolean {
    return !!identifiers;
  }

  public uuid: string;

  protected context: Context;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    this.uuid = (this.constructor as typeof Entity).generateUuid(identifiers);
    this.context = context;
  }

  /**
   * Whether this Entity is the same as another one
   */
  public isEqual(entity: Entity<unknown>): boolean {
    return this.uuid === entity.uuid;
  }
}
