import { PolymeshPrimitivesSettlementAffirmationRequirement } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetMandatoryReceiverAffirmation,
  prepareStorage,
  Storage,
} from '~/api/procedures/setMandatoryReceiverAffirmation';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Identity, ReceiverAffirmationRequirement, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setMandatoryReceiverAffirmation procedure', () => {
  let mockContext: Mocked<Context>;
  let mockSigningIdentity: Mocked<Identity>;
  let affirmationRequirementToMeshSpy: jest.SpyInstance;
  let rawAutomatic: PolymeshPrimitivesSettlementAffirmationRequirement;
  let rawRequired: PolymeshPrimitivesSettlementAffirmationRequirement;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    affirmationRequirementToMeshSpy = jest.spyOn(
      utilsConversionModule,
      'affirmationRequirementToMesh'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({ isV7: false });
    mockSigningIdentity = entityMockUtils.getIdentityInstance({ did: 'someDid' });
    mockContext.getSigningIdentity.mockResolvedValue(mockSigningIdentity);

    rawAutomatic = dsMockUtils.createMockAffirmationRequirement('Automatic');
    rawRequired = dsMockUtils.createMockAffirmationRequirement('Required');

    when(affirmationRequirementToMeshSpy)
      .calledWith(ReceiverAffirmationRequirement.Automatic, mockContext)
      .mockReturnValue(rawAutomatic);
    when(affirmationRequirementToMeshSpy)
      .calledWith(ReceiverAffirmationRequirement.Required, mockContext)
      .mockReturnValue(rawRequired);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw a NotSupported error when called on a v7 chain', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      identity: mockSigningIdentity,
    });
    mockContext.isV7 = true;

    return expect(
      prepareSetMandatoryReceiverAffirmation.call(proc, {
        did: 'someDid',
        requirement: ReceiverAffirmationRequirement.Required,
      })
    ).rejects.toThrow('setMandatoryReceiverAffirmation is not supported on v7 chains');
  });

  it('should throw a NoDataChange error when setting Required and it is already Required', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      identity: mockSigningIdentity,
    });

    dsMockUtils
      .createQueryMock('settlement', 'mandatoryReceiverAffirmation')
      .mockResolvedValue(dsMockUtils.createMockBool(true));

    return expect(
      prepareSetMandatoryReceiverAffirmation.call(proc, {
        did: 'someDid',
        requirement: ReceiverAffirmationRequirement.Required,
      })
    ).rejects.toThrow('The signing identity already requires mandatory receiver affirmation');
  });

  it('should throw a NoDataChange error when setting Automatic and it is already Automatic', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      identity: mockSigningIdentity,
    });

    dsMockUtils
      .createQueryMock('settlement', 'mandatoryReceiverAffirmation')
      .mockResolvedValue(dsMockUtils.createMockBool(false));

    return expect(
      prepareSetMandatoryReceiverAffirmation.call(proc, {
        did: 'someDid',
        requirement: ReceiverAffirmationRequirement.Automatic,
      })
    ).rejects.toThrow('The signing identity already has automatic receiver affirmation');
  });

  it('should return a setMandatoryReceiverAffirmation transaction spec when switching to Required', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      identity: mockSigningIdentity,
    });

    dsMockUtils
      .createQueryMock('settlement', 'mandatoryReceiverAffirmation')
      .mockResolvedValue(dsMockUtils.createMockBool(false));

    const transaction = dsMockUtils.createTxMock('settlement', 'setMandatoryReceiverAffirmation');

    const result = await prepareSetMandatoryReceiverAffirmation.call(proc, {
      did: 'someDid',
      requirement: ReceiverAffirmationRequirement.Required,
    });

    expect(result).toEqual({
      transaction,
      args: [rawRequired],
      resolver: undefined,
    });
  });

  it('should return a setMandatoryReceiverAffirmation transaction spec when switching to Automatic', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      identity: mockSigningIdentity,
    });

    dsMockUtils
      .createQueryMock('settlement', 'mandatoryReceiverAffirmation')
      .mockResolvedValue(dsMockUtils.createMockBool(true));

    const transaction = dsMockUtils.createTxMock('settlement', 'setMandatoryReceiverAffirmation');

    const result = await prepareSetMandatoryReceiverAffirmation.call(proc, {
      did: 'someDid',
      requirement: ReceiverAffirmationRequirement.Automatic,
    });

    expect(result).toEqual({
      transaction,
      args: [rawAutomatic],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return a signerPermissions error when the signing identity does not match the did', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        identity: mockSigningIdentity,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({ did: 'differentDid', requirement: ReceiverAffirmationRequirement.Required })
      ).toEqual({
        signerPermissions:
          'Only a signing key linked to the Identity can set its mandatory receiver affirmation',
      });
    });

    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        identity: mockSigningIdentity,
      });
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({ did: 'someDid', requirement: ReceiverAffirmationRequirement.Required })
      ).toEqual({
        permissions: {
          transactions: [TxTags.settlement.SetMandatoryReceiverAffirmation],
          assets: [],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the signing identity', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        identity: mockSigningIdentity,
      });
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc();

      expect(result).toEqual({ identity: mockSigningIdentity });
    });
  });
});
