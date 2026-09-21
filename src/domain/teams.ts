export interface TeamColor {
  hex: string;
  name: string;
}

export const TEAM_COLOR_PALETTE: readonly TeamColor[] = [
  { hex: '#E52521', name: 'Crimson Red' },
  { hex: '#0099FF', name: 'Sky Cyan' },
  { hex: '#22B14C', name: 'Arcade Green' },
  { hex: '#FF9900', name: 'Coin Gold' },
  { hex: '#9333EA', name: 'Pixel Purple' },
  { hex: '#EC4899', name: 'Neon Coral' },
] as const;

export interface TeamDraft {
  slot: number;
  name: string;
  color: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<number, { name?: string; color?: string }>;
  generalError?: string;
}

export function validateTeamDrafts(
  teamCount: number,
  teams: TeamDraft[]
): ValidationResult {
  const errors: Record<number, { name?: string; color?: string }> = {};
  let generalError: string | undefined;

  if (teamCount !== 5 && teamCount !== 6) {
    generalError = 'Tournament rules require exactly 5 or 6 teams.';
  }

  if (teams.length !== teamCount) {
    generalError = `Expected ${teamCount} teams, but found ${teams.length}.`;
  }

  const nameMap = new Map<string, number>();
  const colorMap = new Map<string, number>();

  teams.forEach((team) => {
    const slotErrors: { name?: string; color?: string } = {};
    const trimmedName = team.name.trim();
    const upperColor = team.color.toUpperCase().trim();

    // Validate Name Length
    if (trimmedName.length === 0) {
      slotErrors.name = 'Team name is required.';
    } else if (trimmedName.length > 30) {
      slotErrors.name = 'Team name cannot exceed 30 characters.';
    } else {
      const lowerName = trimmedName.toLowerCase();
      if (nameMap.has(lowerName)) {
        slotErrors.name = `Name already taken by Team ${nameMap.get(lowerName)}.`;
      } else {
        nameMap.set(lowerName, team.slot);
      }
    }

    // Validate Color
    if (!/^#[0-9A-F]{6}$/i.test(upperColor)) {
      slotErrors.color = 'Invalid hex color format (must be #RRGGBB).';
    } else if (colorMap.has(upperColor)) {
      slotErrors.color = `Color already assigned to Team ${colorMap.get(upperColor)}.`;
    } else {
      colorMap.set(upperColor, team.slot);
    }

    if (slotErrors.name || slotErrors.color) {
      errors[team.slot] = slotErrors;
    }
  });

  return {
    isValid: !generalError && Object.keys(errors).length === 0,
    errors,
    generalError,
  };
}

export function getDefaultTeams(count: number): TeamDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    slot: i + 1,
    name: `Team ${i + 1}`,
    color: TEAM_COLOR_PALETTE[i % TEAM_COLOR_PALETTE.length].hex,
  }));
}
