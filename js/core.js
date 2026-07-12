const deck = document.getElementById('deck');
const slideOne = document.getElementById('slide');
const slideTwo = document.getElementById('slideTwo');

const slideOneParticleField = document.getElementById('particleField');
const slideTwoStarField = document.getElementById('slide2StarField');
const baryonParticles = document.getElementById('baryonParticles');
const emissionField = document.getElementById('emissionField');
const impactFlashes = document.getElementById('impactFlashes');

const leftFunnel = document.getElementById('s2LeftFunnel');
const rightFunnel = document.getElementById('s2RightFunnel');
const leftIncoming = document.getElementById('s2LeftIncoming');
const leftScatter = document.getElementById('s2LeftScatter');
const leftAbsorbed = document.getElementById('s2LeftAbsorbed');
const rightPassing = document.getElementById('s2RightPassing');
const rightArcs = document.getElementById('s2RightArcs');
const gravityTrails = document.getElementById('s2GravityTrails');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function seededRandom(seed = 72931) {
  let value = seed % 2147483647;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const slideOneRand = seededRandom(72931);
const slideTwoRand = seededRandom(41873);

function createSvg(name) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function setStyles(node, styles) {
  Object.entries(styles).forEach(([key, value]) => {
    node.style.setProperty(key, value);
  });
}

function createSlideOneParticle(className, rand) {
  const node = document.createElement('span');
  node.className = className;

  const x = rand() * 100;
  const y = rand() * 100;

  const size =
    className === 'glint'
      ? 2.3 + rand() * 4.6
      : className === 'star'
        ? 0.72 + rand() * 2.55
        : 2 + rand() * 7.2;

  const delay = -rand() * 16;

  const duration =
    className === 'glint'
      ? 4.2 + rand() * 6.2
      : className === 'star'
        ? 8 + rand() * 17
        : 18 + rand() * 27;

  const drift =
    className === 'dust'
      ? (rand() - 0.5) * 54
      : (rand() - 0.5) * 17;

  const hue =
    className === 'glint'
      ? 38 + rand() * 30
      : 205 + rand() * 75;

  const alpha =
    className === 'glint'
      ? 0.58 + rand() * 0.34
      : 0.24 + rand() * 0.72;

  node.style.setProperty('--x', `${x}vw`);
  node.style.setProperty('--y', `${y}vh`);
  node.style.setProperty('--s', `${size}px`);
  node.style.setProperty('--delay', `${delay}s`);
  node.style.setProperty('--duration', `${duration}s`);
  node.style.setProperty('--drift', `${drift}px`);
  node.style.setProperty('--alpha', `${alpha}`);
  node.style.setProperty('--hue', `${hue}`);

  return node;
}

function buildSlideOneParticles() {
  const starCount = prefersReduced ? 34 : 148;
  const glintCount = prefersReduced ? 4 : 16;
  const dustCount = prefersReduced ? 8 : 28;

  for (let i = 0; i < starCount; i += 1) {
    slideOneParticleField.appendChild(createSlideOneParticle('star', slideOneRand));
  }

  for (let i = 0; i < glintCount; i += 1) {
    slideOneParticleField.appendChild(createSlideOneParticle('glint', slideOneRand));
  }

  for (let i = 0; i < dustCount; i += 1) {
    slideOneParticleField.appendChild(createSlideOneParticle('dust', slideOneRand));
  }
}

function createSlideTwoParticle(className) {
  const node = document.createElement('span');
  node.className = className;

  const x = slideTwoRand() * 100;
  const y = slideTwoRand() * 100;

  const size =
    className === 's2-star'
      ? 0.6 + slideTwoRand() * 2.1
      : 1.8 + slideTwoRand() * 6;

  const delay = -slideTwoRand() * 18;

  const duration =
    className === 's2-star'
      ? 9 + slideTwoRand() * 18
      : 18 + slideTwoRand() * 30;

  const drift =
    className === 's2-star'
      ? (slideTwoRand() - 0.5) * 14
      : (slideTwoRand() - 0.5) * 36;

  const hue = 205 + slideTwoRand() * 78;
  const alpha = 0.16 + slideTwoRand() * 0.58;

  node.style.setProperty('--x', `${x}vw`);
  node.style.setProperty('--y', `${y}vh`);
  node.style.setProperty('--s', `${size}px`);
  node.style.setProperty('--delay', `${delay}s`);
  node.style.setProperty('--duration', `${duration}s`);
  node.style.setProperty('--drift', `${drift}px`);
  node.style.setProperty('--hue', `${hue}`);
  node.style.setProperty('--alpha', `${alpha}`);

  return node;
}

function buildSlideTwoStars() {
  const starCount = prefersReduced ? 22 : 74;
  const dustCount = prefersReduced ? 4 : 10;

  for (let i = 0; i < starCount; i += 1) {
    slideTwoStarField.appendChild(createSlideTwoParticle('s2-star'));
  }

  for (let i = 0; i < dustCount; i += 1) {
    slideTwoStarField.appendChild(createSlideTwoParticle('s2-dust'));
  }
}

function buildBaryonicMatter() {
  const count = prefersReduced ? 30 : 78;

  for (let i = 0; i < count; i += 1) {
    const node = document.createElement('span');
    node.className = 's2-baryon';

    const angle = slideTwoRand() * Math.PI * 2;
    const radius = Math.pow(slideTwoRand(), 0.62) * 128;

    const tx = Math.cos(angle) * radius;
    const ty = Math.sin(angle) * radius * 0.74;

    const sx = (slideTwoRand() - 0.5) * 610;
    const sy = (slideTwoRand() - 0.5) * 440;

    const ox = (slideTwoRand() - 0.5) * 8;
    const oy = (slideTwoRand() - 0.5) * 8;

    const size = 3.8 + slideTwoRand() * 12.5;
    const delay = i * 18 + slideTwoRand() * 180;
    const orbit = 6.5 + slideTwoRand() * 7;
    const alpha = 0.46 + slideTwoRand() * 0.50;

    node.style.setProperty('--tx', tx.toFixed(2));
    node.style.setProperty('--ty', ty.toFixed(2));
    node.style.setProperty('--sx', sx.toFixed(2));
    node.style.setProperty('--sy', sy.toFixed(2));
    node.style.setProperty('--ox', ox.toFixed(2));
    node.style.setProperty('--oy', oy.toFixed(2));
    node.style.setProperty('--size', `${size.toFixed(2)}px`);
    node.style.setProperty('--delay', delay.toFixed(0));
    node.style.setProperty('--orbit', `${orbit.toFixed(2)}s`);
    node.style.setProperty('--alpha', alpha.toFixed(2));

    baryonParticles.appendChild(node);
  }
}

function buildProbeFields() {
  const leftHost =
    document.getElementById(
      's2LeftProbeField'
    );

  const rightHost =
    document.getElementById(
      's2RightProbeField'
    );

  if (!leftHost || !rightHost) {
    return;
  }

  leftHost.innerHTML = '';
  rightHost.innerHTML = '';

  const leftPaths = [
    {
      kind: 'stone',
      dx: '-29vw',
      dy: '-22vh',
      mx: '-10vw',
      my: '-8vh',
      qx: '-2.6vw',
      qy: '-2.0vh',
      size: '12.8vmin',
      delay: 0,
      tilt: '-18deg',
      startRot: '-26deg',
      midRot: '-9deg',
      endRot: '6deg'
    },
    {
      kind: 'ice',
      dx: '-18vw',
      dy: '31vh',
      mx: '-5.8vw',
      my: '9.2vh',
      qx: '-1.6vw',
      qy: '2.4vh',
      size: '11.5vmin',
      delay: 420,
      tilt: '24deg',
      startRot: '20deg',
      midRot: '5deg',
      endRot: '-8deg'
    },
    {
      kind: 'metal',
      dx: '20vw',
      dy: '-26vh',
      mx: '6.4vw',
      my: '-8.0vh',
      qx: '1.9vw',
      qy: '-2.2vh',
      size: '12.2vmin',
      delay: 840,
      tilt: '-32deg',
      startRot: '27deg',
      midRot: '11deg',
      endRot: '-5deg'
    },
    {
      kind: 'moon',
      dx: '24vw',
      dy: '25vh',
      mx: '7.4vw',
      my: '7.8vh',
      qx: '2.2vw',
      qy: '2.3vh',
      size: '10.9vmin',
      delay: 1260,
      tilt: '12deg',
      startRot: '-29deg',
      midRot: '-13deg',
      endRot: '5deg'
    }
  ];

  const rightPaths = [
    {
      kind: 'ice',
      dx: '-20vw',
      dy: '-25vh',
      mx: '-6.1vw',
      my: '-7.5vh',
      qx: '-1.7vw',
      qy: '-2.2vh',
      size: '12.5vmin',
      delay: 0,
      tilt: '20deg',
      startRot: '22deg',
      midRot: '8deg',
      endRot: '-7deg'
    },
    {
      kind: 'stone',
      dx: '21vw',
      dy: '-21vh',
      mx: '6.3vw',
      my: '-6.7vh',
      qx: '1.8vw',
      qy: '-1.9vh',
      size: '12.0vmin',
      delay: 420,
      tilt: '-23deg',
      startRot: '-24deg',
      midRot: '-8deg',
      endRot: '8deg'
    },
    {
      kind: 'metal',
      dx: '-16vw',
      dy: '31vh',
      mx: '-4.8vw',
      my: '9.0vh',
      qx: '-1.4vw',
      qy: '2.5vh',
      size: '12.8vmin',
      delay: 840,
      tilt: '33deg',
      startRot: '28deg',
      midRot: '11deg',
      endRot: '-5deg'
    },
    {
      kind: 'moon',
      dx: '25vw',
      dy: '27vh',
      mx: '7.5vw',
      my: '8.3vh',
      qx: '2.2vw',
      qy: '2.4vh',
      size: '11.0vmin',
      delay: 1260,
      tilt: '-12deg',
      startRot: '-30deg',
      midRot: '-13deg',
      endRot: '5deg'
    }
  ];

  function addProbe(
    host,
    config
  ) {
    const probe =
      document.createElement('span');

    probe.className =
      `s2-probe s2-probe-${config.kind}`;

    probe.innerHTML = `
      <span class="s2-probe-trail"></span>
      <span class="s2-probe-aura"></span>
      <span class="s2-probe-surface"></span>
      <span class="s2-probe-grid"></span>
      <span class="s2-probe-highlight"></span>
      <span class="s2-probe-shadow"></span>
    `;

    [
      ['--dx', config.dx],
      ['--dy', config.dy],
      ['--mx', config.mx],
      ['--my', config.my],
      ['--qx', config.qx],
      ['--qy', config.qy],
      ['--probe-size', config.size],
      ['--probe-delay', `${config.delay}ms`],
      ['--probe-tilt', config.tilt],
      ['--start-rot', config.startRot],
      ['--mid-rot', config.midRot],
      ['--end-rot', config.endRot]
    ].forEach(([key, value]) => {
      probe.style.setProperty(key, value);
    });

    host.appendChild(probe);
  }

  leftPaths.forEach((config) => {
    addProbe(leftHost, config);
  });

  rightPaths.forEach((config) => {
    addProbe(rightHost, config);
  });
}

function buildGravityTrails() {
  if (!gravityTrails) {
    return;
  }

  gravityTrails.innerHTML = '';

  const trails = [
    { side: 'left', d: 'M 88 246 C 230 210, 397 263, 540 520', delay: 0 },
    { side: 'left', d: 'M 288 814 C 357 720, 455 642, 540 520', delay: 220 },
    { side: 'left', d: 'M 832 186 C 724 253, 619 366, 540 520', delay: 440 },
    { side: 'left', d: 'M 900 778 C 765 719, 644 625, 540 520', delay: 660 },
    { side: 'right', d: 'M 852 232 C 980 251, 1094 359, 1160 520', delay: 0 },
    { side: 'right', d: 'M 1435 237 C 1330 270, 1225 385, 1160 520', delay: 220 },
    { side: 'right', d: 'M 915 804 C 1000 735, 1105 642, 1160 520', delay: 440 },
    { side: 'right', d: 'M 1510 810 C 1395 732, 1265 637, 1160 520', delay: 660 }
  ];

  trails.forEach((trail) => {
    const path = createSvg('path');
    path.setAttribute(
      'class',
      `s2-gravity-trail s2-gravity-${trail.side}`
    );
    path.setAttribute('d', trail.d);
    path.setAttribute('pathLength', '100');
    path.style.setProperty('--delay', `${trail.delay}ms`);
    gravityTrails.appendChild(path);

    const bead = createSvg('path');
    bead.setAttribute(
      'class',
      `s2-gravity-bead s2-gravity-${trail.side}`
    );
    bead.setAttribute('d', trail.d);
    bead.setAttribute('pathLength', '100');
    bead.style.setProperty('--delay', `${trail.delay + 140}ms`);
    gravityTrails.appendChild(bead);
  });
}

function appendEllipse(
  group,
  className,
  cx,
  cy,
  rx,
  ry,
  delay = 0
) {
  const ellipse = createSvg('ellipse');

  ellipse.setAttribute('class', className);
  ellipse.setAttribute('cx', cx);
  ellipse.setAttribute('cy', cy);
  ellipse.setAttribute('rx', rx);
  ellipse.setAttribute('ry', ry);
  ellipse.setAttribute('pathLength', '100');
  ellipse.style.setProperty('--delay', delay.toFixed(0));

  group.appendChild(ellipse);

  return ellipse;
}

function appendPath(
  group,
  className,
  d,
  delay = 0
) {
  const path = createSvg('path');

  path.setAttribute('class', className);
  path.setAttribute('d', d);
  path.setAttribute('pathLength', '100');
  path.style.setProperty('--delay', delay.toFixed(0));

  group.appendChild(path);

  return path;
}

function buildFunnel(group, options) {
  const {
    cx,
    cy,
    rx,
    ry,
    depth,
    spokeCount = 20
  } = options;

  appendEllipse(
    group,
    's2-funnel-shadow',
    cx,
    cy + depth * 0.61,
    rx * 0.34,
    ry * 0.17,
    0
  );

  appendEllipse(
    group,
    's2-funnel-throat',
    cx,
    cy + depth,
    rx * 0.105,
    ry * 0.105,
    0
  );

  const rings = [
    [1.00, 0.00, 0],
    [0.82, 0.15, 85],
    [0.64, 0.32, 170],
    [0.47, 0.51, 255],
    [0.30, 0.73, 340],
    [0.14, 0.96, 425]
  ];

  rings.forEach(([scale, drop, delay]) => {
    appendEllipse(
      group,
      's2-funnel-line s2-funnel-ring',
      cx,
      cy + depth * drop,
      rx * scale,
      ry * scale,
      delay
    );
  });

  for (let i = 0; i < spokeCount; i += 1) {
    const theta = (i / spokeCount) * Math.PI * 2;

    const outerX = cx + Math.cos(theta) * rx;
    const outerY = cy + Math.sin(theta) * ry;

    const midX = cx + Math.cos(theta) * rx * 0.37;
    const midY =
      cy +
      depth * 0.49 +
      Math.sin(theta) * ry * 0.28;

    const innerX =
      cx +
      Math.cos(theta) * rx * 0.07;

    const innerY =
      cy +
      depth * 0.97 +
      Math.sin(theta) * ry * 0.06;

    const d =
      `M ${outerX.toFixed(1)} ${outerY.toFixed(1)}
       C ${((outerX + midX) / 2).toFixed(1)}
         ${(outerY + depth * 0.20).toFixed(1)},
         ${midX.toFixed(1)}
         ${midY.toFixed(1)},
         ${innerX.toFixed(1)}
         ${innerY.toFixed(1)}`;

    appendPath(
      group,
      's2-funnel-line s2-funnel-spoke',
      d,
      110 + i * 16
    );
  }
}

function sinePath(
  x0,
  y0,
  x1,
  y1,
  amplitude,
  wavelength,
  phase = 0,
  samples = 190
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);

  const tx = dx / length;
  const ty = dy / length;

  const nx = -ty;
  const ny = tx;

  const commands = [];

  for (let i = 0; i <= samples; i += 1) {
    const u = i / samples;
    const distance = length * u;
    const envelope = Math.sin(Math.PI * u);

    const displacement =
      Math.sin(
        (distance / wavelength) * Math.PI * 2 + phase
      ) *
      amplitude *
      envelope;

    const x =
      x0 +
      dx * u +
      nx * displacement;

    const y =
      y0 +
      dy * u +
      ny * displacement;

    commands.push(
      `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    );
  }

  return commands.join(' ');
}

function appendWavePacket(
  group,
  d,
  options = {}
) {
  const {
    className = 's2-wave-source',
    delay = 0,
    duration = 7600,
    coreOpacity = 0.96,
    glowOpacity = 0.26,
    headOpacity = 1
  } = options;

  const glow = appendPath(
    group,
    `s2-wave s2-wave-glow ${className}`,
    d,
    0
  );

  glow.style.setProperty('--packet-delay', `${delay}ms`);
  glow.style.setProperty('--packet-duration', `${duration}ms`);
  glow.style.setProperty('--packet-opacity', glowOpacity);

  const core = appendPath(
    group,
    `s2-wave s2-wave-core ${className}`,
    d,
    0
  );

  core.style.setProperty('--packet-delay', `${delay}ms`);
  core.style.setProperty('--packet-duration', `${duration}ms`);
  core.style.setProperty('--packet-opacity', coreOpacity);

  const head = appendPath(
    group,
    `s2-wave s2-wave-head ${className}`,
    d,
    0
  );

  head.style.setProperty('--packet-delay', `${delay}ms`);
  head.style.setProperty('--packet-duration', `${duration}ms`);
  head.style.setProperty('--packet-opacity', headOpacity);
}

function appendCollision(
  group,
  x,
  y,
  delay,
  rotation = 0,
  strength = 1
) {
  const impact = createSvg('g');

  impact.setAttribute('class', 's2-impact-system');
  impact.style.setProperty('--impact-delay', `${delay}ms`);
  impact.style.setProperty('--impact-x', `${x}px`);
  impact.style.setProperty('--impact-y', `${y}px`);
  impact.style.setProperty('--impact-strength', strength);
  impact.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);

  const outer = createSvg('circle');
  outer.setAttribute('class', 's2-impact-ring');
  outer.setAttribute('cx', x);
  outer.setAttribute('cy', y);
  outer.setAttribute('r', 12 + strength * 4);

  const inner = createSvg('circle');
  inner.setAttribute('class', 's2-impact-ring-inner');
  inner.setAttribute('cx', x);
  inner.setAttribute('cy', y);
  inner.setAttribute('r', 5 + strength * 2);

  impact.appendChild(outer);
  impact.appendChild(inner);

  const spokeCount = 10;
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const r0 = 9 + strength * 2;
    const r1 = 28 + (i % 2) * 11 + strength * 9;
    const line = createSvg('line');

    line.setAttribute('class', 's2-impact-spoke');
    line.setAttribute('x1', (x + Math.cos(angle) * r0).toFixed(2));
    line.setAttribute('y1', (y + Math.sin(angle) * r0).toFixed(2));
    line.setAttribute('x2', (x + Math.cos(angle) * r1).toFixed(2));
    line.setAttribute('y2', (y + Math.sin(angle) * r1).toFixed(2));
    impact.appendChild(line);
  }

  group.appendChild(impact);
}

function buildLightWaves() {
  [
    leftIncoming,
    leftScatter,
    leftAbsorbed,
    rightPassing,
    rightArcs
  ].forEach((group) => {
    group.innerHTML = '';
  });

  const wavelength = 96;
  const sourceX = -220;
  const exitX = 1840;

  const controlRows = [
    230,
    276,
    514,
    560,
    606
  ];

  controlRows.forEach((y, index) => {
    const path = sinePath(
      sourceX,
      y,
      exitX,
      y,
      6.2,
      wavelength,
      index * .78,
      330
    );

    appendWavePacket(
      rightPassing,
      path,
      {
        className: 's2-wave-control',
        delay: 420 + index * 360,
        duration: 10400,
        coreOpacity: .80,
        glowOpacity: .16,
        headOpacity: .92
      }
    );
  });

  const interactions = [
    {
      sourceY: 312,
      hitX: 500,
      hitY: 338,
      exitY: 138,
      phase: .12,
      delay: 0,
      rotation: -24,
      strength: 1.05
    },
    {
      sourceY: 338,
      hitX: 520,
      hitY: 360,
      exitY: 238,
      phase: .74,
      delay: 430,
      rotation: -14,
      strength: .92
    },
    {
      sourceY: 366,
      hitX: 538,
      hitY: 384,
      exitY: 350,
      phase: 1.34,
      delay: 860,
      rotation: -4,
      strength: 1
    },
    {
      sourceY: 394,
      hitX: 548,
      hitY: 410,
      exitY: 462,
      phase: 1.94,
      delay: 1290,
      rotation: 8,
      strength: .95
    },
    {
      sourceY: 424,
      hitX: 535,
      hitY: 436,
      exitY: 570,
      phase: 2.54,
      delay: 1720,
      rotation: 17,
      strength: 1.08
    },
    {
      sourceY: 456,
      hitX: 512,
      hitY: 460,
      exitY: 710,
      phase: 3.14,
      delay: 2150,
      rotation: 28,
      strength: 1.15
    },
    {
      sourceY: 486,
      hitX: 484,
      hitY: 474,
      exitY: null,
      phase: 3.74,
      delay: 2580,
      rotation: 0,
      strength: 1.2
    }
  ];

  interactions.forEach((ray) => {
    const incomingPath = sinePath(
      sourceX,
      ray.sourceY,
      ray.hitX,
      ray.hitY,
      8.0,
      wavelength,
      ray.phase,
      210
    );

    appendWavePacket(
      leftIncoming,
      incomingPath,
      {
        className: 's2-wave-source',
        delay: ray.delay,
        duration: 5200,
        coreOpacity: .98,
        glowOpacity: .28,
        headOpacity: 1
      }
    );

    const impactTime = ray.delay + 3720;

    appendCollision(
      leftScatter,
      ray.hitX,
      ray.hitY,
      impactTime,
      ray.rotation,
      ray.strength
    );

    if (ray.exitY === null) {
      const absorbedPath = sinePath(
        ray.hitX,
        ray.hitY,
        ray.hitX + 190,
        ray.hitY + 18,
        6.4,
        wavelength,
        ray.phase + .46,
        100
      );

      appendWavePacket(
        leftAbsorbed,
        absorbedPath,
        {
          className: 's2-wave-absorbed',
          delay: impactTime + 260,
          duration: 2100,
          coreOpacity: .68,
          glowOpacity: .18,
          headOpacity: .62
        }
      );

      return;
    }

    const outgoingPath = sinePath(
      ray.hitX,
      ray.hitY,
      exitX,
      ray.exitY,
      7.6,
      wavelength,
      ray.phase + .38,
      300
    );

    appendWavePacket(
      leftScatter,
      outgoingPath,
      {
        className: 's2-wave-scatter',
        delay: impactTime + 360,
        duration: 7200,
        coreOpacity: .93,
        glowOpacity: .22,
        headOpacity: .98
      }
    );
  });
}

buildSlideOneParticles();
buildSlideTwoStars();
buildBaryonicMatter();
buildProbeFields();
buildGravityTrails();

buildFunnel(leftFunnel, {
  cx: 540,
  cy: 520,
  rx: 286,
  ry: 70,
  depth: 218,
  spokeCount: 20
});

buildFunnel(rightFunnel, {
  cx: 1160,
  cy: 520,
  rx: 286,
  ry: 70,
  depth: 218,
  spokeCount: 20
});

buildLightWaves();

let step = 0;
let titleTimer = null;
let transitionTimer = null;
let slideTwoTimer = null;
let slideTwoLockedUntil = 0;

function lockSlideTwoFor(milliseconds) {
  slideTwoLockedUntil =
    performance.now() + milliseconds;
}

function slideTwoIsLocked() {
  return performance.now() < slideTwoLockedUntil;
}

function revealSlideOne() {
  slideOne.classList.add(
    'is-halo-revealed'
  );

  titleTimer = window.setTimeout(() => {
    slideOne.classList.add(
      'is-title-revealed'
    );
  }, prefersReduced ? 80 : 1220);
}

function transitionToSlideTwo() {
  deck.classList.add(
    'is-transitioning-to-slide2'
  );

  transitionTimer = window.setTimeout(() => {
    deck.classList.add(
      'show-slide-2'
    );
  }, prefersReduced ? 80 : 760);

  slideTwoTimer = window.setTimeout(() => {
    slideTwo.classList.add(
      's2-ready'
    );

    deck.classList.remove(
      'is-transitioning-to-slide2'
    );
  }, prefersReduced ? 100 : 1180);
}

function advanceSlideTwoBeat() {
  if (slideTwoIsLocked()) {
    return;
  }

  if (step === 2) {
    slideTwo.classList.add(
      's2-particles-visible'
    );

    lockSlideTwoFor(
      prefersReduced
        ? 80
        : 2300
    );

    step = 3;
    return;
  }

  if (step === 3) {
    slideTwo.classList.add(
      's2-left-capture'
    );

    lockSlideTwoFor(
      prefersReduced
        ? 80
        : 10800
    );

    step = 4;
    return;
  }

  if (step === 4) {
    slideTwo.classList.add(
      's2-right-capture'
    );

    lockSlideTwoFor(
      prefersReduced
        ? 80
        : 10800
    );

    step = 5;
    return;
  }

  if (step === 5) {
    slideTwo.classList.add(
      's2-light-visible'
    );

    lockSlideTwoFor(
      prefersReduced
        ? 80
        : 12200
    );

    step = 7;
  }
}

function advance() {
  if (step === 0) {
    step = 1;
    revealSlideOne();
    return;
  }

  if (step === 1) {
    step = 2;
    transitionToSlideTwo();
    return;
  }

  
  if (
    step === 7 &&
    slideTwoIsLocked()
  ) {
    return;
  }

  if (step >= 7) {
    step =
      window.slide34Controller
        ?.advance?.(step)
      ?? step;

    return;
  }

  advanceSlideTwoBeat();
}

function clearTimers() {
  window.clearTimeout(titleTimer);
  window.clearTimeout(transitionTimer);
  window.clearTimeout(slideTwoTimer);
}

function resetDeck() {
  step = 0;
  slideTwoLockedUntil = 0;

  clearTimers();

  slideOne.classList.remove(
    'is-halo-revealed',
    'is-title-revealed'
  );

  slideTwo.classList.remove(
    's2-ready',
    's2-particles-visible',
    's2-left-capture',
    's2-right-capture',
    's2-light-visible'
  );

  deck.classList.remove(
    'is-transitioning-to-slide2',
    'show-slide-2'
  );

  window.slide34Controller?.reset?.();

  void deck.offsetWidth;
}

function jumpToSlideTwoStart() {
  clearTimers();

  step = 2;
  slideTwoLockedUntil = 0;

  slideOne.classList.add(
    'is-halo-revealed',
    'is-title-revealed'
  );

  deck.classList.add(
    'show-slide-2'
  );

  deck.classList.remove(
    'is-transitioning-to-slide2'
  );

  slideTwo.classList.add(
    's2-ready'
  );

  slideTwo.classList.remove(
    's2-particles-visible',
    's2-left-capture',
    's2-right-capture',
    's2-light-visible'
  );
}

function jumpToSlideTwoComplete() {
  jumpToSlideTwoStart();

  step = 7;
  slideTwoLockedUntil = 0;

  slideTwo.classList.add(
    's2-particles-visible',
    's2-left-capture',
    's2-right-capture',
    's2-light-visible'
  );
}

deck.addEventListener('click', advance);

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === ' ' || key === 'arrowright' || key === 'enter') {
    event.preventDefault();
    advance();
  }

  if (key === 'r') {
    resetDeck();
  }

  if (key === '1') {
    resetDeck();
  }

  if (key === '2') {
    jumpToSlideTwoStart();
  }

  if (key === '3') {
    jumpToSlideTwoComplete();
  }

  if (key === '4') {
    step = 8;

    slideOne.classList.add(
      'is-halo-revealed',
      'is-title-revealed'
    );

    slideTwo.classList.add(
      's2-ready',
      's2-particles-visible',
      's2-left-capture',
      's2-right-capture',
      's2-light-visible'
    );

    window.slide34Controller
      ?.jumpToSlideThreeStart?.();
  }

  if (key === '5') {
    step = 12;

    slideOne.classList.add(
      'is-halo-revealed',
      'is-title-revealed'
    );

    slideTwo.classList.add(
      's2-ready',
      's2-particles-visible',
      's2-left-capture',
      's2-right-capture',
      's2-light-visible'
    );

    window.slide34Controller
      ?.jumpToSlideFourStart?.();
  }

  if (key === '6') {
    step = 16;

    slideOne.classList.add(
      'is-halo-revealed',
      'is-title-revealed'
    );

    slideTwo.classList.add(
      's2-ready',
      's2-particles-visible',
      's2-left-capture',
      's2-right-capture',
      's2-light-visible'
    );

    window.slide34Controller
      ?.jumpToSlideFourComplete?.();
  }

  if (key === 'f') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
});

const params = new URLSearchParams(window.location.search);

if (params.has('revealed')) {
  window.setTimeout(revealSlideOne, prefersReduced ? 60 : 620);
  step = 1;
}

if (params.has('slide2')) {
  window.setTimeout(jumpToSlideTwoStart, prefersReduced ? 60 : 300);
}

window.addEventListener('load', () => {
  const params2 =
    new URLSearchParams(
      window.location.search
    );

  if (params2.has('slide3')) {
    step = 8;
    slideTwoLockedUntil = 0;

    slideOne.classList.add(
      'is-halo-revealed',
      'is-title-revealed'
    );

    slideTwo.classList.add(
      's2-ready',
      's2-particles-visible',
      's2-left-capture',
      's2-right-capture',
      's2-light-visible'
    );

    window.slide34Controller
      ?.jumpToSlideThreeStart?.();
  }

  if (params2.has('slide4')) {
    step = 12;
    slideTwoLockedUntil = 0;

    slideOne.classList.add(
      'is-halo-revealed',
      'is-title-revealed'
    );

    slideTwo.classList.add(
      's2-ready',
      's2-particles-visible',
      's2-left-capture',
      's2-right-capture',
      's2-light-visible'
    );

    window.slide34Controller
      ?.jumpToSlideFourStart?.();
  }
});
