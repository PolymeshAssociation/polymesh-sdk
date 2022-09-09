/* istanbul ignore file */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import BigNumber from 'bignumber.js';
import { pick } from 'lodash';
import sinon from 'sinon';

import {
  Account,
  Asset,
  AuthorizationRequest,
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  CustomPermissionGroup,
  DefaultPortfolio,
  DividendDistribution,
  Identity,
  Instruction,
  KnownPermissionGroup,
  MultiSig,
  MultiSigProposal,
  NumberedPortfolio,
  Offering,
  Subsidy,
  TickerReservation,
  Venue,
} from '~/internal';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  ActiveTransferRestrictions,
  AgentWithGroup,
  AssetDetails,
  AssetWithGroup,
  Authorization,
  AuthorizationType,
  CalendarPeriod,
  CalendarUnit,
  CheckPermissionsResult,
  CheckRolesResult,
  ComplianceRequirements,
  CorporateActionDefaultConfig,
  CorporateActionKind,
  CorporateActionTargets,
  CountTransferRestriction,
  DistributionParticipant,
  DividendDistributionDetails,
  ExtrinsicData,
  GroupPermissions,
  IdentityBalance,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  KnownAssetType,
  Leg,
  MultiSigProposalDetails,
  OfferingBalanceStatus,
  OfferingDetails,
  OfferingSaleStatus,
  OfferingTimingStatus,
  PercentageTransferRestriction,
  PermissionedAccount,
  PermissionGroups,
  PermissionGroupType,
  PortfolioBalance,
  ProposalStatus,
  ResultSet,
  ScheduleDetails,
  ScheduleWithDetails,
  SecurityIdentifier,
  Signer,
  SignerType,
  TargetTreatment,
  TaxWithholding,
  TickerReservationDetails,
  TickerReservationStatus,
  TransferStatus,
  VenueDetails,
  VenueType,
} from '~/types';

export type MockIdentity = Mocked<Identity>;
export type MockAccount = Mocked<Account>;
export type MockSubsidy = Mocked<Subsidy>;
export type MockTickerReservation = Mocked<TickerReservation>;
export type MockAsset = Mocked<Asset>;
export type MockAuthorizationRequest = Mocked<AuthorizationRequest>;
export type MockVenue = Mocked<Venue>;
export type MockInstruction = Mocked<Instruction>;
export type MockNumberedPortfolio = Mocked<NumberedPortfolio>;
export type MockDefaultPortfolio = Mocked<DefaultPortfolio>;
export type MockOffering = Mocked<Offering>;
export type MockCheckpoint = Mocked<Checkpoint>;
export type MockCheckpointSchedule = Mocked<CheckpointSchedule>;
export type MockCorporateAction = Mocked<CorporateAction>;
export type MockDividendDistribution = Mocked<DividendDistribution>;
export type MockCustomPermissionGroup = Mocked<CustomPermissionGroup>;
export type MockKnownPermissionGroup = Mocked<KnownPermissionGroup>;
export type MockMultiSig = Mocked<MultiSig>;
export type MockMultiSigProposal = Mocked<MultiSigProposal>;

interface EntityOptions {
  exists?: boolean;
  isEqual?: boolean;
  toHuman?: any;
}

type EntityGetter<Result> = Partial<Result> | ((...args: any) => any) | sinon.SinonStub;

interface IdentityOptions extends EntityOptions {
  did?: string;
  hasRoles?: EntityGetter<boolean>;
  hasRole?: EntityGetter<boolean>;
  checkRoles?: EntityGetter<CheckRolesResult>;
  assetPermissionsHasPermissions?: EntityGetter<boolean>;
  assetPermissionsCheckPermissions?: EntityGetter<CheckPermissionsResult<SignerType.Identity>>;
  hasValidCdd?: EntityGetter<boolean>;
  isCddProvider?: EntityGetter<boolean>;
  getPrimaryAccount?: EntityGetter<PermissionedAccount>;
  authorizationsGetReceived?: EntityGetter<AuthorizationRequest[]>;
  authorizationsGetSent?: EntityGetter<ResultSet<AuthorizationRequest>>;
  authorizationsGetOne?: EntityGetter<AuthorizationRequest>;
  getVenues?: EntityGetter<Venue[]>;
  getScopeId?: EntityGetter<string | null>;
  getAssetBalance?: EntityGetter<BigNumber>;
  getSecondaryAccounts?: EntityGetter<ResultSet<PermissionedAccount>>;
  areSecondaryAccountsFrozen?: EntityGetter<boolean>;
  assetPermissionsGetGroup?: EntityGetter<CustomPermissionGroup | KnownPermissionGroup>;
  assetPermissionsGet?: EntityGetter<AssetWithGroup[]>;
}

interface TickerReservationOptions extends EntityOptions {
  ticker?: string;
  details?: EntityGetter<TickerReservationDetails>;
}

interface AssetOptions extends EntityOptions {
  ticker?: string;
  did?: string;
  details?: EntityGetter<AssetDetails>;
  currentFundingRound?: EntityGetter<string>;
  isFrozen?: EntityGetter<boolean>;
  transfersCanTransfer?: EntityGetter<TransferStatus>;
  getIdentifiers?: EntityGetter<SecurityIdentifier[]>;
  transferRestrictionsCountGet?: EntityGetter<ActiveTransferRestrictions<CountTransferRestriction>>;
  transferRestrictionsPercentageGet?: EntityGetter<
    ActiveTransferRestrictions<PercentageTransferRestriction>
  >;
  transferRestrictionsClaimCountGet?: EntityGetter<
    ActiveTransferRestrictions<CountTransferRestriction>
  >;
  transferRestrictionsClaimPercentageGet?: EntityGetter<
    ActiveTransferRestrictions<PercentageTransferRestriction>
  >;
  corporateActionsGetAgents?: EntityGetter<Identity[]>;
  corporateActionsGetDefaultConfig?: EntityGetter<CorporateActionDefaultConfig>;
  permissionsGetAgents?: EntityGetter<AgentWithGroup[]>;
  permissionsGetGroups?: EntityGetter<PermissionGroups>;
  complianceRequirementsGet?: EntityGetter<ComplianceRequirements>;
  checkpointsGetOne?: EntityGetter<Checkpoint>;
  checkpointsSchedulesGetOne?: EntityGetter<ScheduleWithDetails>;
  investorCount?: EntityGetter<BigNumber>;
}

interface AuthorizationRequestOptions extends EntityOptions {
  authId?: BigNumber;
  target?: Signer;
  issuer?: Identity;
  expiry?: Date | null;
  data?: Authorization;
  isExpired?: EntityGetter<boolean>;
}

