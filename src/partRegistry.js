// Part Configuration Registry
// Single source of truth for part visual styles, sprites, shapes, and capabilities
// Loaded from config/parts.json

import { getPartsConfig } from './utils/configLoader.js';

// Load parts configuration
const partsArray = await getPartsConfig();

// Build style map from configuration
const PART_STYLE_MAP = {};
const WHEEL_DETAIL_SCALE = {};
const SPRITE_MAP = {};

for (const part of partsArray) {
  const partKind = part.id;

  // Visual styles
  PART_STYLE_MAP[partKind] = {
    fill: part.visual.fill,
    stroke: part.visual.stroke,
    accent: part.visual.accent
  };

  // Wheel detail scale (if applicable)
  if (part.visual.detailScale !== undefined) {
    WHEEL_DETAIL_SCALE[partKind] = part.visual.detailScale;
  }

  // Sprite mapping (simple mapping, not using variants for now)
  SPRITE_MAP[partKind] = () => part.visual.sprite;
}

// Determine wheel kinds from part types
const WHEEL_KINDS = new Set(
  partsArray
    .filter(p => p.type === 'wheel')
    .map(p => p.id)
);

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
