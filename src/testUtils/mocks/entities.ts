/* istanbul ignore file */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import BigNumber from 'bignumber.js';
import { pick } from 'lodash';

import {
  Account,
  AuthorizationRequest,
  BaseAsset,
  Checkpoint,
  CheckpointSchedule,
  ChildIdentity,
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialTransaction,
  ConfidentialVenue,
  CorporateAction,
  CustomPermissionGroup,
  DefaultPortfolio,
  DividendDistribution,
  FungibleAsset,
  Identity,
  Instruction,
  KnownPermissionGroup,
  MetadataEntry,
  MultiSig,
  MultiSigProposal,
  Nft,
  NftCollection,
  NumberedPortfolio,
  Offering,
  Portfolio,
  Subsidy,
  TickerReservation,
  Venue,
} from '~/internal';
import { entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  ActiveTransferRestrictions,
  AgentWithGroup,
  AssetDetails,
  AssetWithGroup,
  Authorization,
  AuthorizationType,
  CheckPermissionsResult,
  CheckRolesResult,
  CollectionKey,
  ComplianceRequirements,
  ConfidentialAssetDetails,
  ConfidentialLeg,
  ConfidentialTransactionDetails,
  ConfidentialTransactionStatus,
  ConfidentialVenueFilteringDetails,
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
  KnownNftType,
  Leg,
  MetadataDetails,
  MetadataLockStatus,
  MetadataType,
  MetadataValue,
  MultiSigProposalDetails,
  NftMetadata,
  OfferingBalanceStatus,
  OfferingDetails,
  OfferingSaleStatus,
  OfferingTimingStatus,
  PercentageTransferRestriction,
  PermissionedAccount,
  PermissionGroups,
  PermissionGroupType,
  PolymeshError,
  PortfolioBalance,
  PortfolioCollection,
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
export type MockChildIdentity = Mocked<ChildIdentity>;
export type MockAccount = Mocked<Account>;
export type MockSubsidy = Mocked<Subsidy>;
export type MockTickerReservation = Mocked<TickerReservation>;
export type MockBaseAsset = Mocked<BaseAsset>;
export type MockFungibleAsset = Mocked<FungibleAsset>;
export type MockNftCollection = Mocked<NftCollection>;
export type MockNft = Mocked<Nft>;
export type MockMetadataEntry = Mocked<MetadataEntry>;
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
export type MockConfidentialAccount = Mocked<ConfidentialAccount>;
export type MockConfidentialVenue = Mocked<ConfidentialVenue>;
export type MockConfidentialAsset = Mocked<ConfidentialAsset>;
export type MockConfidentialTransaction = Mocked<ConfidentialTransaction>;

interface EntityOptions {
  exists?: boolean;
  isEqual?: boolean;
  toHuman?: any;
}

export type EntityGetter<Result> = Partial<Result> | ((...args: any) => any) | jest.Mock;

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
  portfoliosGetPortfolio?: EntityGetter<Portfolio>;
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

interface ChildIdentityOptions extends IdentityOptions {
  getParentDid?: EntityGetter<Identity | null>;
}

interface TickerReservationOptions extends EntityOptions {
  ticker?: string;
  details?: EntityGetter<TickerReservationDetails>;
}

interface BaseAssetOptions extends EntityOptions {
  ticker?: string;
  did?: string;
  details?: EntityGetter<AssetDetails>;
  isFrozen?: EntityGetter<boolean>;
  transfersCanTransfer?: EntityGetter<TransferStatus>;
  getIdentifiers?: EntityGetter<SecurityIdentifier[]>;
  permissionsGetAgents?: EntityGetter<AgentWithGroup[]>;
  permissionsGetGroups?: EntityGetter<PermissionGroups>;
  complianceRequirementsGet?: EntityGetter<ComplianceRequirements>;
  investorCount?: EntityGetter<BigNumber>;
  getNextLocalId?: EntityGetter<BigNumber>;
}

interface FungibleAssetOptions extends BaseAssetOptions {
  currentFundingRound?: EntityGetter<string>;
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
  checkpointsGetOne?: EntityGetter<Checkpoint>;
  checkpointsSchedulesGetOne?: EntityGetter<ScheduleWithDetails>;
}

interface NftCollectionOptions extends BaseAssetOptions {
  ticker?: string;
  did?: string;
  details?: EntityGetter<AssetDetails>;
  isFrozen?: EntityGetter<boolean>;
  getIdentifiers?: EntityGetter<SecurityIdentifier[]>;
  permissionsGetAgents?: EntityGetter<AgentWithGroup[]>;
  permissionsGetGroups?: EntityGetter<PermissionGroups>;
  complianceRequirementsGet?: EntityGetter<ComplianceRequirements>;
  investorCount?: EntityGetter<BigNumber>;
  getNextLocalId?: EntityGetter<BigNumber>;
  collectionKeys?: EntityGetter<CollectionKey[]>;
  getCollectionId?: EntityGetter<BigNumber>;
  getBaseImageUrl?: EntityGetter<string | null>;
}

interface NftOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  collection?: NftCollection;
  getMetadata?: EntityGetter<NftMetadata[]>;
}

interface MetadataEntryOptions extends EntityOptions {
  id?: BigNumber;
  ticker?: string;
  type?: MetadataType;
  details?: EntityGetter<MetadataDetails>;
  value?: EntityGetter<MetadataValue | null>;
  isModifiable?: EntityGetter<{ canModify: boolean; reason?: PolymeshError }>;
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
  authorizationsGetReceived?: EntityGetter<AuthorizationRequest[]>;
  authorizationsGetOne?: EntityGetter<AuthorizationRequest>;
  getMultiSig?: EntityGetter<MultiSig | null>;
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
  getCollections?: EntityGetter<PortfolioCollection[]>;
  getCustodian?: EntityGetter<Identity>;
  isCustodiedBy?: EntityGetter<boolean>;
}

