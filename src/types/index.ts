// Core game types
export interface PlayerStats {
  hp: number;
  max_hp: number;
  items: string[];
}

export interface EnemyStats {
  type: string;
  hp: number;
  max_hp: number;
}

export interface GameState {
  turn_counter: number;
  game_over: boolean;
  tactic_url: string;
  tactic_id: string;
  user_stats: PlayerStats;
  enemy_stats: EnemyStats;
  story_opening: string;
}

export interface CombatResult {
  user_stats: PlayerStats;
  enemy_stats: EnemyStats;
  user_action: string;
  enemy_action: string;
  player_roll: number;
  enemy_roll: number;
  player_difficulty: number;
  enemy_difficulty: number;
  player_action_result: string;
  enemy_action_result: string;
}

export interface GameConfig {
  tacticUrl: string;
  playerHp: number;
  playerItems: string;
  enemyType: string;
  enemyHp: number;
  storyOpening: string;
}
