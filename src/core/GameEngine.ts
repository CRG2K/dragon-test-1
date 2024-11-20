import { StateManager } from "./StateManager";
import { EventBus } from "./EventBus";
import { CombatResult } from "../types";
import { TacticsAPI } from "../api/TacticsAPI";

export class GameEngine {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private tacticsAPI: TacticsAPI;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.tacticsAPI = new TacticsAPI();
  }

  public async processAction(action: string): Promise<void> {
    try {
      this.eventBus.emit("actionStart", action);

      const state = this.stateManager.getState();
      const result = await this.tacticsAPI.executeTurn(state, action);

      this.updateGameState(result);

      this.eventBus.emit("actionComplete", result);
    } catch (error) {
      this.eventBus.emit("error", error);
    }
  }

  private updateGameState(result: CombatResult): void {
    const currentState = this.stateManager.getState();

    this.stateManager.setState({
      user_stats: result.user_stats,
      enemy_stats: result.enemy_stats,
      turn_counter: currentState.turn_counter + 1,
      game_over: result.user_stats.hp <= 0 || result.enemy_stats.hp <= 0,
    });
  }
}
