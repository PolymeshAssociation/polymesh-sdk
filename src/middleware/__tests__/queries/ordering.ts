import { print } from 'graphql';

import { assetTransactionQuery } from '~/middleware/queries/assets';
import { customClaimTypeQuery } from '~/middleware/queries/claims';
import { distributionPaymentsQuery } from '~/middleware/queries/distributions';
import { eventsByArgs } from '~/middleware/queries/events';
import { tickerExternalAgentActionsQuery } from '~/middleware/queries/externalAgents';
import { extrinsicsByArgs } from '~/middleware/queries/extrinsics';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';
import { instructionAffirmationsQuery } from '~/middleware/queries/settlements';
import { investmentsQuery } from '~/middleware/queries/stos';
import {
  AssetTransactionsOrderBy,
  EventsOrderBy,
  InvestmentsOrderBy,
  MultiSigProposalsOrderBy,
} from '~/middleware/types';

/**
 * A paginated query needs an order that is both defined and unique, or `first`/`offset` can repeat
 * and skip rows. The indexer zero-pads block-derived ids, so `id` sorts as a number; an id that is
 * not block-derived is only ever a tiebreaker.
 */
describe('paginated query ordering', () => {
  const cases: [string, string][] = [
    ['assetTransactionQuery', print(assetTransactionQuery({ assetId: 'someAsset' }).query)],
    ['customClaimTypeQuery', print(customClaimTypeQuery().query)],
    [
      'distributionPaymentsQuery',
      print(distributionPaymentsQuery({ distributionId: 'someId' }).query),
    ],
    ['eventsByArgs', print(eventsByArgs({}).query)],
    [
      'tickerExternalAgentActionsQuery',
      print(tickerExternalAgentActionsQuery({ assetId: 'someAsset' }).query),
    ],
    ['extrinsicsByArgs', print(extrinsicsByArgs({}).query)],
    ['multiSigProposalsQuery', print(multiSigProposalsQuery({ multisigId: 'someAddress' }).query)],
    ['polyxTransactionsQuery', print(polyxTransactionsQuery({}).query)],
    [
      'instructionAffirmationsQuery',
      print(instructionAffirmationsQuery({ instructionId: '1' }).query),
    ],
    ['investmentsQuery', print(investmentsQuery({ stoId: 1, offeringAssetId: 'someAsset' }).query)],
  ];

  it.each(cases)('%s should order its results', (_name, query) => {
    expect(query).toContain('orderBy:');
  });

  it('should order by an id that is unique, not by block alone', () => {
    const byId: Record<string, string> = {
      assetTransactionQuery: 'orderBy: [ID_ASC]',
      distributionPaymentsQuery: 'orderBy: [ID_ASC]',
      eventsByArgs: 'orderBy: [ID_ASC]',
      extrinsicsByArgs: 'orderBy: [ID_ASC]',
      investmentsQuery: 'orderBy: [ID_ASC]',
      polyxTransactionsQuery: 'orderBy: [ID_DESC]',
      tickerExternalAgentActionsQuery: 'orderBy: [ID_DESC]',
    };

    cases
      .filter(([name]) => byId[name])
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .forEach(([name, query]) => expect(query).toContain(byId[name]!));
  });

  it('should use a unique tiebreaker where the id is not block derived', () => {
    const [, customClaimTypes] = cases.find(([name]) => name === 'customClaimTypeQuery')!;
    const [, affirmations] = cases.find(([name]) => name === 'instructionAffirmationsQuery')!;

    expect(customClaimTypes).toContain('orderBy: [CREATED_BLOCK_ID_ASC, ID_ASC]');
    expect(affirmations).toContain('orderBy: [CREATED_BLOCK_ID_DESC, ID_DESC]');
  });

  it('should prefer a composite event id over a block id plus a tiebreaker', () => {
    // `instructions` and `instructionEvents` already order this way
    const [, affirmations] = cases.find(([name]) => name === 'instructionAffirmationsQuery')!;

    // `InstructionAffirmation` has no `createdEvent`, so `id` is the only unique column available
    expect(affirmations).not.toContain('CREATED_EVENT_ID');
  });

  it('should let a caller replace the default order', () => {
    expect(
      print(
        assetTransactionQuery(
          { assetId: 'someAsset' },
          undefined,
          undefined,
          AssetTransactionsOrderBy.DatetimeDesc
        ).query
      )
    ).toContain('orderBy: [DATETIME_DESC]');
    expect(
      print(eventsByArgs({}, undefined, undefined, EventsOrderBy.BlockIdDesc).query)
    ).toContain('orderBy: [BLOCK_ID_DESC]');
    expect(
      print(
        multiSigProposalsQuery(
          { multisigId: 'someAddress' },
          undefined,
          undefined,
          MultiSigProposalsOrderBy.ProposalIdAsc
        ).query
      )
    ).toContain('orderBy: [PROPOSAL_ID_ASC]');
    expect(
      print(
        investmentsQuery(
          { stoId: 1, offeringAssetId: 'someAsset' },
          undefined,
          undefined,
          InvestmentsOrderBy.DatetimeAsc
        ).query
      )
    ).toContain('orderBy: [DATETIME_ASC]');
  });

  it('should order MultiSig proposals numerically, since their id embeds an unpadded number', () => {
    const [, proposals] = cases.find(([name]) => name === 'multiSigProposalsQuery')!;

    expect(proposals).toContain('orderBy: [PROPOSAL_ID_DESC]');
    // ordering by `id` would place proposal 10 before proposal 9
    expect(proposals).not.toContain('orderBy: [ID_DESC]');
  });
});