interface AccountOptions extends EntityOptions {
  address?: string;
  key?: string;
  isFrozen?: EntityGetter<boolean>;
  getBalance?: EntityGetter<AccountBalance>;
  getIdentity?: EntityGetter<Identity | null>;
  getTransactionHistory?: EntityGetter<ExtrinsicData[]>;
  hasPermissions?: EntityGetter<boolean>;
  checkPermissions?: EntityGetter<CheckPermissionsResult<SignerType.Account>>;
}

interface SubsidyOptions extends EntityOptions {
  beneficiary?: string;
  subsidizer?: string;
  getAllowance?: EntityGetter<BigNumber>;
}

interface VenueOptions extends EntityOptions {
  id?: BigNumber;
  details?: EntityGetter<VenueDetails>;
}

interface NumberedPortfolioOptions extends EntityOptions {
  did?: string;
  id?: BigNumber;
  isOwnedBy?: EntityGetter<boolean>;
  getAssetBalances?: EntityGetter<PortfolioBalance[]>;
  getCustodian?: EntityGetter<Identity>;
  isCustodiedBy?: EntityGetter<boolean>;
}

interface DefaultPortfolioOptions extends EntityOptions {
  did?: string;
  isOwnedBy?: EntityGetter<boolean>;
  getAssetBalances?: EntityGetter<PortfolioBalance[]>;
  getCustodian?: EntityGetter<Identity>;
  isCustodiedBy?: EntityGetter<boolean>;
}

interface CustomPermissionGroupOptions extends EntityOptions {
  ticker?: string;
  id?: BigNumber;
  getPermissions?: EntityGetter<GroupPermissions>;
}

interface KnownPermissionGroupOptions extends EntityOptions {
  ticker?: string;
  type?: PermissionGroupType;
  getPermissions?: EntityGetter<GroupPermissions>;
}

interface InstructionOptions extends EntityOptions {
  id?: BigNumber;
  details?: EntityGetter<InstructionDetails>;
  getLegs?: EntityGetter<ResultSet<Leg>>;
  isPending?: EntityGetter<boolean>;
}

interface OfferingOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  details?: EntityGetter<OfferingDetails>;
}

interface CheckpointOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  createdAt?: EntityGetter<Date>;
  totalSupply?: EntityGetter<BigNumber>;
  allBalances?: EntityGetter<ResultSet<IdentityBalance>>;
  balance?: EntityGetter<BigNumber>;
}

interface CheckpointScheduleOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  start?: Date;
  period?: CalendarPeriod | null;
  expiryDate?: Date | null;
  complexity?: BigNumber;
  details?: EntityGetter<ScheduleDetails>;
}

interface CorporateActionOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  kind?: CorporateActionKind;
  declarationDate?: Date;
  description?: string;
  targets?: CorporateActionTargets;
  defaultTaxWithholding?: BigNumber;
  taxWithholdings?: TaxWithholding[];
}

interface DividendDistributionOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  kind?: CorporateActionKind.PredictableBenefit | CorporateActionKind.UnpredictableBenefit;
  declarationDate?: Date;
  description?: string;
  targets?: CorporateActionTargets;
  defaultTaxWithholding?: BigNumber;
  taxWithholdings?: TaxWithholding[];
  origin?: DefaultPortfolio | NumberedPortfolio;
  currency?: string;
  perShare?: BigNumber;
  maxAmount?: BigNumber;
  expiryDate?: null | Date;
  paymentDate?: Date;
  checkpoint?: EntityGetter<Checkpoint | CheckpointSchedule>;
  details?: EntityGetter<DividendDistributionDetails>;
  getParticipant?: EntityGetter<DistributionParticipant | null>;
}

interface MultiSigOptions extends EntityOptions {
  address?: string;
}
interface MultiSigProposalOptions extends EntityOptions {
  id?: BigNumber;
  multiSig?: MultiSig;
  details?: EntityGetter<MultiSigProposalDetails>;
}

type MockOptions = {
  identityOptions?: IdentityOptions;
  accountOptions?: AccountOptions;
  subsidyOptions?: SubsidyOptions;
  tickerReservationOptions?: TickerReservationOptions;
  assetOptions?: AssetOptions;
  authorizationRequestOptions?: AuthorizationRequestOptions;
  venueOptions?: VenueOptions;
  instructionOptions?: InstructionOptions;
  numberedPortfolioOptions?: NumberedPortfolioOptions;
  defaultPortfolioOptions?: DefaultPortfolioOptions;
  offeringOptions?: OfferingOptions;
  checkpointOptions?: CheckpointOptions;
  checkpointScheduleOptions?: CheckpointScheduleOptions;
  corporateActionOptions?: CorporateActionOptions;
  dividendDistributionOptions?: DividendDistributionOptions;
  customPermissionGroupOptions?: CustomPermissionGroupOptions;
  knownPermissionGroupOptions?: KnownPermissionGroupOptions;
  multiSigOptions?: MultiSigOptions;
  multiSigProposalOptions?: MultiSigProposalOptions;
};

type Class<T = any> = new (...args: any[]) => T;
type Configurable<Options> = {
  configure(opts: Required<Options>): void;
  argsToOpts?(...args: any[]): Partial<Options>;
};

/* eslint-disable @typescript-eslint/ban-types */
/**
 * @hidden
 */
function extractFromArgs<ArgsType extends object[], Props extends keyof ArgsType[0]>(
  args: ArgsType,
  properties: Props[]
): Pick<ArgsType[0], Props> | Record<string, never> {
  if (args.length) {
    return pick<ArgsType[0], Props>(args[0], properties);
  }

  return {};
}
/* eslint-enable @typescript-eslint/ban-types */

/**
 * @hidden
 *
 * @param prototypeChain - inheritance chain of the entity, from broad to specific.
 *   For example, if creating a mock for class A, where A extends B, B extends C and C extends Entity,
 *   the prototypeChain would be [C, B, A]
 */
