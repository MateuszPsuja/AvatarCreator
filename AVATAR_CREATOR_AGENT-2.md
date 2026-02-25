# 🧑‍💻 Agent Instructions: SVG Avatar Creator & Player (Angular + TypeScript)

---

## 📌 Project Overview

Build a modular **SVG Avatar Creator** and **Avatar Player** system for use in a chat application. Avatars are fully customizable, SVG-based, and animated (blinking, eye movement, head motion, lip sync).

The project is split into **two independent deliverables**:

| Deliverable | Technology | Purpose |
|-------------|-----------|---------|
| **Avatar Creator** | Angular 17+, Spartan NG, SCSS | Full-page editor UI for building avatars |
| **Avatar Player Library** | Angular 17+ standalone library module | Importable `NgModule` drop-in for any Angular app |

---

## 🎨 Visual Style Guide — Flat 2D Vector Avatar

> **This style guide is mandatory.** All SVG parts, shapes, and colors MUST conform to these rules. The agent must never deviate from this design language.

### Style Statement
> *Flat 2D vector avatar, head and shoulders portrait, friendly smiling expression, clean SVG style, smooth curves, minimal shading, solid colors, large eyes, soft rounded face, simple hair shapes, modern UI illustration, no gradients, no realism, centered composition, square format.*

### Canvas & Composition
- **Viewport:** `viewBox="0 0 200 200"` — always square format
- **Portrait crop:** Head + shoulders only, centered horizontally and vertically
- **Head position:** Face centered around `cx=100, cy=88`, radius ≈ 52px
- **Shoulders:** Simple rounded trapezoid starting from `y=155`, width ≈ 160px at bottom
- **No background fill** on the SVG root — parent container defines it

### Shape Language
- **All curves use `rx`/`ry` ≥ 8px** — no sharp corners anywhere
- **Face shape:** Wide ellipse `rx=52 ry=56`
- **Eyes:** Large — sclera `r=11`, iris `r=9`, pupil `r=5`. Centered at `cy=88`, `cx=74` (left), `cx=126` (right)
- **Nose:** Minimal — tiny upturned arc, `stroke-width=2`
- **Mouth:** Friendly upward curve as idle state, `stroke-linecap="round"`
- **Eyebrows:** Thick arcs or rounded rects, `rx=3`
- **Hair:** Solid silhouette shapes only — no individual strands
- **Ears:** Simple ellipse partially behind face layer

### Color Rules — STRICTLY ENFORCED

| Rule | Detail |
|------|--------|
| ✅ Solid fills only | Single flat `fill` color per shape |
| ❌ No gradients | Never use `<linearGradient>`, `<radialGradient>` |
| ❌ No drop shadows | No `<filter>`, `<feDropShadow>` |
| ❌ No textures | No `<pattern>`, cross-hatching, stippling |
| ✅ Max 2 tones per region | `--skin-base` + `--skin-ear` only |
| ✅ Strokes optional | `stroke-width` max `2.5` |

### Skin Tone Palette
```typescript
// shared/svg-parts/skin-tones.ts
export const SKIN_TONES: Record<SkinTone, { base: string; ear: string; lip: string }> = {
  light:  { base: '#FDDBB4', ear: '#F5C89A', lip: '#E8967A' },
  medium: { base: '#F0AC78', ear: '#E09A62', lip: '#C97050' },
  tan:    { base: '#D4845A', ear: '#C0724A', lip: '#A8533A' },
  dark:   { base: '#8D5524', ear: '#7A4820', lip: '#6B3A18' },
  deep:   { base: '#4A2912', ear: '#3C200E', lip: '#5C2E18' },
};
```

### Hair & Eye Color Palettes
```typescript
export const HAIR_COLORS: Record<HairColor, string> = {
  black: '#1A1A2E', brown: '#6B3A2A', blonde: '#E8C96E',
  red: '#C0392B', gray: '#9E9E9E', white: '#F0F0F0',
};
export const EYE_COLORS = {
  brown: '#6B3A2A', blue: '#2980B9', green: '#27AE60',
  gray: '#7F8C8D', black: '#1A1A2E',
};
```

### Canonical SVG Skeleton (14 Layers)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- 1. Shoulders/Body -->
  <path d="M30,200 Q30,155 60,148 Q80,142 100,140 Q120,142 140,148 Q170,155 170,200 Z" fill="#3B82F6"/>
  <!-- 2. Neck -->
  <rect x="88" y="135" width="24" height="22" rx="8" fill="var(--skin-base)"/>
  <!-- 3. Ears -->
  <ellipse cx="48" cy="90" rx="8" ry="10" fill="var(--skin-ear)"/>
  <ellipse cx="152" cy="90" rx="8" ry="10" fill="var(--skin-ear)"/>
  <!-- 4. Hair Back --><!-- [hair-back] -->
  <!-- 5. Face -->
  <ellipse cx="100" cy="88" rx="52" ry="56" fill="var(--skin-base)"/>
  <!-- 6. Eyes -->
  <circle cx="74" cy="88" r="11" fill="#FFF"/><circle cx="74" cy="88" r="9" fill="var(--eye-color)"/>
  <circle cx="74" cy="88" r="5" fill="#1A1A2E"/><circle cx="77" cy="85" r="2" fill="#FFF"/>
  <circle cx="126" cy="88" r="11" fill="#FFF"/><circle cx="126" cy="88" r="9" fill="var(--eye-color)"/>
  <circle cx="126" cy="88" r="5" fill="#1A1A2E"/><circle cx="129" cy="85" r="2" fill="#FFF"/>
  <!-- 7. Eyelids (animated) -->
  <rect class="eyelid-left"  x="63" y="77" width="22" height="22" rx="11" fill="var(--skin-base)"/>
  <rect class="eyelid-right" x="115" y="77" width="22" height="22" rx="11" fill="var(--skin-base)"/>
  <!-- 8. Eyebrows -->
  <rect x="63" y="72" width="22" height="5" rx="3" fill="var(--hair-color)"/>
  <rect x="115" y="72" width="22" height="5" rx="3" fill="var(--hair-color)"/>
  <!-- 9. Nose -->
  <path d="M97,105 Q100,112 103,105" stroke="var(--skin-ear)" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 10. Mouth (lip sync target) -->
  <path class="mouth-shape" d="M84,120 Q100,132 116,120" stroke="var(--lip-color)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- 11. Facial Hair --><!-- [mustache/beard] -->
  <!-- 12. Glasses --><!-- [glasses] -->
  <!-- 13. Hair Front --><!-- [hair-front] -->
  <!-- 14. Profession Accessory --><!-- [accessory] -->
