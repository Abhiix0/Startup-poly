import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PixelButton, PixelCard, TextField, ErrorBanner, useToast, Skeleton } from '../../ui';
import { PixelCloud } from '../../ui/pixel';
import { rpcGetLobby, rpcJoinTeam } from '../../data/rpc';
import { ensureAnonymousSession } from '../../data/client';

interface LobbyTeam {
  slot: number;
  name: string;
  color: string;
  claimed: boolean;
}

export const TeamJoinPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [lobbyStatus, setLobbyStatus] = useState<string | null>(null);
  const [lobbyTeams, setLobbyTeams] = useState<LobbyTeam[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [pin, setPin] = useState('');

  const [isLoadingLobby, setIsLoadingLobby] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { errorToast, successToast } = useToast();

  // Check if redirected with notice (e.g., organizer released slot)
  const redirectNotice = (location.state as { notice?: string })?.notice;

  // Safe alphabet filter (no 0, 1, I, O)
  const handleRoomCodeChange = (raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 6);
    setRoomCode(cleaned);
    setErrorMessage(null);

    // Auto-fetch lobby when 6 valid characters entered
    if (cleaned.length === 6) {
      fetchLobby(cleaned);
    } else {
      setLobbyTeams([]);
      setSelectedSlot(null);
      setLobbyStatus(null);
    }
  };

  const fetchLobby = async (code: string) => {
    try {
      setIsLoadingLobby(true);
      setErrorMessage(null);
      const data = await rpcGetLobby(code);
      setLobbyTeams(data.teams);
      setLobbyStatus(data.status);
      if (data.teams.length > 0 && selectedSlot === null) {
        setSelectedSlot(data.teams[0].slot);
      }
    } catch {
      setErrorMessage("Code, team or PIN didn't match");
      setLobbyTeams([]);
      setSelectedSlot(null);
      setLobbyStatus(null);
    } finally {
      setIsLoadingLobby(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (roomCode.length !== 6) {
      setErrorMessage("Code, team or PIN didn't match");
      return;
    }

    if (selectedSlot === null) {
      setErrorMessage("Please select your team.");
      return;
    }

    if (pin.length !== 4) {
      setErrorMessage("Team PIN must be exactly 4 digits.");
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage(null);

      // Ensure anonymous session exists so auth.uid() is populated in Postgres
      await ensureAnonymousSession();

      // Call join_team RPC
      await rpcJoinTeam(roomCode, selectedSlot, pin);

      successToast("Connected to team!");
      navigate('/team');
    } catch (err: any) {
      if (err.code === 'TOO_MANY_ATTEMPTS') {
        setErrorMessage("Too many tries — wait a minute");
        errorToast("Too many tries — wait a minute");
      } else {
        setErrorMessage("Code, team or PIN didn't match");
        errorToast("Code, team or PIN didn't match");
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between selection:bg-[#FFCC00] selection:text-[#102040]">
      {/* Top Navbar */}
      <header className="p-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-pixel text-xs text-white drop-shadow-[2px_2px_0px_#102040] hover:text-[#FFCC00] transition-colors"
        >
          ◄ BACK
        </Link>
        <span className="font-pixel text-[10px] text-[#102040] bg-[#FFCC00] px-2.5 py-1 border-2 border-[#102040] shadow-[1px_1px_0px_#102040]">
          TEAM PHONE PORTAL
        </span>
      </header>

      {/* Main Single-Column Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm flex flex-col gap-4">
          {redirectNotice && (
            <div className="bg-[#FFFBEB] border-3 border-[#102040] p-3 shadow-[3px_3px_0px_#102040]">
              <p className="font-mono text-xs text-[#92400E] font-bold text-center">
                ⚠ {redirectNotice}
              </p>
            </div>
          )}

          <PixelCard
            title="CONNECT TEAM PHONE"
            headerBg="gold"
            variant="cream"
            padding="md"
          >
            {/* Header info */}
            <div className="text-center mb-4">
              <div className="relative inline-block mb-1">
                <PixelCloud size={56} className="opacity-80" />
                <div className="w-10 h-10 bg-[#22B14C] text-white border-3 border-[#102040] shadow-[2px_2px_0px_#102040] flex items-center justify-center mx-auto -mt-5 font-pixel text-base relative z-10">
                  📱
                </div>
              </div>
              <h1 className="font-pixel text-xs sm:text-sm uppercase text-[#102040] mt-1">
                JOIN LIVE SCOREBOARD
              </h1>
              <p className="font-mono text-xs text-[#64748B] mt-0.5">
                Look at the projector screen for your 6-character room code
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4">
                <ErrorBanner message={errorMessage} />
              </div>
            )}

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              {/* Step 1: Room Code */}
              <div>
                <TextField
                  label="1. Room Code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="ABC890"
                  value={roomCode}
                  onChange={(e) => handleRoomCodeChange(e.target.value)}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  disabled={isJoining}
                  helperText="6 safe characters from projector screen"
                />

                {isLoadingLobby && (
                  <div className="mt-2">
                    <Skeleton height={32} />
                  </div>
                )}
              </div>

              {/* Step 2: Team Tiles */}
              {lobbyTeams.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040] select-none">
                    2. Choose Your Team
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {lobbyTeams.map((t) => {
                      const isSelected = selectedSlot === t.slot;

                      return (
                        <button
                          type="button"
                          key={t.slot}
                          onClick={() => setSelectedSlot(t.slot)}
                          className={`
                            min-h-[48px] p-2 text-left border-3 border-[#102040] cursor-pointer flex items-center justify-between gap-2
                            transition-all duration-75 select-none
                            ${
                              isSelected
                                ? 'bg-[#FFCC00] shadow-[3px_3px_0px_#102040] scale-[1.02]'
                                : 'bg-white hover:bg-[#FAF8F5] shadow-[1px_1px_0px_#102040]'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-3.5 h-3.5 border border-[#102040] flex-shrink-0"
                              style={{ backgroundColor: t.color }}
                            />
                            <div className="truncate">
                              <span className="font-pixel text-[10px] text-[#102040] block truncate">
                                {t.name}
                              </span>
                              <span className="font-mono text-[9px] text-[#64748B]">
                                Slot #{t.slot}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="font-pixel text-xs text-[#102040]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: 4-Digit PIN */}
              {lobbyTeams.length > 0 && (
                <div>
                  <TextField
                    label="3. 4-Digit Secret PIN"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    disabled={isJoining}
                    helperText="Private PIN provided by your game organizer"
                  />
                </div>
              )}

              {/* Submit Button */}
              {lobbyTeams.length > 0 && (
                <div className="pt-2">
                  <PixelButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={roomCode.length !== 6 || selectedSlot === null || pin.length !== 4 || isJoining}
                    isLoading={isJoining}
                  >
                    CONNECT PHONE
                  </PixelButton>
                </div>
              )}
            </form>
          </PixelCard>
        </div>
      </main>

      {/* Brick Ground Base Strip */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
