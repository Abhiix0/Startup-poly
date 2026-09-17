import React from 'react';
import { useGame } from '../../context/GameContext';
import { Team } from '../../types/game';
import { formatCurrency, formatNumber } from '../../constants/theme';
import { 
  Building2, 
  ArrowUpRight, 
  Coins, 
  Flag, 
  Sparkles, 
  AlertTriangle, 
  Mic2, 
  UserMinus, 
  Users, 
  ShieldAlert, 
  RotateCcw,
  Activity
} from 'lucide-react';

interface PlayerActivityProps {
  team: Team;
}

export const PlayerActivity: React.FC<PlayerActivityProps> = ({ team }) => {
  const { state } = useGame();

  const myEvents = state.transactions
    .filter(tx => {
      if (tx.teamIndex === team.number - 1) return true;
      if (tx.description.toLowerCase().includes(team.name.toLowerCase())) return true;
      if (tx.actionType === 'start' && tx.actor === 'admin') return true;
      return false;
    })
    .slice()
    .reverse();

  const getActionMeta = (type: string) => {
    switch (type) {
      case 'purchase': 
        return { label: 'Venture Acquired', icon: Building2, color: '#7484FE' };
      case 'upgrade': 
        return { label: 'Venture Upgraded', icon: ArrowUpRight, color: '#33FF67' };
      case 'rent': 
        return { label: 'Rent Settlement', icon: Coins, color: '#FFBD59' };
      case 'start': 
        return { label: 'Lap Completed (START)', icon: Flag, color: '#33FF67' };
      case 'bonus_card': 
        return { label: 'Bonus Card Drawn', icon: Sparkles, color: '#33FF67' };
      case 'crisis_card': 
        return { label: 'Crisis Card Drawn', icon: AlertTriangle, color: '#FF5C7A' };
      case 'action_b': 
        return { label: 'Pitch to Investors', icon: Mic2, color: '#FFBD59' };
      case 'action_c': 
        return { label: 'Product Bug Penalty', icon: AlertTriangle, color: '#FF5C7A' };
      case 'action_d': 
        return { label: 'Talent Acquisition', icon: UserMinus, color: '#7484FE' };
      case 'wildcard': 
        return { label: 'Wildcard Challenge', icon: Sparkles, color: '#B987FF' };
      case 'forced_sale': 
        return { label: 'Emergency Liquidation', icon: ShieldAlert, color: '#FF5C7A' };
      case 'bankruptcy': 
        return { label: 'Bankruptcy Declared', icon: ShieldAlert, color: '#FF5C7A' };
      case 'undo': 
        return { label: 'Action Reverted (Undo)', icon: RotateCcw, color: '#FFBD59' };
      default: 
        return { label: 'Match Event', icon: Activity, color: '#7484FE' };
    }
  };

  return (
    <div className="space-y-4 max-w-[420px] mx-auto pb-24 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            ACTIVITY FEED
          </h2>
          <span className="text-xs text-white/50 block mt-0.5">
            {team.name} transaction & match log
          </span>
        </div>
        <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-white/70">
          LIVE LOG
        </div>
      </div>

      <div className="space-y-2">
        {myEvents.length > 0 ? (
          myEvents.map(tx => {
            const meta = getActionMeta(tx.actionType);
            const Icon = meta.icon;

            return (
              <div 
                key={tx.id}
                className="eqx-card p-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{ 
                      backgroundColor: `${meta.color}15`, 
                      borderColor: `${meta.color}35`,
                      color: meta.color 
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-white/90">
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {tx.timeFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-snug break-words">
                      {tx.description}
                    </p>
                  </div>
                </div>

                {(tx.cashDelta !== undefined || tx.cvDelta !== undefined) && (
                  <div className="text-right flex-shrink-0 font-mono">
                    {tx.cashDelta !== undefined && (
                      <span className={`block text-xs font-bold ${tx.cashDelta >= 0 ? 'text-[#33FF67]' : 'text-[#FF5C7A]'}`}>
                        {tx.cashDelta >= 0 ? '+' : ''}{formatCurrency(tx.cashDelta)}
                      </span>
                    )}
                    {tx.cvDelta !== undefined && (
                      <span className={`block text-[11px] font-bold ${tx.cvDelta >= 0 ? 'text-[#7484FE]' : 'text-[#FF5C7A]'}`}>
                        {tx.cvDelta >= 0 ? '+' : ''}{formatNumber(tx.cvDelta)} CV
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="eqx-card p-8 text-center">
            <p className="text-xs text-white/40 font-medium">
              No transactions recorded yet for this team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
