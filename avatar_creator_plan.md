# Avatar Creator — Development Plan

**Status:** living document for further agent development.
**Supersedes:** `AVATAR_CREATOR_AGENT-2.md` (the original build spec) and
`PLAN.md` (the redesign plan). Both are deleted; their still-valid content is
folded in here, and their stale content is corrected.
**Last verified against the code:** 2026-10-05 (commit `f6e0ed1`).

Read this before changing anything. Section 2 is normative — the visual style
guide is not a suggestion. Section 3 is what already shipped; do not redo it.
Sections 5–7 are the open work.

---

## 1. What this project is

Two deliverables from one Angular workspace:

| Deliverable | Path | Purpose |
|---|---|---|
| **Avatar Creator** | `src/app` | Full-page editor: pick traits, watch the SVG update, export the result |
| **`avatar-shared`** | `src/libs/avatar-shared` | `AvatarConfig` model, palettes, the SVG renderer, viseme mapping. No Angular, no DOM. |
| **`avatar-player`** | `src/libs/avatar-player` | Publishable Angular library: blinking, eye movement, head idle, lip sync |

The creator is *one consumer* of the libraries. The libraries are the product.
Anything that only the creator needs belongs in `src/app`, not in `src/libs`.

**Non-negotiable architectural rule:** there is exactly one implementation of
"turn an `AvatarConfig` into an SVG" — `buildAvatarSvg` in
`src/libs/avatar-shared/src/lib/avatar-renderer.ts`. The live preview, the
exported `.svg` and the player all call it. This rule exists because the
project previously had two renderers that silently drifted: the exporter
ignored gender, omitted `clipPath` defs and hardcoded the mouth, so exported
avatars were visibly wrong. **Never add a second render path.**

---

## 2. Normative spec

### 2.1 Visual style guide (mandatory)

> *Flat 2D vector avatar, head-and-shoulders portrait, friendly expression,
> clean SVG, smooth curves, minimal shading, solid colors, large eyes, soft
> rounded face, simple hair shapes, modern UI illustration, no gradients, no
> realism, centered composition, square format.*

**Canvas and composition**

- `viewBox="0 0 200 200"` — always square, never anything else.
- Head + shoulders only, centered.
- Face centered near `cx=100, cy=88`, `rx=52 ry=56` (man). A woman's head is
  deliberately different — see §4.2.
- Shoulders span roughly `x=30→170`, top edge around `y=150–158`.
- No background fill on the SVG root; the container defines it.

**Shape language**

- All curves use `rx`/`ry` ≥ 8px. No sharp corners.
- Eyes are large and this is not negotiable: sclera `r=11`, iris `r=9`,
  pupil `r=5`, highlight `r=2`.
- Eyebrows: thick arcs or rounded rects, `rx=3`.
- Hair: solid silhouette shapes only — never individual strands.
- Ears: simple ellipses, partially behind the face layer.
- Nose: a minimal upturned arc.
- Mouth: a friendly upward curve at rest, `stroke-linecap="round"`.

**Color rules — strictly enforced**

| Rule | Detail |
|---|---|
| ✅ Solid fills only | One flat `fill` per shape |
| ❌ No gradients | Never `<linearGradient>` / `<radialGradient>` |
| ❌ No shadows | Never `<filter>` / `<feDropShadow>` |
| ❌ No textures | Never `<pattern>`, hatching, stippling |
| ⚠️ Max 2 tones per region | base + shadow, both from the skin palette |
| ⚠️ `stroke-width` ≤ 2.5 | violations currently exist — see §5.3 |

**Anti-patterns**

```svg
<!-- ❌ gradient -->      <ellipse fill="url(#grad1)" />
<!-- ❌ filter/shadow -->  <ellipse filter="url(#shadow)" />
<!-- ❌ thick stroke -->   <path stroke-width="5" />
<!-- ❌ opacity shading --> <ellipse fill="#000" fill-opacity="0.15" />
<!-- ❌ hair strands -->   <!-- 50x <line> elements -->
```

The opacity rule is the one most often broken. "Make it a slightly darker
version of the same color" means **add a tone to the palette**, not set
`opacity`. Current violations are listed in §5.3.

**Scope note:** this guide governs the **avatar art** only. The app chrome
(risograph theme, grain overlays, registration marks) is unconstrained.

**Palettes** — `skin-tones.ts`, `hair-colors.ts`, `eye-colors.ts`. Each skin
entry carries `base`, `ear`, `lip` and `shadow`; `shadow` exists specifically
so the nose stays visible on `deep` skin (it previously used `--skin-ear` and
disappeared).

