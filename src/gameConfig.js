/**
 * Game configuration loaded from JSON files
 * This module provides access to parts, economy, and game settings
 */

import { getPartsConfig, getEconomyConfig } from './utils/configLoader.js';

// Load configurations using top-level await
const partsArray = await getPartsConfig();
const economyConfig = await getEconomyConfig();

// Convert parts array to object map for backwards compatibility
export const PART_DEFINITIONS = {};
for (const part of partsArray) {
  PART_DEFINITIONS[part.id] = {
    id: part.id,
    label: part.name,
    desc: part.name, // Use name as description fallback
    ability: part.name,
    price: part.price,
    unlocked: part.unlocked,
    kind: part.type === 'body' ? 'block' : part.id,
    icon: getIconForPart(part.id),
    tier: getTierForPrice(part.price),
    ...part.properties
  };
}

// Export economy settings
export const ECONOMY = {
  STARTING_MONEY: economyConfig.startingMoney,
  MONEY_PER_MILESTONE: economyConfig.moneyPerMilestone,
  MILESTONE_DISTANCE: economyConfig.milestoneDistance
};

/**
 * Get icon emoji for a part (for UI display)
 */
function getIconForPart(partId) {
  const icons = {
    block: '🟫',
    wheel: '⚙️',
    big_wheel: '🛞',
    small_wheel: '⚙️',
    tiny_wheel: '⚙️',
    long_body: '📏',
    jetpack: '🚀'
  };
  return icons[partId] || '❓';
}

/**
 * Get tier based on price (for UI display)
 */
function getTierForPrice(price) {
  if (price === 0) return 'common';
  if (price < 100) return 'uncommon';
  if (price < 200) return 'rare';
  return 'legendary';
}
