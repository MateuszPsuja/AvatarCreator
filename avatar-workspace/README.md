# avatar-workspace

The Angular workspace behind [miniAvatar](../README.md) — the creator app plus
the two publishable libraries.

```bash
npm install
npm start        # http://localhost:4200
```

| Path | What it is |
|---|---|
| `src/app` | The creator, the export gallery and the app's own services |
| `src/libs/avatar-shared` | `AvatarConfig` model, palettes, SVG renderer, viseme mapping — no Angular |
| `src/libs/avatar-player` | Animated player component, animation and lip-sync services |

Full documentation, screenshots, the player API and the export-bundle format
live in the [root README](../README.md).

```bash
npm run build:libs   # build both libraries into dist/
npm test             # unit tests
```
