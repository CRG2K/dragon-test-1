# Dragon Slayer Adventure Template

A simple example of how to use the Tactics API to create a text-based adventure game.

## How to Use This Template

1. Click the "Use this template" button at the top of this repository to create a copy in your GitHub account
2. Clone your new repository to your local machine:
   ```bash
   git clone https://github.com/[your-username]/[repo-name].git
   cd [repo-name]
   ```

3. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Select "/ (root)" as the folder
   - Click "Save"
   - Wait a few minutes for deployment

4. Access your game:
   - Your game will be available at `https://[your-username].github.io/[repo-name]`
   - Fill out the configuration form with your API key and game settings
   - Click "Start Game" to begin playing

5. Test your game locally (optional):
   - Open `index.html` in your browser
   - Or use a local server:
     ```bash
     python -m http.server 8000
     ```
   - Then visit `http://localhost:8000` in your browser

## Configuration

The game can be configured through the web interface:
- API Key (get from tactics.dev/keys)
- Tactic URL (create at tactics.dev)
- Player stats (HP and items)
- Enemy stats (type and HP)
- Opening story text

## Customization

You can customize the game by:
- Modifying story text and game logic in `game.js`
- Changing the underlying tactic by changing the `tactic_id` in the API call (suffix of a tactic URL)
- Updating the UI styling in `index.html`
- Adjusting game parameters (health, damage, etc.) in `game.js`

## API Usage

This template uses the Tactics API to handle game logic. Example API call:

```bash
curl -X POST https://api.tactics.dev/run \
-H "Content-Type: application/json" \
-H "X-API-Key: YOUR_API_KEY" \
-d '{
      "initial_variables": {
        "playerHealth": 100,
        "playerDamage": 20
    },
    "tactic_id": "YOUR_TACTIC_ID"
}'
```

For more examples and documentation, visit [Tactics Documentation](https://tactics.dev/docs).

