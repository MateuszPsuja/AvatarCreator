# miniAvatar — Redesign Plan

Branch: `new-design`
Date: 2026-10-02

## Decisions taken

| Question | Decision |
|---|---|
| Demo content | Renders **SVG files the app itself exports** |
| Demo isolation | Own folder in `src/` with its own route and assets |
| UI scope | **Full visual redesign**, not Spartan token tweaks |

---

## The finding that drives the ordering

The demo shows the app's own exported SVGs. So the demo is a direct
showcase of export fidelity — and export fidelity is currently broken.

`AvatarService.buildSvgString` duplicates the render logic as a string
template, and it has drifted from `svg-avatar.component.html`:

- **Gender is ignored entirely.** The live template branches on `isWoman`
  in 7 places; the exporter always emits male geometry.
- **`clipPath` defs are omitted.** For `engineer` / `police` / `artist` the
  exported hair is unclipped and pops through the hat. For `astronaut`,
  hair, ears, beard and mustache all overflow the helmet.
- Lashes, eyelids and the astronaut neck suppression are missing.
- `MOUTH_SHAPES[0]` is hardcoded.

Shipping a demo first would mean shipping the bug as the demo.

**Therefore: fix the exporter first (Phase 0).** It is also the change that
unblocks everything else, because it requires extracting the render into a
single shared function.

---

## Phase 0 — Single source of truth for the render (BLOCKER)

**Goal:** one function produces the avatar; both the live component and the
export call it. No second implementation.

1. Move the builder into `avatar-shared` as a **pure, fully typed** function.
   - `buildAvatarSvg(config: AvatarConfig, opts?: { viseme?: number; animated?: boolean }): string`
   - Replaces the `shared: any` parameter on `buildSvgString`
     (`app/services/avatar.service.ts:74`) with a real type import.
2. Make it gender-aware and include the `clipPath` defs (`hat-clip`,
   `helmet-clip`) with every `clip-path` attribute the live template uses.
3. Export **differs from preview only in animation**, by design: the animated
   build adds blink/pupil/head-idle classes; the static build omits them.
4. Fix two color bugs found in the audit:
   - Nose stroke uses `--skin-ear` (`#3C200E`) and effectively disappears on
     `deep` skin. Add a dedicated `--skin-shadow` tone per skin entry.
   - Mouth stroke-width is 2.5 in the export vs 3 in the preview. The spec is
     self-contradictory here (`AVATAR_CREATOR_AGENT-2.md:51` says max 2.5, the
     skeleton at line 104 uses 3). Pick 2.5 and correct the spec.
5. **Parity test** — the real safeguard. Render every profession × gender
   through the builder and assert the required clip paths and the
   gender-specific geometry are present. This test fails whenever the two
   renderers diverge again.

**Out of scope here:** the part-data restructure (Phase 3). This phase moves
the string template; it does not change its shape.

---

## Phase 1 — Demo directory and viewer

Once the exporter is correct, the demo is a thin consumer of it.

```
src/app/demo/
  demo.page.ts|html|scss     route: /demo
  demo-manifest.ts           ordered list of { file, label, notes }
  assets/                    committed exported SVGs
    *.svg
```

**Asset serving.** The existing `public/**` glob already covers `public/`, but
to keep everything in one folder as requested, add one entry to
`angular.json`:

```json
{ "glob": "**/*.svg", "input": "src/app/demo/assets", "output": "demo-assets" }
```

**Generating the demo assets.** A small script reuses the Phase 0 builder to
regenerate every demo SVG from its config, so the committed files can never
be hand-edited into inconsistency. `npm run demo:build`.

**Naming.** Exported filenames currently come from `config.name`, which is
free text and not filesystem-safe. Give the generator deterministic slugs
(`astronaut-deep-01.svg`) and keep the display name in the manifest.

**Viewer.** Grid of committed SVGs rendered via `<img>` (correct choice —
proves each file is genuinely standalone). Features: lightbox on click, name
and trait summary, and a "regenerate" note pointing at the script. Static SVG
files have no animation, so the viewer should not imply otherwise.

