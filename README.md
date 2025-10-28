# Flowgrid MVP

A minimalist, node-based real-time strategy prototype inspired by the Flowgrid specification. Draw connections between your nodes, balance energy throughput, and capture the entire network against a deterministic AI opponent.

## Getting started

```bash
npm install
npm run dev
```

This launches Vite’s development server. Open the printed URL in your browser to play.

## Gameplay overview

- **Create links:** Drag from a blue (player-owned) node to another node within range.
- **Delete links:** Right-click near the midpoint of a player-owned link.
- **Pause/Resume:** Press <kbd>Space</kbd>.
- **Restart:** Press <kbd>R</kbd> or use the end-screen button.

Keep links short to maximize efficiency. Captured nodes reseed with low energy, so defend them before expanding further.

## Deployment

This repository ships with a GitHub Actions workflow that builds the Vite project and publishes the production bundle to GitHub Pages whenever `main` is updated. To enable deployments in your fork:

1. Open the repository settings on GitHub.
2. Enable GitHub Pages with the “GitHub Actions” source.
3. Push to `main` (or trigger the workflow manually) to deploy the latest build.

## Additional documentation

The full game design brief lives in [`docs-src/FLOWGRID_SPEC.md`](docs-src/FLOWGRID_SPEC.md).
