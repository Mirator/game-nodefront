# Flowgrid MVP

A minimalist, node-based real-time strategy prototype inspired by the Flowgrid specification. Draw connections between your nodes, balance energy throughput, and capture the entire network against a deterministic AI opponent.

## Getting started

```bash
npm install
npm run dev
```

This launches Vite’s development server. Open the printed URL in your browser to play.

## Features

- **Networked RTS loop:** Drag connections between your nodes to route energy, then trim or reroute links as the battle shifts. Shorter routes move energy faster, so tighten your web to keep pressure on enemies.
- **Readable HUD:** The energy summary tracks player, red AI, purple AI, and neutral totals, with a pie chart and legend that only show active factions. Prompts and pause indicators surface moment-to-moment status.
- **Level progression:** Fifteen handcrafted levels ship with the prototype. You can pick any unlocked level from the New Game menu, resume mid-run without reloading, and automatically unlock the next scenario after a win. Progress and your last selected level persist locally between sessions.
- **AI flavor:** Levels can specify the current AI strategy, and the HUD footnote calls out which approach is active.
- **End-of-round actions:** Win or lose, the end screen lets you restart immediately or jump back to the level picker to continue your run.
- **God Mode utilities:** Toggle God Mode to temporarily unlock every level, enable the level editor entry point, and surface a HUD badge indicating the mode is active.
- **Built-in level editor:** Create custom levels with draggable nodes, owner/type/energy controls, map dimensions, seed and AI strategy fields, and export-ready `LevelDefinition` code.

## Controls

### Gameplay
- **Create links:** Click and drag from a blue (player-owned) node to another node within range.
- **Delete links:** Right-click near the midpoint of one of your links to remove it.
- **Pause/Resume:** Press <kbd>Space</kbd>.
- **Restart level:** Press <kbd>R</kbd> or use the end-screen **Restart** button.
- **Toggle God Mode:** Press <kbd>G</kbd> to unlock all levels and reveal the level editor entry in the menu.
- **Open level picker:** Click **New Game** at the top of the HUD, or use **Choose Next Level** from the end screen after a win.

### Level editor (God Mode only)
- Open **Level Editor** from the menu, then drag nodes directly on the canvas to reposition them.
- Use **Add Node**/**Delete Node** to manage nodes, and the inspector fields to update IDs, owners (player, red AI, purple AI, neutral), node types (small/medium/large), starting energy, and coordinates.
- Adjust level width/height, seed, and AI strategy ID; the canvas resizes to match the dimensions.
- Update the export constant name to generate a copy-pasteable `LevelDefinition` snippet for the codebase. Use **Back to Menu** or <kbd>Esc</kbd> to close.

## Deployment

This repository ships with a GitHub Actions workflow that builds the Vite project and publishes the production bundle to GitHub Pages whenever `main` is updated. To enable deployments in your fork:

1. Open the repository settings on GitHub.
2. Enable GitHub Pages with the “GitHub Actions” source.
3. Push to `main` (or trigger the workflow manually) to deploy the latest build.

## Additional documentation

The full game design brief lives in [`docs-src/FLOWGRID_SPEC.md`](docs-src/FLOWGRID_SPEC.md).