function createMockEntityClass<Options extends EntityOptions>(
  Class: Class<Configurable<Options>>,
  defaultOptions: () => Required<Omit<Options, keyof EntityOptions>> & EntityOptions,
  prototypeChain: string[]
) {
  const initialOptions = (options?: Partial<Options>) =>
    ({
      isEqual: true,
      exists: true,
      toHuman: 'DEFAULT_JSON_STRING_PLEASE_OVERRIDE',
      ...defaultOptions(),
      ...options,
    } as Required<Options>);
  return class MockClass extends Class {
    isEqual = sinon.stub();
    exists = sinon.stub();
    toHuman = sinon.stub();

    private static constructorStub = sinon.stub();

    private static options = {} as Required<Options>;

    public static isMockEntity = true;

    /**
     * @hidden
     */
    private static mergeOptions(options?: Partial<Options>) {
      return { ...this.options, ...options };
    }

    /**
     * @hidden
     */
    public static init(opts?: Partial<Options>) {
      const entities = require('~/internal');
      const classProto = Class.prototype;

      prototypeChain.forEach((className, index) => {
        const entity = entities[className];

        /*
         * NOTE @monitz87: This is the only way I managed to spoof "instanceof"
         *  without breaking everything else:
         *
         * - If the Entity in question isn't being mocked as an import (entity.isMockEntity === false),
         *   then we only have to set its prototype as the new Class's prototype and the entire chain is
         *   reproduced
         * - Otherwise, we only need to append the previous classes in the chain, since the mocked class is already an
         *   instance of itself, and trying to set it as its own prototype results in an error
         *
         */
        if (entity.isMockEntity) {
          if (index === 0) {
            Object.setPrototypeOf(classProto, entities.Entity.prototype);
          } else {
            Object.setPrototypeOf(classProto, entities[prototypeChain[index - 1]].prototype);
          }
        } else if (index === prototypeChain.length - 1) {
          Object.setPrototypeOf(classProto, entity.prototype);
        }
      });

      this.options = initialOptions(opts);
    }

    /**
     * @hidden
     */
    public static setOptions(options?: Partial<Options>) {
      this.options = this.mergeOptions(options);
    }

    /**
     * @hidden
     */
    public static resetOptions() {
      this.options = initialOptions();
    }

    /**
     * @hidden
     */
    public static getConstructorStub() {
      return this.constructorStub;
    }

    /**
     * @hidden
     */
    public override configure(opts: Partial<Options>) {
      const fullOpts = MockClass.mergeOptions(opts);

      super.configure(fullOpts);

      this.exists.returns(fullOpts.exists);
      this.isEqual.returns(fullOpts.isEqual);
      this.toHuman.returns(fullOpts.toHuman);
    }

    /**
     * @hidden
     */
    public constructor(...args: any[]) {
      super(...args);

      let opts: Partial<Options> = {};

      if (this.argsToOpts) {
        opts = this.argsToOpts(...args);
      }

      MockClass.constructorStub(...args);

      this.configure(opts);
    }
  };
}

/**
 * Make an entity getter stub that returns a value or calls a specific function
 */
function createEntityGetterStub<Result>(args: EntityGetter<Result>, isAsync = true) {
  if (typeof args === 'function' && 'withArgs' in args) {
    return args;
  }

  const newStub = sinon.stub();

  if (typeof args === 'function') {
    newStub.callsFake(args as (...fnArgs: any[]) => any);
  } else if (isAsync) {
    newStub.resolves(args);
  } else {
    newStub.returns(args);
  }

  return newStub;
}

const MockIdentityClass = createMockEntityClass<IdentityOptions>(
  class {
    uuid!: string;
    did!: string;
    hasRoles!: sinon.SinonStub;
    checkRoles!: sinon.SinonStub;
    hasRole!: sinon.SinonStub;
    hasValidCdd!: sinon.SinonStub;
    getPrimaryAccount!: sinon.SinonStub;
    portfolios = {};
    authorizations = {} as {
      getReceived: sinon.SinonStub;
      getSent: sinon.SinonStub;
      getOne: sinon.SinonStub;
    };

    assetPermissions = {} as {
      get: sinon.SinonStub;
      getGroup: sinon.SinonStub;
      hasPermissions: sinon.SinonStub;
      checkPermissions: sinon.SinonStub;
    };

    getVenues!: sinon.SinonStub;
    getScopeId!: sinon.SinonStub;
    getAssetBalance!: sinon.SinonStub;
    getSecondaryAccounts!: sinon.SinonStub;
    areSecondaryAccountsFrozen!: sinon.SinonStub;
    isCddProvider!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Identity>) {
      return extractFromArgs(args, ['did']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<IdentityOptions>) {
      this.uuid = 'identity';
      this.did = opts.did;
      this.hasRoles = createEntityGetterStub(opts.hasRoles);
      this.checkRoles = createEntityGetterStub(opts.checkRoles);
      this.hasRole = createEntityGetterStub(opts.hasRole);
      this.hasValidCdd = createEntityGetterStub(opts.hasValidCdd);
      this.getPrimaryAccount = createEntityGetterStub(opts.getPrimaryAccount);
      this.authorizations.getReceived = createEntityGetterStub(opts.authorizationsGetReceived);
      this.authorizations.getSent = createEntityGetterStub(opts.authorizationsGetSent);
      this.authorizations.getOne = createEntityGetterStub(opts.authorizationsGetOne);
      this.assetPermissions.get = createEntityGetterStub(opts.assetPermissionsGet);
      this.assetPermissions.getGroup = createEntityGetterStub(opts.assetPermissionsGetGroup);
      this.assetPermissions.hasPermissions = createEntityGetterStub(
        opts.assetPermissionsHasPermissions
      );
      this.assetPermissions.checkPermissions = createEntityGetterStub(
        opts.assetPermissionsCheckPermissions
      );
      this.getVenues = createEntityGetterStub(opts.getVenues);
      this.getScopeId = createEntityGetterStub(opts.getScopeId);
      this.getAssetBalance = createEntityGetterStub(opts.getAssetBalance);
      this.getSecondaryAccounts = createEntityGetterStub(opts.getSecondaryAccounts);
      this.areSecondaryAccountsFrozen = createEntityGetterStub(opts.areSecondaryAccountsFrozen);
      this.isCddProvider = createEntityGetterStub(opts.isCddProvider);
    }
  },
  () => ({
    did: 'someDid',
    hasValidCdd: true,
    isCddProvider: false,
    authorizationsGetReceived: [],
    authorizationsGetSent: { data: [], next: null, count: new BigNumber(0) },
    authorizationsGetOne: getAuthorizationRequestInstance(),
    getVenues: [],
    getScopeId: 'someScopeId',
    getAssetBalance: new BigNumber(100),
    getSecondaryAccounts: { data: [], next: null },
    areSecondaryAccountsFrozen: false,
    getPrimaryAccount: {
      account: getAccountInstance(),
      permissions: {
        assets: null,
        portfolios: null,
        transactions: null,
        transactionGroups: [],
      },
    },
    assetPermissionsGet: [],
    assetPermissionsGetGroup: getKnownPermissionGroupInstance(),
    assetPermissionsCheckPermissions: {
      result: true,
    },
    assetPermissionsHasPermissions: true,
    hasRole: true,
    hasRoles: true,
    checkRoles: {
      result: true,
    },
    toHuman: 'someDid',
  }),
  ['Identity']
);