interface DefaultPortfolioOptions extends EntityOptions {
  did?: string;
  isOwnedBy?: EntityGetter<boolean>;
  getAssetBalances?: EntityGetter<PortfolioBalance[]>;
  getCollections?: EntityGetter<PortfolioCollection[]>;
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

interface ConfidentialTransactionOptions extends EntityOptions {
  id?: BigNumber;
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
  points?: Date[];
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

interface MultiSigOptions extends AccountOptions {
  address?: string;
  details?: { signers: Signer[]; requiredSignatures: BigNumber };
  getCreator?: EntityGetter<Identity>;
}
interface MultiSigProposalOptions extends EntityOptions {
  id?: BigNumber;
  multiSig?: MultiSig;
  details?: EntityGetter<MultiSigProposalDetails>;
}

interface ConfidentialAssetOptions extends EntityOptions {
  id?: string;
  details?: EntityGetter<ConfidentialAssetDetails | null>;
  getVenueFilteringDetails?: EntityGetter<ConfidentialVenueFilteringDetails>;
}

interface ConfidentialVenueOptions extends EntityOptions {
  id?: BigNumber;
  creator?: EntityGetter<Identity>;
}

interface ConfidentialTransactionOptions extends EntityOptions {
  id?: BigNumber;
  details?: EntityGetter<ConfidentialTransactionDetails>;
  getInvolvedParties?: EntityGetter<Identity[]>;
  getPendingAffirmsCount?: EntityGetter<BigNumber>;
  getLegs?: EntityGetter<ConfidentialLeg[]>;
}

interface ConfidentialAccountOptions extends EntityOptions {
  publicKey?: string;
  getIdentity?: EntityGetter<Identity | null>;
}

type MockOptions = {
  identityOptions?: IdentityOptions;
  childIdentityOptions?: ChildIdentityOptions;
  accountOptions?: AccountOptions;
  subsidyOptions?: SubsidyOptions;
  tickerReservationOptions?: TickerReservationOptions;
  fungibleAssetOptions?: FungibleAssetOptions;
  nftCollectionOptions?: NftCollectionOptions;
  nftOptions?: NftOptions;
  baseAssetOptions?: BaseAssetOptions;
  metadataEntryOptions?: MetadataEntryOptions;
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
  confidentialAssetOptions?: ConfidentialAssetOptions;
  confidentialVenueOptions?: ConfidentialVenueOptions;
  confidentialTransactionOptions?: ConfidentialTransactionOptions;
  confidentialAccountOptions?: ConfidentialAccountOptions;
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
    isEqual = jest.fn();
    exists = jest.fn();
    toHuman = jest.fn();

    private static constructorMock = jest.fn();

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
    public static getConstructorMock() {
      return this.constructorMock;
    }

    /**
     * @hidden
     */
    public override configure(opts: Partial<Options>) {
      const fullOpts = MockClass.mergeOptions(opts);

      super.configure(fullOpts);

      this.exists.mockReturnValue(fullOpts.exists);
      this.isEqual.mockReturnValue(fullOpts.isEqual);
      this.toHuman.mockReturnValue(fullOpts.toHuman);
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

      MockClass.constructorMock(...args);

      this.configure(opts);
    }
  };
}

/**
 * Make an entity getter mock that returns a value or calls a specific function
 */
function createEntityGetterMock<Result>(args: EntityGetter<Result>, isAsync = true) {
  if (typeof args === 'function' && 'withArgs' in args) {
    return args;
  }

  const newMock = jest.fn();

  if (typeof args === 'function') {
    newMock.mockImplementation(args as (...fnArgs: any[]) => any);
  } else if (isAsync) {
    newMock.mockResolvedValue(args);
  } else {
    newMock.mockReturnValue(args);
  }

  return newMock;
}

const MockIdentityClass = createMockEntityClass<IdentityOptions>(
  class {
    uuid!: string;
    did!: string;
    hasRoles!: jest.Mock;
    checkRoles!: jest.Mock;
    hasRole!: jest.Mock;
    hasValidCdd!: jest.Mock;
    getPrimaryAccount!: jest.Mock;
    portfolios = {} as {
      getPortfolio: jest.Mock;
    };

    authorizations = {} as {
      getReceived: jest.Mock;
      getSent: jest.Mock;
      getOne: jest.Mock;
    };

    assetPermissions = {} as {
      get: jest.Mock;
      getGroup: jest.Mock;
      hasPermissions: jest.Mock;
      checkPermissions: jest.Mock;
    };

    getVenues!: jest.Mock;
    getScopeId!: jest.Mock;
    getAssetBalance!: jest.Mock;
    getSecondaryAccounts!: jest.Mock;
    areSecondaryAccountsFrozen!: jest.Mock;
    isCddProvider!: jest.Mock;

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
      this.hasRoles = createEntityGetterMock(opts.hasRoles);
      this.checkRoles = createEntityGetterMock(opts.checkRoles);
      this.hasRole = createEntityGetterMock(opts.hasRole);
      this.hasValidCdd = createEntityGetterMock(opts.hasValidCdd);
      this.getPrimaryAccount = createEntityGetterMock(opts.getPrimaryAccount);
      this.portfolios.getPortfolio = createEntityGetterMock(opts.portfoliosGetPortfolio);
      this.authorizations.getReceived = createEntityGetterMock(opts.authorizationsGetReceived);
      this.authorizations.getSent = createEntityGetterMock(opts.authorizationsGetSent);
      this.authorizations.getOne = createEntityGetterMock(opts.authorizationsGetOne);
      this.assetPermissions.get = createEntityGetterMock(opts.assetPermissionsGet);
      this.assetPermissions.getGroup = createEntityGetterMock(opts.assetPermissionsGetGroup);
      this.assetPermissions.hasPermissions = createEntityGetterMock(
        opts.assetPermissionsHasPermissions
      );
      this.assetPermissions.checkPermissions = createEntityGetterMock(
        opts.assetPermissionsCheckPermissions
      );
      this.getVenues = createEntityGetterMock(opts.getVenues);
      this.getScopeId = createEntityGetterMock(opts.getScopeId);
      this.getAssetBalance = createEntityGetterMock(opts.getAssetBalance);
      this.getSecondaryAccounts = createEntityGetterMock(opts.getSecondaryAccounts);
      this.areSecondaryAccountsFrozen = createEntityGetterMock(opts.areSecondaryAccountsFrozen);
      this.isCddProvider = createEntityGetterMock(opts.isCddProvider);
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
    portfoliosGetPortfolio: getDefaultPortfolioInstance(),
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

const MockChildIdentityClass = createMockEntityClass<ChildIdentityOptions>(
  class {
    uuid!: string;
    did!: string;
    hasValidCdd!: jest.Mock;

    getVenues!: jest.Mock;
    getScopeId!: jest.Mock;
    getAssetBalance!: jest.Mock;
    getSecondaryAccounts!: jest.Mock;

    getPrimaryAccount!: jest.Mock;
    authorizations = {} as {
      getReceived: jest.Mock;
      getSent: jest.Mock;
      getOne: jest.Mock;
    };

    portfolios = {} as {
      getPortfolio: jest.Mock;
    };

    assetPermissions = {} as {
      get: jest.Mock;
      getGroup: jest.Mock;
      hasPermissions: jest.Mock;
      checkPermissions: jest.Mock;
    };

    hasRoles!: jest.Mock;
    checkRoles!: jest.Mock;
    hasRole!: jest.Mock;

    areSecondaryAccountsFrozen!: jest.Mock;
    isCddProvider!: jest.Mock;

    getParentDid!: jest.Mock;
    getChildIdentities!: Promise<ChildIdentity[]>;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof ChildIdentity>) {
      return extractFromArgs(args, ['did']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<ChildIdentityOptions>) {
      this.uuid = 'childIdentity';
      this.did = opts.did;
      this.hasValidCdd = createEntityGetterMock(opts.hasValidCdd);
      this.getPrimaryAccount = createEntityGetterMock(opts.getPrimaryAccount);
      this.portfolios.getPortfolio = createEntityGetterMock(opts.portfoliosGetPortfolio);
      this.authorizations.getReceived = createEntityGetterMock(opts.authorizationsGetReceived);
      this.getVenues = createEntityGetterMock(opts.getVenues);
      this.getScopeId = createEntityGetterMock(opts.getScopeId);
      this.getAssetBalance = createEntityGetterMock(opts.getAssetBalance);
      this.getSecondaryAccounts = createEntityGetterMock(opts.getSecondaryAccounts);

      this.hasRoles = createEntityGetterMock(opts.hasRoles);
      this.checkRoles = createEntityGetterMock(opts.checkRoles);
      this.hasRole = createEntityGetterMock(opts.hasRole);

      this.authorizations.getSent = createEntityGetterMock(opts.authorizationsGetSent);
      this.authorizations.getOne = createEntityGetterMock(opts.authorizationsGetOne);
      this.assetPermissions.get = createEntityGetterMock(opts.assetPermissionsGet);
      this.assetPermissions.getGroup = createEntityGetterMock(opts.assetPermissionsGetGroup);
      this.assetPermissions.hasPermissions = createEntityGetterMock(
        opts.assetPermissionsHasPermissions
      );
      this.assetPermissions.checkPermissions = createEntityGetterMock(
        opts.assetPermissionsCheckPermissions
      );

      this.areSecondaryAccountsFrozen = createEntityGetterMock(opts.areSecondaryAccountsFrozen);
      this.isCddProvider = createEntityGetterMock(opts.isCddProvider);

      this.getParentDid = createEntityGetterMock(opts.getParentDid);
      this.getChildIdentities = Promise.resolve([]);
    }
  },
  () => ({
    did: 'someChildDid',
    hasValidCdd: true,
    isCddProvider: false,
    getScopeId: 'someScopeId',
    getAssetBalance: new BigNumber(100),
    getSecondaryAccounts: { data: [], next: null },
    areSecondaryAccountsFrozen: false,
    assetPermissionsGet: [],
    assetPermissionsGetGroup: getKnownPermissionGroupInstance(),
    assetPermissionsCheckPermissions: {
      result: true,
    },
    portfoliosGetPortfolio: getDefaultPortfolioInstance(),
    assetPermissionsHasPermissions: true,
    hasRole: true,
    hasRoles: true,
    checkRoles: {
      result: true,
    },
    authorizationsGetReceived: [],
    authorizationsGetSent: { data: [], next: null, count: new BigNumber(0) },
    authorizationsGetOne: getAuthorizationRequestInstance(),
    getVenues: [],

    getPrimaryAccount: {
      account: getAccountInstance(),
      permissions: {
        assets: null,
        portfolios: null,
        transactions: null,
        transactionGroups: [],
      },
    },

    toHuman: 'someChildDid',
    getParentDid: getIdentityInstance(),
  }),
  ['ChildIdentity', 'Identity']
);

const MockAccountClass = createMockEntityClass<AccountOptions>(
  class {
    uuid!: string;
    address!: string;
    key!: string;
    isFrozen!: jest.Mock;
    getBalance!: jest.Mock;
    getIdentity!: jest.Mock;
    getTransactionHistory!: jest.Mock;
    hasPermissions!: jest.Mock;
    checkPermissions!: jest.Mock;
    getMultiSig!: jest.Mock;
    authorizations = {} as {
      getReceived: jest.Mock;
      getOne: jest.Mock;
    };

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
      this.isFrozen = createEntityGetterMock(opts.isFrozen);
      this.getBalance = createEntityGetterMock(opts.getBalance);
      this.getIdentity = createEntityGetterMock(opts.getIdentity);
      this.getTransactionHistory = createEntityGetterMock(opts.getTransactionHistory);
      this.hasPermissions = createEntityGetterMock(opts.hasPermissions);
      this.checkPermissions = createEntityGetterMock(opts.checkPermissions);
      this.authorizations.getReceived = createEntityGetterMock(opts.authorizationsGetReceived);
      this.authorizations.getOne = createEntityGetterMock(opts.authorizationsGetOne);
      this.getMultiSig = createEntityGetterMock(opts.getMultiSig);
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
    authorizationsGetReceived: [],
    authorizationsGetOne: getAuthorizationRequestInstance(),
    getMultiSig: null,
  }),
  ['Account']
);

const MockSubsidyClass = createMockEntityClass<SubsidyOptions>(
  class {
    uuid!: string;
    beneficiary!: Account;
    subsidizer!: Account;
    getAllowance!: jest.Mock;

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
      this.getAllowance = createEntityGetterMock(opts.getAllowance);
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
    details!: jest.Mock;

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
      this.details = createEntityGetterMock(opts.details);
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

const MockFungibleAssetClass = createMockEntityClass<FungibleAssetOptions>(
  class {
    uuid!: string;
    ticker!: string;
    did!: string;
    details!: jest.Mock;
    currentFundingRound!: jest.Mock;
    isFrozen!: jest.Mock;
    transfers = {} as {
      canTransfer: jest.Mock;
    };

    getIdentifiers!: jest.Mock;
    transferRestrictions = {
      count: {},
      percentage: {},
      claimCount: {},
      claimPercentage: {},
    } as {
      count: {
        get: jest.Mock;
      };
      percentage: {
        get: jest.Mock;
      };
      claimCount: {
        get: jest.Mock;
      };
      claimPercentage: {
        get: jest.Mock;
      };
    };

    corporateActions = {} as {
      getAgents: jest.Mock;
      getDefaultConfig: jest.Mock;
    };

    permissions = {} as {
      getGroups: jest.Mock;
      getAgents: jest.Mock;
    };

    compliance = {
      requirements: {},
    } as {
      requirements: {
        get: jest.Mock;
      };
    };

    checkpoints = {
      schedules: {},
    } as {
      schedules: {
        getOne: jest.Mock;
      };
      getOne: jest.Mock;
    };

    metadata = {} as { getNextLocalId: jest.Mock };

    investorCount!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof FungibleAsset>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<FungibleAssetOptions>) {
      this.uuid = 'asset';
      this.ticker = opts.ticker;
      this.details = createEntityGetterMock(opts.details);
      this.currentFundingRound = createEntityGetterMock(opts.currentFundingRound);
      this.isFrozen = createEntityGetterMock(opts.isFrozen);
      this.transfers.canTransfer = createEntityGetterMock(opts.transfersCanTransfer);
      this.getIdentifiers = createEntityGetterMock(opts.getIdentifiers);
      this.transferRestrictions.count.get = createEntityGetterMock(
        opts.transferRestrictionsCountGet
      );
      this.transferRestrictions.percentage.get = createEntityGetterMock(
        opts.transferRestrictionsPercentageGet
      );
      this.transferRestrictions.claimCount.get = createEntityGetterMock(
        opts.transferRestrictionsClaimCountGet
      );
      this.transferRestrictions.claimPercentage.get = createEntityGetterMock(
        opts.transferRestrictionsClaimPercentageGet
      );
      this.corporateActions.getAgents = createEntityGetterMock(opts.corporateActionsGetAgents);
      this.corporateActions.getDefaultConfig = createEntityGetterMock(
        opts.corporateActionsGetDefaultConfig
      );
      this.permissions.getGroups = createEntityGetterMock(opts.permissionsGetGroups);
      this.permissions.getAgents = createEntityGetterMock(opts.permissionsGetAgents);
      this.compliance.requirements.get = createEntityGetterMock(opts.complianceRequirementsGet);
      this.checkpoints.schedules.getOne = createEntityGetterMock(opts.checkpointsSchedulesGetOne);
      this.checkpoints.getOne = createEntityGetterMock(opts.checkpointsGetOne);
      this.investorCount = createEntityGetterMock(opts.investorCount);
      this.metadata.getNextLocalId = createEntityGetterMock(opts.getNextLocalId);
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
    getNextLocalId: new BigNumber(0),
    toHuman: 'SOME_TICKER',
    investorCount: new BigNumber(0),
  }),
  ['FungibleAsset']
);

const MockNftCollectionClass = createMockEntityClass<NftCollectionOptions>(
  class {
    uuid!: string;
    ticker!: string;
    did!: string;
    details!: jest.Mock;
    isFrozen!: jest.Mock;
    transfers = {} as {
      canTransfer: jest.Mock;
    };

    getIdentifiers!: jest.Mock;

    permissions = {} as {
      getGroups: jest.Mock;
      getAgents: jest.Mock;
    };

    compliance = {
      requirements: {},
    } as {
      requirements: {
        get: jest.Mock;
      };
    };

    metadata = {} as { getNextLocalId: jest.Mock };

    collectionKeys!: jest.Mock;
    getCollectionId!: jest.Mock;

    investorCount!: jest.Mock;
    getBaseImageUrl!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof FungibleAsset>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<NftCollectionOptions>) {
      this.uuid = 'asset';
      this.ticker = opts.ticker;
      this.details = createEntityGetterMock(opts.details);
      this.isFrozen = createEntityGetterMock(opts.isFrozen);
      this.transfers.canTransfer = createEntityGetterMock(opts.transfersCanTransfer);
      this.getIdentifiers = createEntityGetterMock(opts.getIdentifiers);
      this.permissions.getGroups = createEntityGetterMock(opts.permissionsGetGroups);
      this.permissions.getAgents = createEntityGetterMock(opts.permissionsGetAgents);
      this.investorCount = createEntityGetterMock(opts.investorCount);
      this.metadata.getNextLocalId = createEntityGetterMock(opts.getNextLocalId);
      this.collectionKeys = createEntityGetterMock(opts.collectionKeys);
      this.getCollectionId = createEntityGetterMock(opts.getCollectionId);
      this.getBaseImageUrl = createEntityGetterMock(opts.getBaseImageUrl);
    }
  },
  () => ({
    ticker: 'TICKER',
    did: 'assetDid',
    details: {
      owner: getIdentityInstance(),
      name: 'ASSET_NAME',
      totalSupply: new BigNumber(1000000),
      isDivisible: false,
      primaryIssuanceAgents: [],
      fullAgents: [],
      assetType: KnownNftType.Derivative,
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
    isFrozen: false,
    transfersCanTransfer: TransferStatus.Success,
    getIdentifiers: [],
    getNextLocalId: new BigNumber(0),
    toHuman: 'SOME_TICKER',
    investorCount: new BigNumber(0),
    collectionKeys: [],
    getCollectionId: new BigNumber(0),
    getBaseImageUrl: null,
  }),
  ['NftCollection']
);

const MockNftClass = createMockEntityClass<NftOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    collection!: NftCollection;
    getMetadata!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof Nft>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<NftOptions>) {
      this.uuid = 'nft';
      this.id = opts.id;
      this.collection = opts.collection;
      this.getMetadata = createEntityGetterMock(opts.getMetadata);
    }
  },
  () => ({
    collection: entityMockUtils.getNftCollectionInstance(),
    did: 'nftDid',
    id: new BigNumber(1),
    ticker: 'NFT',
    getMetadata: [],
  }),
  ['Nft']
);

