import { EventBus } from "../core/EventBus";
import { StateManager } from "../core/StateManager";
import { GameState } from "../types";

export class GameContainer {
  private container: HTMLElement;
  private eventBus: EventBus;
  private stateManager: StateManager;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Container ${containerId} not found`);

    this.container = element;
    this.eventBus = EventBus.getInstance();
    this.stateManager = StateManager.getInstance();

    this.initializeListeners();
    this.render();
  }

  private initializeListeners(): void {
    this.eventBus.subscribe("stateChanged", (state: GameState) => {
      this.render();
    });
  }

  private render(): void {
    const state = this.stateManager.getState();

    this.container.innerHTML = `
            <div id="story-text">${state.story_opening}</div>
            <div id="game-output">Battle Log</div>
            <div id="loading" style="display: none">Processing your action... ⚡</div>
            <input type="text" id="action-input" placeholder="What would you like to do?">
            <div id="stats">
                <div id="player-stats">Player HP: ${state.user_stats.hp}/${state.user_stats.max_hp}</div>
                <div id="enemy-stats">${state.enemy_stats.type} HP: ${state.enemy_stats.hp}/${state.enemy_stats.max_hp}</div>
            </div>
        `;

    this.attachEventHandlers();
  }

  private attachEventHandlers(): void {
    const actionInput = this.container.querySelector(
      "#action-input"
    ) as HTMLInputElement;
    if (actionInput) {
      actionInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleAction(actionInput.value);
          actionInput.value = "";
        }
      });
    }
  }

  private handleAction(action: string): void {
    if (!action.trim() || this.stateManager.getState().game_over) return;
    this.eventBus.emit("playerAction", action);
  }
}
