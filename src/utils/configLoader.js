/**
 * Configuration loader utility
 * Loads and caches game configuration from JSON files
 * Works in both browser and Node.js environments
 */

// Cache loaded configs
let configCache = {};

// Detect if we're running in Node.js or browser
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * Load a configuration file
 * @param {string} filename - The config filename (e.g., 'game.json')
 * @returns {Promise<Object>} The parsed configuration
 */
export async function loadConfig(filename) {
  if (configCache[filename]) {
    return configCache[filename];
  }

  let config;

  if (isNode) {
    // Node.js environment (for tests) - use dynamic imports to avoid bundling
    try {
      const fs = await import('fs');
      const url = await import('url');
      const path = await import('path');

      const __filename = url.fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const configPath = path.join(__dirname, '../../config', filename);
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to load config in Node.js: ${filename} - ${error.message}`);
    }
  } else {
    // Browser environment
    const response = await fetch(`/config/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${filename}`);
    }
    config = await response.json();
  }

  configCache[filename] = config;
  return config;
}

/**
 * Get all configuration objects
 * @returns {Promise<Object>} Object containing all configs
 */
export async function loadAllConfigs() {
  const [game, economy, parts, evolution] = await Promise.all([
    loadConfig('game.json'),
    loadConfig('economy.json'),
    loadConfig('parts.json'),
    loadConfig('evolution.json')
  ]);

  return {
    game,
    economy,
    parts,
    evolution
  };
}

/**
 * Get game settings
 * @returns {Promise<Object>} Game configuration
 */
export async function getGameConfig() {
  return await loadConfig('game.json');
}

/**
 * Get economy settings
 * @returns {Promise<Object>} Economy configuration
 */
export async function getEconomyConfig() {
  return await loadConfig('economy.json');
}

/**
 * Get all parts definitions
 * @returns {Promise<Array>} Array of part definitions
 */
export async function getPartsConfig() {
  const config = await loadConfig('parts.json');
  return config.parts;
}

/**
 * Get a specific part by ID
 * @param {string} partId - The part ID
 * @returns {Promise<Object|null>} Part definition or null if not found
 */
export async function getPartById(partId) {
  const parts = await getPartsConfig();
  return parts.find(p => p.id === partId) || null;
}

/**
 * Get evolution/GA settings
 * @returns {Promise<Object>} Evolution configuration
 */
export async function getEvolutionConfig() {
  return await loadConfig('evolution.json');
}

/**
 * Clear the configuration cache (useful for testing or hot-reload)
 */
export function clearConfigCache() {
  configCache = {};
}
