// ── Circle of fifths SVG wheel ──────────────────────────────────────────
import { POSITIONS, keyAt } from './theory.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CX = 160;
const CY = 160;
const R_MINOR_IN = 66;
const R_MINOR_OUT = 111;
const R_MAJOR_IN = 114;
const R_MAJOR_OUT = 152;
const GAP_DEG = 1.4; // angular gap carved out of each wedge for separation

function el(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}

function angleForPosition(p) {
  return -90 + p * 30; // degrees; 0 = C at top, clockwise
}

function point(r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function donutSlicePath(r0, r1, a0, a1) {
  const [x1, y1] = point(r1, a0);
  const [x2, y2] = point(r1, a1);
  const [x3, y3] = point(r0, a1);
  const [x4, y4] = point(r0, a0);
  return `M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 0 0 ${x4} ${y4} Z`;
}

export function createWheel(container, { onSelect }) {
  const svg = el('svg', {
    viewBox: `0 0 320 320`,
    role: 'group',
    'aria-label': 'Circle of fifths — select a key',
  });

  const wedges = [];

  for (let p = 0; p < 12; p++) {
    const a0 = angleForPosition(p) - 15 + GAP_DEG / 2;
    const a1 = angleForPosition(p) + 15 - GAP_DEG / 2;

    const g = el('g', {
      class: 'wedge',
      tabindex: '0',
      role: 'button',
      'data-position': String(p),
    });

    const majorSlice = el('path', {
      class: 'major-slice',
      d: donutSlicePath(R_MAJOR_IN, R_MAJOR_OUT, a0, a1),
    });
    const minorSlice = el('path', {
      class: 'minor-slice',
      d: donutSlicePath(R_MINOR_IN, R_MINOR_OUT, a0, a1),
    });

    const [mx, my] = point((R_MAJOR_IN + R_MAJOR_OUT) / 2, angleForPosition(p));
    const [nx, ny] = point((R_MINOR_IN + R_MINOR_OUT) / 2, angleForPosition(p));

    const majorLabel = el('text', {
      class: 'major-label',
      x: mx, y: my,
      'text-anchor': 'middle', 'dominant-baseline': 'central',
    });
    const minorLabel = el('text', {
      class: 'minor-label',
      x: nx, y: ny,
      'text-anchor': 'middle', 'dominant-baseline': 'central',
    });

    g.append(majorSlice, minorSlice, majorLabel, minorLabel);
    svg.appendChild(g);

    const select = () => onSelect(p);
    g.addEventListener('click', select);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
    });

    wedges.push({ position: p, g, majorLabel, minorLabel });
  }

  // Center readout
  const centerName = el('text', {
    class: 'wheel-center-name', x: CX, y: CY - 6,
    'text-anchor': 'middle', 'dominant-baseline': 'central',
  });
  const centerSub = el('text', {
    class: 'wheel-center-sub', x: CX, y: CY + 16,
    'text-anchor': 'middle', 'dominant-baseline': 'central',
  });
  svg.append(centerName, centerSub);

  container.appendChild(svg);

  function render({ position, mode }) {
    const dominant = (position + 1) % 12;
    const subdominant = (position + 11) % 12;

    wedges.forEach(({ position: p, g, majorLabel, minorLabel }) => {
      const k = keyAt(p, mode);
      majorLabel.textContent = k.name;
      minorLabel.textContent = `${k.minor}m`;

      g.classList.toggle('selected', p === position);
      g.classList.toggle('dominant', p === dominant);
      g.classList.toggle('subdominant', p === subdominant);
      g.setAttribute('aria-label', `Select ${k.name} major`);
      g.setAttribute('aria-pressed', String(p === position));
    });

    const selected = keyAt(position, mode);
    centerName.textContent = selected.name;
    centerSub.textContent = 'MAJOR';
  }

  return { render };
}
