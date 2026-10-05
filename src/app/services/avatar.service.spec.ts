import { TestBed } from '@angular/core/testing';
import { AvatarService } from './avatar.service';
import type { AvatarConfig } from '@avatar-workspace/avatar-player';
import { buildAvatarSvg } from '@avatar-workspace/avatar-player';

describe('AvatarService', () => {
  let service: AvatarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('defaultConfig', () => {
    it('should return a valid AvatarConfig with all required fields', () => {
      const config = service.defaultConfig();
      expect(config.id).toBeTruthy();
      expect(config.name).toBe('');
      expect(config.gender).toBe('man');
      expect(config.skinTone).toBe('medium');
      expect(config.haircut).toBe('short');
      expect(config.hairColor).toBe('brown');
      expect(config.eyeColor).toBe('brown');
      expect(config.mustache).toBe('none');
      expect(config.beard).toBe('none');
      expect(config.eyeStyle).toBe('round');
      expect(config.glasses).toBe('none');
      expect(config.profession).toBe('none');
    });

    it('should generate unique IDs each time', () => {
      const c1 = service.defaultConfig();
      const c2 = service.defaultConfig();
      expect(c1.id).not.toBe(c2.id);
    });
  });

  describe('buildSvg', () => {
    // The palette moved to the shared renderer, which is what guarantees the
    // exported file matches the preview. See avatar-renderer.spec.ts.
    it('should delegate to the shared renderer', () => {
      const config = service.defaultConfig();
      expect(service.buildSvg(config)).toBe(buildAvatarSvg(config));
    });

    it('should produce a standalone document carrying its own palette', () => {
      const svg = service.buildSvg(service.defaultConfig());
      expect(svg.startsWith('<svg')).toBeTrue();
      expect(svg).toContain('--skin-base');
      expect(svg).toContain('--hair-color');
    });
  });

  describe('saveAvatar / loadAvatar', () => {
    it('should save and load an avatar from localStorage', () => {
      const config = service.defaultConfig();
      config.name = 'Test Avatar';
      service.saveAvatar(config);

      const loaded = service.loadAvatar();
      expect(loaded).toBeTruthy();
      expect(loaded!.name).toBe('Test Avatar');
      expect(loaded!.id).toBe(config.id);
    });

    it('should return null when no avatar is saved', () => {
      expect(service.loadAvatar()).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('avatar-workspace:saved-avatar', 'not-json!!');
      expect(service.loadAvatar()).toBeNull();
    });
  });

  describe('buildConfigJson', () => {
    it('should round-trip the config through JSON unchanged', () => {
      const config = service.defaultConfig();
      config.name = 'Ada';
      config.beard = 'goatee';
      expect(JSON.parse(service.buildConfigJson(config))).toEqual(config);
    });
  });

  describe('buildBundleFiles', () => {
    // The bundle is the app's actual hand-off to another app, so the shape of
    // the archive is a contract, not an implementation detail.
    it('should ship the config, a static SVG and a schema README', () => {
      const files = service.buildBundleFiles(service.defaultConfig());
      expect(files.map((f) => f.name)).toEqual([
        'avatar.json',
        'avatar.svg',
        'README.md',
      ]);
    });

    it('should ship a config a player can read directly', () => {
      const config = service.defaultConfig();
      config.name = 'Ada';
      const [json] = service.buildBundleFiles(config);
      const parsed = JSON.parse(json.data as string);

      // Bare AvatarConfig, not wrapped in a version envelope: the player's
      // [config] input takes exactly this object.
      expect(Object.keys(parsed).sort()).toEqual(Object.keys(config).sort());
      expect(parsed.name).toBe('Ada');
    });

    it('should ship the same artwork the standalone SVG export produces', () => {
      const config = service.defaultConfig();
      const svg = service
        .buildBundleFiles(config)
        .find((f) => f.name === 'avatar.svg')!.data;
      expect(svg).toBe(service.buildSvg(config));
    });

    it('should document every config field in the README', () => {
      const config = service.defaultConfig();
      const readme = service
        .buildBundleFiles(config)
        .find((f) => f.name === 'README.md')!.data as string;

      for (const field of Object.keys(config)) {
        expect(readme).toContain(`\`${field}\``);
      }
    });
  });
});
