// EraRoom.jsx

function EraRoom({ run, onContinue, reducedMotion }) {
  const game = window.BRAINROT_GAME;
  const room = game.deriveEra(run);
  const age = game.estimateAge(run);
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    const timings = reducedMotion ? [80, 80, 80, 80] : [360, 520, 520, 420];
    let total = 0;
    const timers = timings.map((time, index) => {
      total += time;
      return setTimeout(() => setPhase(index + 1), total);
    });
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const styleVars = {
    '--room-color': room.color,
    '--room-accent': room.accent,
  };

  return React.createElement('main', { className: `era-screen ${reducedMotion ? 'reduce-motion' : ''}`, style: styleVars },
    React.createElement('style', {}, `
      .era-screen {
        width: 100%;
        min-height: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        display: grid;
        place-items: center;
        padding: clamp(18px, 4vw, 42px);
        background:
          radial-gradient(circle at 26% 28%, color-mix(in srgb, var(--room-color) 24%, transparent), transparent 32%),
          radial-gradient(circle at 78% 70%, color-mix(in srgb, var(--room-accent) 20%, transparent), transparent 30%),
          #08070f;
      }
      .era-screen::before {
        content: "";
        position: absolute;
        inset: -10%;
        background:
          repeating-linear-gradient(90deg, color-mix(in srgb, var(--room-color) 13%, transparent) 0 1px, transparent 1px 34px),
          repeating-linear-gradient(0deg, rgba(185,174,232,0.05) 0 1px, transparent 1px 30px);
        transform: rotate(-3deg);
        opacity: 0.45;
      }
      .era-stage {
        position: relative;
        z-index: 1;
        width: min(100%, 1040px);
        display: grid;
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
        gap: clamp(18px, 4vw, 42px);
        align-items: center;
      }
      .room-hero {
        aspect-ratio: 4 / 5;
        border-radius: 10px;
        border: 2px solid color-mix(in srgb, var(--room-color) 70%, transparent);
        box-shadow: 0 0 44px color-mix(in srgb, var(--room-color) 34%, transparent);
        overflow: hidden;
        background: #151124;
        transform: ${phase >= 1 ? 'translateY(0) rotate(-1deg)' : 'translateY(22px) rotate(-5deg)'};
        opacity: ${phase >= 1 ? 1 : 0};
        transition: transform 520ms cubic-bezier(0.22,1,0.36,1), opacity 360ms ease;
      }
      .room-hero img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: saturate(1.12) contrast(1.08);
      }
      .room-copy {
        display: grid;
        gap: clamp(14px, 2.4vw, 24px);
      }
      .room-tag {
        font: 800 12px/1.2 'Space Grotesk', sans-serif;
        color: var(--room-accent);
        text-transform: uppercase;
        letter-spacing: 0;
        opacity: ${phase >= 1 ? 1 : 0};
        transform: ${phase >= 1 ? 'translateY(0)' : 'translateY(10px)'};
        transition: all 360ms ease-out;
      }
      .room-title {
        font-family: 'Bagel Fat One', cursive;
        font-size: clamp(50px, 8vw, 102px);
        line-height: 0.9;
        color: var(--room-color);
        letter-spacing: 0;
        text-shadow: 0 0 34px color-mix(in srgb, var(--room-color) 46%, transparent);
        opacity: ${phase >= 2 ? 1 : 0};
        transform: ${phase >= 2 ? 'scale(1)' : 'scale(0.92)'};
        transition: all 460ms cubic-bezier(0.22,1,0.36,1);
      }
      .age-slam {
        width: fit-content;
        border: 1.5px solid color-mix(in srgb, var(--room-accent) 64%, transparent);
        background: color-mix(in srgb, var(--room-accent) 12%, transparent);
        border-radius: 10px;
        padding: 14px 18px;
        font: 800 clamp(18px, 3vw, 30px)/1 'Space Grotesk', sans-serif;
        color: #f7f0ff;
        opacity: ${phase >= 3 ? 1 : 0};
        transform: ${phase >= 3 ? 'translateX(0)' : 'translateX(-18px)'};
        transition: all 360ms ease-out;
      }
      .age-slam strong {
        color: var(--room-accent);
      }
      .room-roast {
        max-width: 38ch;
        font: 800 clamp(16px, 2.3vw, 22px)/1.32 'Comic Neue', cursive;
        color: #f7f0ff;
        opacity: ${phase >= 4 ? 1 : 0};
        transform: ${phase >= 4 ? 'translateY(0)' : 'translateY(12px)'};
        transition: all 360ms ease-out;
      }
      .room-skin {
        font: 700 13px/1.2 'Space Grotesk', sans-serif;
        color: #b9aee8;
        text-transform: uppercase;
      }
      .room-cta {
        width: fit-content;
        min-height: 48px;
        border: 0;
        border-radius: 10px;
        background: var(--room-color);
        color: #08070f;
        padding: 14px 24px;
        cursor: pointer;
        font: 900 14px/1 'Space Grotesk', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0;
        box-shadow: 0 0 28px color-mix(in srgb, var(--room-color) 34%, transparent);
        opacity: ${phase >= 4 ? 1 : 0};
      }
      .room-cta:focus-visible {
        outline: 3px solid #00f0ff;
        outline-offset: 3px;
      }
      @media (max-width: 780px) {
        .era-screen {
          align-items: start;
          overflow-y: auto;
        }
        .era-stage {
          grid-template-columns: 1fr;
        }
        .room-hero {
          aspect-ratio: 16 / 10;
          max-height: 340px;
        }
      }
      .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
      }
    `),
    React.createElement('section', { className: 'era-stage' },
      React.createElement('div', { className: 'room-hero' },
        React.createElement('img', { src: room.hero.image, alt: room.hero.canonical })
      ),
      React.createElement('div', { className: 'room-copy' },
        React.createElement('div', { className: 'room-tag' }, room.tag),
        React.createElement('h1', { className: 'room-title' }, room.label),
        React.createElement('div', { className: 'age-slam' },
          'Estimated age ',
          React.createElement('strong', {}, age)
        ),
        React.createElement('div', { className: 'room-skin' }, room.skin),
        React.createElement('p', { className: 'room-roast' }, room.roast),
        React.createElement('button', { type: 'button', className: 'room-cta', onClick: onContinue }, 'Open Vibe Report')
      )
    )
  );
}

Object.assign(window, { EraRoom });
