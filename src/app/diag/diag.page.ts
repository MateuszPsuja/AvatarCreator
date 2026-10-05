// Diagnostic view — the face outline drawn over the artwork.
//
// Every beard style, for both head shapes, with the true face ellipse in red
// dashes and red tick-lines at four rows showing the real jaw width. This
// exists because "the beard has a gap" is not a diagnosable report on its
// own: it could be an edge falling short, an edge overhanging, or a band
// that is detached from the face entirely, and those need different fixes.
// The overlay turns it into a measurement instead of a guess.
//
// The palette rides in the svg's style attribute, so the innerHTML binding
// must bypass the sanitizer — otherwise Angular strips the style, every
// var(--skin-base) goes undefined, and every avatar paints black.
import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
  buildAvatarSvg,
  faceFor,
  type BeardStyle,
  type Gender,
  type FaceGeometry,
} from '@avatar-workspace/avatar-shared';

@Component({
  selector: 'app-diag-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap">
      @for (row of cells; track row.id) {
        <figure>
          <div [innerHTML]="row.svg"></div>
          <figcaption>{{ row.id }}</figcaption>
        </figure>
      }
    </div>
  `,
  styles: [
    `
    .wrap {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 8px;
      background: #fff;
    }
    figure { margin: 0; }
    figcaption {
      font: 11px ui-monospace, monospace;
      text-align: center;
      color: #000;
      background: #eee;
    }
  `,
  ],
})
export class DiagPageComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly cells: { id: string; svg: unknown }[] = [];

  constructor() {
    const base = {
      id: 'd',
      name: 'D',
      skinTone: 'light',
      hairColor: 'brown',
      eyeColor: 'brown',
      mustache: 'none',
      eyeStyle: 'round',
      glasses: 'none',
      profession: 'none',
      haircut: 'short',
    };
    const beards: BeardStyle[] = ['stubble', 'short', 'long', 'goatee'];
    for (const gender of ['man', 'woman'] as Gender[]) {
      for (const beard of beards) {
        const config = { ...base, gender, beard } as never;
        this.cells.push({
          id: `${gender} / ${beard}`,
          svg: this.sanitizer.bypassSecurityTrustHtml(
            this.withFaceOutline(buildAvatarSvg(config), faceFor(gender)),
          ),
        });
      }
    }
  }

  /** Overlays the true face outline so any deviation is obvious. */
  private withFaceOutline(svg: string, face: FaceGeometry): string {
    const outline =
      `<ellipse cx="${face.cx}" cy="${face.cy}" rx="${face.rx}" ry="${face.ry}" ` +
      `fill="none" stroke="#E11D48" stroke-width="0.75" stroke-dasharray="3 2"/>` +
      // jaw width at several rows, to show where the beard edge should be
      [0.2, 0.4, 0.6, 0.8]
        .map((t) => {
          const y = face.cy + face.ry * t;
          const hw = face.rx * Math.sqrt(Math.max(0, 1 - t * t));
          return (
            `<line x1="${face.cx - hw}" y1="${y}" x2="${face.cx + hw}" y2="${y}" ` +
            `stroke="#E11D48" stroke-width="0.4" stroke-dasharray="2 2"/>`
          );
        })
        .join('');
    return svg.replace('</svg>', `${outline}</svg>`);
  }
}
