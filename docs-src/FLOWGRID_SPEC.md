# Flowgrid — Game Design & MVP Specification (Markdown)

> **Style & Mood:** Mini Metro–inspired, abstract, calm, readable.  
> **Core Genre:** Real‑time node‑conquest strategy (“node-based minimalist RTS”).  
> **Platform:** Browser (desktop-first), 2D Canvas/WebGL.  
> **Scope of this document:** 1) Full architecture blueprint. 2) Specific, step-by-step MVP plan for a single playable level.  
> **Audience:** This document is written so an AI assistant or engineer can implement the project end-to-end without further clarification.

---

## 1. Vision & Pillars

**One-line pitch:** A serene, data‑flow strategy game where you draw clean lines between colorful nodes, capture the network, and balance throughput without collapsing your system.

**Design pillars**
1. **Clarity over complexity** — minimal shapes, bold colors, no clutter; decisions are legible at a glance.  
2. **Tactile flow** — connections feel like living routes; longer lines slow throughput; geometry matters.
3. **Calm tension** — gentle, almost meditative pacing that nevertheless demands smart timing and expansion.  
4. **Determinism** — fixed simulation rules produce predictable outcomes, rewarding planning over twitch.  
5. **Short sessions** — 5–10 minutes per match, fast restarts, low friction.

**Player fantasy**  
- You are a systems designer—an invisible hand that shapes an elegant network.  
- Your tools are **placement**, **routing**, and **timing**.  
- Victories feel like solving a moving puzzle rather than defeating an enemy army.

---

## 2. High-Level Game Overview

- **Nodes** (stations/servers) generate **flow energy** over time.  
- Players **connect** their nodes to others using **links** (straight or curved lines).  
- Links transmit energy. Shorter links move energy faster; longer links slow the transfer without wasting energy.
- If incoming hostile energy depletes a node to zero, the node **flips ownership** and joins the attacker.  
- The game ends when one faction **controls all nodes** (domination) or a mode-specific condition is met.

**Aesthetic:** Off‑white background, clean colored circles, smooth bezier lines; ownership indicated by color. No explosions; use subtle pulses, thickness and motion to convey state.

---

## 3. Core Gameplay Loop

1. **Observe** the current network state (ownership, energy fills, link loads).  
2. **Act** by drawing new links, adjusting shares, or removing overextended routes.  
3. **Resolve** as energy transfers, draining enemies or reinforcing allies.  
4. **Capture** depleted enemy/neutral nodes; they join your color and begin producing.  
5. **Snowball** production advantage toward a **win condition**.

**Skill expression**: Choosing which neutral to take first, when to pivot from expansion to consolidation, how to shorten & reroute lines, when to sever links to avoid cascade failure.

---

## 4. Formal Game Model

### 4.1 Entities & Terminology

- **Node**: A circular station with a position, an owner (player/AI/neutral), energy, capacity, regeneration rate, radius (for visuals and hit‑testing), and a limit on simultaneous outgoing links.  
- **Link**: A directed connection from one node (source) to another (target) that continuously moves energy. Each link has a share (its portion of the source’s outflow), a maximum transfer rate that scales with its geometric length, and the stored length for visuals and AI heuristics.
- **Faction**: A color‑coded side (Player, AI). The player has no autonomous logic; the AI faction uses heuristics.  
- **Game State**: The authoritative collection of nodes, links, factions, selection/hover state, timers, RNG, and current level metadata.

### 4.2 Systems (Conceptual)

- **Energy System**: Per fixed tick, each node regenerates energy up to its capacity. It calculates available outflow beyond a safety reserve and distributes it across outgoing links according to per‑link share. Links slow their maximum transfer rate as they lengthen but do not waste energy. Friendly targets are reinforced; hostile targets are damaged.
- **Capture System**: If a node’s energy reaches zero from hostile incoming flow, ownership flips to the attacker; the node is reseeded to a low starting energy and enemy links from it are cut.  
- **Link System**: Enforces per‑node link limits, ensures shares across a source sum to at most 100%, prevents duplicate/illegal links, and clamps distances.  
- **AI System**: For the MVP, a simple, deterministic policy: when a node has surplus, attempt short, fast attacks on the nearest weak neutral/enemy within range; prefer targets that shorten the front and avoid overextension.
- **Victory System**: Checks global ownership; on player control of all nodes → “Win”; on AI control of all nodes → “Loss”.  
- **Input System**: Pointer hover/select, drag to create link, right‑click to delete link, hotkeys (pause, restart, share presets).  
- **Render System**: Draws background, links (thickness indicating rate), nodes (fill indicating energy), selection/hover effects, HUD and end screens.

