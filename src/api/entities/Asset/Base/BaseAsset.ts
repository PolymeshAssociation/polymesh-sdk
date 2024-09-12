import { Bytes, Option, StorageKey } from '@polkadot/types';
import {
  PalletAssetAssetDetails,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Compliance } from '~/api/entities/Asset/Base/Compliance';
import { Documents } from '~/api/entities/Asset/Base/Documents';
import { Metadata } from '~/api/entities/Asset/Base/Metadata';
import { Permissions } from '~/api/entities/Asset/Base/Permissions';
import {
  addAssetMediators,
  Context,
  Entity,
  Identity,
  linkTickerToAsset,
  modifyAsset,
  PolymeshError,
  removeAssetMediators,
  setVenueFiltering,
  toggleFreezeTransfers,
  transferAssetOwnership,
  unlinkTickerFromAsset,
  Venue,
} from '~/internal';
import {
  Asset,
  AssetDetails,
  AssetMediatorParams,
  AuthorizationRequest,
  ErrorCode,
  LinkTickerToAssetParams,
  ModifyAssetParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  SecurityIdentifier,
  SetVenueFilteringParams,
  SubCallback,
  TransferAssetOwnershipParams,
  UniqueIdentifiers,
  UnsubCallback,
  VenueFilteringDetails,
} from '~/types';
import { uuidToHex } from '~/utils';
import {
  assetIdentifierToSecurityIdentifier,
  assetToMeshAssetId,
  assetTypeToKnownOrId,
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  bytesToString,
  identitiesSetToIdentities,
  identityIdToString,
  tickerToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Class used to manage functionality common to all assets.
 *
 */
export class BaseAsset extends Entity<UniqueIdentifiers, string> {
  // Namespaces
  public compliance: Compliance;
  public documents: Documents;
  public metadata: Metadata;
  public permissions: Permissions;

  /**
   * Unique ID of the Asset in UUID format
   */
  public id: string;

  /**
   * Unique ID of the Asset in hex format
   *
   * @note Although UUID format is the usual representation of asset IDs, generic polkadot/substrate tools usually expect it in hex format
   */
  public get rawId(): string {
    return uuidToHex(this.id);
  }

  /**
   * Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
   *   by the recipient
   *
   * @note this will create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public transferOwnership: ProcedureMethod<TransferAssetOwnershipParams, AuthorizationRequest>;

  /**
   * Enable/disable venue filtering for this Asset and/or set allowed/disallowed venues
   */
  public setVenueFiltering: ProcedureMethod<SetVenueFilteringParams, void>;

  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { assetId } = identifier as UniqueIdentifiers;

    return typeof assetId === 'string';
  }

  /**
   * Modify some properties of the Asset
   *
   * @throws if the passed values result in no changes being made to the Asset
   * @throws if the passed assetType is not a known asset type or a custom type that has not been created on the chain
   * @throws if trying to modify an NftCollection's assetType
   */
  public modify: ProcedureMethod<ModifyAssetParams, Asset>;

  /**
   * @hidden
   *
   * @note It is generally preferable to instantiate `FungibleAsset` or `NftCollection`
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { assetId } = identifiers;
    this.id = assetId;

    this.compliance = new Compliance(this, context);
    this.documents = new Documents(this, context);
    this.metadata = new Metadata(this, context);
    this.permissions = new Permissions(this, context);

    this.freeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeTransfers, { asset: this, freeze: true }],
        voidArgs: true,
      },
      context
    );

    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeTransfers, { asset: this, freeze: false }],
        voidArgs: true,
      },
      context
    );

    this.transferOwnership = createProcedureMethod(
      { getProcedureAndArgs: args => [transferAssetOwnership, { asset: this, ...args }] },
      context
    );

    this.addRequiredMediators = createProcedureMethod(
      {
        getProcedureAndArgs: args => [addAssetMediators, { asset: this, ...args }],
      },
      context
    );

    this.removeRequiredMediators = createProcedureMethod(
      {
        getProcedureAndArgs: args => [removeAssetMediators, { asset: this, ...args }],
      },
      context
    );

    this.setVenueFiltering = createProcedureMethod(
      { getProcedureAndArgs: args => [setVenueFiltering, { asset: this, ...args }] },
      context
    );

    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyAsset, { asset: this, ...args }] },
      context
    );

    this.linkTicker = createProcedureMethod(
      {
        getProcedureAndArgs: args => [linkTickerToAsset, { asset: this, ...args }],
      },
      context
    );
    this.unlinkTicker = createProcedureMethod(
      {
        getProcedureAndArgs: () => [unlinkTickerFromAsset, { asset: this }],
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Freeze transfers of the Asset
   */
  public freeze: NoArgsProcedureMethod<void>;

  /**
   * Unfreeze transfers of the Asset
   */
  public unfreeze: NoArgsProcedureMethod<void>;

  /**
   * Add required mediators. Mediators must approve any trades involving the asset
   */
  public addRequiredMediators: ProcedureMethod<AssetMediatorParams, void>;

  /**
   * Remove required mediators
   */
  public removeRequiredMediators: ProcedureMethod<AssetMediatorParams, void>;

  /**
   * Link ticker to the asset
   *
   * @note if ticker is already reserved, then required role:
   * - Ticker Owner
   */
  public linkTicker: ProcedureMethod<LinkTickerToAssetParams, void>;

  /**
   * Unlink ticker from the Asset
   *
   * @note Only the ticker owner is allowed to unlink the Asset
   *
   * @throws if there is no ticker to unlink
   */
  public unlinkTicker: NoArgsProcedureMethod<void>;

  /**
   * Retrieve the Asset's identifiers list
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getIdentifiers(): Promise<SecurityIdentifier[]>;
  public getIdentifiers(callback?: SubCallback<SecurityIdentifier[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getIdentifiers(
    callback?: SubCallback<SecurityIdentifier[]>
  ): Promise<SecurityIdentifier[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    if (callback) {
      context.assertSupportsSubscription();
      return asset.assetIdentifiers(
        rawAssetId,
        (identifiers: PolymeshPrimitivesAssetIdentifier[]) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
          callback(identifiers.map(assetIdentifierToSecurityIdentifier));
        }
      );
    }

    const assetIdentifiers = await asset.assetIdentifiers(rawAssetId);

    return assetIdentifiers.map(assetIdentifierToSecurityIdentifier);
  }

  /**
   * Check whether transfers are frozen for the Asset
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public isFrozen(): Promise<boolean>;
  public isFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async isFrozen(callback?: SubCallback<boolean>): Promise<boolean | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    if (callback) {
      context.assertSupportsSubscription();
      return asset.frozen(rawAssetId, frozen => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(boolToBoolean(frozen));
      });
    }

    const result = await asset.frozen(rawAssetId);

    return boolToBoolean(result);
  }

  /**
   * Retrieve the Asset's data
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public details(): Promise<AssetDetails>;
  public details(callback: SubCallback<AssetDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<AssetDetails>
  ): Promise<AssetDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset, externalAgents },
        },
      },
      context,
    } = this;

    const assembleResult = async (
      optToken: Option<PalletAssetAssetDetails>,
      agentGroups: [
        StorageKey<[PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]>,
        Option<PolymeshPrimitivesAgentAgentGroup>
      ][],
      assetName: Option<Bytes>,
      tickerValue: Option<PolymeshPrimitivesTicker>
    ): Promise<AssetDetails> => {
      const fullAgents: Identity[] = [];

      if (optToken.isNone) {
        throw new PolymeshError({
          message: 'Asset detail information not found',
          code: ErrorCode.DataUnavailable,
        });
      }

      const { totalSupply, divisible, ownerDid, assetType: rawAssetType } = optToken.unwrap();

      agentGroups.forEach(([storageKey, agentGroup]) => {
        const rawAgentGroup = agentGroup.unwrap();
        if (rawAgentGroup.isFull) {
          fullAgents.push(new Identity({ did: identityIdToString(storageKey.args[1]) }, context));
        }
      });

      const owner = new Identity({ did: identityIdToString(ownerDid) }, context);
      const { value, type } = assetTypeToKnownOrId(rawAssetType);

      let assetType: string;
      if (value instanceof BigNumber) {
        const customType = await asset.customTypes(bigNumberToU32(value, context));
        assetType = bytesToString(customType);
      } else {
        assetType = value;
      }

      let ticker;
      if (tickerValue.isSome) {
        ticker = tickerToString(tickerValue.unwrap());
      }

      return {
        assetType,
        nonFungible: type === 'NonFungible',
        isDivisible: boolToBoolean(divisible),
        name: bytesToString(assetName.unwrap()),
        owner,
        totalSupply: balanceToBigNumber(totalSupply),
        fullAgents,
        ticker,
      };
    };

    const rawAssetId = assetToMeshAssetId(this, context);

    const groupOfAgentPromise = externalAgents.groupOfAgent.entries(rawAssetId);
    const namePromise = asset.assetNames(rawAssetId);
    const tickerPromise = asset.assetIdTicker(rawAssetId);

    if (callback) {
      context.assertSupportsSubscription();
      const groupEntries = await groupOfAgentPromise;
      const assetName = await namePromise;
      const tickerValue = await tickerPromise;

      return asset.assets(rawAssetId, async securityToken => {
        const result = await assembleResult(securityToken, groupEntries, assetName, tickerValue);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(result);
      });
    }

    const [token, groups, name, tickerValue] = await Promise.all([
      asset.assets(rawAssetId),
      groupOfAgentPromise,
      namePromise,
      tickerPromise,
    ]);
    return assembleResult(token, groups, name, tickerValue);
  }

  /**
   * Get required Asset mediators. These Identities must approve any Instruction involving the asset
   */
  public async getRequiredMediators(): Promise<Identity[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const rawMediators = await asset.mandatoryMediators(rawAssetId);

    return identitiesSetToIdentities(rawMediators, context);
  }

  /**
   * Get venue filtering details
   */
  public async getVenueFilteringDetails(): Promise<VenueFilteringDetails> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const [rawIsEnabled, venueEntries] = await Promise.all([
      query.settlement.venueFiltering(rawAssetId),
      query.settlement.venueAllowList.entries(rawAssetId),
    ]);

    const allowedVenues = venueEntries.map(([key]) => {
      const rawId = key.args[1];
      const venueId = u64ToBigNumber(rawId);

      return new Venue({ id: venueId }, context);
    });

    const isEnabled = boolToBoolean(rawIsEnabled);

    return {
      isEnabled,
      allowedVenues,
    };
  }

  /**
   * Retrieve the Asset's funding round
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public currentFundingRound(): Promise<string | null>;
  public currentFundingRound(callback: SubCallback<string | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async currentFundingRound(
    callback?: SubCallback<string | null>
  ): Promise<string | null | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const assembleResult = (roundName: Bytes): string | null => bytesToString(roundName) || null;

    if (callback) {
      context.assertSupportsSubscription();
      return asset.fundingRound(rawAssetId, round => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(round));
      });
    }

    const fundingRound = await asset.fundingRound(rawAssetId);
    return assembleResult(fundingRound);
  }

  /**
   * @hidden
   */
  public async exists(): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset, nft },
        },
      },
    } = this;
    const rawAssetId = assetToMeshAssetId(this, context);

    const [tokenSize, nftId] = await Promise.all([
      asset.assets.size(rawAssetId),
      nft.collectionAsset(rawAssetId),
    ]);

    return !tokenSize.isZero() && nftId.isZero();
  }

  /**
   * Return the BaseAsset's ID
   */
  public toHuman(): string {
    return this.id;
  }
}
