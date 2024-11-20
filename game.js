/*
Game Core
---------
This file implements a browser-based RPG combat game that integrates with tactics.dev.
It handles game state, combat mechanics, UI, and API communication.

Key Systems:
- GameState: Core state management and configuration 
- CombatAPI: Handles API calls to tactics.dev for combat resolution
- GameEvents: Manages game flow and action processing
- UIManager: Handles display updates and user interaction
- GameManager: Top-level game initialization and control
*/

// Creates and manages the core game state object
const GameState = {
    create: (config) => ({
        turn_counter: 1,
        game_over: false,
        TACTIC_URL: config.tacticUrl || '',
        TACTIC_ID: config.tacticUrl ? config.tacticUrl.split('/').pop() : '',
        user_stats: {
            hp: parseInt(config.playerHp),
            max_hp: parseInt(config.playerHp),
            items: config.playerItems.split(',').map(item => item.trim()),
        },
        enemy_stats: {
            type: config.enemyType,
            hp: parseInt(config.enemyHp),
            max_hp: parseInt(config.enemyHp),
        },
        story_opening: config.storyOpening
    }),
    
    update: (state, updates) => ({
        ...state,
        ...updates
    })
};

// Handles API communication with tactics.dev for combat resolution
const CombatAPI = {
    async executeTurn(state, action) {
        const response = await fetch(`https://api.tactics.dev/api/run`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                initial_variables: {
                    action,
                    user_stats: state.user_stats,
                    enemy_stats: state.enemy_stats,
                    story_opening: state.story_opening,
                },
                tactic_id: state.TACTIC_ID,
            }),
        });

        const rawResponse = await response.json();
        console.log('Raw API Response:', rawResponse);
        
        return JSON.parse(rawResponse.result.content.value);
    }
};

// Processes game actions and updates state based on combat results
const GameEvents = {
    async handleAction(state, action, callbacks) {
        try {
            callbacks.onActionStart?.(action);
            
            const result = await CombatAPI.executeTurn(state, action);
            
            const newState = GameState.update(state, {
                user_stats: result.user_stats,
                enemy_stats: result.enemy_stats,
                turn_counter: state.turn_counter + 1,
                game_over: result.user_stats.hp <= 0 || result.enemy_stats.hp <= 0
            });
            
            callbacks.onActionComplete?.(result, newState);
            
            return newState;
            
        } catch (error) {
            callbacks.onError?.(error);
            return state;
        }
    }
};

// Global state container for game state and UI elements
const STATE = {
    elements: {
        storyText: document.getElementById('story-text'),
        gameOutput: document.getElementById('game-output'),
        actionInput: document.getElementById('action-input'),
        playerStats: document.getElementById('player-stats'),
        enemyStats: document.getElementById('enemy-stats'),
    },
    game: GameState.create({
        tacticUrl: null,
        playerHp: 100,
        playerItems: 'sword,shield',
        enemyType: 'Dragon',
        enemyHp: 200,
        storyOpening: 'Once upon a time...'
    })
};

// Manages URL parameters and updates
const URLManager = {
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    updateTacticUrl(newUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('tactic', newUrl);
        window.history.pushState({}, '', url);
        return newUrl;
    }
};

// Handles all UI updates and display logic
const UIManager = {
    updateStats() {
        const { user_stats, enemy_stats } = STATE.game;
        const { playerStats, enemyStats } = STATE.elements;
        
        const playerHpPercent = (user_stats.hp / user_stats.max_hp) * 100;
        const enemyHpPercent = (enemy_stats.hp / enemy_stats.max_hp) * 100;
        
        playerStats.style.color = this.getHpColor(playerHpPercent);
        enemyStats.style.color = this.getHpColor(enemyHpPercent);
        
        playerStats.textContent = `Player HP: ${user_stats.hp}/${user_stats.max_hp}`;
        enemyStats.textContent = `${enemy_stats.type} HP: ${enemy_stats.hp}/${enemy_stats.max_hp}`;
    },
    
    getHpColor(percentage) {
        if (percentage > 66) return '#4aff4a';
        if (percentage > 33) return '#ffd700';
        return '#ff4a4a';
    },
    
    appendToOutput(text, type = 'action') {
        const { gameOutput } = STATE.elements;
        const p = document.createElement('p');
        p.textContent = text;
        p.className = `game-text ${type}`;
        gameOutput.appendChild(p);
        gameOutput.scrollTop = gameOutput.scrollHeight;
    },
    
    displayCombatResults(result) {
        const { game } = STATE;
        this.appendToOutput(`Turn ${game.turn_counter}:`, 'turn-header');
        
        // Player results
        this.appendToOutput(`Your action: ${result.user_action}`, 'combat-details');
        const playerSuccess = result.player_roll >= result.player_difficulty;
        this.appendToOutput(
            `Roll: ${result.player_roll} vs difficulty ${result.player_difficulty} (${playerSuccess ? 'SUCCESS' : 'FAILURE'})`,
            `roll-details ${playerSuccess ? 'success' : 'failure'}`
        );
        this.appendToOutput(`Result: ${result.player_action_result}`, 'combat-details');
        
        // Enemy results
        this.appendToOutput(`${enemy_stats.type}'s action: ${result.enemy_action}`, 'combat-details');
        const enemySuccess = result.enemy_roll >= result.enemy_difficulty;
        this.appendToOutput(
            `Roll: ${result.enemy_roll} vs difficulty ${result.enemy_difficulty} (${enemySuccess ? 'SUCCESS' : 'FAILURE'})`,
            `roll-details ${enemySuccess ? 'success' : 'failure'}`
        );
        this.appendToOutput(`Result: ${result.enemy_action_result}`, 'combat-details');
        
        game.turn_counter++;
    }
};

