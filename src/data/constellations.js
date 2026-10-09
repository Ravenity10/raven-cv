// Real constellations for the hero sky (StarField.jsx).
//
// Star positions are J2000 right ascension (hours) and declination (degrees) with apparent
// visual magnitude (lower is brighter), rounded from standard catalogue values. Each figure is
// projected onto a flat plane around its own centre (gnomonic projection), with north up and
// east to the left, as seen looking up at the sky. x/y are then normalized with one shared
// scale (UNIT_DEG degrees = 1 unit), so the figures keep their real sizes relative to each
// other: Scorpius is large, Crux is small. Every figure fits inside -0.5..0.5 on both axes.
//
// `lines` join stars by key. Only the brightest stars carry a `name`; the canvas shows it on hover.

const UNIT_DEG = 30;

const RAW = [
  {
    id: 'orion',
    name: 'Orion',
    stars: {
      betelgeuse: { ra: 5.9195, dec: 7.4071, mag: 0.5, name: 'Betelgeuse' },
      rigel: { ra: 5.2423, dec: -8.2016, mag: 0.13, name: 'Rigel' },
      bellatrix: { ra: 5.4189, dec: 6.3497, mag: 1.64, name: 'Bellatrix' },
      mintaka: { ra: 5.5334, dec: -0.2991, mag: 2.23, name: 'Mintaka' },
      alnilam: { ra: 5.6036, dec: -1.2019, mag: 1.69, name: 'Alnilam' },
      alnitak: { ra: 5.6793, dec: -1.9426, mag: 1.77, name: 'Alnitak' },
      saiph: { ra: 5.7959, dec: -9.6696, mag: 2.09, name: 'Saiph' },
      meissa: { ra: 5.5856, dec: 9.9342, mag: 3.39 },
    },
    lines: [
      ['meissa', 'betelgeuse'],
      ['meissa', 'bellatrix'],
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    stars: {
      dubhe: { ra: 11.0621, dec: 61.7510, mag: 1.79, name: 'Dubhe' },
      merak: { ra: 11.0307, dec: 56.3824, mag: 2.37, name: 'Merak' },
      phecda: { ra: 11.8972, dec: 53.6948, mag: 2.44, name: 'Phecda' },
      megrez: { ra: 12.2571, dec: 57.0326, mag: 3.31 },
      alioth: { ra: 12.9005, dec: 55.9598, mag: 1.77, name: 'Alioth' },
      mizar: { ra: 13.3988, dec: 54.9254, mag: 2.27, name: 'Mizar' },
      alkaid: { ra: 13.7923, dec: 49.3133, mag: 1.86, name: 'Alkaid' },
    },
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    stars: {
      caph: { ra: 0.1530, dec: 59.1498, mag: 2.27, name: 'Caph' },
      schedar: { ra: 0.6751, dec: 56.5373, mag: 2.24, name: 'Schedar' },
      navi: { ra: 0.9451, dec: 60.7167, mag: 2.47, name: 'Navi' },
      ruchbah: { ra: 1.4303, dec: 60.2353, mag: 2.68, name: 'Ruchbah' },
      segin: { ra: 1.9066, dec: 63.6701, mag: 3.37 },
    },
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'navi'],
      ['navi', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    stars: {
      acrab: { ra: 16.0906, dec: -19.8055, mag: 2.62 },
      dschubba: { ra: 16.0056, dec: -22.6217, mag: 2.29, name: 'Dschubba' },
      fang: { ra: 15.9809, dec: -26.1141, mag: 2.89 },
      alniyat: { ra: 16.3531, dec: -25.5928, mag: 2.89 },
      antares: { ra: 16.4901, dec: -26.4320, mag: 1.06, name: 'Antares' },
      paikauhale: { ra: 16.5981, dec: -28.2160, mag: 2.82 },
      larawag: { ra: 16.8361, dec: -34.2932, mag: 2.29 },
      xamidimura: { ra: 16.8645, dec: -38.0474, mag: 3.08 },
      zeta2: { ra: 16.9097, dec: -42.3619, mag: 3.62 },
      eta: { ra: 17.2025, dec: -43.2392, mag: 3.33 },
      sargas: { ra: 17.6220, dec: -42.9978, mag: 1.86, name: 'Sargas' },
      iota1: { ra: 17.7931, dec: -40.1270, mag: 2.99 },
      girtab: { ra: 17.7082, dec: -39.0300, mag: 2.39 },
      shaula: { ra: 17.5601, dec: -37.1038, mag: 1.62, name: 'Shaula' },
      lesath: { ra: 17.5127, dec: -37.2958, mag: 2.7 },
    },
    lines: [
      ['acrab', 'dschubba'],
      ['dschubba', 'fang'],
      ['dschubba', 'alniyat'],
      ['alniyat', 'antares'],
      ['antares', 'paikauhale'],
      ['paikauhale', 'larawag'],
      ['larawag', 'xamidimura'],
      ['xamidimura', 'zeta2'],
      ['zeta2', 'eta'],
      ['eta', 'sargas'],
      ['sargas', 'iota1'],
      ['iota1', 'girtab'],
      ['girtab', 'shaula'],
      ['shaula', 'lesath'],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    stars: {
      deneb: { ra: 20.6905, dec: 45.2803, mag: 1.25, name: 'Deneb' },
      sadr: { ra: 20.3705, dec: 40.2567, mag: 2.23, name: 'Sadr' },
      eta: { ra: 19.9384, dec: 35.0834, mag: 3.89 },
      albireo: { ra: 19.5120, dec: 27.9597, mag: 3.08, name: 'Albireo' },
      fawaris: { ra: 19.7496, dec: 45.1308, mag: 2.87 },
      kappa: { ra: 19.2851, dec: 53.3685, mag: 3.8 },
      aljanah: { ra: 20.7702, dec: 33.9703, mag: 2.48, name: 'Aljanah' },
      zeta: { ra: 21.2156, dec: 30.2269, mag: 3.21 },
    },
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'eta'],
      ['eta', 'albireo'],
      ['sadr', 'fawaris'],
      ['fawaris', 'kappa'],
      ['sadr', 'aljanah'],
      ['aljanah', 'zeta'],
    ],
  },
  {
    id: 'crux',
    name: 'Crux',
    stars: {
      acrux: { ra: 12.4433, dec: -63.0991, mag: 0.76, name: 'Acrux' },
      mimosa: { ra: 12.7953, dec: -59.6888, mag: 1.25, name: 'Mimosa' },
      gacrux: { ra: 12.5194, dec: -57.1132, mag: 1.64, name: 'Gacrux' },
      imai: { ra: 12.2524, dec: -58.7489, mag: 2.79 },
      ginan: { ra: 12.3561, dec: -60.4011, mag: 3.59 },
    },
    lines: [
      ['acrux', 'gacrux'],
      ['mimosa', 'imai'],
    ],
  },
];