const MockAccountClass = createMockEntityClass<AccountOptions>(
  class {
    uuid!: string;
    address!: string;
    key!: string;
    isFrozen!: sinon.SinonStub;
    getBalance!: sinon.SinonStub;
    getIdentity!: sinon.SinonStub;
    getTransactionHistory!: sinon.SinonStub;
    hasPermissions!: sinon.SinonStub;
    checkPermissions!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Account>) {
      return extractFromArgs(args, ['address']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<AccountOptions>) {
      this.uuid = 'account';
      this.address = opts.address;
      this.key = opts.key;
      this.isFrozen = createEntityGetterStub(opts.isFrozen);
      this.getBalance = createEntityGetterStub(opts.getBalance);
      this.getIdentity = createEntityGetterStub(opts.getIdentity);
      this.getTransactionHistory = createEntityGetterStub(opts.getTransactionHistory);
      this.hasPermissions = createEntityGetterStub(opts.hasPermissions);
      this.checkPermissions = createEntityGetterStub(opts.checkPermissions);
    }
  },
  () => ({
    address: 'someAddress',
    key: 'someKey',
    getBalance: {
      free: new BigNumber(100),
      locked: new BigNumber(10),
      total: new BigNumber(110),
    },
    getTransactionHistory: [],
    getIdentity: getIdentityInstance(),
    isFrozen: false,
    hasPermissions: true,
    checkPermissions: {
      result: true,
    },
  }),
  ['Account']
);

const MockSubsidyClass = createMockEntityClass<SubsidyOptions>(
  class {
    uuid!: string;
    beneficiary!: Account;
    subsidizer!: Account;
    getAllowance!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Subsidy>) {
      return extractFromArgs(args, ['beneficiary', 'subsidizer']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<SubsidyOptions>) {
      this.uuid = 'subsidy';
      this.beneficiary = getAccountInstance({ address: opts.beneficiary });
      this.subsidizer = getAccountInstance({ address: opts.subsidizer });
      this.getAllowance = createEntityGetterStub(opts.getAllowance);
    }
  },
  () => ({
    beneficiary: 'beneficiary',
    subsidizer: 'subsidizer',
    getAllowance: new BigNumber(100),
    toHuman: {
      beneficiary: 'beneficiary',
      subsidizer: 'subsidizer',
    },
  }),
  ['Subsidy']
);

const MockTickerReservationClass = createMockEntityClass<TickerReservationOptions>(
  class {
    uuid!: string;
    ticker!: string;
    details!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof TickerReservation>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<TickerReservationOptions>) {
      this.uuid = 'tickerReservation';
      this.ticker = opts.ticker;
      this.details = createEntityGetterStub(opts.details);
    }
  },
  () => ({
    ticker: 'SOME_TICKER',
    details: {
      owner: getIdentityInstance(),
      expiryDate: new Date(),
      status: TickerReservationStatus.Reserved,
    },
  }),
  ['TickerReservation']
);

const MockAssetClass = createMockEntityClass<AssetOptions>(
  class {
    uuid!: string;
    ticker!: string;
    did!: string;
    details!: sinon.SinonStub;
    currentFundingRound!: sinon.SinonStub;
    isFrozen!: sinon.SinonStub;
    transfers = {} as {
      canTransfer: sinon.SinonStub;
    };

    getIdentifiers!: sinon.SinonStub;
    transferRestrictions = {
      count: {},
      percentage: {},
      claimCount: {},
      claimPercentage: {},
    } as {
      count: {
        get: sinon.SinonStub;
      };
      percentage: {
        get: sinon.SinonStub;
      };
      claimCount: {
        get: sinon.SinonStub;
      };
      claimPercentage: {
        get: sinon.SinonStub;
      };
    };

    corporateActions = {} as {
      getAgents: sinon.SinonStub;
      getDefaultConfig: sinon.SinonStub;
    };

    permissions = {} as {
      getGroups: sinon.SinonStub;
      getAgents: sinon.SinonStub;
    };

    compliance = {
      requirements: {},
    } as {
      requirements: {
        get: sinon.SinonStub;
      };
    };

    checkpoints = {
      schedules: {},
    } as {
      schedules: {
        getOne: sinon.SinonStub;
      };
      getOne: sinon.SinonStub;
    };

    investorCount!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Asset>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<AssetOptions>) {
      this.uuid = 'asset';
      this.ticker = opts.ticker;
      this.details = createEntityGetterStub(opts.details);
      this.currentFundingRound = createEntityGetterStub(opts.currentFundingRound);
      this.isFrozen = createEntityGetterStub(opts.isFrozen);
      this.transfers.canTransfer = createEntityGetterStub(opts.transfersCanTransfer);
      this.getIdentifiers = createEntityGetterStub(opts.getIdentifiers);
      this.transferRestrictions.count.get = createEntityGetterStub(
        opts.transferRestrictionsCountGet
      );
      this.transferRestrictions.percentage.get = createEntityGetterStub(
        opts.transferRestrictionsPercentageGet
      );
      this.transferRestrictions.claimCount.get = createEntityGetterStub(
        opts.transferRestrictionsClaimCountGet
      );
      this.transferRestrictions.claimPercentage.get = createEntityGetterStub(
        opts.transferRestrictionsClaimPercentageGet
      );
      this.corporateActions.getAgents = createEntityGetterStub(opts.corporateActionsGetAgents);
      this.corporateActions.getDefaultConfig = createEntityGetterStub(
        opts.corporateActionsGetDefaultConfig
      );
      this.permissions.getGroups = createEntityGetterStub(opts.permissionsGetGroups);
      this.permissions.getAgents = createEntityGetterStub(opts.permissionsGetAgents);
      this.compliance.requirements.get = createEntityGetterStub(opts.complianceRequirementsGet);
      this.checkpoints.schedules.getOne = createEntityGetterStub(opts.checkpointsSchedulesGetOne);
      this.checkpoints.getOne = createEntityGetterStub(opts.checkpointsGetOne);
      this.investorCount = createEntityGetterStub(opts.investorCount);
    }
  },
  () => ({
    ticker: 'SOME_TICKER',
    did: 'assetDid',
    details: {
      owner: getIdentityInstance(),
      name: 'ASSET_NAME',
      totalSupply: new BigNumber(1000000),
      isDivisible: false,
      primaryIssuanceAgents: [],
      fullAgents: [],
      assetType: KnownAssetType.EquityCommon,
      requiresInvestorUniqueness: false,
    },
    currentFundingRound: 'Series A',
    isFrozen: false,
    transfersCanTransfer: TransferStatus.Success,
    getIdentifiers: [],
    transferRestrictionsCountGet: {
      restrictions: [],
      availableSlots: new BigNumber(3),
    },
    transferRestrictionsPercentageGet: {
      restrictions: [],
      availableSlots: new BigNumber(3),
    },
    transferRestrictionsClaimCountGet: {
      restrictions: [],
      availableSlots: new BigNumber(3),
    },
    transferRestrictionsClaimPercentageGet: {
      restrictions: [],
      availableSlots: new BigNumber(3),
    },
    corporateActionsGetAgents: [],
    corporateActionsGetDefaultConfig: {
      targets: { identities: [], treatment: TargetTreatment.Exclude },
      defaultTaxWithholding: new BigNumber(10),
      taxWithholdings: [],
    },
    permissionsGetAgents: [],
    permissionsGetGroups: {
      known: [],
      custom: [],
    },
    complianceRequirementsGet: {
      requirements: [],
      defaultTrustedClaimIssuers: [],
    },
    checkpointsGetOne: getCheckpointInstance(),
    checkpointsSchedulesGetOne: {
      schedule: getCheckpointScheduleInstance(),
      details: {
        remainingCheckpoints: new BigNumber(3),
        nextCheckpointDate: new Date(new Date().getTime() + 1000 * 60 * 60),
      },
    },
    toHuman: 'SOME_TICKER',
    investorCount: new BigNumber(0),
  }),
  ['Asset']
);

