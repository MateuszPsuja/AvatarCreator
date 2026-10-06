// libs/avatar-player/src/lib/geometry/avatar.model.ts/avatar.model.ts

export type Gender = 'man' | 'woman';
export type SkinTone = 'light' | 'medium' | 'tan' | 'dark' | 'deep';
export type HaircutStyle = 'short' | 'long' | 'curly' | 'bald' | 'bun' | 'ponytail' | 'mohawk';
export type MustacheStyle = 'none' | 'thin' | 'thick' | 'handlebar' | 'chevron';
export type BeardStyle = 'none' | 'stubble' | 'short' | 'long' | 'goatee';
export type EyeStyle = 'round' | 'almond' | 'wide' | 'narrow';
export type GlassesStyle = 'none' | 'round' | 'rectangular' | 'sunglasses' | 'monocle';
export type ProfessionType =
  | 'none'
  | 'doctor'
  | 'engineer'
  | 'teacher'
  | 'chef'
  | 'police'
  | 'astronaut'
  | 'artist'
  | 'business';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white';
export type EyeColor = 'brown' | 'blue' | 'green' | 'gray' | 'black';

export interface AvatarConfig {
  id: string;
  name: string;
  gender: Gender;
  skinTone: SkinTone;
  haircut: HaircutStyle;
  hairColor: HairColor;
  eyeColor: EyeColor;
  mustache: MustacheStyle;
  beard: BeardStyle;
  eyeStyle: EyeStyle;
  glasses: GlassesStyle;
  profession: ProfessionType;
}