const RAD = Math.PI / 180;

// Gnomonic (tangent-plane) projection of one star around the figure's centre, in radians.
function project(star, ra0, dec0) {
  const ra = star.ra * 15 * RAD;
  const dec = star.dec * RAD;
  const dRa = ra - ra0;
  const cosC = Math.sin(dec0) * Math.sin(dec) + Math.cos(dec0) * Math.cos(dec) * Math.cos(dRa);
  const xi = (Math.cos(dec) * Math.sin(dRa)) / cosC;
  const eta = (Math.cos(dec0) * Math.sin(dec) - Math.sin(dec0) * Math.cos(dec) * Math.cos(dRa)) / cosC;
  // East is to the left on a sky chart, and screen y grows downward.
  return { x: -xi, y: -eta };
}

function normalize(figure) {
  const entries = Object.entries(figure.stars);
  // None of these figures straddle 0h of right ascension, so a plain mean is the centre.
  const ra0 = (entries.reduce((sum, [, s]) => sum + s.ra, 0) / entries.length) * 15 * RAD;
  const dec0 = (entries.reduce((sum, [, s]) => sum + s.dec, 0) / entries.length) * RAD;
  const projected = entries.map(([key, star]) => ({ key, star, ...project(star, ra0, dec0) }));
  // Centre the bounding box so each figure sits evenly around its anchor point.
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const unit = UNIT_DEG * RAD;
  const index = Object.fromEntries(projected.map((p, i) => [p.key, i]));

  return {
    id: figure.id,
    name: figure.name,
    stars: projected.map((p) => ({
      x: +((p.x - cx) / unit).toFixed(4),
      y: +((p.y - cy) / unit).toFixed(4),
      mag: p.star.mag,
      name: p.star.name ?? null,
    })),
    lines: figure.lines.map(([a, b]) => [index[a], index[b]]),
  };
}

export const constellations = RAW.map(normalize);
