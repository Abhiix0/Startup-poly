import { Team } from '../types/game';

export interface MarioCharacterMeta {
  characterName: string;
  icon: string;
  color: string;
  darkColor: string;
  powerUp: string;
}

export const MARIO_CHARACTERS: Record<number, MarioCharacterMeta> = {
  1: { characterName: 'Mario', icon: '🍄', color: '#E52521', darkColor: '#9B110E', powerUp: 'Super Mushroom' },
  2: { characterName: 'Luigi', icon: '🟢', color: '#43B047', darkColor: '#007000', powerUp: '1-Up Mushroom' },
  3: { characterName: 'Wario', icon: '⭐', color: '#FBD000', darkColor: '#C69200', powerUp: 'Super Star' },
  4: { characterName: 'Peach', icon: '👑', color: '#FF77A8', darkColor: '#B82660', powerUp: 'Super Crown' },
  5: { characterName: 'Bowser', icon: '🔥', color: '#9437FF', darkColor: '#580FA0', powerUp: 'Fire Flower' },
  6: { characterName: 'Yoshi', icon: '🥚', color: '#00D2BE', darkColor: '#007D72', powerUp: 'Yoshi Egg' },
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    number: 1,
    name: 'Team 01 (Mario)',
    color: '#E52521',
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
    name: 'Team 02 (Luigi)',
    color: '#43B047',
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
    name: 'Team 03 (Wario)',
    color: '#FBD000',
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
    name: 'Team 04 (Peach)',
    color: '#FF77A8',
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
    name: 'Team 05 (Bowser)',
    color: '#9437FF',
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
    name: 'Team 06 (Yoshi)',
    color: '#00D2BE',
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

export function formatCoins(amount: number): string {
  const safeVal = Math.max(0, amount);
  return `🪙 ₹${safeVal.toLocaleString('en-IN')}`;
}

export function formatStars(amount: number): string {
  const safeVal = Math.max(0, amount);
  return `⭐ ${safeVal.toLocaleString('en-IN')} CV`;
}

export function formatNumber(val: number): string {
  return Math.max(0, val).toLocaleString('en-IN');
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