// Handles game initialization and reset
const GameManager = {
    initializeGame: (config) => {
        // Update state
        STATE.game = GameState.create(config);
        
        // Initialize UI
        document.getElementById('config-form').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        STATE.elements.storyText.textContent = STATE.game.story_opening;
        UIManager.updateStats();
        GameManager.initializeTacticLink();
        GameManager.addResetButton();
    },
    
    addResetButton: () => {
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.className = 'reset-button';
        resetButton.addEventListener('click', () => GameManager.resetGame());
        
        document.getElementById('game-container').appendChild(resetButton);
    },
    
    initializeTacticLink: () => {
        const tacticDisplay = document.getElementById('tactic-display');
        const visitButton = document.getElementById('visit-tactic');
        
        tacticDisplay.textContent = STATE.game.TACTIC_ID;
        
        visitButton.addEventListener('click', () => {
            window.open(STATE.game.TACTIC_URL, '_blank');
        });
        
        tacticDisplay.addEventListener('click', () => {
            const newTacticUrl = prompt('Enter new tactic URL:', STATE.game.TACTIC_URL);
            if (newTacticUrl && newTacticUrl !== STATE.game.TACTIC_URL) {
                STATE.game = GameState.update(STATE.game, { TACTIC_URL: newTacticUrl });
                window.location.reload();
            }
        });
    },
    
    resetGame() {
        // Reset state to defaults
        STATE.game = GameState.create({
            tacticUrl: null,
            playerHp: 100,
            playerItems: 'sword,shield',
            enemyType: 'Dragon',
            enemyHp: 200,
            storyOpening: 'Once upon a time...'
        });
        
        // Reset UI elements
        const { gameOutput, actionInput } = STATE.elements;
        gameOutput.innerHTML = 'Battle Log';
        actionInput.disabled = false;
        actionInput.value = '';
        
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('config-form').style.display = 'block';
    }
};

// Setup form submission handler
document.getElementById('game-setup').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const config = {
        tacticUrl: document.getElementById('tactic-url').value,
        playerHp: document.getElementById('player-hp').value,
        playerItems: document.getElementById('player-items').value,
        enemyType: document.getElementById('enemy-type').value,
        enemyHp: document.getElementById('enemy-hp').value,
        storyOpening: document.getElementById('story-opening').value,
    };
    
    GameManager.initializeGame(config);
});

// Handle player action input
STATE.elements.actionInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !STATE.game.game_over) {
        const action = STATE.elements.actionInput.value.trim();
        if (!action) return;
        
        STATE.game = await GameEvents.handleAction(
            STATE.game,
            action,
            {
                onActionStart: (action) => {
                    document.getElementById('loading').style.display = 'block';
                    UIManager.appendToOutput(`You attempt to: ${action}`, 'user-input');
                    STATE.elements.actionInput.value = '';
                },
                
                onActionComplete: (result, newState) => {
                    document.getElementById('loading').style.display = 'none';
                    UIManager.displayCombatResults(result);
                    UIManager.updateStats();
                    
                    if (newState.game_over) {
                        STATE.elements.actionInput.disabled = true;
                        UIManager.appendToOutput(
                            newState.user_stats.hp <= 0 
                                ? `You have been defeated by the ${newState.enemy_stats.type}.`
                                : `Congratulations! You have slain the ${newState.enemy_stats.type}!`,
                            'game-over'
                        );
                    }
                },
                
                onError: (error) => {
                    document.getElementById('loading').style.display = 'none';
                    UIManager.appendToOutput("An error occurred. Please try again.", 'error');
                    console.error(error);
                }
            }
        );
    }
}); 