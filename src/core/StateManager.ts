import { GameState, GameConfig } from "../types";
import { EventBus } from "./EventBus";

export class StateManager {
  private static instance: StateManager;
  private state: GameState;
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.state = this.getInitialState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): GameState {
    return {
      turn_counter: 1,
      game_over: false,
      tactic_url: "",
      tactic_id: "",
      user_stats: {
        hp: 100,
        max_hp: 100,
        items: ["sword", "shield"],
      },
      enemy_stats: {
        type: "Dragon",
        hp: 200,
        max_hp: 200,
      },
      story_opening: "Once upon a time...",
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setState(newState: Partial<GameState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.eventBus.emit("stateChanged", this.state);
  }

  public initializeFromConfig(config: GameConfig): void {
    const tacticId = config.tacticUrl.split("/").pop() || "";

    this.setState({
      tactic_url: config.tacticUrl,
      tactic_id: tacticId,
      user_stats: {
        hp: parseInt(String(config.playerHp)),
        max_hp: parseInt(String(config.playerHp)),
        items: config.playerItems.split(",").map((item) => item.trim()),
      },
      enemy_stats: {
        type: config.enemyType,
        hp: parseInt(String(config.enemyHp)),
        max_hp: parseInt(String(config.enemyHp)),
      },
      story_opening: config.storyOpening,
    });
  }
}