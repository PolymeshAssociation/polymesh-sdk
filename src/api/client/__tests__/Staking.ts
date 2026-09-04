import { Option, u32, u128 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PalletStakingActiveEraInfo } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Staking } from '~/api/client/Staking';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBool, createMockU128 } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { PolymeshTransaction } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Staking Class', () => {
  let mockContext: Mocked<Context>;
  let staking: Staking;

  let account: Account;
  let rawAddress: AccountId;

  let accountIdToStringSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    rawAddress = dsMockUtils.createMockAccountId();

    account = entityMockUtils.getAccountInstance();
    staking = new Staking(mockContext);
    accountIdToStringSpy = jest.spyOn(utilsConversionModule, 'accountIdToString');

    when(accountIdToStringSpy).calledWith(rawAddress).mockReturnValue(account.address);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: bond', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        payee: account,
        controller: account,
        rewardDestination: account,
        autoStake: false,
        amount,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.bond(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: unbond', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        amount,
        type: 'unbond',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.unbond(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: bondExtra', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        amount,
        type: 'bondExtra',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.bondExtra(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getConstants', () => {
    const setConsts = (): void => {
      dsMockUtils.setConstMock('staking', 'sessionsPerEra', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
      });
      dsMockUtils.setConstMock('staking', 'bondingDuration', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(7)),
      });
      dsMockUtils.setConstMock('staking', 'historyDepth', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(84)),
      });
      dsMockUtils.setConstMock('babe', 'epochDuration', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(300)),
      });
      dsMockUtils.setConstMock('babe', 'expectedBlockTime', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(6000)),
      });
      dsMockUtils.setConstMock('validators', 'fixedYearlyReward', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(140000000000000)),
      });
      dsMockUtils.setConstMock('validators', 'maxVariableInflationTotalIssuance', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(1000000000000000)),
      });
    };

    it('should return the staking constants', () => {
      setConsts();

      const result = staking.getConstants();

      expect(result.sessionsPerEra).toEqual(new BigNumber(3));
      expect(result.historyDepth).toEqual(new BigNumber(84));
      expect(result.slotsPerSession).toEqual(new BigNumber(300));
      expect(result.expectedBlockTime).toEqual(new BigNumber(6000));
      expect(result.bondingDuration).toEqual(new BigNumber(7));
      // returned as POLYX, not base units — mainnet's 140M POLYX yearly cap
      expect(result.fixedYearlyReward).toEqual(new BigNumber(140000000));
      expect(result.maxVariableInflationTotalIssuance).toEqual(new BigNumber(1000000000));
    });

    it('should derive the era duration from the block time, session and era constants', () => {
      setConsts();

      // 6000ms * 300 slots * 3 sessions = 90 minutes
      expect(staking.getConstants().eraDuration).toEqual(new BigNumber(5400000));
    });

    it('should count eras per year against the Julian year the chain uses', () => {
      setConsts();

      const { erasPerYear } = staking.getConstants();

      // 365.25 days of 90 minute eras, not 365
      expect(erasPerYear).toEqual(new BigNumber(31557600000).dividedBy(5400000));
      expect(erasPerYear.toNumber()).toBeCloseTo(5844, 0);
    });
  });

  describe('method: eraProgress', () => {
    /*
     * 300 slots per session, 3 sessions per era, so 900 slots per era. The active era is anchored
     *   to session 30; the chain recorded that session opening at block 13000, and the header of
     *   that block names the slot it was authored in
     */
    const slotsPerSession = 300;
    const eraStartSession = 30;
    const eraStartBlock = 13000;
    const eraStartSlot = 41_000;
    const eraStartedAt = 1_700_000_000_000;

    let queryMultiMock: jest.Mock;

    beforeEach(() => {
      dsMockUtils.setConstMock('staking', 'sessionsPerEra', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
      });
      dsMockUtils.setConstMock('staking', 'bondingDuration', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(7)),
      });
      dsMockUtils.setConstMock('staking', 'historyDepth', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(84)),
      });
      dsMockUtils.setConstMock('babe', 'epochDuration', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(slotsPerSession)),
      });
      dsMockUtils.setConstMock('babe', 'expectedBlockTime', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(6000)),
      });
      dsMockUtils.setConstMock('validators', 'fixedYearlyReward', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(140000000000000)),
      });
      dsMockUtils.setConstMock('validators', 'maxVariableInflationTotalIssuance', {
        returnValue: dsMockUtils.createMockBalance(new BigNumber(1000000000000000)),
      });

      dsMockUtils.createQueryMock('staking', 'erasStartSessionIndex', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockU32(new BigNumber(eraStartSession))
        ),
      });

      /* the values come back through `queryMulti`, but the entries must exist to be passed to it */
      dsMockUtils.createQueryMock('staking', 'activeEra');
      dsMockUtils.createQueryMock('staking', 'currentEra');
      dsMockUtils.createQueryMock('session', 'currentIndex');
      dsMockUtils.createQueryMock('babe', 'currentSlot');
      dsMockUtils.createQueryMock('babe', 'epochStart');

      queryMultiMock = dsMockUtils.getQueryMultiMock();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    /**
     * The epoch began on `epochStartBlock`, whose header names `epochStartSlot`. `getBlockHash` and
     *   `getHeader` are what the SDK reads that header with, and `createType` decodes the
     *   pre-runtime digest it finds there
     */
    const mockEpochStartBlock = (epochStartBlock: number, epochStartSlot: number): void => {
      const blockHash = dsMockUtils.createMockHash(`0xblock${epochStartBlock}`);
      const payload = dsMockUtils.createMockBytes(`0xdigest${epochStartSlot}`);

      when(dsMockUtils.createRpcMock('chain', 'getBlockHash'))
        .calledWith(expect.objectContaining({ toString: expect.anything() }))
        .mockResolvedValue(blockHash);

      dsMockUtils.createRpcMock('chain', 'getHeader', {
        returnValue: dsMockUtils.createMockHeader({
          parentHash: dsMockUtils.createMockHash(),
          number: dsMockUtils.createMockCompact(
            dsMockUtils.createMockU32(new BigNumber(epochStartBlock))
          ),
          stateRoot: dsMockUtils.createMockHash(),
          extrinsicsRoot: dsMockUtils.createMockHash(),
          digest: {
            logs: [
              dsMockUtils.createMockDigestItem({
                PreRuntime: dsMockUtils.createMockTupleCodec([
                  dsMockUtils.createMockU8aFixed('BABE'),
                  payload,
                ]),
              }),
            ],
          },
        }),
      });

      when(mockContext.createType)
        .calledWith('SpConsensusBabeDigestsPreDigest', payload)
        .mockReturnValue(
          dsMockUtils.createMockBabePreDigest({
            SecondaryPlain: {
              authorityIndex: dsMockUtils.createMockU32(new BigNumber(0)),
              slot: dsMockUtils.createMockU64(new BigNumber(epochStartSlot)),
            },
          })
        );
    };

    /**
     * @param sessionsIn - how many sessions of the era are already behind the chain
     * @param slotsIntoSession - how far into the current session the chain is
     */
    const mockProgress = (
      sessionsIn: number,
      slotsIntoSession: number,
      opts: {
        start?: number | null;
        activeEra?: number;
        plannedEra?: number | null;
        epochStartBlock?: number;
        epochStartSlot?: number;
      } = {}
    ): void => {
      const {
        start = eraStartedAt,
        activeEra = 7131,
        plannedEra = activeEra,
        epochStartBlock = eraStartBlock + sessionsIn * slotsPerSession,
        epochStartSlot = eraStartSlot + sessionsIn * slotsPerSession,
      } = opts;

      mockEpochStartBlock(epochStartBlock, epochStartSlot);

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockActiveEraInfo({
            index: dsMockUtils.createMockU32(new BigNumber(activeEra)),
            start:
              start === null
                ? dsMockUtils.createMockOption()
                : dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(start))),
          })
        ),
        plannedEra === null
          ? dsMockUtils.createMockOption()
          : dsMockUtils.createMockOption(dsMockUtils.createMockU32(new BigNumber(plannedEra))),
        dsMockUtils.createMockU32(new BigNumber(eraStartSession + sessionsIn)),
        dsMockUtils.createMockU64(new BigNumber(epochStartSlot + slotsIntoSession)),
        dsMockUtils.createMockTupleCodec([
          dsMockUtils.createMockU32(new BigNumber(Math.max(epochStartBlock - slotsPerSession, 0))),
          dsMockUtils.createMockU32(new BigNumber(epochStartBlock)),
        ]),
      ]);
    };

    it('should count era and session progress in slots', async () => {
      // one full session done, plus 150 slots into the second: 450 of 900 slots
      mockProgress(1, 150);

      const result = await staking.eraProgress();

      expect(result.era.index).toEqual(new BigNumber(7131));
      expect(result.era.start).toEqual(new Date(eraStartedAt));
      expect(result.era.progress.elapsed).toEqual(new BigNumber(450));
      expect(result.era.progress.total).toEqual(new BigNumber(900));
      expect(result.era.progress.progress).toEqual(new BigNumber(0.5));
      expect(result.era.progress.remaining).toEqual(new BigNumber(450 * 6000));

      expect(result.session.index).toEqual(new BigNumber(eraStartSession + 1));
      expect(result.session.inEra).toEqual(new BigNumber(2));
      expect(result.session.perEra).toEqual(new BigNumber(3));
      expect(result.session.progress.elapsed).toEqual(new BigNumber(150));
      expect(result.session.progress.total).toEqual(new BigNumber(300));
      expect(result.session.progress.progress).toEqual(new BigNumber(0.5));
      expect(result.session.progress.remaining).toEqual(new BigNumber(150 * 6000));
    });

    it('should read block 1 where no rotation has been recorded yet', async () => {
      /* `babe.epochStart` is `(0, 0)` until the first rotation, and the chain opens epoch 0 at
       * block 1 — so that is the header the slot has to come from */
      const bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');

      mockProgress(0, 150, { epochStartBlock: 0 });

      const result = await staking.eraProgress();

      expect(bigNumberToU32Spy).toHaveBeenCalledWith(new BigNumber(1), mockContext);
      expect(result.session.progress.elapsed).toEqual(new BigNumber(150));
    });

    it('should stay local to the epoch on a chain that skipped epochs', async () => {
      /*
       * a chain paused mid-era and restarted rotates the epoch on its next block, and the slot it
       *   resumes in bears no relation to `genesisSlot + epochIndex * slotsPerSession`. Progress
       *   counts forward from the slot that block was authored in, so the gap cannot reach it
       */
      mockProgress(2, 12, { epochStartBlock: 90_000, epochStartSlot: 8_000_000 });

      const result = await staking.eraProgress();

      expect(result.session.progress.elapsed).toEqual(new BigNumber(12));
      expect(result.session.inEra).toEqual(new BigNumber(3));
      expect(result.era.progress.elapsed).toEqual(new BigNumber(2 * slotsPerSession + 12));
    });

    it('should report zero progress at the very start of an era', async () => {
      mockProgress(0, 0);

      const result = await staking.eraProgress();

      expect(result.era.progress.progress).toEqual(new BigNumber(0));
      expect(result.era.progress.remaining).toEqual(new BigNumber(900 * 6000));
      expect(result.session.inEra).toEqual(new BigNumber(1));
    });

    it('should clamp an overdue era rather than reporting past the end', async () => {
      // a fourth session in a three session era, which happens when the rotation is late
      mockProgress(3, 200);

      const result = await staking.eraProgress();

      expect(result.era.progress.elapsed).toEqual(new BigNumber(1100));
      expect(result.era.progress.progress).toEqual(new BigNumber(1));
      expect(result.era.progress.remaining).toEqual(new BigNumber(0));
      expect(result.session.inEra).toEqual(new BigNumber(3));
    });

    it('should report progress for an era whose start the chain has not recorded', async () => {
      mockProgress(1, 150, { start: null });

      const result = await staking.eraProgress();

      expect(result.era.start).toBeNull();
      expect(result.era.progress.progress).toEqual(new BigNumber(0.5));
    });

    it('should report the planned era separately from the active one', async () => {
      mockProgress(2, 0, { activeEra: 7131, plannedEra: 7132 });

      const result = await staking.eraProgress();

      expect(result.era.index).toEqual(new BigNumber(7131));
      expect(result.era.planned).toEqual(new BigNumber(7132));
    });

    it('should fall back to the active era where the chain has planned none', async () => {
      mockProgress(1, 150, { activeEra: 7131, plannedEra: null });

      const result = await staking.eraProgress();

      expect(result.era.index).toEqual(new BigNumber(7131));
      expect(result.era.planned).toEqual(new BigNumber(7131));
    });

    it('should anchor to session 0 where the chain has pruned the era start', async () => {
      dsMockUtils.createQueryMock('staking', 'erasStartSessionIndex', {
        returnValue: dsMockUtils.createMockOption(),
      });
      mockProgress(1, 150);

      const result = await staking.eraProgress();

      // without an anchor every session since genesis counts, so the era reads as overdue
      expect(result.era.progress.progress).toEqual(new BigNumber(1));
    });

    it('should throw if there is no active era', () => {
      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockOption(),
        dsMockUtils.createMockU32(new BigNumber(0)),
        dsMockUtils.createMockU32(new BigNumber(0)),
        dsMockUtils.createMockTupleCodec([
          dsMockUtils.createMockU32(new BigNumber(0)),
          dsMockUtils.createMockU32(new BigNumber(0)),
        ]),
      ]);

      return expect(staking.eraProgress()).rejects.toThrow('There is no active staking era');
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = jest.fn();

      mockEpochStartBlock(eraStartBlock + slotsPerSession, eraStartSlot + slotsPerSession);

      queryMultiMock.mockImplementation(async (_, cb) => {
        await cb([
          dsMockUtils.createMockOption(
            dsMockUtils.createMockActiveEraInfo({
              index: dsMockUtils.createMockU32(new BigNumber(7131)),
              start: dsMockUtils.createMockOption(
                dsMockUtils.createMockU64(new BigNumber(eraStartedAt))
              ),
            })
          ),
          dsMockUtils.createMockOption(dsMockUtils.createMockU32(new BigNumber(7131))),
          dsMockUtils.createMockU32(new BigNumber(eraStartSession + 1)),
          dsMockUtils.createMockU64(new BigNumber(eraStartSlot + slotsPerSession + 150)),
          dsMockUtils.createMockTupleCodec([
            dsMockUtils.createMockU32(new BigNumber(eraStartBlock)),
            dsMockUtils.createMockU32(new BigNumber(eraStartBlock + slotsPerSession)),
          ]),
        ]);

        return unsubCallback;
      });

      const result = await staking.eraProgress(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          era: expect.objectContaining({ index: new BigNumber(7131) }),
          session: expect.objectContaining({ inEra: new BigNumber(2) }),
        })
      );
    });
  });

  describe('per-era reads', () => {
    const era = new BigNumber(7131);

    beforeEach(() => {
      // the entity mock's address is not a real SS58 string, so the codec conversion is stubbed
      when(jest.spyOn(utilsConversionModule, 'stringToAccountId'))
        .calledWith(account.address, mockContext)
        .mockReturnValue(rawAddress);
    });

    const mockActiveEraIndex = (index: number): void => {
      dsMockUtils.createQueryMock('staking', 'activeEra', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockActiveEraInfo({
            index: dsMockUtils.createMockU32(new BigNumber(index)),
            start: dsMockUtils.createMockOption(dsMockUtils.createMockU64(new BigNumber(1))),
          })
        ),
      });
    };

    describe('method: getEraRewardPoints', () => {
      it('should return the total and each validator that authored a block', async () => {
        const individual = new Map([[rawAddress, dsMockUtils.createMockU32(new BigNumber(120))]]);

        dsMockUtils.createQueryMock('staking', 'erasRewardPoints', {
          returnValue: dsMockUtils.createMockEraRewardPoints({
            total: dsMockUtils.createMockU32(new BigNumber(500)),
            individual: individual as never,
          }),
        });

        const result = await staking.getEraRewardPoints(era);

        expect(result.total).toEqual(new BigNumber(500));
        expect(result.individual).toHaveLength(1);
        expect(result.individual[0]?.points).toEqual(new BigNumber(120));
        expect(result.individual[0]?.account.address).toBe(account.address);
      });

      it('should allow subscription to the active era', async () => {
        const unsubCallback = 'unsubCallback';
        const callback = jest.fn();

        mockActiveEraIndex(era.toNumber());

        dsMockUtils
          .createQueryMock('staking', 'erasRewardPoints')
          .mockImplementation((_rawEra: unknown, cb: (points: unknown) => void) => {
            cb(
              dsMockUtils.createMockEraRewardPoints({
                total: dsMockUtils.createMockU32(new BigNumber(500)),
                individual: new Map([
                  [rawAddress, dsMockUtils.createMockU32(new BigNumber(120))],
                ]) as never,
              })
            );

            return unsubCallback;
          });

        const result = await staking.getEraRewardPoints(callback);

        expect(result).toEqual(unsubCallback);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ total: new BigNumber(500) })
        );
      });

      it('should allow subscription to a specific era', async () => {
        const unsubCallback = 'unsubCallback';
        const callback = jest.fn();

        dsMockUtils
          .createQueryMock('staking', 'erasRewardPoints')
          .mockImplementation((_rawEra: unknown, cb: (points: unknown) => void) => {
            cb(
              dsMockUtils.createMockEraRewardPoints({
                total: dsMockUtils.createMockU32(new BigNumber(42)),
                individual: new Map() as never,
              })
            );

            return unsubCallback;
          });

        const result = await staking.getEraRewardPoints(era, callback);

        expect(result).toEqual(unsubCallback);
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ total: new BigNumber(42) })
        );
      });

      it('should default to the active era', async () => {
        mockActiveEraIndex(42);

        const pointsMock = dsMockUtils.createQueryMock('staking', 'erasRewardPoints', {
          returnValue: dsMockUtils.createMockEraRewardPoints({
            total: dsMockUtils.createMockU32(new BigNumber(1)),
            individual: new Map() as never,
          }),
        });

        await staking.getEraRewardPoints();

        expect(pointsMock).toHaveBeenCalledWith(
          expect.objectContaining({ toString: expect.anything() })
        );
      });

      it('should throw if defaulting to the active era when there is none', () => {
        dsMockUtils.createQueryMock('staking', 'activeEra', {
          returnValue: dsMockUtils.createMockOption(),
        });

        return expect(staking.getEraRewardPoints()).rejects.toThrow(
          'There is no active staking era'
        );
      });
    });

    describe('method: getEraValidatorReward', () => {
      it('should return the payout for the era', async () => {
        dsMockUtils.createQueryMock('staking', 'erasValidatorReward', {
          returnValue: dsMockUtils.createMockOption(
            dsMockUtils.createMockBalance(new BigNumber(3000000))
          ),
        });

        // returned as POLYX, not base units
        await expect(staking.getEraValidatorReward(era)).resolves.toEqual(new BigNumber(3));
      });

      it('should return null for an era with no recorded payout', async () => {
        dsMockUtils.createQueryMock('staking', 'erasValidatorReward', {
          returnValue: dsMockUtils.createMockOption(),
        });

        await expect(staking.getEraValidatorReward(era)).resolves.toBeNull();
      });
    });

    describe('method: getEraStartSession', () => {
      it('should return the session the era began at', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStartSessionIndex', {
          returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockU32(new BigNumber(900))),
        });

        await expect(staking.getEraStartSession(era)).resolves.toEqual(new BigNumber(900));
      });

      it('should return null outside the history depth', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStartSessionIndex', {
          returnValue: dsMockUtils.createMockOption(),
        });

        await expect(staking.getEraStartSession(era)).resolves.toBeNull();
      });
    });

    describe('method: getEraExposure', () => {
      it('should return the exposure split', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStakersOverview', {
          returnValue: dsMockUtils.createMockOption(
            dsMockUtils.createMockPagedExposureMetadata({
              total: dsMockUtils.createMockCompact(
                dsMockUtils.createMockU128(new BigNumber(5000000))
              ),
              own: dsMockUtils.createMockCompact(
                dsMockUtils.createMockU128(new BigNumber(1000000))
              ),
              nominatorCount: dsMockUtils.createMockU32(new BigNumber(12)),
              pageCount: dsMockUtils.createMockU32(new BigNumber(2)),
            })
          ),
        });

        const result = await staking.getEraExposure({ validator: account, era });

        expect(result).toEqual({
          total: new BigNumber(5),
          own: new BigNumber(1),
          nominatorCount: new BigNumber(12),
          pageCount: new BigNumber(2),
        });
      });

      it('should return null if the account was not in the validator set', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStakersOverview', {
          returnValue: dsMockUtils.createMockOption(),
        });

        await expect(staking.getEraExposure({ validator: account, era })).resolves.toBeNull();
      });
    });

    describe('method: getEraNominators', () => {
      it('should return one page of nominators', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStakersPaged', {
          returnValue: dsMockUtils.createMockOption(
            dsMockUtils.createMockExposurePage({
              pageTotal: dsMockUtils.createMockCompact(
                dsMockUtils.createMockU128(new BigNumber(4000000))
              ),
              others: [
                dsMockUtils.createMockIndividualExposure({
                  who: rawAddress,
                  value: dsMockUtils.createMockCompact(
                    dsMockUtils.createMockU128(new BigNumber(4000000))
                  ),
                }),
              ],
            })
          ),
        });

        const result = await staking.getEraNominators({ validator: account, era });

        expect(result?.pageTotal).toEqual(new BigNumber(4));
        expect(result?.nominators).toHaveLength(1);
        expect(result?.nominators[0]?.value).toEqual(new BigNumber(4));
        expect(result?.nominators[0]?.account.address).toBe(account.address);
      });

      it('should return null for a page that does not exist', async () => {
        dsMockUtils.createQueryMock('staking', 'erasStakersPaged', {
          returnValue: dsMockUtils.createMockOption(),
        });

        await expect(
          staking.getEraNominators({ validator: account, era, page: new BigNumber(9) })
        ).resolves.toBeNull();
      });
    });
  });

  describe('method: getActiveValidators', () => {
    it('should return the validators in force for the active era', async () => {
      dsMockUtils.createQueryMock('session', 'validators', {
        returnValue: [
          dsMockUtils.createMockAccountId('5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY'),
          dsMockUtils.createMockAccountId('5FCPTnjevGqAuTttetBy4a24Ej3pH9fiQ8fmvP1ZkrVsLUoT'),
        ],
      });

      const result = await staking.getActiveValidators();

      expect(result).toHaveLength(2);
      expect(result[0]?.address).toBe('5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY');
      expect(result[1]?.address).toBe('5FCPTnjevGqAuTttetBy4a24Ej3pH9fiQ8fmvP1ZkrVsLUoT');
    });

    it('should return an empty array where no set is in force', async () => {
      dsMockUtils.createQueryMock('session', 'validators', { returnValue: [] });

      await expect(staking.getActiveValidators()).resolves.toEqual([]);
    });
  });

  describe('method: getValidatorCount', () => {
    it('should return how many validators the chain aims to elect', async () => {
      dsMockUtils.createQueryMock('staking', 'validatorCount', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(20)),
      });

      await expect(staking.getValidatorCount()).resolves.toEqual(new BigNumber(20));
    });
  });

  describe('method: getElectionPhase', () => {
    it.each(['Off', 'Signed', 'Unsigned', 'Emergency'] as const)(
      'should return the %s phase',
      async phase => {
        dsMockUtils.createQueryMock('electionProviderMultiPhase', 'currentPhase', {
          returnValue: dsMockUtils.createMockElectionPhase(phase),
        });

        await expect(staking.getElectionPhase()).resolves.toBe(phase);
      }
    );

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = jest.fn();

      dsMockUtils
        .createQueryMock('electionProviderMultiPhase', 'currentPhase')
        .mockImplementation((cb: (phase: unknown) => void) => {
          cb(dsMockUtils.createMockElectionPhase('Signed'));

          return unsubCallback;
        });

      const result = await staking.getElectionPhase(callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toHaveBeenCalledWith('Signed');
    });
  });

  describe('method: rebond', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const amount = new BigNumber(3);

      const args = {
        amount,
        type: 'rebond',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.rebond({ amount });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: chill', () => {
    it('should prepare the procedure with the correct context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: undefined, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.chill();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: withdraw', () => {
    it('should prepare the procedure with the correct context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: undefined, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.withdraw();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: nominate', () => {
    it('should prepare the procedure with the correct context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { validators: [] }, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.nominate({ validators: [] });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setController', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: undefined, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.setController();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setPayee', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        payee: 'someAccount',
        autoStake: false,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await staking.setPayee(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getValidators', () => {
    it('should return a list of validators', async () => {
      dsMockUtils.createQueryMock('staking', 'validators', {
        entries: [
          [
            [dsMockUtils.createMockAccountId('someAddress')],
            dsMockUtils.createMockValidatorPref({
              commission: dsMockUtils.createMockCompact(
                createMockU128(new BigNumber(10).times(10 ** 7))
              ),
              blocked: createMockBool(false),
            }),
          ],
        ],
      });

      const result = await staking.getValidators();
      expect(result).toEqual({
        data: [
          expect.objectContaining({
            account: expect.any(Account),
            blocked: false,
            commission: new BigNumber(10),
          }),
        ],
        next: null,
      });
    });
  });

  describe('method: getEraInfo', () => {
    const activeIndex = new BigNumber(7);
    const activeStart = new BigNumber(8);

    let rawActiveStart;
    let rawActiveIndex;
    let rawActiveEra: Option<PalletStakingActiveEraInfo>;
    let rawCurrentEra: Option<u32>;
    let rawPlannedSession: u32;
    let rawTotal: u128;

    let activeEraQueryMock: jest.SpyInstance;
    let currentEraQueryMock: jest.SpyInstance;
    let plannedSessionQueryMock: jest.SpyInstance;

    beforeEach(() => {
      rawActiveIndex = dsMockUtils.createMockU32(activeIndex);
      rawActiveStart = dsMockUtils.createMockOption(dsMockUtils.createMockU64(activeStart));
      rawActiveEra = dsMockUtils.createMockOption(
        dsMockUtils.createMockActiveEraInfo({
          index: rawActiveIndex,
          start: rawActiveStart,
        })
      );
      rawCurrentEra = dsMockUtils.createMockOption(dsMockUtils.createMockU32(new BigNumber(2)));
      rawPlannedSession = dsMockUtils.createMockU32(new BigNumber(3));
      // the chain returns a Balance in the smallest unit; 1e9 base units is 1,000 POLYX
      rawTotal = dsMockUtils.createMockU128(new BigNumber(1_000_000_000));

      activeEraQueryMock = dsMockUtils.createQueryMock('staking', 'activeEra', {
        returnValue: rawActiveEra,
      });

      currentEraQueryMock = dsMockUtils.createQueryMock('staking', 'currentEra', {
        returnValue: rawCurrentEra,
      });

      plannedSessionQueryMock = dsMockUtils.createQueryMock('staking', 'currentPlannedSession', {
        returnValue: rawPlannedSession,
      });

      dsMockUtils.createQueryMock('staking', 'erasTotalStake', {
        returnValue: rawTotal,
      });
    });

    it('should return era info', async () => {
      const result = await staking.eraInfo();

      expect(result).toEqual({
        activeEra: new BigNumber(7),
        activeEraStart: new BigNumber(8),
        currentEra: new BigNumber(2),
        plannedSession: new BigNumber(3),
        totalStaked: new BigNumber(1000),
      });
    });

    it('should handle queries returning None', async () => {
      dsMockUtils.createQueryMock('staking', 'activeEra', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('staking', 'currentEra', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await staking.eraInfo();

      expect(result).toEqual({
        activeEra: new BigNumber(0),
        activeEraStart: new BigNumber(0),
        currentEra: new BigNumber(0),
        plannedSession: new BigNumber(3),
        totalStaked: new BigNumber(1000),
      });
    });

    it('should handle subscription', async () => {
      const activeUnsub = jest.fn();
      const eraUnsub = jest.fn();
      const sessionUnsub = jest.fn();

      type CallbackSig = (arg: unknown) => void;

      activeEraQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawActiveEra);

        return activeUnsub;
      });

      currentEraQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawCurrentEra);

        return eraUnsub;
      });

      plannedSessionQueryMock.mockImplementation((cb: CallbackSig) => {
        cb(rawPlannedSession);

        return sessionUnsub;
      });

      const callback = jest.fn();

      const result = await staking.eraInfo(callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Function);

      // ensure all unsub functions have not been called
      expect(activeUnsub).not.toHaveBeenCalled();
      expect(eraUnsub).not.toHaveBeenCalled();
      expect(sessionUnsub).not.toHaveBeenCalled();

      expect(() => result()).not.toThrow();

      // ensure all unsub functions have been called now that unsub ran
      expect(activeUnsub).toHaveBeenCalled();
      expect(eraUnsub).toHaveBeenCalled();
      expect(sessionUnsub).toHaveBeenCalled();
    });
  });
});
