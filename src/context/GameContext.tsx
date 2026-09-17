import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MatchState, 
  MatchSettings, 
  Team, 
  Business, 
  GameTransaction 
} from '../types/game';
import { 
  getInitialState, 
  processRoll, 
  buyBusiness, 
  upgradeBusiness, 
  payRent, 
  sellBusinessForced, 
  executeBankruptcy, 
  resolveBonusCard, 
  resolveCrisisCard, 
  resolveActionPitch, 
  resolveActionLoseFeature, 
  resolveActionStealTalent, 
  resolveWildcard, 
  undoLastTransaction, 
  manualAdjustTeam,
  getRankedTeams,
  getNowTimeFormatted,
  cloneStateData
} from '../engine/gameEngine';
import { soundFX } from '../utils/audio';

interface AuthSession {
  role: 'none' | 'admin' | 'player';
  teamNumber?: number; // 1..6
  roomCode?: string;
  authenticatedAt?: number;
}

interface GameContextType {
  state: MatchState;
  session: AuthSession;
  isConnected: boolean;
  activeView: 'landing' | 'waiting' | 'game' | 'results' | 'simulator';
  rankedTeams: Team[];
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;
  soundMuted: boolean;
  toggleSound: () => void;
  // Auth methods
  loginAdmin: (passcode: string) => boolean;
  loginPlayer: (roomCode: string, teamNumber: number, pin: string) => { success: boolean; error?: string };
  logout: () => void;
  setSimulatorMode: (enabled: boolean) => void;
  // Match lifecycle methods
  createMatch: (code: string, teamCount: number) => void;
  startMatch: () => void;
  toggleTimer: () => void;
  endMatch: () => void;
  resetMatch: () => void;
  // Game Actions
  rollDie: (val: number) => void;
  buyCurrentBusiness: (bizId: number) => void;
  passCurrentBusiness: () => void;
  upgradeOwnedBusiness: (bizId: number) => void;
  payCurrentRent: (bizId: number) => void;
  sellBusinessForDebt: (bizId: number) => void;
  applyBonusCard: (cardRoll: number, luckyRewardRoll?: number) => void;
  applyCrisisCard: (cardRoll: number) => void;
  applyPitchAction: (passed: boolean) => void;
  applyLoseFeature: () => void;
  applyStealTalent: (targetTeamIdx: number) => void;
  applyWildcardAction: (completed: boolean, notes?: string) => void;
  undoAction: () => void;
  manualAdjust: (teamIdx: number, cashDelta: number, cvDelta: number, reason: string) => void;
  updateSettings: (settings: Partial<MatchSettings>) => void;
  setSelectedTeamIndex: (idx: number) => void;
}

