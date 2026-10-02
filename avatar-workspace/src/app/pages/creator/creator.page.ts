// pages/creator/creator.page.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type {
  AvatarConfig,
  Gender,
  SkinTone,
  HaircutStyle,
  HairColor,
  EyeColor,
  MustacheStyle,
  BeardStyle,
  EyeStyle,
  GlassesStyle,
  ProfessionType,
} from '@avatar-workspace/avatar-shared';
import { SKIN_TONES, HAIR_COLORS, EYE_COLORS, buildTraitPreview, PreviewKind } from '@avatar-workspace/avatar-shared';

import { AvatarService } from '../../services/avatar.service';
import { SvgAvatarComponent, LipSyncService } from '@avatar-workspace/avatar-player';

// UI — Spartan helm
import { HlmButtonDirective } from '../../ui/spartan/hlm-button.directive';
import { HlmSeparatorComponent } from '../../ui/spartan/hlm-separator.component';
import { HlmLabelDirective } from '../../ui/spartan/hlm-label.directive';
import {
  HlmTabsDirective,
  HlmTabsListDirective,
  HlmTabsTriggerDirective,
  HlmTabsContentDirective,
} from '../../ui/spartan/hlm-tabs.component';

// Pickers
import { TraitPickerComponent, TraitOption } from '../../ui/trait-picker/trait-picker.component';
import { SwatchPickerComponent, Swatch } from '../../ui/swatch-picker/swatch-picker.component';

/** How many undo steps to keep. */
const HISTORY_LIMIT = 60;

@Component({
  selector: 'app-creator-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonDirective,
    HlmSeparatorComponent,
    HlmLabelDirective,
    HlmTabsDirective,
    HlmTabsListDirective,
    HlmTabsTriggerDirective,
    HlmTabsContentDirective,
    SvgAvatarComponent,
    TraitPickerComponent,
    SwatchPickerComponent,
  ],
  templateUrl: './creator.page.html',
  styleUrl: './creator.page.scss',
})
export class CreatorPageComponent implements OnInit {
  private avatarService = inject(AvatarService);
  private lipSync = inject(LipSyncService);

  config = signal<AvatarConfig>(this.avatarService.defaultConfig());

  // ── Undo / redo ──────────────────────────────────────────────
  // These are signals, not plain arrays. `canUndo` is a computed, and a
  // computed only re-evaluates when a tracked signal changes — mutating a
  // plain array registers no dependency, so the buttons stayed permanently
  // disabled no matter how many edits were made.
  private readonly past = signal<AvatarConfig[]>([]);
  private readonly future = signal<AvatarConfig[]>([]);
  private nameSnapshot: string | null = null;

  /** Transient confirmation after save / export / randomize. */
  readonly status = signal<string | null>(null);

  // Lip sync preview
  currentViseme = signal(0);
  isSpeaking = signal(false);
  private lipSyncCancel: (() => void) | null = null;

  // ─── Trait options ───────────────────────────────────────────
  // Previews are built from the same part data the renderer uses, so a
  // thumbnail can never drift from the avatar it produces. The emoji these
  // replaced told you nothing about what "handlebar" actually looks like.

  private preview(kind: PreviewKind, value: string): string {
    return buildTraitPreview(kind, value);
  }

  genderOptions: TraitOption<Gender>[] = [
    { value: 'man', label: 'Man', svgPreview: this.preview('gender', 'man') },
    { value: 'woman', label: 'Woman', svgPreview: this.preview('gender', 'woman') },
  ];

  haircutOptions: TraitOption<HaircutStyle>[] = (
    ['short', 'long', 'curly', 'bald', 'bun', 'ponytail', 'mohawk'] as HaircutStyle[]
  ).map((v) => ({
    value: v,
    label: v,
    svgPreview: this.preview('haircut', v),
  }));

  eyeOptions: TraitOption<EyeStyle>[] = (
    ['round', 'almond', 'wide', 'narrow'] as EyeStyle[]
  ).map((v) => ({ value: v, label: v, svgPreview: this.preview('eyeStyle', v) }));

  mustacheOptions: TraitOption<MustacheStyle>[] = (
    ['none', 'thin', 'thick', 'handlebar', 'chevron'] as MustacheStyle[]
  ).map((v) => ({ value: v, label: v, svgPreview: this.preview('mustache', v) }));

  beardOptions: TraitOption<BeardStyle>[] = (
    ['none', 'stubble', 'short', 'long', 'goatee'] as BeardStyle[]
  ).map((v) => ({ value: v, label: v, svgPreview: this.preview('beard', v) }));

  glassesOptions: TraitOption<GlassesStyle>[] = (
    ['none', 'round', 'rectangular', 'sunglasses', 'monocle'] as GlassesStyle[]
  ).map((v) => ({ value: v, label: v, svgPreview: this.preview('glasses', v) }));

