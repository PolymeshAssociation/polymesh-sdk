/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiPromise } from '@polkadot/api';
import { DecoratedRpc } from '@polkadot/api/types';
import {
  bool,
  BTreeSet,
  Bytes,
  Compact,
  Enum,
  Option,
  Text,
  u8,
  U8aFixed,
  u16,
  u32,
  u64,
  u128,
  UInt,
  Vec,
} from '@polkadot/types';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import {
  AccountData,
  AccountId,
  AccountInfo,
  Balance,
  Block,
  BlockHash,
  Call,
  DispatchError,
  DispatchErrorModule,
  EventRecord,
  ExtrinsicStatus,
  Hash,
  Header,
  Index,
  Permill,
  RefCount,
  RuntimeDispatchInfo,
  RuntimeVersion,
  Signature,
  SignedBlock,
} from '@polkadot/types/interfaces';
import {
  ConfidentialIdentityClaimProofsScopeClaimProof,
  ConfidentialIdentityClaimProofsZkProofData,
  PalletAssetClassicTickerRegistration,
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletRelayerSubsidy,
  PalletSettlementInstruction,
  PalletSettlementVenue,
  PalletStoFundraiser,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAuthorization,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesConditionConditionType,
  PolymeshPrimitivesConditionTrustedFor,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesSecondaryKeyPalletPermissions,
  PolymeshPrimitivesSecondaryKeyPermissions,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatClaim,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceAssetTransferCompliance,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import {
  Codec,
  IEvent,
  INumber,
  ISubmittableResult,
  ITuple,
  IU8a,
  Registry,
  Signer as PolkadotSigner,
} from '@polkadot/types/types';
import { hexToU8a, stringToU8a } from '@polkadot/util';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { cloneDeep, map, merge, upperFirst } from 'lodash';
import sinon, { SinonStub, SinonStubbedInstance } from 'sinon';

import { Account, AuthorizationRequest, Context, Identity } from '~/internal';
import {
  AffirmationStatus,
  AgentGroup,
  AGId,
  AssetComplianceResult,
  AssetOwnershipRelation,
  AssetPermissions,
  AssetType,
  AuthorizationType as MeshAuthorizationType,
  CACheckpoint,
  CAKind,
  CalendarPeriod,
  CalendarUnit,
  CanTransferResult,
  CddId,
  CddStatus,
  CheckpointId,
  CheckpointSchedule,
  Claim,
  Claim1stKey,
  ComplianceRequirementResult,
  ConditionResult,
  ConditionType,
  CountryCode,
  CustomAssetTypeId,
  DispatchableNames,
  DocumentHash,
  EcdsaSignature,
  EthereumAddress,
  FundraiserStatus,
  FundraiserTier,
  GranularCanTransferResult,
  IdentityClaim,
  InstructionStatus,
  InvestorZKProofData,
  Moment,
  MovePortfolioItem,
  PalletName,
  Pip,
  PipId,
  PipsMetadata,
  PortfolioId,
  PortfolioKind,
  PortfolioPermissions,
  PortfolioValidityResult,
  PosRatio,
  PriceTier,
  ProposalDetails,
  ProposalState,
  ProposalStatus,
  ProtocolOp,
  RecordDate,
  RecordDateSpec,
  RistrettoPoint,
  Scalar,
  ScheduleId,
  ScheduleSpec,
  Scope,
  ScopeId,
  SecondaryKey as MeshSecondaryKey,
  SecurityToken,
  SettlementType,
  Signatory,
  StoredSchedule,
  TargetIdentities,
  TargetIdentity,
  TargetTreatment,
  Tax,
  TickerRegistration,
  TickerRegistrationConfig,
  TransferCondition,
  TransferConditionResult,
  VenueType,
  ZkProofData,
} from '~/polkadot/polymesh';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  CheckPermissionsResult,
  CheckRolesResult,
  ClaimData,
  ClaimType,
  CountryCode as CountryCodeEnum,
  DistributionWithDetails,
  ExtrinsicData,
  PermissionedAccount,
  ProtocolFees,
  ResultSet,
  SignerType,
  StatType,
  SubsidyWithAllowance,
  TxTags,
  UnsubCallback,
} from '~/types';
import { Consts, Extrinsics, GraphqlQuery, PolymeshTx, Queries } from '~/types/internal';
import { ArgsType, Mutable, tuple } from '~/types/utils';
import { STATE_RUNTIME_VERSION_CALL, SYSTEM_VERSION_RPC_CALL } from '~/utils/constants';

let apiEmitter: EventEmitter;

/**
 * Create a mock instance of the Polkadot API
 */
function createApi(): Mutable<ApiPromise> & EventEmitter {
  apiEmitter = new EventEmitter();
  apiEmitter.on('error', () => undefined);
  return {
    emit: (event: string) => apiEmitter.emit(event),
    on: (event: string, listener: (...args: unknown[]) => unknown) =>
      apiEmitter.on(event, listener),
    off: (event: string, listener: (...args: unknown[]) => unknown) =>
      apiEmitter.off(event, listener),
    disconnect: sinon.stub() as () => Promise<void>,
  } as Mutable<ApiPromise> & EventEmitter;
}

/**
 * Create a mock instance of the Apollo client
 */
function createApolloClient(): Mocked<Mutable<ApolloClient<NormalizedCacheObject>>> {
  return {
    stop: sinon.stub(),
    query: sinon.stub(),
  } as unknown as Mocked<Mutable<ApolloClient<NormalizedCacheObject>>>;
}

let apolloConstructorStub: SinonStub;

/**
 * Creates mock websocket class. Contains additional methods for tests to control it
 */
export class MockWebSocket {
  /**
   * @hidden
   */
  onopen(): void {
    // stub for onopen
  }

  /**
   * @hidden
   */
  onclose(): void {
    // stub for onclose
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * @hidden
   */
  onerror(_err: Error): void {
    // stub for onerror
  }

  /**
   * @hidden
   */
  onmessage(_msg: Record<string, unknown>): void {
    // stub for onmessage
  }

  /**
   * @hidden
   */
  close(): void {
    // stub for close
  }

  /**
   * @hidden
   */
  send(msg: string): void {
    let response;
    const nodeVersionId = SYSTEM_VERSION_RPC_CALL.id;

    if (msg.indexOf(nodeVersionId) >= 0) {
      response = { data: `{ "result": "5.0.0", "id": "${nodeVersionId}" }` };
    } else {
      response = {
        data: `{ "result": { "specVersion": "5000000"}, "id": "${STATE_RUNTIME_VERSION_CALL.id}" }`,
      };
    }

    this.onmessage(response);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * @hidden
   * Calls the onerror handler with the given error
   */
  triggerError(err: Error): void {
    this.onerror(err);
  }

  /**
   * @hidden
   * Calls onmessage with the given version
   */
  sendRpcVersion(version: string): void {
    const response = { data: `{ "result": "${version}", "id": "${SYSTEM_VERSION_RPC_CALL.id}" }` };
    this.onmessage(response);
  }

  /**
   * @hidden
   * Calls onmessage with the given version
   */
  sendSpecVersion(version: string): void {
    const response = {
      data: `{ "result": { "specVersion": "${version}" }, "id": "${STATE_RUNTIME_VERSION_CALL.id}" }`,
    };
    this.onmessage(response);
  }
}

/**
 * Create a mock instance of the WebSocket lib
 */
function createWebSocket(): MockWebSocket {
  return new MockWebSocket();
}

let webSocketConstructorStub: SinonStub;

export type MockContext = Mocked<Context>;

export enum MockTxStatus {
  Ready = 'Ready',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Aborted = 'Aborted',
  Rejected = 'Rejected',
  Intermediate = 'Intermediate',
  InBlock = 'InBlock',
  BatchFailed = 'BatchFailed',
  FinalizedFailed = 'FinalizedFailed',
  FailedToUnsubscribe = 'FailedToUnsubscribe',
}

const MockApolloClientClass = class {
  /**
   * @hidden
   */
  public constructor() {
    return apolloConstructorStub();
  }
};

const mockInstanceContainer = {
  contextInstance: {} as MockContext,
  apiInstance: createApi(),
  signingManagerInstance: {} as Mutable<SigningManager>,
  apolloInstance: createApolloClient(),
  apolloInstanceV2: createApolloClient(),
  webSocketInstance: createWebSocket(),
};

const MockWebSocketClass = class {
  /**
   * @hidden
   */
  public constructor() {
    return webSocketConstructorStub();
  }
};

let apiPromiseCreateStub: SinonStub;

const MockApiPromiseClass = class {
  /**
   * @hidden
   */
  public static create = apiPromiseCreateStub;
};

const MockWsProviderClass = class {};

let contextCreateStub: SinonStub;

const MockContextClass = class {
  /**
   * @hidden
   */
  public static create = contextCreateStub;
};

let errorStub: SinonStub;

type StatusCallback = (receipt: ISubmittableResult) => void;

interface TxMockData {
  statusCallback: StatusCallback;
  unsubCallback: UnsubCallback;
  status: MockTxStatus;
  resolved: boolean;
}
interface ContextOptions {
  did?: string;
  withSigningManager?: boolean;
  balance?: AccountBalance;
  subsidy?: SubsidyWithAllowance;
  hasRoles?: boolean;
  checkRoles?: CheckRolesResult;
  hasPermissions?: boolean;
  checkPermissions?: CheckPermissionsResult<SignerType.Account>;
  hasAssetPermissions?: boolean;
  checkAssetPermissions?: CheckPermissionsResult<SignerType.Identity>;
  validCdd?: boolean;
  assetBalance?: BigNumber;
  invalidDids?: string[];
  transactionFees?: ProtocolFees[];
  signingAddress?: string;
  nonce?: BigNumber;
  issuedClaims?: ResultSet<ClaimData>;
  getIdentity?: Identity;
  getIdentityClaimsFromChain?: ClaimData[];
  getIdentityClaimsFromMiddleware?: ResultSet<ClaimData>;
  getIdentityClaimsFromMiddlewareV2?: ResultSet<ClaimData>;
  getExternalSigner?: PolkadotSigner;
  primaryAccount?: string;
  secondaryAccounts?: ResultSet<PermissionedAccount>;
  transactionHistory?: ResultSet<ExtrinsicData>;
  latestBlock?: BigNumber;
  middlewareEnabled?: boolean;
  middlewareAvailable?: boolean;
  middlewareV2Available?: boolean;
  sentAuthorizations?: ResultSet<AuthorizationRequest>;
  isArchiveNode?: boolean;
  ss58Format?: BigNumber;
  areSecondaryAccountsFrozen?: boolean;
  getDividendDistributionsForAssets?: DistributionWithDetails[];
  isFrozen?: boolean;
  getSigningAccounts?: Account[];
  signingIdentityIsEqual?: boolean;
  signingAccountIsEqual?: boolean;
  networkVersion?: string;
  supportsSubsidy?: boolean;
}

interface SigningManagerOptions {
  getAccounts?: string[];
  getExternalSigner?: PolkadotSigner | null;
}

export interface StubQuery {
  entries: SinonStub;
  entriesAt: SinonStub;
  entriesPaged: SinonStub;
  at: SinonStub;
  multi: SinonStub;
  size: SinonStub;
}

export enum TxFailReason {
  BadOrigin = 'BadOrigin',
  CannotLookup = 'CannotLookup',
  Module = 'Module',
  Other = 'Other',
}

const defaultReceipt: ISubmittableResult = {
  status: { isReady: true } as ExtrinsicStatus,
  findRecord: () => undefined,
  filterRecords: () => [],
  isCompleted: false,
  isError: false,
  isFinalized: false,
  isInBlock: false,
  isWarning: false,
  events: [],
  txHash: '0x123' as unknown as Hash,
  txIndex: 1,
  toHuman: () => ({}),
};

const intermediateReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: false },
  isCompleted: true,
  isInBlock: false,
});

const inBlockReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isInBlock: true, asInBlock: 'blockHash' },
  isCompleted: true,
  isInBlock: true,
});

const successReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isReady: false, isFinalized: true, asFinalized: 'blockHash' },
  isCompleted: true,
  isFinalized: true,
});

const batchFailedReceipt: ISubmittableResult = merge({}, successReceipt, {
  findRecord: (mod: string, event: string) =>
    mod === 'utility' && event === 'BatchInterrupted'
      ? { event: { data: [[], [{ toString: (): string => '1' }, 'Some Error']] } }
      : undefined,
  filterRecords: (mod: string, event: string) =>
    mod === 'utility' && event === 'BatchInterrupted'
      ? [{ event: { data: [[], [{ toString: (): string => '1' }, 'Some Error']] } }]
      : [],
});

/**
 * @hidden
 */
const createFailReceipt = (
  err: Partial<DispatchError>,
  baseReceipt: ISubmittableResult = inBlockReceipt
): ISubmittableResult =>
  merge({}, baseReceipt, {
    findRecord: () => ({ event: { data: [err] } }),
    filterRecords: () => [{ event: { data: [err] } }],
  });

const badOriginFailReceipt = createFailReceipt({ isBadOrigin: true });

const cannotLookupFailReceipt = createFailReceipt({ isCannotLookup: true });

const otherFailReceipt = createFailReceipt({ isOther: true });

