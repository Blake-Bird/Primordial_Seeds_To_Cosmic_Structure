(() => {
  const deck = document.getElementById('deck');
  const slideThree = document.getElementById('slideThree');
  const slideFour = document.getElementById('slideFour');
  const slideFive = document.getElementById('slideFive');
  const canvas = document.getElementById('s3GalaxyCanvas');
  const orbitLayer = document.getElementById('s3OrbitLayer');
  const orbitRings = document.getElementById('s3OrbitRings');
  const speedAnnotations = document.getElementById('s3SpeedAnnotations');
  const radiusLine = document.getElementById('s3RadiusLine');
  const radiusHead = document.getElementById('s3RadiusHead');
  const radiusLabel = document.getElementById('s3RadiusLabel');
  const graph = document.getElementById('s4Graph');
  const graphStage = document.getElementById('s4GraphStage');
  const trackTransition = document.getElementById('s34TrackTransition');
  const graphTransition = document.getElementById('s45GraphTransition');
  const graphTransitionShell = document.getElementById('s45GraphShell');
  const graphTransitionClone = document.getElementById('s45GraphClone');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seededRandom(seed = 1337) {
    let value = seed % 2147483647;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  const rand = seededRandom(3198);
  const svgNS = 'http://www.w3.org/2000/svg';

  const orbitConfig = {
    cx: 800,
    cy: 486,
    angle: -25 * Math.PI / 180,
    yScale: 0.36,
    rings: [
      { kpc: 2, r: 82, expected: 80, observed: 112, dots: 2 },
      { kpc: 5, r: 142, expected: 88, observed: 146, dots: 3 },
      { kpc: 10, r: 218, expected: 75, observed: 155, dots: 4 },
      { kpc: 20, r: 312, expected: 55, observed: 148, dots: 4 },
      { kpc: 30, r: 410, expected: 45, observed: 150, dots: 5 }
    ]
  };

  const orbiters = [];

  function createSvg(name, attrs = {}) {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function projectOrbit(radius, angle) {
    const ca = Math.cos(orbitConfig.angle);
    const sa = Math.sin(orbitConfig.angle);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * orbitConfig.yScale;
    return {
      x: orbitConfig.cx + x * ca - y * sa,
      y: orbitConfig.cy + x * sa + y * ca
    };
  }

  function setRadiusLine() {
    const start = projectOrbit(0, 0);
    const end = projectOrbit(410, .02);
    radiusLine.setAttribute('d', `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
    radiusHead.setAttribute('cx', end.x.toFixed(1));
    radiusHead.setAttribute('cy', end.y.toFixed(1));
    radiusLabel.setAttribute('x', (end.x + 24).toFixed(1));
    radiusLabel.setAttribute('y', (end.y + 7).toFixed(1));
  }

  function buildOrbitRings() {
    setRadiusLine();
    orbitRings.innerHTML = '';
    orbitLayer.innerHTML = '';
    speedAnnotations.innerHTML = '';
    orbiters.length = 0;

    orbitConfig.rings.forEach((ring, i) => {
      const ellipse = createSvg('ellipse', {
        cx: orbitConfig.cx,
        cy: orbitConfig.cy,
        rx: ring.r,
        ry: ring.r * orbitConfig.yScale,
        transform: `rotate(-25 ${orbitConfig.cx} ${orbitConfig.cy})`,
        pathLength: 100
      });
      ellipse.style.setProperty('--i', i);
      orbitRings.appendChild(ellipse);

      for (let j = 0; j < ring.dots; j += 1) {
        const dot = document.createElement('span');
        dot.className = `s3-orbiter ${ring.kpc >= 10 ? 'outer' : 'inner'}`;
        dot.dataset.ringIndex = i;
        dot.dataset.expectedSpeed = ring.expected;
        dot.dataset.observedSpeed = ring.observed;
        dot.style.setProperty('--size', `${ring.kpc >= 20 ? 7 : 6}px`);
        orbitLayer.appendChild(dot);
        orbiters.push({
          node: dot,
          ring,
          phase: (j / ring.dots) * Math.PI * 2 + rand() * .65,
          spin: 1,
          jitter: rand() * 30
        });
      }
    });

    const annotationSpecs = [
      { ringIndex: 2, theta: -1.02, dx: 76, dy: -30 },
      { ringIndex: 3, theta: .16, dx: 43, dy: 76 },
      { ringIndex: 4, theta: .56, dx: 52, dy: 148 }
    ];

    annotationSpecs.forEach((spec, index) => {
      const ring = orbitConfig.rings[spec.ringIndex];
      const point = projectOrbit(ring.r, spec.theta);
      const labelX = point.x + spec.dx;
      const labelY = point.y + spec.dy;
      const group = createSvg('g', { class: 's3-speed-annotation' });
      group.style.setProperty('--i', index);

      const leader = createSvg('path', {
        class: 's3-speed-annotation-line',
        d: `M ${point.x.toFixed(1)} ${point.y.toFixed(1)} C ${(point.x + spec.dx * .44).toFixed(1)} ${(point.y + spec.dy * .25).toFixed(1)}, ${(labelX - 26).toFixed(1)} ${labelY.toFixed(1)}, ${labelX.toFixed(1)} ${labelY.toFixed(1)}`,
        pathLength: 100
      });
      leader.style.setProperty('--i', index);

      const anchor = createSvg('circle', {
        class: 's3-speed-annotation-dot',
        cx: point.x.toFixed(1),
        cy: point.y.toFixed(1),
        r: 4.5
      });
      anchor.style.setProperty('--i', index);

      const value = createSvg('text', {
        class: 's3-speed-value',
        x: (labelX + 10).toFixed(1),
        y: (labelY - 3).toFixed(1)
      });
      value.style.setProperty('--i', index);
      value.textContent = `${ring.expected} km/s`;

      const note = createSvg('text', {
        class: 's3-speed-note',
        x: (labelX + 10).toFixed(1),
        y: (labelY + 17).toFixed(1)
      });
      note.style.setProperty('--i', index);
      note.textContent = 'VISIBLE MATTER CALCULATION';

      group.appendChild(leader);
      group.appendChild(anchor);
      group.appendChild(value);
      group.appendChild(note);
      speedAnnotations.appendChild(group);
    });
  }

  let galaxyStars = [];
  let canvasReady = false;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      buildGalaxyStars();
    }
  }

  function buildGalaxyStars() {
    const width = canvas.width;
    const height = canvas.height;
    const cx = width * .50;
    const cy = height * .535;
    galaxyStars = [];

    const count = reduced ? 650 : 2800;
    for (let i = 0; i < count; i += 1) {
      const arm = i % 4;
      const t = Math.pow(rand(), .66);
      const radius = t * Math.min(width, height) * .34;
      const spiral = arm * Math.PI / 2 + radius * .016 + (rand() - .5) * .9;
      const thickness = (1 - t) * .16 + .05;
      const noise = (rand() - .5) * radius * thickness;
      const localR = radius + noise;
      const x = Math.cos(spiral) * localR;
      const y = Math.sin(spiral) * localR * .35;
      const tilt = -25 * Math.PI / 180;
      const tx = cx + x * Math.cos(tilt) - y * Math.sin(tilt);
      const ty = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
      const warm = rand();
      galaxyStars.push({
        x: tx,
        y: ty,
        r: (.55 + rand() * 2.0) * dpr * (1.2 - t * .55),
        a: (.16 + rand() * .62) * (1 - t * .30),
        hue: warm > .68 ? 36 : warm > .36 ? 205 : 188,
        blur: rand() * 2.5,
        pulse: rand() * Math.PI * 2,
        drift: (rand() - .5) * .7 * dpr,
        t
      });
    }

    const bgCount = reduced ? 70 : 240;
    for (let i = 0; i < bgCount; i += 1) {
      galaxyStars.push({
        x: rand() * width,
        y: rand() * height,
        r: (.35 + rand() * 1.5) * dpr,
        a: .12 + rand() * .55,
        hue: 200 + rand() * 45,
        blur: 0,
        pulse: rand() * Math.PI * 2,
        drift: 0,
        t: 1.4
      });
    }

    canvasReady = true;
  }

  function drawGalaxy(time = 0) {
    if (!canvasReady || !canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width * .50;
    const cy = height * .535;
    ctx.clearRect(0, 0, width, height);

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * .26);
    core.addColorStop(0, 'rgba(255,236,194,.72)');
    core.addColorStop(.14, 'rgba(255,197,153,.32)');
    core.addColorStop(.34, 'rgba(139,189,255,.13)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-25 * Math.PI / 180);
    ctx.scale(1, .35);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    for (const s of galaxyStars) {
      const pulse = .82 + Math.sin(time * .0012 + s.pulse) * .18;
      const x = s.x + Math.sin(time * .00024 + s.pulse) * s.drift;
      const y = s.y + Math.cos(time * .00021 + s.pulse) * s.drift;
      ctx.beginPath();
      ctx.globalAlpha = s.a * pulse;
      ctx.shadowColor = `hsla(${s.hue}, 100%, 78%, ${s.a * .7})`;
      ctx.shadowBlur = s.blur * dpr;
      ctx.fillStyle = `hsla(${s.hue}, 95%, ${s.hue < 70 ? 82 : 88}%, ${s.a})`;
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    const dust = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * .39);
    dust.addColorStop(0, 'rgba(255,235,200,.0)');
    dust.addColorStop(.38, 'rgba(16,22,34,.02)');
    dust.addColorStop(.50, 'rgba(0,0,0,.16)');
    dust.addColorStop(.64, 'rgba(0,0,0,.09)');
    dust.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-25 * Math.PI / 180);
    ctx.scale(1, .35);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = dust;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function updateOrbiters(time = 0) {
    const modeObserved = slideThree?.classList.contains('s3-observed');
    const active =
      slideThree?.classList.contains('s3-predicted') ||
      slideThree?.classList.contains('s3-equation') ||
      modeObserved;

    const rect = slideThree?.getBoundingClientRect();
    if (!rect) return;

    const sx = rect.width / 1600;
    const sy = rect.height / 900;
    const scale = Math.max(sx, sy);
    const offsetX = (rect.width - 1600 * scale) / 2;
    const offsetY = (rect.height - 900 * scale) / 2;

    orbiters.forEach((orb) => {
      const speed = modeObserved ? orb.ring.observed : orb.ring.expected;
      const angular = (speed / Math.max(orb.ring.r, 1)) * .62;
      const theta = orb.phase + time * .001 * angular;
      const p = projectOrbit(orb.ring.r, theta);
      const next = projectOrbit(orb.ring.r, theta + .04);
      const x = offsetX + p.x * scale;
      const y = offsetY + p.y * scale;
      const angle = Math.atan2((next.y - p.y), (next.x - p.x));
      const trail = active
        ? Math.max(18, (speed / 150) * (orb.ring.kpc >= 10 ? 86 : 58))
        : 22;

      orb.node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) translate(-50%, -50%)`;
      orb.node.style.setProperty('--trail', `${trail.toFixed(1)}px`);
      orb.node.style.setProperty('--trail-angle', `${angle.toFixed(4)}rad`);
    });
  }

  let last = 0;
  function animate(time) {
    if (!last || time - last > 33 || reduced) {
      drawGalaxy(time);
      updateOrbiters(time);
      last = time;
    }
    requestAnimationFrame(animate);
  }

  function pathFromData(points, sx, sy) {
    return points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${sx(point[0]).toFixed(2)} ${sy(point[1]).toFixed(2)}`).join(' ');
  }

  function makeSmooth(points, samples = 16) {
    const out = [];
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      for (let j = 0; j < samples; j += 1) {
        const t = j / samples;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = .5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0]) * t2 + (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0]) * t3);
        const y = .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1]) * t2 + (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }

  function buildGraph() {
    if (!graph) return;
    graph.innerHTML = '';

    const W = 1200;
    const H = 760;
    const margin = { left: 118, right: 70, top: 64, bottom: 104 };
    const xMin = 0;
    const xMax = 30;
    const yMin = 0;
    const yMax = 180;
    const sx = x => margin.left + (x - xMin) / (xMax - xMin) * (W - margin.left - margin.right);
    const sy = y => H - margin.bottom - (y - yMin) / (yMax - yMin) * (H - margin.top - margin.bottom);

    const grid = createSvg('g', { class: 's4-grid' });
    graph.appendChild(grid);

    [0,5,10,15,20,25,30].forEach(x => {
      grid.appendChild(createSvg('line', {
        class: 's4-gridline',
        x1: sx(x), y1: margin.top,
        x2: sx(x), y2: H - margin.bottom
      }));
      graph.appendChild(createSvg('line', {
        class: 's4-tick',
        x1: sx(x), y1: H - margin.bottom,
        x2: sx(x), y2: H - margin.bottom + 10
      }));
      const txt = createSvg('text', {
        class: 's4-tick-label',
        x: sx(x), y: H - margin.bottom + 38,
        'text-anchor': 'middle'
      });
      txt.textContent = x;
      graph.appendChild(txt);
    });

    [0,30,60,90,120,150,180].forEach(y => {
      grid.appendChild(createSvg('line', {
        class: 's4-gridline',
        x1: margin.left, y1: sy(y),
        x2: W - margin.right, y2: sy(y)
      }));
      graph.appendChild(createSvg('line', {
        class: 's4-tick',
        x1: margin.left - 10, y1: sy(y),
        x2: margin.left, y2: sy(y)
      }));
      const txt = createSvg('text', {
        class: 's4-tick-label',
        x: margin.left - 24, y: sy(y) + 6,
        'text-anchor': 'end'
      });
      txt.textContent = y;
      graph.appendChild(txt);
    });

    graph.appendChild(createSvg('line', {
      class: 's4-axis',
      x1: margin.left, y1: H - margin.bottom,
      x2: W - margin.right, y2: H - margin.bottom
    }));
    graph.appendChild(createSvg('line', {
      class: 's4-axis',
      x1: margin.left, y1: margin.top,
      x2: margin.left, y2: H - margin.bottom
    }));

    const xlabel = createSvg('text', {
      class: 's4-label',
      x: (margin.left + W - margin.right) / 2,
      y: H - 28,
      'text-anchor': 'middle'
    });
    xlabel.textContent = 'Radius (kpc)';
    graph.appendChild(xlabel);

    const ylabel = createSvg('text', {
      class: 's4-label',
      x: -H / 2,
      y: 38,
      'text-anchor': 'middle',
      transform: 'rotate(-90)'
    });
    ylabel.textContent = 'Velocity (km/s)';
    graph.appendChild(ylabel);

    const observed = [
      [0.7,55,10],[1.3,92,8],[2.0,112,7],[2.8,128,6],[3.5,137,5],[4.2,144,5],[4.9,147,4],
      [5.5,148,4],[6.2,150,4],[6.9,153,4],[7.6,154,3],[8.2,155,3],[9.6,156,3],[11.0,153,3],
      [12.3,153,3],[13.7,152,3],[15.0,152,3],[16.5,150,3],[18.0,149,3],[19.4,148,3],[20.6,147,3],
      [22.1,147,3],[23.6,148,3],[24.9,148,3],[26.2,149,3],[27.4,150,3],[28.6,150,4],[30.0,148,5]
    ];

    const disk = [[0,0],[1.2,55],[2.4,82],[4,88],[6,84],[8,78],[10,72],[12,66],[15,60],[18,55],[21,51],[24,48],[27,46],[30,44]];
    const fit = [[0,0],[.8,58],[1.5,98],[2.3,123],[3.4,139],[4.6,146],[6.0,150],[7.6,153],[9.5,153],[12,152],[15,151],[18,150],[22,149],[26,149],[30,149]];

    const gap = createSvg('path', {
      class: 's4-gap-marker',
      d: `M ${sx(18)} ${sy(150)} L ${sx(18)} ${sy(55)} L ${sx(29)} ${sy(44)} L ${sx(29)} ${sy(150)} Z`
    });
    graph.appendChild(gap);

    function addLine(points, cls) {
      const smooth = makeSmooth(points, 14);
      const d = pathFromData(smooth, sx, sy);
      graph.appendChild(createSvg('path', {
        class: `s4-line-glow ${cls}`,
        d,
        pathLength: 1000
      }));
      graph.appendChild(createSvg('path', {
        class: `s4-line ${cls}`,
        d,
        pathLength: 1000
      }));
    }

    addLine(disk, 's4-line-disk');
    addLine(fit, 's4-line-fit');

    const dataGroup = createSvg('g', { class: 's4-observed-group' });
    graph.appendChild(dataGroup);

    observed.forEach(([x,y,e], i) => {
      const g = createSvg('g', {
        class: 's4-observed-sample',
        'data-index': i
      });
      g.style.setProperty('--i', i);

      const errorAttrs = { class: 's4-error-bar', 'data-index': i };
      const eb = createSvg('line', {
        ...errorAttrs,
        x1: sx(x), y1: sy(y-e),
        x2: sx(x), y2: sy(y+e)
      });
      const cap1 = createSvg('line', {
        ...errorAttrs,
        x1: sx(x)-6, y1: sy(y-e),
        x2: sx(x)+6, y2: sy(y-e)
      });
      const cap2 = createSvg('line', {
        ...errorAttrs,
        x1: sx(x)-6, y1: sy(y+e),
        x2: sx(x)+6, y2: sy(y+e)
      });
      const pt = createSvg('circle', {
        class: 's4-data-point s4-observed-point',
        'data-index': i,
        cx: sx(x), cy: sy(y), r: 5.4
      });

      [eb, cap1, cap2, pt].forEach(node => node.style.setProperty('--i', i));
      g.appendChild(eb);
      g.appendChild(cap1);
      g.appendChild(cap2);
      g.appendChild(pt);
      dataGroup.appendChild(g);
    });

    const legend = createSvg('g', {
      class: 's4-legend',
      transform: `translate(${margin.left + 54} ${H - margin.bottom - 86})`
    });

    const items = [
      ['legend-data', 'NGC 3198 observed data', 'data'],
      ['legend-disk', 'visible matter only', 'disk'],
      ['legend-fit', 'with dark matter included', 'fit']
    ];

    items.forEach((item, i) => {
      const g = createSvg('g', {
        class: `s4-legend-item ${item[0]}`,
        transform: `translate(0 ${i * 30})`
      });

      if (item[2] === 'data') {
        g.appendChild(createSvg('circle', {
          class: 's4-data-point',
          cx: 0, cy: 0, r: 5
        }));
      } else {
        const cls = item[2] === 'disk' ? 's4-line-disk' : 's4-line-fit';
        g.appendChild(createSvg('line', {
          class: `s4-line ${cls}`,
          x1: -16, y1: 0,
          x2: 20, y2: 0,
          pathLength: 1000
        }));
      }

      const txt = createSvg('text', {
        class: 's4-legend-label',
        x: 36, y: 7
      });
      txt.textContent = item[1];
      g.appendChild(txt);
      legend.appendChild(g);
    });

    graph.appendChild(legend);
  }

  function prepareSlide23Morph() {
    const stream =
      document.getElementById(
        's23MatterStream'
      );

    const source =
      document.querySelectorAll(
        '#baryonParticles .s2-baryon'
      );

    if (
      !stream ||
      !source.length
    ) {
      return;
    }

    stream.innerHTML = '';

    const width =
      window.innerWidth;

    const height =
      window.innerHeight;

    const centerX =
      width * .50;

    const centerY =
      height * .535;

    const tilt =
      -25 *
      Math.PI /
      180;

    const cosTilt =
      Math.cos(tilt);

    const sinTilt =
      Math.sin(tilt);

    const selected =
      Array
        .from(source)
        .filter(
          (_, index) =>
            index % 2 === 0
        )
        .slice(0, 42);

    selected.forEach(
      (node, index) => {
        const rect =
          node.getBoundingClientRect();

        const startX =
          rect.left +
          rect.width / 2;

        const startY =
          rect.top +
          rect.height / 2;

        const fraction =
          selected.length <= 1
            ? 0
            : index /
              (
                selected.length -
                1
              );

        const radius =
          Math.min(
            width,
            height
          ) *
          (
            .055 +
            fraction * .285
          );

        const angle =
          index *
          2.399963229728653 +
          fraction *
          2.8;

        const localX =
          Math.cos(angle) *
          radius;

        const localY =
          Math.sin(angle) *
          radius *
          .36;

        const targetX =
          centerX +
          localX *
          cosTilt -
          localY *
          sinTilt;

        const targetY =
          centerY +
          localX *
          sinTilt +
          localY *
          cosTilt;

        const dx =
          targetX -
          startX;

        const dy =
          targetY -
          startY;

        const swirl =
          (
            index % 2 === 0
              ? 1
              : -1
          ) *
          Math.min(
            width,
            height
          ) *
          (
            .025 +
            fraction * .035
          );

        const midX =
          dx * .54 -
          Math.sin(angle) *
          swirl;

        const midY =
          dy * .54 +
          Math.cos(angle) *
          swirl *
          .42;

        const bit =
          document.createElement(
            'span'
          );

        bit.className =
          's23-matter-bit';

        bit.style.setProperty(
          '--sx',
          `${startX.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--sy',
          `${startY.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--mx',
          `${midX.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--my',
          `${midY.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--dx',
          `${dx.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--dy',
          `${dy.toFixed(2)}px`
        );

        bit.style.setProperty(
          '--size',
          `${
            Math.max(
              3.4,
              Math.min(
                9.5,
                rect.width * .82
              )
            ).toFixed(2)
          }px`
        );

        bit.style.setProperty(
          '--delay',
          `${
            (index % 9) * 26
          }ms`
        );

        stream.appendChild(bit);
      }
    );
  }

  function transitionToSlideThree() {
    prepareSlide23Morph();

    deck.classList.add(
      'is-transitioning-to-slide3'
    );

    slideThree.classList.add(
      's3-ready',
      's3-orbits-intro'
    );

    window.setTimeout(() => {
      deck.classList.add(
        'show-slide-3'
      );
    }, reduced ? 20 : 1660);

    window.setTimeout(() => {
      deck.classList.remove(
        'show-slide-2'
      );
    }, reduced ? 30 : 2240);

    window.setTimeout(() => {
      deck.classList.remove(
        'is-transitioning-to-slide3'
      );

      const stream =
        document.getElementById(
          's23MatterStream'
        );

      if (stream) {
        stream.innerHTML = '';
      }
    }, reduced ? 40 : 2550);
  }

  function clearTrackTransition() {
    if (!trackTransition) return;
    trackTransition.classList.remove('is-active');
    trackTransition.innerHTML = '';
  }

  function buildTrackToGraphTransition() {
    if (!trackTransition) return;
    clearTrackTransition();

    const visibleOrbiters = orbiters
      .map(item => item.node)
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

    const targets = Array.from(
      graph.querySelectorAll('.s4-observed-point')
    );

    if (!visibleOrbiters.length || !targets.length) return;

    const count = Math.min(visibleOrbiters.length, 18);

    for (let i = 0; i < count; i += 1) {
      const source = visibleOrbiters[i];
      const targetIndex = Math.round(i * (targets.length - 1) / Math.max(count - 1, 1));
      const target = targets[targetIndex];
      const startRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const sx = startRect.left + startRect.width / 2;
      const sy = startRect.top + startRect.height / 2;
      const tx = targetRect.left + targetRect.width / 2;
      const ty = targetRect.top + targetRect.height / 2;
      const dx = tx - sx;
      const dy = ty - sy;
      const bend = (i % 2 === 0 ? 1 : -1) * (26 + (i % 5) * 7);
      const mx = dx * .54 - Math.sin(i * .73) * bend;
      const my = dy * .54 + Math.cos(i * .61) * bend * .45;
      const angle = Math.atan2(dy, dx);

      const dot = document.createElement('span');
      dot.className = 's34-track-dot';
      dot.style.setProperty('--sx', `${sx.toFixed(2)}px`);
      dot.style.setProperty('--sy', `${sy.toFixed(2)}px`);
      dot.style.setProperty('--dx', `${dx.toFixed(2)}px`);
      dot.style.setProperty('--dy', `${dy.toFixed(2)}px`);
      dot.style.setProperty('--mx', `${mx.toFixed(2)}px`);
      dot.style.setProperty('--my', `${my.toFixed(2)}px`);
      dot.style.setProperty('--size', `${Math.max(6, startRect.width).toFixed(2)}px`);
      dot.style.setProperty('--trail', `${(28 + i % 4 * 8).toFixed(1)}px`);
      dot.style.setProperty('--angle', `${angle.toFixed(4)}rad`);
      dot.style.setProperty('--delay', `${i * 24}ms`);
      trackTransition.appendChild(dot);
    }

    void trackTransition.offsetWidth;
    trackTransition.classList.add('is-active');
  }

  function prepareGraphToEvidenceTransition() {
    if (!graphTransition || !graphTransitionShell || !graphTransitionClone || !graphStage) return false;

    const target = document.getElementById('s5MiniRotation');
    if (!target) return false;

    const startRect = graphStage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (!startRect.width || !startRect.height || !targetRect.width || !targetRect.height) return false;

    graphTransitionClone.innerHTML = graph.innerHTML;
    graphTransitionShell.style.setProperty('--left', `${startRect.left.toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--top', `${startRect.top.toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--width', `${startRect.width.toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--height', `${startRect.height.toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--dx', `${(targetRect.left - startRect.left).toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--dy', `${(targetRect.top - startRect.top).toFixed(2)}px`);
    graphTransitionShell.style.setProperty('--scale-x', (targetRect.width / startRect.width).toFixed(5));
    graphTransitionShell.style.setProperty('--scale-y', (targetRect.height / startRect.height).toFixed(5));
    return true;
  }

  function transitionToSlideFive() {
    slideFive?.classList.add('s5-ready', 's5-transition-arrived');
    const prepared = prepareGraphToEvidenceTransition();

    deck.classList.add('is-transitioning-to-slide5');
    if (prepared) {
      void graphTransition.offsetWidth;
      graphTransition.classList.add('is-active');
    }

    window.setTimeout(() => {
      deck.classList.add('show-slide-5');
    }, reduced ? 20 : 420);

    window.setTimeout(() => {
      deck.classList.remove('show-slide-4');
    }, reduced ? 30 : 1840);

    window.setTimeout(() => {
      deck.classList.remove('is-transitioning-to-slide5');
      graphTransition?.classList.remove('is-active');
      if (graphTransitionClone) graphTransitionClone.innerHTML = '';
    }, reduced ? 40 : 2200);
  }

  function transitionToSlideFour() {
    deck.classList.add('is-transitioning-to-slide4');
    slideFour.classList.add('s4-ready');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        buildTrackToGraphTransition();
      });
    });

    window.setTimeout(() => {
      slideFour.classList.add('s4-data');
    }, reduced ? 20 : 1540);

    window.setTimeout(() => {
      deck.classList.add('show-slide-4');
      deck.classList.remove('show-slide-3');
    }, reduced ? 30 : 1880);

    window.setTimeout(() => {
      deck.classList.remove('is-transitioning-to-slide4');
      clearTrackTransition();
    }, reduced ? 40 : 2220);
  }

  function reset() {
    window.slides59Controller?.reset?.();
    deck.classList.remove(
      'show-slide-3',
      'show-slide-4',
      'is-transitioning-to-slide3',
      'is-transitioning-to-slide4',
      'is-transitioning-to-slide5'
    );

    clearTrackTransition();
    graphTransition?.classList.remove('is-active');
    if (graphTransitionClone) graphTransitionClone.innerHTML = '';

    slideThree.classList.remove(
      's3-ready',
      's3-orbits-intro',
      's3-predicted',
      's3-equation',
      's3-expected',
      's3-observed'
    );

    slideFour.classList.remove(
      's4-ready',
      's4-data',
      's4-disk',
      's4-halo',
      's4-fit'
    );

    slideFive?.classList.remove('s5-transition-arrived');
  }

  function jumpToSlideThreeStart() {
    reset();
    deck.classList.add('show-slide-3');
    slideThree.classList.add('s3-ready', 's3-orbits-intro');
  }

  function jumpToSlideFourStart() {
    reset();
    deck.classList.add('show-slide-4');
    slideFour.classList.add('s4-ready', 's4-data');
  }

  function jumpToSlideFourComplete() {
    jumpToSlideFourStart();
    slideFour.classList.add('s4-disk', 's4-fit');
  }

  function advance(step) {
    if (step >= 17) {
      return window.slides59Controller?.advance?.(step) ?? step;
    }

    if (step === 7) {
      transitionToSlideThree();
      return 8;
    }

    if (step === 8) {
      slideThree.classList.add('s3-predicted');
      return 9;
    }

    if (step === 9) {
      slideThree.classList.add('s3-equation');
      return 10;
    }

    if (step === 10) {
      slideThree.classList.add('s3-observed');
      return 11;
    }

    if (step === 11) {
      transitionToSlideFour();
      return 12;
    }

    if (step === 12) {
      slideFour.classList.add('s4-disk');
      return 13;
    }

    if (step === 13) {
      slideFour.classList.add('s4-fit');
      return 16;
    }

    if (step === 16) {
      transitionToSlideFive();
      return 17;
    }

    return step;
  }

  buildOrbitRings();
  buildGraph();
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    setRadiusLine();
  });
  requestAnimationFrame(animate);

  window.slide34Controller = {
    advance,
    reset,
    jumpToSlideThreeStart,
    jumpToSlideFourStart,
    jumpToSlideFourComplete,
    transitionToSlideFive
  };
})();

