export interface LeaderboardEntry {
  rank: number;
  name: string;
  color: string;
  cv: number;
  cash: number;
  business_count: number;
  is_bankrupt: boolean;
  tiebreak_order?: number | null;
  won_on_pitch?: boolean;
}

export function formatStandingsAsText(
  roomCode: string,
  standings: LeaderboardEntry[],
  finalizedAt?: string | null
): string {
  const dateStr = finalizedAt ? new Date(finalizedAt).toLocaleString() : new Date().toLocaleString();
  const header = `★ STARTUPOLY TOURNAMENT RESULTS ★\nRoom Code: ${roomCode.toUpperCase()}\nFinalized: ${dateStr}\n\n`;

  const rows = standings.map((s) => {
    const statusTag = s.is_bankrupt ? ' [ELIMINATED]' : '';
    const pitchTag = s.won_on_pitch ? ' (won on pitch)' : '';
    return `#${s.rank} ${s.name} — ₹${s.cv.toLocaleString('en-IN')} CV | ₹${s.cash.toLocaleString('en-IN')} Cash | ${s.business_count}/3 Businesses${statusTag}${pitchTag}`;
  });

  return header + rows.join('\n');
}

export function exportStandingsToCsv(roomCode: string, standings: LeaderboardEntry[]): void {
  const headers = ['Rank', 'Team', 'Company Value', 'Cash', 'Businesses Held', 'Status', 'Decided By Pitch'];
  const rows = standings.map((s) => [
    s.rank,
    `"${s.name.replace(/"/g, '""')}"`,
    s.cv,
    s.cash,
    s.business_count,
    s.is_bankrupt ? 'ELIMINATED' : 'ACTIVE',
    s.won_on_pitch ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `startupoly-${roomCode.toLowerCase()}-results.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
