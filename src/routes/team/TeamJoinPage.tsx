import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PixelButton, PixelCard, TextField, ErrorBanner } from '../../ui';
import { joinTeamRpc } from '../../data/rpc';

export const TeamJoinPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [slot, setSlot] = useState<number>(1);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const cleanPin = pin.trim();

    if (cleanRoomCode.length !== 6) {
      setErrorMsg('Room code must be exactly 6 characters.');
      return;
    }

    if (slot < 1 || slot > 6) {
      setErrorMsg('Team slot must be between 1 and 6.');
      return;
    }

    if (cleanPin.length !== 4) {
      setErrorMsg('Team PIN must be exactly 4 digits.');
      return;
    }

    try {
      setIsJoining(true);
      setErrorMsg(null);
      const result = await joinTeamRpc(cleanRoomCode, Number(slot), cleanPin);
      // Store current team reference locally for reconnection
      localStorage.setItem('startupoly_active_team', JSON.stringify(result));
      navigate('/team', { state: { teamState: result } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not join team. Check room code, slot, and PIN.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5C94FC] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="p-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-pixel text-xs text-white drop-shadow-[2px_2px_0px_#102040] hover:text-[#FFCC00]"
        >
          ◄ BACK
        </Link>
        <span className="font-pixel text-[10px] text-[#102040] bg-[#FFCC00] px-2.5 py-1 border-2 border-[#102040]">
          PLAYER PHONE
        </span>
      </header>

      {/* Main Join Container: Mobile-First Max-W */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <PixelCard
            title="JOIN TEAM"
            headerBg="gold"
            variant="cream"
            padding="md"
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#22B14C] text-white border-3 border-[#102040] shadow-[2px_2px_0px_#102040] flex items-center justify-center mx-auto mb-2.5 font-pixel text-xl">
                📱
              </div>
              <h1 className="font-pixel text-xs sm:text-sm uppercase text-[#102040] mb-1">
                TEAM PORTAL
              </h1>
              <p className="font-mono text-xs text-[#64748B]">
                Enter room code, your team number, and private 4-digit PIN
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4">
                <ErrorBanner message={errorMsg} />
              </div>
            )}

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <TextField
                label="Room Code"
                type="text"
                required
                maxLength={6}
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect="off"
                disabled={isJoining}
                helperText="6-character room code from the screen"
              />

              {/* Team Slot selector */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-pixel text-[11px] uppercase tracking-wider text-[#102040] select-none">
                  Team Number (Slot)
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setSlot(num)}
                      className={`
                        min-h-[44px] font-pixel text-xs border-3 border-[#102040] cursor-pointer
                        ${
                          slot === num
                            ? 'bg-[#FFCC00] text-[#102040] shadow-[2px_2px_0px_#102040]'
                            : 'bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                        }
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <TextField
                label="Team 4-Digit PIN"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                disabled={isJoining}
                helperText="Assigned 4-digit secret PIN"
              />

              <div className="pt-2">
                <PixelButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isJoining}
                >
                  CONNECT PHONE
                </PixelButton>
              </div>
            </form>
          </PixelCard>
        </div>
      </main>

      {/* Brick Ground Base */}
      <div className="h-8 nes-brick-pattern border-t-4 border-[#102040]" />
    </div>
  );
};
