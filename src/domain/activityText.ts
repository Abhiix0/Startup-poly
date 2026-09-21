import { OFFICIAL_BUSINESSES } from './economy';

export interface HumanActivityEvent {
  sentence: string;
  teamName: string | null;
  teamColor: string | null;
  deltaText?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  note?: string | null;
  isCorrection: boolean;
  category: 'money' | 'business' | 'system';
}

interface TeamLookup {
  id: string;
  name: string;
  color: string;
  slot?: number;
}

interface EventPayload {
  id: number;
  team_id: string | null;
  group_id: string | null;
  type: string;
  business_key?: string | null;
  prev?: any;
  new?: any;
  note?: string | null;
  is_correction?: boolean;
  created_at: string;
}

export function formatActivityEvent(
  event: EventPayload,
  teams: TeamLookup[] = []
): HumanActivityEvent {
  const team = teams.find((t) => t.id === event.team_id);
  const teamName = team?.name || (event.team_id ? 'Team' : null);
  const teamColor = team?.color || null;
  const isCorrection = Boolean(event.is_correction);
  const note = event.note || null;

  const bizKey = event.business_key || event.new?.business_key || event.prev?.business_key;
  const business = bizKey ? OFFICIAL_BUSINESSES.find((b) => b.key === bizKey) : null;
  const bizName = business?.name || (bizKey ? bizKey.toUpperCase() : 'Business');

  switch (event.type) {
    case 'CASH_SET': {
      const prevCash = event.prev?.cash ?? 0;
      const newCash = event.new?.cash ?? 0;
      const delta = newCash - prevCash;
      const deltaText =
        delta >= 0
          ? `+₹${delta.toLocaleString('en-IN')}`
          : `−₹${Math.abs(delta).toLocaleString('en-IN')}`;

      return {
        sentence: `${teamName || 'Team'} cash ₹${prevCash.toLocaleString('en-IN')} → ₹${newCash.toLocaleString('en-IN')}`,
        teamName,
        teamColor,
        deltaText,
        isPositive: delta >= 0,
        isNegative: delta < 0,
        note,
        isCorrection,
        category: 'money',
      };
    }

    case 'CV_SET': {
      const prevCv = event.prev?.cv ?? 0;
      const newCv = event.new?.cv ?? 0;
      const delta = newCv - prevCv;
      const deltaText =
        delta >= 0
          ? `+₹${delta.toLocaleString('en-IN')}`
          : `−₹${Math.abs(delta).toLocaleString('en-IN')}`;

      return {
        sentence: `${teamName || 'Team'} CV ₹${prevCv.toLocaleString('en-IN')} → ₹${newCv.toLocaleString('en-IN')}`,
        teamName,
        teamColor,
        deltaText,
        isPositive: delta >= 0,
        isNegative: delta < 0,
        note,
        isCorrection,
        category: 'money',
      };
    }

    case 'ADJUSTMENT': {
      const cashDelta = event.new?.cash_delta ?? 0;
      const cvDelta = event.new?.cv_delta ?? 0;
      const parts: string[] = [];
      if (cashDelta !== 0) {
        parts.push(`${cashDelta >= 0 ? '+' : '−'}₹${Math.abs(cashDelta).toLocaleString('en-IN')} cash`);
      }
      if (cvDelta !== 0) {
        parts.push(`${cvDelta >= 0 ? '+' : '−'}₹${Math.abs(cvDelta).toLocaleString('en-IN')} CV`);
      }

      return {
        sentence: `${teamName || 'Team'} adjustment: ${parts.join(', ') || 'No change'}`,
        teamName,
        teamColor,
        isPositive: cashDelta >= 0 && cvDelta >= 0,
        isNegative: cashDelta < 0 || cvDelta < 0,
        note,
        isCorrection,
        category: 'money',
      };
    }

    case 'BUSINESS_ADDED': {
      const applyPurchase = event.new?.apply_purchase !== false;
      const sentence = applyPurchase
        ? `${teamName || 'Team'} bought ${bizName}`
        : `${teamName || 'Team'} added ${bizName} (manual)`;

      return {
        sentence,
        teamName,
        teamColor,
        deltaText: applyPurchase && business ? `−₹${business.cost.toLocaleString('en-IN')}` : undefined,
        isNegative: applyPurchase,
        note,
        isCorrection,
        category: 'business',
      };
    }

    case 'BUSINESS_LEVEL_SET': {
      const newLevel = event.new?.level ?? 0;
      const applyUpgrade = event.new?.apply_upgrade !== false;
      const sentence = applyUpgrade
        ? `${teamName || 'Team'} upgraded ${bizName} to Level ${newLevel}`
        : `${teamName || 'Team'} set ${bizName} to Level ${newLevel}`;

      return {
        sentence,
        teamName,
        teamColor,
        note,
        isCorrection,
        category: 'business',
      };
    }

    case 'BUSINESS_REMOVED': {
      const reason = event.new?.reason;
      let sentence = `${teamName || 'Team'} removed ${bizName}`;
      let deltaText: string | undefined;
      let isPositive: boolean | undefined;

      if (reason === 'FORCED_SALE') {
        sentence = `${teamName || 'Team'} forced sale of ${bizName}`;
        if (business) {
          deltaText = `+₹${business.cost.toLocaleString('en-IN')}`;
          isPositive = true;
        }
      } else if (reason === 'BANKRUPTCY') {
        sentence = `${bizName} liquidated (bankruptcy)`;
      } else if (reason === 'CORRECTION') {
        sentence = `${teamName || 'Team'} removed ${bizName} (correction)`;
      }

      return {
        sentence,
        teamName,
        teamColor,
        deltaText,
        isPositive,
        note,
        isCorrection,
        category: 'business',
      };
    }

    case 'BANKRUPTCY_SET': {
      const isBankrupt = Boolean(event.new?.is_bankrupt);
      return {
        sentence: isBankrupt
          ? `${teamName || 'Team'} declared BANKRUPT`
          : `${teamName || 'Team'} bankruptcy revoked`,
        teamName,
        teamColor,
        isNegative: isBankrupt,
        isPositive: !isBankrupt,
        note,
        isCorrection,
        category: 'money',
      };
    }

    case 'GAME_STARTED':
      return {
        sentence: 'Game started (50-minute match)',
        teamName: null,
        teamColor: null,
        note,
        isCorrection,
        category: 'system',
      };

    case 'GAME_EXPIRED':
      return {
        sentence: 'Game time expired — scores frozen',
        teamName: null,
        teamColor: null,
        note,
        isCorrection,
        category: 'system',
      };

    case 'LOBBY_OPENED':
      return {
        sentence: 'Lobby opened for teams',
        teamName: null,
        teamColor: null,
        note,
        isCorrection,
        category: 'system',
      };

    case 'ROOM_CREATED':
      return {
        sentence: 'Tournament room created',
        teamName: null,
        teamColor: null,
        note,
        isCorrection,
        category: 'system',
      };

    case 'TEAM_JOINED':
      return {
        sentence: `${teamName || 'Team'} phone connected`,
        teamName,
        teamColor,
        note,
        isCorrection,
        category: 'system',
      };

    case 'TEAM_RELEASED':
      return {
        sentence: `${teamName || 'Team'} phone released by organizer`,
        teamName,
        teamColor,
        note,
        isCorrection,
        category: 'system',
      };

    case 'TIEBREAK_SET':
      return {
        sentence: 'Tiebreak order established',
        teamName: null,
        teamColor: null,
        note,
        isCorrection,
        category: 'system',
      };

    default:
      return {
        sentence: `${teamName ? `${teamName}: ` : ''}${event.type.replace(/_/g, ' ')}`,
        teamName,
        teamColor,
        note,
        isCorrection,
        category: 'system',
      };
  }
}