### 4.3 Deterministic Timing

- Fixed simulation rate (e.g., 60 updates per second).  
- Rendering may occur at display refresh but interpolates between last and next logic snapshot only for visuals; the simulation never uses frame time.  
- All randomization uses a seeded generator for reproducibility (especially useful when debugging AI or replays).

---

## 5. Rules & Balancing (MVP Defaults)

> These values are chosen to feel deliberate and readable in a 1280×720 scene. Adjust only after playtests.

- **Node defaults**  
  - Capacity: **100 units** (some nodes can override to 110)  
  - Regeneration: **6 units/second** (some nodes 7)  
  - Outgoing link limit (per node): **3**  
  - Safety reserve (un-sendable buffer): **10 units**  
  - Radius: **16–18 px** (affects hit area and aesthetic weight)

- **Link defaults**
  - Maximum transfer rate per link: **20 units/second**
  - Distance speed penalty: **0.001 per pixel of link length**
  - Minimum speed floor: **35%** (prevents ultra-long links from stalling entirely)
  - Maximum legal distance for creating a link: **380 px**  
  - Visual thickness: proportional to current transfer rate

- **Capture & flip**  
  - Neutral and enemy both take full damage from hostile flow (no special multipliers in MVP).  
  - On capture, the node re-seeds to **20 energy** and adopts the attacker’s color.  
  - Outgoing hostile links from a newly captured node are removed immediately.

- **Win/Lose**  
  - Win: player owns **all nodes**.  
  - Loss: AI owns **all nodes**.  
  - Either state freezes simulation and shows an end screen with **Restart**.

---

## 6. User Experience & Controls

- **Pointer**  
  - **Hover**: highlight node; show a subtle label with owner and energy.  
  - **Drag from owned node to target**: create link if legal.  
  - **Right‑click a link** (or a small mid‑segment handle): delete link.  
  - **Click a source, then click a target**: alternate link creation method.

- **Keyboard**  
  - **Space**: Pause / Resume.  
  - **R**: Restart current level.  
  - **1 / 2 / 3**: Set link share presets to 25% / 50% / 100% of source’s available outflow for the last created link.  
  - **Esc**: Deselect.

- **HUD**  
  - Top‑left: level title, timer (optional), pause indicator.  
  - Top‑right: small legend of colors (Player, AI, Neutral).  
  - Bottom‑center: contextual prompts (e.g., “Drag from a blue node to create a connection”).  
  - End screen: big headline (“Network Secured” / “Network Compromised”), button “Restart”.

- **Visual language**  
  - **Nodes**: filled circles; inner radial fill proportionate to energy.  
  - **Links**: smooth curves; thickness = instantaneous rate; color = owner.  
  - **Neutrals**: mid‑gray; **Player**: saturated blue; **AI**: saturated red.  
  - **Background**: off‑white (paper-map feel).  
  - **Typography**: clean sans serif; all-caps small labels when needed.

---

## 7. Content Plan (MVP Level)

**Scene size:** 1280 × 720 (no scrolling).  
**Node set:** 9 total nodes; Player owns 2, AI owns 2, 5 are neutral.  
**Starting energies:** Slight advantage to edge owners to encourage early expansion.  
**Topology goal:** Encourage both sides to race toward a central cluster and create interesting contested links.

**Exact coordinates and parameters**

