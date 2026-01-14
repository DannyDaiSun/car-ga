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

export function getPartVisualStyle(partKind = 'block') {
  return PART_STYLE_MAP[partKind] ?? PART_STYLE_MAP.block;
}
