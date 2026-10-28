import { MAX_BUSINESSES_PER_TEAM } from '../../domain/economy';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  color: string;
  cash: number;
  business_count: number;
  is_bankrupt: boolean;
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
    return `#${s.rank} ${s.name} — ₹${s.cash.toLocaleString('en-IN')} Cash | ${s.business_count}/${MAX_BUSINESSES_PER_TEAM} Businesses${statusTag}`;
  });

  return header + rows.join('\n');
}

export function exportStandingsToCsv(roomCode: string, standings: LeaderboardEntry[]): void {
  const headers = ['Rank', 'Team', 'Cash', 'Businesses Held', 'Status'];
  const rows = standings.map((s) => [
    s.rank,
    `"${s.name.replace(/"/g, '""')}"`,
    s.cash,
    s.business_count,
    s.is_bankrupt ? 'ELIMINATED' : 'ACTIVE',
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
