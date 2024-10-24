import { when } from 'jest-when';

import { Identities } from '~/api/client/Identities';
import { createPortfolioTransformer } from '~/api/entities/Venue';
import {
  ChildIdentity,
  Context,
  Identity,
  NumberedPortfolio,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateChildIdentitiesParams, RotatePrimaryKeyToSecondaryParams } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Identities Class', () => {
  let context: Mocked<Context>;
  let identities: Identities;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identities = new Identities(context);
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

  describe('method: getIdentity', () => {
    it('should return an Identity object with the passed did', async () => {
      const params = { did: 'testDid' };

      const identity = new Identity(params, context);
      context.getIdentity.mockResolvedValue(identity);

      const result = await identities.getIdentity(params);

      expect(result).toMatchObject(identity);
    });
  });

  describe('method: getChildIdentity', () => {
    it('should return a ChildIdentity object with the passed did', async () => {
      const params = { did: 'testDid' };

      const childIdentity = new ChildIdentity(params, context);
      context.getChildIdentity.mockResolvedValue(childIdentity);

      const result = await identities.getChildIdentity(params);

      expect(result).toMatchObject(childIdentity);
    });
  });

  describe('method: createChild', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        secondaryKey: 'someChild',
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ChildIdentity>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createChild(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createChildren', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args: CreateChildIdentitiesParams = {
        childKeyAuths: [
          {
            key: 'someKey',
            authSignature: '0xsignature',
          },
        ],
        expiresAt: new Date('2050/01/01'),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<
        ChildIdentity[]
      >;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createChildren(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: registerIdentity', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        targetAccount: 'someTarget',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Identity>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.registerIdentity(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createPortfolio', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args = { name: 'someName' };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { portfolios: [{ ...args }] }, transformer: createPortfolioTransformer },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolio(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for creating custodyPortfolio', async () => {
      const args = { name: 'someName', ownerDid: 'someDid' };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { portfolios: [{ ...args }] }, transformer: createPortfolioTransformer },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolio(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: createPortfolios', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const args = { names: ['someName'] };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { portfolios: [{ name: args.names[0] }] }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolios(args);

      expect(tx).toBe(expectedTransaction);
    });

    it('should prepare the procedure and return the resulting transaction for creating custodyPortfolios', async () => {
      const args = { names: ['someName'], ownerDid: 'someDid' };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<NumberedPortfolio>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { portfolios: [{ name: args.names[0], ownerDid: args.ownerDid }] },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.createPortfolios(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: isIdentityValid', () => {
    it('should return true if the supplied Identity exists', async () => {
      const did = 'someDid';

      const result = await identities.isIdentityValid({
        identity: entityMockUtils.getIdentityInstance({ did }),
      });

      expect(result).toBe(true);
    });

    it('should return false if the supplied Identity is invalid', async () => {
      const did = 'someDid';
      entityMockUtils.configureMocks({ identityOptions: { exists: false } });

      const result = await identities.isIdentityValid({ identity: did });

      expect(result).toBe(false);
    });
  });

  describe('method: attestPrimaryKeyRotation', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        targetAccount: 'someAccount',
        identity: 'someDid',
        expiry: new Date('01/01/2040'),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.attestPrimaryKeyRotation(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: rotatePrimaryKey', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        targetAccount: 'someAccount',
        expiry: new Date('01/01/2050'),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.rotatePrimaryKey(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: rotatePrimaryKeyToSecondary', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args: RotatePrimaryKeyToSecondaryParams = {
        targetAccount: 'someAccount',
        expiry: new Date('01/01/2050'),
        permissions: {
          assets: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.rotatePrimaryKeyToSecondary(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: allowIdentityToCreatePortfolios', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        did: 'someDid',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.allowIdentityToCreatePortfolios(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: revokeIdentityToCreatePortfolios', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        did: 'someDid',
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await identities.revokeIdentityToCreatePortfolios(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getAllowedCustodians', () => {
    it('should return a list of allowed custodian dids', async () => {
      const did = 'someDid';
      const otherDid = 'otherDid';
      const identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');

      const rawOtherDid = dsMockUtils.createMockIdentityId(otherDid);

      dsMockUtils.createQueryMock('portfolio', 'allowedCustodians', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), rawOtherDid],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      when(identityIdToStringSpy).calledWith(rawOtherDid).mockReturnValue(otherDid);

      const result = await identities.getAllowedCustodians(did);

      expect(result).toEqual([otherDid]);
    });
  });
});