const moduleFailReceipt = createFailReceipt({
  isModule: true,
  asModule: {
    error: { toNumber: (): number => 1 },
    index: { toNumber: (): number => 1 },
    registry: {
      findMetaError: (): { section: string; name: string; docs: string[] } => ({
        section: 'someModule',
        name: 'SomeError',
        docs: ['This is very bad'],
      }),
    },
  } as unknown as DispatchErrorModule,
});

const abortReceipt: ISubmittableResult = merge({}, defaultReceipt, {
  status: { isInvalid: true, isReady: false },
  isError: true,
  isCompleted: true,
});

const finalizedErrorReceipt = createFailReceipt({}, successReceipt);

/**
 * @hidden
 */
const failReasonToReceipt = (failReason?: TxFailReason): ISubmittableResult => {
  if (!failReason || failReason === TxFailReason.Module) {
    return moduleFailReceipt;
  }

  if (failReason === TxFailReason.BadOrigin) {
    return badOriginFailReceipt;
  }

  if (failReason === TxFailReason.CannotLookup) {
    return cannotLookupFailReceipt;
  }

  return otherFailReceipt;
};

/**
 * @hidden
 */
const statusToReceipt = (status: MockTxStatus, failReason?: TxFailReason): ISubmittableResult => {
  if (status === MockTxStatus.Aborted) {
    return abortReceipt;
  }
  if (status === MockTxStatus.Failed) {
    return failReasonToReceipt(failReason);
  }
  if ([MockTxStatus.Succeeded, MockTxStatus.FailedToUnsubscribe].includes(status)) {
    return successReceipt;
  }
  if (status === MockTxStatus.Ready) {
    return defaultReceipt;
  }
  if (status === MockTxStatus.Intermediate) {
    return intermediateReceipt;
  }
  if (status === MockTxStatus.InBlock) {
    return inBlockReceipt;
  }
  if (status === MockTxStatus.BatchFailed) {
    return batchFailedReceipt;
  }
  if (status === MockTxStatus.FinalizedFailed) {
    return finalizedErrorReceipt;
  }

  throw new Error(`There is no receipt associated with status ${status}`);
};

export const mockPolkadotModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ApiPromise: MockApiPromiseClass,
  WsProvider: MockWsProviderClass,
});

export const mockContextModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Context: MockContextClass,
});

export const mockApolloModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ApolloClient: MockApolloClientClass,
});

export const mockWebSocketModule = () => (): unknown => ({ w3cwebsocket: MockWebSocketClass });

const txMocksData = new Map<unknown, TxMockData>();
let txModule = {} as Extrinsics;
let queryModule = {} as Queries;
let constsModule = {} as Consts;

let rpcModule = {} as DecoratedRpc<any, any>;

let queryMultiStub = sinon.stub();

const defaultContextOptions: ContextOptions = {
  did: 'someDid',
  withSigningManager: true,
  balance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  hasRoles: true,
  checkRoles: {
    result: true,
  },
  hasPermissions: true,
  checkPermissions: {
    result: true,
  },
  hasAssetPermissions: true,
  checkAssetPermissions: {
    result: true,
  },
  getExternalSigner: 'signer' as PolkadotSigner,
  validCdd: true,
  assetBalance: new BigNumber(1000),
  invalidDids: [],
  transactionFees: [
    {
      tag: TxTags.asset.CreateAsset,
      fees: new BigNumber(200),
    },
  ],
  signingAddress: '0xdummy',
  issuedClaims: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  getIdentityClaimsFromChain: [
    {
      target: 'targetIdentity' as unknown as Identity,
      issuer: 'issuerIdentity' as unknown as Identity,
      issuedAt: new Date(),
      expiry: null,
      claim: { type: ClaimType.NoData },
    },
  ],
  getIdentityClaimsFromMiddleware: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  getIdentityClaimsFromMiddlewareV2: {
    data: [
      {
        target: 'targetIdentity' as unknown as Identity,
        issuer: 'issuerIdentity' as unknown as Identity,
        issuedAt: new Date(),
        expiry: null,
        claim: { type: ClaimType.NoData },
      },
    ],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  primaryAccount: 'primaryAccount',
  secondaryAccounts: { data: [], next: null },
  transactionHistory: {
    data: [],
    next: null,
    count: new BigNumber(1),
  },
  latestBlock: new BigNumber(100),
  middlewareEnabled: true,
  middlewareAvailable: true,
  middlewareV2Available: true,
  sentAuthorizations: {
    data: [{} as AuthorizationRequest],
    next: new BigNumber(1),
    count: new BigNumber(1),
  },
  isArchiveNode: true,
  ss58Format: new BigNumber(42),
  getDividendDistributionsForAssets: [],
  areSecondaryAccountsFrozen: false,
  isFrozen: false,
  getSigningAccounts: [],
  signingIdentityIsEqual: true,
  signingAccountIsEqual: true,
  networkVersion: '1.0.0',
  supportsSubsidy: true,
};
let contextOptions: ContextOptions = defaultContextOptions;
const defaultSigningManagerOptions: SigningManagerOptions = {
  getAccounts: ['someAccount', 'otherAccount'],
  getExternalSigner: 'signer' as PolkadotSigner,
};
let signingManagerOptions = defaultSigningManagerOptions;

/**
 * @hidden
 */
function configureContext(opts: ContextOptions): void {
  const getSigningIdentity = sinon.stub();
  const identity = {
    did: opts.did,
    hasRoles: sinon.stub().resolves(opts.hasRoles),
    checkRoles: sinon.stub().resolves(opts.checkRoles),
    hasValidCdd: sinon.stub().resolves(opts.validCdd),
    getAssetBalance: sinon.stub().resolves(opts.assetBalance),
    getPrimaryAccount: sinon.stub().resolves({
      account: {
        address: opts.primaryAccount,
      },
      permissions: {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      },
    }),
    getSecondaryAccounts: sinon.stub().resolves(opts.secondaryAccounts),
    authorizations: {
      getSent: sinon.stub().resolves(opts.sentAuthorizations),
    },
    assetPermissions: {
      hasPermissions: sinon.stub().resolves(opts.hasAssetPermissions),
      checkPermissions: sinon.stub().resolves(opts.checkAssetPermissions),
    },
    areSecondaryAccountsFrozen: sinon.stub().resolves(opts.areSecondaryAccountsFrozen),
    isEqual: sinon.stub().returns(opts.signingIdentityIsEqual),
  };
  opts.withSigningManager
    ? getSigningIdentity.resolves(identity)
    : getSigningIdentity.throws(
        new Error('The signing Account does not have an associated Identity')
      );
  const getSigningAccount = sinon.stub();
  opts.withSigningManager
    ? getSigningAccount.returns({
        address: opts.signingAddress,
        getBalance: sinon.stub().resolves(opts.balance),
        getSubsidy: sinon.stub().resolves(opts.subsidy),
        getIdentity: sinon.stub().resolves(identity),
        getTransactionHistory: sinon.stub().resolves(opts.transactionHistory),
        hasPermissions: sinon.stub().resolves(opts.hasPermissions),
        checkPermissions: sinon.stub().resolves(opts.checkPermissions),
        isFrozen: sinon.stub().resolves(opts.isFrozen),
        isEqual: sinon.stub().returns(opts.signingAccountIsEqual),
      })
    : getSigningAccount.throws(new Error('There is no Account associated with the SDK'));
  const signingAddress = opts.withSigningManager ? opts.signingAddress : undefined;
  const getSigningAddress = sinon.stub();
  opts.withSigningManager
    ? getSigningAddress.returns(signingAddress)
    : getSigningAddress.throws(
        new Error('There is no Account associated with the current SDK instance')
      );
  const nonce = new BigNumber(opts.nonce || -1);
  const getNonce = sinon.stub();
  getNonce.returns(nonce);

  const queryStub = mockInstanceContainer.apolloInstance.query;
  const queryStubV2 = mockInstanceContainer.apolloInstanceV2.query;
  const contextInstance = {
    signingAddress,
    nonce,
    getSigningIdentity,
    getSigningAccount,
    getSigningAddress,
    accountBalance: sinon.stub().resolves(opts.balance),
    accountSubsidy: sinon.stub().resolves(opts.subsidy),
    getSigningAccounts: sinon.stub().resolves(opts.getSigningAccounts),
    setSigningAddress: sinon.stub().callsFake(address => {
      (contextInstance as any).signingAddress = address;
    }),
    setNonce: sinon.stub().callsFake(txNonce => {
      (contextInstance as any).nonce = new BigNumber(txNonce || -1);
    }),
    getNonce,
    setSigningManager: sinon.stub(),
    getExternalSigner: sinon.stub().returns(opts.getExternalSigner),
    polymeshApi: mockInstanceContainer.apiInstance,
    middlewareApi: mockInstanceContainer.apolloInstance,
    queryMiddleware: sinon.stub().callsFake(query => queryStub(query)),
    queryMiddlewareV2: sinon.stub().callsFake(query => queryStubV2(query)),
    middlewareApiV2: mockInstanceContainer.apolloInstanceV2,
    getInvalidDids: sinon.stub().resolves(opts.invalidDids),
    getProtocolFees: sinon.stub().resolves(opts.transactionFees),
    getTransactionArguments: sinon.stub().returns([]),
    getSecondaryAccounts: sinon.stub().returns({ data: opts.secondaryAccounts, next: null }),
    issuedClaims: sinon.stub().resolves(opts.issuedClaims),
    getIdentity: sinon.stub().resolves(opts.getIdentity),
    getIdentityClaimsFromChain: sinon.stub().resolves(opts.getIdentityClaimsFromChain),
    getIdentityClaimsFromMiddleware: sinon.stub().resolves(opts.getIdentityClaimsFromMiddleware),
    getIdentityClaimsFromMiddlewareV2: sinon
      .stub()
      .resolves(opts.getIdentityClaimsFromMiddlewareV2),
    getLatestBlock: sinon.stub().resolves(opts.latestBlock),
    isMiddlewareEnabled: sinon.stub().returns(opts.middlewareEnabled),
    isMiddlewareAvailable: sinon.stub().resolves(opts.middlewareAvailable),
    isMiddlewareV2Available: sinon.stub().resolves(opts.middlewareV2Available),
    isArchiveNode: opts.isArchiveNode,
    ss58Format: opts.ss58Format,
    disconnect: sinon.stub(),
    getDividendDistributionsForAssets: sinon
      .stub()
      .resolves(opts.getDividendDistributionsForAssets),
    getNetworkVersion: sinon.stub().resolves(opts.networkVersion),
    supportsSubsidy: sinon.stub().returns(opts.supportsSubsidy),
    createType: sinon.stub(),
  } as unknown as MockContext;

  contextInstance.clone = sinon.stub<[], Context>().returns(contextInstance);

  Object.assign(mockInstanceContainer.contextInstance, contextInstance);

  MockContextClass.create = contextCreateStub.resolves(contextInstance);
}

/**
 * @hidden
 */
function initContext(opts?: ContextOptions): void {
  contextCreateStub = sinon.stub();

  contextOptions = { ...defaultContextOptions, ...opts };

  configureContext(contextOptions);
}

/**
 * @hidden
 */
function updateQuery(mod?: Queries): void {
  const updateTo = mod || queryModule;

  queryModule = updateTo;

  mockInstanceContainer.apiInstance.query = queryModule;
}

/**
 * @hidden
 *
 * Mock the query module
 */
function initQuery(): void {
  const mod = {} as Queries;

  updateQuery(mod);
}

/**
 * @hidden
 */
function updateTx(mod?: Extrinsics): void {
  const updateTo = mod || txModule;

  txModule = updateTo;

  mockInstanceContainer.apiInstance.tx = txModule;
}

/**
 * @hidden
 */
function updateRpc(mod?: any): void {
  const updateTo = mod || rpcModule;

  rpcModule = updateTo;

  mockInstanceContainer.apiInstance.rpc = rpcModule;
}

/**
 * @hidden
 */
function updateConsts(mod?: Consts): void {
  const updateTo = mod || constsModule;

  constsModule = updateTo;

  mockInstanceContainer.apiInstance.consts = constsModule;
}

/**
 * @hidden
 */
function updateQueryMulti(stub?: SinonStub): void {
  const updateTo = stub || queryMultiStub;

  queryMultiStub = updateTo;

  mockInstanceContainer.apiInstance.queryMulti = queryMultiStub;
}

/**
 * @hidden
 *
 * Mock the tx module
 */
function initTx(): void {
  const mod = {} as Extrinsics;

  updateTx(mod);
}

/**
 * @hidden
 *
 * Mock the rpc module
 */
function initRpc(): void {
  const mod = {} as any;

  updateRpc(mod);
}

/**
 * @hidden
 *
 * Mock the consts module
 */
function initConsts(): void {
  const mod = {} as Consts;

  updateConsts(mod);
}

/**
 * @hidden
 *
 * Mock queryMulti
 */
function initQueryMulti(): void {
  const stub = sinon.stub();

  updateQueryMulti(stub);
}

/**
 * @hidden
 */
function initApi(): void {
  mockInstanceContainer.apiInstance.registry = 'registry' as unknown as Registry;
  mockInstanceContainer.apiInstance.createType = sinon.stub();
  mockInstanceContainer.apiInstance.runtimeVersion = {} as RuntimeVersion;

  initTx();
  initQuery();
  initRpc();
  initConsts();
  initQueryMulti();

  apiPromiseCreateStub = sinon.stub();
  MockApiPromiseClass.create = apiPromiseCreateStub.resolves(mockInstanceContainer.apiInstance);
}

/**
 * Create a mock instance of a Signing Manager
 */
function configureSigningManager(opts: SigningManagerOptions): void {
  const signingManagerInstance = {
    getAccounts: sinon.stub().resolves(opts.getAccounts),
    getExternalSigner: sinon.stub().returns(opts.getExternalSigner),
    setSs58Format: sinon.stub(),
  };

  Object.assign(
    mockInstanceContainer.signingManagerInstance,
    signingManagerInstance as unknown as SigningManager
  );
}

/**
 * @hidden
 */
function initSigningManager(opts?: SigningManagerOptions): void {
  signingManagerOptions = { ...defaultSigningManagerOptions, ...opts };

  configureSigningManager(signingManagerOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: {
  contextOptions?: ContextOptions;
  signingManagerOptions?: SigningManagerOptions;
}): void {
  const tempContextOptions = { ...defaultContextOptions, ...opts?.contextOptions };

  configureContext(tempContextOptions);

  const tempSigningManagerOptions = {
    ...defaultSigningManagerOptions,
    ...opts?.signingManagerOptions,
  };

  configureSigningManager(tempSigningManagerOptions);
}

/**
 * @hidden
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 *
 * @param opts.mockContext - if defined, the internal {@link Context} class will also be mocked with custom properties
 */
export function initMocks(opts?: {
  contextOptions?: ContextOptions;
  signingManagerOptions?: SigningManagerOptions;
}): void {
  /*
    NOTE: the idea is to expand this function to mock things as we need them
    and use the methods in the class to fetch/manipulate different parts of the API as required
   */

  // Context
  initContext(opts?.contextOptions);

  // Api
  initApi();

  // Signing Manager
  initSigningManager(opts?.signingManagerOptions);

  // Apollo
  apolloConstructorStub = sinon.stub().returns(mockInstanceContainer.apolloInstance);

  webSocketConstructorStub = sinon.stub().returns(mockInstanceContainer.webSocketInstance);

  txMocksData.clear();
  errorStub = sinon.stub().throws(new Error('Error'));
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.apiInstance = createApi();
  mockInstanceContainer.contextInstance = {} as MockContext;
  mockInstanceContainer.signingManagerInstance = {} as Mutable<SigningManager>;
  mockInstanceContainer.apolloInstance = createApolloClient();
  mockInstanceContainer.webSocketInstance = createWebSocket();
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();

  initMocks({ contextOptions, signingManagerOptions });
}

/**
 * @hidden
 * Create and returns a mocked transaction. Each call will create a new version of the stub
 *
 * @param mod - name of the module
 * @param tx - name of the transaction function
 * @param autoResolve - if set to a status, the transaction will resolve immediately with that status.
 *  If set to false, the transaction lifecycle will be controlled by {@link updateTxStatus}
 */
export function createTxStub<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
>(
  mod: ModuleName,
  tx: TransactionName,
  opts: {
    autoResolve?: MockTxStatus | false;
    gas?: Balance;
    meta?: { args: Array<{ name: string; type: string }> };
  } = {}
): PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>> & SinonStub {
  let runtimeModule = txModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Extrinsics[ModuleName];
    txModule[mod] = runtimeModule;
  }

  const {
    autoResolve = MockTxStatus.Succeeded,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    gas = createMockBalance(new BigNumber(1)),
    meta = { args: [] },
  } = opts;

  const transaction = sinon.stub().returns({
    method: tx, // should be a `Call` object, but this is enough for testing
    hash: tx,
    signAndSend: sinon.stub().callsFake((_, __, cb: StatusCallback) => {
      if (autoResolve === MockTxStatus.Rejected) {
        return Promise.reject(new Error('Cancelled'));
      }

      const unsubCallback = sinon.stub();

      txMocksData.set(runtimeModule[tx], {
        statusCallback: cb,
        unsubCallback,
        resolved: !!autoResolve,
        status: null as unknown as MockTxStatus,
      });

      if (autoResolve) {
        process.nextTick(() => cb(statusToReceipt(autoResolve)));
      }

      return new Promise(resolve => setImmediate(() => resolve(unsubCallback)));
    }),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paymentInfo: sinon.stub().resolves({ partialFee: gas }),
  }) as unknown as Extrinsics[ModuleName][TransactionName];

  (transaction as any).section = mod;
  (transaction as any).method = tx;
  (transaction as any).meta = meta;

  runtimeModule[tx] = transaction;

  updateTx();

  const instance = mockInstanceContainer.apiInstance;

  return instance.tx[mod][tx] as unknown as PolymeshTx<
    ArgsType<Extrinsics[ModuleName][TransactionName]>
  > &
    SinonStub;
}

/**
 * @hidden
 * Create and return an apollo query stub
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloQueryStub(query: GraphqlQuery<any>, returnData: unknown): SinonStub {
  const { query: stub } = mockInstanceContainer.apolloInstance;

  stub.withArgs(query).resolves({
    data: returnData,
  });

  return stub;
}

/**
 * @hidden
 * Create and return an apollo query stub
 *
 * @param query - apollo document node
 * @param returnValue
 */
export function createApolloV2QueryStub(query: GraphqlQuery<any>, returnData: unknown): SinonStub {
  const { query: stub } = mockInstanceContainer.apolloInstanceV2;

  stub.withArgs(query).resolves({
    data: returnData,
  });

  return stub;
}

/**
 *
 * @hidden
 */
function mockQueries(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[],
  instance: Mocked<Mutable<ApolloClient<NormalizedCacheObject>>>
): sinon.SinonStub {
  const { query: stub } = instance;

  queries.forEach(({ query, returnData: data }) => {
    stub.withArgs(query).resolves({
      data,
    });
  });

  return stub;
}

/**
 * @hidden
 * Create and return an apollo stub for multiple queries
 *
 * @param queries - query and returnData for each stubbed query
 */
export function createApolloMultipleQueriesStub(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): sinon.SinonStub {
  const instance = mockInstanceContainer.apolloInstance;

  return mockQueries(queries, instance);
}

/**
 * @hidden
 * Create and return an apollo stub for multiple V2 queries
 *
 * @param queries - query and returnData for each stubbed query
 */
export function createApolloMultipleV2QueriesStub(
  queries: { query: GraphqlQuery<any>; returnData: unknown }[]
): SinonStub {
  const instance = mockInstanceContainer.apolloInstanceV2;

  return mockQueries(queries, instance);
}

/**
 * @hidden
 * Create and return a query stub
 *
 * @param mod - name of the module
 * @param query - name of the query function
 */
export function createQueryStub<
  ModuleName extends keyof Queries,
  QueryName extends keyof Queries[ModuleName]
>(
  mod: ModuleName,
  query: QueryName,
  opts?: {
    returnValue?: unknown;
    entries?: [unknown[], unknown][]; // [Keys, Codec]
    multi?: unknown;
    size?: BigNumber;
  }
): Queries[ModuleName][QueryName] & SinonStub & StubQuery {
  let runtimeModule = queryModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Queries[ModuleName];
    queryModule[mod] = runtimeModule;
  }

  type QueryStub = Queries[ModuleName][QueryName] & SinonStub & StubQuery;

  let stub: QueryStub;

  if (!runtimeModule[query]) {
    stub = sinon.stub() as unknown as QueryStub;
    stub.entries = sinon.stub();
    stub.entriesAt = sinon.stub();
    stub.entriesPaged = sinon.stub();
    stub.at = sinon.stub();
    stub.multi = sinon.stub();
    stub.size = sinon.stub();
    runtimeModule[query] = stub;

    updateQuery();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    stub = instance.query[mod][query] as QueryStub;
  }

  const entries = opts?.entries ?? [];

  const entryResults = entries.map(([keys, value], index) => [
    { args: keys, toHex: (): string => `key${index}` },
    value,
  ]);
  stub.entries.resolves(entryResults);
  stub.entriesPaged.resolves(entryResults);
  stub.entriesAt.resolves(entryResults);

  if (opts?.multi) {
    stub.multi.resolves(opts.multi);
  }
  if (typeof opts?.size !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    stub.size.resolves(createMockU64(new BigNumber(opts.size)));
  }
  if (opts?.returnValue) {
    stub.resolves(opts.returnValue);
    stub.at.resolves(opts.returnValue);
  }

  return stub;
}

