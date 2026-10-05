// src/app/demo/demo-manifest.ts
//
// Single source of truth for the demo gallery. The generator script imports
// this and writes the .svg + .json pairs; the viewer page imports the same list
// and loads those .json files into the player. One manifest, so the committed
// files and the page can never disagree about what exists.
import type { AvatarConfig } from '@avatar-workspace/avatar-player';

export interface DemoAvatar {
  /** Filesystem-safe id. The SVG file is `<slug>.svg`. */
  slug: string;
  label: string;
  /** What this avatar is meant to demonstrate. */
  notes: string;
  /**
   * Phrase the demo avatar mouths when its play button is pressed.
   *
   * The player maps this to visemes at MS_PER_VISEME (80ms) and plays the whole
   * phrase, so length is a pacing choice rather than a hard limit — a long one
   * keeps talking until you press Stop. Roughly 50 characters finishes in about
   * four seconds, which reads as a single spoken line.
   */
  speech: string;
  config: AvatarConfig;
}

/** Where the generator writes and the viewer reads from. */
export const DEMO_ASSET_DIR = 'demo-assets';

function cfg(id: string, name: string, over: Partial<AvatarConfig>): AvatarConfig {
  return {
    id,
    name,
    gender: 'man',
    skinTone: 'medium',
    haircut: 'short',
    hairColor: 'brown',
    eyeColor: 'brown',
    mustache: 'none',
    beard: 'none',
    eyeStyle: 'round',
    glasses: 'none',
    profession: 'none',
    ...over,
  };
}

