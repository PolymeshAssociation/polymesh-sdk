import { AssetIdentifier } from 'polymesh-types/types';

import { Identity } from '~/api/entities/Identity';
import {
  modifyToken,
  ModifyTokenParams,
  transferTokenOwnership,
  TransferTokenOwnershipParams,
} from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { TokenIdentifier, TokenIdentifierType } from '~/types';
import {
  assetIdentifierToString,
  assetTypeToString,
  balanceToBigNumber,
  boolToBoolean,
  fundingRoundNameToString,
  identityIdToString,
  tickerToDid,
  tokenIdentifierTypeToIdentifierType,
  tokenNameToString,
} from '~/utils';

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
   */
  public async details(): Promise<SecurityTokenDetails> {
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
    const { name, total_supply, divisible, owner_did, asset_type } = await asset.tokens(ticker);

    return {
      assetType: assetTypeToString(asset_type),
      isDivisible: boolToBoolean(divisible),
      name: tokenNameToString(name),
      owner: new Identity({ did: identityIdToString(owner_did) }, context),
      totalSupply: balanceToBigNumber(total_supply),
    };
    /* eslint-enable @typescript-eslint/camelcase */
  }

  /**
   * Retrieve the Security Token's funding round
   */
  public async currentFundingRound(): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    const fundingRound = await asset.fundingRound(ticker);
    return fundingRoundNameToString(fundingRound);
  }

  /**
   * Retrive the Security Token's asset identifiers list
   */
  public async getIdentifiers(): Promise<TokenIdentifier[]> {
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
    const identifierTypes = tokenIdentifierTypes.map(type => [
      ticker,
      tokenIdentifierTypeToIdentifierType(type, context),
    ]);

    const assetIdentifiers = await asset.identifiers.multi<AssetIdentifier>(identifierTypes);

    const tokenIdentifiers = tokenIdentifierTypes.map((type, i) => ({
      type,
      value: assetIdentifierToString(assetIdentifiers[i]),
    }));

    return tokenIdentifiers;
  }
}
