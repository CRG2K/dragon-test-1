import { GameState, CombatResult } from "../types";

export class TacticsAPI {
  private readonly API_URL = "https://api-staging.tactics.dev/api/run";

  public async executeTurn(
    state: GameState,
    action: string
  ): Promise<CombatResult> {
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initial_variables: {
            action,
            user_stats: state.user_stats,
            enemy_stats: state.enemy_stats,
            story_opening: state.story_opening,
          },
          tactic_id: state.tactic_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const rawResponse = await response.json();
      
      if (!rawResponse?.result?.content?.value) {
        throw new Error('Invalid response format from API');
      }

      return JSON.parse(rawResponse.result.content.value);
    } catch (error) {
      console.error('Error executing turn:', error);
      throw error; // Re-throw to let caller handle the error
    }
  }
}
