export function isJetpackBoostActive(timeSeconds, jetpackDef) {
    if (!jetpackDef) return false;
    const interval = jetpackDef.boostInterval ?? 1;
    const duration = jetpackDef.boostDuration ?? interval;

    if (interval <= 0) return true;

    const elapsed = timeSeconds % interval;
    return elapsed >= 0 && elapsed < duration;
}

export function updateJetpackEnergy(energyState, jetpackDef, timeSeconds, isInContact, dt) {
    if (!jetpackDef) return energyState;

    // Initialize energy state if not present
    if (energyState.energy === undefined) {
        energyState.energy = jetpackDef.maxEnergy || 100;
    }

    const maxEnergy = jetpackDef.maxEnergy ?? 100;
    const consumptionRate = jetpackDef.energyConsumptionRate ?? 50;
    const rechargeRate = jetpackDef.rechargeRate ?? 80;

    // Check if boost should be active
    const shouldBoost = isJetpackBoostActive(timeSeconds, jetpackDef);

    if (shouldBoost && energyState.energy > 0) {
        // Consume energy during thrust
        energyState.energy = Math.max(0, energyState.energy - consumptionRate * dt);
    } else if (isInContact) {
        // Recharge when in contact with track
        energyState.energy = Math.min(maxEnergy, energyState.energy + rechargeRate * dt);
    }

    return energyState;
}

export function canJetpackThrust(energyState) {
    return !!(energyState && energyState.energy > 0);
}