const MockBaseAssetClass = createMockEntityClass<BaseAssetOptions>(
  class {
    uuid!: string;
    ticker!: string;
    did!: string;
    details!: jest.Mock;
    isFrozen!: jest.Mock;
    transfers = {} as {
      canTransfer: jest.Mock;
    };

    permissions = {} as {
      getGroups: jest.Mock;
      getAgents: jest.Mock;
    };

    getIdentifiers!: jest.Mock;

    compliance = {
      requirements: {},
    } as {
      requirements: {
        get: jest.Mock;
      };
    };

    metadata = {} as { getNextLocalId: jest.Mock };

    investorCount!: jest.Mock;
    getBaseImageUrl!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof FungibleAsset>) {
      return extractFromArgs(args, ['ticker']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<FungibleAssetOptions>) {
      this.uuid = 'asset';
      this.ticker = opts.ticker;
      this.details = createEntityGetterMock(opts.details);
      this.isFrozen = createEntityGetterMock(opts.isFrozen);
      this.transfers.canTransfer = createEntityGetterMock(opts.transfersCanTransfer);
      this.getIdentifiers = createEntityGetterMock(opts.getIdentifiers);
      this.permissions.getAgents = createEntityGetterMock(opts.permissionsGetAgents);
      this.permissions.getGroups = createEntityGetterMock(opts.permissionsGetGroups);
      this.compliance.requirements.get = createEntityGetterMock(opts.complianceRequirementsGet);
      this.investorCount = createEntityGetterMock(opts.investorCount);
      this.metadata.getNextLocalId = createEntityGetterMock(opts.getNextLocalId);
    }
  },
  () => ({
    ticker: 'SOME_TICKER',
    did: 'assetDid',
    details: {
      owner: getIdentityInstance(),
      name: 'Base Asset Name',
      totalSupply: new BigNumber(1000000),
      isDivisible: false,
      primaryIssuanceAgents: [],
      fullAgents: [],
      assetType: KnownAssetType.EquityCommon,
    },
    isFrozen: false,
    transfersCanTransfer: TransferStatus.Success,
    getIdentifiers: [],
    permissionsGetAgents: [],
    permissionsGetGroups: {
      known: [],
      custom: [],
    },
    complianceRequirementsGet: {
      requirements: [],
      defaultTrustedClaimIssuers: [],
    },
    getNextLocalId: new BigNumber(0),
    toHuman: 'SOME_TICKER',
    investorCount: new BigNumber(0),
  }),
  ['BaseAsset']
);