</svg>
```

### Profession Shoulders & Accessories
| Profession | Shoulder Fill | Accessory |
|------------|--------------|-----------|
| none | `#6B7280` | — |
| doctor | `#FFFFFF` | Red cross badge |
| engineer | `#1E3A5F` | Gear icon at collar |
| teacher | `#4B5563` | Small book shape |
| chef | `#FFFFFF` | Tall chef hat |
| police | `#1A237E` | Badge star |
| astronaut | `#B0BEC5` | Helmet ring arc |
| artist | `#6D28D9` | Paint palette dots |
| business | `#1C1C1C` | White collar + tie |

### Mouth Viseme Shapes
```typescript
export const MOUTH_SHAPES: Record<number, string> = {
  0: 'M84,120 Q100,132 116,120',           // silence
  1: 'M84,118 Q100,136 116,118',           // A/I wide
  2: 'M90,118 Q100,130 110,118',           // O/U round
  3: 'M82,122 Q100,128 118,122',           // E spread
  4: 'M86,122 Q100,124 114,122',           // M/B/P pressed
  5: 'M84,120 Q92,126 100,122 Q108,126 116,120', // F/V teeth
};
```

### ❌ Anti-Patterns
```svg
<!-- ❌ gradient -->     <ellipse fill="url(#grad1)" />
<!-- ❌ filter/shadow --> <ellipse filter="url(#shadow)" />
<!-- ❌ thick stroke -->  <path stroke-width="5" />
<!-- ❌ opacity shading --><ellipse fill="#000" fill-opacity="0.15" />
<!-- ❌ hair strands -->  <!-- 50x <line> elements -->
```

---

## 📐 Shared Data Model

> Lives in a **shared library** consumed by both the Creator app and the Player library.

```typescript
// libs/avatar-shared/src/lib/avatar.model.ts

export type Gender       = 'man' | 'woman';
export type SkinTone     = 'light' | 'medium' | 'tan' | 'dark' | 'deep';
export type HaircutStyle = 'short' | 'long' | 'curly' | 'bald' | 'bun' | 'ponytail' | 'mohawk';
export type MustacheStyle= 'none' | 'thin' | 'thick' | 'handlebar' | 'chevron';
export type BeardStyle   = 'none' | 'stubble' | 'short' | 'long' | 'goatee';
export type EyeStyle     = 'round' | 'almond' | 'wide' | 'narrow';
export type GlassesStyle = 'none' | 'round' | 'rectangular' | 'sunglasses' | 'monocle';
export type ProfessionType =
  'none' | 'doctor' | 'engineer' | 'teacher' | 'chef' |
  'police' | 'astronaut' | 'artist' | 'business';
export type HairColor    = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white';
export type EyeColor     = 'brown' | 'blue' | 'green' | 'gray' | 'black';

export interface AvatarConfig {
  id:         string;
  name:       string;
  gender:     Gender;
  skinTone:   SkinTone;
  haircut:    HaircutStyle;
  hairColor:  HairColor;
  eyeColor:   EyeColor;
  mustache:   MustacheStyle;
  beard:      BeardStyle;
  eyeStyle:   EyeStyle;
  glasses:    GlassesStyle;
  profession: ProfessionType;
}
```

---

## 🏗️ Monorepo Project Structure

```
avatar-workspace/
├── apps/
│   └── avatar-creator/                   # Spartan NG creator application
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.config.ts         # provideRouter, provideHttpClient
│       │   │   ├── app.routes.ts
│       │   │   ├── pages/
│       │   │   │   └── creator/
│       │   │   │       ├── creator.page.ts
│       │   │   │       └── creator.page.scss
│       │   │   └── ui/                   # Spartan NG wrapper components
│       │   │       ├── trait-picker/
│       │   │       ├── swatch-picker/
│       │   │       └── preview-panel/
│       │   └── styles/
│       │       ├── _spartan-theme.scss   # Spartan NG theme overrides
│       │       └── _avatar-tokens.scss   # Design tokens
│       └── project.json
│
├── libs/
│   ├── avatar-shared/                    # Shared model + SVG assets (no Angular deps)
│   │   └── src/lib/
│   │       ├── avatar.model.ts
│   │       ├── skin-tones.ts
│   │       ├── hair-colors.ts
│   │       ├── svg-parts/
│   │       │   ├── eye-shapes.ts
│   │       │   ├── hair-shapes.ts
│   │       │   ├── mouth-shapes.ts
│   │       │   ├── mustache-shapes.ts
│   │       │   ├── beard-shapes.ts
│   │       │   ├── glasses-shapes.ts
│   │       │   └── profession-layers.ts
│   │       └── index.ts                  # barrel export
│   │
│   └── avatar-player/                    # 📦 Publishable Angular library
│       ├── src/
│       │   ├── lib/
│       │   │   ├── avatar-player.module.ts       # NgModule entry point
│       │   │   ├── components/
│       │   │   │   ├── svg-avatar/
│       │   │   │   │   ├── svg-avatar.component.ts
│       │   │   │   │   └── svg-avatar.component.scss
│       │   │   │   └── avatar-player/
│       │   │   │       ├── avatar-player.component.ts
│       │   │   │       └── avatar-player.component.scss
│       │   │   └── services/
│       │   │       ├── avatar-animation.service.ts
│       │   │       └── lip-sync.service.ts
│       │   └── index.ts                  # public API barrel
│       ├── ng-package.json               # ng-packagr config
│       └── package.json
│
└── package.json
```

---

## 🖥️ Part 1 — Avatar Creator (Spartan NG + SCSS)

