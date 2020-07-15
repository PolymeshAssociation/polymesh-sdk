import { ApolloQueryResult } from 'apollo-client';
import { AssetIdentifier, SecurityToken as MeshSecurityToken } from 'polymesh-types/types';

import { Identity } from '~/api/entities/Identity';
import {
  modifyToken,
  ModifyTokenParams,
  transferTokenOwnership,
  TransferTokenOwnershipParams,
} from '~/api/procedures';
import { Entity, PolymeshError, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { eventByIndexedArgs } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  Ensured,
  ErrorCode,
  EventIdentifier,
  SubCallback,
  TokenIdentifier,
  TokenIdentifierType,
  UnsubCallback,
} from '~/types';
import {
  assetIdentifierToString,
  assetNameToString,
  assetTypeToString,
  balanceToBigNumber,
  boolToBoolean,
  fundingRoundNameToString,
  identityIdToString,
  padString,
  tickerToDid,
  tokenIdentifierTypeToIdentifierType,
} from '~/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';

import { Compliance } from './Compliance';
import { Documents } from './Documents';
import { Issuance } from './Issuance';
import { TokenHolders } from './TokenHolders';
import { Transfers } from './Transfers';
import { SecurityTokenDetails } from './types';

/**
 * Properties that uniquely identify a Security Token
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the security token
   */
  ticker: string;
}

/**
 * Class used to manage all the Security Token functionality
 */
export class SecurityToken extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

  /**
   * identity id of the Security Token
   */
  public did: string;

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  // Namespaces
  public documents: Documents;
  public transfers: Transfers;
  public tokenHolders: TokenHolders;
  public issuance: Issuance;
  public compliance: Compliance;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;
    this.did = tickerToDid(ticker);

    this.documents = new Documents(this, context);
    this.transfers = new Transfers(this, context);
    this.tokenHolders = new TokenHolders(this, context);
    this.issuance = new Issuance(this, context);
    this.compliance = new Compliance(this, context);
  }

  /**
   * Transfer ownership of the Security Token to another identity. This generates an authorization request that must be accepted
   * by the destinatary
   *
   * @param args.expiry - date at which the authorization request for transfer expires (optional)
   */
  public transferOwnership(
    args: TransferTokenOwnershipParams
  ): Promise<TransactionQueue<SecurityToken>> {
    const { ticker } = this;
    return transferTokenOwnership.prepare({ ticker, ...args }, this.context);
  }

  /**
   * Modify some properties of the Security Token
   *
   * @param args.makeDivisible - makes an indivisible token divisible
   * @throws if the passed values result in no changes being made to the token
   */
  public modify(args: ModifyTokenParams): Promise<TransactionQueue<SecurityToken>> {
    const { ticker } = this;
    return modifyToken.prepare({ ticker, ...args }, this.context);
  }

  /**
   * Retrieve the Security Token's name, total supply, whether it is divisible or not and the identity of the owner
   *
   * @note can be subscribed to
   */
  public details(): Promise<SecurityTokenDetails>;
  public details(callback: SubCallback<SecurityTokenDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<SecurityTokenDetails>
  ): Promise<SecurityTokenDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
      context,
    } = this;

    /* eslint-disable @typescript-eslint/camelcase */
    const assembleResult = ({
      name,
      total_supply,
      divisible,
      owner_did,
      asset_type,
    }: MeshSecurityToken): SecurityTokenDetails => ({
      assetType: assetTypeToString(asset_type),
      isDivisible: boolToBoolean(divisible),
      name: assetNameToString(name),
      owner: new Identity({ did: identityIdToString(owner_did) }, context),
      totalSupply: balanceToBigNumber(total_supply),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    if (callback) {
      return asset.tokens(ticker, securityToken => {
        callback(assembleResult(securityToken));
      });
    }

    const token = await asset.tokens(ticker);

    return assembleResult(token);
  }

  /**
   * Retrieve the Security Token's funding round
   *
   * @note can be subscribed to
   */
  public currentFundingRound(): Promise<string>;
  public currentFundingRound(callback: SubCallback<string>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async currentFundingRound(
    callback?: SubCallback<string>
  ): Promise<string | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    if (callback) {
      return asset.fundingRound(ticker, round => {
        callback(fundingRoundNameToString(round));
      });
    }

    const fundingRound = await asset.fundingRound(ticker);
    return fundingRoundNameToString(fundingRound);
  }

  /**
   * Retrive the Security Token's asset identifiers list
   *
   * @note can be subscribed to
   */
  public getIdentifiers(): Promise<TokenIdentifier[]>;
  public getIdentifiers(callback?: SubCallback<TokenIdentifier[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getIdentifiers(
    callback?: SubCallback<TokenIdentifier[]>
  ): Promise<TokenIdentifier[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
      context,
    } = this;

    const tokenIdentifierTypes = Object.values(TokenIdentifierType);

    const assembleResult = (identifiers: AssetIdentifier[]): TokenIdentifier[] =>
      tokenIdentifierTypes.map((type, i) => ({
        type,
        value: assetIdentifierToString(identifiers[i]),
      }));

    const identifierTypes = tokenIdentifierTypes.map(type => [
      ticker,
      tokenIdentifierTypeToIdentifierType(type, context),
    ]);

    if (callback) {
      return asset.identifiers.multi<AssetIdentifier>(identifierTypes, identifiers => {
        callback(assembleResult(identifiers));
      });
    }

    const assetIdentifiers = await asset.identifiers.multi<AssetIdentifier>(identifierTypes);

    return assembleResult(assetIdentifiers);
  }

  /**
   * Retrieve the identifier data (block number and event index) of the event that was emitted when the token was created
   *
   * @note this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const {
      context: { middlewareApi },
      ticker,
    } = this;

    let result: ApolloQueryResult<Ensured<Query, 'eventByIndexedArgs'>>;
    try {
      result = await middlewareApi.query<Ensured<Query, 'eventByIndexedArgs'>>(
        eventByIndexedArgs({
          moduleId: 'asset',
          eventId: 'AssetCreated',
          eventArg1: padString(ticker, MAX_TICKER_LENGTH),
        })
      );
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    if (result.data.eventByIndexedArgs) {
      // TODO remove null check once types fixed
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return {
        blockNumber: result.data.eventByIndexedArgs.block_id!,
        eventIndex: result.data.eventByIndexedArgs.event_idx!,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }
}
