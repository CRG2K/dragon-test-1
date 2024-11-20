import { EventBus } from "../core/EventBus";
import { CombatResult } from "../types";

export class CombatLog {
  private container: HTMLElement;
  private eventBus: EventBus;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) throw new Error(`Container ${containerId} not found`);

    this.container = element;
    this.eventBus = EventBus.getInstance();

    this.initializeListeners();
  }

  private initializeListeners(): void {
    this.eventBus.subscribe("actionComplete", (result: CombatResult) => {
      this.appendCombatResult(result);
    });
  }

  private appendCombatResult(result: CombatResult): void {
    const turnLog = document.createElement("div");
    turnLog.innerHTML = `
            <div class="game-text turn-header">Turn Result:</div>
            <div class="game-text user-input">Your action: ${result.user_action}</div>
            <div class="game-text combat-details">
                ${result.player_action_result}<br>
                ${result.enemy_action_result}
            </div>
            <div class="game-text roll-details">
                Your roll: ${result.player_roll} (needed ${result.player_difficulty})<br>
                Enemy roll: ${result.enemy_roll} (needed ${result.enemy_difficulty})
            </div>
        `;

    this.container.appendChild(turnLog);
    this.container.scrollTop = this.container.scrollHeight;
  }
}
