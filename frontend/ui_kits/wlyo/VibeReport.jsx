// VibeReport.jsx

function RadarChart({ axes, size = 220 }) {
  const cx = 100;
  const cy = 100;
  const r = 72;
  const items = [
    { label: 'Rizz', color: '#ff2bd6', value: axes.rizz, angle: -90 },
    { label: 'Aura', color: '#00f0ff', value: axes.aura, angle: 0 },
    { label: 'Sigma', color: '#39ff14', value: axes.sigma, angle: 90 },
    { label: 'Era', color: '#ff9f1c', value: axes.era, angle: 180 },
  ];
  const toXY = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
  };
  const points = items.map((item) => toXY(item.angle, (item.value / 100) * r));
  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1].map((scale) => (
    items.map((item) => {
      const point = toXY(item.angle, r * scale);
      return `${point.x},${point.y}`;
    }).join(' ')
  ));

  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 200 200',
    role: 'img',
    'aria-label': 'Rizz Aura Sigma Era radar chart',
  },
    React.createElement('defs', {},
      React.createElement('radialGradient', { id: 'radarFill', cx: '50%', cy: '50%', r: '50%' },
        React.createElement('stop', { offset: '0%', stopColor: '#ff2bd6', stopOpacity: 0.42 }),
        React.createElement('stop', { offset: '100%', stopColor: '#00f0ff', stopOpacity: 0.08 })
      )
    ),
    rings.map((ring, index) => React.createElement('polygon', {
      key: index,
      points: ring,
      fill: 'none',
      stroke: 'rgba(185,174,232,0.16)',
      strokeWidth: 1,
    })),
    items.map((item) => {
      const end = toXY(item.angle, r);
      return React.createElement('line', {
        key: item.label,
        x1: cx,
        y1: cy,
        x2: end.x,
        y2: end.y,
        stroke: 'rgba(185,174,232,0.22)',
        strokeWidth: 1,
      });
    }),
    React.createElement('polygon', {
      points: polygon,
      fill: 'url(#radarFill)',
      stroke: '#ff2bd6',
      strokeWidth: 2.5,
      strokeLinejoin: 'round',
      className: 'radar-poly',
    }),
    points.map((point, index) => React.createElement('circle', {
      key: items[index].label,
      cx: point.x,
      cy: point.y,
      r: 4.5,
      fill: items[index].color,
    })),
    items.map((item) => {
      const label = toXY(item.angle, r + 18);
      return React.createElement('text', {
        key: item.label,
        x: label.x,
        y: label.y + 4,
        textAnchor: 'middle',
        fill: item.color,
        fontSize: 10,
        fontWeight: 800,
        fontFamily: "'Space Grotesk', sans-serif",
      }, item.label);
    })
  );
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function downloadShareSvg(share) {
  const axisRows = Object.entries(share.axes).map(([axis, value], index) => {
    const colors = { rizz: '#ff2bd6', aura: '#00f0ff', sigma: '#39ff14', era: '#ff9f1c' };
    const y = 354 + index * 48;
    return `
      <text x="86" y="${y}" fill="${colors[axis]}" font-family="Space Grotesk, Arial" font-size="24" font-weight="800">${axis.toUpperCase()}</text>
      <rect x="196" y="${y - 20}" width="360" height="14" rx="7" fill="#241d3f"/>
      <rect x="196" y="${y - 20}" width="${Math.round(value * 3.6)}" height="14" rx="7" fill="${colors[axis]}"/>
      <text x="590" y="${y}" fill="#f7f0ff" font-family="Space Grotesk, Arial" font-size="22" font-weight="800">${value}</text>
    `;
  }).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#08070f"/>
      <circle cx="990" cy="150" r="260" fill="#ff2bd6" opacity="0.16"/>
      <circle cx="210" cy="510" r="220" fill="#00f0ff" opacity="0.12"/>
      <rect x="48" y="44" width="1104" height="542" rx="22" fill="#151124" stroke="${share.hero ? '#ff2bd6' : '#00f0ff'}" stroke-width="4"/>
      <text x="84" y="112" fill="#ff9f1c" font-family="Space Grotesk, Arial" font-size="24" font-weight="800">BRAINROT MAZE</text>
      <text x="84" y="188" fill="#f7f0ff" font-family="Arial Black, Impact" font-size="62" font-weight="900">${escapeText(share.title)}</text>
      <text x="84" y="244" fill="#00f0ff" font-family="Space Grotesk, Arial" font-size="34" font-weight="800">Estimated age ${share.estimatedAge} - ${escapeText(share.eraLabel)}</text>
      <text x="84" y="302" fill="#b9aee8" font-family="Comic Sans MS, Arial" font-size="28" font-weight="700">${escapeText(share.roast)}</text>
      ${axisRows}
      <rect x="748" y="116" width="320" height="320" rx="18" fill="#08070f" stroke="#00f0ff" stroke-width="3"/>
      <text x="908" y="284" text-anchor="middle" fill="#f7f0ff" font-family="Arial Black, Impact" font-size="38">${escapeText(share.hero?.canonical || share.eraLabel)}</text>
      <text x="748" y="500" fill="#39ff14" font-family="Space Grotesk, Arial" font-size="30" font-weight="900">${escapeText(share.cta)}</text>
    </svg>
  `;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'brainrot-maze-share-card.svg';
  link.click();
  URL.revokeObjectURL(url);
}

function VibeReport({ run, onRunAgain, reducedMotion }) {
  const game = window.BRAINROT_GAME;
  const share = game.createShareCardData(run);
  const axisColors = { rizz: '#ff2bd6', aura: '#00f0ff', sigma: '#39ff14', era: '#ff9f1c' };
  const axisBlurbs = {
    rizz: 'flirted with the algorithm',
    aura: 'glow survived the maze',
    sigma: 'locked in past reason',
    era: 'timeline drift intensity',
  };

  return React.createElement('main', { className: `report-screen ${reducedMotion ? 'reduce-motion' : ''}` },
    React.createElement('style', {}, `
      .report-screen {
        width: 100%;
        min-height: 100%;
        height: 100%;
        overflow-y: auto;
        background:
          radial-gradient(circle at 18% 16%, rgba(255,43,214,0.16), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(0,240,255,0.14), transparent 28%),
          #08070f;
        color: #f7f0ff;
        padding: clamp(16px, 4vw, 40px);
      }
      .report-stage {
        width: min(100%, 1120px);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
        gap: clamp(18px, 4vw, 42px);
        align-items: start;
      }
      .report-copy {
        display: grid;
        gap: 18px;
      }
      .report-kicker {
        font: 800 12px/1 'Space Grotesk', sans-serif;
        color: #ff9f1c;
        text-transform: uppercase;
        letter-spacing: 0;
      }
      .report-title {
        font-family: 'Bagel Fat One', cursive;
        font-size: clamp(46px, 7vw, 88px);
        line-height: 0.92;
        letter-spacing: 0;
        color: ${share.hero?.era === 'genalpha' ? '#ff2bd6' : '#f7f0ff'};
        text-shadow: 0 0 34px rgba(255,43,214,0.32);
      }
      .age-row {
        font: 900 clamp(20px, 3vw, 34px)/1.1 'Space Grotesk', sans-serif;
        color: #f7f0ff;
      }
      .age-row span {
        color: #00f0ff;
      }
      .radar-panel, .share-card {
        border-radius: 10px;
        border: 1.5px solid rgba(0,240,255,0.3);
        background: rgba(21,17,36,0.86);
        box-shadow: 0 0 34px rgba(0,240,255,0.13);
      }
      .radar-panel {
        display: grid;
        justify-items: center;
        gap: 10px;
        padding: 16px;
      }
      .radar-poly {
        transform-origin: 100px 100px;
        animation: ${reducedMotion ? 'none' : 'radarDraw 700ms cubic-bezier(0.22,1,0.36,1)'};
      }
      .axis-list {
        display: grid;
        gap: 10px;
      }
      .axis-row {
        display: grid;
        grid-template-columns: 58px minmax(0, 1fr) 34px;
        gap: 10px;
        align-items: center;
        border: 1px solid rgba(185,174,232,0.12);
        border-radius: 8px;
        padding: 10px 12px;
        background: rgba(21,17,36,0.78);
      }
      .axis-name {
        font: 900 12px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      .axis-track {
        height: 8px;
        border-radius: 99px;
        background: #241d3f;
        overflow: hidden;
      }
      .axis-fill {
        height: 100%;
        border-radius: 99px;
      }
      .axis-val {
        font: 800 12px/1 'Space Grotesk', sans-serif;
        color: #f7f0ff;
        text-align: right;
      }
      .axis-blurb {
        grid-column: 1 / -1;
        color: #b9aee8;
        font: 700 13px/1.2 'Comic Neue', cursive;
      }
      .path-strip {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .path-thumb {
        width: 58px;
        aspect-ratio: 1;
        border: 1px solid rgba(255,43,214,0.38);
        border-radius: 8px;
        overflow: hidden;
        background: #151124;
      }
      .path-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .share-btn, .run-btn {
        min-height: 48px;
        border-radius: 10px;
        padding: 14px 18px;
        cursor: pointer;
        font: 900 14px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0;
      }
      .share-btn {
        background: #00f0ff;
        color: #08070f;
        border: 0;
        box-shadow: 0 0 26px rgba(0,240,255,0.32);
      }
      .run-btn {
        background: rgba(255,43,214,0.08);
        color: #ff2bd6;
        border: 1.5px solid rgba(255,43,214,0.44);
      }
      .share-btn:focus-visible, .run-btn:focus-visible {
        outline: 3px solid #39ff14;
        outline-offset: 3px;
      }
      .share-card {
        position: sticky;
        top: 18px;
        display: grid;
        gap: 14px;
        padding: clamp(16px, 3vw, 28px);
      }
      .share-card-top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 128px;
        gap: 16px;
        align-items: start;
      }
      .share-brand {
        font: 900 12px/1 'Space Grotesk', sans-serif;
        color: #ff9f1c;
        text-transform: uppercase;
        letter-spacing: 0;
      }
      .share-title {
        margin-top: 8px;
        font-family: 'Bagel Fat One', cursive;
        font-size: clamp(32px, 5vw, 58px);
        line-height: 0.94;
        color: #f7f0ff;
      }
      .share-hero {
        aspect-ratio: 1;
        border-radius: 10px;
        overflow: hidden;
        border: 1.5px solid rgba(255,43,214,0.52);
      }
      .share-hero img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .share-meta {
        font: 900 18px/1.2 'Space Grotesk', sans-serif;
        color: #00f0ff;
      }
      .share-roast {
        font: 800 16px/1.25 'Comic Neue', cursive;
        color: #b9aee8;
      }
      .share-cta {
        color: #39ff14;
        font: 900 14px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      @media (max-width: 860px) {
        .report-stage {
          grid-template-columns: 1fr;
        }
        .share-card {
          position: static;
        }
      }
      @keyframes radarDraw {
        from { transform: scale(0.1); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
      }
    `),
    React.createElement('section', { className: 'report-stage' },
      React.createElement('div', { className: 'report-copy' },
        React.createElement('div', { className: 'report-kicker' }, 'Vibe Report'),
        React.createElement('h1', { className: 'report-title' }, share.title),
        React.createElement('div', { className: 'age-row' },
          'Estimated age ',
          React.createElement('span', {}, share.estimatedAge),
          ' - ',
          share.eraLabel
        ),
        React.createElement('div', { className: 'actions' },
          React.createElement('button', { type: 'button', className: 'share-btn', onClick: () => downloadShareSvg(share) }, 'Download Share Card'),
          React.createElement('button', { type: 'button', className: 'run-btn', onClick: onRunAgain }, 'Run It Back')
        ),
        React.createElement('div', { className: 'radar-panel' },
          React.createElement(RadarChart, { axes: share.axes, size: 236 })
        ),
        React.createElement('div', { className: 'axis-list' },
          Object.entries(share.axes).map(([axis, value]) => React.createElement('div', { key: axis, className: 'axis-row' },
            React.createElement('div', { className: 'axis-name', style: { color: axisColors[axis] } }, axis),
            React.createElement('div', { className: 'axis-track' },
              React.createElement('div', { className: 'axis-fill', style: { width: `${value}%`, background: axisColors[axis] } })
            ),
            React.createElement('div', { className: 'axis-val' }, value),
            React.createElement('div', { className: 'axis-blurb' }, axisBlurbs[axis])
          ))
        ),
        React.createElement('div', { className: 'path-strip', 'aria-label': 'Path summary' },
          share.pathThumbs.map((item, index) => React.createElement('div', { key: `${item.id}-${index}`, className: 'path-thumb' },
            React.createElement('img', { src: item.image, alt: item.canonical })
          ))
        )
      ),
      React.createElement('aside', { className: 'share-card', 'aria-label': 'Share Card preview' },
        React.createElement('div', { className: 'share-card-top' },
          React.createElement('div', {},
            React.createElement('div', { className: 'share-brand' }, share.product),
            React.createElement('div', { className: 'share-title' }, share.title)
          ),
          React.createElement('div', { className: 'share-hero' },
            React.createElement('img', { src: share.hero.image, alt: share.hero.canonical })
          )
        ),
        React.createElement('div', { className: 'share-meta' }, `Age ${share.estimatedAge} - ${share.eraLabel}`),
        React.createElement(RadarChart, { axes: share.axes, size: 210 }),
        React.createElement('p', { className: 'share-roast' }, share.roast),
        React.createElement('div', { className: 'share-cta' }, share.cta)
      )
    )
  );
}

Object.assign(window, { VibeReport, RadarChart });
