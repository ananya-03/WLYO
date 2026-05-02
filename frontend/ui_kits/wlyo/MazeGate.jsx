// MazeGate.jsx

function GatePips({ current, total }) {
  return React.createElement('div', { className: 'gate-pips', 'aria-label': `Gate ${current + 1} of ${total}` },
    Array.from({ length: total }, (_, i) => React.createElement('span', {
      key: i,
      className: `gate-pip ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`,
    }))
  );
}

function AudioWave({ playing, unavailable }) {
  return React.createElement('div', { className: `audio-wave ${playing ? 'playing' : ''} ${unavailable ? 'unavailable' : ''}` },
    Array.from({ length: 18 }, (_, i) => React.createElement('span', {
      key: i,
      style: { '--bar-delay': `${i * 42}ms` },
    }))
  );
}

function MazeAvatar() {
  return React.createElement('div', { className: 'maze-avatar', 'aria-label': 'Player avatar' },
    React.createElement('span', { className: 'avatar-head' }),
    React.createElement('span', { className: 'avatar-body' }),
    React.createElement('span', { className: 'avatar-leg left' }),
    React.createElement('span', { className: 'avatar-leg right' })
  );
}

function MazeBoard({ layout, run, gateIndex, reducedMotion }) {
  const nextNode = layout.nodes[Math.min(gateIndex + 1, layout.nodes.length - 1)];
  const pathKeys = new Set(run.path.flatMap((step) => [
    `${step.from?.x},${step.from?.y}`,
    `${step.to?.x},${step.to?.y}`,
  ]));
  const nodeKeys = new Set(layout.nodes.map((node) => `${node.x},${node.y}`));
  const avatar = run.avatar || layout.start;

  return React.createElement('section', { className: 'maze-board-wrap', 'aria-label': 'Top down brainrot maze' },
    React.createElement('div', {
      className: `maze-board ${reducedMotion ? 'reduce-motion' : ''}`,
      style: {
        '--cols': layout.width,
        '--rows': layout.height,
        '--avatar-x': avatar.x,
        '--avatar-y': avatar.y,
        '--next-x': nextNode.x,
        '--next-y': nextNode.y,
      },
    },
      layout.walls.flatMap((row, y) => row.map((cell, x) => {
        const key = `${x},${y}`;
        const classes = [
          'maze-cell',
          cell ? 'floor' : 'wall',
          pathKeys.has(key) ? 'walked' : '',
          nodeKeys.has(key) ? 'node' : '',
          nextNode.x === x && nextNode.y === y ? 'next-node' : '',
        ].filter(Boolean).join(' ');
        return React.createElement('span', { key, className: classes });
      })),
      React.createElement('div', { className: 'next-pulse', 'aria-hidden': true }),
      React.createElement(MazeAvatar)
    ),
    React.createElement('div', { className: 'maze-caption' },
      React.createElement('span', {}, `Node ${gateIndex + 1}`),
      React.createElement('strong', {}, nextNode.label)
    )
  );
}

function ChallengeArtifact({ decision, playing, unavailable, onPlay }) {
  if (decision.kind === 'audio_match_meme') {
    return React.createElement('div', { className: 'challenge-artifact audio-lock' },
      React.createElement(AudioWave, { playing, unavailable }),
      React.createElement('button', { type: 'button', className: 'audio-btn', onClick: onPlay },
        playing ? 'Playing Clip' : 'Play Gate Clip'
      ),
      unavailable && React.createElement('div', { className: 'fallback-copy' }, decision.fallbackPrompt)
    );
  }

  return React.createElement('div', { className: 'challenge-artifact image-lock' },
    React.createElement('img', { src: decision.image, alt: decision.meme.canonical }),
    React.createElement('span', {}, decision.kind === 'meme_match_era' ? 'Era lock' : 'Name lock')
  );
}

