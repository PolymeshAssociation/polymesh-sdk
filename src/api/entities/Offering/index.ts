import { Bytes, Option } from '@polkadot/types';
import { PalletStoFundraiser } from '@polkadot/types/lookup';
import { hexAddPrefix, hexStripPrefix, stringToHex } from '@polkadot/util';
import BigNumber from 'bignumber.js';

import { Investment, OfferingDetails } from '~/api/entities/Offering/types';
import {
  closeOffering,
  Context,
  enableOffChainFundingForOfferings,
  Entity,
  FungibleAsset,
  Identity,
  investInOffering,
  modifyOfferingTimes,
  toggleFreezeOffering,
} from '~/internal';
import { investmentsQuery } from '~/middleware/queries/stos';
import { Query } from '~/middleware/types';
import {
  Account,
  EnableOffChainFundingParams,
  InvestInOfferingParams,
  ModifyOfferingTimesParams,
  NoArgsProcedureMethod,
  OffChainFundingDetails,
  OffChainFundingReceipt,
  ProcedureMethod,
  ResultSet,
  SignerKeyRingType,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  bigNumberToU128,
  fundraiserToOfferingDetails,
  stringToIdentityId,
  stringToTicker,
  tickerToString,
} from '~/utils/conversion';
import {
  asDid,
  calculateNextKey,
  createProcedureMethod,
  getAssetIdForMiddleware,
  toHumanReadable,
} from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  assetId: string;
}

/**
 * Represents an Asset Offering in the Polymesh blockchain
 */
