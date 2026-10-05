# avatar-player-core

The framework-free avatar engine: the `AvatarConfig` model, the SVG geometry
renderer, the colour palettes, the viseme lip-sync mapping and the animation
drivers.

Pure TypeScript. No framework imports, no DOM reads, no runtime assets. The same
code powers every surface in this project, which is the point:

- [`angular-avatar-player`](https://github.com/MateuszPsuja/AvatarCreator/tree/main/src/libs/avatar-player) — Angular components
- [`react-avatar-player`](https://github.com/MateuszPsuja/AvatarCreator/tree/main/src/libs/avatar-player-react) — React components and hooks
- the offline SVG exporter in the creator app

One implementation means an exported avatar cannot mouth different words than
the live preview does, and a face designed in the Angular creator renders
identically in a React app.

## Install

Most consumers should install a UI package instead. Depend on this one directly
when you want the renderer without a UI framework — a build step, an email, a
PDF, a static site generator:

```bash
npm install avatar-player-core
```

## Usage

```ts
import { buildAvatarSvg, textToVisemes, type AvatarConfig } from 'avatar-player-core';

const config: AvatarConfig = {
  gender: 'woman',
  skinTone: 'light',
  haircut: 'long',
  hairColor: 'brown',
  eyeColor: 'blue',
  mustache: 'none',
  beard: 'none',
  eyeStyle: 'round',
  glasses: 'none',
  profession: 'astronaut',
};

const svg = buildAvatarSvg(config);          // a standalone 200×200 SVG file
const visemes = textToVisemes('Hello there'); // lip-sync sequence
```

`buildAvatarSvg` returns a self-contained document — it inlines its own palette,
so the result needs no external CSS. `buildAvatarSvgInner` returns the markup
without the `<svg>` wrapper, for embedding.

### Building your own component

The animation drivers are plain classes with no framework coupling:

```ts
import { AvatarAnimator, LipSyncPlayer } from 'avatar-player-core';

const anim = new AvatarAnimator();
anim.startBlink((state) => console.log(state)); // '' | 'blinking' | 'blink-half'
anim.startEyeMovement(({ x, y }) => console.log(x, y));
anim.stopAll();
```

```ts
const lips = new LipSyncPlayer();
const cancel = lips.play(lips.textToVisemes('Hi'), (viseme) => console.log(viseme));
cancel(); // resets to silence
```

Head idle motion is *not* here: it is a pure CSS animation, so it costs no
JavaScript. The stylesheet that ships with the UI packages contains it.

## Environment

Runs in the browser and in Node — nothing in this package touches the DOM. That
is what lets an app export avatars server-side.

## License

MIT © Mateusz Psuja — see [LICENSE](https://github.com/MateuszPsuja/AvatarCreator/blob/main/LICENSE).

Part of [AvatarCreator](https://github.com/MateuszPsuja/AvatarCreator). Report
issues [on GitHub](https://github.com/MateuszPsuja/AvatarCreator/issues).