let count = 0;

/**
 * @hidden
 * Create and return a rpc stub
 *
 * @param mod - name of the module
 * @param rpc - name of the rpc function
 */
export function createRpcStub(
  mod: string,
  rpc: string,
  opts?: {
    returnValue?: unknown;
  }
): SinonStub {
  let runtimeModule: any = rpcModule[mod];

  if (!runtimeModule) {
    runtimeModule = rpcModule[mod] = {};
  }

  const stub: SinonStub = sinon.stub();
  runtimeModule[rpc] = stub;

  updateRpc();

  if (opts?.returnValue) {
    stub.resolves(opts.returnValue);
  }

  (stub as any).count = count++;

  return stub;
}

/**
 * @hidden
 * Set a consts mock
 *
 * @param mod - name of the module
 * @param constName - name of the constant
 */
export function setConstMock<
  ModuleName extends keyof Consts,
  ConstName extends keyof Consts[ModuleName]
>(
  mod: ModuleName,
  constName: ConstName,
  opts: {
    returnValue: unknown;
  }
): void {
  let runtimeModule = constsModule[mod];

  if (!runtimeModule) {
    runtimeModule = {} as Consts[ModuleName];
    constsModule[mod] = runtimeModule;
  }

  const returnValue = opts.returnValue as Consts[ModuleName][ConstName];
  if (!runtimeModule[constName]) {
    runtimeModule[constName] = returnValue;

    updateConsts();
  } else {
    const instance = mockInstanceContainer.apiInstance;
    instance.consts[mod][constName] = returnValue;
  }
}

/**
 * @hidden
 */
export function getQueryMultiStub(): SinonStub {
  return queryMultiStub;
}

/**
 * @hidden
 * Update the status of an existing mock transaction. Will throw an error if the transaction has already been resolved
 *
 * @param tx - transaction to update
 * @param status - new status
 */
export function updateTxStatus<
  ModuleName extends keyof Extrinsics,
  TransactionName extends keyof Extrinsics[ModuleName]
>(
  tx: PolymeshTx<ArgsType<Extrinsics[ModuleName][TransactionName]>>,
  status: MockTxStatus,
  failReason?: TxFailReason
): void {
  const txMockData = txMocksData.get(tx);

  if (!txMockData) {
    throw new Error('Invalid tx object');
  }

  if (txMockData.resolved) {
    throw new Error('Cannot update status on an already resolved tx');
  }

  if (status === txMockData.status) {
    throw new Error(`Status is already ${status}`);
  }

  if (
    [
      MockTxStatus.Aborted,
      MockTxStatus.Failed,
      MockTxStatus.Succeeded,
      MockTxStatus.FailedToUnsubscribe,
    ].includes(status)
  ) {
    txMocksData.set(tx, {
      ...txMockData,
      status,
      resolved: true,
    });
  }

  if (status === MockTxStatus.FailedToUnsubscribe) {
    (txMockData.unsubCallback as sinon.SinonStub).throws('Unsub error');
  }

  txMockData.statusCallback(statusToReceipt(status, failReason));
}

/**
 * @hidden
 * Make calls to `Middleware.query` throw an error
 */
export function throwOnMiddlewareQuery(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstance;

  instance.query.throws(err || new Error('Something went wrong'));
}

/**
 * @hidden
 * Make calls to `MiddlewareV2.query` throw an error
 */
export function throwOnMiddlewareV2Query(err?: unknown): void {
  const instance = mockInstanceContainer.apolloInstanceV2;

  instance.query.throws(err || new Error('Something went wrong'));
}

/**
 * @hidden
 * Make calls to `Context.create` throw an error
 */
export function throwOnContextCreation(): void {
  MockContextClass.create = errorStub;
}

/**
 * @hidden
 * Make calls to `ApiPromise.create` throw an error
 */
export function throwOnApiCreation(error?: unknown): void {
  MockApiPromiseClass.create = error ? sinon.stub().throws(error) : errorStub;
}

/**
 * @hidden
 * Sets the `accountBalance` function in the mocked Context to return the specified amount
 *
 * @param balance - new account balance
 */
export function setContextAccountBalance(balance: AccountBalance): void {
  mockInstanceContainer.contextInstance.accountBalance.returns(balance);
}

/**
 * @hidden
 * Retrieve an instance of the mocked Polkadot API
 */
export function getApiInstance(): ApiPromise & SinonStubbedInstance<ApiPromise> & EventEmitter {
  return mockInstanceContainer.apiInstance as unknown as ApiPromise &
    SinonStubbedInstance<ApiPromise> &
    EventEmitter;
}

/**
 * @hidden
 * Retrieve an instance of the mocked WebSocket
 */
export function getWebSocketInstance(): MockWebSocket {
  return mockInstanceContainer.webSocketInstance;
}

/**
 * @hidden
 * Retrieve an instance of the mocked Apollo Client
 */
