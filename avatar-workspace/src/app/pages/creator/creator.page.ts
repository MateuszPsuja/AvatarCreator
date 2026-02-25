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
import { SKIN_TONES, HAIR_COLORS, EYE_COLORS } from '@avatar-workspace/avatar-shared';

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

  // Lip sync preview
  currentViseme = signal(0);
  isSpeaking = signal(false);
  private lipSyncCancel: (() => void) | null = null;

  // ─── Trait options ─────────────────────────────────

  genderOptions: TraitOption<Gender>[] = [
    { value: 'man', label: 'Man', icon: '👨' },
    { value: 'woman', label: 'Woman', icon: '👩' },
  ];

  haircutOptions: TraitOption<HaircutStyle>[] = [
    { value: 'short', label: 'Short', icon: '💇' },
    { value: 'long', label: 'Long', icon: '💇‍♀️' },
    { value: 'curly', label: 'Curly', icon: '🌀' },
    { value: 'bald', label: 'Bald', icon: '🧑‍🦲' },
    { value: 'bun', label: 'Bun', icon: '🔝' },
    { value: 'ponytail', label: 'Ponytail', icon: '🎀' },
    { value: 'mohawk', label: 'Mohawk', icon: '⬆️' },
  ];

  eyeOptions: TraitOption<EyeStyle>[] = [
    { value: 'round', label: 'Round', icon: '⭕' },
    { value: 'almond', label: 'Almond', icon: '🌰' },
    { value: 'wide', label: 'Wide', icon: '👀' },
    { value: 'narrow', label: 'Narrow', icon: '😑' },
  ];

  mustacheOptions: TraitOption<MustacheStyle>[] = [
    { value: 'none', label: 'None', icon: '✖️' },
    { value: 'thin', label: 'Thin', icon: '〰️' },
    { value: 'thick', label: 'Thick', icon: '➖' },
    { value: 'handlebar', label: 'Handlebar', icon: '〽️' },
    { value: 'chevron', label: 'Chevron', icon: '🔽' },
  ];

  beardOptions: TraitOption<BeardStyle>[] = [
    { value: 'none', label: 'None', icon: '✖️' },
    { value: 'stubble', label: 'Stubble', icon: '🫥' },
    { value: 'short', label: 'Short', icon: '🧔‍♂️' },
    { value: 'long', label: 'Long', icon: '🧔' },
    { value: 'goatee', label: 'Goatee', icon: '🐐' },
  ];

  glassesOptions: TraitOption<GlassesStyle>[] = [
    { value: 'none', label: 'None', icon: '✖️' },
    { value: 'round', label: 'Round', icon: '🟠' },
    { value: 'rectangular', label: 'Rectangular', icon: '⬜' },
    { value: 'sunglasses', label: 'Sunglasses', icon: '🕶️' },
    { value: 'monocle', label: 'Monocle', icon: '🧐' },
  ];

  professionOptions: TraitOption<ProfessionType>[] = [
    { value: 'none', label: 'None', icon: '✖️' },
    { value: 'doctor', label: 'Doctor', icon: '🩺' },
    { value: 'engineer', label: 'Engineer', icon: '⚙️' },
    { value: 'teacher', label: 'Teacher', icon: '📚' },
    { value: 'chef', label: 'Chef', icon: '👨‍🍳' },
    { value: 'police', label: 'Police', icon: '👮' },
    { value: 'astronaut', label: 'Astronaut', icon: '🚀' },
    { value: 'artist', label: 'Artist', icon: '🎨' },
    { value: 'business', label: 'Business', icon: '💼' },
  ];

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

  // ─── Actions ──────────────────────────────────────

  ngOnInit(): void {
    const saved = this.avatarService.loadAvatar();
    if (saved) {
      this.config.set(saved);
    }
  }

  update<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]): void {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  reset(): void {
    this.config.set(this.avatarService.defaultConfig());
  }

  save(): void {
    this.avatarService.saveAvatar(this.config());
  }

  export(): void {
    this.avatarService.downloadSVG(this.config());
  }

  updateName(name: string): void {
    this.config.update((c) => ({ ...c, name }));
  }

  testSpeech(): void {
    this.lipSyncCancel?.();
    const text = this.config().name || 'Hello, I am your avatar!';
    const visemes = this.lipSync.textToVisemes(text);
    this.isSpeaking.set(true);
    this.lipSyncCancel = this.lipSync.play(visemes, (v) => {
      this.currentViseme.set(v);
      if (v === 0) {
        this.isSpeaking.set(false);
      }
    });
  }
}
