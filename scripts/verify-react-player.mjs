// Renders the BUILT react-avatar-player to static markup and asserts on the
// output.
//
// Runs against dist/, not src/, so it verifies what would actually be published.
// react-dom/server is used deliberately: the components are plain function
// components, so server rendering exercises the same code path a browser would
// for markup, effects and prop handling — without needing a DOM.
//
// Usage: npm run verify:react  (run `npm run build:libs` first)
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AvatarPlayer, SvgAvatar, buildAvatarSvg, textToVisemes } from '../dist/avatar-player-react/index.js';

const config = {
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

let failures = 0;
const check = (label, cond) => {
  if (cond) {
    console.log(`  ok    ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}`);
  }
};

console.log('AvatarPlayer:');
const playerHtml = renderToStaticMarkup(
  createElement(AvatarPlayer, { config, speaking: false, idsPrefix: 'a' }),
);
check('renders the wrapper', playerHtml.includes('class="avatar-player"'));
check('renders the svg', playerHtml.includes('<svg'));
check('passes idsPrefix into generated clip ids', playerHtml.includes('id="ahelmet-clip"'));
check('inlines the palette as custom properties', playerHtml.includes('--skin-base'));
check('sets the pupil custom properties', playerHtml.includes('--pupil-x'));
check('includes the head-idle hook', playerHtml.includes('animate-idle'));
check('applies the default size of 48', playerHtml.includes('width="48"'));

console.log('\nAvatarPlayer speaking:');
const speakingHtml = renderToStaticMarkup(
  createElement(AvatarPlayer, { config, speaking: true, message: 'Hi there', size: 48, idsPrefix: 'b' }),
);
check('adds the speaking class', speakingHtml.includes('avatar-player--speaking'));
check('grows to 1.5x while speaking', speakingHtml.includes('width="72"'));

console.log('\nSvgAvatar static:');
const staticHtml = renderToStaticMarkup(createElement(SvgAvatar, { config }));
check('omits the animation hook when not animated', !staticHtml.includes('animate-idle'));
check('starts in the eyes-open state', !staticHtml.includes('blink-'));

console.log('\nRe-exported core surface:');
const svg = buildAvatarSvg(config);
check('buildAvatarSvg is re-exported and renders', svg.includes('<svg'));
check('textToVisemes is re-exported', textToVisemes('hello').length > 0);

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);