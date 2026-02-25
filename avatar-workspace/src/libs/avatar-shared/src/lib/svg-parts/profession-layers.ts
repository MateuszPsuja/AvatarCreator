// libs/avatar-shared/src/lib/svg-parts/profession-layers.ts
// 9 professions: none, doctor, engineer, teacher, chef, police, astronaut, artist, business
// Each provides: body (shoulders/clothing) + accessory (badge/hat/item on top of head)
// Canvas: 200×200. Face center (100,88). Neck x=88–112, y=135–157.
// Body renders as layer 1 (below head). Accessory renders as layer 14 (above hair).
// Flat fills only, no gradients/filters, stroke-width ≤ 2.5

import { ProfessionType } from '../avatar.model';

interface ProfessionParts {
  body: string;
  accessory: string;
}

export const PROFESSION_LAYERS: Record<ProfessionType, ProfessionParts> = {

  // ─── None: Plain crew-neck T-shirt ──────────────────
  none: {
    body: `
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#6B7280"/>
      <!-- Collar line -->
      <path d="M88,145 Q90,150 100,151 Q110,150 112,145"
            fill="none" stroke="#5B6370" stroke-width="1.5" stroke-linecap="round"/>`,
    accessory: '',
  },

  // ─── Doctor: White lab coat over blue scrubs, stethoscope ───
  doctor: {
    body: `
      <!-- Blue scrub underneath -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#3B82F6"/>
      <!-- V-neck scrub neckline -->
      <path d="M88,140 L96,155 L100,152 L104,155 L112,140"
            fill="#3B82F6" stroke="#2563EB" stroke-width="1"/>
      <!-- White lab coat — open front, over shoulders -->
      <path d="M30,200 Q30,158 55,150 Q70,145 80,142
              L82,155 L90,200 Z" fill="#F8FAFC"/>
      <path d="M170,200 Q170,158 145,150 Q130,145 120,142
              L118,155 L110,200 Z" fill="#F8FAFC"/>
      <!-- Coat lapels -->
      <path d="M80,142 L86,158 L82,155" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.5"/>
      <path d="M120,142 L114,158 L118,155" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.5"/>
      <!-- Breast pocket -->
      <rect x="34" y="168" width="14" height="10" rx="1" fill="none" stroke="#CBD5E1" stroke-width="1"/>
      <!-- Stethoscope — tubes start behind neck, just under jaw (~y=142) -->
      <path d="M95,142 Q80,148 76,156 Q74,166 84,172 Q94,177 100,175"
            fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M105,142 Q120,148 124,156 Q126,166 116,172 Q106,177 100,175"
            fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Stethoscope chest piece (centered on chest) -->
      <circle cx="100" cy="177" r="5" fill="#64748B" stroke="#475569" stroke-width="1.2"/>
      <circle cx="100" cy="177" r="2" fill="#94A3B8"/>`,
    accessory: ``,
  },

  // ─── Engineer: Orange safety vest, hard hat ─────────
  engineer: {
    body: `
      <!-- Blue work shirt -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#1E3A5F"/>
      <!-- Orange hi-vis vest -->
      <path d="M45,200 Q48,160 65,152 Q78,146 88,144
              L92,200 Z" fill="#F97316"/>
      <path d="M155,200 Q152,160 135,152 Q122,146 112,144
              L108,200 Z" fill="#F97316"/>
      <!-- Reflective stripes -->
      <line x1="55" y1="164" x2="88" y2="152" stroke="#FDE68A" stroke-width="2.5"/>
      <line x1="145" y1="164" x2="112" y2="152" stroke="#FDE68A" stroke-width="2.5"/>
      <line x1="58" y1="178" x2="90" y2="168" stroke="#FDE68A" stroke-width="2.5"/>
      <line x1="142" y1="178" x2="110" y2="168" stroke="#FDE68A" stroke-width="2.5"/>`,
    accessory: `
      <!-- Hair cover (hides any hair poking through) -->
      <ellipse cx="100" cy="52" rx="56" ry="20" fill="#D97706"/>
      <!-- Hard hat — dome -->
      <path d="M50,52 Q50,14 100,8 Q150,14 150,52 Z" fill="#F59E0B"/>
      <!-- Brim -->
      <rect x="44" y="50" width="112" height="9" rx="4" fill="#D97706"/>
      <!-- Brim shadow line -->
      <line x1="48" y1="57" x2="152" y2="57" stroke="#B45309" stroke-width="1"/>
      <!-- Center ridge -->
      <line x1="100" y1="10" x2="100" y2="50" stroke="#EAB308" stroke-width="1" opacity="0.4"/>`,
  },

  // ─── Teacher: Professor with graduation cap, sweater vest, bow tie ─────
  teacher: {
    body: `
      <!-- Light blue dress shirt -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#DBEAFE"/>
      <!-- Shirt collar -->
      <path d="M88,140 L82,148 L94,152" fill="#BFDBFE" stroke="#93C5FD" stroke-width="0.7"/>
      <path d="M112,140 L118,148 L106,152" fill="#BFDBFE" stroke="#93C5FD" stroke-width="0.7"/>
      <!-- Dark navy sweater vest -->
      <path d="M55,200 Q56,162 65,154 Q78,147 88,144
              L94,152 L100,148 L106,152 L112,144
              Q122,147 135,154 Q144,162 145,200 Z" fill="#1E293B"/>
      <!-- V-neck of sweater vest -->
      <path d="M88,144 L94,152 L100,148 L106,152 L112,144"
            fill="#DBEAFE" stroke="#1E293B" stroke-width="0.8"/>
      <!-- Sweater vest bottom ribbing -->
      <line x1="58" y1="196" x2="142" y2="196" stroke="#334155" stroke-width="1"/>
      <line x1="57" y1="198" x2="143" y2="198" stroke="#334155" stroke-width="0.5"/>
      <!-- Sleeves (shirt showing) -->
      <path d="M30,200 Q30,158 55,150 Q62,148 65,154
              L58,200 Z" fill="#DBEAFE"/>
      <path d="M170,200 Q170,158 145,150 Q138,148 135,154
              L142,200 Z" fill="#DBEAFE"/>
      <!-- Bow tie -->
      <path d="M93,147 L88,143 L88,151 Z" fill="#991B1B"/>
      <path d="M107,147 L112,143 L112,151 Z" fill="#991B1B"/>
      <circle cx="100" cy="147" r="2.5" fill="#B91C1C" stroke="#7F1D1D" stroke-width="0.5"/>`,
    accessory: `
      <!-- Graduation mortarboard cap -->
      <!-- Cap crown (skull cap — covers top of head generously) -->
      <path d="M46,56 Q44,38 62,30 Q80,22 100,22 Q120,22 138,30 Q156,38 154,56
              Q134,62 100,62 Q66,62 46,56 Z" fill="#1E293B" stroke="#0F172A" stroke-width="0.6"/>
      <!-- Flat board — large diamond shape for 3D perspective -->
      <polygon points="100,8 168,34 100,54 32,34" fill="#1E293B" stroke="#0F172A" stroke-width="0.8"/>
      <!-- Board top highlight for depth -->
      <polygon points="100,11 164,34 100,52 36,34" fill="#334155" opacity="0.3"/>
      <!-- Button on top center -->
      <circle cx="100" cy="32" r="3.5" fill="#475569" stroke="#0F172A" stroke-width="0.8"/>
      <!-- Tassel string from center button draping to right -->
      <path d="M100,32 Q124,24 144,32 Q158,44 160,62" fill="none" stroke="#EAB308" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Tassel end fringe -->
      <line x1="158" y1="60" x2="156" y2="70" stroke="#EAB308" stroke-width="1.2"/>
      <line x1="160" y1="62" x2="159" y2="72" stroke="#EAB308" stroke-width="1.2"/>
      <line x1="162" y1="61" x2="162" y2="71" stroke="#EAB308" stroke-width="1.2"/>
      <line x1="159" y1="71" x2="159" y2="77" stroke="#CA8A04" stroke-width="1.5"/>`,
  },

  // ─── Chef: Double-breasted white jacket, tall toque ─
  chef: {
    body: `
      <!-- White chef jacket -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#FEFEFE"/>
      <!-- Mandarin collar -->
      <rect x="86" y="138" width="28" height="8" rx="3" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>
      <!-- Double-breasted buttons (left row) -->
      <circle cx="88" cy="162" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <circle cx="88" cy="174" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <circle cx="88" cy="186" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <!-- Right row -->
      <circle cx="96" cy="162" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <circle cx="96" cy="174" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <circle cx="96" cy="186" r="2" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="0.8"/>
      <!-- Center front seam -->
      <line x1="100" y1="146" x2="100" y2="200" stroke="#E2E8F0" stroke-width="0.8"/>`,
    accessory: `
      <!-- Chef toque blanche — tall puffy hat -->
      <!-- Band at forehead — spans full head width -->
      <rect x="46" y="40" width="108" height="16" rx="5" fill="#FEFEFE" stroke="#E2E8F0" stroke-width="1.2"/>
      <!-- Tall puffy toque body -->
      <path d="M54,48 C48,38 44,24 44,10
               C44,-6 54,-20 68,-28
               C80,-35 90,-38 100,-38
               C110,-38 120,-35 132,-28
               C146,-20 156,-6 156,10
               C156,24 152,38 146,48 Z"
            fill="#FEFEFE" stroke="#E2E8F0" stroke-width="1"/>
      <!-- Puffy top crown — overlapping rounded bumps -->
      <ellipse cx="78" cy="-26" rx="24" ry="16" fill="#FEFEFE"/>
      <ellipse cx="122" cy="-26" rx="24" ry="16" fill="#FEFEFE"/>
      <ellipse cx="100" cy="-32" rx="26" ry="16" fill="#FEFEFE"/>
      <!-- Subtle pleat lines -->
      <path d="M76,46 Q68,16 76,-16" stroke="#F0F0F0" stroke-width="0.7" fill="none"/>
      <path d="M100,46 L100,-28" stroke="#F0F0F0" stroke-width="0.7" fill="none"/>
      <path d="M124,46 Q132,16 124,-16" stroke="#F0F0F0" stroke-width="0.7" fill="none"/>`,
  },

  // ─── Police: Navy uniform, cap with badge ───────────
  police: {
    body: `
      <!-- Navy uniform -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#1E3A8A"/>
      <!-- Collar -->
      <path d="M86,140 L82,148 L92,152 L100,148 L108,152 L118,148 L114,140"
            fill="#1E40AF" stroke="#1E3A8A" stroke-width="0.8"/>
      <!-- Shoulder epaulettes -->
      <rect x="52" y="148" width="18" height="5" rx="2" fill="#1E40AF" stroke="#2563EB" stroke-width="0.8"/>
      <rect x="130" y="148" width="18" height="5" rx="2" fill="#1E40AF" stroke="#2563EB" stroke-width="0.8"/>
      <!-- Badge (left breast) -->
      <g transform="translate(82,168)">
        <polygon points="0,-6 1.5,-2 5.5,-2 2.5,0.5 3.5,4.5 0,2 -3.5,4.5 -2.5,0.5 -5.5,-2 -1.5,-2"
                 fill="#EAB308" stroke="#CA8A04" stroke-width="0.5"/>
      </g>
      <!-- Buttons down front -->
      <circle cx="100" cy="175" r="1.5" fill="#D4D4D8"/>
      <circle cx="100" cy="185" r="1.5" fill="#D4D4D8"/>
      <circle cx="100" cy="195" r="1.5" fill="#D4D4D8"/>
      <!-- Breast pockets -->
      <path d="M76,162 L76,172 L88,172" fill="none" stroke="#1E40AF" stroke-width="1"/>
      <path d="M124,162 L124,172 L112,172" fill="none" stroke="#1E40AF" stroke-width="1"/>`,
    accessory: `
      <!-- Hair cover -->
      <ellipse cx="100" cy="54" rx="56" ry="20" fill="#1E3A8A"/>
      <!-- Police cap — crown -->
      <path d="M50,54 L50,40 Q50,20 100,16 Q150,20 150,40 L150,54 Z" fill="#1E3A8A"/>
      <!-- Cap band -->
      <rect x="50" y="46" width="100" height="8" rx="0" fill="#1E40AF"/>
      <!-- Cap badge -->
      <g transform="translate(100,44)">
        <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2"
                 fill="#EAB308"/>
      </g>
      <!-- Cap brim (visor) -->
      <path d="M46,54 Q46,62 100,66 Q154,62 154,54 Z" fill="#111827"/>`,
  },

  // ─── Astronaut: Silver/white space suit, glass helmet ──
  astronaut: {
    body: `
      <!-- Neck cover — hides skin-tone neck behind collar -->
      <rect x="82" y="130" width="36" height="20" rx="6" fill="#CFD8DC"/>
      <!-- Bulky space suit -->
      <path d="M22,200 Q22,155 50,147 Q72,140 88,138
              L88,142 Q92,146 100,146 Q108,146 112,142 L112,138
              Q128,140 150,147 Q178,155 178,200 Z" fill="#CFD8DC"/>
      <!-- Suit seam lines -->
      <line x1="60" y1="148" x2="52" y2="200" stroke="#B0BEC5" stroke-width="1.2"/>
      <line x1="140" y1="148" x2="148" y2="200" stroke="#B0BEC5" stroke-width="1.2"/>
      <!-- Chest plate -->
      <rect x="76" y="148" width="48" height="34" rx="8" fill="#B0BEC5" stroke="#90A4AE" stroke-width="1.2"/>
      <!-- Status lights on chest -->
      <circle cx="90" cy="157" r="2.5" fill="#4ADE80"/>
      <circle cx="110" cy="157" r="2.5" fill="#60A5FA"/>
      <!-- Mission patch (left shoulder) -->
      <path d="M42,153 L50,150 L58,153 L50,162 Z" fill="#1E3A5F" stroke="#BBB" stroke-width="0.5"/>
      <path d="M46,154 L50,152 L54,154" fill="none" stroke="#60A5FA" stroke-width="0.8"/>
      <!-- Agency logo patch (right shoulder) -->
      <circle cx="155" cy="159" r="7" fill="#1E3A5F" stroke="#BBB" stroke-width="0.5"/>
      <circle cx="155" cy="159" r="4" fill="none" stroke="#60A5FA" stroke-width="0.8"/>
      <!-- Collar ring -->
      <ellipse cx="100" cy="141" rx="30" ry="9" fill="#607D8B"/>
      <ellipse cx="100" cy="139" rx="28" ry="7" fill="#78909C"/>
      <ellipse cx="100" cy="137" rx="24" ry="5" fill="#90A4AE"/>`,
    accessory: `
      <!-- Helmet dome -->
      <ellipse cx="100" cy="78" rx="60" ry="64" fill="#CFD8DC" opacity="0.30"/>
      <!-- Helmet outer rim -->
      <ellipse cx="100" cy="78" rx="60" ry="64" fill="none"
               stroke="#78909C" stroke-width="4"/>
      <!-- Visor glass reflection -->
      <path d="M64,52 Q74,36 90,40" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" opacity="0.40"/>
      <!-- Side bolts -->
      <circle cx="42" cy="88" r="4" fill="#546E7A" stroke="#455A64" stroke-width="1"/>
      <circle cx="158" cy="88" r="4" fill="#546E7A" stroke="#455A64" stroke-width="1"/>
      <!-- Antenna -->
      <line x1="78" y1="14" x2="78" y2="-6" stroke="#78909C" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="78" cy="-8" r="3" fill="#EF4444" stroke="#DC2626" stroke-width="0.8"/>`,
  },

  // ─── Artist: Striped shirt, apron, beret + brush ─────
  artist: {
    body: `
      <!-- Dark striped undershirt -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#1C1C1C"/>
      <!-- Horizontal stripes on shirt -->
      <line x1="42" y1="168" x2="158" y2="168" stroke="#333" stroke-width="2"/>
      <line x1="36" y1="180" x2="164" y2="180" stroke="#333" stroke-width="2"/>
      <line x1="34" y1="192" x2="166" y2="192" stroke="#333" stroke-width="2"/>
      <!-- Canvas-colored apron over shirt -->
      <path d="M72,152 L72,200 L128,200 L128,152
              Q128,148 120,148 L100,148 L80,148 Q72,148 72,152 Z" fill="#E8DCCA"/>
      <!-- Apron neck strap (V-shape) -->
      <path d="M88,140 L80,148" stroke="#D4C4A8" stroke-width="2" stroke-linecap="round"/>
      <path d="M112,140 L120,148" stroke="#D4C4A8" stroke-width="2" stroke-linecap="round"/>
      <!-- Apron pocket -->
      <rect x="84" y="170" width="32" height="16" rx="2" fill="none" stroke="#C4B498" stroke-width="1"/>
      <!-- Paintbrush in pocket -->
      <line x1="92" y1="163" x2="92" y2="172" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/>
      <rect x="90" y="160" width="4" height="5" rx="1" fill="#3B82F6"/>
      <!-- Paint smudge on apron — natural drip shapes -->
      <path d="M110,175 Q112,173 114,176 Q113,178 110,177 Z" fill="#EF4444" opacity="0.6"/>
      <path d="M78,188 Q80,186 83,188 Q82,191 79,190 Z" fill="#7C3AED" opacity="0.5"/>
      <circle cx="120" cy="190" r="2" fill="#FBBF24" opacity="0.5"/>`,
    accessory: `
      <!-- Hair cover -->
      <ellipse cx="100" cy="54" rx="56" ry="20" fill="#DC2626"/>
      <!-- Beret — classic flat shape sitting on head -->
      <path d="M50,54 Q50,36 70,28 Q86,22 100,22 Q120,22 140,30 Q156,38 156,54 Z" fill="#DC2626"/>
      <!-- Beret puff — floppy top drooping to the right -->
      <path d="M100,22 Q120,14 145,18 Q164,24 162,38 Q160,48 156,54
              Q152,40 130,30 Q110,22 100,22 Z" fill="#EF4444"/>
      <!-- Band (rim that hugs the forehead) -->
      <path d="M50,54 Q50,60 100,62 Q150,60 156,54" fill="none"
            stroke="#B91C1C" stroke-width="2.5"/>
      <!-- Nub on top -->
      <circle cx="138" cy="20" r="3.5" fill="#B91C1C"/>`,
  },

  // ─── Business: Black suit, white shirt, red tie ─────
  business: {
    body: `
      <!-- White dress shirt -->
      <path d="M30,200 Q30,158 55,150 Q75,143 88,140
              L88,145 Q90,148 100,148 Q110,148 112,145 L112,140
              Q125,143 145,150 Q170,158 170,200 Z" fill="#F8FAFC"/>
      <!-- Shirt collar -->
      <path d="M86,140 L80,150 L94,150 Z" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="0.5"/>
      <path d="M114,140 L120,150 L106,150 Z" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="0.5"/>
      <!-- Suit jacket -->
      <path d="M30,200 Q30,158 55,150 Q66,146 76,143
              L82,152 L88,200 Z" fill="#1C1C1C"/>
      <path d="M170,200 Q170,158 145,150 Q134,146 124,143
              L118,152 L112,200 Z" fill="#1C1C1C"/>
      <!-- Lapels (V-shape) -->
      <path d="M76,143 L86,158 L82,152" fill="#27272A" stroke="#333" stroke-width="0.5"/>
      <path d="M124,143 L114,158 L118,152" fill="#27272A" stroke="#333" stroke-width="0.5"/>
      <!-- Suit button -->
      <circle cx="88" cy="175" r="2" fill="#3F3F46"/>
      <circle cx="112" cy="175" r="2" fill="#3F3F46"/>
      <!-- Necktie -->
      <path d="M96,148 L100,150 L104,148 L100,146 Z" fill="#DC2626"/>
      <path d="M97,150 L100,152 L103,150 L103.5,150" fill="#DC2626"/>
      <polygon points="100,152 95,200 105,200" fill="#DC2626"/>
      <!-- Tie knot -->
      <path d="M97,148 L100,151 L103,148" fill="#B91C1C"/>
      <!-- Tie stripe detail -->
      <line x1="97" y1="165" x2="103" y2="162" stroke="#991B1B" stroke-width="1"/>
      <line x1="97" y1="175" x2="103" y2="172" stroke="#991B1B" stroke-width="1"/>
      <line x1="97" y1="185" x2="103" y2="182" stroke="#991B1B" stroke-width="1"/>`,
    accessory: ``,
  },
};