const MockAuthorizationRequestClass = createMockEntityClass<AuthorizationRequestOptions>(
  class {
    uuid!: string;
    authId!: BigNumber;
    issuer!: Identity;
    target!: Signer;
    expiry!: Date | null;
    data!: Authorization;
    isExpired!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof AuthorizationRequest>) {
      return extractFromArgs(args, ['authId', 'target', 'issuer', 'expiry', 'data']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<AuthorizationRequestOptions>) {
      this.uuid = 'authorizationRequest';
      this.authId = opts.authId;
      this.issuer = opts.issuer;
      this.target = opts.target;
      this.expiry = opts.expiry;
      this.data = opts.data;
      this.isExpired = createEntityGetterStub(opts.isExpired, false);
    }
  },
  () => ({
    authId: new BigNumber(1),
    isExpired: false,
    target: getIdentityInstance({ did: 'targetDid' }),
    issuer: getIdentityInstance({ did: 'issuerDid' }),
    data: { type: AuthorizationType.TransferAssetOwnership, value: 'UNWANTED_TOKEN' },
    expiry: null,
  }),
  ['AuthorizationRequest']
);

const MockVenueClass = createMockEntityClass<VenueOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    details!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Venue>) {
      return extractFromArgs(args, ['id']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<VenueOptions>) {
      this.uuid = 'venue';
      this.id = opts.id;
      this.details = createEntityGetterStub(opts.details);
    }
  },
  () => ({
    id: new BigNumber(1),
    details: {
      owner: getIdentityInstance(),
      type: VenueType.Distribution,
      description: 'someDescription',
    },
  }),
  ['Venue']
);

const MockInstructionClass = createMockEntityClass<InstructionOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    details!: sinon.SinonStub;
    getLegs!: sinon.SinonStub;
    isPending!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Instruction>) {
      return extractFromArgs(args, ['id']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<InstructionOptions>) {
      this.uuid = 'instruction';
      this.id = opts.id;
      this.details = createEntityGetterStub(opts.details);
      this.getLegs = createEntityGetterStub(opts.getLegs);
      this.isPending = createEntityGetterStub(opts.isPending);
    }
  },
  () => ({
    id: new BigNumber(1),
    details: {
      status: InstructionStatus.Pending,
      createdAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      tradeDate: null,
      valueDate: null,
      venue: getVenueInstance(),
      type: InstructionType.SettleOnAffirmation,
    },
    getLegs: {
      data: [
        {
          from: getNumberedPortfolioInstance({ did: 'someDid', id: new BigNumber(1) }),
          to: getNumberedPortfolioInstance({ did: 'otherDid', id: new BigNumber(1) }),
          asset: getAssetInstance(),
          amount: new BigNumber(100),
        },
      ],
      next: null,
    },
    isPending: false,
  }),
  ['Instruction']
);

const MockNumberedPortfolioClass = createMockEntityClass<NumberedPortfolioOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    owner!: Identity;
    isOwnedBy!: sinon.SinonStub;
    getAssetBalances!: sinon.SinonStub;
    getCustodian!: sinon.SinonStub;
    isCustodiedBy!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof NumberedPortfolio>) {
      return extractFromArgs(args, ['id', 'did']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<NumberedPortfolioOptions>) {
      this.uuid = 'numberedPortfolio';
      this.id = opts.id;
      this.owner = getIdentityInstance({ did: opts.did });
      this.isOwnedBy = createEntityGetterStub(opts.isOwnedBy);
      this.getAssetBalances = createEntityGetterStub(opts.getAssetBalances);
      this.getCustodian = createEntityGetterStub(opts.getCustodian);
      this.isCustodiedBy = createEntityGetterStub(opts.isCustodiedBy);
    }
  },
  () => ({
    id: new BigNumber(1),
    isOwnedBy: true,
    getAssetBalances: [
      {
        asset: getAssetInstance(),
        total: new BigNumber(1),
        locked: new BigNumber(0),
        free: new BigNumber(1),
      },
    ],
    did: 'someDid',
    getCustodian: getIdentityInstance(),
    isCustodiedBy: true,
    toHuman: {
      did: 'someDid',
      id: '1',
    },
  }),
  ['Portfolio', 'NumberedPortfolio']
);

const MockDefaultPortfolioClass = createMockEntityClass<DefaultPortfolioOptions>(
  class {
    uuid!: string;
    owner!: Identity;
    isOwnedBy!: sinon.SinonStub;
    getAssetBalances!: sinon.SinonStub;
    getCustodian!: sinon.SinonStub;
    isCustodiedBy!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof DefaultPortfolio>) {
      return extractFromArgs(args, ['did']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<DefaultPortfolioOptions>) {
      this.uuid = 'defaultPortfolio';
      this.owner = getIdentityInstance({ did: opts.did });
      this.isOwnedBy = createEntityGetterStub(opts.isOwnedBy);
      this.getAssetBalances = createEntityGetterStub(opts.getAssetBalances);
      this.getCustodian = createEntityGetterStub(opts.getCustodian);
      this.isCustodiedBy = createEntityGetterStub(opts.isCustodiedBy);
    }
  },
  () => ({
    isOwnedBy: true,
    getAssetBalances: [
      {
        asset: getAssetInstance(),
        total: new BigNumber(1),
        locked: new BigNumber(0),
        free: new BigNumber(1),
      },
    ],
    did: 'someDid',
    getCustodian: getIdentityInstance(),
    isCustodiedBy: true,
    toHuman: {
      did: 'someDid',
    },
  }),
  ['Portfolio', 'DefaultPortfolio']
);