### Technology Stack
- **Angular 17+** with standalone components
- **Spartan NG** (`@spartan-ng/ui-*`) for all UI primitives (buttons, selects, labels, separators, tabs, tooltips)
- **SCSS** for all styling — no inline styles, no Tailwind utility classes on creator components
- **Angular Signals** (`signal`, `computed`, `effect`) for reactive state — no RxJS in components

### Spartan NG Setup

```bash
# Install Spartan NG CLI and dependencies
npx nx add @spartan-ng/nx
npx nx g @spartan-ng/nx:ui

# Add required UI primitives
npx nx g @spartan-ng/nx:ui button --directory=libs/ui
npx nx g @spartan-ng/nx:ui select --directory=libs/ui
npx nx g @spartan-ng/nx:ui label --directory=libs/ui
npx nx g @spartan-ng/nx:ui tabs --directory=libs/ui
npx nx g @spartan-ng/nx:ui separator --directory=libs/ui
npx nx g @spartan-ng/nx:ui tooltip --directory=libs/ui
npx nx g @spartan-ng/nx:ui badge --directory=libs/ui
```

### SCSS Architecture

```
apps/avatar-creator/src/styles/
├── _spartan-theme.scss     # CSS variable overrides for Spartan NG theming
├── _avatar-tokens.scss     # Avatar-specific design tokens
├── _typography.scss        # Font scale
├── _layout.scss            # Page grid / breakpoints
└── styles.scss             # Root entry — imports all partials
```

```scss
// _avatar-tokens.scss
:root {
  // Creator layout
  --creator-sidebar-width: 340px;
  --creator-preview-size: 360px;
  --creator-gap: 2rem;

  // Panel aesthetics
  --panel-bg: hsl(var(--secondary));
  --panel-radius: 12px;
  --panel-padding: 1.5rem;

  // Swatch grid
  --swatch-size: 36px;
  --swatch-gap: 8px;
  --swatch-radius: 50%;

  // Trait picker
  --trait-icon-size: 56px;
  --trait-icon-radius: 10px;
  --trait-icon-selected-ring: 2px solid hsl(var(--primary));
}
```

```scss
// _spartan-theme.scss  — override Spartan NG CSS variables
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### Creator Page Component

```typescript
// apps/avatar-creator/src/app/pages/creator/creator.page.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarConfig, Gender, SkinTone, HaircutStyle, HairColor,
         MustacheStyle, BeardStyle, EyeStyle, GlassesStyle,
         ProfessionType, EyeColor } from '@avatar-workspace/avatar-shared';
import { AvatarService } from '../../services/avatar.service';
// Spartan NG imports
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmSeparatorDirective } from '@spartan-ng/ui-separator-helm';
import { BrnTabsModule } from '@spartan-ng/ui-tabs-brain';
import { HlmTabsModule } from '@spartan-ng/ui-tabs-helm';
// Player lib
import { SvgAvatarComponent } from '@avatar-workspace/avatar-player';
// Sub-components
import { TraitPickerComponent } from '../../ui/trait-picker/trait-picker.component';
import { SwatchPickerComponent } from '../../ui/swatch-picker/swatch-picker.component';

@Component({
  selector: 'app-creator-page',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonDirective, HlmSeparatorDirective,
    BrnTabsModule, HlmTabsModule,
    SvgAvatarComponent,
    TraitPickerComponent, SwatchPickerComponent
  ],
  templateUrl: './creator.page.html',
  styleUrl: './creator.page.scss'
})
export class CreatorPageComponent {
  private avatarService = inject(AvatarService);

  config = signal<AvatarConfig>(this.avatarService.defaultConfig());

  // Derived CSS vars for live preview — passed directly to SvgAvatarComponent
  previewVars = computed(() => this.avatarService.toCssVars(this.config()));

  update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    this.config.update(c => ({ ...c, [key]: value }));
  }

  reset()  { this.config.set(this.avatarService.defaultConfig()); }
  save()   { this.avatarService.saveAvatar(this.config()); }
  export() { this.avatarService.downloadSVG(this.config()); }
}
```

### Creator Page Template

```html
<!-- creator.page.html -->
<div class="creator-layout">

  <!-- LEFT: Controls Panel -->
  <aside class="creator-sidebar">
    <header class="sidebar-header">
      <h1 class="sidebar-title">Avatar Creator</h1>
      <p class="sidebar-subtitle">Customize your avatar</p>
    </header>

    <hlm-separator />

    <brn-tabs default-value="appearance" class="creator-tabs">
      <div hlmTabsList class="tabs-list">
        <button hlmTabsTrigger value="appearance">Appearance</button>
        <button hlmTabsTrigger value="style">Style</button>
        <button hlmTabsTrigger value="profession">Profession</button>
      </div>

      <!-- TAB: Appearance -->
      <div hlmTabsContent value="appearance" class="tab-content">
        <section class="trait-section">
          <label hlmLabel>Gender</label>
          <app-trait-picker
            [options]="genderOptions"
            [value]="config().gender"
            (selected)="update('gender', $event)" />
        </section>

        <section class="trait-section">
          <label hlmLabel>Skin Tone</label>
          <app-swatch-picker
            [swatches]="skinSwatches"
            [value]="config().skinTone"
            (selected)="update('skinTone', $event)" />
        </section>

        <section class="trait-section">
          <label hlmLabel>Hair Style</label>
          <app-trait-picker
            [options]="haircutOptions"
            [value]="config().haircut"
            (selected)="update('haircut', $event)" />
        </section>

        <section class="trait-section">
          <label hlmLabel>Hair Color</label>
          <app-swatch-picker
            [swatches]="hairSwatches"
            [value]="config().hairColor"
            (selected)="update('hairColor', $event)" />
        </section>

        <section class="trait-section">
          <label hlmLabel>Eye Style</label>
          <app-trait-picker
            [options]="eyeOptions"
            [value]="config().eyeStyle"
            (selected)="update('eyeStyle', $event)" />
        </section>

        <section class="trait-section">
          <label hlmLabel>Eye Color</label>
          <app-swatch-picker
            [swatches]="eyeSwatches"
            [value]="config().eyeColor"
            (selected)="update('eyeColor', $event)" />
        </section>
      </div>

      <!-- TAB: Style (facial hair + glasses) -->
      <div hlmTabsContent value="style" class="tab-content">
        <section class="trait-section">
          <label hlmLabel>Mustache</label>
          <app-trait-picker
            [options]="mustacheOptions"
            [value]="config().mustache"
            (selected)="update('mustache', $event)" />
        </section>
        <section class="trait-section">
          <label hlmLabel>Beard</label>
          <app-trait-picker
            [options]="beardOptions"
            [value]="config().beard"
            (selected)="update('beard', $event)" />
        </section>
        <section class="trait-section">
          <label hlmLabel>Glasses</label>
          <app-trait-picker
            [options]="glassesOptions"
            [value]="config().glasses"
            (selected)="update('glasses', $event)" />
        </section>
      </div>

      <!-- TAB: Profession -->
      <div hlmTabsContent value="profession" class="tab-content">
        <section class="trait-section">
          <label hlmLabel>Profession</label>
          <app-trait-picker
            [options]="professionOptions"
            [value]="config().profession"
            (selected)="update('profession', $event)" />
        </section>
      </div>
    </brn-tabs>

    <hlm-separator />

    <!-- Actions -->
    <div class="sidebar-actions">
      <button hlmBtn variant="outline" size="sm" (click)="reset()">Reset</button>
      <button hlmBtn variant="outline" size="sm" (click)="export()">Export SVG</button>
      <button hlmBtn size="sm" (click)="save()">Save Avatar</button>
    </div>
  </aside>

  <!-- RIGHT: Live Preview -->
  <main class="creator-preview">
    <div class="preview-card">
      <app-svg-avatar
        [config]="config()"
        [animationsEnabled]="true"
        class="preview-avatar" />
      <p class="preview-name">{{ config().name || 'My Avatar' }}</p>
    </div>
  </main>

