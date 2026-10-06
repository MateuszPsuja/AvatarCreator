# react-avatar-player

Animated SVG avatar components and hooks for React. Blinking, eye movement,
head idle motion and lip sync — rendered as pure vector SVG, so there are no
images, no fonts and no runtime assets to ship.

Every avatar is a plain `AvatarConfig` object, so an avatar designed in one app
can be stored, sent over the wire and rendered in another.

The geometry and lip-sync logic are compiled into this package, so
`npm install react-avatar-player` is a single self-contained step — there is no
second package to resolve. The source of that geometry is shared with the
Angular package rather than copied, so the two players cannot drift apart.

## Install

```bash
npm install react-avatar-player
```

`react` (18 or 19) is a peer dependency and is not bundled — bundling it would
give your app a second React and break hooks.

## Usage

```tsx
import { AvatarPlayer, type AvatarConfig } from 'react-avatar-player';
import 'react-avatar-player/styles.css';

export function ChatBubble() {
  const avatar: AvatarConfig = { /* 11 traits */ };
  const [talking, setTalking] = useState(true);

  return (
    <AvatarPlayer
      config={avatar}
      speaking={talking}
      message="Hi, I am talking while you read this."
      size={48}
    />
  );
}
```

The stylesheet is a separate import because the avatar markup is injected as raw
HTML, so no bundler can extract it from JSX. Import it once, anywhere in your
app.

### Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `config` | `AvatarConfig` | required | The avatar to render |
| `speaking` | `boolean` | `false` | Mouth the `message` while true |
| `message` | `string` | `''` | Text to mouth; ignored unless `speaking` |
| `idsPrefix` | `string` | `''` | Namespace for generated SVG ids |
| `size` | `number` | `48` | Base edge length in px; grows 1.5× while speaking |

**Set `idsPrefix` when you render more than one player on a page.** Every avatar
emits `url(#hat-clip)`, which resolves against the first matching element in the
document — without a unique prefix per avatar they all clip against whichever
came first, and hats and helmets stop hiding hair.

### `SvgAvatar`

The static, non-animated variant, if you want the face without the player
behaviour:

```tsx
import { SvgAvatar } from 'react-avatar-player';

<SvgAvatar config={avatar} size={120} animated />;
```

### Hooks

For building your own component around the same behaviour:

```tsx
import { useAvatarAnimation, useLipSync, LipSyncPlayer } from 'react-avatar-player';

const { blinkClass, pupilOffset } = useAvatarAnimation();   // blink + pupils
const viseme = useLipSync({ speaking, message });          // lip sync
```

Head idle motion is deliberately *not* in a hook — it is a pure CSS animation,
so it costs no JavaScript and no re-render.

### Rendering outside React

`buildAvatarSvg` is pure and dependency-free, so it runs in Node too — useful
for a build step, an email or a PDF:

```ts
import { buildAvatarSvg, textToVisemes } from 'react-avatar-player';

const svg = buildAvatarSvg(config);   // standalone 200×200 SVG document
```

Note that importing the package root also pulls in React, so a build script that
never touches the components can import the renderer file directly
(`react-avatar-player` ships the geometry as plain modules) or use
`angular-avatar-player`, which contains the same renderer with no React in it.

## Peer dependencies

React 18 or 19. For React 17 wait for a compatible release.

## License

MIT © Mateusz Psuja — see [LICENSE](https://github.com/MateuszPsuja/AvatarCreator/blob/main/LICENSE).

Part of [AvatarCreator](https://github.com/MateuszPsuja/AvatarCreator), which
includes a full browser-based avatar creator. Report issues
[on GitHub](https://github.com/MateuszPsuja/AvatarCreator/issues).