const MockMetadataEntryClass = createMockEntityClass<MetadataEntryOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: FungibleAsset;
    type!: MetadataType;
    details!: jest.SpyInstance;
    value!: jest.SpyInstance;
    isModifiable!: jest.SpyInstance;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof MetadataEntry>) {
      return extractFromArgs(args, ['id', 'ticker', 'type']);
    }

    /**
     * @hidden
     */
    public configure({
      id,
      ticker,
      type,
      details,
      value,
      isModifiable,
    }: Required<MetadataEntryOptions>) {
      this.uuid = 'metadataEntry';
      this.id = id;
      this.asset = getFungibleAssetInstance({ ticker });
      this.type = type;
      this.details = createEntityGetterMock(details);
      this.value = createEntityGetterMock(value);
      this.isModifiable = createEntityGetterMock(isModifiable);
    }
  },
  () => ({
    details: {
      name: 'SOME_NAME',
      specs: {
        url: 'SOME_URL',
      },
    },
    value: {
      value: 'SOME_VALUE',
      lockStatus: MetadataLockStatus.Unlocked,
      expiry: undefined,
    },
    ticker: 'SOME_TICKER',
    id: new BigNumber(1),
    type: MetadataType.Local,
    isModifiable: {
      canModify: true,
    },
  }),
  ['MetadataEntry']
);

