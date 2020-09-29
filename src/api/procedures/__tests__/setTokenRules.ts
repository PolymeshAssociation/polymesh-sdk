import { Vec } from '@polkadot/types';
import { AssetTransferRule, Rule as MeshRule, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { getRequiredRoles, Params, prepareSetTokenRules } from '~/api/procedures/setTokenRules';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Condition, RoleType, Rule } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('setTokenTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ruleToAssetTransferRuleStub: sinon.SinonStub<[Rule, Context], AssetTransferRule>;
  let assetTransferRuleToRuleStub: sinon.SinonStub<[AssetTransferRule], Rule>;
  let assetRulesMapStub: sinon.SinonStub;
  let ticker: string;
  let rules: Condition[][];
  let rawTicker: Ticker;
  let senderRules: MeshRule[][];
  let receiverRules: MeshRule[][];
  let rawRules: AssetTransferRule[];
  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ruleToAssetTransferRuleStub = sinon.stub(utilsModule, 'ruleToAssetTransferRule');
    assetTransferRuleToRuleStub = sinon.stub(utilsModule, 'assetTransferRuleToRule');
    ticker = 'someTicker';
    rules = ([
      ['rule0', 'rule1'],
      ['rule1', 'rule2', 'rule3'],
      ['rule4'],
    ] as unknown) as Condition[][];
    senderRules = [
      ('senderRules0' as unknown) as MeshRule[],
      ('senderRules1' as unknown) as MeshRule[],
      ('senderRules2' as unknown) as MeshRule[],
    ];
    receiverRules = [
      ('receiverRules0' as unknown) as MeshRule[],
      ('receiverRules1' as unknown) as MeshRule[],
      ('receiverRules2' as unknown) as MeshRule[],
    ];
    rawRules = senderRules.map(
      (sRules, index) =>
        ({
          /* eslint-disable @typescript-eslint/camelcase */
          sender_rules: sRules,
          receiver_rules: receiverRules[index],
          /* eslint-enable @typescript-eslint/camelcase */
        } as AssetTransferRule)
    );
    rawTicker = dsMockUtils.createMockTicker(ticker);
    /* eslint-enable @typescript-eslint/camelcase */
    args = {
      ticker,
      rules,
    };
  });

  let addTransactionStub: sinon.SinonStub;

  let resetActiveRulesTransaction: PolymeshTx<[Ticker]>;
  let addActiveRuleTransaction: PolymeshTx<[Ticker, Vec<MeshRule>, Vec<MeshRule>]>;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    assetRulesMapStub = dsMockUtils.createQueryStub('complianceManager', 'assetRulesMap', {
      returnValue: [],
    });

    resetActiveRulesTransaction = dsMockUtils.createTxStub('complianceManager', 'resetActiveRules');
    addActiveRuleTransaction = dsMockUtils.createTxStub('complianceManager', 'addActiveRule');

    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    rules.forEach((rule, index) => {
      const assetTransferRule = dsMockUtils.createMockAssetTransferRule({
        /* eslint-disable @typescript-eslint/camelcase */
        sender_rules: senderRules[index],
        receiver_rules: receiverRules[index],
        rule_id: dsMockUtils.createMockU32(1),
        /* eslint-enable @typescript-eslint/camelcase */
      });
      ruleToAssetTransferRuleStub
        .withArgs({ conditions: rule, id: 1 }, mockContext)
        .returns(assetTransferRule);
      assetTransferRuleToRuleStub
        .withArgs(
          sinon.match({
            /* eslint-disable @typescript-eslint/camelcase */
            sender_rules: senderRules[index],
            receiver_rules: receiverRules[index],
            /* eslint-enable @typescript-eslint/camelcase */
          })
        )
        .returns({ conditions: rule, id: 1 });
    });
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the new list is the same as the current one', () => {
    assetRulesMapStub.withArgs(rawTicker).returns({
      rules: rawRules,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareSetTokenRules.call(proc, args)).rejects.toThrow(
      'The supplied rule list is equal to the current one'
    );
  });

  test('should add a reset rules transaction and add active rule transactions to the queue', async () => {
    const currentRules = rawRules.slice(0, -1);
    assetRulesMapStub.withArgs(rawTicker).returns({
      rules: currentRules,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenRules.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      resetActiveRulesTransaction,
      {},
      rawTicker
    );
    senderRules.forEach((sRules, index) => {
      sinon.assert.calledWith(
        addTransactionStub.getCall(index + 1),
        addActiveRuleTransaction,
        {},
        rawTicker,
        sRules,
        receiverRules[index]
      );
    });

    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add a remove claim issuers transaction if there are no default claim issuers set on the token', async () => {
    assetRulesMapStub.withArgs(rawTicker).returns({
      rules: [],
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenRules.call(proc, args);

    senderRules.forEach((sRules, index) => {
      sinon.assert.calledWith(
        addTransactionStub.getCall(index),
        addActiveRuleTransaction,
        {},
        rawTicker,
        sRules,
        receiverRules[index]
      );
    });
    sinon.assert.callCount(addTransactionStub, senderRules.length);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });

  test('should not add add active rule transactions if there are no claim issuers passed as arguments', async () => {
    const currentRules = rawRules;
    assetRulesMapStub.withArgs(rawTicker).returns({
      rules: currentRules,
    });
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareSetTokenRules.call(proc, { ...args, rules: [] });

    sinon.assert.calledWith(
      addTransactionStub.firstCall,
      resetActiveRulesTransaction,
      {},
      rawTicker
    );
    sinon.assert.calledOnce(addTransactionStub);
    expect(result).toMatchObject(new SecurityToken({ ticker }, mockContext));
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