### 2.2 Data model

`src/libs/avatar-shared/src/lib/avatar.model.ts` — one flat `AvatarConfig`
with twelve fields: `id`, `name`, `gender`, `skinTone`, `haircut`, `hairColor`,
`eyeColor`, `mustache`, `beard`, `eyeStyle`, `glasses`, `profession`. Enumerated
value sets are in the same file and are mirrored in the bundle README.

Two properties of this contract are load-bearing:

- **Unknown values are not validated.** A missing or misspelled field falls back
  to that trait's default instead of throwing, so a bad config renders
  *plausible but wrong*. This is why the export bundle ships a schema README.
- **It is a wire format.** `avatar.json` is what other apps consume. Adding a
  field is backwards-compatible; renaming or removing one is not.

### 2.3 Visemes

Six mouth shapes in `mouth-shapes.ts`, driven by `visemes.ts`:

| id | shape | triggered by |
|---|---|---|
| 0 | silence | space, end of utterance |
| 1 | wide | a, i |
| 2 | round | o, u |
| 3 | spread | e, everything unmapped |
| 4 | pressed | m, b, p |
| 5 | teeth | f, v |

`MS_PER_VISEME = 80`. This is deliberately **not a phoneme model** — unmapped
consonants fall through to "spread" so the mouth reads as *moving*. Do not
describe it as accurate speech, and do not present it as phonetics.

### 2.4 Player library contract

`AvatarPlayerComponent` — the chat-facing wrapper.

| Input | Type | Default | Notes |
|---|---|---|---|
| `config` | `AvatarConfig` | required | |
| `message` | `string` | `''` | text to mouth while speaking |
| `speaking` | `boolean` | `false` | plays lip sync, grows the avatar 1.5× |
| `idsPrefix` | `string` | `''` | **required when more than one player is on a page** |
| `size` | `number` | `48` | edge length in px |

`idsPrefix` is not optional sugar. Every avatar emits `url(#hat-clip)`, which
resolves against the *first* matching element in the document; without a unique
prefix per instance, hats stop hiding hair on all but the first avatar.

`SvgAvatarComponent` is the lower-level renderer without the speech wrapper:
`config`, `animationsEnabled`, `viseme`, `idsPrefix`.

`LipSyncService.play(visemes, onViseme, onEnd?)` returns a cancel function.
`onEnd` fires exactly once per utterance. **Never infer the end from
`onViseme(0)`** — viseme 0 is silence and occurs at every space, so that ends
the utterance at the first word gap. This bug shipped once already.

**Animation mechanisms** — all owned by `AvatarAnimationService` /
`LipSyncService`:

| Animation | Mechanism |
|---|---|
| Blink | CSS class toggle on eyelid rects, random 2.5–5 s interval |
| Eye movement | `translate()` on the pupil group |
| Head idle | `requestAnimationFrame` sine wave |
| Lip sync | `setTimeout` viseme sequence |

`prefers-reduced-motion` is honoured in `svg-avatar.component.scss`.

### 2.5 Engineering rules

1. **Signals, not RxJS, in components.** `signal` / `computed` / `effect` only.
   The codebase was migrated off `@Input` + `ngOnChanges` precisely because a
   `computed` reading a plain property registers no dependency and silently
   evaluates once — that produced a frozen avatar, dead undo/redo and a dead
   Test Speech button.
2. **Spartan NG is creator-only and is wrapped.** Never import from
   `@spartan-ng/brain` directly; go through the `hlm-*` wrappers in
   `src/app/ui/spartan/`. The player library must never depend on Spartan.
3. **Library services are not `providedIn: 'root'`.** They are provided per
   component or by `AvatarPlayerModule`, so tree-shaking works and one
   destroyed avatar cannot stop another's animations.
4. **`bypassSecurityTrustHtml` only on internal generated SVG.** Never on
   user-supplied data.
5. **Animation loops run outside the Angular zone** to avoid change-detection
   spam; re-enter explicitly when writing signals.
6. **No `providedIn` cross-instance state.** Per-component providers for
   anything holding timers.
7. **Tailwind + SCSS, not SCSS-only.** The original spec said SCSS with no
   utility classes; the shipped app uses Tailwind with component SCSS. Match
   the neighbouring file, not the old spec.

---

## 3. What already shipped — do not redo