const MockAuthorizationRequestClass = createMockEntityClass<AuthorizationRequestOptions>(
  class {
    uuid!: string;
    authId!: BigNumber;
    issuer!: Identity;
    target!: Signer;
    expiry!: Date | null;
    data!: Authorization;
    isExpired!: jest.Mock;

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
      this.isExpired = createEntityGetterMock(opts.isExpired, false);
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
    details!: jest.Mock;

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
      this.details = createEntityGetterMock(opts.details);
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
    details!: jest.Mock;
    getLegs!: jest.Mock;
    isPending!: jest.Mock;

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
      this.details = createEntityGetterMock(opts.details);
      this.getLegs = createEntityGetterMock(opts.getLegs);
      this.isPending = createEntityGetterMock(opts.isPending);
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
          asset: getFungibleAssetInstance(),
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
    isOwnedBy!: jest.Mock;
    getAssetBalances!: jest.Mock;
    getCollections!: jest.Mock;
    getCustodian!: jest.Mock;
    isCustodiedBy!: jest.Mock;

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
      this.isOwnedBy = createEntityGetterMock(opts.isOwnedBy);
      this.getAssetBalances = createEntityGetterMock(opts.getAssetBalances);
      this.getCollections = createEntityGetterMock(opts.getCollections);
      this.getCustodian = createEntityGetterMock(opts.getCustodian);
      this.isCustodiedBy = createEntityGetterMock(opts.isCustodiedBy);
    }
  },
  () => ({
    id: new BigNumber(1),
    isOwnedBy: true,
    getAssetBalances: [
      {
        asset: getFungibleAssetInstance(),
        total: new BigNumber(1),
        locked: new BigNumber(0),
        free: new BigNumber(1),
      },
    ],
    getCollections: [],
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
    isOwnedBy!: jest.Mock;
    getAssetBalances!: jest.Mock;
    getCollections!: jest.Mock;
    getCustodian!: jest.Mock;
    isCustodiedBy!: jest.Mock;

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
      this.isOwnedBy = createEntityGetterMock(opts.isOwnedBy);
      this.getAssetBalances = createEntityGetterMock(opts.getAssetBalances);
      this.getCollections = createEntityGetterMock(opts.getCollections);
      this.getCustodian = createEntityGetterMock(opts.getCustodian);
      this.isCustodiedBy = createEntityGetterMock(opts.isCustodiedBy);
    }
  },
  () => ({
    isOwnedBy: true,
    getAssetBalances: [
      {
        asset: getFungibleAssetInstance(),
        total: new BigNumber(1),
        locked: new BigNumber(0),
        free: new BigNumber(1),
      },
    ],
    getCollections: [],
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
    asset!: FungibleAsset;
    details!: jest.Mock;

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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
      this.details = createEntityGetterMock(opts.details);
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
    asset!: FungibleAsset;
    createdAt!: jest.Mock;
    totalSupply!: jest.Mock;
    allBalances!: jest.Mock;
    balance!: jest.Mock;

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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
      this.createdAt = createEntityGetterMock(opts.createdAt);
      this.totalSupply = createEntityGetterMock(opts.totalSupply);
      this.allBalances = createEntityGetterMock(opts.allBalances);
      this.balance = createEntityGetterMock(opts.balance);
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
    asset!: FungibleAsset;
    points!: Date[];
    details!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof CheckpointSchedule>) {
      return extractFromArgs(args, ['id', 'ticker', 'pendingPoints']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<CheckpointScheduleOptions>) {
      this.uuid = 'checkpointSchedule';
      this.id = opts.id;
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
      this.points = opts.points;
      this.details = createEntityGetterMock(opts.details);
    }
  },
  () => {
    const start = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    return {
      id: new BigNumber(1),
      ticker: 'SOME_TICKER',
      start,
      points: [start],
      details: {
        remainingCheckpoints: new BigNumber(1),
        nextCheckpointDate: new Date('10/10/2030'),
      },
    };
  },
  ['CheckpointSchedule']
);