export function getMiddlewareApi(): ApolloClient<NormalizedCacheObject> &
  SinonStubbedInstance<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstance as ApolloClient<NormalizedCacheObject> &
    SinonStubbedInstance<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve an instance of the mocked v2 Apollo Client
 */
export function getMiddlewareApiV2(): ApolloClient<NormalizedCacheObject> &
  SinonStubbedInstance<ApolloClient<NormalizedCacheObject>> {
  return mockInstanceContainer.apolloInstanceV2 as ApolloClient<NormalizedCacheObject> &
    SinonStubbedInstance<ApolloClient<NormalizedCacheObject>>;
}

/**
 * @hidden
 * Retrieve the stub of the createType method
 */
export function getCreateTypeStub(): SinonStub {
  return mockInstanceContainer.apiInstance.createType as SinonStub;
}

/**
 * @hidden
 * Retrieve an instance of the mocked Context
 */
export function getContextInstance(opts?: ContextOptions): MockContext {
  if (opts) {
    configureContext({ ...defaultContextOptions, ...opts });
  }
  return mockInstanceContainer.contextInstance;
}

/**
 * @hidden
 * Retrieve the stub of the `Context.create` method
 */
export function getContextCreateStub(): SinonStub {
  return contextCreateStub;
}

/**
 * @hidden
 * Retrieve an instance of the mocked SigningManager
 */
export function getSigningManagerInstance(opts?: SigningManagerOptions): Mocked<SigningManager> {
  if (opts) {
    configureSigningManager({ ...defaultSigningManagerOptions, ...opts });
  }
  return mockInstanceContainer.signingManagerInstance as Mocked<SigningManager>;
}

/**
 * @hidden
 */
export const setRuntimeVersion = (args: unknown): void => {
  mockInstanceContainer.apiInstance.runtimeVersion = args as RuntimeVersion;
};

/**
 * @hidden
 */
function isCodec<T extends Codec>(codec: any): codec is T {
  return !!codec?._isCodec;
}

/**
 * @hidden
 */
function isOption<T extends Codec>(codec: any): codec is Option<T> {
  return typeof codec?.unwrap === 'function';
}

export type MockCodec<C extends Codec> = C & { eq: sinon.SinonStub };

/**
 * @hidden
 */
const createMockCodec = <T extends Codec>(codec: unknown, isEmpty: boolean): MockCodec<T> => {
  if (isCodec<T>(codec)) {
    return codec as MockCodec<T>;
  }
  const clone = cloneDeep(codec) as MockCodec<Mutable<T>>;

  (clone as any)._isCodec = true;
  clone.isEmpty = isEmpty;
  clone.eq = sinon.stub();

  return clone;
};

