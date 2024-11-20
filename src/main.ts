import { GameEngine } from './core/GameEngine';
import { ConfigForm } from './components/ConfigForm';
import { GameContainer } from './components/GameContainer';
import { CombatLog } from './components/CombatLog';
import { EventBus } from './core/EventBus';
import './styles/main.css';

class Game {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private configForm: ConfigForm;
    private gameContainer: GameContainer;
    private combatLog: CombatLog;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.gameEngine = new GameEngine();
        
        // Initialize components
        this.configForm = new ConfigForm('config-form');
        this.gameContainer = new GameContainer('game-container');
        this.combatLog = new CombatLog('game-output');

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.eventBus.subscribe('playerAction', (action: string) => {
            this.handlePlayerAction(action);
        });

        this.eventBus.subscribe('error', (error: Error) => {
            console.error('Game error:', error);
            this.showError(error.message);
        });
    }

    private async handlePlayerAction(action: string): Promise<void> {
        const loadingIndicator = document.getElementById('loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        try {
            await this.gameEngine.processAction(action);
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    private showError(message: string): void {
        const gameOutput = document.getElementById('game-output');
        if (gameOutput) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'game-text error';
            errorDiv.textContent = `Error: ${message}`;
            gameOutput.appendChild(errorDiv);
            gameOutput.scrollTop = gameOutput.scrollHeight;
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 