const MockCorporateActionClass = createMockEntityClass<CorporateActionOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    asset!: FungibleAsset;
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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
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
    asset!: FungibleAsset;
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
    details!: jest.Mock;
    getParticipant!: jest.Mock;
    checkpoint!: jest.Mock;

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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
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
      this.details = createEntityGetterMock(opts.details);
      this.getParticipant = createEntityGetterMock(opts.getParticipant);
      this.checkpoint = createEntityGetterMock(opts.checkpoint);
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
    asset!: FungibleAsset;
    getPermissions!: jest.Mock;

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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
      this.getPermissions = createEntityGetterMock(opts.getPermissions);
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
    uuid!: string;
    address!: string;
    key!: string;
    isFrozen!: jest.Mock;
    getBalance!: jest.Mock;
    getIdentity!: jest.Mock;
    getTransactionHistory!: jest.Mock;
    hasPermissions!: jest.Mock;
    checkPermissions!: jest.Mock;
    details!: jest.Mock;
    getCreator!: jest.Mock;

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
      this.uuid = 'multiSig';
      this.address = opts.address;
      this.key = opts.key;
      this.isFrozen = createEntityGetterMock(opts.isFrozen);
      this.getBalance = createEntityGetterMock(opts.getBalance);
      this.getIdentity = createEntityGetterMock(opts.getIdentity);
      this.getTransactionHistory = createEntityGetterMock(opts.getTransactionHistory);
      this.hasPermissions = createEntityGetterMock(opts.hasPermissions);
      this.checkPermissions = createEntityGetterMock(opts.checkPermissions);
      this.details = createEntityGetterMock(opts.details);
      this.getCreator = createEntityGetterMock(opts.getCreator);
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
    details: {
      signers: [],
      requiredSignatures: new BigNumber(0),
    },
    getCreator: getIdentityInstance(),
    authorizationsGetReceived: [],
    authorizationsGetOne: getAuthorizationRequestInstance(),
    getMultiSig: null,
  }),
  ['MultiSig', 'Account']
);

