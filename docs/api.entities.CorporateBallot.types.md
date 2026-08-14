[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/CorporateBallot/types

# api/entities/CorporateBallot/types

## Enumerations

### CorporateBallotStatus

Defined in: [api/entities/CorporateBallot/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L73)

#### Enumeration Members

##### Active

> **Active**: `"Active"`

Defined in: [api/entities/CorporateBallot/types.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L75)

##### Closed

> **Closed**: `"Closed"`

Defined in: [api/entities/CorporateBallot/types.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L76)

##### Pending

> **Pending**: `"Pending"`

Defined in: [api/entities/CorporateBallot/types.ts:74](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L74)

## Interfaces

### BallotMeta

Defined in: [api/entities/CorporateBallot/types.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L36)

#### Properties

##### motions

> **motions**: [`BallotMotion`](../wiki/#ballotmotion)[]

Defined in: [api/entities/CorporateBallot/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L45)

All the motions of the ballot, with their associated titles, choices, etc.

##### title

> **title**: `string`

Defined in: [api/entities/CorporateBallot/types.ts:40](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L40)

Title of the ballot.

***

### BallotMotion

Defined in: [api/entities/CorporateBallot/types.ts:3](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L3)

#### Properties

##### choices

> **choices**: `string`[]

Defined in: [api/entities/CorporateBallot/types.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L18)

Choices for the motion excluding abstain.

###### Note

Voting power not used is considered abstained.

##### infoLink

> **infoLink**: `string`

Defined in: [api/entities/CorporateBallot/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L12)

Link to more information about the motion.

##### title

> **title**: `string`

Defined in: [api/entities/CorporateBallot/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L7)

Title of the motion.

***

### CorporateBallotDetails

Defined in: [api/entities/CorporateBallot/types.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L48)

#### Properties

##### endDate

> **endDate**: `Date`

Defined in: [api/entities/CorporateBallot/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L57)

End date of the ballot.

##### meta

> **meta**: [`BallotMeta`](../wiki/#ballotmeta)

Defined in: [api/entities/CorporateBallot/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L62)

Metadata for the ballot.

##### rcv

> **rcv**: `boolean`

Defined in: [api/entities/CorporateBallot/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L70)

Whether Ranked-Choice Voting (RCV) has been enabled.

Ranked-Choice Voting allows voters to select a fallback choice should their first
preference fail to reach a certain threshold or, for example, be eliminated in the top-2 run-off.

##### startDate

> **startDate**: `Date`

Defined in: [api/entities/CorporateBallot/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L52)

Start date of the ballot.

## Type Aliases

### BallotVote

> **BallotVote** = `object`

Defined in: [api/entities/CorporateBallot/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L21)

#### Properties

##### fallback?

> `optional` **fallback?**: `BigNumber`

Defined in: [api/entities/CorporateBallot/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L33)

The fallback vote to be used if the choice is not found in the ballot.

###### Note

This is only allowed for RCV ballots.

###### Note

Must point to a choice in a motion (index of the choice in the motion choices array).

###### Note

Must not point to the same choice as the `vote` property (index != choiceIndex).

##### power

> **power**: `BigNumber`

Defined in: [api/entities/CorporateBallot/types.ts:25](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L25)

The power of the vote.

***

### ChoiceWithParticipation

> **ChoiceWithParticipation** = `object`

Defined in: [api/entities/CorporateBallot/types.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L110)

#### Properties

##### choice

> **choice**: `string`

Defined in: [api/entities/CorporateBallot/types.ts:114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L114)

The choice of the motion for which the votes are cast.

##### fallback?

> `optional` **fallback?**: `BigNumber`

Defined in: [api/entities/CorporateBallot/types.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L124)

The fallback choice for the vote.

##### power

> **power**: `BigNumber`

Defined in: [api/entities/CorporateBallot/types.ts:119](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L119)

The power of the vote.

***

### ChoiceWithVotes

> **ChoiceWithVotes** = `object`

Defined in: [api/entities/CorporateBallot/types.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L79)

#### Properties

##### choice

> **choice**: `string`

Defined in: [api/entities/CorporateBallot/types.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L83)

The choice of the motion for which the votes are cast.

##### votes

> **votes**: `BigNumber`

Defined in: [api/entities/CorporateBallot/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L88)

The number of votes for the choice.

***

### CorporateBallotMetaWithResults

> **CorporateBallotMetaWithResults** = `Omit`\<[`BallotMeta`](../wiki/#ballotmeta), `"motions"`\> & `object`

Defined in: [api/entities/CorporateBallot/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L103)

#### Type Declaration

##### motions

> **motions**: [`CorporateBallotMotionWithResults`](../wiki/#corporateballotmotionwithresults)[]

The motions with their associated choices and votes.

***

### CorporateBallotMotionWithParticipation

> **CorporateBallotMotionWithParticipation** = `Pick`\<[`BallotMotion`](../wiki/#ballotmotion), `"title"` \| `"infoLink"`\> & `object`

Defined in: [api/entities/CorporateBallot/types.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L127)

#### Type Declaration

##### choices

> **choices**: [`ChoiceWithParticipation`](../wiki/#choicewithparticipation)[]

The choices with their associated votes and fallback choices.

***

### CorporateBallotMotionWithResults

> **CorporateBallotMotionWithResults** = `Pick`\<[`BallotMotion`](../wiki/#ballotmotion), `"title"` \| `"infoLink"`\> & `object`

Defined in: [api/entities/CorporateBallot/types.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L91)

#### Type Declaration

##### choices

> **choices**: [`ChoiceWithVotes`](../wiki/#choicewithvotes)[]

The motion choices and their associated votes.

##### total

> **total**: `BigNumber`

The total number of votes cast for the motion.

***

### CorporateBallotWithParticipation

> **CorporateBallotWithParticipation** = `Omit`\<[`BallotMeta`](../wiki/#ballotmeta), `"motions"`\> & `object`

Defined in: [api/entities/CorporateBallot/types.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/CorporateBallot/types.ts#L134)

#### Type Declaration

##### motions

> **motions**: [`CorporateBallotMotionWithParticipation`](../wiki/#corporateballotmotionwithparticipation)[]

The motions with their associated choices and votes.
