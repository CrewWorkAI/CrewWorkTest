import React from 'react';

/**
 * Props for a single battle entry.
 * @property id Unique battle identifier.
 * @property haiku1 First haiku text.
 * @property haiku2 Second haiku text.
 * @property submitter1 Name of first submitter.
 * @property submitter2 Name of second submitter.
 * @property onVote Callback with chosen haiku id.
 */
interface BattleCardProps {
  id: string;
  haiku1: string;
  haiku2: string;
  submitter1: string;
  submitter2: string;
  onVote: (battleId: string, winner: 1 | 2) => void;
}

const BattleCard: React.FC<BattleCardProps> = ({
  id,
  haiku1,
  haiku2,
  submitter1,
  submitter2,
  onVote,
}) => {
  const handleVote = (winner: 1 | 2) => {
    onVote(id, winner);
  };

  return (
    <div className="card">
      <h4>Battle #{id}</h4>
      <div className="grid grid-sm" style={{ marginBottom: '12px' }}>
        <div>
          <p>{haiku1}</p>
          <p><strong>— {submitter1}</strong></p>
          <button className="button" onClick={() => handleVote(1)}>
            Vote
          </button>
        </div>
        <div>
          <p>{haiku2}</p>
          <p><strong>— {submitter2}</strong></p>
          <button className="button" onClick={() => handleVote(2)}>
            Vote
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleCard;