const STORAGE_KEY = 'startupoly_match_state_v2';
const AUTH_KEY = 'startupoly_auth_session_v2';
const BROADCAST_CHANNEL = 'startupoly_realtime_bus_v2';
const THEME_KEY = 'startupoly_theme_mode';

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MatchState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved match state', e);
    }
    return getInitialState('EQX-4821', 6);
  });

  const [session, setSession] = useState<AuthSession>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { role: 'none' };
  });

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'light'; // Default to bright, vivid, readable Light Theme for outdoor play!
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => soundFX.getMuted());
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSimulator, setIsSimulator] = useState<boolean>(false);

  // Sync theme class to document body
  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch (e) {}
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    soundFX.playClick();
  };

  const toggleSound = () => {
    const isNowMuted = soundFX.toggleMute();
    setSoundMuted(isNowMuted);
    if (!isNowMuted) {
      soundFX.playCoin();
    }
  };

  // BroadcastChannel for instant cross-tab realtime sync
  const channel = useMemo(() => {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL);
    } catch (e) {
      return null;
    }
  }, []);

  // Broadcast state updates to all other tabs
  const broadcastState = useCallback((nextState: MatchState) => {
    setState(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      channel?.postMessage({ type: 'STATE_UPDATE', payload: nextState });
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, [channel]);

  // Listen for realtime broadcasts from other windows/tabs
  useEffect(() => {
    if (!channel) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STATE_UPDATE' && event.data?.payload) {
        setState(event.data.payload);
        setIsConnected(true);
      }
    };
    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [channel]);

  // Save auth session
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } catch (e) {}
  }, [session]);

  // Timer Tick Interval (1 Hz)
  useEffect(() => {
    if (!state.timerRunning || state.status !== 'live') return;

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.timerRunning || prev.secondsRemaining <= 0) {
          if (prev.secondsRemaining <= 0 && prev.status === 'live') {
            soundFX.playStageClear();
            return {
              ...prev,
              timerRunning: false,
              status: 'finished',
              secondsRemaining: 0,
            };
          }
          return prev;
        }

        const nextSeconds = prev.secondsRemaining - 1;
        const nextState: MatchState = {
          ...prev,
          secondsRemaining: nextSeconds,
          status: nextSeconds === 0 ? 'finished' : prev.status,
          timerRunning: nextSeconds > 0,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
          channel?.postMessage({ type: 'STATE_UPDATE', payload: nextState });
        } catch (e) {}

        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timerRunning, state.status, channel]);

  // Derive active application view
  const activeView = useMemo(() => {
    if (isSimulator) return 'simulator';
    if (session.role === 'admin') {
      if (state.status === 'setup' || state.status === 'waiting') return 'waiting';
      if (state.status === 'finished') return 'results';
      return 'game';
    }
    if (session.role === 'player') {
      if (state.status === 'setup' || state.status === 'waiting') return 'waiting';
      if (state.status === 'finished') return 'results';
      return 'game';
    }
    return 'landing';
  }, [session.role, state.status, isSimulator]);

  // Derive Leaderboard Rank
  const rankedTeams = useMemo(() => {
    return getRankedTeams(state.teams);
  }, [state.teams]);

  // Auth methods
  const loginAdmin = (passcode: string): boolean => {
    if (passcode === 'admin' || passcode === 'equinox2026' || passcode === '2026') {
      setSession({ role: 'admin', authenticatedAt: Date.now() });
      soundFX.playCoin();
      return true;
    }
    soundFX.playBowser();
    return false;
  };

  const loginPlayer = (roomCode: string, teamNumber: number, pin: string): { success: boolean; error?: string } => {
    const cleanRoom = roomCode.trim().toUpperCase();
    if (cleanRoom !== state.matchCode && cleanRoom !== 'EQX-4821') {
      soundFX.playBowser();
      return { success: false, error: 'Invalid room code. Please check the code with the Game Master.' };
    }
    const team = state.teams.find(t => t.number === teamNumber);
    if (!team) {
      soundFX.playBowser();
      return { success: false, error: `Team ${teamNumber} does not exist in this match.` };
    }
    if (team.pin !== pin.trim()) {
      soundFX.playBowser();
      return { success: false, error: 'Incorrect Team PIN. Ask your team lead or Game Master.' };
    }

    soundFX.playPowerUp();
    setSession({
      role: 'player',
      teamNumber,
      roomCode: cleanRoom,
      authenticatedAt: Date.now(),
    });
    return { success: true };
  };

  const logout = () => {
    soundFX.playPipe();
    setSession({ role: 'none' });
    setIsSimulator(false);
  };

  const setSimulatorMode = (enabled: boolean) => {
    setIsSimulator(enabled);
    soundFX.playClick();
  };

  // Match lifecycle methods
  const createMatch = (code: string, teamCount: number) => {
    const fresh = getInitialState(code.toUpperCase(), teamCount);
    broadcastState(fresh);
    soundFX.playPipe();
  };

  const startMatch = () => {
    soundFX.playStageClear();
    const next: MatchState = {
      ...state,
      status: 'live',
      timerRunning: true,
      transactions: [
        ...state.transactions,
        {
          id: 'tx_' + Date.now(),
          timestamp: new Date().toISOString(),
          timeFormatted: getNowTimeFormatted(),
          actor: 'admin',
          teamIndex: 0,
          teamName: 'Game Master',
          actionType: 'start',
          description: `🚀 STARTUPOLY Match is LIVE! 50-minute timer started. First turn: ${state.teams[0].name}.`,
        }
      ]
    };
    broadcastState(next);
  };

  const toggleTimer = () => {
    soundFX.playClick();
    const next: MatchState = {
      ...state,
      timerRunning: !state.timerRunning,
      status: state.timerRunning ? 'paused' : 'live',
      transactions: [
        ...state.transactions,
        {
          id: 'tx_' + Date.now(),
          timestamp: new Date().toISOString(),
          timeFormatted: getNowTimeFormatted(),
          actor: 'admin',
          teamIndex: state.activeTeamIndex,
          teamName: 'Game Master',
          actionType: 'manual_adjust',
          description: state.timerRunning ? '⏸️ Match timer PAUSED by Game Master.' : '▶️ Match timer RESUMED by Game Master.',
        }
      ]
    };
    broadcastState(next);
  };

  const endMatch = () => {
    soundFX.playStageClear();
    const winner = rankedTeams[0];
    const next: MatchState = {
      ...state,
      status: 'finished',
      timerRunning: false,
      transactions: [
        ...state.transactions,
        {
          id: 'tx_' + Date.now(),
          timestamp: new Date().toISOString(),
          timeFormatted: getNowTimeFormatted(),
          actor: 'admin',
          teamIndex: winner ? winner.number - 1 : 0,
          teamName: winner?.name || 'Game Master',
          actionType: 'start',
          description: `🏆 Match concluded by Game Master! Winner: ${winner?.name || 'N/A'} with ${winner?.cv.toLocaleString('en-IN')} Company Value.`,
        }
      ]
    };
    broadcastState(next);
  };

  const resetMatch = () => {
    soundFX.playPipe();
    const winner = rankedTeams[0];
    const archived = [
      ...(state.archivedMatches || []),
      {
        id: state.matchId,
        code: state.matchCode,
        endedAt: new Date().toISOString(),
        winner,
        rankings: rankedTeams,
      }
    ];

    const fresh = getInitialState(state.matchCode, state.settings.teamCount);
    fresh.archivedMatches = archived;
    broadcastState(fresh);
  };

  // Game Engine wrappers
  const rollDie = (val: number) => {
    soundFX.playJump();
    const next = processRoll(state, val);
    broadcastState(next);
  };

  const buyCurrentBusiness = (bizId: number) => {
    soundFX.playPowerUp();
    const next = buyBusiness(state, bizId);
    broadcastState(next);
  };

  const passCurrentBusiness = () => {
    soundFX.playPipe();
    if (!state.pendingLanding) return;
    const next = cloneStateData(state);
    const team = next.teams[state.pendingLanding.teamIndex];
    const space = state.businesses[state.pendingLanding.spaceIndex];
    const tx: GameTransaction = {
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString(),
      timeFormatted: getNowTimeFormatted(),
      actor: 'admin',
      teamIndex: state.pendingLanding.teamIndex,
      teamName: team.name,
      actionType: 'purchase',
      description: `${team.name} passed on acquiring ${space?.name || 'Venture'}.`,
    };
    next.transactions.push(tx);
    next.pendingLanding = null;
    broadcastState(next);
  };

  const upgradeOwnedBusiness = (bizId: number) => {
    soundFX.playPowerUp();
    const next = upgradeBusiness(state, bizId);
    broadcastState(next);
  };

  const payCurrentRent = (bizId: number) => {
    soundFX.playCoin();
    const next = payRent(state, bizId);
    broadcastState(next);
  };

  const sellBusinessForDebt = (bizId: number) => {
    soundFX.playBowser();
    const next = sellBusinessForced(state, bizId);
    broadcastState(next);
  };

  const applyBonusCard = (cardRoll: number, luckyRewardRoll?: number) => {
    soundFX.playCoin();
    const next = resolveBonusCard(state, cardRoll, luckyRewardRoll);
    broadcastState(next);
  };

  const applyCrisisCard = (cardRoll: number) => {
    soundFX.playBowser();
    const next = resolveCrisisCard(state, cardRoll);
    broadcastState(next);
  };

  const applyPitchAction = (passed: boolean) => {
    if (passed) soundFX.playPowerUp(); else soundFX.playBowser();
    const next = resolveActionPitch(state, passed);
    broadcastState(next);
  };

  const applyLoseFeature = () => {
    soundFX.playBowser();
    const next = resolveActionLoseFeature(state);
    broadcastState(next);
  };

  const applyStealTalent = (targetTeamIdx: number) => {
    soundFX.playPowerUp();
    const next = resolveActionStealTalent(state, targetTeamIdx);
    broadcastState(next);
  };

  const applyWildcardAction = (completed: boolean, notes?: string) => {
    if (completed) soundFX.playPowerUp(); else soundFX.playBowser();
    const next = resolveWildcard(state, completed, notes);
    broadcastState(next);
  };

  const undoAction = () => {
    soundFX.playPipe();
    const next = undoLastTransaction(state);
    broadcastState(next);
  };

  const manualAdjust = (teamIdx: number, cashDelta: number, cvDelta: number, reason: string) => {
    soundFX.playCoin();
    const next = manualAdjustTeam(state, teamIdx, cashDelta, cvDelta, reason);
    broadcastState(next);
  };

  const updateSettings = (newSettings: Partial<MatchSettings>) => {
    soundFX.playClick();
    const next: MatchState = {
      ...state,
      settings: { ...state.settings, ...newSettings }
    };
    broadcastState(next);
  };

  const setSelectedTeamIndex = (idx: number) => {
    setState(prev => ({ ...prev, selectedTeamIndex: idx }));
  };

  return (
    <GameContext.Provider
      value={{
        state,
        session,
        isConnected,
        activeView,
        rankedTeams,
        themeMode,
        toggleThemeMode,
        soundMuted,
        toggleSound,
        loginAdmin,
        loginPlayer,
        logout,
        setSimulatorMode,
        createMatch,
        startMatch,
        toggleTimer,
        endMatch,
        resetMatch,
        rollDie,
        buyCurrentBusiness,
        passCurrentBusiness,
        upgradeOwnedBusiness,
        payCurrentRent,
        sellBusinessForDebt,
        applyBonusCard,
        applyCrisisCard,
        applyPitchAction,
        applyLoseFeature,
        applyStealTalent,
        applyWildcardAction,
        undoAction,
        manualAdjust,
        updateSettings,
        setSelectedTeamIndex,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
