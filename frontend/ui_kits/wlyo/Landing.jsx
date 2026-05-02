// Landing.jsx — BRAINROT MAZE Landing Screen

function Landing({ onStart, musicOn, setMusicOn }) {
  const [hovered, setHovered] = React.useState(false);

  const landingStyles = {
    screen: {
      position: 'relative', width: '100%', height: '100%',
      background: '#08070f', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    portalBg: {
      position: 'absolute', inset: 0, zIndex: 0,
      background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,240,255,0.08) 0%, transparent 70%)',
      animation: 'portalDrift 6s ease-in-out infinite',
    },
    ring1: {
      position: 'absolute', borderRadius: '50%',
      width: 420, height: 420,
      border: '1.5px solid rgba(0,240,255,0.12)',
      boxShadow: '0 0 40px rgba(0,240,255,0.06)',
      animation: 'ringPulse 4s ease-in-out infinite',
    },
    ring2: {
      position: 'absolute', borderRadius: '50%',
      width: 280, height: 280,
      border: '1.5px solid rgba(255,43,214,0.15)',
      boxShadow: '0 0 30px rgba(255,43,214,0.07)',
      animation: 'ringPulse 4s ease-in-out infinite 1s',
    },
    ring3: {
      position: 'absolute', borderRadius: '50%',
      width: 160, height: 160,
      border: '1.5px solid rgba(57,255,20,0.1)',
      animation: 'ringPulse 4s ease-in-out infinite 2s',
    },
    content: {
      position: 'relative', zIndex: 2,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 20,
    },
    title: {
      fontFamily: "'Bagel Fat One', cursive",
      fontSize: 72, lineHeight: 0.95,
      color: '#f7f0ff', textAlign: 'center',
      textShadow: '0 0 40px rgba(255,43,214,0.5), 0 0 80px rgba(255,43,214,0.2)',
      letterSpacing: 0,
    },
    titleAccent: { color: '#ff2bd6' },
    question: {
      fontFamily: "'Bagel Fat One', cursive",
      fontSize: 22, color: '#00f0ff',
      textShadow: '0 0 14px rgba(0,240,255,0.5)',
      letterSpacing: 0,
    },
    enterBtn: {
      marginTop: 8,
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700, fontSize: 18,
      letterSpacing: 0, textTransform: 'uppercase',
      background: hovered ? '#ff2bd6' : 'transparent',
      color: hovered ? '#08070f' : '#ff2bd6',
      border: '2px solid #ff2bd6',
      borderRadius: 10,
      padding: '14px 44px',
      cursor: 'pointer',
      boxShadow: hovered ? '0 0 30px rgba(255,43,214,0.7)' : '0 0 16px rgba(255,43,214,0.3)',
      transition: 'all 0.15s cubic-bezier(0.25,1.5,0.5,1)',
      transform: hovered ? 'translateY(-2px) scale(1.03)' : 'scale(1)',
    },
    musicBtn: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700, fontSize: 13,
      letterSpacing: 0, textTransform: 'uppercase',
      background: musicOn ? 'rgba(57,255,20,0.12)' : 'transparent',
      color: musicOn ? '#39ff14' : '#7a6fa8',
      border: `1.5px solid ${musicOn ? 'rgba(57,255,20,0.5)' : 'rgba(122,111,168,0.3)'}`,
      borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
      boxShadow: musicOn ? '0 0 10px rgba(57,255,20,0.25)' : 'none',
      transition: 'all 0.2s',
    },
    footer: {
      position: 'absolute', bottom: 18,
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 11, color: '#7a6fa8',
      letterSpacing: 0,
    },
    particles: {
      position: 'absolute', inset: 0, zIndex: 1,
      pointerEvents: 'none', overflow: 'hidden',
    },
  };

  const particles = React.useMemo(() => (
    Array.from({length: 14}, (_, i) => ({
      id: i,
      char: ['$','$','✦','▲','◆','$','✦'][i % 7],
      x: 5 + (i * 7) % 90,
      y: 10 + (i * 11) % 80,
      size: 10 + (i * 3) % 14,
      delay: i * 0.4,
      color: ['rgba(255,43,214,0.25)','rgba(0,240,255,0.2)','rgba(57,255,20,0.18)','rgba(255,159,28,0.2)'][i % 4],
    }))
  ), []);

  return React.createElement('div', {style: landingStyles.screen},
    React.createElement('style', {}, `
      @keyframes portalDrift {
        0%,100% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.08) translateY(-12px); }
      }
      @keyframes ringPulse {
        0%,100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      @keyframes floatUp {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
        100% { transform: translateY(-120px) rotate(25deg); opacity: 0; }
      }
    `),
    React.createElement('div', {style: landingStyles.portalBg}),
    React.createElement('div', {style: landingStyles.ring1}),
    React.createElement('div', {style: landingStyles.ring2}),
    React.createElement('div', {style: landingStyles.ring3}),
    React.createElement('div', {style: landingStyles.particles},
      particles.map(p => React.createElement('div', {
        key: p.id,
        style: {
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          fontSize: p.size, color: p.color, fontWeight: 700,
          animation: `floatUp ${3 + p.delay}s ease-in infinite`,
          animationDelay: `${p.delay}s`,
        }
      }, p.char))
    ),
    React.createElement('div', {style: landingStyles.content},
      React.createElement('div', {style: landingStyles.title},
        'BRAIN', React.createElement('span', {style: landingStyles.titleAccent}, 'ROT'), React.createElement('br'),
        'MAZE'
      ),
      React.createElement('div', {style: landingStyles.question},
        'How brainrotted are you?'
      ),
      React.createElement('button', {
        style: landingStyles.enterBtn,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onClick: onStart,
      }, 'Enter Maze'),
      React.createElement('button', {
        style: landingStyles.musicBtn,
        onClick: () => setMusicOn(!musicOn),
      }, musicOn ? 'TURN UP ON' : 'TURN UP'),
    ),
    React.createElement('div', {style: landingStyles.footer},
      'memes and sounds belong to their creators · hackathon demo only'
    )
  );
}

Object.assign(window, { Landing });
