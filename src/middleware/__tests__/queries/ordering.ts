import { print } from 'graphql';

import { assetTransactionQuery } from '~/middleware/queries/assets';
import { customClaimTypeQuery } from '~/middleware/queries/claims';
import { distributionPaymentsQuery } from '~/middleware/queries/distributions';
import { eventsByArgs } from '~/middleware/queries/events';
import { assetAgentActionsQuery } from '~/middleware/queries/externalAgents';
import { extrinsicsByArgs } from '~/middleware/queries/extrinsics';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { polyxTransactionsQuery } from '~/middleware/queries/polyxTransactions';
import { instructionAffirmationsQuery } from '~/middleware/queries/settlements';
import { investmentsQuery } from '~/middleware/queries/stos';
import {
  AssetTransactionsOrderBy,
  EventIdEnum,
  EventsOrderBy,
  InvestmentsOrderBy,
  ModuleIdEnum,
  MultiSigProposalsOrderBy,
} from '~/middleware/types';

const assetId = 'someAsset';
const multisigId = 'someAddress';
const stoId = `${assetId}/1`;
const eventType = { moduleId: ModuleIdEnum.Asset, eventId: EventIdEnum.AssetCreated };

const ID_ASC = 'orderBy: [ID_ASC]';
const ID_DESC = 'orderBy: [ID_DESC]';

const AFFIRMATIONS = 'instructionAffirmationsQuery';
const CUSTOM_CLAIM_TYPES = 'customClaimTypeQuery';
const PROPOSALS = 'multiSigProposalsQuery';

/**
 * A paginated query needs an order that is both defined and unique, or `first`/`offset` can repeat
 * and skip rows. The indexer zero-pads block-derived ids, so `id` sorts as a number; an id that is
 * not block-derived is only ever a tiebreaker.
 */
describe('paginated query ordering', () => {
  const cases: [string, string][] = [
    ['assetTransactionQuery', print(assetTransactionQuery({ assetId }).query)],
    [CUSTOM_CLAIM_TYPES, print(customClaimTypeQuery().query)],
    ['distributionPaymentsQuery', print(distributionPaymentsQuery({ distributionId: '1' }).query)],
    ['eventsByArgs', print(eventsByArgs(eventType).query)],
    ['assetAgentActionsQuery', print(assetAgentActionsQuery({ assetId }).query)],
    ['extrinsicsByArgs', print(extrinsicsByArgs({}).query)],
    [PROPOSALS, print(multiSigProposalsQuery({ multisigId }).query)],
    ['polyxTransactionsQuery', print(polyxTransactionsQuery({}).query)],
    [AFFIRMATIONS, print(instructionAffirmationsQuery({ instructionId: '1' }).query)],
    ['investmentsQuery', print(investmentsQuery({ stoId }).query)],
  ];

  const queryFor = (name: string): string => {
    const found = cases.find(([caseName]) => caseName === name);

    if (!found) {
      throw new Error(`no case named ${name}`);
    }

    return found[1];
  };

  it.each(cases)('%s should order its results', (_name, query) => {
    expect(query).toContain('orderBy:');
  });

  it('should order by an id that is unique, not by block alone', () => {
    const expected: Record<string, string> = {
      assetTransactionQuery: ID_ASC,
      distributionPaymentsQuery: ID_ASC,
      eventsByArgs: ID_ASC,
      extrinsicsByArgs: ID_ASC,
      investmentsQuery: ID_ASC,
      polyxTransactionsQuery: ID_DESC,
      assetAgentActionsQuery: 'orderBy: [CREATED_EVENT_ID_DESC]',
    };

    Object.entries(expected).forEach(([name, order]) => expect(queryFor(name)).toContain(order));
  });

  it('should use a unique tiebreaker where the id is not block derived', () => {
    expect(queryFor(CUSTOM_CLAIM_TYPES)).toContain('orderBy: [CREATED_EVENT_ID_ASC, ID_ASC]');
  });

  it('should break ties between affirmations created by the same event', () => {
    // every holder's affirmation is created with the instruction, so they share `createdEventId`
    expect(queryFor(AFFIRMATIONS)).toContain('orderBy: [CREATED_EVENT_ID_DESC, ID_DESC]');
  });

  it('should order MultiSig proposals numerically, since their id embeds an unpadded number', () => {
    // ordering by `id` would place proposal 10 before proposal 9
    expect(queryFor(PROPOSALS)).toContain('orderBy: [PROPOSAL_ID_DESC]');
    expect(queryFor(PROPOSALS)).not.toContain(ID_DESC);
  });

  it('should keep the unique key behind whatever ordering a caller asks for', () => {
    const withOrder: [string, string][] = [
      [
        print(
          assetTransactionQuery(
            { assetId },
            undefined,
            undefined,
            AssetTransactionsOrderBy.CreatedEventIdDesc
          ).query
        ),
        'orderBy: [CREATED_EVENT_ID_DESC, ID_ASC]',
      ],
      [
        print(eventsByArgs(eventType, undefined, undefined, EventsOrderBy.BlockIdDesc).query),
        'orderBy: [BLOCK_ID_DESC, ID_ASC]',
      ],
      [
        print(
          multiSigProposalsQuery(
            { multisigId },
            undefined,
            undefined,
            MultiSigProposalsOrderBy.StatusAsc
          ).query
        ),
        'orderBy: [STATUS_ASC, PROPOSAL_ID_DESC]',
      ],
      [
        print(
          investmentsQuery({ stoId }, undefined, undefined, InvestmentsOrderBy.CreatedEventIdAsc)
            .query
        ),
        'orderBy: [CREATED_EVENT_ID_ASC, ID_ASC]',
      ],
    ];

    withOrder.forEach(([query, order]) => expect(query).toContain(order));
  });

  it('should order by every key a caller supplies, in the order they supplied them', () => {
    const query = print(
      investmentsQuery({ stoId }, undefined, undefined, [
        InvestmentsOrderBy.OfferingTokenAsc,
        InvestmentsOrderBy.CreatedEventIdDesc,
      ]).query
    );

    expect(query).toContain('orderBy: [OFFERING_TOKEN_ASC, CREATED_EVENT_ID_DESC, ID_ASC]');
  });

  it('should not append a key the caller already orders by, in either direction', () => {
    // the caller wants the newest first; appending `ID_ASC` behind it would say nothing, and
    // appending it *ahead* of their key would quietly ignore what they asked for
    const query = print(
      investmentsQuery({ stoId }, undefined, undefined, InvestmentsOrderBy.IdDesc).query
    );

    expect(query).toContain('orderBy: [ID_DESC]');
  });

  it('should order by the unique key alone when a caller supplies nothing', () => {
    expect(print(investmentsQuery({ stoId }).query)).toContain(ID_ASC);
  });
});
