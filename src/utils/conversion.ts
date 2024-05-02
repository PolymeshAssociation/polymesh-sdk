import { BTreeMap, Bytes, Option, U8aFixed, u16 } from '@polkadot/types';
import {
  ConfidentialAssetsBurnConfidentialBurnProof,
  PalletConfidentialAssetAffirmLeg,
  PalletConfidentialAssetAffirmParty,
  PalletConfidentialAssetAffirmTransaction,
  PalletConfidentialAssetAffirmTransactions,
  PalletConfidentialAssetAuditorAccount,
  PalletConfidentialAssetConfidentialAccount,
  PalletConfidentialAssetConfidentialAuditors,
  PalletConfidentialAssetConfidentialTransfers,
  PalletConfidentialAssetLegParty,
  PalletConfidentialAssetTransaction,
  PalletConfidentialAssetTransactionId,
  PalletConfidentialAssetTransactionLeg,
  PalletConfidentialAssetTransactionLegDetails,
  PalletConfidentialAssetTransactionLegId,
  PalletConfidentialAssetTransactionLegState,
  PalletConfidentialAssetTransactionStatus,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import { hexAddPrefix, hexStripPrefix, u8aToHex } from '@polkadot/util';
import { UnreachableCaseError } from '@polymeshassociation/polymesh-sdk/api/procedures/utils';
import {
  Block,
  ConfidentialAssetHistory,
} from '@polymeshassociation/polymesh-sdk/middleware/types';
import { ErrorCode, EventIdentifier } from '@polymeshassociation/polymesh-sdk/types';
import {
  bigNumberToU32,
  bigNumberToU64,
  identityIdToString,
  instructionMemoToString,
  stringToIdentityId,
  u32ToBigNumber,
  u64ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  assertIsInteger,
  assertIsPositive,
} from '@polymeshassociation/polymesh-sdk/utils/internal';
import BigNumber from 'bignumber.js';

import {
  ConfidentialAccount,
  ConfidentialAsset,
  Context,
  Identity,
  PolymeshError,
} from '~/internal';
import {
  ConfidentialAffirmParty,
  ConfidentialAffirmTransaction,
  ConfidentialAssetTransactionHistory,
  ConfidentialLeg,
  ConfidentialLegParty,
  ConfidentialLegProof,
  ConfidentialLegState,
  ConfidentialTransactionDetails,
  ConfidentialTransactionStatus,
} from '~/types';

export * from '~/generated/utils';

export {
  stringToIdentityId,
  u64ToBigNumber,
} from '@polymeshassociation/polymesh-sdk/utils/conversion';

/**
 * @hidden
 */
export function bigNumberToU16(value: BigNumber, context: Context): u16 {
  assertIsInteger(value);
  assertIsPositive(value);
  return context.createType('u16', value.toString());
}

/**
 * @hidden
 */
export function auditorsToConfidentialAuditors(
  context: Context,
  auditors: ConfidentialAccount[],
  mediators: Identity[] = []
): PalletConfidentialAssetConfidentialAuditors {
  const rawAccountKeys = auditors.map(({ publicKey }) => publicKey);
  const rawMediatorIds = mediators.map(({ did }) => stringToIdentityId(did, context));

  return context.createType('PalletConfidentialAssetConfidentialAuditors', {
    auditors: context.createType('BTreeSet<PalletConfidentialAssetAuditorAccount>', rawAccountKeys),
    mediators: context.createType('BTreeSet<PolymeshPrimitivesIdentityId>', rawMediatorIds),
  });
}

/**
 * @hidden
 */
export function meshConfidentialTransactionDetailsToDetails(
  details: PalletConfidentialAssetTransaction
): Omit<ConfidentialTransactionDetails, 'status'> {
  const { venueId: rawVenueId, createdAt: rawCreatedAt, memo: rawMemo } = details;

  const venueId = u64ToBigNumber(rawVenueId);
  const createdAt = u32ToBigNumber(rawCreatedAt);
  const memo = rawMemo.isSome ? instructionMemoToString(rawMemo.unwrap()) : undefined;

  return {
    venueId,
    createdAt,
    memo,
  };
}

/**
 * @hidden
 */
export function meshConfidentialTransactionStatusToStatus(
  status: PalletConfidentialAssetTransactionStatus
): ConfidentialTransactionStatus {
  switch (status.type) {
    case 'Pending':
      return ConfidentialTransactionStatus.Pending;
    case 'Rejected':
      return ConfidentialTransactionStatus.Rejected;
    case 'Executed':
      return ConfidentialTransactionStatus.Executed;
    default:
      throw new UnreachableCaseError(status.type);
  }
}

/**
 * @hidden
 */
export function confidentialAccountToMeshPublicKey(
  account: ConfidentialAccount,
  context: Context
): PalletConfidentialAssetConfidentialAccount {
  return context.createType('PalletConfidentialAssetConfidentialAccount', account.publicKey);
}

/**
 * @hidden
 */
export function confidentialLegToMeshLeg(
  leg: {
    sender: PalletConfidentialAssetConfidentialAccount;
    receiver: PalletConfidentialAssetConfidentialAccount;
    assets: BTreeSet<Bytes>;
    auditors: BTreeSet<PalletConfidentialAssetAuditorAccount>;
    mediators: BTreeSet<PolymeshPrimitivesIdentityId>;
  },
  context: Context
): PalletConfidentialAssetTransactionLeg {
  return context.createType('PalletConfidentialAssetTransactionLeg', leg);
}

/**
 * @hidden
 */
export function auditorToMeshAuditor(
  auditor: ConfidentialAccount,
  context: Context
): PalletConfidentialAssetAuditorAccount {
  return context.createType('PalletConfidentialAssetAuditorAccount', auditor.publicKey);
}

/**
 * @hidden
 */
export function auditorsToBtreeSet(
  auditors: ConfidentialAccount[],
  context: Context
): BTreeSet<PalletConfidentialAssetAuditorAccount> {
  const rawAuditors = auditors.map(auditor => auditorToMeshAuditor(auditor, context));

  return context.createType(
    'BTreeSet<PalletConfidentialAssetAuditorAccount>',
    rawAuditors
  ) as BTreeSet<PalletConfidentialAssetAuditorAccount>;
}

/**
 * @hidden
 */
export function serializeConfidentialAssetId(value: string | ConfidentialAsset): string {
  const id = value instanceof ConfidentialAsset ? value.id : value;

  return hexAddPrefix(id.replace(/-/g, ''));
}

/**
 * @hidden
 */
export function middlewareEventDetailsToEventIdentifier(
  block: Block,
  eventIdx = 0
): EventIdentifier {
  const { blockId, datetime, hash } = block;

  return {
    blockNumber: new BigNumber(blockId),
    blockHash: hash,
    blockDate: new Date(`${datetime}`),
    eventIndex: new BigNumber(eventIdx),
  };
}

/**
 * @hidden
 */
export function confidentialAssetsToBtreeSet(
  assets: ConfidentialAsset[],
  context: Context
): BTreeSet<U8aFixed> {
  const assetIds = assets.map(asset => serializeConfidentialAssetId(asset.id));

  return context.createType('BTreeSet<Bytes>', assetIds) as BTreeSet<U8aFixed>;
}

/**
 * @hidden
 */
export function confidentialTransactionIdToBigNumber(
  id: PalletConfidentialAssetTransactionId
): BigNumber {
  return new BigNumber(id.toString());
}

/**
 * @hidden
 */
export function meshPublicKeyToKey(publicKey: PalletConfidentialAssetConfidentialAccount): string {
  return publicKey.toString();
}

/**
 * @hidden
 */
export function meshAssetAuditorToAssetAuditors(
  rawAuditors: BTreeMap<U8aFixed, BTreeSet<PalletConfidentialAssetAuditorAccount>>,
  context: Context
): { asset: ConfidentialAsset; auditors: ConfidentialAccount[] }[] {
  const result: ReturnType<typeof meshAssetAuditorToAssetAuditors> = [];

  /* istanbul ignore next: nested BTreeMap/BTreeSet is hard to mock */
  for (const [rawAssetId, rawAssetAuditors] of rawAuditors.entries()) {
    const assetId = u8aToHex(rawAssetId).replace('0x', '');
    const asset = new ConfidentialAsset({ id: assetId }, context);

    const auditors = [...rawAssetAuditors].map(rawAuditor => {
      const auditorId = rawAuditor.toString();
      return new ConfidentialAccount({ publicKey: auditorId }, context);
    });
    result.push({ asset, auditors });
  }

  return result;
}

/**
 * @hidden
 */
export function confidentialLegIdToId(id: PalletConfidentialAssetTransactionLegId): BigNumber {
  return new BigNumber(id.toNumber());
}

/**
 * @hidden
 */
export function meshConfidentialAssetTransactionIdToId(
  id: PalletConfidentialAssetTransactionId
): BigNumber {
  return new BigNumber(id.toNumber());
}

/**
 * @hidden
 */
export function confidentialTransactionLegIdToBigNumber(
  id: PalletConfidentialAssetTransactionLegId
): BigNumber {
  return new BigNumber(id.toString());
}

/**
 * @hidden
 */
export function meshConfidentialLegDetailsToDetails(
  details: PalletConfidentialAssetTransactionLegDetails,
  context: Context
): Omit<ConfidentialLeg, 'id'> {
  const {
    sender: rawSender,
    receiver: rawReceiver,
    auditors: rawAuditors,
    mediators: rawMediators,
  } = details;

  const senderKey = meshPublicKeyToKey(rawSender);
  const receiverKey = meshPublicKeyToKey(rawReceiver);
  const assetAuditors = meshAssetAuditorToAssetAuditors(rawAuditors, context);
  const mediators = [...rawMediators].map(mediator => {
    const did = identityIdToString(mediator);
    return new Identity({ did }, context);
  });

  const sender = new ConfidentialAccount({ publicKey: senderKey }, context);
  const receiver = new ConfidentialAccount({ publicKey: receiverKey }, context);

  return {
    sender,
    receiver,
    assetAuditors,
    mediators,
  };
}

/**
 * @hidden
 */
export function confidentialLegPartyToRole(
  role: PalletConfidentialAssetLegParty
): ConfidentialLegParty {
  switch (role.type) {
    case 'Sender':
      return ConfidentialLegParty.Sender;
    case 'Receiver':
      return ConfidentialLegParty.Receiver;
    case 'Mediator':
      return ConfidentialLegParty.Mediator;
    default:
      throw new UnreachableCaseError(role.type);
  }
}

/**
 * @hidden
 */
export function meshConfidentialAssetToAssetId(value: U8aFixed): string {
  return hexStripPrefix(value.toString());
}

/**
 * @hidden
 */
export function bigNumberToConfidentialTransactionId(
  id: BigNumber,
  context: Context
): PalletConfidentialAssetTransactionId {
  const rawId = bigNumberToU64(id, context);
  return context.createType('PalletConfidentialAssetTransactionId', rawId);
}

/**
 * @hidden
 */
export function bigNumberToConfidentialTransactionLegId(
  id: BigNumber,
  context: Context
): PalletConfidentialAssetTransactionLegId {
  const rawId = bigNumberToU32(id, context);
  return context.createType('PalletConfidentialAssetTransactionLegId', rawId);
}

/**
 * @hidden
 */
export function proofToTransfer(
  proofs: BTreeMap<U8aFixed, Bytes>,
  context: Context
): PalletConfidentialAssetConfidentialTransfers {
  return context.createType('PalletConfidentialAssetConfidentialTransfers', { proofs });
}

/**
 * @hidden
 */
export function confidentialAffirmPartyToRaw(
  value: {
    party: ConfidentialAffirmParty;
    proofs?: ConfidentialLegProof[];
  },
  context: Context
): PalletConfidentialAssetAffirmParty {
  const { party, proofs } = value;

  let transferProof: PalletConfidentialAssetConfidentialTransfers | null = null;
  if (proofs) {
    const fmtProofs = proofs.reduce((acc, { asset, proof }) => {
      const id = serializeConfidentialAssetId(asset);
      acc[id] = proof;

      return acc;
    }, {} as Record<string, string>);

    const rawProofs = context.createType('BTreeMap<Bytes, Bytes>', fmtProofs);

    transferProof = proofToTransfer(rawProofs, context);
  }
  return context.createType('PalletConfidentialAssetAffirmParty', {
    [party]: transferProof,
  });
}

/**
 * @hidden
 */
export function legToConfidentialAssetAffirmLeg(
  value: {
    legId: BigNumber;
    party: ConfidentialAffirmParty;
    proofs?: ConfidentialLegProof[];
  },
  context: Context
): PalletConfidentialAssetAffirmLeg {
  const { legId, party, proofs } = value;

  const rawLegId = bigNumberToConfidentialTransactionLegId(legId, context);
  const rawParty = confidentialAffirmPartyToRaw({ party, proofs }, context);

  return context.createType('PalletConfidentialAssetAffirmLeg', {
    legId: rawLegId,
    party: rawParty,
  });
}

/**
 * @hidden
 */
export function confidentialAffirmTransactionToMeshTransaction(
  value: ConfidentialAffirmTransaction,
  context: Context
): PalletConfidentialAssetAffirmTransaction {
  const { transactionId, legId, party, proofs } = value;

  const rawId = bigNumberToConfidentialTransactionId(transactionId, context);
  const rawLeg = legToConfidentialAssetAffirmLeg(
    {
      legId,
      party,
      proofs,
    },
    context
  );

  return context.createType('PalletConfidentialAssetAffirmTransaction', {
    id: rawId,
    leg: rawLeg,
  });
}

/**
 * @hidden
 */
export function stringToBytes(bytes: string, context: Context): Bytes {
  return context.createType('Bytes', bytes);
}

/**
 * @hidden
 */
export function confidentialAffirmsToRaw(
  value: PalletConfidentialAssetAffirmTransaction[],
  context: Context
): PalletConfidentialAssetAffirmTransactions {
  return context.createType('PalletConfidentialAssetAffirmTransactions', value);
}

/**
 * @hidden
 */
export function confidentialLegStateToLegState(
  value: Option<PalletConfidentialAssetTransactionLegState>,
  context: Context
): ConfidentialLegState {
  if (value.isNone) {
    return {
      proved: false,
    };
  }

  const rawState = value.unwrap().assetState.toJSON() as Record<
    string,
    { senderInitBalance: string; senderAmount: string; receiverAmount: string }
  >;

  const assetState = Object.entries(rawState).map(([key, stateValue]) => {
    const { senderInitBalance, senderAmount, receiverAmount } = stateValue;
    const hasExpectedFields =
      typeof key === 'string' &&
      typeof senderInitBalance === 'string' &&
      typeof senderAmount === 'string' &&
      typeof receiverAmount === 'string';

    if (!hasExpectedFields) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message:
          'Unexpected data for PalletConfidentialAssetTransactionLegState received from chain',
      });
    }

    return {
      asset: new ConfidentialAsset({ id: key.replace('0x', '') }, context),
      balances: { senderInitBalance, senderAmount, receiverAmount },
    };
  });

  return {
    proved: true,
    assetState,
  };
}

/**
 * @hidden
 */
export function middlewareAssetHistoryToTransactionHistory({
  id,
  assetId,
  amount,
  fromId,
  toId,
  createdBlock,
  eventId,
  memo,
}: ConfidentialAssetHistory): ConfidentialAssetTransactionHistory {
  return {
    id,
    assetId,
    fromId,
    toId,
    amount,
    datetime: createdBlock!.datetime,
    createdBlockId: new BigNumber(createdBlock!.blockId),
    eventId,
    memo,
  };
}

/**
 * @hidden
 */
export function confidentialBurnProofToRaw(
  proof: string,
  context: Context
): ConfidentialAssetsBurnConfidentialBurnProof {
  const rawProof = stringToBytes(proof, context);

  return context.createType('ConfidentialAssetsBurnConfidentialBurnProof', {
    encodedInnerProof: rawProof,
  });
}