const MockOfferingClass = createMockEntityClass<OfferingOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    details!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Offering>) {
      return extractFromArgs(args, ['id', 'ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<OfferingOptions>) {
      this.uuid = 'sto';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.details = createEntityGetterStub(opts.details);
    }
  },
  () => ({
    details: {
      creator: getIdentityInstance(),
      venue: getVenueInstance(),
      name: 'MyOffering',
      offeringPortfolio: getNumberedPortfolioInstance({ did: 'offeringDid', id: new BigNumber(1) }),
      raisingPortfolio: getNumberedPortfolioInstance({ did: 'offeringDid', id: new BigNumber(2) }),
      end: null,
      start: new Date('10/14/1987'),
      status: {
        timing: OfferingTimingStatus.Started,
        balance: OfferingBalanceStatus.Available,
        sale: OfferingSaleStatus.Live,
      },
      tiers: [
        {
          price: new BigNumber(100000000),
          remaining: new BigNumber(700000000),
          amount: new BigNumber(1000000000),
        },
      ],
      totalAmount: new BigNumber(1000000000),
      totalRemaining: new BigNumber(700000000),
      raisingCurrency: 'USD',
      minInvestment: new BigNumber(100000000),
    },
    ticker: 'SOME_TICKER',
    id: new BigNumber(1),
  }),
  ['Offering']
);

const MockCheckpointClass = createMockEntityClass<CheckpointOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    createdAt!: sinon.SinonStub;
    totalSupply!: sinon.SinonStub;
    allBalances!: sinon.SinonStub;
    balance!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Checkpoint>) {
      return extractFromArgs(args, ['id', 'ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<CheckpointOptions>) {
      this.uuid = 'checkpoint';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.createdAt = createEntityGetterStub(opts.createdAt);
      this.totalSupply = createEntityGetterStub(opts.totalSupply);
      this.allBalances = createEntityGetterStub(opts.allBalances);
      this.balance = createEntityGetterStub(opts.balance);
    }
  },
  () => ({
    totalSupply: new BigNumber(10000),
    createdAt: new Date('10/14/1987'),
    ticker: 'SOME_TICKER',
    id: new BigNumber(1),
    balance: new BigNumber(1000),
    allBalances: {
      data: [
        {
          identity: getIdentityInstance(),
          balance: new BigNumber(1000),
        },
      ],
      next: null,
    },
  }),
  ['Checkpoint']
);

const MockCheckpointScheduleClass = createMockEntityClass<CheckpointScheduleOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    start!: Date;
    period!: CalendarPeriod | null;
    expiryDate!: Date | null;
    complexity!: BigNumber;
    details!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof CheckpointSchedule>) {
      return extractFromArgs(args, ['id', 'ticker', 'start', 'period']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<CheckpointScheduleOptions>) {
      this.uuid = 'checkpointSchedule';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.start = opts.start;
      this.period = opts.period;
      this.expiryDate = opts.expiryDate;
      this.complexity = opts.complexity;
      this.details = createEntityGetterStub(opts.details);
    }
  },
  () => ({
    id: new BigNumber(1),
    ticker: 'SOME_TICKER',
    start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    period: {
      unit: CalendarUnit.Month,
      amount: new BigNumber(1),
    },
    expiryDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
    complexity: new BigNumber(2),
    details: {
      remainingCheckpoints: new BigNumber(1),
      nextCheckpointDate: new Date('10/10/2030'),
    },
  }),
  ['CheckpointSchedule']
);

const MockCorporateActionClass = createMockEntityClass<CorporateActionOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    kind!: CorporateActionKind;
    declarationDate!: Date;
    description!: string;
    targets!: CorporateActionTargets;
    defaultTaxWithholding!: BigNumber;
    taxWithholdings!: TaxWithholding[];

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof CorporateAction>) {
      return extractFromArgs(args, [
        'id',
        'ticker',
        'kind',
        'declarationDate',
        'targets',
        'description',
        'defaultTaxWithholding',
        'taxWithholdings',
      ]);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<CorporateActionOptions>) {
      this.uuid = 'corporateAction';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.kind = opts.kind;
      this.declarationDate = opts.declarationDate;
      this.description = opts.description;
      this.targets = opts.targets;
      this.defaultTaxWithholding = opts.defaultTaxWithholding;
      this.taxWithholdings = opts.taxWithholdings;
    }
  },
  () => ({
    id: new BigNumber(1),
    ticker: 'SOME_TICKER',
    kind: CorporateActionKind.UnpredictableBenefit,
    declarationDate: new Date('10/14/1987'),
    description: 'someDescription',
    targets: {
      identities: [getIdentityInstance()],
      treatment: TargetTreatment.Include,
    },
    defaultTaxWithholding: new BigNumber(10),
    taxWithholdings: [
      {
        identity: getIdentityInstance(),
        percentage: new BigNumber(40),
      },
    ],
  }),
  ['CorporateActionBase', 'CorporateAction']
);

const MockDividendDistributionClass = createMockEntityClass<DividendDistributionOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    kind!: CorporateActionKind.PredictableBenefit | CorporateActionKind.UnpredictableBenefit;
    declarationDate!: Date;
    description!: string;
    targets!: CorporateActionTargets;
    defaultTaxWithholding!: BigNumber;
    taxWithholdings!: TaxWithholding[];
    origin!: DefaultPortfolio | NumberedPortfolio;
    currency!: string;
    perShare!: BigNumber;
    maxAmount!: BigNumber;
    expiryDate!: Date | null;
    paymentDate!: Date;
    details!: sinon.SinonStub;
    getParticipant!: sinon.SinonStub;
    checkpoint!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof DividendDistribution>) {
      return extractFromArgs(args, [
        'id',
        'ticker',
        'declarationDate',
        'targets',
        'kind',
        'description',
        'defaultTaxWithholding',
        'taxWithholdings',
        'origin',
        'currency',
        'perShare',
        'maxAmount',
        'expiryDate',
        'paymentDate',
      ]) as Partial<DividendDistributionOptions>;
    }

    /**
     * @hidden
     */
    public configure(opts: Required<DividendDistributionOptions>) {
      this.uuid = 'dividendDistribution';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.kind = opts.kind;
      this.origin = opts.origin;
      this.declarationDate = opts.declarationDate;
      this.description = opts.description;
      this.targets = opts.targets;
      this.defaultTaxWithholding = opts.defaultTaxWithholding;
      this.taxWithholdings = opts.taxWithholdings;
      this.currency = opts.currency;
      this.perShare = opts.perShare;
      this.maxAmount = opts.maxAmount;
      this.expiryDate = opts.expiryDate;
      this.paymentDate = opts.paymentDate;
      this.details = createEntityGetterStub(opts.details);
      this.getParticipant = createEntityGetterStub(opts.getParticipant);
      this.checkpoint = createEntityGetterStub(opts.checkpoint);
    }
  },
  () => ({
    id: new BigNumber(1),
    ticker: 'SOME_TICKER',
    kind: CorporateActionKind.UnpredictableBenefit,
    origin: getDefaultPortfolioInstance(),
    declarationDate: new Date('10/14/1987'),
    description: 'someDescription',
    targets: {
      identities: [getIdentityInstance()],
      treatment: TargetTreatment.Include,
    },
    defaultTaxWithholding: new BigNumber(10),
    taxWithholdings: [
      {
        identity: getIdentityInstance(),
        percentage: new BigNumber(40),
      },
    ],
    currency: 'USD',
    perShare: new BigNumber(100),
    maxAmount: new BigNumber(1000000),
    expiryDate: null,
    paymentDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
    details: {
      remainingFunds: new BigNumber(100),
      fundsReclaimed: false,
    },
    getParticipant: {
      identity: getIdentityInstance(),
      amount: new BigNumber(100),
      paid: false,
    },
    checkpoint: getCheckpointInstance(),
  }),
  ['CorporateActionBase', 'DividendDistribution']
);

