import { Team } from '../types/game';

export interface TeamMeta {
  number: number;
  name: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export const TEAM_COLORS: Record<number, string> = {
  1: '#7484FE', // Equinox Blue
  2: '#33FF67', // Signal Green
  3: '#FFBD59', // Amber / Gold
  4: '#FF5C7A', // Coral / Rose
  5: '#B987FF', // Purple / Violet
  6: '#58D6E8', // Cyan
};

export const TEAM_METAS: Record<number, TeamMeta> = {
  1: { number: 1, name: 'Team 01', color: '#7484FE', badgeBg: 'rgba(116, 132, 254, 0.15)', borderColor: '#7484FE' },
  2: { number: 2, name: 'Team 02', color: '#33FF67', badgeBg: 'rgba(51, 255, 103, 0.15)', borderColor: '#33FF67' },
  3: { number: 3, name: 'Team 03', color: '#FFBD59', badgeBg: 'rgba(255, 189, 89, 0.15)', borderColor: '#FFBD59' },
  4: { number: 4, name: 'Team 04', color: '#FF5C7A', badgeBg: 'rgba(255, 92, 122, 0.15)', borderColor: '#FF5C7A' },
  5: { number: 5, name: 'Team 05', color: '#B987FF', badgeBg: 'rgba(185, 135, 255, 0.15)', borderColor: '#B987FF' },
  6: { number: 6, name: 'Team 06', color: '#58D6E8', badgeBg: 'rgba(88, 214, 232, 0.15)', borderColor: '#58D6E8' },
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    number: 1,
    name: 'Team 01',
    color: '#7484FE',
    pin: '1101',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
  {
    id: 'team-2',
    number: 2,
    name: 'Team 02',
    color: '#33FF67',
    pin: '2202',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
  {
    id: 'team-3',
    number: 3,
    name: 'Team 03',
    color: '#FFBD59',
    pin: '3303',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
  {
    id: 'team-4',
    number: 4,
    name: 'Team 04',
    color: '#FF5C7A',
    pin: '4404',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
  {
    id: 'team-5',
    number: 5,
    name: 'Team 05',
    color: '#B987FF',
    pin: '5505',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
  {
    id: 'team-6',
    number: 6,
    name: 'Team 06',
    color: '#58D6E8',
    pin: '6606',
    cash: 1000,
    cv: 0,
    position: 0,
    businesses: [],
    isBankrupt: false,
    skipNextTurn: false,
    membersJoined: 4,
  },
];

export function formatCurrency(amount: number): string {
  const safeVal = Math.max(0, amount);
  return `₹${safeVal.toLocaleString('en-IN')}`;
}

export function formatNumber(val: number): string {
  return Math.max(0, val).toLocaleString('en-IN');
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}