</div>
```

### Creator Page SCSS

```scss
// creator.page.scss
@use 'avatar-tokens' as tokens;

.creator-layout {
  display: grid;
  grid-template-columns: var(--creator-sidebar-width) 1fr;
  grid-template-rows: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    overflow: auto;
  }
}

.creator-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--panel-padding);
  background: var(--panel-bg);
  border-right: 1px solid hsl(var(--border));
  overflow-y: auto;
  height: 100vh;
}

.sidebar-header {
  padding-bottom: 0.5rem;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0;
}

.sidebar-subtitle {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin: 0.25rem 0 0;
}

.creator-tabs {
  flex: 1;
}

.tabs-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.trait-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

// RIGHT PANEL
.creator-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background));
  padding: 2rem;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &:hover .preview-avatar {
    transform: scale(1.02) rotate(0.5deg);
    transition: transform 0.3s ease;
  }
}

.preview-avatar {
  width: var(--creator-preview-size);
  height: var(--creator-preview-size);
  border-radius: var(--panel-radius);
  background: hsl(var(--secondary));
  transition: transform 0.3s ease;
}

.preview-name {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}
```

### Trait Picker UI Component (Spartan NG + SCSS)

```typescript
// apps/avatar-creator/src/app/ui/trait-picker/trait-picker.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmTooltipModule } from '@spartan-ng/ui-tooltip-helm';
import { BrnTooltipModule } from '@spartan-ng/ui-tooltip-brain';

export interface TraitOption<T = string> {
  value: T;
  label: string;
  svgPreview?: string;  // small inline SVG string for icon preview
  icon?: string;        // fallback emoji/text icon
}

@Component({
  selector: 'app-trait-picker',
  standalone: true,
  imports: [CommonModule, HlmTooltipModule, BrnTooltipModule],
  template: `
    <div class="trait-grid">
      @for (opt of options(); track opt.value) {
        <brn-tooltip>
          <button
            class="trait-item"
            [class.trait-item--selected]="value() === opt.value"
            (click)="selected.emit(opt.value)"
            brnTooltipTrigger>
            @if (opt.svgPreview) {
              <span class="trait-svg" [innerHTML]="opt.svgPreview"></span>
            } @else {
              <span class="trait-icon">{{ opt.icon }}</span>
            }
          </button>
          <span hlmTooltipContent>{{ opt.label }}</span>
        </brn-tooltip>
      }
    </div>
  `,
  styleUrl: './trait-picker.component.scss'
})
export class TraitPickerComponent<T = string> {
  options = input.required<TraitOption<T>[]>();
  value   = input.required<T>();
  selected = output<T>();
}
```

```scss
// trait-picker.component.scss
.trait-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--swatch-gap);
}

.trait-item {
  width: var(--trait-icon-size);
  height: var(--trait-icon-size);
  border-radius: var(--trait-icon-radius);
  border: 2px solid hsl(var(--border));
  background: hsl(var(--background));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  padding: 6px;

  &:hover {
    border-color: hsl(var(--primary) / 0.6);
    transform: scale(1.05);
  }

  &--selected {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.25);
    background: hsl(var(--primary) / 0.06);
  }
}

.trait-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  svg {
    width: 100%;
    height: 100%;
  }
}

.trait-icon {
  font-size: 1.4rem;
  line-height: 1;
}
```

### Swatch Picker UI Component

```typescript
// apps/avatar-creator/src/app/ui/swatch-picker/swatch-picker.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Swatch<T = string> {
  value: T;
  color: string;
  label: string;
}