(() => {
  const deck = document.getElementById('deck');
  const slideFive = document.getElementById('slideFive');
  const slideSix = document.getElementById('slideSix');
  const slideSeven = document.getElementById('slideSeven');
  const slideEight = document.getElementById('slideEight');
  const slideNine = document.getElementById('slideNine');

  const canvases = {
    evidence: document.getElementById('s5EvidenceCanvas'),
    web: document.getElementById('s6WebCanvas'),
    halos: document.getElementById('s7HaloCanvas'),
    push: document.getElementById('s8PushPullCanvas'),
    singularity: document.getElementById('s9SingularityCanvas')
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';

  function seededRandom(seed = 12345) {
    let value = seed % 2147483647;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  const rand = seededRandom(59019);

  function makeSvg(name, attrs = {}) {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function resizeCanvas(canvas) {
    if (!canvas) return 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }
    return dpr;
  }

  function active(...classes) {
    return classes.some((cls) => deck.classList.contains(cls));
  }

  function buildMiniRotation() {
    const host = document.getElementById('s5MiniRotation');
    if (!host) return;
    host.innerHTML = '';

    const slideFourGraph = document.getElementById('s4Graph');
    if (slideFourGraph) {
      const clone = slideFourGraph.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('s5-cloned-rotation-graph');
      clone.setAttribute('viewBox', '0 0 1200 760');
      clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      clone.querySelectorAll('.s4-line-halo, .s4-line-glow.s4-line-halo, .legend-halo').forEach((node) => node.remove());
      clone.querySelectorAll('.s4-line, .s4-line-glow, .s4-data-point, .s4-error-bar, .s4-gap-marker, .s4-legend-item').forEach((node) => {
        node.style.opacity = '1';
        node.style.strokeDashoffset = '0';
        node.style.animation = 'none';
        node.style.transition = 'none';
      });

      host.appendChild(clone);
      return;
    }
  }

  function buildEvidenceLines() {
    const group = document.getElementById('s5EvidenceLines');
    if (!group) return;
    group.innerHTML = '';

    const ends = [
      [300, 405],
      [635, 250],
      [1280, 415],
      [448, 720],
      [1136, 720]
    ];

    ends.forEach(([x, y], i) => {
      const path = makeSvg('path', {
        class: 's5-evidence-line',
        d: `M ${x} ${y} C ${(x + 800) / 2} ${y < 500 ? y + 122 : y - 138}, ${(x + 800) / 2} ${y < 500 ? 450 : 596}, 800 492`
      });
      path.style.animationDelay = `${i * -0.16}s`;
      group.appendChild(path);
    });

    buildS5GravityCore();
  }

  function buildS5GravityCore() {
    const group = document.getElementById('s5CoreGrid');
    if (!group || group.children.length) return;

    const cx = 320;
    const cy = 222;

    function warp(x, y) {
      const nx = (x - cx) / 155;
      const ny = (y - cy) / 88;
      const g = Math.exp(-(nx * nx + ny * ny));
      const pull = g * .18;
      const px = x + (cx - x) * pull;
      const py = y + g * 105 + (y - cy) * .055;
      return [px, py];
    }

    function pathFrom(points) {
      return points.map((p, idx) => `${idx ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    }

    let index = 0;
    for (let x = 56; x <= 584; x += 44) {
      const points = [];
      for (let y = 46; y <= 380; y += 8) points.push(warp(x, y));
      const line = makeSvg('path', {
        class: `s5-core-grid-line ${Math.abs(x - cx) < 4 || index % 3 === 0 ? 'major' : ''}`,
        d: pathFrom(points)
      });
      line.style.setProperty('--i', index++);
      group.appendChild(line);
    }

    for (let y = 58; y <= 366; y += 34) {
      const points = [];
      for (let x = 46; x <= 594; x += 8) points.push(warp(x, y));
      const line = makeSvg('path', {
        class: `s5-core-grid-line ${Math.abs(y - cy) < 5 || index % 3 === 0 ? 'major' : ''}`,
        d: pathFrom(points)
      });
      line.style.setProperty('--i', index++);
      group.appendChild(line);
    }
  }

  function buildS6Spacetime() {
    const flat = document.getElementById('s6GridFlat');
    const grid = document.getElementById('s6GridPlane');
    const funnels = document.getElementById('s6FunnelLayer');
    const galaxyField = document.getElementById('s6GalaxyField');
    const ghostField = document.getElementById('s6GhostGalaxyField');
    if (!flat || !grid || !funnels || !galaxyField || !ghostField) return;
    if (grid.children.length && galaxyField.children.length) return;

    flat.innerHTML = '';
    grid.innerHTML = '';
    funnels.innerHTML = '';
    galaxyField.innerHTML = '';
    ghostField.innerHTML = '';

    const galaxies = [
      { x: 405, y: 344, size: 11.2, tilt: -18, hue: -10, sat: 1.16, alpha: .98, delay: 0, remove: false },
      { x: 625, y: 520, size: 7.8, tilt: 26, hue: 18, sat: 1.04, alpha: .92, delay: 120, remove: true, edge: true },
      { x: 824, y: 302, size: 13.4, tilt: 7, hue: -22, sat: 1.24, alpha: 1, delay: 230, remove: false },
      { x: 1044, y: 495, size: 9.5, tilt: -31, hue: 28, sat: 1.08, alpha: .94, delay: 330, remove: true },
      { x: 1215, y: 350, size: 6.8, tilt: 18, hue: 5, sat: 1.18, alpha: .90, delay: 450, remove: true, edge: true },
      { x: 530, y: 664, size: 6.4, tilt: -7, hue: -28, sat: 1.30, alpha: .88, delay: 570, remove: false },
      { x: 930, y: 674, size: 8.2, tilt: 34, hue: 14, sat: 1.06, alpha: .94, delay: 680, remove: false },
      { x: 1280, y: 650, size: 5.6, tilt: -24, hue: -4, sat: 1.22, alpha: .86, delay: 790, remove: true }
    ];

    const ghostGalaxies = [
      { from: 0, x: 335, y: 310, size: 8.0, tilt: -28, delay: 0 },
      { from: 1, x: 570, y: 462, size: 11.4, tilt: 17, delay: 80 },
      { from: 2, x: 770, y: 255, size: 8.9, tilt: -5, delay: 160 },
      { from: 3, x: 1010, y: 430, size: 13.8, tilt: -39, delay: 240 },
      { from: 4, x: 1272, y: 300, size: 9.4, tilt: 24, delay: 320 },
      { from: 5, x: 460, y: 690, size: 9.2, tilt: -12, delay: 400 },
      { from: 6, x: 850, y: 640, size: 5.5, tilt: 42, delay: 480 },
      { from: 7, x: 1190, y: 690, size: 8.6, tilt: -17, delay: 560 },
      { from: 2, x: 670, y: 360, size: 5.2, tilt: 14, delay: 640 },
      { from: 3, x: 1115, y: 590, size: 6.6, tilt: -4, delay: 720 },
      { from: 0, x: 1375, y: 505, size: 4.8, tilt: 31, delay: 800 }
    ];

    const verticals = [];
    for (let x = -160; x <= 1760; x += 72) verticals.push(x);
    const horizontals = [];
    for (let y = -90; y <= 990; y += 48) horizontals.push(y);

    function flatPoint(x, y) {
      return [x, y + (y - 455) * .075];
    }

    function warpPoint(x, y) {
      let dx = 0;
      let dy = (y - 455) * .075;
      galaxies.forEach((g) => {
        const sx = 84 + g.size * 7.8;
        const sy = 58 + g.size * 5.2;
        const nx = (x - g.x) / sx;
        const ny = (y - g.y) / sy;
        const falloff = Math.exp(-(nx * nx + ny * ny));
        dx += (g.x - x) * falloff * .044;
        dy += falloff * (30 + g.size * 5.4);
      });
      return [x + dx, y + dy];
    }

    function pathFrom(points) {
      return points.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    }

    let index = 0;
    verticals.forEach((x) => {
      const flatPts = [];
      const warpPts = [];
      for (let y = -90; y <= 990; y += 14) {
        flatPts.push(flatPoint(x, y));
        warpPts.push(warpPoint(x, y));
      }
      const major = Math.abs(x - 800) < 8 || index % 4 === 0;
      const flatPath = makeSvg('path', { class: `s6-flat-line ${major ? 'major' : ''}`, d: pathFrom(flatPts) });
      const warpPath = makeSvg('path', { class: `s6-grid-line ${major ? 'major' : ''}`, d: pathFrom(warpPts) });
      flatPath.style.setProperty('--i', index);
      warpPath.style.setProperty('--i', index);
      flat.appendChild(flatPath);
      grid.appendChild(warpPath);
      index += 1;
    });

    horizontals.forEach((y) => {
      const flatPts = [];
      const warpPts = [];
      for (let x = -160; x <= 1760; x += 16) {
        flatPts.push(flatPoint(x, y));
        warpPts.push(warpPoint(x, y));
      }
      const major = Math.abs(y - 455) < 8 || index % 4 === 0;
      const flatPath = makeSvg('path', { class: `s6-flat-line ${major ? 'major' : ''}`, d: pathFrom(flatPts) });
      const warpPath = makeSvg('path', { class: `s6-grid-line ${major ? 'major' : ''}`, d: pathFrom(warpPts) });
      flatPath.style.setProperty('--i', index);
      warpPath.style.setProperty('--i', index);
      flat.appendChild(flatPath);
      grid.appendChild(warpPath);
      index += 1;
    });

    galaxies.forEach((g, i) => {
      const well = makeSvg('g', { class: 's6-warp-well' });
      const rx = 52 + g.size * 5.6;
      const ry = 18 + g.size * 2.0;
      well.appendChild(makeSvg('ellipse', { class: 's6-warp-ring', cx: g.x, cy: g.y + 42, rx: rx.toFixed(1), ry: ry.toFixed(1) }));
      [0.70, 0.45, 0.24].forEach((scale) => {
        well.appendChild(makeSvg('ellipse', {
          class: 's6-warp-contour',
          cx: g.x,
          cy: g.y + 42,
          rx: (rx * scale).toFixed(1),
          ry: (ry * scale).toFixed(1)
        }));
      });
      well.appendChild(makeSvg('circle', { class: 's6-warp-core', cx: g.x, cy: g.y + 42, r: (5 + g.size * .45).toFixed(1) }));
      funnels.appendChild(well);

      const node = document.createElement('div');
      node.className = `s6-galaxy ${g.edge ? 'edge-on' : ''} ${g.remove ? 'removable' : ''}`.trim();
      node.style.setProperty('--gx', `${(g.x / 16).toFixed(3)}%`);
      node.style.setProperty('--gy', `${(g.y / 9).toFixed(3)}%`);
      node.style.setProperty('--gsize', `${g.size}vmin`);
      node.style.setProperty('--tilt', `${g.tilt}deg`);
      node.style.setProperty('--hue', `${g.hue}deg`);
      node.style.setProperty('--sat', g.sat);
      node.style.setProperty('--alpha', g.alpha);
      node.style.setProperty('--delay', `${g.delay}ms`);
      node.style.setProperty('--remove-delay', `${(i % 4) * 150}ms`);
      node.style.setProperty('--spin', `${20 + i * 2.7}s`);
      node.innerHTML = '<img src="assets/galaxy-main.webp" alt="" draggable="false" />';
      galaxyField.appendChild(node);
    });

    ghostGalaxies.forEach((g) => {
      const origin = galaxies[g.from % galaxies.length];
      const node = document.createElement('div');
      node.className = 's6-ghost-galaxy';
      node.style.setProperty('--from-x', `${(origin.x / 16).toFixed(3)}%`);
      node.style.setProperty('--from-y', `${(origin.y / 9).toFixed(3)}%`);
      node.style.setProperty('--from-size', `${origin.size}vmin`);
      node.style.setProperty('--from-tilt', `${origin.tilt}deg`);
      node.style.setProperty('--gx', `${(g.x / 16).toFixed(3)}%`);
      node.style.setProperty('--gy', `${(g.y / 9).toFixed(3)}%`);
      node.style.setProperty('--gsize', `${g.size}vmin`);
      node.style.setProperty('--tilt', `${g.tilt}deg`);
      node.style.setProperty('--delay', `${g.delay}ms`);
      node.innerHTML = '<img src="assets/galaxy-main.webp" alt="" draggable="false" />';
      ghostField.appendChild(node);
    });
  }

  const s6HaloField = document.getElementById('s6HaloField');
  function buildS6Halos() {
    if (!s6HaloField || s6HaloField.children.length) return;
    const groups = [
      { n: 28, cls: 'seed', min: 10, max: 20, a: .46 },
      { n: 22, cls: 'mid', min: 18, max: 40, a: .64 },
      { n: 11, cls: 'massive', min: 40, max: 88, a: .84 }
    ];
    let i = 0;
    groups.forEach((g) => {
      for (let j = 0; j < g.n; j += 1) {
        const node = document.createElement('span');
        node.className = `s6-halo ${g.cls}`;
        const x = 11 + rand() * 79;
        const y = 23 + rand() * 57;
        const size = g.min + rand() * (g.max - g.min);
        node.style.left = `${x.toFixed(2)}%`;
        node.style.top = `${y.toFixed(2)}%`;
        node.style.width = `${size.toFixed(2)}px`;
        node.style.setProperty('--i', i);
        node.style.setProperty('--a', (g.a + rand() * .18).toFixed(2));
        node.style.setProperty('--rot', `${(rand() * 180).toFixed(1)}deg`);
        node.style.setProperty('--glow', `${(34 + size * .9).toFixed(0)}px`);
        s6HaloField.appendChild(node);
        i += 1;
      }
    });
  }

  const s7HaloLab = document.getElementById('s7HaloLab');
  function buildS7Halos() {
    if (!s7HaloLab || s7HaloLab.children.length) return;
    const positions = [
      [18,40,160,'bright'], [36,52,240,'cluster'], [58,43,180,'galaxy-poor'], [78,54,210,'feedback'],
      [23,72,120,'dusty'], [48,74,132,'bright'], [70,25,128,'galaxy-poor'], [86,35,96,'bright']
    ];
    positions.forEach(([x, y, size, kind], i) => {
      const halo = document.createElement('span');
      halo.className = `s7-halo-item ${kind}`;
      halo.style.left = `${x}%`;
      halo.style.top = `${y}%`;
      halo.style.setProperty('--size', `${size}px`);
      halo.style.setProperty('--i', i);
      halo.style.setProperty('--a', (0.68 + rand() * .18).toFixed(2));
      const gal = document.createElement('span');
      gal.className = 's7-galaxy-light';
      gal.style.setProperty('--tilt', `${(-38 + rand() * 76).toFixed(1)}deg`);
      gal.style.setProperty('--g', kind === 'galaxy-poor' ? '.18' : kind === 'dusty' ? '.35' : '.86');
      halo.appendChild(gal);
      if (kind === 'galaxy-poor') {
        const dot = document.createElement('span');
        dot.className = 's7-dark-dot';
        halo.appendChild(dot);
      }
      s7HaloLab.appendChild(halo);
    });
  }

  function buildS8Dots() {
    const host = document.getElementById('s8MatterDots');
    if (!host || host.children.length) return;
    for (let i = 0; i < 42; i += 1) {
      const dot = document.createElement('span');
      dot.className = 's8-dot';
      dot.style.setProperty('--x', `${(8 + rand() * 84).toFixed(1)}%`);
      dot.style.setProperty('--y', `${(8 + rand() * 84).toFixed(1)}%`);
      dot.style.setProperty('--dx', `${(-12 + rand() * 24).toFixed(1)}px`);
      dot.style.setProperty('--dy', `${(-12 + rand() * 24).toFixed(1)}px`);
      dot.style.animationDelay = `${(-rand() * 5).toFixed(2)}s`;
      host.appendChild(dot);
    }
  }

  function drawEvidenceCanvas(time = 0) {
    const canvas = canvases.evidence;
    if (!canvas || !active('show-slide-5')) return;
    const dpr = resizeCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const t = time * .00018;
    for (let i = 0; i < (reduced ? 80 : 190); i += 1) {
      const a = i * 2.399963 + t * (i % 9 + 2);
      const r = Math.sqrt(i / 190) * Math.min(W, H) * .53;
      const x = W * .5 + Math.cos(a) * r * (1.08 + .08 * Math.sin(t * 11));
      const y = H * .53 + Math.sin(a) * r * .52;
      const alpha = .04 + (i % 17) / 17 * .18;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${120 + i % 90}, ${170 + i % 55}, 255, ${alpha})`;
      ctx.arc(x, y, (i % 4 + 1) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    const g = ctx.createRadialGradient(W*.5,H*.52,0,W*.5,H*.52,Math.min(W,H)*.35);
    g.addColorStop(0,'rgba(255,226,165,.18)');
    g.addColorStop(.32,'rgba(92,145,255,.13)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation = 'source-over';
  }

  let webNodes = [];
  function buildWebNodes() {
    webNodes = [];
    for (let i = 0; i < 76; i += 1) {
      webNodes.push({
        x: rand(), y: rand(), r: .8 + rand()*2.2,
        vx: (rand()-.5)*.00014, vy: (rand()-.5)*.00014,
        a: .25 + rand()*.55
      });
    }
  }
  buildWebNodes();

  function drawWebCanvas(time = 0) {
    const canvas = canvases.web;
    if (!canvas || !active('show-slide-6')) return;
    const dpr = resizeCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    const grow = slideSix.classList.contains('s6-beat-2') || slideSix.classList.contains('s6-beat-3') || slideSix.classList.contains('s6-beat-4');
    const boost = slideSix.classList.contains('s6-beat-4') ? 1.45 : 1;
    webNodes.forEach((n) => {
      n.x = (n.x + n.vx + 1) % 1; n.y = (n.y + n.vy + 1) % 1;
    });
    for (let i=0;i<webNodes.length;i+=1){
      const a = webNodes[i];
      const ax = a.x*W, ay = a.y*H;
      for (let j=i+1;j<webNodes.length;j+=1){
        const b = webNodes[j];
        const bx = b.x*W, by = b.y*H;
        const dist = Math.hypot(ax-bx, ay-by);
        const cutoff = (grow ? 180 : 105) * dpr;
        if (dist < cutoff) {
          ctx.strokeStyle = `rgba(94, 166, 255, ${(1-dist/cutoff)*.10*boost})`;
          ctx.lineWidth = dpr*.8;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        }
      }
    }
    webNodes.forEach((n) => {
      const size = n.r*dpr*(grow ? 1.8 : .9)*boost;
      ctx.beginPath();
      ctx.fillStyle = `rgba(205, 230, 255, ${n.a*(grow ? .72 : .34)})`;
      ctx.shadowColor = 'rgba(94,160,255,.55)';
      ctx.shadowBlur = 12*dpr;
      ctx.arc(n.x*W, n.y*H, size, 0, Math.PI*2); ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawHaloBackground(time=0) {
    const canvas = canvases.halos;
    if (!canvas || !active('show-slide-7')) return;
    const dpr = resizeCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const W=canvas.width, H=canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    const t=time*.00025;
    for (let arm=0; arm<4; arm+=1){
      ctx.beginPath();
      for (let i=0; i<110; i+=1){
        const u=i/109;
        const x=W*(.12+u*.78);
        const y=H*(.58 + Math.sin(u*7 + arm*1.4 + t*3)*.22 + (arm-1.5)*.035);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`rgba(${95+arm*25}, ${155+arm*20}, 255, .055)`;
      ctx.lineWidth=(2+arm)*dpr;
      ctx.stroke();
    }
    ctx.globalCompositeOperation='source-over';
  }

  const pullParticles = Array.from({length: 92}, () => ({
    a: rand()*Math.PI*2, r: .08 + rand()*.48, p: rand()*Math.PI*2, s: .4+rand()*1.4
  }));
  function drawPushPull(time=0) {
    const canvas = canvases.push;
    if (!canvas || !active('show-slide-8')) return;
    const dpr=resizeCanvas(canvas); const ctx=canvas.getContext('2d'); const W=canvas.width, H=canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    const expand = (slideEight.classList.contains('s8-beat-3') || slideEight.classList.contains('s8-beat-4')) ? 1.22 : .92;

    ctx.strokeStyle='rgba(154,196,255,.055)'; ctx.lineWidth=dpr;
    const spacing=70*dpr*expand; const drift=(time*.02*dpr)%spacing;
    for(let x=-spacing; x<W+spacing; x+=spacing){ ctx.beginPath(); ctx.moveTo(x+drift,0); ctx.lineTo(x+drift,H); ctx.stroke(); }
    for(let y=-spacing; y<H+spacing; y+=spacing){ ctx.beginPath(); ctx.moveTo(0,y+drift); ctx.lineTo(W,y+drift); ctx.stroke(); }

    const wells=[[.28,.52,.22],[.53,.58,.17],[.74,.43,.2]];
    wells.forEach(([x,y,r], idx)=>{
      const gx=W*x, gy=H*y, gr=Math.min(W,H)*r;
      const grad=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
      grad.addColorStop(0,`rgba(106,159,255,${.16+idx*.02})`);
      grad.addColorStop(.5,'rgba(54,88,205,.08)');
      grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
    });
    pullParticles.forEach((p)=>{
      const pulse=.8+Math.sin(time*.001+p.p)*.2;
      const x=W*(.5 + Math.cos(p.a+time*.00008*p.s)*p.r*expand);
      const y=H*(.53 + Math.sin(p.a+time*.00008*p.s)*p.r*.55*expand);
      ctx.fillStyle=`rgba(205,225,255,${.10*pulse})`;
      ctx.beginPath(); ctx.arc(x,y,(1.1+p.s)*dpr,0,Math.PI*2); ctx.fill();
    });
    ctx.globalCompositeOperation='source-over';
  }

  function drawSingularity(time=0) {
    const canvas=canvases.singularity;
    if (!canvas || !active('show-slide-9')) return;
    const dpr=resizeCanvas(canvas); const ctx=canvas.getContext('2d'); const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    const conflict = slideNine.classList.contains('s9-beat-3') || slideNine.classList.contains('s9-beat-4');
    const cx=W*.5, cy=H*.47;
    for(let i=0;i<72;i+=1){
      const a=i*.31+time*.0004;
      const r=(i/72)*Math.min(W,H)*.34*(conflict?1:.64);
      const x=cx+Math.cos(a)*r;
      const y=cy+Math.sin(a)*r*.72;
      ctx.fillStyle=`rgba(${140+i%90},${180+i%50},255,${conflict?.09:.04})`;
      ctx.beginPath(); ctx.arc(x,y,(1.2+(i%5))*dpr,0,Math.PI*2); ctx.fill();
    }
    if(conflict){
      for(let k=0;k<12;k+=1){
        ctx.strokeStyle=`rgba(255,${160+k*6},110,${.10+k*.009})`;
        ctx.lineWidth=(1+k*.16)*dpr;
        ctx.beginPath();
        const off=Math.sin(time*.002+k)*22*dpr;
        ctx.moveTo(cx - 170*dpr, cy + off);
        ctx.bezierCurveTo(cx - 70*dpr, cy - 90*dpr, cx + 80*dpr, cy + 90*dpr, cx + 170*dpr, cy - off);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation='source-over';
  }

  function animate(time=0) {
    drawEvidenceCanvas(time);
    drawWebCanvas(time);
    drawHaloBackground(time);
    drawPushPull(time);
    drawSingularity(time);
    requestAnimationFrame(animate);
  }

  function warp() {
    deck.classList.remove('s59-warp');
    void deck.offsetWidth;
    deck.classList.add('s59-warp');
    window.setTimeout(() => deck.classList.remove('s59-warp'), reduced ? 80 : 1080);
  }

  function showOnly(num) {
    ['show-slide-3','show-slide-4','show-slide-5','show-slide-6','show-slide-7','show-slide-8','show-slide-9'].forEach((cls) => deck.classList.remove(cls));
    deck.classList.add(`show-slide-${num}`);
  }

  function transitionToSlide(num, readyClass) {
    deck.classList.add('s59-warp');
    window.setTimeout(() => deck.classList.remove('s59-warp'), reduced ? 20 : 1100);
    deck.classList.remove('show-slide-5','show-slide-6','show-slide-7','show-slide-8','show-slide-9');
    deck.classList.add(`show-slide-${num}`);
    window.setTimeout(() => {
      const slide = {5: slideFive, 6: slideSix, 7: slideSeven, 8: slideEight, 9: slideNine}[num];
      slide?.classList.add(readyClass);
    }, reduced ? 20 : 920);
  }

  function prepareS56Morph() {
    const source = document.getElementById('s5CoreGravitySurface');
    const shell = document.getElementById('s56MorphShell');
    if (!source || !shell) return;

    const rect = source.getBoundingClientRect();
    shell.innerHTML = '';
    const clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('data-s56-morph-surface', 'true');
    shell.appendChild(clone);
    shell.style.setProperty('--s56-left', `${rect.left.toFixed(2)}px`);
    shell.style.setProperty('--s56-top', `${rect.top.toFixed(2)}px`);
    shell.style.setProperty('--s56-width', `${rect.width.toFixed(2)}px`);
    shell.style.setProperty('--s56-height', `${rect.height.toFixed(2)}px`);
    void shell.offsetWidth;
  }

  function transitionToSlideSix() {
    buildS6Spacetime();
    prepareS56Morph();

    slideSix?.classList.remove('s6-beat-1','s6-beat-2','s6-beat-3','s6-beat-4');
    deck.classList.add('is-transitioning-s5-s6');

    window.setTimeout(() => {
      deck.classList.add('show-slide-6');
      slideSix?.classList.add('s6-ready');
    }, reduced ? 20 : 920);

    window.setTimeout(() => {
      deck.classList.remove('show-slide-5');
    }, reduced ? 30 : 2180);

    window.setTimeout(() => {
      deck.classList.remove('is-transitioning-s5-s6');
      const shell = document.getElementById('s56MorphShell');
      if (shell) shell.innerHTML = '';
    }, reduced ? 40 : 2520);
  }

  function reset() {
    window.slides1020Controller?.reset?.();
    deck.classList.remove(
      'show-slide-5','show-slide-6','show-slide-7','show-slide-8','show-slide-9',
      's59-warp','is-transitioning-to-slide5','is-transitioning-s5-s6'
    );
    slideFive?.classList.remove('s5-ready','s5-transition-arrived','s5-evidence-reveal','s5-beat-1','s5-beat-2','s5-beat-3','s5-beat-4','s5-beat-5');
    slideSix?.classList.remove('s6-ready','s6-beat-1','s6-beat-2','s6-beat-3','s6-beat-4');
    slideSeven?.classList.remove('s7-ready','s7-beat-1','s7-beat-2','s7-beat-3');
    slideEight?.classList.remove('s8-ready','s8-beat-1','s8-beat-2','s8-beat-3','s8-beat-4');
    slideNine?.classList.remove('s9-ready','s9-beat-1','s9-beat-2','s9-beat-3','s9-beat-4');
  }

  function jumpToSlideFiveStart() { reset(); deck.classList.add('show-slide-5'); slideFive.classList.add('s5-ready'); }
  function jumpToSlideSixStart() { reset(); buildS6Spacetime(); deck.classList.add('show-slide-6'); slideSix.classList.add('s6-ready'); }
  function jumpToSlideSevenStart() { reset(); deck.classList.add('show-slide-7'); slideSeven.classList.add('s7-ready'); }
  function jumpToSlideEightStart() { reset(); deck.classList.add('show-slide-8'); slideEight.classList.add('s8-ready'); }
  function jumpToSlideNineStart() { reset(); deck.classList.add('show-slide-9'); slideNine.classList.add('s9-ready'); }

  function completeSlideNine() {
    jumpToSlideNineStart();
    slideNine.classList.add('s9-beat-1','s9-beat-2','s9-beat-3','s9-beat-4');
  }

  function advance(step) {
    if (step >= 41) { return window.slides1020Controller?.advance?.(step) ?? step; }
    if (step === 16) { transitionToSlide(5, 's5-ready'); return 17; }
    if (step === 17) { slideFive.classList.add('s5-evidence-reveal','s5-beat-5'); return 22; }

    if (step === 22) { transitionToSlideSix(); return 23; }
    if (step === 23) { slideSix.classList.add('s6-beat-1'); return 24; }
    if (step === 24) { slideSix.classList.add('s6-beat-2'); return 25; }
    if (step === 25) { slideSix.classList.add('s6-beat-3'); return 26; }
    if (step === 26) { slideSix.classList.add('s6-beat-4'); return 27; }

    if (step === 27) { transitionToSlide(7, 's7-ready'); return 28; }
    if (step === 28) { slideSeven.classList.add('s7-beat-1'); return 29; }
    if (step === 29) { slideSeven.classList.add('s7-beat-2'); return 30; }
    if (step === 30) { slideSeven.classList.add('s7-beat-3'); return 31; }

    if (step === 31) { transitionToSlide(8, 's8-ready'); return 32; }
    if (step === 32) { slideEight.classList.add('s8-beat-1'); return 33; }
    if (step === 33) { slideEight.classList.add('s8-beat-2'); return 34; }
    if (step === 34) { slideEight.classList.add('s8-beat-3'); return 35; }
    if (step === 35) { slideEight.classList.add('s8-beat-4'); return 36; }

    if (step === 36) { transitionToSlide(9, 's9-ready'); return 37; }
    if (step === 37) { slideNine.classList.add('s9-beat-1'); return 38; }
    if (step === 38) { slideNine.classList.add('s9-beat-2'); return 39; }
    if (step === 39) { slideNine.classList.add('s9-beat-3'); return 40; }
    if (step === 40) { slideNine.classList.add('s9-beat-4'); return 41; }
    return step;
  }

  function init() {
    buildMiniRotation();
    buildEvidenceLines();
    buildS6Spacetime();
    buildS6Halos();
    buildS7Halos();
    buildS8Dots();
    Object.values(canvases).forEach(resizeCanvas);
    window.addEventListener('resize', () => Object.values(canvases).forEach(resizeCanvas));
    requestAnimationFrame(animate);

    const params = new URLSearchParams(window.location.search);
    if (params.has('slide5')) jumpToSlideFiveStart();
    if (params.has('slide6')) jumpToSlideSixStart();
    if (params.has('slide7')) jumpToSlideSevenStart();
    if (params.has('slide8')) jumpToSlideEightStart();
    if (params.has('slide9')) jumpToSlideNineStart();
  }

  window.slides59Controller = {
    advance,
    reset,
    jumpToSlideFiveStart,
    jumpToSlideSixStart,
    jumpToSlideSevenStart,
    jumpToSlideEightStart,
    jumpToSlideNineStart,
    completeSlideNine
  };

  init();
})();

(() => {
  const prior = window.slides59Controller;
  const deck = document.getElementById('deck');
  const slideSix = document.getElementById('slideSix');
  const slideSeven = document.getElementById('slideSeven');
  const slideEight = document.getElementById('slideEight');
  const slideNine = document.getElementById('slideNine');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';

  function seededRandom(seed = 8317) {
    let value = seed % 2147483647;
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }
  const rand = seededRandom(77007);

  function makeSvg(name, attrs = {}) {
    const node = document.createElementNS(svgNS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function clearCustomTransitions() {
    ['s67GhostLayer', 's67HaloTraceLayer', 's78GhostLayer'].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.innerHTML = '';
    });
    deck.classList.remove('is-transitioning-s6-s7', 'is-transitioning-s7-s8');
  }

  function graphTargetForMass(massRank, stack, jitter) {
    const x = 12 + massRank * 74;
    const baseY = 76 - Math.pow(1 - massRank, 1.35) * 52;
    const y = Math.max(16, Math.min(78, baseY + stack * 1.55 + jitter));
    return { x, y };
  }

  function buildHaloCensus() {
    const swarm = document.getElementById('s8HaloSwarm');
    const binLayer = document.getElementById('s8CensusBinLayer');
    if (!swarm || !binLayer) return;
    if (swarm.dataset.built === 'yes') return;
    swarm.dataset.built = 'yes';
    swarm.innerHTML = '';
    binLayer.innerHTML = '';

    const binStacks = new Array(12).fill(0);
    const total = 96;
    for (let i = 0; i < total; i += 1) {
      const u = Math.pow(rand(), 2.65);
      const massRank = Math.min(.985, Math.max(.015, u));
      const bin = Math.min(11, Math.floor(massRank * 12));
      const stack = binStacks[bin]++;
      const size = 18 + Math.pow(massRank, 1.45) * 104 + rand() * 12;
      const sx = 7 + rand() * 86;
      const sy = 12 + rand() * 72;
      const target = graphTargetForMass(massRank, stack, (rand() - .5) * 3.2);
      const dx = target.x - sx;
      const dy = target.y - sy;
      const midx = dx * .55 + (rand() - .5) * 12;
      const midy = dy * .55 - 9 - rand() * 12;
      const halo = document.createElement('span');
      halo.className = 's8-swarm-halo';
      halo.style.setProperty('--sx', `${sx.toFixed(2)}vw`);
      halo.style.setProperty('--sy', `${sy.toFixed(2)}vh`);
      halo.style.setProperty('--size', `${size.toFixed(2)}px`);
      halo.style.setProperty('--alpha', (0.42 + (1 - massRank) * .42 + rand() * .08).toFixed(2));
      halo.style.setProperty('--core', (massRank > .72 ? .62 : .28 + rand() * .22).toFixed(2));
      halo.style.setProperty('--delay', `${Math.round(i * 14 + rand() * 260)}ms`);
      halo.style.setProperty('--sort-delay', `${Math.round(i * 13 + bin * 28)}ms`);
      halo.style.setProperty('--float-x', `${((rand() - .5) * 18).toFixed(1)}px`);
      halo.style.setProperty('--float-y', `${((rand() - .5) * 14).toFixed(1)}px`);
      halo.style.setProperty('--dx', `${dx.toFixed(2)}vw`);
      halo.style.setProperty('--dy', `${dy.toFixed(2)}vh`);
      halo.style.setProperty('--mid-x', `${midx.toFixed(2)}vw`);
      halo.style.setProperty('--mid-y', `${midy.toFixed(2)}vh`);
      swarm.appendChild(halo);

      const dot = makeSvg('circle', {
        class: 's8-bin-dot',
        cx: (150 + massRank * 890 + (rand() - .5) * 16).toFixed(1),
        cy: (target.y / 100 * 760 + (rand() - .5) * 8).toFixed(1),
        r: (2.2 + Math.pow(massRank, .5) * 3.0).toFixed(1)
      });
      dot.style.setProperty('--i', i);
      binLayer.appendChild(dot);
    }
  }

  function prepareS67Ghosts() {
    const layer = document.getElementById('s67GhostLayer');
    if (!layer) return;
    layer.innerHTML = '';
    const sources = Array.from(document.querySelectorAll('#s6GalaxyField .s6-galaxy'));
    const fallback = [
      { x: 405, y: 344, size: 80 }, { x: 625, y: 520, size: 64 }, { x: 824, y: 302, size: 92 },
      { x: 1044, y: 495, size: 70 }, { x: 1215, y: 350, size: 54 }, { x: 530, y: 664, size: 54 }
    ];
    const targets = [
      [16, 39], [35, 56], [55, 37], [73, 58], [84, 32], [28, 24]
    ];
    const count = Math.min(6, Math.max(sources.length, fallback.length));
    for (let i = 0; i < count; i += 1) {
      const source = sources[i];
      let sx, sy, size;
      if (source) {
        const rect = source.getBoundingClientRect();
        sx = rect.left + rect.width / 2;
        sy = rect.top + rect.height / 2;
        size = Math.max(38, rect.width);
      } else {
        sx = fallback[i].x / 1600 * window.innerWidth;
        sy = fallback[i].y / 900 * window.innerHeight;
        size = fallback[i].size;
      }
      const [txPct, tyPct] = targets[i % targets.length];
      const tx = txPct / 100 * window.innerWidth;
      const ty = tyPct / 100 * window.innerHeight;
      const ghost = document.createElement('span');
      ghost.className = 's67-ghost-galaxy';
      ghost.style.setProperty('--sx', `${sx.toFixed(2)}px`);
      ghost.style.setProperty('--sy', `${sy.toFixed(2)}px`);
      ghost.style.setProperty('--size', `${Math.min(110, Math.max(46, size)).toFixed(2)}px`);
      ghost.style.setProperty('--dx', `${(tx - sx).toFixed(2)}px`);
      ghost.style.setProperty('--dy', `${(ty - sy).toFixed(2)}px`);
      ghost.style.setProperty('--mx', `${((tx - sx) * .48 + (i % 2 ? -55 : 55)).toFixed(2)}px`);
      ghost.style.setProperty('--my', `${((ty - sy) * .46 - 55 - i * 4).toFixed(2)}px`);
      ghost.style.setProperty('--rot', `${(-24 + i * 13).toFixed(1)}deg`);
      ghost.style.setProperty('--delay', `${i * 70}ms`);
      ghost.innerHTML = `<img src="assets/galaxy-main.webp" onerror="this.onerror=null;this.src='assets/Beauty.jpg';" alt="" />`;
      layer.appendChild(ghost);
    }
  }

  function transitionToSlideSeven() {
    buildHaloCensus();
    prepareS67Ghosts();
    slideSeven?.classList.remove('s7-beat-1','s7-beat-2','s7-beat-3');
    deck.classList.add('is-transitioning-s6-s7');
    window.setTimeout(() => {
      deck.classList.add('show-slide-7');
      slideSeven?.classList.add('s7-ready');
    }, reduced ? 20 : 940);
    window.setTimeout(() => deck.classList.remove('show-slide-6'), reduced ? 30 : 1980);
    window.setTimeout(() => {
      deck.classList.remove('is-transitioning-s6-s7');
      const layer = document.getElementById('s67GhostLayer');
      if (layer) layer.innerHTML = '';
    }, reduced ? 40 : 2350);
  }

  function prepareS78Halos() {
    const handoff = document.getElementById('s78GhostLayer');
    if (!handoff) return;
    handoff.innerHTML = '';
    const sources = Array.from(document.querySelectorAll('#s7HaloLab .s7-case'));
    sources.forEach((source, i) => {
      const rect = source.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const sx = rect.left + rect.width / 2;
      const sy = rect.top + rect.height / 2;
      const tx = (14 + i * 15 + (i % 2) * 5) / 100 * window.innerWidth;
      const ty = (23 + (i % 3) * 20) / 100 * window.innerHeight;
      const halo = document.createElement('span');
      halo.className = 's78-ghost-halo';
      halo.style.setProperty('--sx', `${sx.toFixed(2)}px`);
      halo.style.setProperty('--sy', `${sy.toFixed(2)}px`);
      halo.style.setProperty('--size', `${Math.max(90, rect.width * .92).toFixed(2)}px`);
      halo.style.setProperty('--dx', `${(tx - sx).toFixed(2)}px`);
      halo.style.setProperty('--dy', `${(ty - sy).toFixed(2)}px`);
      halo.style.setProperty('--mx', `${((tx - sx) * .48 + (i % 2 ? 70 : -70)).toFixed(2)}px`);
      halo.style.setProperty('--my', `${((ty - sy) * .42 - 40).toFixed(2)}px`);
      halo.style.setProperty('--delay', `${i * 62}ms`);
      handoff.appendChild(halo);
    });
  }

  function transitionToSlideEight() {
    buildHaloCensus();
    prepareS78Halos();
    slideEight?.classList.remove('s8-beat-1','s8-beat-2','s8-beat-3','s8-beat-4');
    deck.classList.add('is-transitioning-s7-s8');
    window.setTimeout(() => {
      deck.classList.add('show-slide-8');
      slideEight?.classList.add('s8-ready');
    }, reduced ? 20 : 860);
    window.setTimeout(() => deck.classList.remove('show-slide-7'), reduced ? 30 : 1740);
    window.setTimeout(() => {
      deck.classList.remove('is-transitioning-s7-s8');
      const layer = document.getElementById('s78GhostLayer');
      if (layer) layer.innerHTML = '';
    }, reduced ? 40 : 2100);
  }

  function jumpToSlideSevenStart() {
    prior?.reset?.();
    buildHaloCensus();
    deck.classList.add('show-slide-7');
    slideSeven?.classList.add('s7-ready');
  }

  function jumpToSlideEightStart() {
    prior?.reset?.();
    buildHaloCensus();
    deck.classList.add('show-slide-8');
    slideEight?.classList.add('s8-ready');
  }

  function reset() {
    prior?.reset?.();
    clearCustomTransitions();
    slideSeven?.classList.remove('s7-ready','s7-beat-1','s7-beat-2','s7-beat-3');
    slideEight?.classList.remove('s8-ready','s8-beat-1','s8-beat-2','s8-beat-3','s8-beat-4');
  }

  function advance(step) {
    if (step <= 26) return prior?.advance?.(step) ?? step;
    if (step === 27) { transitionToSlideSeven(); return 28; }
    if (step === 28) { slideSeven?.classList.add('s7-beat-1'); return 29; }
    if (step === 29) { slideSeven?.classList.add('s7-beat-2'); return 30; }
    if (step === 30) { slideSeven?.classList.add('s7-beat-3'); return 31; }
    if (step === 31) { transitionToSlideEight(); return 32; }
    if (step === 32) { slideEight?.classList.add('s8-beat-1'); return 33; }
    if (step === 33) { slideEight?.classList.add('s8-beat-2'); return 34; }
    if (step === 34) { slideEight?.classList.add('s8-beat-3'); return 35; }
    if (step === 35) { slideEight?.classList.add('s8-beat-4'); return 36; }
    return prior?.advance?.(step) ?? step;
  }

  buildHaloCensus();

  window.slides59Controller = {
    ...prior,
    advance,
    reset,
    jumpToSlideSevenStart,
    jumpToSlideEightStart
  };
})();

(() => {
  const deck = document.getElementById('deck');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgNS = 'http://www.w3.org/2000/svg';
  const slides = {
    10: document.getElementById('slideTen'),
    11: document.getElementById('slideEleven'),
    12: document.getElementById('slideTwelve'),
    13: document.getElementById('slideThirteen'),
    14: document.getElementById('slideFourteen'),
    15: document.getElementById('slideFifteen'),
    16: document.getElementById('slideSixteen'),
    17: document.getElementById('slideSeventeen'),
    18: document.getElementById('slideEighteen'),
    19: document.getElementById('slideNineteen'),
    20: document.getElementById('slideTwenty')
  };
  const canvases = {
    r10: document.getElementById('s10RoadmapCanvas'),
    r13: document.getElementById('s13RoadmapCanvas'),
    r17: document.getElementById('s17RoadmapCanvas'),
    s11: document.getElementById('s11DensityCanvas'),
    s12: document.getElementById('s12Canvas'),
    s14: document.getElementById('s14FieldCanvas'),
    s15: document.getElementById('s15FieldCanvas'),
    s18: document.getElementById('s18FieldCanvas'),
    s19: document.getElementById('s19HaloCanvas'),
    s20: document.getElementById('s20Canvas')
  };

  function seededRandom(seed = 45191) {
    let value = seed % 2147483647;
    return () => { value = (value * 16807) % 2147483647; return (value - 1) / 2147483646; };
  }
  const rand = seededRandom(83147);
  function el(name, attrs = {}) { const n = document.createElementNS(svgNS, name); Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k, v)); return n; }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
  function resizeCanvas(canvas) {
    if (!canvas) return 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; }
    return dpr;
  }
  function active(num) { return deck.classList.contains(`show-slide-${num}`); }

  function drawDeepDensity(canvas, time = 0, mode = 'blue') {
    if (!canvas) return;
    const dpr = resizeCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    const t = time * 0.00012;
    const colors = mode === 'warm' ? [[255,206,122],[89,153,255],[255,121,201]] : [[105,170,255],[255,220,150],[102,239,255]];
    for (let layer=0; layer<3; layer++) {
      const [r,g,b] = colors[layer];
      for (let i=0; i<55; i++) {
        const u = ((i * 0.618 + layer * .23) % 1);
        const v = ((i * 0.414 + layer * .31) % 1);
        const x = (u + Math.sin(t*(1.1+layer)+i)*.035 + 1) % 1 * W;
        const y = (v + Math.cos(t*(.9+layer)+i*1.7)*.05 + 1) % 1 * H;
        const rr = (55 + ((i*17)%170)) * dpr * (1+layer*.35);
        const grd = ctx.createRadialGradient(x,y,0,x,y,rr);
        grd.addColorStop(0, `rgba(${r},${g},${b},${.025 + layer*.012})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd; ctx.fillRect(x-rr,y-rr,rr*2,rr*2);
      }
    }
    for (let i=0;i<320;i++) {
      const a = i*.159 + t*2.2;
      const r = Math.sqrt(i/320)*Math.min(W,H)*.54;
      const x = W*.5 + Math.cos(a)*r*(1.25 + .08*Math.sin(t*9));
      const y = H*.52 + Math.sin(a)*r*.55;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${145+i%80},${185+i%55},255,${.035 + (i%11)*.011})`;
      ctx.arc(x,y,(.8+(i%4))*dpr,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }

  function drawRoadmap(time=0) {
    if (active(10)) drawDeepDensity(canvases.r10, time, 'blue');
    if (active(13)) drawDeepDensity(canvases.r13, time, 'blue');
    if (active(17)) drawDeepDensity(canvases.r17, time, 'blue');
  }
  function drawS11(time=0) { if (active(11)) drawDeepDensity(canvases.s11, time, 'warm'); }
  function drawS12(time=0) { if (active(12)) drawDeepDensity(canvases.s12, time, 'blue'); }
  function drawS14(time=0) { if (active(14)) drawDeepDensity(canvases.s14, time, 'warm'); }
  function drawS15(time=0) { if (active(15)) drawDeepDensity(canvases.s15, time, 'warm'); }
  function drawS18(time=0) { if (active(18)) drawDeepDensity(canvases.s18, time, 'blue'); }
  function drawS20(time=0) { if (active(20)) drawDeepDensity(canvases.s20, time, 'blue'); }

  const haloSprites = [];
  function buildS19Halos() {
    const canvas = canvases.s19;
    if (!canvas) return;
    haloSprites.length = 0;
    for (let i=0;i<135;i++) {
      const massU = Math.pow(rand(), 2.2);
      const size = 3 + Math.pow(massU, .65)*34;
      const x0 = (rand()*100).toFixed(2)+'vw';
      const y0 = (rand()*100).toFixed(2)+'vh';
      const x1 = (12 + massU*75).toFixed(2)+'vw';
      const spread = (rand()-.5) * (22 - massU*15);
      const y1 = (70 - Math.pow(massU,.55)*44 + spread).toFixed(2)+'vh';
      const n = document.createElement('span');
      n.className = 's19-halo-sprite';
      n.style.setProperty('--x0', x0); n.style.setProperty('--y0', y0);
      n.style.setProperty('--x1', x1); n.style.setProperty('--y1', y1);
      n.style.setProperty('--s', (0.45 + massU*1.7).toFixed(2));
      n.style.setProperty('--i', i);
      n.style.width = `${size}px`; n.style.height = `${size}px`;
      slides[19].appendChild(n);
      haloSprites.push(n);
    }
  }

  function parseCsv(text) {
    const rows = text.trim().split(/\n+/).map(r => r.split(',').map(Number)).filter(r => r.length >= 2 && isFinite(r[0]) && isFinite(r[1]));
    return rows.map(r => ({k:r[0], p:r[1]}));
  }
  function logScale(min,max,a,b){ const lmin=Math.log10(min), lmax=Math.log10(max); return v => a + (Math.log10(v)-lmin)/(lmax-lmin)*(b-a); }
  function linScale(min,max,a,b){ return v => a + (v-min)/(max-min)*(b-a); }
  function pathFrom(points, sx, sy) { return points.map((p,i)=>`${i?'L':'M'} ${sx(p.x??p[0]).toFixed(2)} ${sy(p.y??p[1]).toFixed(2)}`).join(' '); }
  function downsample(arr, n) { const out=[]; for (let i=0;i<n;i++) out.push(arr[Math.floor(i*(arr.length-1)/(n-1))]); return out; }

  async function buildPkGraph() {
    const svg = document.getElementById('s12PkGraph'); if (!svg) return;
    svg.innerHTML = '';
    const W=1280,H=760,m={l:120,r:70,t:78,b:100};
    const group=el('g',{class:'s12-axis-group'}); svg.appendChild(group);
    let data=[];
    try { data = parseCsv(await (await fetch('assets/power_spectrum.csv')).text()); } catch(e) {}
    if (!data.length) { for(let i=0;i<220;i++){ const k=Math.pow(10,-5+i*(7.3/219)); const p=1e5*Math.pow(k/0.01,1.25)/(1+Math.pow(k/0.012,2.7)); data.push({k,p}); } }
    data = data.filter(d=>d.k>0 && d.p>0).sort((a,b)=>a.k-b.k);
    const kMin=data[0].k, kMax=data[data.length-1].k, pMin=Math.min(...data.map(d=>d.p))*0.65, pMax=Math.max(...data.map(d=>d.p))*1.35;
    const sx=logScale(kMin,kMax,m.l,W-m.r), sy=logScale(pMin,pMax,H-m.b,m.t);
    const xTicks=[1e-5,1e-4,1e-3,1e-2,1e-1,1,10,100];
    const yTicks=[1e-3,1e-1,10,1e3,1e5];
    xTicks.filter(x=>x>=kMin&&x<=kMax).forEach(x=>{ group.appendChild(el('line',{class:'s12-grid',x1:sx(x),y1:m.t,x2:sx(x),y2:H-m.b})); const tx=el('text',{class:'s12-tick',x:sx(x),y:H-m.b+42,'text-anchor':'middle'}); tx.textContent=`10${Math.round(Math.log10(x))}`.replace('10-','10⁻').replace('100','10⁰'); group.appendChild(tx); });
    yTicks.filter(y=>y>=pMin&&y<=pMax).forEach(y=>{ group.appendChild(el('line',{class:'s12-grid',x1:m.l,y1:sy(y),x2:W-m.r,y2:sy(y)})); const ty=el('text',{class:'s12-tick',x:m.l-18,y:sy(y)+7,'text-anchor':'end'}); ty.textContent=`10${Math.round(Math.log10(y))}`.replace('10-','10⁻').replace('100','10⁰'); group.appendChild(ty); });
    group.appendChild(el('line',{class:'s12-axis',x1:m.l,y1:H-m.b,x2:W-m.r,y2:H-m.b})); group.appendChild(el('line',{class:'s12-axis',x1:m.l,y1:m.t,x2:m.l,y2:H-m.b}));
    const xl=el('text',{class:'s12-label',x:(m.l+W-m.r)/2,y:H-30,'text-anchor':'middle'}); xl.textContent='k [Mpc⁻¹]'; group.appendChild(xl);
    const yl=el('text',{class:'s12-label',x:-H/2,y:42,'text-anchor':'middle',transform:'rotate(-90)'}); yl.textContent='P(k) [Mpc³]'; group.appendChild(yl);
    const pts=downsample(data,360).map(d=>({x:d.k,y:d.p}));
    const d=pathFrom(pts,sx,sy);
    svg.appendChild(el('path',{class:'s12-path-shadow',d,pathLength:'1000'}));
    svg.appendChild(el('path',{class:'s12-path',d,pathLength:'1000'}));
    const max=data.reduce((a,b)=>a.p>b.p?a:b); const cx=sx(max.k), cy=sy(max.p);
    svg.appendChild(el('circle',{class:'s12-turnover',cx,cy,r:42}));
  }

  let hmfData = null;
  async function getHmfData() {
    if (hmfData) return hmfData;
    try { hmfData = await (await fetch('assets/hmf-pipeline-data.json')).json(); } catch(e) { hmfData = null; }
    return hmfData;
  }
  async function buildSigmaGraph() {
    const svg=document.getElementById('s18SigmaGraph'); if(!svg) return; svg.innerHTML='';
    const data=await getHmfData(); if(!data) return;
    const W=1180,H=680,m={l:100,r:62,t:60,b:82};
    const M=data.M_h_values, sig=data.sigma_values, deriv=data.dlog_sigma_dlog_M;
    const sx=logScale(Math.min(...M),Math.max(...M),m.l,W-m.r);
    const sy=logScale(Math.min(...sig)*.8,Math.max(...sig)*1.15,H-m.b,m.t);
    const syd=linScale(Math.min(...deriv)*1.1,Math.max(...deriv)*.65,H-m.b,m.t);
    [1e8,1e10,1e12,1e14,1e15].forEach(x=>{svg.appendChild(el('line',{class:'s18-grid',x1:sx(x),y1:m.t,x2:sx(x),y2:H-m.b})); const t=el('text',{class:'s18-tick',x:sx(x),y:H-m.b+38,'text-anchor':'middle'}); t.textContent=`10${Math.round(Math.log10(x))}`.replace('10','10^'); svg.appendChild(t);});
    [0.5,1,2,4].forEach(y=>{svg.appendChild(el('line',{class:'s18-grid',x1:m.l,y1:sy(y),x2:W-m.r,y2:sy(y)})); const t=el('text',{class:'s18-tick',x:m.l-16,y:sy(y)+7,'text-anchor':'end'}); t.textContent=y; svg.appendChild(t);});
    svg.appendChild(el('line',{class:'s18-axis',x1:m.l,y1:H-m.b,x2:W-m.r,y2:H-m.b})); svg.appendChild(el('line',{class:'s18-axis',x1:m.l,y1:m.t,x2:m.l,y2:H-m.b}));
    const xl=el('text',{class:'s18-label',x:(m.l+W-m.r)/2,y:H-24,'text-anchor':'middle'}); xl.textContent='M [h⁻¹ M☉]'; svg.appendChild(xl);
    const yl=el('text',{class:'s18-label',x:-H/2,y:36,'text-anchor':'middle',transform:'rotate(-90)'}); yl.textContent='σ(M)'; svg.appendChild(yl);
    const d=pathFrom(M.map((x,i)=>[x,sig[i]]),sx,sy); svg.appendChild(el('path',{class:'s18-path',d,pathLength:'1000'}));
    const dd=pathFrom(M.map((x,i)=>[x,deriv[i]]),sx,syd); svg.appendChild(el('path',{class:'s18-deriv',d:dd,pathLength:'1000'}));
  }
  async function buildHmfGraph() {
    const svg=document.getElementById('s19HmfGraph'); if(!svg) return; svg.innerHTML='';
    const data=await getHmfData(); if(!data) return;
    const W=1280,H=760,m={l:116,r:72,t:76,b:96}; const M=data.M_h_values, st=data.hmf_ST_h, ps=data.hmf_PS_h;
    const valid=st.map((y,i)=>({M:M[i],st:y,ps:ps[i]})).filter(d=>d.st>0&&d.ps>0);
    const yMin=Math.min(...valid.map(d=>d.st))*0.65, yMax=Math.max(...valid.map(d=>d.st))*1.8;
    const sx=logScale(Math.min(...M),Math.max(...M),m.l,W-m.r), sy=logScale(yMin,yMax,H-m.b,m.t);
    [1e8,1e10,1e12,1e14,1e15].forEach(x=>{svg.appendChild(el('line',{class:'s19-grid',x1:sx(x),y1:m.t,x2:sx(x),y2:H-m.b})); const t=el('text',{class:'s19-tick',x:sx(x),y:H-m.b+40,'text-anchor':'middle'}); t.textContent=`10${Math.round(Math.log10(x))}`.replace('10','10^'); svg.appendChild(t);});
    const yTicks=[1e-9,1e-7,1e-5,1e-3,1e-1,1,10].filter(y=>y>=yMin&&y<=yMax);
    yTicks.forEach(y=>{svg.appendChild(el('line',{class:'s19-grid',x1:m.l,y1:sy(y),x2:W-m.r,y2:sy(y)})); const t=el('text',{class:'s19-tick',x:m.l-17,y:sy(y)+7,'text-anchor':'end'}); t.textContent=`10${Math.round(Math.log10(y))}`.replace('10-','10⁻').replace('100','10⁰'); svg.appendChild(t);});
    svg.appendChild(el('line',{class:'s19-axis',x1:m.l,y1:H-m.b,x2:W-m.r,y2:H-m.b})); svg.appendChild(el('line',{class:'s19-axis',x1:m.l,y1:m.t,x2:m.l,y2:H-m.b}));
    const xl=el('text',{class:'s19-label',x:(m.l+W-m.r)/2,y:H-26,'text-anchor':'middle'}); xl.textContent='halo mass M [h⁻¹ M☉]'; svg.appendChild(xl);
    const yl=el('text',{class:'s19-label',x:-H/2,y:38,'text-anchor':'middle',transform:'rotate(-90)'}); yl.textContent='dn/dlnM'; svg.appendChild(yl);
    svg.appendChild(el('path',{class:'s19-path',d:pathFrom(valid.map(d=>[d.M,d.st]),sx,sy),pathLength:'1000'}));
    svg.appendChild(el('path',{class:'s19-ps',d:pathFrom(valid.map(d=>[d.M,d.ps]),sx,sy),pathLength:'1000'}));
  }

  function buildS14Windows() {
    const host=document.getElementById('s14WindowLayer'); if(!host) return; host.innerHTML='';
    const positions=[];
    for(let row=0;row<4;row++) for(let col=0;col<8;col++) positions.push({x:9+col*11.8+(row%2)*4.2,y:28+row*13.2+(rand()-.5)*2});
    positions.forEach((p,i)=>{ const n=document.createElement('div'); n.className='s14-window'+(i===13?' focus':''); n.style.left=`${p.x}vw`; n.style.top=`${p.y}vh`; n.style.setProperty('--i',i); const delta=((rand()*2.2-1.1)+(i===13?.65:0)).toFixed(2); const sp=document.createElement('span'); sp.textContent=(delta>=0?'+':'')+delta; n.appendChild(sp); host.appendChild(n); });
  }

  const samples=[];
  function gaussianRandom() { let u=0,v=0; while(u===0)u=rand(); while(v===0)v=rand(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
  function sampleTargets(count=96) {
    if(samples.length) return samples;
    const bins = new Map();
    for(let i=0;i<count;i++) {
      const d = clamp(gaussianRandom()*0.72, -2.15, 2.25);
      const bin = Math.round((d+2.4)/.28);
      const stack = bins.get(bin)||0; bins.set(bin, stack+1);
      const x0 = `${7 + rand()*84}vw`, y0=`${23 + rand()*55}vh`;
      const x = 17 + (d+2.4)/(4.8)*66;
      const yBase = 73 - Math.exp(-0.5*Math.pow(d/.82,2))*46;
      const y = yBase - stack*1.55;
      samples.push({i,d,x0,y0,x1:`${x.toFixed(2)}vw`,y1:`${y.toFixed(2)}vh`,tail:d>1.25});
    }
    return samples;
  }
  function buildGaussianSvg(svgId, threshold=false) {
    const svg=document.getElementById(svgId); if(!svg) return; svg.innerHTML='';
    const defs=el('defs'); const lg=el('linearGradient',{id:'gaussFill',x1:'0',x2:'0',y1:'0',y2:'1'}); lg.appendChild(el('stop',{offset:'0%','stop-color':'rgba(122,198,255,.38)'})); lg.appendChild(el('stop',{offset:'100%','stop-color':'rgba(122,198,255,0)'})); defs.appendChild(lg); svg.appendChild(defs);
    const W=1280,H=720; const base=610; const sx=d=>170+(d+2.6)/5.2*930; const sy=d=>base-Math.exp(-0.5*(d/.84)**2)*420;
    svg.appendChild(el('line',{class:'gauss-axis',x1:130,y1:base,x2:1150,y2:base}));
    const pts=[]; for(let i=0;i<=180;i++){const d=-2.6+i*5.2/180; pts.push([sx(d),sy(d)]);} 
    const lineD=pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const fillD=lineD+` L ${sx(2.6)} ${base} L ${sx(-2.6)} ${base} Z`;
    svg.appendChild(el('path',{class:'gauss-fill',d:fillD})); svg.appendChild(el('path',{class:'gauss-line',d:lineD,pathLength:'1000'}));
    const zero=el('text',{x:sx(0),y:base+40,'text-anchor':'middle',fill:'rgba(230,240,255,.7)','font-size':'21'}); zero.textContent='average density'; svg.appendChild(zero);
    const low=el('text',{x:sx(-1.8),y:base+40,'text-anchor':'middle',fill:'rgba(230,240,255,.55)','font-size':'19'}); low.textContent='underdense'; svg.appendChild(low);
    const high=el('text',{x:sx(1.9),y:base+40,'text-anchor':'middle',fill:'rgba(255,228,170,.72)','font-size':'19'}); high.textContent='overdense'; svg.appendChild(high);
    if(threshold){ const tx=sx(1.28); svg.appendChild(el('line',{class:'threshold-line',x1:tx,y1:base,x2:tx,y2:168})); }
  }
  function buildSamples(hostId, sixteen=false) {
    const host=document.getElementById(hostId); if(!host) return; host.innerHTML='';
    sampleTargets().forEach(s=>{ const n=document.createElement('span'); n.className=(sixteen?'s16-dot':'s15-dot')+(s.tail?' tail':''); n.style.setProperty('--x0',s.x0); n.style.setProperty('--y0',s.y0); n.style.setProperty('--x1',s.x1); n.style.setProperty('--y1',s.y1); n.style.setProperty('--i',s.i); host.appendChild(n); });
  }
  function buildS16Halos() {
    const host=document.getElementById('s16HaloStage'); if(!host) return; host.innerHTML='';
    const tails=sampleTargets().filter(s=>s.tail);
    tails.forEach((s,i)=>{ const n=document.createElement('span'); n.className='s16-halo'; n.style.setProperty('--hx0',s.x1); n.style.setProperty('--hy0',s.y1); n.style.setProperty('--hx1',`${60+i*4.3}vw`); n.style.setProperty('--hy1',`${19+(i%3)*9}vh`); n.style.setProperty('--hs',(0.72+i*.045).toFixed(2)); n.style.setProperty('--i',i); host.appendChild(n); });
  }

  function armRoadmapZoom(slideNum, nodeName) {
    const slide=slides[slideNum]; if(!slide) return;
    const node=slide.querySelector(`[data-node="${nodeName}"]`); const cam=slide.querySelector('.roadmap-camera'); if(!node||!cam) return;
    slide.querySelectorAll('.roadmap-node').forEach(n=>n.classList.remove('selected'));
    node.classList.add('selected');
    const r=node.getBoundingClientRect(); const vw=window.innerWidth, vh=window.innerHeight;
    const scale=Math.min((vw*.82)/r.width,(vh*.82)/r.height,5.2);
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    slide.style.setProperty('--rm-scale',scale.toFixed(3));
    slide.style.setProperty('--rm-x',`${(vw/2-cx).toFixed(1)}px`); slide.style.setProperty('--rm-y',`${(vh/2-cy).toFixed(1)}px`);
    slide.classList.add('rm-zooming');
  }
  function warp(x=50,y=50){ let w=document.querySelector('.s1020-warp'); if(!w){ w=document.createElement('div'); w.className='s1020-warp'; deck.appendChild(w); } w.style.setProperty('--wx',`${x}%`); w.style.setProperty('--wy',`${y}%`); deck.classList.remove('s1020-warping'); void deck.offsetWidth; deck.classList.add('s1020-warping'); setTimeout(()=>deck.classList.remove('s1020-warping'), reduced?60:1120); }
  function showOnly(num){ for(let i=3;i<=20;i++) deck.classList.remove(`show-slide-${i}`); deck.classList.add(`show-slide-${num}`); }
  function transitionToSlide(num, readyClass, wx=50,wy=50){ warp(wx,wy); setTimeout(()=>showOnly(num), reduced?10:420); setTimeout(()=>slides[num]?.classList.add(readyClass), reduced?20:920); }
  function reset() { for(let i=10;i<=20;i++){ deck.classList.remove(`show-slide-${i}`); const s=slides[i]; if(!s) continue; [...s.classList].filter(c=>/^s\d+-/.test(c)||c==='is-ready'||c==='rm-zooming').forEach(c=>s.classList.remove(c)); s.querySelectorAll('.selected').forEach(n=>n.classList.remove('selected')); } deck.classList.remove('s1020-warping'); }
  function jumpTo(num){ reset(); showOnly(num); const s=slides[num]; if(s){ s.classList.add(num===10||num===13||num===17?'is-ready':`s${num}-ready`); } }

  function advance(step) {
    if (step === 41) { transitionToSlide(10,'is-ready'); return 42; }
    if (step === 42) { armRoadmapZoom(10,'pk'); return 43; }
    if (step === 43) { transitionToSlide(11,'s11-ready',28,42); return 44; }
    if (step === 44) { slides[11].classList.add('s11-beat-1'); return 45; }
    if (step === 45) { slides[11].classList.add('s11-beat-2'); return 46; }
    if (step === 46) { slides[11].classList.add('s11-beat-3'); return 47; }
    if (step === 47) { slides[11].classList.add('s11-beat-4'); return 48; }
    if (step === 48) { transitionToSlide(12,'s12-ready',50,50); return 49; }
    if (step === 49) { slides[12].classList.add('s12-beat-1'); return 50; }
    if (step === 50) { slides[12].classList.add('s12-beat-2'); return 51; }
    if (step === 51) { slides[12].classList.add('s12-beat-3'); return 52; }
    if (step === 52) { slides[12].classList.add('s12-beat-4'); return 53; }
    if (step === 53) { transitionToSlide(13,'is-ready',36,56); return 54; }
    if (step === 54) { armRoadmapZoom(13,'window'); return 55; }
    if (step === 55) { transitionToSlide(14,'s14-ready',44,58); return 56; }
    if (step === 56) { slides[14].classList.add('s14-beat-1'); return 57; }
    if (step === 57) { slides[14].classList.add('s14-beat-2'); return 58; }
    if (step === 58) { slides[14].classList.add('s14-beat-3'); return 59; }
    if (step === 59) { slides[14].classList.add('s14-beat-4'); return 60; }
    if (step === 60) { transitionToSlide(15,'s15-ready',52,52); return 61; }
    if (step === 61) { slides[15].classList.add('s15-beat-1'); return 62; }
    if (step === 62) { slides[15].classList.add('s15-beat-2'); return 63; }
    if (step === 63) { slides[15].classList.add('s15-beat-3'); return 64; }
    if (step === 64) { transitionToSlide(16,'s16-ready',67,47); return 65; }
    if (step === 65) { slides[16].classList.add('s16-beat-1'); return 66; }
    if (step === 66) { slides[16].classList.add('s16-beat-2'); return 67; }
    if (step === 67) { slides[16].classList.add('s16-beat-3'); return 68; }
    if (step === 68) { transitionToSlide(17,'is-ready',60,36); return 69; }
    if (step === 69) { armRoadmapZoom(17,'hmf'); return 70; }
    if (step === 70) { transitionToSlide(18,'s18-ready',74,59); return 71; }
    if (step === 71) { slides[18].classList.add('s18-beat-1'); return 72; }
    if (step === 72) { slides[18].classList.add('s18-beat-2'); return 73; }
    if (step === 73) { slides[18].classList.add('s18-beat-3'); return 74; }
    if (step === 74) { transitionToSlide(19,'s19-ready',50,50); return 75; }
    if (step === 75) { slides[19].classList.add('s19-beat-1'); return 76; }
    if (step === 76) { slides[19].classList.add('s19-beat-2'); return 77; }
    if (step === 77) { slides[19].classList.add('s19-beat-3'); return 78; }
    if (step === 78) { slides[19].classList.add('s19-beat-4'); return 79; }
    if (step === 79) { transitionToSlide(20,'s20-ready',50,48); return 80; }
    if (step === 80) { slides[20].classList.add('s20-beat-1'); return 81; }
    if (step === 81) { slides[20].classList.add('s20-beat-2'); return 82; }
    return step;
  }

  function animate(time=0) { drawRoadmap(time); drawS11(time); drawS12(time); drawS14(time); drawS15(time); drawS18(time); drawS20(time); requestAnimationFrame(animate); }
  function init() {
    Object.values(canvases).forEach(resizeCanvas);
    buildS14Windows(); buildGaussianSvg('s15GaussianSvg'); buildGaussianSvg('s16GaussianSvg', true); buildSamples('s15SampleLayer'); buildSamples('s16SampleLayer', true); buildS16Halos(); buildS19Halos();
    buildPkGraph(); buildSigmaGraph(); buildHmfGraph();
    window.addEventListener('resize', () => Object.values(canvases).forEach(resizeCanvas));
    requestAnimationFrame(animate);
    const params = new URLSearchParams(window.location.search); for (let i=10;i<=20;i++) if (params.has(`slide${i}`)) jumpTo(i);
  }
  window.slides1020Controller = { advance, reset, jumpTo };
  init();
})();

(() => {
  const prior = window.slides59Controller;
  const deck = document.getElementById('deck');
  const slideEight = document.getElementById('slideEight');
  const slideTen = document.getElementById('slideTen');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function jumpToPipelineRoadmap() {
    if (window.slides1020Controller?.jumpTo) {
      window.slides1020Controller.jumpTo(10);
      return;
    }
    for (let i = 3; i <= 20; i += 1) deck.classList.remove(`show-slide-${i}`);
    deck.classList.add('show-slide-10');
    slideTen?.classList.add('is-ready');
  }

  function transitionToPipelineRoadmap() {
    deck.classList.add('s59-warp');
    slideEight?.classList.add('s8-exiting-to-pipeline');
    window.setTimeout(() => deck.classList.remove('s59-warp'), reduced ? 20 : 1060);
    window.setTimeout(() => {
      jumpToPipelineRoadmap();
    }, reduced ? 20 : 420);
    window.setTimeout(() => {
      deck.classList.remove('show-slide-8');
      slideEight?.classList.remove('s8-exiting-to-pipeline');
    }, reduced ? 30 : 940);
  }

  function advance(step) {
    if (step === 36) {
      transitionToPipelineRoadmap();
      return 42;
    }
    return prior?.advance?.(step) ?? step;
  }

  window.slides59Controller = {
    ...prior,
    advance,
    jumpToSlideNineStart: jumpToPipelineRoadmap,
    completeSlideNine: jumpToPipelineRoadmap
  };
})();
