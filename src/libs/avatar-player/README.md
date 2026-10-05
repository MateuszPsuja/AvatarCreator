# angular-avatar-player

Animated SVG avatar component for Angular 19. Blinking, eye movement, head idle
motion and lip sync — rendered as pure vector SVG, so there are no images, no
fonts and no runtime assets to ship.

Every avatar is a plain `AvatarConfig` object, so an avatar designed in one app
can be stored, sent over the wire and rendered in another.

## Install

```bash
npm install angular-avatar-player
```

`@angular/core`, `@angular/common` and `@angular/platform-browser` are peer
dependencies (v19). `tslib` is the only regular dependency.

## Usage

### Standalone component

```ts
import { Component } from '@angular/core';
import { AvatarPlayerComponent, type AvatarConfig } from 'angular-avatar-player';

@Component({
  selector: 'app-chat-bubble',
  imports: [AvatarPlayerComponent],
  template: `
    <app-avatar-player
      [config]="avatar"
      [message]="line"
      [speaking]="talking"
    />
  `,
})
export class ChatBubble {
  avatar: AvatarConfig = { /* 11 traits */ };
  line = 'Hi, I am talking while you read this.';
  talking = true;
}
```

### NgModule-based apps

```ts
import { importProvidersFrom } from '@angular/core';
import { AvatarPlayerModule } from 'angular-avatar-player';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(AvatarPlayerModule)],
};
```

## What you get

Everything is exported from the single entry point:

| Export | Purpose |
| --- | --- |
| `AvatarPlayerComponent` | Animated player (blinking, eye tracking, idle motion, lip sync) |
| `SvgAvatarComponent` | Static SVG avatar, no animation |
| `AvatarPlayerModule` | NgModule wrapper for module-based apps |
| `AvatarConfig` + trait types | The avatar model: gender, skin tone, haircut, hair/eye colour, glasses, facial hair, profession |
| `SKIN_TONES`, `HAIR_COLORS`, `EYE_COLORS` | Palettes, for building pickers |
| `buildAvatarSvg`, `buildAvatarSvgInner`, `avatarCssVars` | Server-safe renderer, also usable in Node for offline export |
| `textToVisemes`, `MS_PER_VISEME`, viseme shapes | Lip-sync mapping |
| `buildTraitPreview` | Small trait thumbnails for creator UIs |
| `LipSyncService`, `AvatarAnimationService` | Lower-level services |

### Rendering outside Angular

The renderer is pure and dependency-free, so it works in Node too:

```ts
import { buildAvatarSvg, textToVisemes } from 'angular-avatar-player';

const svg = buildAvatarSvg(config);
const visemes = textToVisemes('Hello there');
```

## Peer dependencies

Angular 19. For Angular 20+ wait for a compatible release, or use
`--legacy-peer-deps`.

## License

MIT © Mateusz Psuja — see [LICENSE](https://github.com/MateuszPsuja/AvatarCreator/blob/main/LICENSE).

## Related packages

The geometry, palettes and lip-sync mapping live in `avatar-player-core`, which
this package depends on and re-exports — which is why everything above is
importable from this single path. `avatar-player-core` is also usable on its
own, in Node, for offline SVG export.

[`react-avatar-player`](https://www.npmjs.com/package/react-avatar-player) is
the same player for React. Both wrappers share one core, so an avatar looks and
animates identically in either framework.

Part of [AvatarCreator](https://github.com/MateuszPsuja/AvatarCreator), which
includes a full browser-based avatar creator. Report issues
[on GitHub](https://github.com/MateuszPsuja/AvatarCreator/issues).