  professionOptions: TraitOption<ProfessionType>[] = (
    ['none', 'doctor', 'engineer', 'teacher', 'chef', 'police', 'astronaut', 'artist', 'business'] as ProfessionType[]
  ).map((v) => ({ value: v, label: v, svgPreview: this.preview('profession', v) }));

  // ─── Swatch data ──────────────────────────────────

  skinSwatches: Swatch<SkinTone>[] = Object.entries(SKIN_TONES).map(
    ([key, val]) => ({ value: key as SkinTone, color: val.base, label: key })
  );

  hairSwatches: Swatch<HairColor>[] = Object.entries(HAIR_COLORS).map(
    ([key, val]) => ({ value: key as HairColor, color: val, label: key })
  );

  eyeSwatches: Swatch<EyeColor>[] = Object.entries(EYE_COLORS).map(
    ([key, val]) => ({ value: key as EyeColor, color: val, label: key })
  );

  // ─── Actions ────────────────────────────────────────────────

  ngOnInit(): void {
    const saved = this.avatarService.loadAvatar();
    if (saved) {
      this.config.set(saved);
    }
    // Seed the history with whatever we started from, so the first undo has
    // somewhere to go back to.
    this.past.set([this.config()]);
  }

  update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]): void {
    this.push();
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  updateName(name: string): void {
    // Typing fires this per keystroke; recording every character would make
    // undo useless, so name edits collapse into one history entry.
    if (this.nameSnapshot === null) this.nameSnapshot = this.config().name;
    this.config.update((c) => ({ ...c, name }));
  }

  commitName(): void {
    if (this.nameSnapshot === null) return;
    if (this.nameSnapshot !== this.config().name) {
      this.past.update((p) => [...p, { ...this.config(), name: this.nameSnapshot! }]);
      this.future.set([]);
    }
    this.nameSnapshot = null;
  }

  private push(): void {
    this.past.update((p) => {
      const next = [...p, this.config()];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    this.future.set([]);
    this.status.set(null);
  }

  readonly canUndo = computed(() => this.past().length > 1);
  readonly canRedo = computed(() => this.future().length > 0);

  undo(): void {
    const stack = this.past();
    if (stack.length <= 1) return;
    const prev = stack[stack.length - 1];
    this.past.set(stack.slice(0, -1));
    this.future.update((f) => [...f, this.config()]);
    this.config.set(prev);
  }

  redo(): void {
    const stack = this.future();
    const next = stack[stack.length - 1];
    if (next === undefined) return;
    this.future.set(stack.slice(0, -1));
    this.past.update((p) => [...p, this.config()]);
    this.config.set(next);
  }

  /** Weighted pick — `none` options are far more common in the real data. */
  private pick<T>(values: readonly T[]): T {
    return values[Math.floor(Math.random() * values.length)];
  }

  randomize(): void {
    this.push();
    const gender = this.pick<Gender>(['man', 'woman']);
    this.config.set({
      ...this.config(),
      gender,
      skinTone: this.pick<SkinTone>(Object.keys(SKIN_TONES) as SkinTone[]),
      haircut: this.pick<HaircutStyle>(this.haircutOptions.map((o) => o.value)),
      hairColor: this.pick<HairColor>(Object.keys(HAIR_COLORS) as HairColor[]),
      eyeColor: this.pick<EyeColor>(Object.keys(EYE_COLORS) as EyeColor[]),
      eyeStyle: this.pick<EyeStyle>(this.eyeOptions.map((o) => o.value)),
      mustache: this.pick<MustacheStyle>(this.mustacheOptions.map((o) => o.value)),
      beard: this.pick<BeardStyle>(this.beardOptions.map((o) => o.value)),
      glasses: this.pick<GlassesStyle>(this.glassesOptions.map((o) => o.value)),
      profession: this.pick<ProfessionType>(this.professionOptions.map((o) => o.value)),
    });
    this.status.set('Rolled a new character');
  }

  reset(): void {
    this.push();
    this.config.set(this.avatarService.defaultConfig());
    this.status.set('Reset to defaults');
  }

  save(): void {
    this.avatarService.saveAvatar(this.config());
    this.status.set('Saved to this browser');
  }

  export(): void {
    this.avatarService.downloadSVG(this.config());
    this.status.set('Exported SVG');
  }

  testSpeech(): void {
    this.lipSyncCancel?.();
    const text = this.config().name || 'Hello, I am your avatar!';
    const visemes = this.lipSync.textToVisemes(text);
    this.isSpeaking.set(true);
    this.lipSyncCancel = this.lipSync.play(
      visemes,
      (v) => this.currentViseme.set(v),
      // Cleared on a real end-of-utterance, not on viseme 0 — silence occurs
      // at every space, so the old check stopped the state at the first gap.
      () => this.isSpeaking.set(false),
    );
  }
}
