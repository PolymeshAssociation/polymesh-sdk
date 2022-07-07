import { stringToHex, u8aToString } from '@polkadot/util';
import { recoverPersonalSignature } from 'eth-sig-util';

import { PolymeshError, Procedure, TickerReservation } from '~/internal';
import { ClaimClassicTickerParams, ErrorCode, TxTags } from '~/types';
import { CLASSIC_CLAIM_SIGNATURE_PREFIX, CLASSIC_TICKER_OWNER_DID } from '~/utils/constants';
import {
  identityIdToString,
  momentToDate,
  stringToEcdsaSignature,
  stringToTicker,
} from '~/utils/conversion';

/**
 * @hidden
 * Generate the message a classic user has to sign to claim their ticker. This is used to validate
 *   if the DID that is claiming the ticker in Polymesh is the actual owner of the ticker in Ethereum. The message format is
 *   `classic_claim` followed by the DID in hex format (stripped of the leading 0x). So, if the DID is
 *   `0x1230000000000000000000000000000000000000000000000000000000000000`, the message will be
 *   `classic_claim1230000000000000000000000000000000000000000000000000000000000000`
 */
function generateClassicSignableMessage(did: string): string {
  const strippedDid = did.replace('0x', '');

  return stringToHex(`${CLASSIC_CLAIM_SIGNATURE_PREFIX}${strippedDid}`);
}

/**
 * @hidden
 */
export async function prepareClaimClassicTicker(
  this: Procedure<ClaimClassicTickerParams, TickerReservation>,
  args: ClaimClassicTickerParams
): Promise<TickerReservation> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { asset },
      },
    },
    context,
  } = this;
  const { ticker, ethereumSignature } = args;

  const rawTicker = stringToTicker(ticker, context);

  const [classicReservation, { expiry, owner: reservationOwner }, { did }] = await Promise.all([
    asset.classicTickers(rawTicker),
    asset.tickers(rawTicker),
    context.getSigningIdentity(),
  ]);

  if (classicReservation.isNone) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The supplied ticker is not in the reserved classic ticker list',
    });
  }

  const reservationExpired = expiry.isSome && momentToDate(expiry.unwrap()) < new Date();

  if (reservationExpired) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "The Ticker's claiming period has already expired",
    });
  }

  const ownerDid = identityIdToString(reservationOwner);

  if (ownerDid !== CLASSIC_TICKER_OWNER_DID) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Ticker already claimed',
      data: {
        ownerDid,
      },
    });
  }

  const { ethOwner } = classicReservation.unwrap();

  let signerAddress: string;

  try {
    signerAddress = recoverPersonalSignature({
      data: generateClassicSignableMessage(did),
      sig: ethereumSignature,
    }).toLowerCase();
  } catch (err) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Ethereum signature not valid',
      data: {
        error: err.message,
      },
    });
  }

  if (signerAddress !== u8aToString(ethOwner).toLowerCase()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Account that signed the message is not the classic Ticker owner',
      data: {
        signerAddress,
      },
    });
  }

  this.addTransaction({
    transaction: tx.asset.claimClassicTicker,
    args: [rawTicker, stringToEcdsaSignature(ethereumSignature, context)],
  });

  return new TickerReservation({ ticker }, context);
}

/**
 * @hidden
 */
export const claimClassicTicker = (): Procedure<ClaimClassicTickerParams, TickerReservation> =>
  new Procedure(prepareClaimClassicTicker, {
    permissions: {
      assets: [],
      transactions: [TxTags.asset.ClaimClassicTicker],
      portfolios: [],
    },
  });