Verified working at commit `f6e0ed1`.

**Single-renderer extraction (old Phase 0).** `avatar-renderer.ts` exposes
`buildAvatarSvg`, `buildAvatarSvgInner`, `avatarCssVars`, `hairClipUrl`,
`helmetClipUrl`, `hasHat`, `isAstronaut`, `HAT_PROFESSIONS`,
`HELMET_PROFESSIONS`, `CANVAS`. Gender-aware, clip paths always emitted,
`--skin-shadow` added per tone.

**Parity regression tests** — `avatar-renderer.spec.ts` covers every profession
× gender, clip-path presence and behaviour, canvas bounds (no negative
coordinates), and self-containment. **This is the safety net for every refactor
in §5. If you touch the renderer, these tests are the contract.**

**Export bundle.** `AvatarService.buildBundleFiles` produces `avatar.json`,
`avatar.svg` and a schema `README.md`, zipped by a hand-rolled store-only zip
writer (`zip.util.ts`). `npm run verify:bundle` asserts the exact payload.

**Demo gallery** (`/demo`). Sixteen committed `.svg` + `.json` pairs generated
from `demo-manifest.ts` through the same `AvatarService` the export button uses
(`npm run demo:build`). Each card feeds its `.json` to a real
`<app-avatar-player>`.

> **Deviation from the old decision.** `PLAN.md` decided the demo would load
> *only* `.svg` files with no sidecar JSON. The shipped version fetches the
> `.json` too, because the point became "prove the exported config plays in the
> real player" rather than "prove the file is standalone". The standalone claim
> is still covered by `avatar-renderer.spec.ts`. Treat the JSON-loading version
> as the decision; the old one is superseded.

**UI redesign.** Risograph print-studio direction, dark by default
(`class="dark"` in `index.html`), paper/ink/spot-ink palette in `styles.scss`,
press-bed stage and specimen-sheet rail in `creator.page.*`.

**Functional creator work.** Real SVG trait previews via `buildTraitPreview` (no
emoji anywhere), undo/redo over 60 steps with name edits collapsed into one
entry, weighted randomize, save-to-`localStorage`, transient status messages
with an `aria-live` region, and Test Speech.

**Docs.** Root `README.md` with real screenshots; `npm run screenshots` drives
the running app with Playwright, `npm run gallery` renders the avatar grid with
resvg.

**Known deviation:** `/diag` is a temporary beard-geometry diagnostic, still
routed. Delete it or promote it; do not leave it undocumented.

---

## 4. Corrections to the old spec

The original spec is wrong or stale in these places. The code is the truth
unless §5 says otherwise.

| Old spec says | Reality |
|---|---|
| Angular 17+ | Angular 19.2, standalone components, signals |
| Nx monorepo, `apps/avatar-creator` | Plain Angular CLI workspace, app at the root |
| `@spartan-ng/ui-*` packages | Local `hlm-*` wrappers over `@spartan-ng/brain` |
| SCSS only, no Tailwind utilities | Tailwind + per-component SCSS |
| `avatarService.toCssVars()` | `avatarCssVars()` in the renderer |
| `avatarService.downloadSVG()` | `downloadBundle()` — a `.zip` of JSON + SVG + schema |
| Structurally `apps/` and `libs/` folders | `src/app` and `src/libs` |
| Angular 14+ consumer support | peer deps are `^19.2.0` |
| `play(visemes, onViseme)` | `play(visemes, onViseme, onEnd?)` |
| Skin palette has `base`/`ear`/`lip` | also `shadow` |
| Shoulders start at `y=155` | bodies start at `y=150–158`; the spec was never reconciled |
| `MOUTH_SHAPES[0]` hardcoded in the export | resolved by the single renderer |

Two internal contradictions in the old spec, still unresolved:

- **Mouth stroke width.** The color table caps strokes at 2.5; the canonical
  skeleton uses 3; `mouth-shapes.ts` still carries the 3 in a comment. Pick
  one, apply it, delete the other.
- **Face geometry.** The spec gives a single canonical face
  (`cy=88 rx=52 ry=56`), but the code has two (`MAN_FACE`, `WOMAN_FACE` in
  `beard-path.ts`) and the surrounding features are still built for the man's.
  See §5.2.

---

## 5. Open work

Ordered by dependency. A, B and C are one focused push with the parity test
guarding them. D is independent. E is release plumbing.

### 5.1 A — Part-data restructure (the enabling refactor)