export const DEMO_AVATARS: DemoAvatar[] = [
  // ── Profession coverage: every one, including the three that wear hats ──
  {
    slug: 'doctor-woman',
    label: 'Doctor',
    notes: 'Head-wearing professions are the reason this demo exists — check the hat clip.',
    speech: 'Good morning, I am the doctor on call this afternoon.',
    config: cfg('d1', 'Doctor', {
      gender: 'woman', skinTone: 'light', haircut: 'bun', hairColor: 'black',
      profession: 'doctor', glasses: 'none',
    }),
  },
  {
    slug: 'engineer-man-long',
    label: 'Engineer',
    notes: 'Long hair under a hard hat — this used to export with hair through the helmet.',
    speech: 'The bridge is holding steady, do not worry about it.',
    config: cfg('d2', 'Engineer', {
      gender: 'man', skinTone: 'tan', haircut: 'long', hairColor: 'black',
      beard: 'short', profession: 'engineer',
    }),
  },
  {
    slug: 'teacher-woman',
    label: 'Teacher',
    notes: 'Female profession styling, no headwear.',
    speech: 'Please open your books to chapter four and read along.',
    config: cfg('d3', 'Teacher', {
      gender: 'woman', skinTone: 'medium', haircut: 'ponytail', hairColor: 'brown',
      eyeStyle: 'almond', profession: 'teacher',
    }),
  },
  {
    slug: 'chef-man',
    label: 'Chef',
    notes: 'Facial hair with no hat, so the beard is unclipped.',
    speech: 'Taste the sauce and tell me if it needs more salt.',
    config: cfg('d4', 'Chef', {
      gender: 'man', skinTone: 'medium', haircut: 'curly', hairColor: 'black',
      mustache: 'thick', beard: 'goatee', profession: 'chef',
    }),
  },
  {
    slug: 'police-woman-bun',
    label: 'Police',
    notes: 'A bun clipped by the cap brim — the orphan-hair case.',
    speech: 'Everything is fine here, stay calm and keep moving.',
    config: cfg('d5', 'Police', {
      gender: 'woman', skinTone: 'deep', haircut: 'bun', hairColor: 'black',
      glasses: 'none', profession: 'police',
    }),
  },
  {
    slug: 'astronaut-woman-long-beard',
    label: 'Astronaut',
    notes: 'Helmet clips hair, ears AND facial hair. Long beard used to be sliced flat at y=140.',
    speech: 'Systems are nominal, we are good to go for launch.',
    config: cfg('d6', 'Astronaut', {
      gender: 'man', skinTone: 'light', haircut: 'short', hairColor: 'blonde',
      beard: 'long', profession: 'astronaut',
    }),
  },
  {
    slug: 'artist-man',
    label: 'Artist',
    notes: 'Third hat profession — beret clips hair the same way.',
    speech: 'I paint first and then I remove most of what I painted.',
    config: cfg('d7', 'Artist', {
      gender: 'man', skinTone: 'medium', haircut: 'mohawk', hairColor: 'red',
      glasses: 'round', profession: 'artist',
    }),
  },
  {
    slug: 'business-woman',
    label: 'Business',
    notes: 'No accessory at all — the profession ships an empty accessory string.',
    speech: 'Let us review the quarterly numbers before the meeting.',
    config: cfg('d8', 'Business', {
      gender: 'woman', skinTone: 'dark', haircut: 'curly', hairColor: 'black',
      glasses: 'rectangular', profession: 'business',
    }),
  },
  {
    slug: 'plain-man',
    label: 'No profession',
    notes: 'Baseline. Nothing is clipped here.',
    speech: 'Hello there, it is nice to finally meet you in person.',
    config: cfg('d9', 'Plain', { gender: 'man', skinTone: 'medium' }),
  },

  // ── Skin tone coverage: including the two that hid the nose ────────────
  {
    slug: 'tone-deep',
    label: 'Deep skin',
    notes: 'The nose used to vanish here — it was drawn in --skin-ear, too close to the face.',
    speech: 'Deep skin tones deserve to be seen and used everywhere.',
    config: cfg('d10', 'Deep', {
      skinTone: 'deep', eyeColor: 'brown', hairColor: 'black', haircut: 'curly',
    }),
  },
  {
    slug: 'tone-dark',
    label: 'Dark skin',
    notes: 'Second tone where the old nose stroke was nearly invisible.',
    speech: 'This avatar is rendered on a dark skin tone right here.',
    config: cfg('d11', 'Dark', {
      skinTone: 'dark', eyeColor: 'brown', hairColor: 'black', gender: 'woman',
      haircut: 'long',
    }),
  },
  {
    slug: 'tone-light',
    label: 'Light skin',
    notes: 'White hair shows why stubble-by-opacity is a problem — it vanishes.',
    speech: 'Light skin, white hair, and the nose is still clearly visible.',
    config: cfg('d12', 'Light', {
      skinTone: 'light', hairColor: 'white', beard: 'stubble', haircut: 'short',
    }),
  },
  {
    slug: 'tone-tan',
    label: 'Tan skin',
    notes: 'Mid palette reference.',
    speech: 'A tan tone with grey hair and a monocle, what a character.',
    config: cfg('d13', 'Tan', {
      skinTone: 'tan', hairColor: 'gray', glasses: 'monocle',
    }),
  },

  // ── Shape coverage ───────────────────────────────────────────────────
  {
    slug: 'eyes-almond-blue',
    label: 'Almond eyes',
    notes: 'Blink is clipped on narrow eyes — the eyelid rect is sized for a round eye.',
    speech: 'Almond shaped eyes with a bright blue colour, nice.',
    config: cfg('d14', 'Almond', { eyeStyle: 'almond', eyeColor: 'blue' }),
  },
  {
    slug: 'eyes-wide-green',
    label: 'Wide eyes',
    notes: 'Green iris, no hair colour conflict.',
    speech: 'Wide eyes in green, looking a little surprised here.',
    config: cfg('d15', 'Wide', { eyeStyle: 'wide', eyeColor: 'green', gender: 'woman' }),
  },
  {
    slug: 'glasses-sunglasses',
    label: 'Sunglasses',
    notes: 'The one glasses style that does not need a visible eye beneath it.',
    speech: 'Sunglasses on, so the eyes stay hidden behind the lens.',
    config: cfg('d16', 'Cool', { glasses: 'sunglasses', skinTone: 'medium' }),
  },
];