function MazeGate({ gateIndex, totalGates, run, onAnswer, onReplay, onToast, reducedMotion }) {
  const game = window.BRAINROT_GAME;
  const decision = React.useMemo(
    () => game.buildDecisionGame(gateIndex, run),
    [game, gateIndex, run.seedMeme.id, run.replays]
  );
  const [selected, setSelected] = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const [audioUnavailable, setAudioUnavailable] = React.useState(false);
  const audioRef = React.useRef(null);

  React.useEffect(() => {
    setSelected(null);
    setPlaying(false);
    setAudioUnavailable(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [decision.id, gateIndex]);

  React.useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const playAudio = () => {
    const src = decision.audio?.audio;
    if (!src || typeof Audio === 'undefined') {
      setAudioUnavailable(true);
      onToast?.('Signal cooked');
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const clip = new Audio(src);
    audioRef.current = clip;
    setPlaying(true);
    clip.addEventListener('ended', () => setPlaying(false), { once: true });
    clip.addEventListener('error', () => {
      setAudioUnavailable(true);
      setPlaying(false);
      onToast?.('Clip got fanum taxed');
    }, { once: true });
    const playPromise = clip.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        setAudioUnavailable(true);
        setPlaying(false);
        onToast?.('Visual gate unlocked instead');
      });
    }
  };

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option.id);
    onToast?.(option.timelineCopy || 'corridor unlocked');
    setTimeout(() => onAnswer(decision, option), reducedMotion ? 120 : 460);
  };

  return React.createElement('main', { className: `maze-screen ${selected ? 'is-selected' : ''} ${reducedMotion ? 'reduce-motion' : ''}` },
    React.createElement('style', {}, `
      .maze-screen {
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
        background:
          radial-gradient(circle at 18% 24%, rgba(255,43,214,0.16), transparent 28%),
          radial-gradient(circle at 76% 70%, rgba(0,240,255,0.14), transparent 32%),
          #08070f;
        color: #f7f0ff;
        position: relative;
        padding: clamp(14px, 3vw, 30px);
        display: grid;
        place-items: center;
      }
      .maze-screen::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,43,214,0.04) 1px, transparent 1px);
        background-size: 44px 44px;
        opacity: 0.7;
      }
      .maze-stage {
        position: relative;
        z-index: 1;
        width: min(100%, 1180px);
        display: grid;
        grid-template-columns: minmax(360px, 1.05fr) minmax(360px, 0.95fr);
        gap: clamp(18px, 4vw, 42px);
        align-items: center;
      }
      .maze-board-wrap {
        display: grid;
        gap: 14px;
      }
      .maze-board {
        position: relative;
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        grid-template-rows: repeat(var(--rows), 1fr);
        aspect-ratio: 11 / 7;
        border: 2px solid rgba(0,240,255,0.36);
        border-radius: 10px;
        background: #05040a;
        box-shadow: 0 0 42px rgba(0,240,255,0.16), inset 0 0 48px rgba(255,43,214,0.1);
        overflow: hidden;
      }
      .maze-cell {
        min-width: 0;
        min-height: 0;
        border: 1px solid rgba(185,174,232,0.055);
      }
      .maze-cell.wall {
        background:
          linear-gradient(135deg, rgba(255,43,214,0.14), rgba(0,240,255,0.08)),
          #100b20;
        box-shadow: inset 0 0 14px rgba(0,0,0,0.5);
      }
      .maze-cell.floor {
        background: rgba(21,17,36,0.72);
      }
      .maze-cell.walked {
        background: rgba(57,255,20,0.14);
        box-shadow: inset 0 0 18px rgba(57,255,20,0.18);
      }
      .maze-cell.node {
        background: rgba(0,240,255,0.12);
      }
      .maze-cell.next-node {
        background: rgba(255,159,28,0.18);
        box-shadow: inset 0 0 26px rgba(255,159,28,0.32);
      }
      .next-pulse {
        position: absolute;
        width: calc(100% / var(--cols) * 0.7);
        aspect-ratio: 1;
        left: calc((var(--next-x) + 0.5) * 100% / var(--cols));
        top: calc((var(--next-y) + 0.5) * 100% / var(--rows));
        transform: translate(-50%, -50%);
        border: 2px solid #ff9f1c;
        border-radius: 50%;
        box-shadow: 0 0 24px rgba(255,159,28,0.64);
        animation: portalPulse 1100ms ease-in-out infinite;
      }
      .maze-avatar {
        position: absolute;
        width: calc(100% / var(--cols) * 0.62);
        aspect-ratio: 0.76;
        left: calc((var(--avatar-x) + 0.5) * 100% / var(--cols));
        top: calc((var(--avatar-y) + 0.5) * 100% / var(--rows));
        transform: translate(-50%, -54%);
        transition: left 460ms cubic-bezier(0.22,1,0.36,1), top 460ms cubic-bezier(0.22,1,0.36,1);
        filter: drop-shadow(0 0 12px rgba(57,255,20,0.68));
      }
      .avatar-head, .avatar-body, .avatar-leg {
        position: absolute;
        display: block;
        background: #39ff14;
        border: 2px solid #08070f;
      }
      .avatar-head {
        width: 46%;
        aspect-ratio: 1;
        border-radius: 50%;
        left: 27%;
        top: 0;
      }
      .avatar-body {
        width: 54%;
        height: 46%;
        border-radius: 10px 10px 7px 7px;
        left: 23%;
        top: 34%;
      }
      .avatar-leg {
        width: 22%;
        height: 28%;
        border-radius: 0 0 8px 8px;
        top: 72%;
      }
      .avatar-leg.left { left: 25%; }
      .avatar-leg.right { right: 25%; }
      .maze-caption {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: #b9aee8;
        font: 800 12px/1.2 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      .maze-caption strong {
        color: #ff9f1c;
      }
      .gate-panel {
        border: 1.5px solid rgba(255,43,214,0.34);
        background: linear-gradient(160deg, rgba(21,17,36,0.94), rgba(8,7,15,0.9));
        border-radius: 10px;
        padding: clamp(16px, 3vw, 26px);
        box-shadow: 0 0 36px rgba(255,43,214,0.16);
        display: grid;
        gap: 16px;
      }
      .gate-top {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        align-items: center;
      }
      .gate-kicker {
        color: #ff9f1c;
        font: 900 12px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      .gate-title {
        font-family: 'Bagel Fat One', cursive;
        font-size: clamp(38px, 5.4vw, 72px);
        line-height: 0.9;
        letter-spacing: 0;
        color: #f7f0ff;
        text-shadow: 0 0 28px rgba(255,43,214,0.28);
      }
      .gate-prompt {
        color: #b9aee8;
        font: 800 clamp(15px, 1.8vw, 19px)/1.3 'Space Grotesk', sans-serif;
      }
      .challenge-artifact {
        min-height: 176px;
        border: 1.5px solid rgba(0,240,255,0.3);
        border-radius: 10px;
        background: rgba(8,7,15,0.62);
        overflow: hidden;
        display: grid;
        place-items: center;
        gap: 12px;
        padding: 14px;
      }
      .image-lock {
        position: relative;
        padding: 0;
      }
      .image-lock img {
        width: 100%;
        height: 220px;
        object-fit: cover;
        display: block;
      }
      .image-lock span {
        position: absolute;
        left: 10px;
        bottom: 10px;
        padding: 6px 9px;
        border-radius: 7px;
        background: rgba(8,7,15,0.76);
        color: #00f0ff;
        font: 900 11px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      .audio-wave {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .audio-wave span {
        width: 5px;
        height: 8px;
        border-radius: 3px;
        background: #00f0ff;
        opacity: 0.35;
      }
      .audio-wave.playing span {
        opacity: 1;
        animation: waveLift 620ms ease-in-out infinite;
        animation-delay: var(--bar-delay);
        box-shadow: 0 0 8px rgba(0,240,255,0.55);
      }
      .audio-wave.unavailable span {
        background: #ff9f1c;
      }
      .audio-btn, .replay-btn {
        min-height: 42px;
        border-radius: 8px;
        border: 1.5px solid rgba(0,240,255,0.45);
        background: rgba(0,240,255,0.1);
        color: #00f0ff;
        cursor: pointer;
        font: 900 12px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0;
        padding: 10px 14px;
      }
      .replay-btn {
        border-color: rgba(255,159,28,0.5);
        background: rgba(255,159,28,0.09);
        color: #ff9f1c;
      }
      .fallback-copy {
        color: #ff9f1c;
        font: 800 13px/1.25 'Comic Neue', cursive;
      }
      .option-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .gate-option {
        min-height: 112px;
        border: 1.5px solid rgba(0,240,255,0.28);
        border-radius: 10px;
        background: rgba(21,17,36,0.9);
        color: #f7f0ff;
        padding: 10px;
        display: grid;
        grid-template-columns: 88px 1fr;
        gap: 10px;
        align-items: center;
        cursor: pointer;
        text-align: left;
        transition: transform 180ms cubic-bezier(0.22,1,0.36,1), border-color 180ms ease, box-shadow 180ms ease;
      }
      .gate-option.label-only {
        grid-template-columns: 1fr;
        min-height: 70px;
      }
      .gate-option:hover {
        transform: translateY(-2px);
        border-color: rgba(0,240,255,0.72);
        box-shadow: 0 0 24px rgba(0,240,255,0.2);
      }
      .gate-option.selected {
        border-color: rgba(57,255,20,0.82);
        box-shadow: 0 0 28px rgba(57,255,20,0.28);
        transform: scale(0.97);
      }
      .option-media {
        width: 88px;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        background: radial-gradient(circle at 50% 40%, rgba(255,43,214,0.26), rgba(8,7,15,0.7));
      }
      .option-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .option-label {
        font: 900 clamp(14px, 1.7vw, 17px)/1.08 'Space Grotesk', sans-serif;
      }
      .option-route {
        display: block;
        margin-top: 6px;
        color: #b9aee8;
        font: 800 12px/1.15 'Comic Neue', cursive;
      }
      .seed-row {
        display: grid;
        grid-template-columns: 54px 1fr auto;
        gap: 10px;
        align-items: center;
        border-top: 1px solid rgba(185,174,232,0.12);
        padding-top: 12px;
      }
      .seed-thumb {
        width: 54px;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255,159,28,0.44);
      }
      .seed-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .seed-meta {
        color: #ff9f1c;
        font: 900 10px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
      }
      .seed-name {
        color: #f7f0ff;
        font: 900 13px/1.15 'Space Grotesk', sans-serif;
      }
      .gate-pips {
        display: flex;
        gap: 7px;
        align-items: center;
      }
      .gate-pip {
        width: 11px;
        height: 11px;
        border-radius: 3px;
        border: 1.5px solid rgba(122,111,168,0.72);
        transform: skewX(-8deg);
      }
      .gate-pip.done {
        background: #ff2bd6;
        border-color: #ff2bd6;
        box-shadow: 0 0 8px rgba(255,43,214,0.66);
      }
      .gate-pip.current {
        background: #00f0ff;
        border-color: #00f0ff;
        box-shadow: 0 0 10px rgba(0,240,255,0.72);
        animation: pipBlink 760ms ease-in-out infinite;
      }
      .gate-option:focus-visible, .audio-btn:focus-visible, .replay-btn:focus-visible {
        outline: 3px solid #39ff14;
        outline-offset: 3px;
      }
      @media (max-width: 860px) {
        .maze-screen {
          overflow-y: auto;
          align-items: start;
        }
        .maze-stage {
          grid-template-columns: 1fr;
        }
        .maze-board {
          aspect-ratio: 11 / 8;
        }
        .gate-panel {
          gap: 13px;
        }
        .image-lock img {
          height: 160px;
        }
        .option-grid {
          grid-template-columns: 1fr;
        }
      }
      @keyframes portalPulse {
        0%, 100% { opacity: 0.74; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); }
      }
      @keyframes waveLift {
        0%, 100% { height: 8px; }
        50% { height: 40px; }
      }
      @keyframes pipBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.42; }
      }
      .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
      }
    `),
    React.createElement('section', { className: 'maze-stage' },
      React.createElement(MazeBoard, { layout: game.MAZE_LAYOUT, run, gateIndex, reducedMotion }),
      React.createElement('section', { className: 'gate-panel', 'aria-label': 'Decision gate' },
        React.createElement('div', { className: 'gate-top' },
          React.createElement('div', { className: 'gate-kicker' }, `Gate ${gateIndex + 1} / ${totalGates} - ${decision.portalLabel}`),
          React.createElement(GatePips, { current: gateIndex, total: totalGates })
        ),
        React.createElement('h1', { className: 'gate-title' }, 'Unlock the next gate'),
        React.createElement('p', { className: 'gate-prompt' }, audioUnavailable ? decision.fallbackPrompt : decision.prompt),
        React.createElement(ChallengeArtifact, {
          decision,
          playing,
          unavailable: audioUnavailable,
          onPlay: playAudio,
        }),
        React.createElement('div', { className: 'option-grid' },
          decision.options.map((opt) => React.createElement('div', {
            key: opt.id,
            role: 'button',
            tabIndex: selected ? -1 : 0,
            className: `gate-option ${selected === opt.id ? 'selected' : ''} ${opt.image ? '' : 'label-only'}`,
            'aria-disabled': Boolean(selected),
            onClick: () => handleSelect(opt),
            onKeyDown: (event) => {
              if ((event.key === 'Enter' || event.key === ' ') && !selected) {
                event.preventDefault();
                handleSelect(opt);
              }
            },
          },
            opt.image && React.createElement('div', { className: 'option-media' },
              React.createElement('img', { src: opt.image, alt: opt.label })
            ),
            React.createElement('div', {},
              React.createElement('span', { className: 'option-label' }, opt.label),
              React.createElement('span', { className: 'option-route' }, opt.timelineCopy)
            )
          ))
        ),
        React.createElement('div', { className: 'seed-row' },
          React.createElement('div', { className: 'seed-thumb' },
            React.createElement('img', { src: run.seedMeme.image, alt: run.seedMeme.canonical })
          ),
          React.createElement('div', {},
            React.createElement('div', { className: 'seed-meta' }, 'Seed flash residue'),
            React.createElement('div', { className: 'seed-name' }, run.seedMeme.canonical)
          ),
          React.createElement('button', { type: 'button', className: 'replay-btn', onClick: onReplay }, 'Aura Tax Replay')
        )
      )
    )
  );
}

Object.assign(window, { MazeGate, GatePips, AudioWave, MazeBoard, MazeAvatar });