export const createMockTupleCodec = <T extends [...Codec[]]>(
  tup?: ITuple<T> | Readonly<[...unknown[]]>
): MockCodec<ITuple<T>> => {
  if (isCodec<ITuple<T>>(tup)) {
    return tup as MockCodec<ITuple<T>>;
  }

  return createMockCodec<ITuple<T>>(tup, !tup);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockStringCodec = <T extends Codec>(value?: string | T): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec(
    {
      toString: () => value,
    },
    value === undefined
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockU8aCodec = <T extends IU8a>(value?: string | T, hex?: boolean): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec(hex ? hexToU8a(value) : stringToU8a(value), value === undefined);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockNumberCodec = <T extends UInt>(value?: BigNumber | T): MockCodec<T> => {
  if (isCodec<T>(value)) {
    return value as MockCodec<T>;
  }

  return createMockCodec<T>(
    {
      toNumber: () => value?.toNumber(),
      toString: () => value?.toString(),
      isZero: () => value?.isZero(),
    },
    value === undefined
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityId = (
  did?: string | PolymeshPrimitivesIdentityId
): MockCodec<PolymeshPrimitivesIdentityId> => {
  if (isCodec<PolymeshPrimitivesIdentityId>(did)) {
    return did as MockCodec<PolymeshPrimitivesIdentityId>;
  }

  return createMockStringCodec<PolymeshPrimitivesIdentityId>(did);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
const createMockEnum = <T extends Enum>(
  enumValue?: string | Record<string, Codec | Codec[]> | T,
  index?: number
): MockCodec<T> => {
  if (isCodec<T>(enumValue)) {
    return enumValue as MockCodec<T>;
  }

  const codec: Record<string, unknown> = {};

  if (typeof enumValue === 'string') {
    codec[`is${upperFirst(enumValue)}`] = true;
    codec.type = enumValue;
  } else if (typeof enumValue === 'object') {
    const key = Object.keys(enumValue)[0];

    codec[`is${upperFirst(key)}`] = true;
    codec[`as${upperFirst(key)}`] = enumValue[key];
    codec.type = key;
  }
  codec.index = index;

  return createMockCodec<T>(codec, !enumValue);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAgentGroup = (
  agentGroup?:
    | 'Full'
    | 'ExceptMeta'
    | 'PolymeshV1CAA'
    | 'PolymeshV1PIA'
    | { Custom: AGId }
    | AgentGroup
): MockCodec<AgentGroup> => {
  if (isCodec<AgentGroup>(agentGroup)) {
    return agentGroup as MockCodec<AgentGroup>;
  }

  return createMockEnum<AgentGroup>(agentGroup);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEcdsaSignature = (
  signature?: string | EcdsaSignature
): MockCodec<EcdsaSignature> => {
  if (isCodec<EcdsaSignature>(signature)) {
    return signature as MockCodec<EcdsaSignature>;
  }

  return createMockStringCodec<EcdsaSignature>(signature);
};

/**
 * @hidden
 */
export const createMockBTreeSet = <T extends Codec>(
  items: BTreeSet<T> | unknown[] = []
): MockCodec<BTreeSet<T>> => {
  if (isCodec<BTreeSet<T>>(items)) {
    return items as MockCodec<BTreeSet<T>>;
  }

  const codecItems = items.map(item => {
    if (isCodec(item)) {
      return item;
    }

    if (typeof item === 'string') {
      return createMockStringCodec(item);
    }

    if (typeof item === 'number' || item instanceof BigNumber) {
      return createMockNumberCodec(new BigNumber(item));
    }

    return createMockCodec(item, !item);
  });

  const res = createMockCodec(new Set(codecItems), !items) as unknown as Mutable<BTreeSet>;

  return res as MockCodec<BTreeSet<T>>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEthereumAddress = (
  address?: string | EthereumAddress
): MockCodec<EthereumAddress> => {
  if (isCodec<EthereumAddress>(address)) {
    return address as MockCodec<EthereumAddress>;
  }

  return createMockU8aCodec<EthereumAddress>(address);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTicker = (
  ticker?: string | PolymeshPrimitivesTicker
): MockCodec<PolymeshPrimitivesTicker> => {
  if (isCodec<PolymeshPrimitivesTicker>(ticker)) {
    return ticker as MockCodec<PolymeshPrimitivesTicker>;
  }

  return createMockU8aCodec<PolymeshPrimitivesTicker>(ticker);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountId = (accountId?: string | AccountId): MockCodec<AccountId> => {
  if (isCodec<AccountId>(accountId)) {
    return accountId as MockCodec<AccountId>;
  }

  return createMockStringCodec<AccountId>(accountId);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBalance = (balance?: BigNumber | Balance): MockCodec<Balance> => {
  if (isCodec<Balance>(balance)) {
    return balance as MockCodec<Balance>;
  }

  return createMockNumberCodec<Balance>(balance);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocumentHash = (
  hash?:
    | 'None'
    | { H128: U8aFixed }
    | { H160: U8aFixed }
    | { H192: U8aFixed }
    | { H224: U8aFixed }
    | { H256: U8aFixed }
    | { H320: U8aFixed }
    | { H384: U8aFixed }
    | { H512: U8aFixed }
    | DocumentHash
): MockCodec<DocumentHash> => {
  if (isCodec<DocumentHash>(hash)) {
    return hash as MockCodec<DocumentHash>;
  }

  return createMockEnum<DocumentHash>(hash);
};

type MaybeTuple<T extends Codec | Codec[]> = T extends Codec[] ? ITuple<T> : T;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockOption = <T extends Codec | Codec[]>(
  wrapped: T | null | Option<MaybeTuple<T>> = null
): Option<MaybeTuple<T>> => {
  if (isOption<MaybeTuple<T>>(wrapped)) {
    return wrapped;
  }

  return createMockCodec<Option<MaybeTuple<T>>>(
    {
      unwrap: () => wrapped as T,
      unwrapOr: (val: unknown) => wrapped ?? val,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCompact = <T extends INumber>(
  wrapped: T | null = null
): MockCodec<Compact<T>> =>
  createMockCodec(
    {
      unwrap: () => wrapped as T,
      isNone: !wrapped,
      isSome: !!wrapped,
    },
    !wrapped
  );

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMoment = (millis?: BigNumber | Moment): MockCodec<Moment> => {
  if (isCodec<Moment>(millis)) {
    return millis as MockCodec<Moment>;
  }

  return createMockNumberCodec<Moment>(millis);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistration = (
  registration?:
    | TickerRegistration
    | {
        owner: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
        expiry: Option<Moment>;
      }
): MockCodec<TickerRegistration> => {
  if (isCodec<TickerRegistration>(registration)) {
    return registration as MockCodec<TickerRegistration>;
  }

  const { owner, expiry } = registration || {
    owner: createMockIdentityId(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      owner: createMockIdentityId(owner),
      expiry: createMockOption(expiry),
    },
    !registration
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8 = (value?: BigNumber | u8): u8 => createMockNumberCodec<u8>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU16 = (value?: BigNumber | u16): MockCodec<u16> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU32 = (value?: BigNumber | u32): MockCodec<u32> =>
  createMockNumberCodec<u32>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU64 = (value?: BigNumber | u64): MockCodec<u64> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU128 = (value?: BigNumber | u128): MockCodec<u128> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermill = (value?: BigNumber | Permill): MockCodec<Permill> =>
  createMockNumberCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBytes = (value?: string | Bytes): MockCodec<Bytes> =>
  createMockU8aCodec(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockHash = (value?: string | Hash): MockCodec<Hash> =>
  createMockStringCodec(value);

/**
 * @hidden
 */
export const createMockPosRatio = (
  numerator: BigNumber,
  denominator: BigNumber
): MockCodec<PosRatio> =>
  [createMockU32(numerator), createMockU32(denominator)] as unknown as MockCodec<PosRatio>;

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBool = (value?: boolean | bool): MockCodec<bool> => {
  if (isCodec<bool>(value)) {
    return value as MockCodec<bool>;
  }

  return createMockCodec(
    {
      isTrue: value,
      isFalse: !value,
      valueOf: () => value,
    },
    !value
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioKind = (
  portfolioKind?: 'Default' | { User: u64 } | PortfolioKind
): MockCodec<PortfolioKind> => {
  if (isCodec<PortfolioKind>(portfolioKind)) {
    return portfolioKind as MockCodec<PortfolioKind>;
  }

  return createMockEnum<PortfolioKind>(portfolioKind);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioId = (
  portfolioId?:
    | PolymeshPrimitivesIdentityIdPortfolioId
    | {
        did: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
        kind: PortfolioKind | Parameters<typeof createMockPortfolioKind>[0];
      }
): MockCodec<PolymeshPrimitivesIdentityIdPortfolioId> => {
  const { did, kind } = portfolioId || {
    did: createMockIdentityId(),
    kind: createMockPortfolioKind(),
  };
  return createMockCodec<PolymeshPrimitivesIdentityIdPortfolioId>(
    {
      did: createMockIdentityId(did),
      kind: createMockPortfolioKind(kind),
    },
    !portfolioId
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockMovePortfolioItem = (movePortfolioItem?: {
  ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
  amount: Balance | Parameters<typeof createMockBalance>[0];
}): MockCodec<MovePortfolioItem> => {
  if (isCodec<MovePortfolioItem>(movePortfolioItem)) {
    return movePortfolioItem as MockCodec<MovePortfolioItem>;
  }

  const { ticker, amount } = movePortfolioItem || {
    ticker: createMockTicker(),
    amount: createMockBalance(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      amount: createMockBalance(amount),
    },
    !movePortfolioItem
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetType = (
  assetType?:
    | 'EquityCommon'
    | 'EquityPreferred'
    | 'Commodity'
    | 'FixedIncome'
    | 'Reit'
    | 'Fund'
    | 'RevenueShareAgreement'
    | 'StructuredProduct'
    | 'Derivative'
    | 'StableCoin'
    | { Custom: CustomAssetTypeId }
    | AssetType
): MockCodec<AssetType> => {
  return createMockEnum<AssetType>(assetType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTickerRegistrationConfig = (regConfig?: {
  max_ticker_length: u8;
  registration_length: Option<Moment>;
}): MockCodec<TickerRegistrationConfig> => {
  const config = regConfig || {
    max_ticker_length: createMockU8(),
    registration_length: createMockOption(),
  };
  return createMockCodec({ ...config }, !regConfig);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecurityToken = (token?: {
  totalSupply: Balance;
  ownerDid: PolymeshPrimitivesIdentityId;
  divisible: bool;
  assetType: AssetType;
}): MockCodec<SecurityToken> => {
  const st = token || {
    totalSupply: createMockBalance(),
    ownerDid: createMockIdentityId(),
    divisible: createMockBool(),
    assetType: createMockAssetType(),
  };
  return createMockCodec({ ...st }, !token);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDocument = (document?: {
  uri: Bytes;
  contentHash: DocumentHash;
  name: Bytes;
  docType: Option<Bytes>;
  filingDate: Option<Moment>;
}): MockCodec<PolymeshPrimitivesDocument> => {
  const doc = document || {
    uri: createMockBytes(),
    content_hash: createMockDocumentHash(),
    name: createMockBytes(),
    docType: createMockOption(),
    filingDate: createMockOption(),
  };
  return createMockCodec(
    {
      ...doc,
    },
    !document
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDispatchableNames = (
  dispatchableNames?: 'Whole' | { These: Bytes[] } | { Except: Bytes[] } | DispatchableNames
): MockCodec<DispatchableNames> => {
  if (isCodec<DispatchableNames>(dispatchableNames)) {
    return dispatchableNames as MockCodec<DispatchableNames>;
  }

  return createMockEnum<DispatchableNames>(dispatchableNames);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletName = (name?: string | PalletName): MockCodec<PalletName> => {
  if (isCodec<PalletName>(name)) {
    return name as MockCodec<PalletName>;
  }

  return createMockStringCodec<PalletName>(name);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPalletPermissions = (permissions?: {
  palletName: string | Parameters<typeof createMockBytes>[0];
  dispatchableNames: DispatchableNames | Parameters<typeof createMockDispatchableNames>[0];
}): MockCodec<PolymeshPrimitivesSecondaryKeyPalletPermissions> => {
  const { palletName, dispatchableNames } = permissions || {
    palletName: undefined,
    dispatchableNames: createMockDispatchableNames(),
  };

  return createMockCodec(
    {
      palletName: createMockBytes(palletName),
      dispatchableNames: createMockDispatchableNames(dispatchableNames),
    },
    !permissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountData = (accountData?: {
  free: Balance | Parameters<typeof createMockBalance>[0];
  reserved: Balance | Parameters<typeof createMockBalance>[0];
  miscFrozen: Balance | Parameters<typeof createMockBalance>[0];
  feeFrozen: Balance | Parameters<typeof createMockBalance>[0];
}): MockCodec<AccountData> => {
  const { free, reserved, miscFrozen, feeFrozen } = accountData || {
    free: createMockBalance(),
    reserved: createMockBalance(),
    miscFrozen: createMockBalance(),
    feeFrozen: createMockBalance(),
  };

  return createMockCodec(
    {
      free: createMockBalance(free),
      reserved: createMockBalance(reserved),
      miscFrozen: createMockBalance(miscFrozen),
      feeFrozen: createMockBalance(feeFrozen),
    },
    !accountData
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIndex = (value?: BigNumber): Index => createMockNumberCodec<Index>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRefCount = (value?: BigNumber): RefCount =>
  createMockNumberCodec<RefCount>(value);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAccountInfo = (accountInfo?: {
  nonce: Index;
  refcount: RefCount;
  data: AccountData;
}): MockCodec<AccountInfo> => {
  const info = accountInfo || {
    nonce: createMockIndex(),
    refcount: createMockRefCount(),
    data: createMockAccountData(),
  };

  return createMockCodec(
    {
      ...info,
    },
    !accountInfo
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSubsidy = (subsidy?: {
  payingKey: AccountId;
  remaining: Balance;
}): MockCodec<PalletRelayerSubsidy> => {
  const sub = subsidy || {
    payingKey: createMockAccountId(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...sub,
    },
    !subsidy
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignatory = (
  signatory?: { Identity: PolymeshPrimitivesIdentityId } | { Account: AccountId }
): MockCodec<Signatory> => {
  return createMockEnum<Signatory>(signatory);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationType = (
  authorizationType?:
    | 'AttestPrimaryKeyRotation'
    | 'RotatePrimaryKey'
    | 'TransferTicker'
    | 'AddMultiSigSigner'
    | 'TransferAssetOwnership'
    | 'JoinIdentity'
    | 'Custom'
    | 'NoData'
    | 'RotatePrimaryKeyToSecondary'
): MockCodec<MeshAuthorizationType> => {
  return createMockEnum<MeshAuthorizationType>(authorizationType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockU8aFixed = (value?: string, hex?: boolean): MockCodec<U8aFixed> =>
  createMockU8aCodec<U8aFixed>(value, hex);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetIdentifier = (
  identifier?:
    | { Isin: U8aFixed }
    | { Cusip: U8aFixed }
    | { Cins: U8aFixed }
    | { Lei: U8aFixed }
    | { Figi: U8aFixed }
): MockCodec<PolymeshPrimitivesAssetIdentifier> =>
  createMockEnum<PolymeshPrimitivesAssetIdentifier>(identifier);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserName = (name?: string): Bytes => createMockBytes(name);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetPermissions = (
  assetPermissions?:
    | 'Whole'
    | { These: PolymeshPrimitivesTicker[] }
    | { Except: PolymeshPrimitivesTicker[] }
): MockCodec<AssetPermissions> => {
  return createMockEnum<AssetPermissions>(assetPermissions);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockExtrinsicPermissions = (
  assetPermissions?:
    | 'Whole'
    | { These: PolymeshPrimitivesSecondaryKeyPalletPermissions[] }
    | { Except: PolymeshPrimitivesSecondaryKeyPalletPermissions[] }
): MockCodec<PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions> => {
  return createMockEnum<PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions>(
    assetPermissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioPermissions = (
  assetPermissions?: 'Whole' | { These: PortfolioId[] } | { Except: PortfolioId[] }
): MockCodec<PortfolioPermissions> => {
  return createMockEnum<PortfolioPermissions>(assetPermissions);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPermissions = (permissions?: {
  asset: AssetPermissions;
  extrinsic: PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions;
  portfolio: PortfolioPermissions;
}): MockCodec<PolymeshPrimitivesSecondaryKeyPermissions> => {
  const perms = permissions || {
    asset: createMockAssetPermissions(),
    extrinsic: createMockExtrinsicPermissions(),
    portfolio: createMockPortfolioPermissions(),
  };

  return createMockCodec(
    {
      ...perms,
    },
    !permissions
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorizationData = (
  authorizationData?:
    | { AttestPrimaryKeyRotation: PolymeshPrimitivesIdentityId }
    | 'RotatePrimaryKey'
    | { RotatePrimaryKeyToSecondary: PolymeshPrimitivesSecondaryKeyPermissions }
    | { TransferTicker: PolymeshPrimitivesTicker }
    | { AddMultiSigSigner: AccountId }
    | { TransferAssetOwnership: PolymeshPrimitivesTicker }
    | { JoinIdentity: PolymeshPrimitivesSecondaryKeyPermissions }
    | { PortfolioCustody: PortfolioId }
    | { AddRelayerPayingKey: [AccountId, AccountId, Balance] }
    | { BecomeAgent: [PolymeshPrimitivesTicker, AgentGroup] }
    | PolymeshPrimitivesAuthorizationAuthorizationData
): MockCodec<PolymeshPrimitivesAuthorizationAuthorizationData> => {
  if (isCodec<PolymeshPrimitivesAuthorizationAuthorizationData>(authorizationData)) {
    return authorizationData as MockCodec<PolymeshPrimitivesAuthorizationAuthorizationData>;
  }

  return createMockEnum<PolymeshPrimitivesAuthorizationAuthorizationData>(authorizationData);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAuthorization = (authorization?: {
  authorizationData:
    | PolymeshPrimitivesAuthorizationAuthorizationData
    | Parameters<typeof createMockAuthorizationData>[0];
  authorizedBy: PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0];
  expiry: Option<Moment>;
  authId: u64 | Parameters<typeof createMockU64>[0];
}): MockCodec<PolymeshPrimitivesAuthorization> => {
  const { authorizationData, authorizedBy, expiry, authId } = authorization || {
    authorizationData: createMockAuthorizationData(),
    authorizedBy: createMockIdentityId(),
    expiry: createMockOption(),
    authId: createMockU64(),
  };

  return createMockCodec(
    {
      authorizationData: createMockAuthorizationData(authorizationData),
      authorizedBy: createMockIdentityId(authorizedBy),
      expiry: createMockOption(expiry),
      authId: createMockU64(authId),
    },
    !authorization
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockEventRecord = (data: unknown[]): EventRecord =>
  ({
    event: {
      data,
    },
  } as unknown as EventRecord);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIEvent = <T extends Codec[]>(data: unknown[]): IEvent<T> =>
  ({
    data,
  } as unknown as IEvent<T>);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddStatus = (
  cddStatus?: { Ok: PolymeshPrimitivesIdentityId } | { Err: Bytes }
): MockCodec<CddStatus> => createMockEnum<CddStatus>(cddStatus);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCountryCode = (name?: CountryCodeEnum): MockCodec<CountryCode> =>
  createMockEnum<CountryCode>(name);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScope = (
  scope?:
    | { Identity: PolymeshPrimitivesIdentityId }
    | { Ticker: PolymeshPrimitivesTicker }
    | { Custom: Bytes }
): MockCodec<Scope> => createMockEnum<Scope>(scope);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCddId = (cddId?: string): MockCodec<CddId> =>
  createMockStringCodec<CddId>(cddId);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeId = (scopeId?: string): ScopeId =>
  createMockStringCodec<ScopeId>(scopeId);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInvestorZKProofData = (proof?: string): InvestorZKProofData =>
  createMockStringCodec<InvestorZKProofData>(proof);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim = (
  claim?:
    | { Accredited: Scope }
    | { Affiliate: Scope }
    | { BuyLockup: Scope }
    | { SellLockup: Scope }
    | { CustomerDueDiligence: CddId }
    | { KnowYourCustomer: Scope }
    | { Jurisdiction: [CountryCode, Scope] }
    | { Exempted: Scope }
    | { Blocked: Scope }
    | { InvestorUniqueness: [Scope, ScopeId, CddId] }
    | { InvestorUniquenessV2: CddId }
    | 'NoData'
): Claim => createMockEnum<Claim>(claim);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityClaim = (identityClaim?: {
  claim_issuer: PolymeshPrimitivesIdentityId;
  issuance_date: Moment;
  last_update_date: Moment;
  expiry: Option<Moment>;
  claim: Claim;
}): MockCodec<IdentityClaim> => {
  const identityClaimMock = identityClaim || {
    claim_issuer: createMockIdentityId(),
    issuance_date: createMockMoment(),
    last_update_date: createMockMoment(),
    expiry: createMockOption(),
    claim: createMockClaim(),
  };
  return createMockCodec(
    {
      ...identityClaimMock,
    },
    !identityClaimMock
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentity = (
  targetIdentity?: { Specific: PolymeshPrimitivesIdentityId } | 'ExternalAgent'
): MockCodec<TargetIdentity> => createMockEnum<TargetIdentity>(targetIdentity);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionType = (
  conditionType?:
    | { IsPresent: Claim }
    | { IsAbsent: Claim }
    | { IsAnyOf: Claim[] }
    | { IsNoneOf: Claim[] }
    | { IsIdentity: TargetIdentity }
    | ConditionType
): MockCodec<PolymeshPrimitivesConditionConditionType> => {
  if (isCodec<PolymeshPrimitivesConditionConditionType>(conditionType)) {
    return conditionType as MockCodec<PolymeshPrimitivesConditionConditionType>;
  }

  return createMockEnum<PolymeshPrimitivesConditionConditionType>(conditionType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRpcConditionType = (
  conditionType?:
    | { IsPresent: Claim }
    | { IsAbsent: Claim }
    | { IsAnyOf: Claim[] }
    | { IsNoneOf: Claim[] }
    | { IsIdentity: TargetIdentity }
    | ConditionType
): MockCodec<ConditionType> => {
  if (isCodec<ConditionType>(conditionType)) {
    return conditionType as MockCodec<ConditionType>;
  }
  return createMockEnum<ConditionType>(conditionType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaimType = (
  claimType?: ClaimType
): MockCodec<PolymeshPrimitivesIdentityClaimClaimType> => {
  const claimIndexes = {
    Accredited: 1,
    Affiliate: 2,
    BuyLockup: 3,
    SellLockup: 4,
    CustomerDueDiligence: 5,
    KnowYourCustomer: 6,
    Jurisdiction: 7,
    Exempted: 8,
    Blocked: 9,
    InvestorUniqueness: 10,
    NoType: 11,
    NoData: 11,
    InvestorUniquenessV2: 12,
  };
  return createMockEnum<PolymeshPrimitivesIdentityClaimClaimType>(
    claimType,
    claimType ? claimIndexes[claimType] : 0
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClaim1stKey = (claim1stKey?: {
  target: PolymeshPrimitivesIdentityId;
  claimType: PolymeshPrimitivesIdentityClaimClaimType;
}): MockCodec<Claim1stKey> => {
  const claimTypeMock = claim1stKey || {
    target: createMockIdentityId(),
    claimType: createMockClaimType(),
  };
  return createMockCodec(
    {
      ...claimTypeMock,
    },
    !claimTypeMock
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedFor = (
  trustedFor?: 'Any' | { Specific: PolymeshPrimitivesIdentityClaimClaimType[] }
): MockCodec<PolymeshPrimitivesConditionTrustedFor> =>
  createMockEnum<PolymeshPrimitivesConditionTrustedFor>(trustedFor);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTrustedIssuer = (issuer?: {
  issuer: PolymeshPrimitivesIdentityId;
  trustedFor: PolymeshPrimitivesConditionTrustedFor;
}): MockCodec<PolymeshPrimitivesConditionTrustedIssuer> => {
  const trustedIssuer = issuer || {
    issuer: createMockIdentityId(),
    trustedFor: createMockTrustedFor(),
  };

  return createMockCodec(
    {
      ...trustedIssuer,
    },
    !issuer
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCondition = (condition?: {
  conditionType:
    | PolymeshPrimitivesConditionConditionType
    | Parameters<typeof createMockConditionType>[0];
  issuers: (
    | PolymeshPrimitivesConditionTrustedIssuer
    | Parameters<typeof createMockTrustedIssuer>[0]
  )[];
}): MockCodec<PolymeshPrimitivesCondition> => {
  const { conditionType, issuers } = condition || {
    conditionType: createMockConditionType(),
    issuers: [],
  };
  return createMockCodec(
    {
      conditionType: createMockConditionType(conditionType),
      issuers: issuers.map(issuer => createMockTrustedIssuer(issuer)),
    },
    !condition
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockConditionResult = (conditionResult?: {
  condition: PolymeshPrimitivesCondition | Parameters<typeof createMockCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<ConditionResult> => {
  const { condition, result } = conditionResult || {
    condition: createMockCondition(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      condition: createMockCondition(condition),
      result: createMockBool(result),
    },
    !conditionResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirement = (complianceRequirement?: {
  senderConditions: PolymeshPrimitivesCondition[];
  receiverConditions: PolymeshPrimitivesCondition[];
  id: u32;
}): MockCodec<PolymeshPrimitivesComplianceManagerComplianceRequirement> => {
  const requirement = complianceRequirement || {
    senderConditions: [],
    receiverConditions: [],
    id: createMockU32(),
  };

  return createMockCodec(
    {
      ...requirement,
    },
    !complianceRequirement
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockComplianceRequirementResult = (complianceRequirementResult?: {
  senderConditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  receiverConditions: (ConditionResult | Parameters<typeof createMockConditionResult>[0])[];
  id: u32 | Parameters<typeof createMockU32>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): ComplianceRequirementResult => {
  const { senderConditions, receiverConditions, id, result } = complianceRequirementResult || {
    senderConditions: [],
    receiverConditions: [],
    id: createMockU32(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      senderConditions: senderConditions.map(condition => createMockConditionResult(condition)),
      receiverConditions: receiverConditions.map(condition => createMockConditionResult(condition)),
      id: createMockU32(id),
      result: createMockBool(result),
    },
    !complianceRequirementResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetComplianceResult = (assetComplianceResult?: {
  paused: bool | Parameters<typeof createMockBool>[0];
  requirements: {
    senderConditions: ConditionResult[];
    receiverConditions: ConditionResult[];
    result: bool;
    id: u32 | Parameters<typeof createMockU32>[0];
  }[];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<AssetComplianceResult> => {
  const { paused, requirements, result } = assetComplianceResult || {
    paused: createMockBool(),
    requirements: [],
    result: createMockBool(),
  };

  return createMockCodec(
    {
      paused: createMockBool(paused),
      requirements: requirements.map(requirement =>
        createMockComplianceRequirementResult(requirement)
      ),
      result: createMockBool(result),
    },
    !assetComplianceResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockIdentityDidRecord = (identity?: {
  primaryKey: Option<AccountId>;
}): MockCodec<PolymeshPrimitivesIdentityDidRecord> => {
  const record = identity || {
    primaryKey: createMockOption(createMockAccountId()),
  };

  return createMockCodec(
    {
      ...record,
    },
    !identity
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockKeyRecord = (
  value?:
    | { PrimaryKey: PolymeshPrimitivesIdentityId }
    | {
        SecondaryKey: [PolymeshPrimitivesIdentityId, PolymeshPrimitivesSecondaryKeyPermissions];
      }
    | { MultiSigSignerKey: AccountId }
): MockCodec<PolymeshPrimitivesSecondaryKeyKeyRecord> => {
  const record = value || {
    PrimaryKey: createMockIdentityId(),
  };

  return createMockEnum<PolymeshPrimitivesSecondaryKeyKeyRecord>({
    ...record,
  });
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCanTransferResult = (
  canTransferResult?: { Ok: u8 } | { Err: Bytes }
): MockCodec<CanTransferResult> => createMockEnum<CanTransferResult>(canTransferResult);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockText = (value?: string | Text): MockCodec<Text> => {
  if (isCodec<Text>(value)) {
    return value as MockCodec<Text>;
  }

  return createMockStringCodec<Text>(value);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAssetOwnershipRelation = (
  assetOwnershipRelation?: 'NotOwned' | 'TickerOwned' | 'AssetOwned'
): MockCodec<AssetOwnershipRelation> =>
  createMockEnum<AssetOwnershipRelation>(assetOwnershipRelation);

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalState = (
  proposalState?: 'Pending' | 'Cancelled' | 'Killed' | 'Rejected' | 'Referendum' | { Custom: Bytes }
): MockCodec<ProposalState> => {
  return createMockEnum<ProposalState>(proposalState);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalStatus = (
  proposalStatus?:
    | 'Invalid'
    | 'ActiveOrExpired'
    | 'ExecutionSuccessful'
    | 'ExecutionFailed'
    | 'Rejected'
): MockCodec<ProposalStatus> => {
  return createMockEnum(proposalStatus) as MockCodec<ProposalStatus>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPip = (pip?: {
  id: u32;
  proposal: Call;
  state: ProposalState;
}): MockCodec<Pip> => {
  const proposal = pip || {
    id: createMockU32(),
    proposal: 'proposal' as unknown as Call,
    state: createMockProposalState(),
  };

  return createMockCodec(
    {
      ...proposal,
    },
    !pip
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipsMetadata = (metadata?: {
  proposer: AccountId;
  cool_off_until: u32;
  end: u32;
}): MockCodec<PipsMetadata> => {
  const data = metadata || {
    proposer: createMockAccountId(),
    cool_off_until: createMockU32(),
    end: createMockU32(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !metadata
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSecondaryKey = (secondaryKey?: {
  signer: Signatory;
  permissions: PolymeshPrimitivesSecondaryKeyPermissions;
}): MockCodec<MeshSecondaryKey> => {
  const key = secondaryKey || {
    signer: createMockSignatory(),
    permissions: createMockPermissions(),
  };
  return createMockCodec(
    {
      ...key,
    },
    !secondaryKey
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPipId = (id: BigNumber): MockCodec<PipId> =>
  createMockU32(new BigNumber(id));

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenueType = (
  venueType?: 'Other' | 'Distribution' | 'Sto' | 'Exchange'
): MockCodec<VenueType> => {
  return createMockEnum<VenueType>(venueType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockVenue = (venue?: {
  creator: PolymeshPrimitivesIdentityId;
  venueType: VenueType;
}): MockCodec<PalletSettlementVenue> => {
  const vn = venue || {
    creator: createMockIdentityId(),
    venueType: createMockVenueType(),
  };

  return createMockCodec(
    {
      ...vn,
    },
    !venue
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstructionStatus = (
  instructionStatus?: 'Pending' | 'Unknown' | 'Failed'
): MockCodec<InstructionStatus> => {
  return createMockEnum<InstructionStatus>(instructionStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSettlementType = (
  settlementType?: 'SettleOnAffirmation' | { SettleOnBlock: u32 }
): MockCodec<SettlementType> => {
  return createMockEnum<SettlementType>(settlementType);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockAffirmationStatus = (
  authorizationStatus?: 'Unknown' | 'Pending' | 'Affirmed'
): MockCodec<AffirmationStatus> => {
  return createMockEnum<AffirmationStatus>(authorizationStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInstruction = (instruction?: {
  instructionId: u64;
  venueId: u64;
  status: InstructionStatus;
  settlementType: SettlementType;
  createdAt: Option<Moment>;
  tradeDate: Option<Moment>;
  valueDate: Option<Moment>;
}): MockCodec<PalletSettlementInstruction> => {
  const data = instruction || {
    instructionId: createMockU64(),
    venueId: createMockU64(),
    status: createMockInstructionStatus(),
    settlementType: createMockSettlementType(),
    createdAt: createMockOption(),
    tradeDate: createMockOption(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !instruction
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferCondition = (
  transferCondition?:
    | { MaxInvestorCount: u64 }
    | { MaxInvestorOwnership: Permill }
    | {
        ClaimCount: [
          PolymeshPrimitivesStatisticsStatClaim,
          PolymeshPrimitivesIdentityId,
          u64,
          Option<u64>
        ];
      }
    | {
        ClaimOwnership: [
          PolymeshPrimitivesStatisticsStatClaim,
          PolymeshPrimitivesIdentityId,
          Permill,
          Permill
        ];
      }
    | TransferCondition
): MockCodec<PolymeshPrimitivesTransferComplianceTransferCondition> => {
  if (isCodec<PolymeshPrimitivesTransferComplianceTransferCondition>(transferCondition)) {
    return transferCondition as MockCodec<PolymeshPrimitivesTransferComplianceTransferCondition>;
  }
  return createMockEnum<PolymeshPrimitivesTransferComplianceTransferCondition>(transferCondition);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserTier = (fundraiserTier?: {
  total: Balance;
  price: Balance;
  remaining: Balance;
}): MockCodec<FundraiserTier> => {
  const data = fundraiserTier || {
    total: createMockBalance(),
    price: createMockBalance(),
    remaining: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiserTier
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiserStatus = (
  fundraiserStatus?: 'Live' | 'Frozen' | 'Closed' | 'ClosedEarly'
): MockCodec<FundraiserStatus> => {
  return createMockEnum<FundraiserStatus>(fundraiserStatus);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockFundraiser = (fundraiser?: {
  creator: PolymeshPrimitivesIdentityId;
  offeringPortfolio: PortfolioId;
  offeringAsset: PolymeshPrimitivesTicker;
  raisingPortfolio: PortfolioId;
  raisingAsset: PolymeshPrimitivesTicker;
  tiers: FundraiserTier[];
  venueId: u64;
  start: Moment;
  end: Option<Moment>;
  status: FundraiserStatus;
  minimumInvestment: Balance;
}): MockCodec<PalletStoFundraiser> => {
  const data = fundraiser || {
    creator: createMockIdentityId(),
    offeringPortfolio: createMockPortfolioId(),
    offeringAsset: createMockTicker(),
    raisingPortfolio: createMockPortfolioId(),
    raisingAsset: createMockTicker(),
    tiers: [],
    venueId: createMockU64(),
    start: createMockMoment(),
    end: createMockOption(),
    status: createMockFundraiserStatus(),
    minimumInvestment: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !fundraiser
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPriceTier = (priceTier?: {
  total: Balance;
  price: Balance;
}): MockCodec<PriceTier> => {
  const data = priceTier || {
    total: createMockBalance(),
    price: createMockBalance(),
  };

  return createMockCodec(
    {
      ...data,
    },
    !priceTier
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarUnit = (
  calendarUnit?: 'Second' | 'Minute' | 'Hour' | 'Day' | 'Week' | 'Month' | 'Year' | CalendarUnit
): MockCodec<CalendarUnit> => {
  if (isCodec<CalendarUnit>(calendarUnit)) {
    return calendarUnit as MockCodec<CalendarUnit>;
  }

  return createMockEnum<CalendarUnit>(calendarUnit);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCalendarPeriod = (
  calendarPeriod?:
    | CalendarPeriod
    | {
        unit: CalendarUnit | Parameters<typeof createMockCalendarUnit>[0];
        amount: u64 | Parameters<typeof createMockU64>[0];
      }
): MockCodec<CalendarPeriod> => {
  const { unit, amount } = calendarPeriod || {
    unit: createMockCalendarUnit(),
    amount: createMockU64(),
  };

  return createMockCodec(
    {
      unit: createMockCalendarUnit(unit),
      amount: createMockU64(amount),
    },
    !calendarPeriod
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCheckpointSchedule = (
  checkpointSchedule?:
    | CheckpointSchedule
    | {
        start: Moment | Parameters<typeof createMockMoment>[0];
        period: CalendarPeriod | Parameters<typeof createMockCalendarPeriod>[0];
      }
): MockCodec<CheckpointSchedule> => {
  const { start, period } = checkpointSchedule || {
    start: createMockMoment(),
    period: createMockCalendarPeriod(),
  };

  return createMockCodec(
    {
      start: createMockMoment(start),
      period: createMockCalendarPeriod(period),
    },
    !checkpointSchedule
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStoredSchedule = (
  storedSchedule?:
    | StoredSchedule
    | {
        schedule: CheckpointSchedule | Parameters<typeof createMockCheckpointSchedule>[0];
        id: u64 | Parameters<typeof createMockU64>[0];
        at: Moment | Parameters<typeof createMockMoment>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<StoredSchedule> => {
  const { schedule, id, at, remaining } = storedSchedule || {
    schedule: createMockCheckpointSchedule(),
    id: createMockU64(),
    at: createMockMoment(),
    remaining: createMockU32(),
  };

  return createMockCodec(
    {
      schedule: createMockCheckpointSchedule(schedule),
      id: createMockU64(id),
      at: createMockMoment(at),
      remaining: createMockU32(remaining),
    },
    !storedSchedule
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScheduleSpec = (
  scheduleSpec?:
    | ScheduleSpec
    | {
        start: Option<Moment>;
        period: CalendarPeriod | Parameters<typeof createMockCalendarPeriod>[0];
        remaining: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<ScheduleSpec> => {
  const { start, period, remaining } = scheduleSpec || {
    start: createMockOption(),
    period: createMockCalendarPeriod(),
    remaining: createMockU32(),
  };

  return createMockCodec(
    {
      start: createMockOption(start),
      period: createMockCalendarPeriod(period),
      remaining: createMockU32(remaining),
    },
    !scheduleSpec
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScalar = (scalar?: string | Scalar): MockCodec<Scalar> => {
  if (!scalar || typeof scalar === 'string') {
    return createMockStringCodec<Scalar>(scalar);
  } else {
    return scalar as MockCodec<Scalar>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDateSpec = (
  recordDateSpec?:
    | { Scheduled: Moment }
    | { ExistingSchedule: ScheduleId }
    | { Existing: CheckpointId }
    | RecordDateSpec
): MockCodec<RecordDateSpec> => {
  if (isCodec<RecordDateSpec>(recordDateSpec)) {
    return recordDateSpec as MockCodec<RecordDateSpec>;
  }

  return createMockEnum<RecordDateSpec>(recordDateSpec);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRistrettoPoint = (
  ristrettoPoint?: string | RistrettoPoint
): MockCodec<RistrettoPoint> => {
  if (!ristrettoPoint || typeof ristrettoPoint === 'string') {
    return createMockStringCodec<RistrettoPoint>(ristrettoPoint);
  } else {
    return ristrettoPoint as MockCodec<RistrettoPoint>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCACheckpoint = (
  caCheckpoint?: { Scheduled: [ScheduleId, u64] } | { Existing: CheckpointId } | CACheckpoint
): MockCodec<CACheckpoint> => {
  if (isCodec<CACheckpoint>(caCheckpoint)) {
    return caCheckpoint as MockCodec<CACheckpoint>;
  }

  return createMockEnum<CACheckpoint>(caCheckpoint);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRecordDate = (
  recordDate?:
    | RecordDate
    | {
        date: Moment | Parameters<typeof createMockMoment>[0];
        checkpoint: CACheckpoint | Parameters<typeof createMockCACheckpoint>[0];
      }
): MockCodec<RecordDate> => {
  const { date, checkpoint } = recordDate || {
    date: createMockMoment(),
    checkpoint: createMockCACheckpoint(),
  };

  return createMockCodec(
    {
      date: createMockMoment(date),
      checkpoint: createMockCACheckpoint(checkpoint),
    },
    !recordDate
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignature = (signature?: string | Signature): MockCodec<Signature> => {
  if (!signature || typeof signature === 'string') {
    return createMockStringCodec<Signature>(signature);
  } else {
    return signature as MockCodec<Signature>;
  }
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockZkProofData = (
  zkProofData?:
    | ConfidentialIdentityClaimProofsZkProofData
    | {
        challengeResponses: [Scalar, Scalar] | [string, string];
        subtractExpressionsRes: RistrettoPoint | string;
        blindedScopeDidHash: RistrettoPoint | string;
      }
): MockCodec<ConfidentialIdentityClaimProofsZkProofData> => {
  const { challengeResponses, subtractExpressionsRes, blindedScopeDidHash } = zkProofData || {
    challengeResponses: [createMockScalar(), createMockScalar()],
    subtractExpressionsRes: createMockRistrettoPoint(),
    blindedScopeDidHash: createMockRistrettoPoint(),
  };

  return createMockCodec(
    {
      challengeResponses: [
        createMockScalar(challengeResponses[0] as string),
        createMockScalar(challengeResponses[1] as string),
      ],
      subtractExpressionsRes: createMockRistrettoPoint(subtractExpressionsRes as string),
      blindedScopeDidHash: createMockRistrettoPoint(blindedScopeDidHash as string),
    },
    !zkProofData
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetTreatment = (
  targetTreatment?: 'Include' | 'Exclude' | TargetTreatment
): MockCodec<TargetTreatment> => {
  if (isCodec<TargetTreatment>(targetTreatment)) {
    return targetTreatment as MockCodec<TargetTreatment>;
  }

  return createMockEnum<TargetTreatment>(targetTreatment);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTargetIdentities = (
  targetIdentities?:
    | TargetIdentities
    | {
        identities: (PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0])[];
        treatment: TargetTreatment | Parameters<typeof createMockTargetTreatment>[0];
      }
): MockCodec<TargetIdentities> => {
  const { identities, treatment } = targetIdentities || {
    identities: [],
    treatment: createMockTargetTreatment(),
  };

  return createMockCodec(
    {
      identities: map(identities, identityId => createMockIdentityId(identityId)),
      treatment: createMockTargetTreatment(treatment),
    },
    !targetIdentities
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockScopeClaimProof = (
  scopeClaimProof?:
    | ConfidentialIdentityClaimProofsScopeClaimProof
    | {
        proofScopeIdWellformed: Signature | string;
        proofScopeIdCddIdMatch:
          | ZkProofData
          | {
              challengeResponses: [string, string];
              subtractExpressionsRes: string;
              blindedScopeDidHash: string;
            };
        scopeId: RistrettoPoint | string;
      }
): MockCodec<ConfidentialIdentityClaimProofsScopeClaimProof> => {
  const { proofScopeIdWellformed, proofScopeIdCddIdMatch, scopeId } = scopeClaimProof || {
    proofScopeIdWellformed: createMockSignature(),
    proofScopeIdCddIdMatch: createMockZkProofData(),
    scopeId: createMockRistrettoPoint(),
  };

  return createMockCodec(
    {
      proofScopeIdWellformed: createMockSignature(proofScopeIdWellformed as Signature),
      proofScopeIdCddIdMatch: createMockZkProofData(
        proofScopeIdCddIdMatch as ConfidentialIdentityClaimProofsZkProofData
      ),
      scopeId: createMockRistrettoPoint(scopeId as RistrettoPoint),
    },
    !scopeClaimProof
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCAKind = (
  caKind?:
    | 'PredictableBenefit'
    | 'UnpredictableBenefit'
    | 'IssuerNotice'
    | 'Reorganization'
    | 'Other'
    | CAKind
): MockCodec<CAKind> => {
  if (isCodec<CAKind>(caKind)) {
    return caKind as MockCodec<CAKind>;
  }

  return createMockEnum<CAKind>(caKind);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCorporateAction = (corporateAction?: {
  kind: CAKind | Parameters<typeof createMockCAKind>[0];
  decl_date: Moment | Parameters<typeof createMockMoment>[0];
  record_date: Option<RecordDate> | Parameters<typeof createMockOption>[0];
  targets: TargetIdentities | Parameters<typeof createMockTargetIdentities>[0];
  default_withholding_tax: Tax | Parameters<typeof createMockPermill>[0];
  withholding_tax: [
    PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0],
    Tax | Parameters<typeof createMockPermill>[0]
  ][];
}): MockCodec<PalletCorporateActionsCorporateAction> => {
  const { kind, decl_date, record_date, targets, default_withholding_tax, withholding_tax } =
    corporateAction || {
      kind: createMockCAKind(),
      declDate: createMockMoment(),
      recordDate: createMockOption(),
      targets: createMockTargetIdentities(),
      defaultWithholdingTax: createMockPermill(),
      withholding_tax: [],
    };

  return createMockCodec(
    {
      kind: createMockCAKind(kind),
      declDate: createMockMoment(decl_date),
      recordDate: createMockOption(record_date),
      targets: createMockTargetIdentities(targets),
      defaultWithholdingTax: createMockPermill(default_withholding_tax),
      withholdingTax: withholding_tax.map(([identityId, tax]) =>
        tuple(createMockIdentityId(identityId), createMockPermill(tax))
      ),
    },
    !corporateAction
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCAId = (
  caId?:
    | PalletCorporateActionsCaId
    | {
        ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
        localId: u32 | Parameters<typeof createMockU32>[0];
      }
): MockCodec<PalletCorporateActionsCaId> => {
  const { ticker, localId } = caId || {
    ticker: createMockTicker(),
    localId: createMockU32(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      localId: createMockU32(localId),
    },
    !caId
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockDistribution = (distribution?: {
  from: PortfolioId | Parameters<typeof createMockPortfolioId>[0];
  currency: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
  perShare: Balance | Parameters<typeof createMockBalance>[0];
  amount: Balance | Parameters<typeof createMockBalance>[0];
  remaining: Balance | Parameters<typeof createMockBalance>[0];
  reclaimed: bool | Parameters<typeof createMockBool>[0];
  paymentAt: Moment | Parameters<typeof createMockMoment>[0];
  expiresAt: Option<Moment>;
}): MockCodec<PalletCorporateActionsDistribution> => {
  const { from, currency, perShare, amount, remaining, reclaimed, paymentAt, expiresAt } =
    distribution || {
      from: createMockPortfolioId(),
      currency: createMockTicker(),
      perShare: createMockBalance(),
      amount: createMockBalance(),
      remaining: createMockBalance(),
      reclaimed: createMockBool(),
      paymentAt: createMockMoment(),
      expiresAt: createMockOption(),
    };

  return createMockCodec(
    {
      from: createMockPortfolioId(from),
      currency: createMockTicker(currency),
      perShare: createMockBalance(perShare),
      amount: createMockBalance(amount),
      remaining: createMockBalance(remaining),
      reclaimed: createMockBool(reclaimed),
      paymentAt: createMockMoment(paymentAt),
      expiresAt: createMockOption(expiresAt),
    },
    !distribution
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockTransferConditionResult = (transferManagerResult?: {
  condition: TransferCondition | Parameters<typeof createMockTransferCondition>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<TransferConditionResult> => {
  const { condition, result } = transferManagerResult || {
    condition: createMockTransferCondition(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      condition: createMockTransferCondition(condition),
      result: createMockBool(result),
    },
    !transferManagerResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockPortfolioValidityResult = (portfolioValidityResult?: {
  receiver_is_same_portfolio: bool | Parameters<typeof createMockBool>[0];
  sender_portfolio_does_not_exist: bool | Parameters<typeof createMockBool>[0];
  receiver_portfolio_does_not_exist: bool | Parameters<typeof createMockBool>[0];
  sender_insufficient_balance: bool | Parameters<typeof createMockBool>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<PortfolioValidityResult> => {
  const {
    receiver_is_same_portfolio,
    sender_portfolio_does_not_exist,
    receiver_portfolio_does_not_exist,
    sender_insufficient_balance,
    result,
  } = portfolioValidityResult || {
    receiver_is_same_portfolio: createMockBool(),
    sender_portfolio_does_not_exist: createMockBool(),
    receiver_portfolio_does_not_exist: createMockBool(),
    sender_insufficient_balance: createMockBool(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      receiver_is_same_portfolio: createMockBool(receiver_is_same_portfolio),
      sender_portfolio_does_not_exist: createMockBool(sender_portfolio_does_not_exist),
      receiver_portfolio_does_not_exist: createMockBool(receiver_portfolio_does_not_exist),
      sender_insufficient_balance: createMockBool(sender_insufficient_balance),
      result: createMockBool(result),
    },
    !portfolioValidityResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockGranularCanTransferResult = (granularCanTransferResult?: {
  invalid_granularity: bool | Parameters<typeof createMockBool>[0];
  self_transfer: bool | Parameters<typeof createMockBool>[0];
  invalid_receiver_cdd: bool | Parameters<typeof createMockBool>[0];
  invalid_sender_cdd: bool | Parameters<typeof createMockBool>[0];
  missing_scope_claim: bool | Parameters<typeof createMockBool>[0];
  receiver_custodian_error: bool | Parameters<typeof createMockBool>[0];
  sender_custodian_error: bool | Parameters<typeof createMockBool>[0];
  sender_insufficient_balance: bool | Parameters<typeof createMockBool>[0];
  portfolio_validity_result:
    | PortfolioValidityResult
    | Parameters<typeof createMockPortfolioValidityResult>[0];
  asset_frozen: bool | Parameters<typeof createMockBool>[0];
  transfer_condition_result: (
    | TransferConditionResult
    | Parameters<typeof createMockTransferConditionResult>[0]
  )[];
  compliance_result: AssetComplianceResult | Parameters<typeof createMockAssetComplianceResult>[0];
  result: bool | Parameters<typeof createMockBool>[0];
}): MockCodec<GranularCanTransferResult> => {
  const {
    invalid_granularity,
    self_transfer,
    invalid_receiver_cdd,
    invalid_sender_cdd,
    missing_scope_claim,
    receiver_custodian_error,
    sender_custodian_error,
    sender_insufficient_balance,
    portfolio_validity_result,
    asset_frozen,
    transfer_condition_result,
    compliance_result,
    result,
  } = granularCanTransferResult || {
    invalid_granularity: createMockBool(),
    self_transfer: createMockBool(),
    invalid_receiver_cdd: createMockBool(),
    invalid_sender_cdd: createMockBool(),
    missing_scope_claim: createMockBool(),
    receiver_custodian_error: createMockBool(),
    sender_custodian_error: createMockBool(),
    sender_insufficient_balance: createMockBool(),
    portfolio_validity_result: createMockPortfolioValidityResult(),
    asset_frozen: createMockBool(),
    transfer_condition_result: [],
    compliance_result: createMockAssetComplianceResult(),
    result: createMockBool(),
  };
  return createMockCodec(
    {
      invalid_granularity: createMockBool(invalid_granularity),
      self_transfer: createMockBool(self_transfer),
      invalid_receiver_cdd: createMockBool(invalid_receiver_cdd),
      invalid_sender_cdd: createMockBool(invalid_sender_cdd),
      missing_scope_claim: createMockBool(missing_scope_claim),
      receiver_custodian_error: createMockBool(receiver_custodian_error),
      sender_custodian_error: createMockBool(sender_custodian_error),
      sender_insufficient_balance: createMockBool(sender_insufficient_balance),
      portfolio_validity_result: createMockPortfolioValidityResult(portfolio_validity_result),
      asset_frozen: createMockBool(asset_frozen),
      transfer_condition_result: transfer_condition_result.map(res =>
        createMockTransferConditionResult(res)
      ),
      compliance_result: createMockAssetComplianceResult(compliance_result as any),
      result: createMockBool(result),
    },
    !granularCanTransferResult
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockClassicTickerRegistration = (
  registration?:
    | PalletAssetClassicTickerRegistration
    | {
        ethOwner: EthereumAddress | Parameters<typeof createMockEthereumAddress>[0];
        isCreated: bool | Parameters<typeof createMockBool>[0];
      }
): MockCodec<PalletAssetClassicTickerRegistration> => {
  const { ethOwner, isCreated } = registration || {
    ethOwner: createMockEthereumAddress(),
    isCreated: createMockBool(),
  };

  return createMockCodec(
    {
      ethOwner: createMockEthereumAddress(ethOwner),
      isCreated: createMockBool(isCreated),
    },
    !registration
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockHeader = (
  header?:
    | Header
    | {
        parentHash: Hash | Parameters<typeof createMockHash>[0];
        number: Compact<u32>;
        stateRoot: Hash | Parameters<typeof createMockHash>[0];
        extrinsicsRoot: Hash | Parameters<typeof createMockHash>[0];
      }
): MockCodec<Header> => {
  const { parentHash, number, stateRoot, extrinsicsRoot } = header || {
    parentHash: createMockHash(),
    number: createMockCompact(),
    stateRoot: createMockHash(),
    extrinsicsRoot: createMockHash(),
  };

  return createMockCodec(
    {
      parentHash: createMockHash(parentHash),
      number: createMockCompact(number.unwrap()),
      stateRoot: createMockHash(stateRoot),
      extrinsicsRoot: createMockHash(extrinsicsRoot),
    },
    !header
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockExtrinsics = (
  extrinsics?:
    | Vec<GenericExtrinsic>
    | {
        toHex: () => string;
      }[]
): MockCodec<Vec<GenericExtrinsic>> => {
  const [{ toHex }] = extrinsics || [
    {
      toHex: () => createMockStringCodec(),
    },
  ];
  return createMockCodec(
    [
      {
        toHex,
      },
    ],
    !extrinsics
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockBlock = (
  block?:
    | Block
    | {
        header: Header | Parameters<typeof createMockHeader>[0];
        extrinsics: Vec<GenericExtrinsic> | Parameters<typeof createMockExtrinsics>[0];
      }
): MockCodec<Block> => {
  const { header, extrinsics } = block || {
    header: createMockHeader(),
    extrinsics: createMockExtrinsics(),
  };

  return createMockCodec(
    {
      header: createMockHeader(header),
      extrinsics: createMockExtrinsics(extrinsics),
    },
    !block
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockSignedBlock = (
  signedBlock?:
    | SignedBlock
    | {
        block: Block | Parameters<typeof createMockBlock>[0];
      }
): MockCodec<SignedBlock> => {
  const { block } = signedBlock || {
    block: createMockBlock(),
  };

  return createMockCodec(
    {
      block: createMockBlock(block),
    },
    !signedBlock
  );
};

/**
 * @hidden
 */
export const createMockBlockHash = (value?: string | BlockHash): MockCodec<BlockHash> => {
  if (isCodec<BlockHash>(value)) {
    return value as MockCodec<BlockHash>;
  }

  return createMockStringCodec(value) as MockCodec<BlockHash>;
};

/**
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockRuntimeDispatchInfo = (
  runtimeDispatchInfo?:
    | RuntimeDispatchInfo
    | {
        partialFee: Balance | Parameters<typeof createMockBalance>[0];
      }
): MockCodec<RuntimeDispatchInfo> => {
  const { partialFee } = runtimeDispatchInfo || {
    partialFee: createMockBalance(),
  };

  return createMockCodec(
    {
      partialFee: createMockBalance(partialFee),
    },
    !runtimeDispatchInfo
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProtocolOp = (
  protocolOp?:
    | 'AssetRegisterTicker'
    | 'AssetIssue'
    | 'AssetAddDocuments'
    | 'AssetCreateAsset'
    | 'CheckpointCreateSchedule'
    | 'ComplianceManagerAddComplianceRequirement'
    | 'IdentityCddRegisterDid'
    | 'IdentityAddClaim'
    | 'IdentityAddSecondaryKeysWithAuthorization'
    | 'PipsPropose'
    | 'ContractsPutCode'
    | 'CorporateBallotAttachBallot'
    | 'CapitalDistributionDistribute'
): MockCodec<MockCodec<ProtocolOp>> => {
  return createMockEnum<ProtocolOp>(protocolOp);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsOpType = (
  op?: PolymeshPrimitivesStatisticsStatOpType | StatType
): MockCodec<PolymeshPrimitivesStatisticsStatOpType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatOpType>(op)) {
    return op as MockCodec<PolymeshPrimitivesStatisticsStatOpType>;
  }

  return createMockCodec(
    {
      type: op,
      isCount: op === StatType.Count,
      isBalance: op === StatType.Balance,
    },
    !op
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsOpTypeToStatType = (
  op?: PolymeshPrimitivesStatisticsStatType | StatType
): MockCodec<PolymeshPrimitivesStatisticsStatType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatType>(op)) {
    return op as MockCodec<PolymeshPrimitivesStatisticsStatType>;
  }

  return createMockCodec(
    {
      op: {
        type: op,
        isCount: op === StatType.Count,
        isBalance: op === StatType.Balance,
      },
    },
    !op
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatisticsStatType = (
  stat?:
    | PolymeshPrimitivesStatisticsStatType
    | {
        op: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer: Option<
          ITuple<[PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId]>
        >;
      }
): MockCodec<PolymeshPrimitivesStatisticsStatType> => {
  if (isCodec<PolymeshPrimitivesStatisticsStatType>(stat)) {
    return stat as MockCodec<PolymeshPrimitivesStatisticsStatType>;
  }

  const { op, claimIssuer } = stat || {
    op: createMockStatisticsOpType(),
    claimIssuer: createMockOption(),
  };

  return createMockCodec(
    {
      op,
      claimIssuer: createMockOption(claimIssuer),
    },
    !op
  );
};

/**
 * @hidden
 *
 */
export const createMock2ndKey = (
  key2?:
    | 'NoClaimStat'
    | { Claim: PolymeshPrimitivesStatisticsStatClaim }
    | PolymeshPrimitivesStatisticsStat2ndKey
): MockCodec<PolymeshPrimitivesStatisticsStat2ndKey> => {
  if (isCodec<PolymeshPrimitivesStatisticsStat2ndKey>(key2)) {
    return key2 as MockCodec<PolymeshPrimitivesStatisticsStat2ndKey>;
  }

  return createMockEnum<PolymeshPrimitivesStatisticsStat2ndKey>(key2);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockStatUpdate = (
  update?:
    | {
        key2: PolymeshPrimitivesStatisticsStat2ndKey | Parameters<typeof createMock2ndKey>[0];
        value: Option<u128>;
      }
    | PolymeshPrimitivesStatisticsStatUpdate
): MockCodec<PolymeshPrimitivesStatisticsStatUpdate> => {
  const { key2, value } = update || {
    key2: createMock2ndKey(),
    value: createMockOption(),
  };

  return createMockCodec(
    {
      key2: createMock2ndKey(key2),
      value: createMockOption(value),
    },
    !update
  );
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockInitiateCorporateActionArgs = (
  caArgs?:
    | PalletCorporateActionsInitiateCorporateActionArgs
    | {
        ticker: PolymeshPrimitivesTicker | Parameters<typeof createMockTicker>[0];
        kind: PalletCorporateActionsCaKind | Parameters<typeof createMockCAKind>[0];
        declDate: u64 | Parameters<typeof createMockU64>[0];
        recordDate: Option<PalletCorporateActionsRecordDateSpec>;
        details: Bytes | Parameters<typeof createMockBytes>[0];
        targets: Option<PalletCorporateActionsTargetIdentities>;
        defaultWithholdingTax: Option<Permill>;
        withholdingTax:
          | [
              PolymeshPrimitivesIdentityId | Parameters<typeof createMockIdentityId>[0],
              Tax | Parameters<typeof createMockPermill>[0]
            ][]
          | null;
      }
): MockCodec<PalletCorporateActionsInitiateCorporateActionArgs> => {
  const {
    ticker,
    kind,
    declDate,
    recordDate,
    details,
    targets,
    defaultWithholdingTax,
    withholdingTax,
  } = caArgs || {
    ticker: createMockTicker(),
    kind: createMockCAKind(),
    declDate: createMockU64(),
    recordDate: createMockOption(),
    details: createMockBytes(),
    targets: createMockOption(),
    defaultWithholdingTax: createMockOption(),
    withholdingTax: createMockOption(),
  };

  return createMockCodec(
    {
      ticker: createMockTicker(ticker),
      kind: createMockCAKind(kind),
      declDate: createMockU64(declDate),
      recordDate: createMockOption(recordDate),
      details: createMockBytes(details),
      targets: createMockOption(targets),
      defaultWithholdingTax: createMockOption(defaultWithholdingTax),
      withholdingTax,
    },
    !caArgs
  );
};

export const createMockStatisticsStatClaim = (
  statClaim:
    | PolymeshPrimitivesStatisticsStatClaim
    | { Accredited: bool }
    | { Affiliate: bool }
    | { Jurisdiction: Option<CountryCode> }
): MockCodec<PolymeshPrimitivesStatisticsStatClaim> => {
  if (statClaim)
    if (isCodec<PolymeshPrimitivesStatisticsStatClaim>(statClaim)) {
      return statClaim as MockCodec<PolymeshPrimitivesStatisticsStatClaim>;
    }
  return createMockEnum<PolymeshPrimitivesStatisticsStatClaim>(statClaim);
};

/**
 * @hidden
 */
export const createMockAssetTransferCompliance = (
  transferCompliance?:
    | {
        paused: bool | Parameters<typeof createMockBool>[0];
        requirements:
          | BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
          | Parameters<typeof createMockBTreeSet>[0];
      }
    | PolymeshPrimitivesTransferComplianceAssetTransferCompliance
): MockCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance> => {
  if (isCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance>(transferCompliance)) {
    return transferCompliance as MockCodec<PolymeshPrimitivesTransferComplianceAssetTransferCompliance>;
  }
  const { paused, requirements } = transferCompliance || {
    paused: dsMockUtils.createMockBool(false),
    requirements: dsMockUtils.createMockBTreeSet([]),
  };

  const args = { paused: createMockBool(paused), requirements: createMockBTreeSet(requirements) };

  return createMockCodec(args, !transferCompliance);
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockCall = (callArgs?: {
  args: unknown[];
  method: string;
  section: string;
}): MockCodec<Call> => {
  const { args, method, section } = callArgs || {
    args: [],
    method: '',
    section: '',
  };

  return createMockCodec(
    {
      args: createMockCodec(args, false),
      method,
      section,
    },
    !callArgs
  ) as MockCodec<Call>;
};

/**
 * @hidden
 * NOTE: `isEmpty` will be set to true if no value is passed
 */
export const createMockProposalDetails = (proposalDetails?: {
  approvals: u64 | Parameters<typeof createMockU64>[0];
  rejections: u64 | Parameters<typeof createMockU64>[0];
  status: ProposalStatus | Parameters<typeof createMockProposalStatus>[0];
  autoClose: bool | Parameters<typeof createMockBool>[0];
  expiry: Option<Moment> | null;
}): ProposalDetails => {
  const { approvals, rejections, status, autoClose, expiry } = proposalDetails || {
    approvals: createMockU64(),
    rejections: createMockU64(),
    status: createMockProposalStatus(),
    autoClose: createMockBool(),
    expiry: createMockOption(),
  };
  return createMockCodec(
    {
      approvals,
      rejections,
      status,
      expiry,
      autoClose,
    },
    !proposalDetails
  ) as MockCodec<ProposalDetails>;
};