const MockMultiSigProposalClass = createMockEntityClass<MultiSigProposalOptions>(
  class {
    id!: BigNumber;
    multiSig!: MultiSig;
    details!: jest.Mock;

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
      this.details = createEntityGetterMock(opts.details);
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
    asset!: FungibleAsset;
    getPermissions!: jest.Mock;

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
      this.asset = getFungibleAssetInstance({ ticker: opts.ticker });
      this.getPermissions = createEntityGetterMock(opts.getPermissions);
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

const MockConfidentialAccountClass = createMockEntityClass<ConfidentialAccountOptions>(
  class {
    uuid!: string;
    publicKey!: string;
    getIdentity!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof ConfidentialAccount>) {
      return extractFromArgs(args, ['publicKey']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<ConfidentialAccountOptions>) {
      this.uuid = 'confidentialAccount';
      this.publicKey = opts.publicKey;
      this.getIdentity = createEntityGetterMock(opts.getIdentity);
    }
  },
  () => ({
    publicKey: 'somePublicKey',
    getIdentity: getIdentityInstance(),
  }),
  ['ConfidentialAccount']
);

const MockConfidentialAssetClass = createMockEntityClass<ConfidentialAssetOptions>(
  class {
    uuid!: string;
    id!: string;
    details!: jest.Mock;
    getVenueFilteringDetails!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof ConfidentialAsset>) {
      return extractFromArgs(args, ['id']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<ConfidentialAssetOptions>) {
      this.uuid = 'confidentialAsset';
      this.id = opts.id;
      this.details = createEntityGetterMock(opts.details);
      this.getVenueFilteringDetails = createEntityGetterMock(opts.getVenueFilteringDetails);
    }
  },
  () => ({
    id: '76702175-d8cb-e3a5-5a19-734433351e26',
    details: {
      ticker: 'SOME_TICKER',
      data: 'SOME_DATA',
      owner: getIdentityInstance(),
      totalSupply: new BigNumber(0),
    },
    getVenueFilteringDetails: { enabled: false },
  }),
  ['ConfidentialAsset']
);

const MockConfidentialVenueClass = createMockEntityClass<ConfidentialVenueOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    creator!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof ConfidentialVenue>) {
      return extractFromArgs(args, ['id']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<ConfidentialVenueOptions>) {
      this.uuid = 'confidentialVenue';
      this.id = opts.id;
      this.creator = createEntityGetterMock(opts.creator);
    }
  },
  () => ({
    id: new BigNumber(1),
    creator: getIdentityInstance(),
  }),
  ['ConfidentialVenue']
);

const MockConfidentialTransactionClass = createMockEntityClass<ConfidentialTransactionOptions>(
  class {
    uuid!: string;
    id!: BigNumber;
    details!: jest.Mock;
    getInvolvedParties!: jest.Mock;
    getLegs!: jest.Mock;
    getPendingAffirmsCount!: jest.Mock;

    /**
     * @hidden
     */
    public argsToOpts(...args: ConstructorParameters<typeof ConfidentialTransaction>) {
      return extractFromArgs(args, ['id']);
    }

    /**
     * @hidden
     */
    public configure(opts: Required<ConfidentialTransactionOptions>) {
      this.uuid = 'confidentialTransaction';
      this.id = opts.id;
      this.details = createEntityGetterMock(opts.details);
      this.getInvolvedParties = createEntityGetterMock(opts.getInvolvedParties);
      this.getLegs = createEntityGetterMock(opts.getLegs);
      this.getPendingAffirmsCount = createEntityGetterMock(opts.getPendingAffirmsCount);
    }
  },
  () => ({
    id: new BigNumber(1),
    details: {
      venueId: new BigNumber(1),
      createdAt: new BigNumber(new Date('2024/01/01').getTime()),
      status: ConfidentialTransactionStatus.Pending,
      memo: 'Sample Memo',
    },
    getPendingAffirmsCount: new BigNumber(0),
    getLegs: [
      {
        id: new BigNumber(0),
        sender: getConfidentialAccountInstance({ publicKey: 'sender' }),
        receiver: getConfidentialAccountInstance({ publicKey: 'receiver' }),
        assetAuditors: [
          {
            asset: getConfidentialAssetInstance(),
            auditors: [getConfidentialAccountInstance({ publicKey: 'auditor' })],
          },
        ],
        mediators: [],
      },
    ],
    getInvolvedParties: [
      getIdentityInstance(),
      getIdentityInstance({ did: 'receiverDid' }),
      getIdentityInstance({ did: 'auditorDid' }),
    ],
  }),
  ['ConfidentialTransaction']
);

export const mockIdentityModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Identity: MockIdentityClass,
});

export const mockChildIdentityModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ChildIdentity: MockChildIdentityClass,
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