**Why `<img>` and not inline:** it is the honest test. If the exported file
depends on ambient CSS or a parent variable, it will visibly break in the
viewer. That is the whole point of this demo.

---

## Phase 2 — UI redesign

**Direction: risograph print studio / specimen sheet.**

The product is a flat spot-color vector avatar editor. Riso printing *is*
flat spot color on paper. The redesign commits to that instead of the current
dark-purple SaaS default.

- **Away from:** the current `262 83% 58%` purple primary, the purple glow
  backdrop (`creator.page.html:129`), and Inter. These read as generic AI
  dashboard.
- **Palette:** paper `#F4F1EA`, ink `#141210`, spot inks — Riso Blue
  `#0078BF`, Riso Orange `#FF6C2F`, Riso Pink `#FF48B0`. One dominant, sharp
  accents. Not timidly distributed.
- **Type:** **Fraunces** (variable serif, wonky optical sizes) for display,
  **Archivo** for UI, **Martian Mono** for labels and numeric readouts. The
  mono carries the "specimen label" feel.
- **Layout:** asymmetric. Large stage left with the avatar on a press bed;
  controls in a right rail as a numbered specimen sheet. Registration marks
  in the corners, grid-breaking section numerals.
- **Atmosphere:** SVG `feTurbulence` grain overlay, hard-edged registration
  offsets, layered transparencies.

> Note: the grain/filter ban in `AVATAR_CREATOR_AGENT-2.md` applies to the
> **avatar art**, not the app chrome. Keep exported avatars filter-free; the
> UI can use whatever it likes.

**Functional UI work, independent of the visual direction:**

1. **Real shape previews in the pickers.** `TraitOption` already has an
   unused `svgPreview` field (`trait-picker.component.ts:5`) and
   `TraitPickerComponent` already renders it. Nothing in `creator.page.ts`
   ever populates it — the UI falls back to emoji. Wire previews from the
   part data. This is the single biggest perceived-quality win available and
   the infrastructure is already written.
2. **Avatar collection storage.** `AvatarService` writes a single key
   (`avatar-workspace:saved-avatar`). A "Saved" feature needs a collection:
   `avatar-workspace:collection` as an array, with `loadAvatar` kept as a
   thin wrapper for the last-edited slot.
3. **Undo / redo.** Signal-based history over `config`. High value for a
   creative tool.
4. **Randomize.** One button, weighted toward coherent combinations
   (respecting the gender gating from Phase 4).
5. **Save/export feedback.** `save()` and `export()` currently give no
   indication anything happened.
6. **Accessibility.** Add `aria-pressed` to picker buttons, roving tabindex
   across a trait group, and a live region for save/randomize results.
7. **Import/export config JSON** — the natural companion to the demo, and
   the mechanism by which demo assets stay reproducible.

---

## Phase 3 — Restructure part data (the enabling refactor)

Everything below is blocked by the fact that parts are opaque multi-line
strings injected through `bypassSecurityTrustHtml`. Their children have no
identity, so nothing can be styled, animated, or re-colored individually.

1. Introduce a shared geometry module in `avatar-shared`:
   `FACE`, `EYES`, `EARS`, `NECK`, `SHOULDERS`, `BODY_PATH`. The identical
   9-point body path is currently **copy-pasted 8×** in
   `profession-layers.ts`; ear and brow coordinates appear in three files.
2. Convert parts to typed element records:
   `PartNode = { tag; attrs; tone?: SkinToneVar | 'hair' | 'accent'; id?; layer? }`
   rendered via `@for` so each node can carry a class and an animation
   target.
3. Replace the string template from Phase 0 with a record-based renderer.
   This is where gender branching stops being seven `isWoman` checks in a
   template and becomes data.

**What this unlocks:** per-hair sway, hat bob, earring swing, wardrobe
color, correct eyelid geometry per eye style, and clip paths that derive from
the actual hat instead of the magic `y=56`.

**Known defects this fixes:**
- Eyelids are rects sized for a round eye, so **blinking clips on
  `narrow` / `almond` eyes** (`eye-shapes.ts:18,57` vs the template's hardcoded
  22×22 rects).
- `beard: long` runs to y=180 but the astronaut helmet clip ends at y=140, so
  **an astronaut with a long beard gets a beard sliced flat**.