export class Offering extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * identifier number of the Offering
   */
  public id: BigNumber;

  /**
   * Asset being offered
   */
  public asset: FungibleAsset;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, assetId } = identifiers;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);

    this.freeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { asset: this.asset, id, freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { asset: this.asset, id, freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.close = createProcedureMethod(
      { getProcedureAndArgs: () => [closeOffering, { asset: this.asset, id }], voidArgs: true },
      context
    );
    this.modifyTimes = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyOfferingTimes, { asset: this.asset, id, ...args }] },
      context
    );
    this.invest = createProcedureMethod(
      { getProcedureAndArgs: args => [investInOffering, { asset: this.asset, id, ...args }] },
      context
    );
    this.enableOffChainFunding = createProcedureMethod(
      {
        getProcedureAndArgs: args => [
          enableOffChainFundingForOfferings,
          { asset: this.asset, id, ...args },
        ],
      },
      context
    );
  }

  /**
   * Retrieve the Offering's details
   *
   * @returns Promise that resolves to the Offering details
   */
  public details(): Promise<OfferingDetails>;

  /**
   * Retrieve the Offering's details (with subscription support)
   *
   * @param callback - Callback function that receives offering detail updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public details(callback: SubCallback<OfferingDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<OfferingDetails>
  ): Promise<OfferingDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
      id,
      asset,
      context,
    } = this;

    const assembleResult = (
      rawFundraiser: Option<PalletStoFundraiser>,
      rawName: Option<Bytes>
    ): OfferingDetails => {
      return fundraiserToOfferingDetails(rawFundraiser.unwrap(), rawName.unwrap(), context);
    };

    const rawAssetId = assetToMeshAssetId(asset, context);
    const rawU64 = bigNumberToU64(id, context);

    const fetchName = (): Promise<Option<Bytes>> => sto.fundraiserNames(rawAssetId, rawU64);

    if (callback) {
      context.assertSupportsSubscription();

      const fundraiserName = await fetchName();
      return sto.fundraisers(rawAssetId, rawU64, fundraiserData => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(fundraiserData, fundraiserName));
      });
    }

    const [fundraiser, name] = await Promise.all([
      sto.fundraisers(rawAssetId, rawU64),
      fetchName(),
    ]);

    return assembleResult(fundraiser, name);
  }

  /**
   * Close the Offering
   */
  public close: NoArgsProcedureMethod<void>;

  /**
   * Freeze the Offering
   */
  public freeze: NoArgsProcedureMethod<Offering>;

  /**
   * Unfreeze the Offering
   */
  public unfreeze: NoArgsProcedureMethod<Offering>;

  /**
   * Enable off-chain funding for the Offering
   *
   * @throws if:
   *   - Trying to enable off-chain funding on an Offering that does not exist
   *   - Trying to enable off-chain funding on an Offering that has already ended
   *   - Trying to enable off-chain funding on an Offering that is already closed
   */
  public enableOffChainFunding: ProcedureMethod<EnableOffChainFundingParams, void>;

  /**
   * Modify the start/end time of the Offering
   *
   * @throws if:
   *   - Trying to modify the start time on an Offering that already started
   *   - Trying to modify anything on an Offering that already ended
   *   - Trying to change start or end time to a past date
   */
  public modifyTimes: ProcedureMethod<ModifyOfferingTimesParams, void>;

  /**
   * Invest in the Offering
   *
   * @note required roles:
   *   - Purchase Portfolio Custodian
   *   - Funding Portfolio Custodian
   */
  public invest: ProcedureMethod<InvestInOfferingParams, void>;

  /**
   * Retrieve all investments made on this Offering
   *
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware V2
   */
  public async getInvestments(
    opts: {
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<Investment>> {
    const {
      context,
      id,
      asset: { id: assetId },
    } = this;

    const middlewareAssetId = await getAssetIdForMiddleware(assetId, context);

    const { size, start } = opts;

    const {
      data: {
        investments: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'investments'>>(
      investmentsQuery(
        context.isSqIdPadded,
        {
          stoId: id.toNumber(),
          offeringAssetId: middlewareAssetId,
        },
        size,
        start
      )
    );

    const count = new BigNumber(totalCount);

    const data = nodes.map(({ investorId: did, offeringTokenAmount, raiseTokenAmount }) => ({
      investor: new Identity({ did }, context),
      soldAmount: new BigNumber(offeringTokenAmount).shiftedBy(-6),
      investedAmount: new BigNumber(raiseTokenAmount).shiftedBy(-6),
    }));

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve off chain funding details
   */
  public async offChainFundingDetails(): Promise<OffChainFundingDetails> {
    const {
      asset,
      id,
      context,
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
    } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);
    const rawU64 = bigNumberToU64(id, context);

    const rawOffChainTicker = await sto.fundraiserOffchainAsset(rawAssetId, rawU64);

    if (rawOffChainTicker.isNone) {
      return { enabled: false };
    }

    return { enabled: true, offChainTicker: tickerToString(rawOffChainTicker.unwrap()) };
  }

  /**
   * Determine whether this Offering exists on chain
   */
  public async exists(): Promise<boolean> {
    const { asset, id, context } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const fundraiser = await context.polymeshApi.query.sto.fundraisers(
      rawAssetId,
      bigNumberToU64(id, context)
    );

    return fundraiser.isSome;
  }

  /**
   * Return the Offering's ID and Asset ticker
   */
  public toHuman(): HumanReadable {
    const { asset, id } = this;

    return toHumanReadable({
      assetId: asset,
      id,
    });
  }

  /**
   * Generate an off-chain funding receipt for this offering
   *
   * @param args.uid - unique receipt ID (UID) for this off-chain funding transaction
   * @param args.offChainTicker - ticker symbol of the off-chain asset being transferred (e.g., 'BTC', 'ETH')
   * @param args.amount - equivalent investment amount in the raising asset (calculated from the off-chain asset value based on STO tier pricing)
   * @param args.sender - Identity or DID of the investor providing the off-chain funding
   * @param args.metadata - (optional) additional metadata to be associated with the receipt
   * @param args.signer - (optional) authorized venue receipt signer to generate the cryptographic signature. Defaults to signing Account associated with the SDK
   * @param args.signerKeyRingType - (optional) keyring type for signature generation. Defaults to 'Sr25519'. Supported types: SR25519, ED25519, ECDSA
   *
   * @note The generated receipt contains SCALE-encoded data wrapped with `<Bytes>` tags, including:
   * - Receipt UID
   * - Fundraiser ID
   * - Sender's DID (investor)
   * - Receiver's DID (raising portfolio owner)
   * - Off-chain asset ticker
   * - Equivalent investment amount in raising asset (calculated from STO tier pricing)
   *
   * @note The amount must represent the exact investment cost as calculated by the STO's blended pricing mechanism
   */
  public async generateOffChainFundingReceipt(args: {
    uid: BigNumber;
    offChainTicker: string;
    amount: BigNumber;
    sender: Identity | string;
    metadata?: string;
    signer?: string | Account;
    signerKeyRingType?: SignerKeyRingType;
  }): Promise<OffChainFundingReceipt> {
    const { id, context } = this;

    const {
      uid,
      metadata,
      signer,
      signerKeyRingType = SignerKeyRingType.Sr25519,
      sender,
      offChainTicker,
      amount,
    } = args;

    const rawFundraiserId = bigNumberToU64(id, context);
    const rawUid = bigNumberToU64(uid, context);

    const rawSender = stringToIdentityId(asDid(sender), context);
    const rawOffChainTicker = stringToTicker(offChainTicker, context);
    const rawAmount = bigNumberToU128(amount.shiftedBy(6), context);

    const {
      raisingPortfolio: {
        owner: { did: raisingPortfolioDid },
      },
    } = await this.details();

    const rawReceiver = stringToIdentityId(raisingPortfolioDid, context);

    const payloadStrings = [
      stringToHex('<Bytes>'),
      rawUid.toHex(true),
      rawFundraiserId.toHex(true),
      rawSender.toHex(),
      rawReceiver.toHex(),
      rawOffChainTicker.toHex(),
      rawAmount.toHex(true),
      stringToHex('</Bytes>'),
    ];

    const rawPayload = hexAddPrefix(payloadStrings.map(e => hexStripPrefix(e)).join(''));

    const signatureValue = await context.getSignature({ rawPayload, signer });

    return {
      uid,
      signer: signer || context.getSigningAccount(),
      signature: {
        type: signerKeyRingType,
        value: signatureValue,
      },
      metadata,
    };
  }
}
