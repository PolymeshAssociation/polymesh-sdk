import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, Entity, PermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

describe('PermissionGroup class', () => {
  const ticker = 'TOKENNAME';

  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(PermissionGroup.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign id to instance', () => {
      const id = new BigNumber(1);
      const agentGroup = new PermissionGroup({ id, ticker }, context);

      expect(agentGroup.id).toBe(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(PermissionGroup.isUniqueIdentifiers({ id: new BigNumber(1), ticker })).toBe(true);
      expect(PermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(PermissionGroup.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const agentGroup = new PermissionGroup({ id: new BigNumber(1), ticker }, context);
      expect(agentGroup.toJson()).toBe('1');
    });
  });

  describe('method: details', () => {
    test('should return the Permission Group details ', async () => {
      const id = new BigNumber(1);
      const agentGroup = new PermissionGroup({ id, ticker }, context);

      sinon.stub(utilsConversionModule, 'stringToTicker');
      sinon.stub(utilsConversionModule, 'numberToU32');

      dsMockUtils.createQueryStub('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions({
            These: [
              /* eslint-disable @typescript-eslint/naming-convention */
              dsMockUtils.createMockPalletPermissions({
                pallet_name: dsMockUtils.createMockPalletName('Sto'),
                dispatchable_names: dsMockUtils.createMockDispatchableNames({
                  These: [dsMockUtils.createMockDispatchableName('invest')],
                }),
              }),
              dsMockUtils.createMockPalletPermissions({
                pallet_name: dsMockUtils.createMockPalletName('Identity'),
                dispatchable_names: dsMockUtils.createMockDispatchableNames({
                  These: [dsMockUtils.createMockDispatchableName('add_claim')],
                }),
              }),
              /* eslint-enable @typescript-eslint/naming-convention */
            ],
          })
        ),
      });

      const result = await agentGroup.details();

      expect(result).toEqual({
        permissions: { type: 'Include', values: ['sto.invest', 'identity.addClaim'] },
        groups: [],
      });
    });
  });
});
