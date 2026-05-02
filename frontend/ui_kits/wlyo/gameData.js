(function (global) {
  const ASSET_BASE = global.BRAINROT_ASSET_BASE ?? '/public';

  const ERA_ORDER = ['boomer', 'millennial', 'older_genz', 'genz_core', 'genalpha'];
  const ERA_PULL = {
    boomer: -2,
    millennial: -1,
    older_genz: 0,
    genz_core: 1,
    genalpha: 2,
  };

  function assetUrl(path) {
    if (!path) return '';
    if (/^https?:/.test(path) || path.startsWith('data:')) return path;
    return `${ASSET_BASE}${path}`;
  }

  function meme(id, canonical, era, axes, difficulty = 1) {
    return {
      id,
      canonical,
      era,
      axes,
      difficulty,
      image: assetUrl(`/memes/${id}.webp`),
    };
  }

  function audio(id, canonical, era, audioPath) {
    return {
      id,
      canonical,
      era,
      audio: assetUrl(audioPath || `/audio/${id}.mp3`),
    };
  }

  const MEMES = [
    meme('dancing_baby', 'Dancing Baby', 'boomer', { rizz: 1, aura: 2, sigma: 0 }, 2),
    meme('dial_up_modem', 'Dial-up Modem', 'boomer', { rizz: 0, aura: 1, sigma: 3 }, 2),
    meme('all_your_base', 'All Your Base', 'boomer', { rizz: 0, aura: 1, sigma: 3 }, 2),
    meme('rickroll', 'Rickroll', 'millennial', { rizz: 2, aura: 2, sigma: 1 }, 1),
    meme('trollface', 'Trollface', 'millennial', { rizz: 1, aura: 2, sigma: 2 }, 1),
    meme('numa_numa', 'Numa Numa', 'millennial', { rizz: 2, aura: 3, sigma: 0 }, 2),
    meme('doge', 'Doge', 'older_genz', { rizz: 2, aura: 4, sigma: 1 }, 1),
    meme('harambe', 'Harambe', 'older_genz', { rizz: 1, aura: 4, sigma: 3 }, 2),
    meme('distracted_boyfriend', 'Distracted Boyfriend', 'older_genz', { rizz: 3, aura: 2, sigma: 1 }, 1),
    meme('stonks', 'Stonks', 'genz_core', { rizz: 2, aura: 2, sigma: 5 }, 1),
    meme('among_us', 'Among Us', 'genz_core', { rizz: 2, aura: 3, sigma: 2 }, 1),
    meme('ok_boomer', 'OK Boomer', 'genz_core', { rizz: 3, aura: 3, sigma: 2 }, 1),
    meme('vine_boom', 'Vine Boom', 'genz_core', { rizz: 3, aura: 3, sigma: 2 }, 1),
    meme('skibidi_toilet', 'Skibidi Toilet', 'genalpha', { rizz: 4, aura: 5, sigma: 3 }, 1),
    meme('fanum_tax', 'Fanum Tax', 'genalpha', { rizz: 5, aura: 3, sigma: 4 }, 1),
    meme('what_the_sigma', 'What The Sigma', 'genalpha', { rizz: 4, aura: 2, sigma: 5 }, 1),
    meme('six_seven', '6 7', 'genalpha', { rizz: 5, aura: 4, sigma: 2 }, 1),
    meme('low_taper_fade', 'Low Taper Fade', 'genalpha', { rizz: 4, aura: 4, sigma: 3 }, 1),
    meme('pizza_here', 'AYO THE PIZZA HERE', 'genalpha', { rizz: 4, aura: 5, sigma: 1 }, 1),
  ];

  const MEME_BY_ID = Object.fromEntries(MEMES.map((item) => [item.id, item]));

  const AUDIO_CLIPS = [
    audio('dial_up_modem', 'Dial-up modem handshake', 'boomer'),
    audio('youve_got_mail', "You've Got Mail", 'boomer'),
    audio('rickroll_intro', 'Rickroll Intro', 'millennial'),
    audio('numa_numa', 'Numa Numa Hook', 'millennial'),
    audio('doge_such_wow', 'Doge Such Wow', 'older_genz'),
    audio('harambe', 'Harambe Clip', 'older_genz'),
    audio('vine_boom', 'Vine Boom', 'genz_core'),
    audio('among_us_kill', 'Among Us Kill', 'genz_core'),
    audio('ok_boomer', 'OK Boomer', 'genz_core'),
    audio('skibidi_toilet', 'Skibidi Toilet', 'genalpha'),
    audio('fanum_tax', 'Fanum Tax', 'genalpha'),
    audio('low_taper_fade', 'Low Taper Fade', 'genalpha'),
    audio('six_seven', '6 7 Chant', 'genalpha'),
    audio('ayo_pizza_here', 'AYO THE PIZZA HERE', 'genalpha'),
  ];

  const AUDIO_BY_ID = Object.fromEntries(AUDIO_CLIPS.map((item) => [item.id, item]));

  const SEED_POOL = [
    MEME_BY_ID.dancing_baby,
    MEME_BY_ID.rickroll,
    MEME_BY_ID.doge,
    MEME_BY_ID.among_us,
    MEME_BY_ID.skibidi_toilet,
  ];

  const AUDIO_TO_MEME_ID = {
    dial_up_modem: 'dial_up_modem',
    youve_got_mail: 'dancing_baby',
    rickroll_intro: 'rickroll',
    numa_numa: 'numa_numa',
    doge_such_wow: 'doge',
    harambe: 'harambe',
    vine_boom: 'vine_boom',
    among_us_kill: 'among_us',
    ok_boomer: 'ok_boomer',
    skibidi_toilet: 'skibidi_toilet',
    fanum_tax: 'fanum_tax',
    low_taper_fade: 'low_taper_fade',
    six_seven: 'six_seven',
    ayo_pizza_here: 'pizza_here',
  };

  const ERA_LABELS = {
    boomer: 'Boomer web fossil',
    millennial: 'OG internet core',
    older_genz: 'Older Gen Z relic',
    genz_core: 'Gen Z core',
    genalpha: 'Gen Alpha brainrot',
  };

  const MAZE_LAYOUT = {
    width: 11,
    height: 7,
    start: { x: 1, y: 3 },
    nodes: [
      { id: 'start', x: 1, y: 3, label: 'Spawn' },
      { id: 'n1', x: 3, y: 3, label: 'Seed Echo' },
      { id: 'n2', x: 4, y: 1, label: 'Speaker Bend' },
      { id: 'n3', x: 6, y: 1, label: 'Tax Hall' },
      { id: 'n4', x: 7, y: 3, label: 'Bait Door' },
      { id: 'n5', x: 6, y: 5, label: 'Doge Split' },
      { id: 'n6', x: 8, y: 5, label: 'Era Lock' },
      { id: 'n7', x: 9, y: 3, label: 'Exit Portal' },
    ],
    walls: [
      [0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,1,0,0,0,1,0],
      [0,1,1,1,0,1,1,1,0,1,0],
      [0,0,0,1,0,0,0,1,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0],
    ],
  };

  function option(id, label, eraPull, axisDeltas, props = {}) {
    return {
      id,
      label,
      next: props.next || 'next_gate',
      era_pull: eraPull,
      axis_deltas: axisDeltas,
      timelineCopy: props.timelineCopy,
      memeId: props.memeId,
      image: props.memeId ? MEME_BY_ID[props.memeId]?.image : props.image,
      audioId: props.audioId,
      audio: props.audioId ? AUDIO_BY_ID[props.audioId]?.audio : props.audio,
      era: props.era,
      isAnchor: Boolean(props.isAnchor),
    };
  }

  const MAZE_GATES = [
    {
      id: 'gate_seed_echo',
      layer: 1,
      kind: 'fork_same_era',
      prompt: 'The flash cooked your memory. Pick the closest cursed timeline.',
      portalLabel: 'Seed Echo',
      options: [
        option('dialup', 'Dial-up fossil zone', -2, { rizz: -1, aura: 1, sigma: 4 }, {
          memeId: 'dial_up_modem',
          timelineCopy: 'timeline buffered through dial-up',
        }),
        option('rick', 'Rickroll trapdoor', -1, { rizz: 2, aura: 2, sigma: 1 }, {
          memeId: 'rickroll',
          timelineCopy: 'timeline got rickrolled',
        }),
        option('sus', 'Sus vent route', 1, { rizz: 2, aura: 3, sigma: 2 }, {
          memeId: 'among_us',
          timelineCopy: 'timeline vented forward',
        }),
        option('skibidi', 'Skibidi overload', 2, { rizz: 4, aura: 4, sigma: 3 }, {
          memeId: 'skibidi_toilet',
          timelineCopy: 'timeline lost bathroom privileges',
          isAnchor: true,
        }),
      ],
    },
    {
      id: 'gate_vine_boom',
      layer: 2,
      kind: 'audio_sound_to_meme',
      prompt: 'Audio door. Which meme energy did the speaker cough up?',
      portalLabel: 'Speaker Portal',
      audio: AUDIO_BY_ID.vine_boom,
      fallbackPrompt: 'Signal cooked. Visual gate unlocked instead.',
      options: [
        option('rickroll', 'Rickroll', -1, { rizz: 2, aura: 1, sigma: 1 }, {
          memeId: 'rickroll',
          timelineCopy: 'timeline started singing',
        }),
        option('harambe', 'Harambe', 0, { rizz: 1, aura: 4, sigma: 3 }, {
          memeId: 'harambe',
          timelineCopy: 'timeline paid respects',
        }),
        option('vine', 'Vine Boom', 1, { rizz: 3, aura: 3, sigma: 2 }, {
          memeId: 'stonks',
          timelineCopy: 'timeline hit impact frames',
          isAnchor: true,
        }),
        option('sixseven', '6 7', 2, { rizz: 5, aura: 4, sigma: 2 }, {
          memeId: 'six_seven',
          timelineCopy: 'timeline started counting wrong',
        }),
      ],
    },
    {
      id: 'gate_fanum_origin',
      layer: 3,
      kind: 'fork_origin',
      prompt: 'Where does Fanum Tax pull its rent money from?',
      portalLabel: 'Tax Checkpoint',
      options: [
        option('aol', 'AOL mailbox', -2, { rizz: -1, aura: 1, sigma: 3 }, {
          memeId: 'dancing_baby',
          timelineCopy: 'timeline opened old mail',
        }),
        option('rage', 'Rage-comic basement', -1, { rizz: 1, aura: 2, sigma: 2 }, {
          memeId: 'trollface',
          timelineCopy: 'timeline drew the face',
        }),
        option('kai', 'Kai Cenat stream orbit', 2, { rizz: 5, aura: 3, sigma: 4 }, {
          memeId: 'fanum_tax',
          timelineCopy: 'timeline got taxed instantly',
          isAnchor: true,
        }),
        option('vine', 'Vine graveyard', 1, { rizz: 3, aura: 3, sigma: 1 }, {
          memeId: 'ok_boomer',
          timelineCopy: 'timeline clipped itself',
        }),
      ],
    },
    {
      id: 'gate_rick_audio',
      layer: 4,
      kind: 'audio_meme_to_sound',
      prompt: 'This portal shows the bait. Pick the sound that opens it.',
      portalLabel: 'Bait Door',
      image: MEME_BY_ID.rickroll.image,
      audio: AUDIO_BY_ID.rickroll_intro,
      fallbackPrompt: 'Clip got fanum taxed. Visual route stays open.',
      options: [
        option('dialup', 'Dial-up handshake', -2, { rizz: -1, aura: 1, sigma: 4 }, {
          audioId: 'dial_up_modem',
          timelineCopy: 'timeline screamed in modem',
        }),
        option('rick', 'Never gonna give you up', -1, { rizz: 3, aura: 2, sigma: 1 }, {
          audioId: 'rickroll_intro',
          timelineCopy: 'timeline took the bait',
          memeId: 'rickroll',
          isAnchor: true,
        }),
        option('amongus', 'Emergency meeting sting', 1, { rizz: 2, aura: 3, sigma: 2 }, {
          audioId: 'among_us_kill',
          timelineCopy: 'timeline called meeting',
          memeId: 'among_us',
        }),
        option('skibidi', 'Skibidi loop', 2, { rizz: 4, aura: 5, sigma: 3 }, {
          audioId: 'skibidi_toilet',
          timelineCopy: 'timeline entered the bowl',
          memeId: 'skibidi_toilet',
        }),
      ],
    },
    {
      id: 'gate_phrase_doge',
      layer: 5,
      kind: 'fork_phrase',
      prompt: 'Complete the cursed phrase: Such wow very',
      portalLabel: 'Phrase Fork',
      options: [
        option('mail', 'mail', -2, { rizz: -1, aura: 1, sigma: 3 }, {
          memeId: 'dial_up_modem',
          timelineCopy: 'timeline checked inbox',
        }),
        option('roll', 'roll', -1, { rizz: 2, aura: 1, sigma: 2 }, {
          memeId: 'rickroll',
          timelineCopy: 'timeline baited again',
        }),
        option('doge', 'doge', 0, { rizz: 2, aura: 4, sigma: 1 }, {
          memeId: 'doge',
          timelineCopy: 'timeline spoke fluent doge',
          isAnchor: true,
        }),
        option('sigma', 'sigma', 2, { rizz: 4, aura: 2, sigma: 5 }, {
          memeId: 'what_the_sigma',
          timelineCopy: 'timeline locked in too hard',
        }),
      ],
    },
    {
      id: 'gate_low_taper',
      layer: 6,
      kind: 'audio_lyric_to_era',
      prompt: 'The clip leaks through the wall. Which era owns this curse?',
      portalLabel: 'Era Lock',
      audio: AUDIO_BY_ID.low_taper_fade,
      fallbackPrompt: 'Speaker cooked. Era labels still work.',
      options: [
        option('boomer', 'Boomer web fossil', -2, { rizz: -1, aura: 1, sigma: 4 }, {
          era: 'boomer',
          memeId: 'dancing_baby',
          timelineCopy: 'timeline aged instantly',
        }),
        option('millennial', 'OG internet core', -1, { rizz: 2, aura: 2, sigma: 2 }, {
          era: 'millennial',
          memeId: 'numa_numa',
          timelineCopy: 'timeline remembered forums',
        }),
        option('genz', 'Gen Z core', 1, { rizz: 3, aura: 3, sigma: 2 }, {
          era: 'genz_core',
          memeId: 'stonks',
          timelineCopy: 'timeline went stonks',
        }),
        option('genalpha', 'Gen Alpha brainrot', 2, { rizz: 5, aura: 4, sigma: 4 }, {
          era: 'genalpha',
          memeId: 'low_taper_fade',
          timelineCopy: 'timeline faded lower',
          isAnchor: true,
        }),
      ],
    },
    {
      id: 'gate_exit_portal',
      layer: 7,
      kind: 'fork_origin',
      prompt: 'Final portal. Choose the timeline that feels least safe.',
      portalLabel: 'Exit Portal',
      options: [
        option('base', 'All your base', -2, { rizz: -1, aura: 1, sigma: 5 }, {
          memeId: 'all_your_base',
          timelineCopy: 'timeline returned to base',
        }),
        option('troll', 'Trollface economy', -1, { rizz: 1, aura: 2, sigma: 4 }, {
          memeId: 'trollface',
          timelineCopy: 'timeline fed the troll',
        }),
        option('stonks', 'Stonks elevator', 1, { rizz: 3, aura: 2, sigma: 5 }, {
          memeId: 'stonks',
          timelineCopy: 'timeline bought high',
        }),
        option('pizza', 'Pizza here vortex', 2, { rizz: 5, aura: 5, sigma: 2 }, {
          memeId: 'pizza_here',
          timelineCopy: 'timeline delivered chaos',
          isAnchor: true,
        }),
      ],
    },
  ].map((gate, index, gates) => ({
    ...gate,
    options: gate.options.map((opt) => ({
      ...opt,
      next: index + 1 < gates.length ? gates[index + 1].id : 'era_room',
    })),
  }));

  const ERA_ROOMS = {
    boomer: {
      id: 'boomer',
      label: 'Certified Boomer',
      age: 52,
      tag: 'pre-2005 era detected',
      roast: 'You peaked at dial-up. The browser has moved on.',
      color: '#ffd24a',
      accent: '#ff9f1c',
      hero: MEME_BY_ID.dancing_baby,
      skin: 'dial-up terminal',
    },
    millennial: {
      id: 'millennial',
      label: 'Millennial Coded',
      age: 34,
      tag: '2005-2012 era detected',
      roast: "You got rickrolled and still clicked the link.",
      color: '#6ab4ff',
      accent: '#00f0ff',
      hero: MEME_BY_ID.rickroll,
      skin: 'rage-comic collage',
    },
    older_genz: {
      id: 'older_genz',
      label: 'Elder Zillennial',
      age: 26,
      tag: '2013-2018 era detected',
      roast: 'Your aura still has Doge compression artifacts.',
      color: '#39ff14',
      accent: '#ff2bd6',
      hero: MEME_BY_ID.doge,
      skin: 'internet scrapbook',
    },
    genz_core: {
      id: 'genz_core',
      label: 'Gen Z Core',
      age: 22,
      tag: '2018-2022 era detected',
      roast: 'Your timeline said sus and the portal believed it.',
      color: '#00f0ff',
      accent: '#39ff14',
      hero: MEME_BY_ID.among_us,
      skin: 'stonks command room',
    },
    genalpha: {
      id: 'genalpha',
      label: 'Brainrot Native',
      age: 16,
      tag: '2023-2026 era detected',
      roast: 'Skibidi Ohio Rizz, Sigma Fanum Tax Mewing Bop.',
      color: '#ff2bd6',
      accent: '#39ff14',
      hero: MEME_BY_ID.skibidi_toilet,
      skin: 'sticker spam overload',
    },
  };

  function pickSeed(index) {
    if (Number.isFinite(index)) return SEED_POOL[Math.abs(index) % SEED_POOL.length];
    return SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hashString(value) {
    return String(value).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function pickFrom(items, index) {
    return items[Math.abs(index) % items.length];
  }

  function rotateChoices(items, start, count) {
    return Array.from({ length: count }, (_, offset) => pickFrom(items, start + offset));
  }

  function uniqueById(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function axisFromMeme(memeData, boost = 5) {
    return {
      rizz: Math.max(0, memeData.axes.rizz) + boost,
      aura: Math.max(0, memeData.axes.aura) + boost,
      sigma: Math.max(0, memeData.axes.sigma) + boost,
    };
  }

  function optionFromMeme(memeData, props = {}) {
    return {
      id: props.id || memeData.id,
      label: props.label || memeData.canonical,
      image: props.image === false ? undefined : memeData.image,
      memeId: memeData.id,
      era: memeData.era,
      next: 'next_node',
      era_pull: props.eraPull ?? ERA_PULL[memeData.era] ?? 0,
      axis_deltas: props.axisDeltas || axisFromMeme(memeData),
      timelineCopy: props.timelineCopy || `${memeData.canonical} bends the corridor`,
    };
  }

  function buildMemeChoiceSet(answerMeme, seedValue) {
    const distractors = uniqueById([
      answerMeme,
      ...rotateChoices(MEMES.filter((item) => item.id !== answerMeme.id), seedValue, 12),
    ]);
    return distractors.slice(0, 4);
  }

  function buildDecisionGame(gateIndex, run) {
    const seedValue = hashString(run?.seedMeme?.id || 'seed') + gateIndex * 7 + (run?.replays || 0) * 3;
    const mode = ['meme_match_era', 'audio_match_meme', 'meme_match_name'][gateIndex % 3];

    if (mode === 'audio_match_meme') {
      const audioChoices = AUDIO_CLIPS.filter((clip) => AUDIO_TO_MEME_ID[clip.id] && MEME_BY_ID[AUDIO_TO_MEME_ID[clip.id]]);
      const clip = pickFrom(audioChoices, seedValue);
      const answerMeme = MEME_BY_ID[AUDIO_TO_MEME_ID[clip.id]];
      const choices = buildMemeChoiceSet(answerMeme, seedValue + 2);
      return {
        id: `decision_${gateIndex + 1}`,
        layer: gateIndex + 1,
        kind: 'audio_match_meme',
        portalLabel: 'Audio Lock',
        prompt: 'Audio lock. Play the clip, then step onto the matching meme tile.',
        audio: clip,
        fallbackPrompt: 'Signal cooked. The same meme tiles still open the gate.',
        answerMemeId: answerMeme.id,
        options: choices.map((item) => optionFromMeme(item, {
          timelineCopy: item.id === answerMeme.id ? 'speaker door unlocks' : `${item.canonical} sends you sideways`,
        })),
      };
    }

    if (mode === 'meme_match_name') {
      const target = pickFrom(MEMES, seedValue);
      const choices = buildMemeChoiceSet(target, seedValue + 4);
      return {
        id: `decision_${gateIndex + 1}`,
        layer: gateIndex + 1,
        kind: 'meme_match_name',
        portalLabel: 'Name Gate',
        prompt: 'Name gate. The image blocks the corridor. Pick its real name.',
        meme: target,
        image: target.image,
        answerMemeId: target.id,
        options: choices.map((item) => optionFromMeme(item, {
          image: false,
          label: item.canonical,
          timelineCopy: item.id === target.id ? 'name rune accepts you' : `${item.canonical} warps the path`,
        })),
      };
    }

    const target = pickFrom(MEMES, seedValue);
    const eraChoices = [
      target.era,
      ...rotateChoices(ERA_ORDER.filter((era) => era !== target.era), seedValue + 1, 4),
    ].slice(0, 4);
    return {
      id: `decision_${gateIndex + 1}`,
      layer: gateIndex + 1,
      kind: 'meme_match_era',
      portalLabel: 'Era Fork',
      prompt: 'Era fork. Walk into the era that owns this meme.',
      meme: target,
      image: target.image,
      answerMemeId: target.id,
      options: eraChoices.map((era) => ({
        id: era,
        label: ERA_LABELS[era],
        next: 'next_node',
        era,
        memeId: target.id,
        era_pull: ERA_PULL[era],
        axis_deltas: era === target.era
          ? axisFromMeme(target, 5)
          : { rizz: 1 + Math.max(0, ERA_PULL[era]), aura: 2, sigma: 1 + Math.max(0, -ERA_PULL[era]) },
        timelineCopy: era === target.era ? 'era gate syncs' : `${ERA_LABELS[era]} detour unlocked`,
      })),
    };
  }

  function createInitialRun(seed = pickSeed()) {
    return {
      seedMeme: seed,
      gateIndex: 0,
      avatar: { ...MAZE_LAYOUT.start },
      eraScore: ERA_PULL[seed.era] || 0,
      axes: {
        rizz: seed.axes.rizz * 7,
        aura: seed.axes.aura * 7,
        sigma: seed.axes.sigma * 7,
      },
      path: [],
      replays: 0,
      lastTimelineCopy: 'seed flash burned in',
    };
  }

  function applyAnswer(run, gate, selectedOption) {
    const optionData = selectedOption || gate.options[0];
    const from = run.avatar || MAZE_LAYOUT.start;
    const nextNode = MAZE_LAYOUT.nodes[Math.min(run.gateIndex + 1, MAZE_LAYOUT.nodes.length - 1)];
    const to = { x: nextNode.x, y: nextNode.y };
    return {
      ...run,
      gateIndex: run.gateIndex + 1,
      avatar: to,
      eraScore: run.eraScore + (optionData.era_pull || 0),
      axes: {
        rizz: clamp(run.axes.rizz + (optionData.axis_deltas?.rizz || 0) * 6, -20, 120),
        aura: clamp(run.axes.aura + (optionData.axis_deltas?.aura || 0) * 6, -20, 120),
        sigma: clamp(run.axes.sigma + (optionData.axis_deltas?.sigma || 0) * 6, -20, 120),
      },
      path: [
        ...run.path,
        {
          gateId: gate.id,
          challengeKind: gate.kind,
          optionId: optionData.id,
          label: optionData.label,
          image: optionData.image || MEME_BY_ID[optionData.memeId]?.image,
          memeId: optionData.memeId,
          from,
          to,
          eraPull: optionData.era_pull || 0,
          timelineCopy: optionData.timelineCopy,
        },
      ],
      lastTimelineCopy: optionData.timelineCopy || 'timeline corrupted',
    };
  }

  function applyAuraTaxReplay(run) {
    return {
      ...run,
      axes: {
        ...run.axes,
        aura: clamp(run.axes.aura - 5, -20, 120),
      },
      replays: run.replays + 1,
      lastTimelineCopy: 'aura taxed',
    };
  }

  function deriveEra(runOrScore) {
    const score = typeof runOrScore === 'number' ? runOrScore : runOrScore.eraScore;
    if (score <= -8) return ERA_ROOMS.boomer;
    if (score <= -4) return ERA_ROOMS.millennial;
    if (score <= 1) return ERA_ROOMS.older_genz;
    if (score <= 6) return ERA_ROOMS.genz_core;
    return ERA_ROOMS.genalpha;
  }

  function estimateAge(run) {
    const room = deriveEra(run);
    const chaosLean = Math.round((run.axes.rizz + run.axes.aura - run.axes.sigma) / 55);
    return clamp(room.age - chaosLean, 12, 60);
  }

  function buildDisplayAxes(run) {
    return {
      rizz: clamp(Math.round(18 + run.axes.rizz), 10, 100),
      aura: clamp(Math.round(18 + run.axes.aura), 10, 100),
      sigma: clamp(Math.round(18 + run.axes.sigma), 10, 100),
      era: clamp(Math.round(((run.eraScore + 16) / 32) * 90 + 10), 10, 100),
    };
  }

  function getVibeTitle(roomId, axes) {
    const entries = [
      ['rizz', axes.rizz],
      ['aura', axes.aura],
      ['sigma', axes.sigma],
    ];
    const [axis] = entries.reduce((best, item) => (item[1] > best[1] ? item : best), entries[0]);
    const titles = {
      rizz: {
        boomer: 'Boomer With Rizz',
        millennial: 'Accidental Rizzler',
        older_genz: 'Low-Key Rizz Relic',
        genz_core: 'Certified Rizzler',
        genalpha: 'Rizz God',
      },
      aura: {
        boomer: 'Aura Dial-Up Survivor',
        millennial: 'Millennial Aura Check',
        older_genz: 'Elder Aura Farmer',
        genz_core: 'Aura Manager',
        genalpha: 'Aura God',
      },
      sigma: {
        boomer: 'OG Sigma Boomer',
        millennial: 'Sigma Dad Energy',
        older_genz: 'Ironic Sigma Survivor',
        genz_core: 'Sigma Grindset',
        genalpha: 'Sigma Overlord',
      },
    };
    return titles[axis][roomId] || 'Unclassified Rizzler';
  }

  function createShareCardData(run) {
    const room = deriveEra(run);
    const axes = buildDisplayAxes(run);
    return {
      product: 'BRAINROT MAZE',
      size: { width: 1200, height: 630 },
      title: getVibeTitle(room.id, axes),
      eraLabel: room.label,
      estimatedAge: estimateAge(run),
      roast: room.roast,
      hero: room.hero,
      axes,
      pathThumbs: [
        run.seedMeme,
        ...run.path
          .filter((item) => item.image)
          .map((item) => MEME_BY_ID[item.memeId])
          .filter(Boolean),
      ].slice(0, 5),
      cta: 'Take the Brainrot Test',
    };
  }

  global.BRAINROT_GAME = {
    ERA_ORDER,
    ERA_ROOMS,
    MEMES,
    MEME_BY_ID,
    AUDIO_CLIPS,
    AUDIO_BY_ID,
    AUDIO_TO_MEME_ID,
    SEED_POOL,
    MAZE_GATES,
    MAZE_LAYOUT,
    assetUrl,
    pickSeed,
    buildDecisionGame,
    createInitialRun,
    applyAnswer,
    applyAuraTaxReplay,
    deriveEra,
    estimateAge,
    buildDisplayAxes,
    getVibeTitle,
    createShareCardData,
  };
})(window);
