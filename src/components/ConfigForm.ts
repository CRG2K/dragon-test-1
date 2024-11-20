import { EventBus } from "../core/EventBus";
import { StateManager } from "../core/StateManager";
import { GameConfig } from "../types";

export class ConfigForm {
  private form: HTMLElement;
  private eventBus: EventBus;
  private stateManager: StateManager;

  constructor(formId: string) {
    const element = document.getElementById(formId);
    if (!element) throw new Error(`Form ${formId} not found`);

    this.form = element;
    this.eventBus = EventBus.getInstance();
    this.stateManager = StateManager.getInstance();

    this.initializeListeners();
  }

  private initializeListeners(): void {
    const form = this.form.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const config = this.getFormData();
      this.stateManager.initializeFromConfig(config);
      this.eventBus.emit("gameStart", config);

      // Hide config form and show game container
      this.form.style.display = "none";
      document.getElementById("game-container")!.style.display = "block";
    });
  }

  private getFormData(): GameConfig {
    return {
      tacticUrl: (document.getElementById("tactic-url") as HTMLInputElement)
        .value,
      playerHp: parseInt(
        (document.getElementById("player-hp") as HTMLInputElement).value
      ),
      playerItems: (document.getElementById("player-items") as HTMLInputElement)
        .value,
      enemyType: (document.getElementById("enemy-type") as HTMLInputElement)
        .value,
      enemyHp: parseInt(
        (document.getElementById("enemy-hp") as HTMLInputElement).value
      ),
      storyOpening: (
        document.getElementById("story-opening") as HTMLTextAreaElement
      ).value,
    };
  }
}
