// services/avatar.service.ts — Config state + persistence + export
import { Injectable } from '@angular/core';
import type { AvatarConfig } from '@avatar-workspace/avatar-shared';
import { buildAvatarSvg } from '@avatar-workspace/avatar-shared';
import { createZip, type ZipEntry } from './zip.util';

const STORAGE_KEY = 'avatar-workspace:saved-avatar';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  /** Generate a fresh default avatar config */
  defaultConfig(): AvatarConfig {
    return {
      id: this.generateId(),
      name: '',
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
    };
  }

  /** Save avatar to localStorage */
  saveAvatar(config: AvatarConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      console.warn('Failed to save avatar to localStorage');
    }
  }

  /** Load avatar from localStorage (or null) */
  loadAvatar(): AvatarConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AvatarConfig) : null;
    } catch {
      return null;
    }
  }

  /**
   * Build a standalone SVG document for the given config.
   *
   * Delegates to the shared renderer so the exported file is pixel-identical
   * to the on-screen preview — same geometry, same palette, same clip paths.
   * Animation hooks are omitted by design: a static file has nothing to drive
   * them.
   */
  buildSvg(config: AvatarConfig): string {
    return buildAvatarSvg(config);
  }

  // ── Export bundle ─────────────────────────────────────────────────
  //
  // The point of this app is to hand a finished avatar to *another* app, so
  // the bundle ships the data a player needs and nothing else — no player
  // code, no runtime. The consuming app already has a player; this is what
  // it feeds.

  /** The avatar config, serialised for a player to read. */
  buildConfigJson(config: AvatarConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * The bundle's contents, as ZIP entries.
   *
   * Exposed separately from {@link downloadBundle} so the exact payload can
   * be asserted in tests without touching the DOM.
   */
  buildBundleFiles(config: AvatarConfig): ZipEntry[] {
    return [
      { name: 'avatar.json', data: this.buildConfigJson(config) },
      { name: 'avatar.svg', data: this.buildSvg(config) },
      { name: 'README.md', data: this.bundleReadme(config) },
    ];
  }

  /** Export the whole avatar as a .zip download */
  downloadBundle(config: AvatarConfig): void {
    const zip = createZip(this.buildBundleFiles(config));
    this.downloadBlob(
      zip,
      'application/zip',
      `${this.fileBaseName(config)}.zip`,
    );
  }

  /**
   * Ships with the bundle because the config is a contract: a consuming app
   * that guesses at the field names renders the wrong avatar, and the failure
   * is silent (every lookup falls back to a default).
   */
  private bundleReadme(config: AvatarConfig): string {
    return `# Avatar: ${config.name || 'avatar'}

Exported from the SVG Avatar Creator. This bundle contains the avatar's
**data** only — no player code, no runtime. Your app supplies the player.

## Files

| File | Purpose |
|---|---|
| \`avatar.json\` | The avatar config. **This is what a player consumes.** |
| \`avatar.svg\` | Static, standalone rendering of the same config. |

## \`avatar.json\`

A single \`AvatarConfig\` object — pass it straight to the player, no wrapper
and no version envelope:

\`\`\`json
${this.buildConfigJson(config)}
\`\`\`

| Field | Type | Values |
|---|---|---|
| \`id\` | string | Generated id, stable for this avatar |
| \`name\` | string | Display name; also used as the download filename |
| \`gender\` | string | \`man\` · \`woman\` |
| \`skinTone\` | string | \`light\` · \`medium\` · \`tan\` · \`dark\` · \`deep\` |
| \`haircut\` | string | \`short\` · \`long\` · \`curly\` · \`bald\` · \`bun\` · \`ponytail\` · \`mohawk\` |
| \`hairColor\` | string | \`black\` · \`brown\` · \`blonde\` · \`red\` · \`gray\` · \`white\` |
| \`eyeColor\` | string | \`brown\` · \`blue\` · \`green\` · \`gray\` · \`black\` |
| \`mustache\` | string | \`none\` · \`thin\` · \`thick\` · \`handlebar\` · \`chevron\` |
| \`beard\` | string | \`none\` · \`stubble\` · \`short\` · \`long\` · \`goatee\` |
| \`eyeStyle\` | string | \`round\` · \`almond\` · \`wide\` · \`narrow\` |
| \`glasses\` | string | \`none\` · \`round\` · \`rectangular\` · \`sunglasses\` · \`monocle\` |
| \`profession\` | string | \`none\` · \`doctor\` · \`engineer\` · \`teacher\` · \`chef\` · \`police\` · \`astronaut\` · \`artist\` · \`business\` |

Unknown values are not validated at load time — a missing or misspelled field
falls back to that trait's default rather than raising an error, so an
unrecognised avatar renders *plausible but wrong*. Check against the table
above when debugging an unexpected face.

## \`avatar.svg\`

A complete, self-contained SVG document (200×200 \`viewBox\`) with its palette
inlined, so it renders anywhere with no stylesheet, fonts or assets.

It is **static**: no blinking, no head motion, no lip sync. Those are driven
by a player re-rendering from \`avatar.json\`, not by markup in the file. Use
it for avatars, thumbnails and chat-list icons; use the config when the avatar
needs to animate or speak.

> If you inline several exported SVGs in one page, the \`clipPath\` ids inside
> them (\`face-clip\`, \`hat-clip\`, \`helmet-clip\`) collide — \`url(#hat-clip)\`
> then resolves against the first match in the document and every avatar clips
> identically. Namespacing them per avatar is the consumer's job; the Angular
> player does it via its \`idsPrefix\` input.
`;
  }

  /**
   * Filename stem for downloads.
   *
   * Sanitised because it goes straight into a \`download\` attribute: a name
   * with a slash or a leading dot would otherwise either write to a path or
   * download as a hidden file.
   */
  private fileBaseName(config: AvatarConfig): string {
    const slug = (config.name || 'avatar')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'avatar';
  }

  private downloadBlob(
    data: BlobPart,
    type: string,
    filename: string,
  ): void {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
