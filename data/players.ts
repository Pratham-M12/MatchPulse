import type { Player } from '@/types/football';

export const players: Player[] = [
  { id: 'p-haaland', name: 'Erling Haaland', teamId: 't-mci', position: 'Forward', number: 9, nationality: 'Norway', age: 25, appearances: 27, goals: 18, assists: 6 },
  { id: 'p-foden', name: 'Phil Foden', teamId: 't-mci', position: 'Midfielder', number: 47, nationality: 'England', age: 25, appearances: 26, goals: 11, assists: 8 },
  { id: 'p-ederson', name: 'Ederson', teamId: 't-mci', position: 'Goalkeeper', number: 31, nationality: 'Brazil', age: 32, appearances: 24, goals: 0, assists: 1 },
  { id: 'p-saliba', name: 'William Saliba', teamId: 't-ars', position: 'Defender', number: 2, nationality: 'France', age: 25, appearances: 26, goals: 2, assists: 1 },
  { id: 'p-saka', name: 'Bukayo Saka', teamId: 't-ars', position: 'Forward', number: 7, nationality: 'England', age: 24, appearances: 25, goals: 12, assists: 9 },
  { id: 'p-raya', name: 'David Raya', teamId: 't-ars', position: 'Goalkeeper', number: 22, nationality: 'Spain', age: 30, appearances: 25, goals: 0, assists: 0 },
  { id: 'p-salah', name: 'Mohamed Salah', teamId: 't-liv', position: 'Forward', number: 11, nationality: 'Egypt', age: 34, appearances: 27, goals: 16, assists: 10 },
  { id: 'p-van-dijk', name: 'Virgil van Dijk', teamId: 't-liv', position: 'Defender', number: 4, nationality: 'Netherlands', age: 35, appearances: 27, goals: 3, assists: 2 },
  { id: 'p-alisson', name: 'Alisson', teamId: 't-liv', position: 'Goalkeeper', number: 1, nationality: 'Brazil', age: 33, appearances: 22, goals: 0, assists: 0 },
];

export function getPlayerById(id: string): Player | undefined { return players.find((player) => player.id === id); }
export function getPlayersByTeam(teamId: string): Player[] { return players.filter((player) => player.teamId === teamId); }