**Why:** parts are opaque multi-line SVG strings injected through
`bypassSecurityTrustHtml`. Their children have no identity, so nothing can be
styled, coloured or animated individually. Every future feature — hair sway, hat
bob, wardrobe colour, per-eye-style eyelids — is blocked on this.

**Tasks**

1. Add a shared geometry module to `avatar-shared`: `FACE`, `EYES`, `EARS`,
   `NECK`, `SHOULDERS`, `BODY_PATH`. The body path is currently
   **copy-pasted 11×** in `profession-layers.ts`; ear and brow coordinates
   appear in three files.
2. Convert parts to typed element records:
   `PartNode = { tag; attrs; tone?: 'skin' | 'hair' | 'lip' | 'accent'; id?; layer? }`,
   rendered with `@for` so each node carries a class and can be an animation
   target.
3. Replace the string assembly in `avatar-renderer.ts` with a record-based
   renderer. Gender branching stops being template conditionals and becomes
   data.

**Risk:** highest-risk item in this document. It touches every part file. Do it
after A's tests are green, in its own commit, with `avatar-renderer.spec.ts`
running throughout.

**Acceptance:** the 11× duplicated body path exists once; all parity tests
still pass; at least one node is demonstrably addressable (e.g. a hair node
carries a class that CSS can target).

### 5.2 B — Gender geometry reconciliation

`WOMAN_FACE` is `cy=86 rx=49 ry=55` against `MAN_FACE` `cy=88 rx=52 ry=56`,
but the features around the face are still hardcoded for the man:

- eyelids are fixed rects at `x=63` / `x=115`, `y=77`, `22×22` in
  `avatar-renderer.ts`
- eye, brow and lash placement assume the canonical positions

`beard-path.ts` already has `fitToFace` and `faceHalfWidthAt` helpers that scale
canonical coordinates onto a face. **Use them** for eyes, brows and eyelids
rather than hardcoding a third set of numbers. Fixing this also resolves the
"blinking clips on narrow/almond eyes" defect, which exists because the eyelid
rect is sized for a round eye.

**Acceptance:** eyelids fit every `eyeStyle`; features are centred on
`WOMAN_FACE`; no blinking artefacts on almond or narrow eyes.

### 5.3 C — Style-guide violations

Twelve-plus concrete violations, all verified still present:

- **Opacity as a second tone** (banned by §2.1) —
  `beard-path.ts` stubble (`opacity="0.22"`), `beard-shapes.ts:30`,
  `hair-shapes.ts:83`, `profession-layers.ts:87,127,253,258,291`.
  Stubble is *entirely* an opacity hack.
- **`stroke-width` > 2.5** — `mustache-shapes.ts:16` (3), `:34` and `:38`
  (3.5), `profession-layers.ts:256` (4).
- **Raw off-palette colours** — greys such as `#78909C`, `#CFD8DC`, `#334155`
  and near-blacks in `profession-layers.ts`, outside the declared palettes.
- **Sharp corners / low radii** — mortarboard and police star polygons, mission
  patch, business tie, and rects with `rx` 0–5 in `profession-layers.ts`.

Each needs a real palette tone, not a lower opacity.

**Acceptance:** zero `opacity`-as-tone in avatar art; zero `stroke-width` > 2.5;
a grep-based audit in the test suite so these cannot come back.

### 5.4 D — Coherence and missing traits

**Gender gating.** `mustache` and `beard` are ungated, so a woman avatar can
grow a beard and the UI never says so. Same for hair: a man can pick `bun`, a
woman can pick `mohawk`. Add a coherence layer that filters options by gender,
and make randomize respect it.

**Empty accessories.** `doctor` and `business` ship an **empty `accessory`**
despite the spec promising a badge and a collar. Teacher's bow tie and
business's necktie are hardcoded male-corporate; both need blouse / blazer /
dress variants.

**Facial-hair colour.** Beards and mustaches hardcode `var(--hair-color)`. That
is wrong for `stubble`, and with `white` hair stubble is effectively invisible.
Add `facialHairColor`, defaulting to hair colour. This also overlaps §5.3 —
decide once whether stubble becomes a real tone or a `facialHairColor` case.

**Traits the model cannot express yet:** earrings, freckles, blush, nose
variants, user-selectable mouth shape (currently viseme-driven only), eyebrow
style (baked into the renderer), wardrobe colour (every garment hardcoded), face
shape, age.

### 5.5 E — Creator features still missing

Carried over from the old plan's Phase 2 functional list, not yet started:

- **Collection storage.** `AvatarService` writes one key
  (`avatar-workspace:saved-avatar`). A "Saved avatars" feature needs
  `avatar-workspace:collection` as an array, with `loadAvatar` kept as a thin
  wrapper over the last-edited slot. Consider also versioning the stored shape
  so an old key does not poison a new build.
- **Import config JSON.** Export exists; import does not. This is what lets a
  user round-trip a design, and what makes the demo assets reproducible outside
  the app. Validate against the §2.2 tables and reject loudly rather than
  rendering a plausible wrong face.

### 5.6 F — Distribution

The libraries are **not published**. `@avatar-workspace/avatar-player` 404s on
the npm registry, and `dist/` is gitignored, so a consumer cannot pull a
prebuilt copy from GitHub either. Today the only supported install is
`npm run build:libs` followed by a `file:` install.

To make `npm install` real:

1. **Rename the scope.** `@avatar-workspace` is not the owner's, and npm only
   lets you publish to scopes your account owns. This is a mechanical change
   across 17 files / 27 references (both lib `package.json`s,
   `ng-package.json`'s `allowedNonPeerDependencies`, `tsconfig.json` paths, both
   `tsconfig.lib.json`s, and the app's own imports). Consumer-facing *syntax*
   does not change, only the package name.
2. **Add publish metadata** to both libs: `repository`, `homepage`, `bugs`,
   `keywords`, keep `license` and `sideEffects: false`.
3. **Add a `LICENSE` file** at the repo root. Both libs declare MIT; the
   repository does not yet have the file.
4. **Add a publish workflow** (GitHub Actions, on release). Build, then
   `npm publish dist/avatar-shared` **before** `dist/avatar-player` — the
   player's manifest hard-depends on the exact shared version, and both must be
   bumped in lockstep on every release. Use `--provenance` so the tarball is
   verifiably tied to the commit.
5. **Tag releases.** A published version is immutable after 72 hours, so the
   git tag is the version.

### 5.7 G — Housekeeping

- Remove or promote the temporary `/diag` route.
- Decide whether the optional doc-script dependencies (`@resvg/resvg-js`,
  `playwright`) belong in `devDependencies` or stay documented-only.
- The README title says *miniAvatar*, the repository says *AvatarCreator*.
  Pick one.

---

## 6. Open questions

Real design calls, not implementation details. Do not guess silently.

1. **Does `--skin-shadow` exist for all five tones, or only where `--skin-ear`
   is too dark to read?** Currently `deep` needs it and `dark` is borderline.
2. **Is stubble a real second tone or a `facialHairColor` treatment?** It is a
   design decision, not a refactor, and §5.3 and §5.4 both depend on the answer.
3. **How strict should the parity test be?** Asserting exact SVG strings is
   brittle but strict; asserting required clip paths and geometry is robust but
   weaker. Current state is the latter plus per-profession snapshots. Keep?
4. **Should `--skin-shadow` replace `--skin-ear` entirely** now that nose and
   other shadowed detail use it? `ear` is also used for the ear fill, so the two
   roles may have diverged.
5. **Scope or no scope for npm** — see §5.6. Needs the owner's decision, and
   the unscoped names must be checked for availability first.

---

## 7. Acceptance criteria for the whole programme

- Every profession × gender renders identically in the preview, the export and
  the player; the parity suite is green.
- No style-guide violations remain in avatar art, and an automated audit
  prevents new ones.
- No duplicated body path; no hardcoded feature coordinates that ignore
  `fitToFace`.
- Gender-incoherent combinations are impossible through the UI, not merely
  discouraged.
- `doctor` and `business` ship the accessories the spec promises.
- A config can be exported, imported and re-exported without drift.
- `npm install <package>` works for both libraries from a clean machine, with
  provenance.
- `README.md` install instructions match what actually exists.

---

## 8. Working agreements for agents on this repo

- Read `avatar-renderer.spec.ts` before changing the renderer. It encodes
  decisions that are easy to break and expensive to rediscover.
- Keep the comments. The non-obvious ones record *why* a fix was needed —
  signal inputs, per-component providers, `onEnd` vs viseme 0, the `idsPrefix`
  collision. Deleting them guarantees the bug comes back.
- One concern per commit, and a passing test run with each. A renderer change
  and a style-guide change in the same commit are two reviews wearing a trench
  coat.
- When you fix a defect listed here, delete the line. This document is only
  useful while it is honest about what is still broken.
