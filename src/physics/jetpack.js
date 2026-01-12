export function isJetpackBoostActive(timeSeconds, jetpackDef) {
    if (!jetpackDef) return false;
    const interval = jetpackDef.boostInterval ?? 1;
    const duration = jetpackDef.boostDuration ?? interval;

    if (interval <= 0) return true;

    const elapsed = timeSeconds % interval;
    return elapsed >= 0 && elapsed < duration;
}
