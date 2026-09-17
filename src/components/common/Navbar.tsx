import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatTimer } from '../../constants/theme';
import { Wifi, WifiOff, Shield, RefreshCw } from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  role: 'admin' | 'player' | 'public';
  onOpenSettings?: () => void;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  title = 'STARTUPOLY', 
  subtitle = 'THE EQUINOX 2K26', 
  role,
  onOpenSettings,
  onOpenSimulator,
}) => {
  const { isConnected, logout, state } = useGame();

  const isTimerCritical = state.secondsRemaining <= 60;
  const isTimerWarning = state.secondsRemaining <= 300 && !isTimerCritical;

  return (
    <header className="w-full bg-[#222222]/90 backdrop-blur-md border-b border-[#F7F2F6]/10 sticky top-0 z-40 px-4 py-3 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7484FE] to-[#33FF67] flex items-center justify-center font-black text-black text-sm shadow-glow-blue">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[#F7F2F6] text-base">
                {title}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#7484FE]/20 text-[#7484FE] border border-[#7484FE]/30">
                2K26
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#A5A2A5] tracking-wide">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Connection Pill */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
            isConnected 
              ? 'bg-[#33FF67]/10 text-[#33FF67] border border-[#33FF67]/30' 
              : 'bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/30 animate-pulse'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#33FF67] animate-live-dot' : 'bg-[#FF4D6D]'}`} />
            <span className="hidden xs:inline">{isConnected ? 'LIVE' : 'RECONNECTING…'}</span>
          </div>

          {/* Role specific quick action */}
          {role === 'admin' && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-[#2E2E2E] hover:bg-[#383838] text-[#F7F2F6] border border-[#F7F2F6]/10 text-xs flex items-center gap-1 transition"
              title="Match Rules & Economics"
            >
              <Shield className="w-3.5 h-3.5 text-[#7484FE]" />
              <span className="hidden sm:inline">Rules</span>
            </button>
          )}

          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-2 py-1 rounded-lg bg-[#7484FE]/20 hover:bg-[#7484FE]/30 text-[#7484FE] border border-[#7484FE]/30 text-xs font-bold transition"
            >
              Arena
            </button>
          )}

          {/* Switch / Exit */}
          {role !== 'public' && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-[#2E2E2E] hover:bg-[#383838] text-[#A5A2A5] hover:text-[#F7F2F6] border border-[#F7F2F6]/10 transition"
              title="Exit Session"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