export const mockFungibleAssetModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  FungibleAsset: MockFungibleAssetClass,
});

export const mockNftCollectionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  NftCollection: MockNftCollectionClass,
});

export const mockNftModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Nft: MockNftClass,
});

export const mockBaseAssetModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  BaseAsset: MockBaseAssetClass,
});

export const mockMetadataEntryModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  MetadataEntry: MockMetadataEntryClass,
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

export const mockConfidentialAccountModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ConfidentialAccount: MockConfidentialAccountClass,
});

export const mockConfidentialAssetModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ConfidentialAsset: MockConfidentialAssetClass,
});

export const mockConfidentialVenueModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ConfidentialVenue: MockConfidentialVenueClass,
});

export const mockConfidentialTransactionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  ConfidentialTransaction: MockConfidentialTransactionClass,
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
  MockFungibleAssetClass.init(opts?.fungibleAssetOptions);
  MockNftCollectionClass.init(opts?.nftCollectionOptions);
  MockNftClass.init(opts?.nftOptions);
  MockBaseAssetClass.init(opts?.baseAssetOptions);
  MockMetadataEntryClass.init(opts?.metadataEntryOptions);
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
  MockConfidentialAccountClass.init(opts?.confidentialAccountOptions);
  MockConfidentialAssetClass.init(opts?.confidentialAssetOptions);
  MockConfidentialVenueClass.init(opts?.confidentialVenueOptions);
  MockConfidentialTransactionClass.init(opts?.confidentialTransactionOptions);
};

/**
 * @hidden
 *s
 * Configure mock classes (calling .reset will go back to the default configuration)
 */
export const configureMocks = function (opts?: MockOptions): void {
  MockIdentityClass.setOptions(opts?.identityOptions);
  MockChildIdentityClass.setOptions(opts?.childIdentityOptions);
  MockAccountClass.setOptions(opts?.accountOptions);
  MockSubsidyClass.setOptions(opts?.subsidyOptions);
  MockTickerReservationClass.setOptions(opts?.tickerReservationOptions);
  MockFungibleAssetClass.setOptions(opts?.fungibleAssetOptions);
  MockNftCollectionClass.setOptions(opts?.nftCollectionOptions);
  MockNftClass.setOptions(opts?.nftOptions);
  MockBaseAssetClass.setOptions(opts?.baseAssetOptions);
  MockMetadataEntryClass.setOptions(opts?.metadataEntryOptions);
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
  MockMultiSigClass.setOptions(opts?.multiSigOptions);
  MockMultiSigProposalClass.setOptions(opts?.multiSigProposalOptions);
  MockConfidentialAccountClass.setOptions(opts?.confidentialAccountOptions);
  MockConfidentialAssetClass.setOptions(opts?.confidentialAssetOptions);
  MockConfidentialVenueClass.setOptions(opts?.confidentialVenueOptions);
  MockConfidentialTransactionClass.setOptions(opts?.confidentialTransactionOptions);
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
  MockFungibleAssetClass.resetOptions();
  MockNftCollectionClass.resetOptions();
  MockBaseAssetClass.resetOptions();
  MockMetadataEntryClass.resetOptions();
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
  MockMultiSigClass.resetOptions();
  MockMultiSigProposalClass.resetOptions();
  MockConfidentialAccountClass.resetOptions();
  MockConfidentialAssetClass.resetOptions();
  MockConfidentialVenueClass.resetOptions();
  MockConfidentialTransactionClass.resetOptions();
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
 * Retrieve an Identity instance
 */
export const getChildIdentityInstance = (opts?: ChildIdentityOptions): MockChildIdentity => {
  const instance = new MockChildIdentityClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockChildIdentity;
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
export const getBaseAssetInstance = (opts?: BaseAssetOptions): MockBaseAsset => {
  const instance = new MockBaseAssetClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockBaseAsset;
};

/**
 * @hidden
 * Retrieve a Asset instance
 */
export const getFungibleAssetInstance = (opts?: FungibleAssetOptions): MockFungibleAsset => {
  const instance = new MockFungibleAssetClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockFungibleAsset;
};

export const getNftCollectionInstance = (opts?: NftCollectionOptions): MockNftCollection => {
  const instance = new MockNftCollectionClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockNftCollection;
};

export const getNftInstance = (opts: NftOptions): MockNft => {
  const instance = new MockNftClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockNft;
};

/**
 * @hidden
 * Retrieve a MetadataEntry instance
 */
export const getMetadataEntryInstance = (opts?: MetadataEntryOptions): MockMetadataEntry => {
  const instance = new MockMetadataEntryClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockMetadataEntry;
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
 * Retrieve a Venue instance
 */
export const getConfidentialVenueInstance = (
  opts?: ConfidentialVenueOptions
): MockConfidentialVenue => {
  const instance = new MockConfidentialVenueClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockConfidentialVenue;
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

export const getConfidentialAccountInstance = (
  opts?: ConfidentialAccountOptions
): MockConfidentialAccount => {
  const instance = new MockConfidentialAccountClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockConfidentialAccount;
};

export const getConfidentialAssetInstance = (
  opts?: ConfidentialAssetOptions
): MockConfidentialAsset => {
  const instance = new MockConfidentialAssetClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockConfidentialAsset;
};

/**
 * @hidden
 * Retrieve an Instruction instance
 */
export const getConfidentialTransactionInstance = (
  opts?: ConfidentialTransactionOptions
): MockConfidentialTransaction => {
  const instance = new MockConfidentialTransactionClass();

  if (opts) {
    instance.configure(opts);
  }

  return instance as unknown as MockConfidentialTransaction;
};
