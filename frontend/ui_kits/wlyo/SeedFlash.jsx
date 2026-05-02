// SeedFlash.jsx

function SeedFlash({ seedMeme, onDone, reducedMotion }) {
  const game = window.BRAINROT_GAME;
  const [phase, setPhase] = React.useState('blip');
  const [imageFailed, setImageFailed] = React.useState(false);
  const meme = React.useMemo(() => seedMeme || game.pickSeed(), [game, seedMeme]);

  React.useEffect(() => {
    if (phase === 'blip') {
      const t = setTimeout(() => setPhase('flash'), reducedMotion ? 120 : 520);
      return () => clearTimeout(t);
    }
    if (phase === 'flash') {
      const t = setTimeout(() => setPhase('black'), reducedMotion ? 240 : 700);
      return () => clearTimeout(t);
    }
    if (phase === 'black') {
      const t = setTimeout(() => onDone(meme), reducedMotion ? 120 : 260);
      return () => clearTimeout(t);
    }
  }, [phase, meme, onDone, reducedMotion]);

  const flashStyles = {
    screen: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#08070f',
      position: 'relative',
      overflow: 'hidden',
    },
    blip: {
      fontFamily: "'Bagel Fat One', cursive",
      fontSize: 'clamp(42px, 11vw, 118px)',
      color: '#ff9f1c',
      textShadow: '0 0 34px rgba(255,159,28,0.5)',
      letterSpacing: 0,
      transform: phase === 'blip' ? 'scale(1)' : 'scale(0.92)',
      opacity: phase === 'blip' ? 1 : 0,
      transition: 'opacity 120ms ease-out, transform 120ms ease-out',
    },
    image: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: reducedMotion ? 'contrast(1.08)' : 'contrast(1.12) saturate(1.2)',
      transform: phase === 'flash' && !reducedMotion ? 'scale(1.04)' : 'scale(1)',
      transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
    },
    fallback: {
      position: 'absolute',
      inset: '10%',
      border: `3px solid ${meme.era === 'genalpha' ? '#ff2bd6' : '#00f0ff'}`,
      background: 'radial-gradient(circle at 50% 45%, rgba(255,43,214,0.22), rgba(8,7,15,0.95))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Bagel Fat One', cursive",
      fontSize: 'clamp(34px, 8vw, 82px)',
      color: '#f7f0ff',
      textAlign: 'center',
      padding: 24,
    },
    blackText: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 13,
      fontWeight: 700,
      color: 'rgba(185,174,232,0.38)',
      textTransform: 'uppercase',
      letterSpacing: 0,
    },
    flashMask: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 50% 50%, transparent 0 42%, rgba(8,7,15,0.28) 72%)',
      boxShadow: 'inset 0 0 80px rgba(255,43,214,0.24)',
      pointerEvents: 'none',
    },
  };

  return React.createElement('div', { style: flashStyles.screen },
    phase === 'blip' && React.createElement('div', { style: flashStyles.blip }, 'LOCK IN'),
    phase === 'flash' && !imageFailed && React.createElement('img', {
      src: meme.image,
      alt: '',
      style: flashStyles.image,
      onError: () => setImageFailed(true),
    }),
    phase === 'flash' && imageFailed && React.createElement('div', { style: flashStyles.fallback }, meme.canonical),
    phase === 'flash' && React.createElement('div', { style: flashStyles.flashMask }),
    phase === 'black' && React.createElement('div', { style: flashStyles.blackText }, 'memory corrupted'),
  );
}

Object.assign(window, { SeedFlash });
