# Suika Game (Expo + React Native)

An arcade-style fruit merging game built with Expo, React Native, and Matter.js physics. Inspired by the classic Suika gameplay, this version includes touch-based spawning, merge mechanics, bomb mode, and polished visuals.

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app (pick your target from the Expo menu)

   ```bash
   npx expo start
   ```

Additional run helpers:

```bash
# Run on Android (requires emulator or device)
npm run android

# Run on iOS (requires macOS + Xcode)
npm run ios

# Run on Web
npm run web
```

## Overview

Drop fruits, let physics do the rest, and merge identical fruits into larger ones to climb the score. A bomb mode lets you tap to explode fruits outward for tactical clears. The UI is styled for clarity with animated feedback.

## Features

- Matter.js physics with fixed timestep for stability
- Fruit merge logic with score increments and pop sound
- Bomb mode with radial force, visual explosion ring, and optional hiding/removal
- Animated UI: score bump, next-fruit preview, fruit spawn pop
- Clean deadline line and tweaked basket visuals

## Controls

- Tap and drag across the top area to position the next fruit; release to drop
- Toggle bomb with the 💣 button; tap to detonate at the touch point

## Project Structure

- `app/` – Navigation entry and screens (Expo Router)
- `components/Game.tsx` – Main game view, UI, input handling
- `components/game/renderers.tsx` – Renderers for fruits, walls, line, and effects
- `systems/Physics.ts` – Physics system integration with Matter.js and merge logic
- `constants/game.ts` – Fruit definitions and weighted spawning
- `assets/images/` – Sprites and background visuals

## Configuration & Development

- TypeScript config: `tsconfig.json`
- Linting: `eslint.config.js`
- Expo config and scripts: `package.json`, `scripts/reset-project.js`

Common tasks:

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## Troubleshooting

- If the app stalls on “Starting…”, restart Expo or your emulator/device
- Ensure Android emulator or iOS simulator is running before `npm run android/ios`
- If you see warnings from third-party modules (e.g., tsconfig in node_modules), you can usually ignore them

## Reset Starter (Optional)

This repo includes a helper to reset the template:

```bash
npm run reset-project
```

That moves the starter code to `app-example/` and gives you a fresh `app/` directory.

## Credits

Built with Expo + React Native. Physics by Matter.js. Sprites and UI tuned for a playful Suika-like experience.