@Component({
  selector: 'app-swatch-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="swatch-row">
      @for (swatch of swatches(); track swatch.value) {
        <button
          class="swatch"
          [class.swatch--selected]="value() === swatch.value"
          [style.background-color]="swatch.color"
          [title]="swatch.label"
          (click)="selected.emit(swatch.value)">
        </button>
      }
    </div>
  `,
  styleUrl: './swatch-picker.component.scss'
})
export class SwatchPickerComponent<T = string> {
  swatches = input.required<Swatch<T>[]>();
  value    = input.required<T>();
  selected = output<T>();
}
```

```scss
// swatch-picker.component.scss
.swatch-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--swatch-gap);
}

.swatch {
  width: var(--swatch-size);
  height: var(--swatch-size);
  border-radius: var(--swatch-radius);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;

  &:hover {
    transform: scale(1.12);
    border-color: hsl(var(--foreground) / 0.4);
  }

  &--selected {
    border-color: hsl(var(--foreground));
    box-shadow: 0 0 0 2px hsl(var(--background)),
                0 0 0 4px hsl(var(--foreground));
    transform: scale(1.08);
  }
}
```

---

## 📦 Part 2 — Avatar Player Library

### Design Goals
- Importable as `AvatarPlayerModule` into **any** Angular 14+ application
- Zero Spartan NG dependency — pure Angular + CSS
- Self-contained: all animations, services, SVG parts bundled inside
- Ships with a public API barrel (`index.ts`) exposing only what consumers need
- Built with **ng-packagr** for proper `esm2022` + `fesm2022` output

### ng-packagr Config

```json
// libs/avatar-player/ng-package.json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/index.ts"
  },
  "destPath": "../../dist/avatar-player"
}
```

### Public API Barrel

```typescript
// libs/avatar-player/src/index.ts

// Module entry point
export { AvatarPlayerModule } from './lib/avatar-player.module';

// Components (for standalone import)
export { SvgAvatarComponent }    from './lib/components/svg-avatar/svg-avatar.component';
export { AvatarPlayerComponent } from './lib/components/avatar-player/avatar-player.component';

// Services (for manual DI)
export { LipSyncService }         from './lib/services/lip-sync.service';
export { AvatarAnimationService } from './lib/services/avatar-animation.service';

// Model re-export convenience
export type { AvatarConfig } from '@avatar-workspace/avatar-shared';
```

### NgModule Entry Point

```typescript
// libs/avatar-player/src/lib/avatar-player.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgAvatarComponent }    from './components/svg-avatar/svg-avatar.component';
import { AvatarPlayerComponent } from './components/avatar-player/avatar-player.component';
import { LipSyncService }         from './services/lip-sync.service';
import { AvatarAnimationService } from './services/avatar-animation.service';

@NgModule({
  imports: [
    CommonModule,
    // Standalone components are imported into the module
    SvgAvatarComponent,
    AvatarPlayerComponent,
  ],
  exports: [
    // Only these two need to be exported for consumers
    SvgAvatarComponent,
    AvatarPlayerComponent,
  ],
  providers: [
    LipSyncService,
    AvatarAnimationService,
  ]
})
export class AvatarPlayerModule {}
```

### Consumer Integration (How to Use the Library)

```typescript
// In ANY Angular application — NgModule-based app
// app.module.ts
import { AvatarPlayerModule } from '@your-org/avatar-player';

@NgModule({
  imports: [AvatarPlayerModule],
})
export class AppModule {}
```

```typescript
// In ANY Angular application — Standalone app
// app.config.ts
import { AvatarPlayerModule } from '@your-org/avatar-player';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(AvatarPlayerModule)]
};
```

```html
<!-- Use in any template after importing the module -->
<app-svg-avatar [config]="myConfig" />

<app-avatar-player
  [config]="user.avatarConfig"
  [speaking]="isSpeaking"
  [message]="currentMessage" />
```

### SvgAvatarComponent (Library)

```typescript
// libs/avatar-player/src/lib/components/svg-avatar/svg-avatar.component.ts
import { Component, Input, computed, OnInit, OnDestroy, signal, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { SKIN_TONES, HAIR_COLORS, EYE_COLORS } from '@avatar-workspace/avatar-shared';
import { HAIR_SHAPES } from '../../svg-parts/hair-shapes';
import { EYE_SHAPES } from '../../svg-parts/eye-shapes';
import { MOUTH_SHAPES } from '../../svg-parts/mouth-shapes';
import { MUSTACHE_SHAPES } from '../../svg-parts/mustache-shapes';
import { BEARD_SHAPES } from '../../svg-parts/beard-shapes';
import { GLASSES_SHAPES } from '../../svg-parts/glasses-shapes';
import { PROFESSION_LAYERS } from '../../svg-parts/profession-layers';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

@Component({
  selector: 'app-svg-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './svg-avatar.component.html',
  styleUrl: './svg-avatar.component.scss'
})
export class SvgAvatarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() animationsEnabled = true;
  @Input() viseme = 0; // 0–5, controlled externally for lip sync

  private sanitizer = inject(DomSanitizer);
  private zone      = inject(NgZone);
  private anim      = inject(AvatarAnimationService);

  // Animation state (driven by AvatarAnimationService)
  eyeBlinkClass  = signal<string>('');
  pupilOffset    = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  headTransform  = signal<string>('');

  // Computed CSS vars object from config
  cssVars = computed(() => {
    const skin = SKIN_TONES[this.config.skinTone];
    return {
      '--skin-base':  skin.base,
      '--skin-ear':   skin.ear,
      '--lip-color':  skin.lip,
      '--hair-color': HAIR_COLORS[this.config.hairColor],
      '--eye-color':  EYE_COLORS[this.config.eyeColor],
    };
  });

  // SVG part accessors
  get hairBack():      string { return HAIR_SHAPES[this.config.haircut]?.back  ?? ''; }
  get hairFront():     string { return HAIR_SHAPES[this.config.haircut]?.front ?? ''; }
  get eyeSclera():     string { return EYE_SHAPES[this.config.eyeStyle]?.sclera ?? ''; }
  get eyeIris():       string { return EYE_SHAPES[this.config.eyeStyle]?.iris   ?? ''; }
  get mouthPath():     string { return MOUTH_SHAPES[this.viseme] ?? MOUTH_SHAPES[0]; }
  get mustacheSvg():   string { return MUSTACHE_SHAPES[this.config.mustache] ?? ''; }
  get beardSvg():      string { return BEARD_SHAPES[this.config.beard] ?? ''; }
  get glassesSvg():    string { return GLASSES_SHAPES[this.config.glasses] ?? ''; }
  get professionBody():string { return PROFESSION_LAYERS[this.config.profession]?.body ?? ''; }
  get professionAcc(): string { return PROFESSION_LAYERS[this.config.profession]?.accessory ?? ''; }

  // Safe HTML wrappers (only internal controlled SVG parts — never user input)
  safe(s: string): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(s); }

  ngOnInit() {
    if (this.animationsEnabled) {
      this.zone.runOutsideAngular(() => {
        this.anim.startBlink(v => this.zone.run(() => this.eyeBlinkClass.set(v)));
        this.anim.startEyeMovement(v => this.zone.run(() => this.pupilOffset.set(v)));
        this.anim.startHeadIdle(v => this.zone.run(() => this.headTransform.set(v)));
      });
    }
  }

  ngOnDestroy() { this.anim.stopAll(); }
}
```

### SvgAvatarComponent Template

```html
<!-- svg-avatar.component.html -->
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 200 200"
     class="avatar-svg"
     [style]="cssVars()">

  <!-- 1. Profession body / shoulders -->
  <g class="layer-body" [innerHTML]="safe(professionBody)"></g>

  <!-- 2. Neck -->
  <rect class="layer-neck" x="88" y="135" width="24" height="22" rx="8"
        fill="var(--skin-base)" />

  <!-- 3. Ears -->
  <g class="layer-ears">
    <ellipse cx="48" cy="90" rx="8" ry="10" fill="var(--skin-ear)" />
    <ellipse cx="152" cy="90" rx="8" ry="10" fill="var(--skin-ear)" />
  </g>

  <!-- 4. Hair back -->
  <g class="layer-hair-back" [innerHTML]="safe(hairBack)"></g>

  <!-- 5. Face — head group with idle animation -->
  <g class="layer-head" [attr.transform]="headTransform()">

    <!-- Face ellipse -->
    <ellipse class="layer-face" cx="100" cy="88" rx="52" ry="56"
             fill="var(--skin-base)" />

    <!-- 6. Eyes -->
    <g class="layer-eyes">
      <g [innerHTML]="safe(eyeSclera)"></g>
      <g class="pupils" [attr.transform]="'translate(' + pupilOffset().x + ',' + pupilOffset().y + ')'">
        <g [innerHTML]="safe(eyeIris)"></g>
      </g>
    </g>

    <!-- 7. Eyelids (blink) -->
    <g class="layer-eyelids" [class]="eyeBlinkClass()">
      <rect class="eyelid-left"  x="63"  y="77" width="22" height="22" rx="11" fill="var(--skin-base)" />
      <rect class="eyelid-right" x="115" y="77" width="22" height="22" rx="11" fill="var(--skin-base)" />
    </g>

    <!-- 8. Eyebrows -->
    <g class="layer-brows">
      <rect x="63"  y="72" width="22" height="5" rx="3" fill="var(--hair-color)" />
      <rect x="115" y="72" width="22" height="5" rx="3" fill="var(--hair-color)" />
    </g>

    <!-- 9. Nose -->
    <path class="layer-nose"
          d="M97,105 Q100,112 103,105"
          stroke="var(--skin-ear)" stroke-width="2"
          fill="none" stroke-linecap="round" />

    <!-- 10. Mouth (lip sync) -->
    <path class="layer-mouth"
          [attr.d]="mouthPath"
          stroke="var(--lip-color)" stroke-width="3"
          fill="none" stroke-linecap="round" />

    <!-- 11. Facial hair -->
    <g class="layer-mustache" [innerHTML]="safe(mustacheSvg)"></g>
    <g class="layer-beard"    [innerHTML]="safe(beardSvg)"></g>

    <!-- 12. Glasses -->
    <g class="layer-glasses" [innerHTML]="safe(glassesSvg)"></g>

  </g><!-- /layer-head -->

  <!-- 13. Hair front (on top of face) -->
  <g class="layer-hair-front" [innerHTML]="safe(hairFront)"></g>

  <!-- 14. Profession accessory (hat etc.) -->
  <g class="layer-accessory" [innerHTML]="safe(professionAcc)"></g>

</svg>
```

### SvgAvatarComponent SCSS

```scss
// svg-avatar.component.scss

.avatar-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  shape-rendering: geometricPrecision;

  // All SVG children respect transform-box for correct rotation origins
  * { transform-box: fill-box; }
}

// Eyelid blink states (toggled by AvatarAnimationService)
.eyelid-left,
.eyelid-right {
  transform-origin: center center;
  transform: scaleY(0);           // default: eyes open
  transition: transform 0.05s linear;
}

.layer-eyelids {
  &.blinking {
    .eyelid-left,
    .eyelid-right {
      transform: scaleY(1);       // eyes closed
    }
  }

  &.blink-half {
    .eyelid-left,
    .eyelid-right {
      transform: scaleY(0.5);     // half-closed
    }
  }
}

// Head idle motion — driven by JS transform string
.layer-head {
  transform-origin: 100px 150px; // neck pivot point
  will-change: transform;
}

// Pupil group smooth tracking
.pupils {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

// Mouth shape smooth transition
.layer-mouth {
  transition: d 0.06s linear;
}

// @media: respect reduced-motion preference
@media (prefers-reduced-motion: reduce) {
  .layer-head     { transform: none !important; }
  .pupils         { transition: none; }
  .layer-mouth    { transition: none; }
  .eyelid-left,
  .eyelid-right   { transition: none; }
}
```

### AvatarPlayerComponent (Chat Wrapper)

```typescript
// libs/avatar-player/src/lib/components/avatar-player/avatar-player.component.ts
import { Component, Input, OnChanges, SimpleChanges, signal, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { LipSyncService } from '../../services/lip-sync.service';
import { SvgAvatarComponent } from '../svg-avatar/svg-avatar.component';

@Component({
  selector: 'app-avatar-player',
  standalone: true,
  imports: [CommonModule, SvgAvatarComponent],
  template: `
    <div class="avatar-player" [class.avatar-player--speaking]="speaking">
      <app-svg-avatar
        [config]="config"
        [animationsEnabled]="true"
        [viseme]="currentViseme()"
        class="player-avatar" />
    </div>
  `,
  styleUrl: './avatar-player.component.scss'
})
export class AvatarPlayerComponent implements OnChanges {
  @Input({ required: true }) config!: AvatarConfig;
  @Input() speaking = false;
  @Input() message  = '';

  currentViseme = signal(0);

  private lipSync = inject(LipSyncService);
  private zone    = inject(NgZone);
  private lipSyncCancelFn: (() => void) | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['speaking'] || changes['message']) {
      this.lipSyncCancelFn?.();
      if (this.speaking && this.message) {
        const visemes = this.lipSync.textToVisemes(this.message);
        this.lipSyncCancelFn = this.lipSync.play(visemes, (v) => {
          this.zone.run(() => this.currentViseme.set(v));
        });
      } else {
        this.currentViseme.set(0);
      }
    }
  }
}
```

```scss
// avatar-player.component.scss
.avatar-player {
  display: inline-flex;
  position: relative;

  .player-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    transition: width 0.2s ease, height 0.2s ease;
  }

  // Speaking: grow avatar
  &--speaking .player-avatar {
    width: 72px;
    height: 72px;
  }
}
```

### LipSyncService

```typescript
// libs/avatar-player/src/lib/services/lip-sync.service.ts
import { Injectable } from '@angular/core';

@Injectable()
export class LipSyncService {
  private readonly MS_PER_VISEME = 80;

  /** Map text characters to viseme IDs 0–5 */
  textToVisemes(text: string): number[] {
    return text.toLowerCase().split('').map(char => {
      if ('ai'.includes(char))  return 1;   // wide
      if ('ou'.includes(char))  return 2;   // rounded
      if ('e'.includes(char))   return 3;   // spread
      if ('mbp'.includes(char)) return 4;   // pressed
      if ('fv'.includes(char))  return 5;   // teeth-lip
      if (char === ' ')         return 0;   // silence
      return 3;                             // default
    });
  }

  /**
   * Play a viseme sequence, calling onViseme(id) each frame.
   * Returns a cancel function.
   */
  play(visemes: number[], onViseme: (v: number) => void): () => void {
    let i = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled || i >= visemes.length) {
        onViseme(0); // reset to silence
        return;
      }
      onViseme(visemes[i++]);
      setTimeout(tick, this.MS_PER_VISEME);
    };

    tick();
    return () => { cancelled = true; };
  }
}
```

### AvatarAnimationService

```typescript
// libs/avatar-player/src/lib/services/avatar-animation.service.ts
import { Injectable } from '@angular/core';

@Injectable()
export class AvatarAnimationService {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private rafs:   number[] = [];

  startBlink(onState: (cssClass: string) => void): void {
    const doBlink = () => {
      onState('blinking');
      const t1 = setTimeout(() => {
        onState('blink-half');
        const t2 = setTimeout(() => {
          onState('');
          // Schedule next blink: 2.5s–5s random interval
          const t3 = setTimeout(doBlink, 2500 + Math.random() * 2500);
          this.timers.push(t3);
        }, 50);
        this.timers.push(t2);
      }, 80);
      this.timers.push(t1);
    };
    const init = setTimeout(doBlink, 1000 + Math.random() * 1000);
    this.timers.push(init);
  }

  startEyeMovement(onOffset: (v: { x: number; y: number }) => void): void {
    const move = () => {
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 4;
      onOffset({ x: dx, y: dy });
      const t = setTimeout(move, 1800 + Math.random() * 2200);
      this.timers.push(t);
    };
    const init = setTimeout(move, 500);
    this.timers.push(init);
  }

  startHeadIdle(onTransform: (t: string) => void): void {
    const start = performance.now();
    const tick  = (now: number) => {
      const t = (now - start) / 1000;
      const rotZ  = Math.sin(t * 0.6) * 1.5;
      const transY= Math.sin(t * 0.4) * 1.5;
      onTransform(`rotate(${rotZ}, 100, 150) translate(0, ${transY})`);
      this.rafs.push(requestAnimationFrame(tick));
    };
    this.rafs.push(requestAnimationFrame(tick));
  }

  stopAll(): void {
    this.timers.forEach(clearTimeout);
    this.rafs.forEach(cancelAnimationFrame);
    this.timers = [];
    this.rafs   = [];
  }
}
```

---

## 🎬 Animation Summary

| Animation | Mechanism | Location |
|-----------|-----------|----------|
| Blink | CSS `scaleY` class toggle, JS timer | `AvatarAnimationService.startBlink()` |
| Eye movement | JS `translate()` on pupil group | `AvatarAnimationService.startEyeMovement()` |
| Head idle | JS `requestAnimationFrame` sin wave | `AvatarAnimationService.startHeadIdle()` |
| Lip sync | JS `setTimeout` viseme sequence | `LipSyncService.play()` |

---

## ✅ Implementation Checklist

### Phase 0 — Workspace Bootstrap
- [ ] Init Nx monorepo: `npx create-nx-workspace avatar-workspace --preset=angular`
- [ ] Generate `avatar-shared` library: `nx g @nx/js:lib avatar-shared`
- [ ] Generate `avatar-player` library: `nx g @nx/angular:lib avatar-player --publishable --importPath=@your-org/avatar-player`
- [ ] Generate `avatar-creator` app: `nx g @nx/angular:app avatar-creator`
- [ ] Install Spartan NG in `avatar-creator` app only
- [ ] Configure `tsconfig` path aliases for `@avatar-workspace/*`

### Phase 1 — Shared Library (`avatar-shared`)
- [ ] Define `AvatarConfig` model and all types/enums
- [ ] `skin-tones.ts` — 5 skin tones, `base`/`ear`/`lip` hex (flat, no gradients)
- [ ] `hair-colors.ts` + `eye-colors.ts`
- [ ] `mouth-shapes.ts` — 6 viseme paths
- [ ] `hair-shapes.ts` — 7 styles (`back` + `front` SVG strings each)
- [ ] `eye-shapes.ts` — 4 styles (`sclera` + `iris` SVG strings)
- [ ] `mustache-shapes.ts` — 5 variants
- [ ] `beard-shapes.ts` — 5 variants
- [ ] `glasses-shapes.ts` — 5 styles (stroke-only)
- [ ] `profession-layers.ts` — 9 professions (`body` + `accessory` SVG strings)
- [ ] Style audit: zero `linearGradient`, zero `filter`, all `stroke-width ≤ 2.5`
- [ ] Export all from `index.ts` barrel

### Phase 2 — Player Library (`avatar-player`)
- [ ] `AvatarAnimationService` — blink, eye movement, head idle
- [ ] `LipSyncService` — `textToVisemes()` + `play()` with cancel
- [ ] `SvgAvatarComponent` — 14-layer SVG, `viewBox="0 0 200 200"`, CSS vars
- [ ] `AvatarPlayerComponent` — `[speaking]` + `[message]` inputs, lip sync wiring
- [ ] `AvatarPlayerModule` — exports both components, provides both services
- [ ] Public API barrel `index.ts`
- [ ] `ng-package.json` configured for `ng-packagr`
- [ ] Build: `nx build avatar-player` — confirm clean output in `dist/`

### Phase 3 — Spartan NG Creator App
- [ ] Install and configure Spartan NG theme in `apps/avatar-creator`
- [ ] SCSS design tokens (`_avatar-tokens.scss`, `_spartan-theme.scss`)
- [ ] `SwatchPickerComponent` (skin, hair, eye color selection)
- [ ] `TraitPickerComponent` (icon grid for all other traits)
- [ ] `AvatarService` — `defaultConfig()`, `saveAvatar()`, `loadAvatar()`, `toCssVars()`, `downloadSVG()`
- [ ] `CreatorPageComponent` — full two-column layout using Spartan tabs/buttons
- [ ] Wire all traits: gender, skin, haircut, hair color, eye style, eye color, mustache, beard, glasses, profession
- [ ] Responsive layout (mobile: stacked)

### Phase 4 — Animations & Polish
- [ ] Verify all 4 animations work in preview panel
- [ ] `@media (prefers-reduced-motion: reduce)` disables all motion
- [ ] Blink has natural random interval (not mechanical)
- [ ] Lip sync plays on `[speaking]=true` and resets mouth on `false`
- [ ] Smooth avatar hover scale in preview panel

### Phase 5 — QA & Validation
- [ ] Unit tests: `AvatarService`, `LipSyncService`, `AvatarAnimationService`
- [ ] All SVG parts pass flat-style audit (no gradients, filters, or thick strokes)
- [ ] Player library builds without errors via `ng-packagr`
- [ ] Creator app builds: `nx build avatar-creator`
- [ ] Test consumer integration: import `AvatarPlayerModule` into a fresh Angular app

---

## ⚠️ Key Technical Notes

1. **🎨 Flat Style Non-Negotiable:** Audit every SVG constant — zero `linearGradient`, zero `radialGradient`, zero `<filter>`, zero `fill-opacity` shading. `stroke-width` ≤ 2.5 max.
2. **Square Canvas:** `viewBox="0 0 200 200"` always. Never non-square.
3. **Spartan NG is Creator-only:** The `avatar-player` library has zero Spartan NG dependencies. Spartan NG is consumed only in `apps/avatar-creator`.
4. **Library has no `providedIn: 'root'`:** Both services in the library use `Injectable()` without `providedIn`, so the `AvatarPlayerModule` provides them — clean tree-shaking.
5. **No RxJS in components:** Use Angular signals (`signal`, `computed`, `effect`) in all components. RxJS allowed only in services if needed.
6. **`transform-box: fill-box`:** Apply globally in `avatar-svg * {}` so all SVG element rotations/scales anchor correctly.
7. **`runOutsideAngular` for animation loops:** All `requestAnimationFrame` and `setTimeout` animation loops run outside Angular zone to prevent change detection spam.
8. **`bypassSecurityTrustHtml` scope:** Only call on your own controlled internal SVG string constants. Never on user-supplied data.
9. **Eye proportions are fixed:** Sclera `r=11`, iris `r=9`, pupil `r=5`. Do not reduce. Large eyes are a core style requirement.
10. **Lip sync cancel pattern:** `LipSyncService.play()` always returns a cancel function. Always call it in `OnChanges` before starting a new sequence to prevent overlapping playback.

---

## 🗂️ File Naming Reference

| File | Library | Purpose |
|------|---------|---------|
| `avatar.model.ts` | shared | All types and interfaces |
| `skin-tones.ts` | shared | Flat skin hex maps |
| `hair-colors.ts` | shared | Flat hair hex constants |
| `eye-colors.ts` | shared | Eye color hex constants |
| `hair-shapes.ts` | shared | Hair silhouette SVG strings |
| `eye-shapes.ts` | shared | Eye element SVG strings |
| `mouth-shapes.ts` | shared | 6 viseme path constants |
| `mustache-shapes.ts` | shared | Mustache SVG constants |
| `beard-shapes.ts` | shared | Beard SVG constants |
| `glasses-shapes.ts` | shared | Glasses SVG constants |
| `profession-layers.ts` | shared | Shoulder + accessory SVG |
| `avatar-player.module.ts` | player | NgModule export entry |
| `svg-avatar.component.ts` | player | 14-layer SVG renderer |
| `avatar-player.component.ts` | player | Chat player wrapper |
| `avatar-animation.service.ts` | player | Blink / eye / head motion |
| `lip-sync.service.ts` | player | Text → viseme → playback |
| `creator.page.ts` | creator app | Spartan NG editor shell |
| `trait-picker.component.ts` | creator app | Icon grid picker (Spartan) |
| `swatch-picker.component.ts` | creator app | Color swatch row |
| `avatar.service.ts` | creator app | Config state + persistence |
| `_avatar-tokens.scss` | creator app | SCSS design tokens |
| `_spartan-theme.scss` | creator app | Spartan NG CSS var overrides |

---

*Follow phases in order. Each phase must build and pass its tests before the next begins. The flat 2D vector style guide is mandatory at every phase — enforce it via code review of all SVG string constants.*
