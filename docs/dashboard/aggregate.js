// Dashboard-Aggregations-Logik — pur, testbar (CommonJS).
// Parallel im <script> von index.html eingebettet; hier die Test-Quelle.
// Änderungen hier UND dort halten (kleine Copy, bewusst kein Build-Step).

function parseJson(s) { try { return s ? JSON.parse(s) : null; } catch (_) { return null; } }
function sumValues(obj) { let n = 0; for (const k in obj) n += (obj[k] || 0); return n; }

function aggregateSessions(rows) {
    const materials = Object.create(null);
    const npcs      = Object.create(null);
    const crafts    = Object.create(null);
    const buckets   = [0, 0, 0, 0, 0, 0]; // 0-1, 1-3, 3-5, 5-10, 10-20, 20+ min
    let totalBlocks = 0, granularRows = 0;
    const durations = [];

    for (const row of rows) {
        totalBlocks += (row.blocks_placed || 0);
        const mins = (row.duration_s || 0) / 60;
        durations.push(mins);
        const b = mins < 1 ? 0 : mins < 3 ? 1 : mins < 5 ? 2 : mins < 10 ? 3 : mins < 20 ? 4 : 5;
        buckets[b]++;

        const pm = parseJson(row.placements_by_material);
        const nt = parseJson(row.npc_taps);
        const cs = parseJson(row.crafting_successes);
        if (pm || nt || cs) granularRows++;

        if (pm) for (const k in pm) materials[k] = (materials[k] || 0) + (pm[k] || 0);
        if (nt) for (const k in nt) npcs[k]      = (npcs[k]      || 0) + (nt[k] || 0);
        if (cs) for (const k in cs) crafts[k]    = (crafts[k]    || 0) + (cs[k] || 0);
    }

    durations.sort((a, b) => a - b);
    const median = durations.length ? durations[Math.floor(durations.length / 2)] : 0;

    return {
        sessions: rows.length,
        totalBlocks, granularRows, median, durations,
        materials, npcs, crafts, buckets,
        uniqueMaterials: Object.keys(materials).length,
        totalTaps: sumValues(npcs),
        totalCrafts: sumValues(crafts),
    };
}

module.exports = { aggregateSessions, parseJson, sumValues };