const MockCustomPermissionGroupClass = createMockEntityClass<CustomPermissionGroupOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: Asset;
    getPermissions!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof CustomPermissionGroup>) {
      return extractFromArgs(args, ['id', 'ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<CustomPermissionGroupOptions>) {
      this.uuid = 'customPermissionGroup';
      this.id = opts.id;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.getPermissions = createEntityGetterStub(opts.getPermissions);
    }
  },
  () => ({
    ticker: 'SOME_TICKER',
    id: new BigNumber(1),
    getPermissions: {
      transactions: null,
      transactionGroups: [],
    },
  }),
  ['PermissionGroup', 'CustomPermissionGroup']
);

const MockMultiSigClass = createMockEntityClass<MultiSigOptions>(
  class {
    address!: string;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof MultiSig>) {
      return extractFromArgs(args, ['address']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<MultiSigOptions>) {
      this.address = opts.address;
    }
  },
  () => ({
    address: 'someAddress',
  }),
  ['MultiSig', 'Account']
);

const MockMultiSigProposalClass = createMockEntityClass<MultiSigProposalOptions>(
  class {
    id!: BigNumber;
    multiSig!: MultiSig;
    details!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof MultiSigProposal>) {
      return extractFromArgs(args, ['id', 'multiSigAddress']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<MultiSigProposalOptions>) {
      this.id = opts.id;
      this.multiSig = opts.multiSig;
      this.details = createEntityGetterStub(opts.details);
    }
  },
  () => ({
    id: new BigNumber(1),
    multiSig: getMultiSigInstance({ address: 'someAddress' }),
    details: {
      approvalAmount: new BigNumber(1),
      rejectionAmount: new BigNumber(0),
      status: ProposalStatus.Active,
      expiry: null,
      autoClose: false,
    },
  }),
  ['MultiSigProposal']
);

const MockKnownPermissionGroupClass = createMockEntityClass<KnownPermissionGroupOptions>(
  class {
    uuid!: string;
    type!: PermissionGroupType;
    asset!: Asset;
    getPermissions!: sinon.SinonStub;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof KnownPermissionGroup>) {
      return extractFromArgs(args, ['type', 'ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<KnownPermissionGroupOptions>) {
      this.uuid = 'knownPermissionGroup';
      this.type = opts.type;
      this.asset = getAssetInstance({ ticker: opts.ticker });
      this.getPermissions = createEntityGetterStub(opts.getPermissions);
    }
  },
  () => ({
    ticker: 'SOME_TICKER',
    type: PermissionGroupType.Full,
    getPermissions: {
      transactions: null,
      transactionGroups: [],
    },
  }),
  ['PermissionGroup', 'KnownPermissionGroup']
);

export const mockIdentityModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Identity: MockIdentityClass,
});

export const mockAccountModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Account: MockAccountClass,
});

export const mockSubsidyModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Subsidy: MockSubsidyClass,
});

export const mockTickerReservationModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  TickerReservation: MockTickerReservationClass,
});

export const mockAssetModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Asset: MockAssetClass,
});

export const mockAuthorizationRequestModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  AuthorizationRequest: MockAuthorizationRequestClass,
});

export const mockVenueModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Venue: MockVenueClass,
});

export const mockInstructionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Instruction: MockInstructionClass,
});

export const mockNumberedPortfolioModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  NumberedPortfolio: MockNumberedPortfolioClass,
});

export const mockDefaultPortfolioModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  DefaultPortfolio: MockDefaultPortfolioClass,
});

export const mockOfferingModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Offering: MockOfferingClass,
});

export const mockCheckpointModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Checkpoint: MockCheckpointClass,
});

export const mockCheckpointScheduleModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CheckpointSchedule: MockCheckpointScheduleClass,
});

export const mockCorporateActionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CorporateAction: MockCorporateActionClass,
});

export const mockDividendDistributionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  DividendDistribution: MockDividendDistributionClass,
});

export const mockMultiSigModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  MultiSig: MockMultiSigClass,
});

export const mockMultiSigProposalModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  MultiSigProposal: MockMultiSigProposalClass,
});

export const mockCustomPermissionGroupModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CustomPermissionGroup: MockCustomPermissionGroupClass,
});

export const mockKnownPermissionGroupModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  KnownPermissionGroup: MockKnownPermissionGroupClass,
});

/**
 * @hidden
 *
 * Initialize mock classes with the default configuration
 */
export const initMocks = function (opts?: MockOptions): void {
  MockIdentityClass.init(opts?.identityOptions);
  MockAccountClass.init(opts?.accountOptions);
  MockSubsidyClass.init(opts?.subsidyOptions);
  MockTickerReservationClass.init(opts?.tickerReservationOptions);
  MockAssetClass.init(opts?.assetOptions);
  MockAuthorizationRequestClass.init(opts?.authorizationRequestOptions);
  MockVenueClass.init(opts?.venueOptions);
  MockInstructionClass.init(opts?.instructionOptions);
  MockNumberedPortfolioClass.init(opts?.numberedPortfolioOptions);
  MockDefaultPortfolioClass.init(opts?.defaultPortfolioOptions);
  MockCustomPermissionGroupClass.init(opts?.customPermissionGroupOptions);
  MockKnownPermissionGroupClass.init(opts?.knownPermissionGroupOptions);
  MockOfferingClass.init(opts?.offeringOptions);
  MockCheckpointClass.init(opts?.checkpointOptions);
  MockCheckpointScheduleClass.init(opts?.checkpointScheduleOptions);
  MockCorporateActionClass.init(opts?.corporateActionOptions);
  MockDividendDistributionClass.init(opts?.dividendDistributionOptions);
  MockMultiSigClass.init(opts?.multiSigOptions);
  MockMultiSigProposalClass.init(opts?.multiSigProposalOptions);
};

/**
 * @hidden
 *s
 * Configure mock classes (calling .reset will go back to the default configuration)
 */
