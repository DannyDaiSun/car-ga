// Part Configuration Registry
// Single source of truth for part visual styles, sprites, shapes, and capabilities

const PART_STYLE_MAP = {
  block: { fill: '#d9455f', stroke: '#2f483a', accent: '#f4b23f' },
  long_body: { fill: '#4a74e0', stroke: '#1d2e66', accent: '#9bb8ff' },
  wheel: { fill: '#43464b', stroke: '#1b1e23', accent: '#8b8f96' },
  big_wheel: { fill: '#3d3f44', stroke: '#1b1e23', accent: '#9ba2ab' },
  small_wheel: { fill: '#4f5258', stroke: '#1b1e23', accent: '#9ba2ab' },
  tiny_wheel: { fill: '#5b6066', stroke: '#1b1e23', accent: '#9ba2ab' },
  jetpack: { fill: '#ff8a3d', stroke: '#7a2f0b', accent: '#ffd066' }
};

const WHEEL_DETAIL_SCALE = {
  wheel: 0.55,
  big_wheel: 0.45,
  small_wheel: 0.65,
  tiny_wheel: 0.75
};

const SPRITE_MAP = {
  block: (seed) => {
    const variants = ['geo_body_sport', 'geo_body_sport'];
    return variants[seed % variants.length];
  },
  long_body: () => 'geo_body_truck',
  wheel: () => 'geo_wheel_mag',
  big_wheel: () => 'geo_wheel_mag',
  small_wheel: () => 'geo_wheel_mag',
  tiny_wheel: () => 'geo_wheel_mag',
  jetpack: () => 'cyber_booster_rocket'
};

const WHEEL_KINDS = new Set(['wheel', 'big_wheel', 'small_wheel', 'tiny_wheel']);

export function getPartVisualStyle(partKind = 'block') {
  return PART_STYLE_MAP[partKind] ?? PART_STYLE_MAP.block;
}

export function getWheelDetailScale(partKind = 'wheel') {
  return WHEEL_DETAIL_SCALE[partKind] ?? WHEEL_DETAIL_SCALE.wheel;
}

export function getSpriteNameForPart(partKind = 'block', seed = 0) {
  const mapper = SPRITE_MAP[partKind] ?? SPRITE_MAP.block;
  return mapper(seed);
}

export function getShapeType(partKind) {
  return WHEEL_KINDS.has(partKind) ? 'circle' : 'box';
}

export function isWheelKind(partKind) {
  return WHEEL_KINDS.has(partKind);
}

export function hasMotor(partKind) {
  return WHEEL_KINDS.has(partKind);
}
