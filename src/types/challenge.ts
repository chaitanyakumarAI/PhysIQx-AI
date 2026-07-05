/**
 * Challenge / ChallengeParticipation — docs/DATA_MODELS.md "Challenge /
 * ChallengeParticipation". Time-boxed community competition.
 */
export interface ChallengeReward {
  /** e.g. "Top 10% earns" */
  tierLabel: string;
  /** e.g. "Legendary badge" */
  badgeName: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  unit: string;
  participantCount: number;
  daysLeft: number;
  reward: ChallengeReward;
}

export interface ChallengeParticipation {
  challengeId: string;
  progress: number;
  /** Derived — always progress/target, never hand-authored. */
  percent: number;
}
