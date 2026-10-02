// libs/avatar-shared/src/lib/skin-tones.ts
import { SkinTone } from './avatar.model';

/**
 * - `base`   — main face fill
 * - `ear`    — secondary tone for ears
 * - `lip`    — lips
 * - `shadow` — a THIRD tone reserved for small linework (nose stroke).
 *
 * `shadow` used to be conflated with `ear`, which made the nose vanish
 * on the two darkest tones: `deep` ear is #3C200E against a #4A2912 face,
 * far too close to read as a line. `shadow` is always a clear step darker
 * than `ear` so it stays legible at the 2px stroke width we use.
 *
 * The style guide allows at most two tones per *region*. The nose is its
 * own region, so a dedicated third value is compliant.
 */
export const SKIN_TONES: Record<SkinTone, { base: string; ear: string; lip: string; shadow: string }> = {
  light:  { base: '#FDDBB4', ear: '#F5C89A', lip: '#E8967A', shadow: '#E0A473' },
  medium: { base: '#F0AC78', ear: '#E09A62', lip: '#C97050', shadow: '#C67C45' },
  tan:    { base: '#D4845A', ear: '#C0724A', lip: '#A8533A', shadow: '#A15532' },
  dark:   { base: '#8D5524', ear: '#7A4820', lip: '#6B3A18', shadow: '#5E3312' },
  deep:   { base: '#4A2912', ear: '#3C200E', lip: '#5C2E18', shadow: '#291505' },
};