export const configureMocks = function (opts?: MockOptions): void {
  MockIdentityClass.setOptions(opts?.identityOptions);
  MockAccountClass.setOptions(opts?.accountOptions);
  MockSubsidyClass.setOptions(opts?.subsidyOptions);
  MockTickerReservationClass.setOptions(opts?.tickerReservationOptions);
  MockAssetClass.setOptions(opts?.assetOptions);
  MockAuthorizationRequestClass.setOptions(opts?.authorizationRequestOptions);
  MockVenueClass.setOptions(opts?.venueOptions);
  MockInstructionClass.setOptions(opts?.instructionOptions);
  MockNumberedPortfolioClass.setOptions(opts?.numberedPortfolioOptions);
  MockDefaultPortfolioClass.setOptions(opts?.defaultPortfolioOptions);
  MockCustomPermissionGroupClass.setOptions(opts?.customPermissionGroupOptions);
  MockKnownPermissionGroupClass.setOptions(opts?.knownPermissionGroupOptions);
  MockOfferingClass.setOptions(opts?.offeringOptions);
  MockCheckpointClass.setOptions(opts?.checkpointOptions);
  MockCheckpointScheduleClass.setOptions(opts?.checkpointScheduleOptions);
  MockCorporateActionClass.setOptions(opts?.corporateActionOptions);
  MockDividendDistributionClass.setOptions(opts?.dividendDistributionOptions);
  MockMultiSigProposalClass.setOptions(opts?.multiSigProposalOptions);
};

/**
 * @hidden
 * Reset all mock classes to their default values
 */
export const reset = function (): void {
  MockIdentityClass.resetOptions();
  MockAccountClass.resetOptions();
  MockSubsidyClass.resetOptions();
  MockTickerReservationClass.resetOptions();
  MockAssetClass.resetOptions();
  MockAuthorizationRequestClass.resetOptions();
  MockVenueClass.resetOptions();
  MockInstructionClass.resetOptions();
  MockNumberedPortfolioClass.resetOptions();
  MockDefaultPortfolioClass.resetOptions();
  MockCustomPermissionGroupClass.resetOptions();
  MockKnownPermissionGroupClass.resetOptions();
  MockOfferingClass.resetOptions();
  MockCheckpointClass.resetOptions();
  MockCheckpointScheduleClass.resetOptions();
  MockCorporateActionClass.resetOptions();
  MockDividendDistributionClass.resetOptions();
  MockMultiSigProposalClass.resetOptions();
};

/**
 * @hidden
 * Retrieve an Identity instance
 */
export const getIdentityInstance = (opts?: IdentityOptions): MockIdentity => {
  const instance = new MockIdentityClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockIdentity;
};

/**
 * @hidden
 * Retrieve an Account instance
 */
export const getAccountInstance = (opts?: AccountOptions): MockAccount => {
  const instance = new MockAccountClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockAccount;
};

/**
 * @hidden
 * Retrieve an Subsidy instance
 */
export const getSubsidyInstance = (opts?: SubsidyOptions): MockSubsidy => {
  const instance = new MockSubsidyClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockSubsidy;
};

/**
 * @hidden
 * Retrieve a TickerReservation instance
 */
export const getTickerReservationInstance = (
  opts?: TickerReservationOptions
): MockTickerReservation => {
  const instance = new MockTickerReservationClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockTickerReservation;
};

/**
 * @hidden
 * Retrieve a Asset instance
 */
export const getAssetInstance = (opts?: AssetOptions): MockAsset => {
  const instance = new MockAssetClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockAsset;
};

/**
 * @hidden
 * Retrieve an AuthorizationRequest instance
 */
export const getAuthorizationRequestInstance = (
  opts?: AuthorizationRequestOptions
): MockAuthorizationRequest => {
  const instance = new MockAuthorizationRequestClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockAuthorizationRequest;
};

/**
 * @hidden
 * Retrieve a Venue instance
 */
export const getVenueInstance = (opts?: VenueOptions): MockVenue => {
  const instance = new MockVenueClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockVenue;
};

/**
 * @hidden
 * Retrieve a NumberedPortfolio instance
 */
export const getNumberedPortfolioInstance = (
  opts?: NumberedPortfolioOptions
): MockNumberedPortfolio => {
  const instance = new MockNumberedPortfolioClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockNumberedPortfolio;
};

/**
 * @hidden
 * Retrieve a DefaultPortfolio instance
 */
export const getDefaultPortfolioInstance = (
  opts?: DefaultPortfolioOptions
): MockDefaultPortfolio => {
  const instance = new MockDefaultPortfolioClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockDefaultPortfolio;
};

/**
 * @hidden
 * Retrieve a CustomPermissionGroup instance
 */
export const getCustomPermissionGroupInstance = (
  opts?: CustomPermissionGroupOptions
): MockCustomPermissionGroup => {
  const instance = new MockCustomPermissionGroupClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockCustomPermissionGroup;
};

/**
 * @hidden
 * Retrieve a KnownPermissionGroup instance
 */
export const getKnownPermissionGroupInstance = (
  opts?: KnownPermissionGroupOptions
): MockKnownPermissionGroup => {
  const instance = new MockKnownPermissionGroupClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockKnownPermissionGroup;
};

/**
 * @hidden
 * Retrieve an Instruction instance
 */
export const getInstructionInstance = (opts?: InstructionOptions): MockInstruction => {
  const instance = new MockInstructionClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockInstruction;
};

/**
 * @hidden
 * Retrieve an Offering instance
 */
export const getOfferingInstance = (opts?: OfferingOptions): MockOffering => {
  const instance = new MockOfferingClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockOffering;
};

/**
 * @hidden
 * Retrieve a Checkpoint instance
 */
export const getCheckpointInstance = (opts?: CheckpointOptions): MockCheckpoint => {
  const instance = new MockCheckpointClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockCheckpoint;
};

/**
 * @hidden
 * Retrieve a CheckpointSchedule instance
 */
export const getCheckpointScheduleInstance = (
  opts?: CheckpointScheduleOptions
): MockCheckpointSchedule => {
  const instance = new MockCheckpointScheduleClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockCheckpointSchedule;
};

/**
 * @hidden
 * Retrieve a CorporateAction instance
 */
export const getCorporateActionInstance = (opts?: CorporateActionOptions): MockCorporateAction => {
  const instance = new MockCorporateActionClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockCorporateAction;
};

/**
 * @hidden
 * Retrieve a DividendDistribution instance
 */
export const getDividendDistributionInstance = (
  opts?: DividendDistributionOptions
): MockDividendDistribution => {
  const instance = new MockDividendDistributionClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockDividendDistribution;
};

export const getMultiSigInstance = (opts?: MultiSigOptions): MockMultiSig => {
  const instance = new MockMultiSigClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockMultiSig;
};

export const getMultiSigProposalInstance = (
  opts?: MultiSigProposalOptions
): MockMultiSigProposal => {
  const instance = new MockMultiSigProposalClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockMultiSigProposal;
};
