// libs/avatar-shared/src/lib/skin-tones.ts
import { SkinTone } from './avatar.model';

export const SKIN_TONES: Record<SkinTone, { base: string; ear: string; lip: string }> = {
  light:  { base: '#FDDBB4', ear: '#F5C89A', lip: '#E8967A' },
  medium: { base: '#F0AC78', ear: '#E09A62', lip: '#C97050' },
  tan:    { base: '#D4845A', ear: '#C0724A', lip: '#A8533A' },
  dark:   { base: '#8D5524', ear: '#7A4820', lip: '#6B3A18' },
  deep:   { base: '#4A2912', ear: '#3C200E', lip: '#5C2E18' },
};