- The `ponytail` leaves an orphaned stub under a cap brim.

**This is the largest and riskiest phase.** It touches every part file. Do it
after the demo is live, with the Phase 0 parity test as the safety net.

---

## Phase 4 — Coherence and new traits

**Gender gating.** `mustache` and `beard` are plain fields with no gating
anywhere, so a woman avatar gets a beard and the UI never says so. Add a
coherence layer that filters available options by gender. Same for hair —
a man can currently pick `bun` or `ponytail`; a woman can pick `mohawk`.

**Gender-aware professions.** `ProfessionParts` has only `body` +
`accessory`. Teacher's bow tie and business's necktie are hardcoded
male-corporate. Add blouse / blazer / dress variants. Note `doctor` and
`business` currently ship an **empty accessory** despite the spec promising a
badge and a collar (`AVATAR_CREATOR_AGENT-2.md:116,123`).

**Decouple facial-hair color from hair color.** Beards and mustaches hardcode
`fill="var(--hair-color)"`. That is right for most cases but wrong for
stubble, and with `white` hair (`#F0F0F0`) stubble is effectively invisible.
Add a `facialHairColor` field defaulting to hair color.

**New traits the model cannot currently express:** earrings, freckles, blush,
nose variants, user-selectable mouth shape (`MOUTH_SHAPES` is viseme-driven
only), eyebrow style (currently baked into the template), wardrobe color
(every garment color is hardcoded), face shape, age.

---

## Phase 5 — Style-guide cleanup

Twelve concrete violations against the mandatory guide:

- **8 × opacity-as-second-tone** — explicitly banned at
  `AVATAR_CREATOR_AGENT-2.md:142`. `stubble` (`beard-shapes.ts:17`) is
  *entirely* an opacity hack. Others: `profession-layers.ts:87,127,250,255,287-289`,
  `hair-shapes.ts:83`, `svg-avatar.component.html:121`.
- **4 × stroke-width > 2.5** — `profession-layers.ts:252-253`,
  `mustache-shapes.ts:16,34,38`.
- **Sharp corners / low-radius rects** — mortarboard and police stars
  (`profession-layers.ts:125,195,214`), mission patch (`:239`), business tie
  (`:329`), and rects with `rx` 0–5 (`:48,147,161,211,282,285`).
- **Off-palette raw colors** — `stroke="#BBB"` and `stroke="#333"`
  (`profession-layers.ts:239,242,272-274`).

Also resolve the spec's own internal contradiction on mouth stroke-width
(noted in Phase 0).

**Canonical geometry drift:** the spec says shoulders start at y=155, but all
8 bodies start at y=150 and span x=30→170. The woman's face is
`cy=86 rx=49 ry=55` against the canonical `cy=88 rx=52 ry=56`, while eyes stay
hardcoded at the canonical positions — so a woman's eyes are not centered on
her face. Reconcile one way and update the spec.

---

## Sequencing

```
Phase 0  exporter parity + parity test      ← blocker
Phase 1  demo dir + viewer                  ← showcases Phase 0
Phase 2  UI redesign
Phase 3  part-data restructure              ← enabling refactor
Phase 4  coherence + new traits
Phase 5  style-guide cleanup
```

Phases 0, 1, 2 are independent of the risky refactor and each ships visible
value. Phases 3–5 are best done as one focused push with the Phase 0 test
guarding them.

---

## Acceptance criteria

- Every profession × gender export matches the on-screen preview; parity test
  green.
- `/demo` renders every committed SVG standalone, with no ambient CSS
  dependency.
- No emoji in any trait picker; all show real shape previews.
- Undo/redo, randomize, and save feedback all work and are keyboard reachable.
- Zero new style-guide violations; the 12 existing ones are gone.
- The 8× duplicated body path exists once.

---

## Open questions for implementation

- Should the demo viewer be read-only, or allow editing an imported config and
  re-exporting? The latter is more useful but needs a loader for the sidecar
  JSON.
- Do we keep Spartan NG at all after the redesign, or drop it? The pickers are
  hand-rolled already; the tabs and buttons are the only real Spartan usage.