| ID | X | Y | Owner | Energy | Capacity | Regen/sec | Radius |
|----|---:|---:|:------|------:|---------:|----------:|------:|
| n1 | 260 | 360 | Player | 80 | 110 | 7 | 18 |
| n2 | 380 | 220 | Player | 70 | 110 | 6 | 16 |
| n3 | 560 | 160 | Neutral | 60 | 100 | 6 | 16 |
| n4 | 620 | 340 | Neutral | 65 | 100 | 6 | 16 |
| n5 | 540 | 520 | Neutral | 70 | 100 | 6 | 16 |
| n6 | 760 | 240 | Neutral | 65 | 100 | 6 | 16 |
| n7 | 860 | 420 | Neutral | 70 | 100 | 6 | 16 |
| n8 | 980 | 280 | AI | 80 | 110 | 7 | 18 |
| n9 | 1060 | 520 | AI | 70 | 110 | 6 | 16 |

**Pre-placed links:** None in MVP.  
**Seed:** 1337 (used only if procedural elements are introduced later).

---

## 8. AI Design (MVP Heuristic)

**Intent:** Simple, readable opponent that pressures the player without feeling unfair.

**Behavior sequence (evaluated several times per second):**
1. For each AI-owned node, compute **surplus** = current energy − safety reserve.  
2. If surplus exceeds a small threshold (e.g., 20), consider creating or reinforcing a link.  
3. Candidate targets: within max distance, not already heavily defended, prioritize in order:  
   - Nearest **neutral** with lower energy than surplus,  
   - Nearest **enemy (player)** node that is currently **under pressure** or low energy,  
   - Else hold.  
4. Avoid creating more than the tentacle limit.  
5. If a link is much longer than an available shorter alternative (newly captured mid-node), reroute by deleting the long link and creating the short one.  
6. If a source’s energy falls near the safety reserve, it reduces shares to non-critical links or prunes one link (starting with the longest).

**Tuning knobs:** surplus threshold, evaluation cadence, aggression bias toward neutrals vs. enemies, pruning tolerance.

---

## 9. Edge Cases & Rules of Thumb

- **No self‑links** or two identical direction duplicates.  
- **Bidirectional flows** are allowed (both sides linking each other), which create tug‑of‑war drains until one side flips.  
- **Overextension risk**: creating too many long links from a single source should visibly weaken all of them—this is a feature, not a bug.  
- **Freshly captured nodes** start weak (seed energy) to prevent instant daisy‑chains with no counterplay.  
- **Distance clamp**: if the mouse release is beyond max distance, cancel link creation with a subtle shake or sound.  
- **Pause** should freeze simulation but keep subtle ambient animations very faint (optional).

---

## 10. Audio Direction

- Subtle ambient pad that scales in volume with total flow intensity.  
- Soft bleep on link creation, muffled break on deletion.  
- A gentle swell when a node flips ownership.  
- No harsh FX; no randomization that would break the calm tone.

---

## 11. Accessibility & UX Considerations

- **Color‑blind support**: optional alternate palette or add small owner glyphs inside nodes.  
- **Input leniency**: snap targets when drag end is near a node.  
- **Readable thickness**: ensure links remain visible even at low rates.  
- **Tutorial hints**: first 30 seconds show contextual tips that fade after interaction.

---

## 12. Performance Targets

- Single canvas, 60 FPS on modest laptops.  
- O(n + m) per tick where n = nodes, m = links; no per-unit entities.  
- Cached link lengths and curve control points to avoid expensive recomputations each frame.  
- No shadows or heavy blurs; use solid fills and alpha for emphasis.

---

## 13. Data & Persistence

- **Level data** stored as a serializable object (id, camera size, node list).  
- **Settings** (audio on/off, color-blind mode) in `localStorage`.  
- **No save‑mid‑match** in MVP; fast restarts mitigate need.

---

## 14. MVP Production Plan (One Playable Level)

> Goal: A single match that loads instantly, plays cleanly, communicates clearly, and ends with a win/loss screen.

### 14.1 Deliverables Checklist

