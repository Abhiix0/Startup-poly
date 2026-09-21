import React, { useState, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PixelButton, PixelCard, TextField, ErrorBanner, useToast } from '../../ui';
import { TEAM_COLOR_PALETTE, TeamDraft, getDefaultTeams, validateTeamDrafts } from '../../domain/teams';
import { rpcAdminCreateRoom } from '../../data/rpc';

export const CreateRoomView: React.FC = () => {
  const [teamCount, setTeamCount] = useState<5 | 6>(5);
  const [teams, setTeams] = useState<TeamDraft[]>(() => getDefaultTeams(5));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { errorToast, successToast } = useToast();

  const handleTeamCountChange = (count: 5 | 6) => {
    setTeamCount(count);
    setTeams((prev) => {
      if (count === 5) {
        return prev.slice(0, 5);
      } else {
        if (prev.length >= 6) return prev;
        const default6 = getDefaultTeams(6);
        return [...prev, default6[5]];
      }
    });
  };

  const handleNameChange = (slot: number, name: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.slot === slot ? { ...t, name } : t))
    );
  };

  const handleColorChange = (slot: number, color: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.slot === slot ? { ...t, color } : t))
    );
  };

  const validation = validateTeamDrafts(teamCount, teams);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) {
      errorToast('Please resolve validation errors before creating room.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload = teams.map((t) => ({
        name: t.name.trim(),
        color: t.color.toUpperCase().trim(),
      }));

      const createdRoom = await rpcAdminCreateRoom(teamCount, payload);
      successToast(`Room ${createdRoom.code} created!`);
      navigate(`/admin/room/${createdRoom.id}`);
    } catch (err: any) {
      if (err.code === 'NON_FINAL_ROOM_EXISTS') {
        errorToast('Another active match room exists. Redirecting...');
        // We will let the parent dashboard pick it up or redirect
      } else {
        setSubmitError(err.message || 'Failed to create room. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
      {/* Top Banner with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-lg sm:text-xl text-[#102040] uppercase drop-shadow-[2px_2px_0px_#FFF]">
            CREATE TOURNAMENT ROOM
          </h1>
          <p className="font-mono text-xs text-[#102040] font-semibold mt-1">
            Configure 5 or 6 competing startup teams for the 50-minute physical board game
          </p>
        </div>
        <Link to="/admin/history">
          <PixelButton variant="ghost" size="sm">
            PAST MATCHES
          </PixelButton>
        </Link>
      </div>

      {submitError && <ErrorBanner message={submitError} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Team Count Selector Card */}
        <PixelCard title="1. CHOOSE TEAM COUNT" headerBg="navy" padding="md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-pixel text-xs text-[#102040] mb-1">
                OFFICIAL MATCH SIZE
              </p>
              <p className="font-mono text-xs text-[#64748B]">
                Startupoly rulebook mandates exactly 5 or 6 teams per board.
              </p>
            </div>

            <div className="inline-flex border-4 border-[#102040] shadow-[3px_3px_0px_#102040] bg-white">
              <button
                type="button"
                onClick={() => handleTeamCountChange(5)}
                className={`
                  min-h-[48px] px-6 font-pixel text-xs cursor-pointer select-none transition-all
                  ${
                    teamCount === 5
                      ? 'bg-[#FFCC00] text-[#102040] font-extrabold'
                      : 'bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                  }
                `}
              >
                5 TEAMS
              </button>
              <div className="w-1 bg-[#102040]" />
              <button
                type="button"
                onClick={() => handleTeamCountChange(6)}
                className={`
                  min-h-[48px] px-6 font-pixel text-xs cursor-pointer select-none transition-all
                  ${
                    teamCount === 6
                      ? 'bg-[#FFCC00] text-[#102040] font-extrabold'
                      : 'bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                  }
                `}
              >
                6 TEAMS
              </button>
            </div>
          </div>
        </PixelCard>

        {/* Team Configuration Grid */}
        <PixelCard title="2. CONFIGURE TEAMS (NAME & COLOR)" headerBg="brick" padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => {
              const teamErrors = validation.errors[team.slot];
              const isColorInUse = (hex: string) =>
                teams.some((t) => t.slot !== team.slot && t.color.toUpperCase() === hex.toUpperCase());

              return (
                <div
                  key={team.slot}
                  className="border-3 border-[#102040] bg-white p-4 shadow-[2px_2px_0px_#102040] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b-2 border-[#102040] pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 border-2 border-[#102040] inline-block shadow-[1px_1px_0px_#102040]"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-pixel text-xs uppercase text-[#102040]">
                        SLOT #{team.slot}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B] font-bold">
                      {team.color}
                    </span>
                  </div>

                  <TextField
                    label="Team Name"
                    type="text"
                    required
                    maxLength={30}
                    value={team.name}
                    onChange={(e) => handleNameChange(team.slot, e.target.value)}
                    error={teamErrors?.name}
                    placeholder={`Team ${team.slot}`}
                    disabled={isSubmitting}
                  />

                  <div>
                    <label className="font-pixel text-[10px] uppercase tracking-wider text-[#102040] block mb-1.5">
                      Assign Color Swatch
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {TEAM_COLOR_PALETTE.map((c) => {
                        const inUse = isColorInUse(c.hex);
                        const isSelected = team.color.toUpperCase() === c.hex.toUpperCase();

                        return (
                          <button
                            type="button"
                            key={c.hex}
                            title={`${c.name} (${c.hex})${inUse ? ' - already chosen by another team' : ''}`}
                            disabled={inUse || isSubmitting}
                            onClick={() => handleColorChange(team.slot, c.hex)}
                            className={`
                              w-8 h-8 rounded-none border-2 border-[#102040] cursor-pointer flex items-center justify-center font-pixel text-[10px] text-white
                              transition-all
                              ${isSelected ? 'ring-2 ring-offset-1 ring-[#102040] scale-110 shadow-[2px_2px_0px_#102040]' : ''}
                              ${inUse ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105'}
                            `}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                    {teamErrors?.color && (
                      <p className="font-mono text-xs text-[#D32F2F] mt-1 font-semibold">
                        ⚠ {teamErrors.color}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </PixelCard>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <PixelButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={!validation.isValid || isSubmitting}
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            CREATE TOURNAMENT ROOM
          </PixelButton>
        </div>
      </form>
    </div>
  );
};