- Load Level 1 with the exact node table above.  
- Implement energy regen, distance-based link speed scaling, safety reserve, and per-node link limits.
- Create links by drag-and-drop; delete links via right-click.  
- Show hover and selection states; show link thickness corresponding to flow.  
- Implement capture flips with reseed energy and hostile link pruning.  
- Basic AI as specified; it should contest central neutrals.  
- Win/Lose detection and restart flow.  
- Pause/resume and HUD.  
- No console errors; simulation remains stable under spammy input.

### 14.2 Task Order (suggested sprint)

1. **Scene & Rendering Skeleton** — canvas, background, camera, draw nodes/links statically.  
2. **Input & Selection** — hover detection, drag from node A to node B; legal-link checks; deletion.  
3. **Simulation Core** — per-tick regen; available outflow; distance-based link speed scaling; energy transfers.
4. **Capture & Ownership** — depletion → flip → reseed → prune hostile links.  
5. **AI MVP** — surplus detection and nearest-target attacks; simple reroute logic.  
6. **Win/Lose & HUD** — end screens; restart; pause; legend.  
7. **Polish** — link thickness animation; subtle energy pulses; tutorial hints; sound.  
8. **Balance Pass** — validate timings (a typical match should end in ~4–7 minutes).

### 14.3 Acceptance Tests (manual)

- **Link legality**: Cannot connect if target too far, if tentacle limit reached, or if link already exists.  
- **Transfer pacing**: Source energy takes longer to arrive through long links; short links feel snappy.
- **Capture**: Neutral flips after sustained pressure; on flip, ownership color updates and outgoing hostile links from that node vanish.  
- **AI**: Expands to nearest neutral quickly; occasionally pressures a weakened player node; does not stall indefinitely.  
- **Win state**: Achievable by capturing central neutrals first and cutting AI’s long routes.  
- **Loss state**: Occurs if the player overextends early and loses both starters.  
- **Pause**: Freezes simulation; unpause resumes smoothly without jumps.  
- **Restart**: Fully resets to initial level state.

---

## 15. Roadmap Beyond MVP (Non-blocking)

- **Special node types** (Relay/Hubs/Shield) that modify regeneration or transfer speed.
- **Weighted shares** UI to distribute a source’s outflow precisely among multiple links.  
- **Multiple levels** with varied geometries and hazards.  
- **Zen/Optimization modes** that emphasize optimization instead of conquest.
- **Asynchronous challenges** (share a level seed and best time/turns).  
- **UX skin packs** (neural theme, transit theme, energy grid theme).

---

## 16. Naming, Branding, and Tone

**Working title:** *Flowgrid*  
**Alternates:** *Conflux*, *Circuitfront*, *Routeborn*, *Network*  
**Tagline ideas:**  
- “Draw the network. Balance the flow.”  
- “Elegance under pressure.”  
- “Systems, not soldiers.”

**Store text (short):**  
> Build an elegant network of nodes and lines. Route energy, capture the map, and keep your system from collapsing in this calm, minimalist real-time strategy.

---

## 17. Glossary (for implementers and AI agents)

- **Energy**: The scalar resource that is both health and transferable flow.  
- **Efficiency**: The proportion of energy that survives a link; in the MVP it remains constant regardless of distance.
- **Share**: The intended portion of a source node’s outflow assigned to a particular link.  
- **Safety reserve**: Minimum energy a node tries to keep to avoid self-starvation.  
- **Flip/Capture**: When hostile flow reduces a node’s energy to zero, ownership changes.

---

## 18. Non-Goals (MVP)

- No pathfinding for units (there are no discrete units).  
- No tech trees, currency, or meta-progression.  
- No multiplayer.  
- No zoom/pan; fixed camera.  
- No complex particle systems or heavy post-processing.

---

## 19. Final Notes for the Implementer

- Keep the **simulation deterministic** and **timing fixed** to simplify AI and debugging.  
- Prioritize **legibility**: stroke weights, color contrast, spacing.  
- Always ask: “Can the player *see* why they’re winning or losing?” If not, adjust visuals before adding features.  
- Treat the **length of a link** as a first-class design lever—players should intuitively learn “shorter is better.”  
- Favor **few, meaningful actions** over micro-management. The fun is in shaping the network and anticipating consequences.

---

*End of document.*
