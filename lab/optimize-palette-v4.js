/**
 * Palette Optimizer v4 — Pinned White/Black Corners
 * 
 * Creates a 144-color (12×12) Crayola palette with:
 *   - White (#FFFFFF) pinned at top-left  [0,0]  (position 0)
 *   - Black (#000000) pinned at bottom-right [11,11] (position 143)
 *   - GA arranges the remaining 142 colors for smooth transitions
 * 
 * The 144 set = 133 Crayola + White + Black + 9 gap-filling colors.
 * 
 * Usage:
 *   node lab/optimize-palette-v4.js
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ============================================================
// Color Space
// ============================================================

function hex_to_rgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function rgb_to_lab(rgb) {
    let [r, g, b] = rgb.map(v => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; });
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    x /= 0.95047; y /= 1.0; z /= 1.08883;
    const f = v => v > 0.008856 ? Math.pow(v, 1 / 3) : 7.787 * v + 16 / 116;
    return [(116 * f(y)) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function lab_to_rgb(lab) {
    const [L, a, b] = lab;
    const fy = (L + 16) / 116, fx = a / 500 + fy, fz = fy - b / 200;
    const fi = t => t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787;
    let x = fi(fx) * 0.95047, y = fi(fy), z = fi(fz) * 1.08883;
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let bl = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    const gm = v => v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
    return [Math.max(0, Math.min(255, Math.round(gm(r) * 255))), Math.max(0, Math.min(255, Math.round(gm(g) * 255))), Math.max(0, Math.min(255, Math.round(gm(bl) * 255)))];
}

function rgb_to_hex(rgb) { return '#' + rgb.map(v => v.toString(16).padStart(2, '0').toUpperCase()).join(''); }

function lab_distance(a, b) {
    const dL = a[0] - b[0], da = a[1] - b[1], db = a[2] - b[2];
    return Math.sqrt(dL * dL + da * da + db * db);
}

// ============================================================
// PINNED Grid Fitness
// ============================================================

/**
 * Build a full arrangement from a free-position permutation + pinned map.
 * 
 * @param {number[]} free_perm - Permutation of free color indices (length = 142)
 * @param {Map<number,number>} pinned - Map of grid_position → color_index
 * @param {number[]} free_positions - Sorted array of non-pinned grid positions
 * @returns {number[]} Full arrangement of length 144
 */
function build_full_arrangement(free_perm, pinned, free_positions) {
    const n = free_positions.length + pinned.size;
    const full = new Array(n);

    // Place pinned colors
    for (const [pos, color_idx] of pinned) {
        full[pos] = color_idx;
    }

    // Place free colors
    for (let i = 0; i < free_perm.length; i++) {
        full[free_positions[i]] = free_perm[i];
    }

    return full;
}

function grid_fitness(full_arr, labs, cols, rows) {
    let total = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (i >= full_arr.length) continue;
            const lab = labs[full_arr[i]];
            if (x + 1 < cols) { const ri = y * cols + x + 1; if (ri < full_arr.length) total += lab_distance(lab, labs[full_arr[ri]]); }
            if (y + 1 < rows) { const bi = (y + 1) * cols + x; if (bi < full_arr.length) total += lab_distance(lab, labs[full_arr[bi]]); }
        }
    }
    return total;
}

function pinned_fitness(free_perm, labs, cols, rows, pinned, free_positions) {
    const full = build_full_arrangement(free_perm, pinned, free_positions);
    return grid_fitness(full, labs, cols, rows);
}

// ============================================================
// Mutations — operate on free_perm only (never touch pinned)
// ============================================================

function random_perm(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function random_free_perm(free_color_indices) {
    const a = [...free_color_indices];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function swap_mut(a) { const r = [...a], i = Math.floor(Math.random() * a.length); let j = Math.floor(Math.random() * (a.length - 1)); if (j >= i) j++; [r[i], r[j]] = [r[j], r[i]]; return r; }

function reverse_mut(a) {
    const r = [...a]; let s = Math.floor(Math.random() * a.length), e = Math.floor(Math.random() * a.length);
    if (s > e) [s, e] = [e, s]; while (s < e) { [r[s], r[e]] = [r[e], r[s]]; s++; e--; } return r;
}

function scramble_mut(a) {
    const r = [...a], len = 3 + Math.floor(Math.random() * Math.min(10, a.length / 3));
    const s = Math.floor(Math.random() * (a.length - len));
    for (let i = s + len - 1; i > s; i--) { const j = s + Math.floor(Math.random() * (i - s + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
}

function multi_swap_mut(a) {
    let r = [...a]; const cnt = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < cnt; i++) { const x = Math.floor(Math.random() * r.length); let y = Math.floor(Math.random() * (r.length - 1)); if (y >= x) y++; [r[x], r[y]] = [r[y], r[x]]; }
    return r;
}

/**
 * Grid-aware neighbor swap on the free permutation.
 * Maps free_perm indices to their grid positions, picks one, and swaps with a grid neighbor.
 */
function nbr_swap_mut_pinned(free_perm, free_positions, cols, rows, pinned) {
    const r = [...free_perm];

    // Build reverse map: grid_position → free_perm_index
    const pos_to_free_idx = new Map();
    for (let i = 0; i < free_positions.length; i++) {
        pos_to_free_idx.set(free_positions[i], i);
    }

    // Pick a random free position
    const fi = Math.floor(Math.random() * free_positions.length);
    const pos = free_positions[fi];
    const x = pos % cols, y = Math.floor(pos / cols);

    // Find free neighbors
    const neighbor_poss = [];
    if (x > 0) neighbor_poss.push(y * cols + (x - 1));
    if (x < cols - 1) neighbor_poss.push(y * cols + (x + 1));
    if (y > 0) neighbor_poss.push((y - 1) * cols + x);
    if (y < rows - 1) neighbor_poss.push((y + 1) * cols + x);

    // Only swap with free neighbors (not pinned)
    const free_neighbors = neighbor_poss.filter(p => pos_to_free_idx.has(p));
    if (free_neighbors.length === 0) return r;

    const nbr_pos = free_neighbors[Math.floor(Math.random() * free_neighbors.length)];
    const nbr_fi = pos_to_free_idx.get(nbr_pos);
    [r[fi], r[nbr_fi]] = [r[nbr_fi], r[fi]];
    return r;
}

/**
 * Block swap on the free permutation — swap two groups of grid-adjacent free cells.
 */
function block_swap_mut_pinned(free_perm, free_positions, cols, rows) {
    const r = [...free_perm];
    const pos_to_free_idx = new Map();
    for (let i = 0; i < free_positions.length; i++) pos_to_free_idx.set(free_positions[i], i);

    const bw = 1 + Math.floor(Math.random() * Math.min(3, cols - 1));
    const bh = 1 + Math.floor(Math.random() * Math.min(3, rows - 1));

    const x1 = Math.floor(Math.random() * (cols - bw)), y1 = Math.floor(Math.random() * (rows - bh));
    let x2, y2, att = 0;
    do { x2 = Math.floor(Math.random() * (cols - bw)); y2 = Math.floor(Math.random() * (rows - bh)); att++; }
    while (Math.abs(x2 - x1) < bw && Math.abs(y2 - y1) < bh && att < 20);
    if (att >= 20) return swap_mut(r);

    for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
            const p1 = (y1 + dy) * cols + (x1 + dx), p2 = (y2 + dy) * cols + (x2 + dx);
            const fi1 = pos_to_free_idx.get(p1), fi2 = pos_to_free_idx.get(p2);
            if (fi1 !== undefined && fi2 !== undefined) {
                [r[fi1], r[fi2]] = [r[fi2], r[fi1]];
            }
        }
    }
    return r;
}

/**
 * Row rotate on free positions only.
 */
function row_rot_mut_pinned(free_perm, free_positions, cols, rows) {
    const r = [...free_perm];
    const pos_to_free_idx = new Map();
    for (let i = 0; i < free_positions.length; i++) pos_to_free_idx.set(free_positions[i], i);

    const row = Math.floor(Math.random() * rows);
    const row_free_indices = [];
    for (let x = 0; x < cols; x++) {
        const p = row * cols + x;
        const fi = pos_to_free_idx.get(p);
        if (fi !== undefined) row_free_indices.push(fi);
    }
    if (row_free_indices.length < 2) return r;

    const shift = 1 + Math.floor(Math.random() * (row_free_indices.length - 1));
    const vals = row_free_indices.map(fi => r[fi]);
    for (let i = 0; i < row_free_indices.length; i++) {
        r[row_free_indices[i]] = vals[(i + shift) % row_free_indices.length];
    }
    return r;
}

/**
 * Column rotate on free positions only.
 */
function col_rot_mut_pinned(free_perm, free_positions, cols, rows) {
    const r = [...free_perm];
    const pos_to_free_idx = new Map();
    for (let i = 0; i < free_positions.length; i++) pos_to_free_idx.set(free_positions[i], i);

    const col = Math.floor(Math.random() * cols);
    const col_free_indices = [];
    for (let y = 0; y < rows; y++) {
        const p = y * cols + col;
        const fi = pos_to_free_idx.get(p);
        if (fi !== undefined) col_free_indices.push(fi);
    }
    if (col_free_indices.length < 2) return r;

    const shift = 1 + Math.floor(Math.random() * (col_free_indices.length - 1));
    const vals = col_free_indices.map(fi => r[fi]);
    for (let i = 0; i < col_free_indices.length; i++) {
        r[col_free_indices[i]] = vals[(i + shift) % col_free_indices.length];
    }
    return r;
}

/**
 * Targeted swap: find the worst neighbor edge among free cells and swap one endpoint elsewhere.
 */
function targeted_swap_mut_pinned(free_perm, labs, free_positions, cols, rows, pinned) {
    const r = [...free_perm];
    const full = build_full_arrangement(r, pinned, free_positions);
    const pos_to_free_idx = new Map();
    for (let i = 0; i < free_positions.length; i++) pos_to_free_idx.set(free_positions[i], i);

    let worst_dist = 0, worst_fi = 0;
    for (let i = 0; i < free_positions.length; i++) {
        const pos = free_positions[i];
        const x = pos % cols, y = Math.floor(pos / cols);
        const lab = labs[full[pos]];

        const check_neighbor = (np) => {
            if (np >= 0 && np < full.length) {
                const d = lab_distance(lab, labs[full[np]]);
                if (d > worst_dist) { worst_dist = d; worst_fi = i; }
            }
        };
        if (x + 1 < cols) check_neighbor(y * cols + x + 1);
        if (x > 0) check_neighbor(y * cols + x - 1);
        if (y + 1 < rows) check_neighbor((y + 1) * cols + x);
        if (y > 0) check_neighbor((y - 1) * cols + x);
    }

    const other = Math.floor(Math.random() * free_perm.length);
    [r[worst_fi], r[other]] = [r[other], r[worst_fi]];
    return r;
}

function apply_mut(free_perm, free_positions, cols, rows, intensity, labs, pinned) {
    const roll = Math.random();
    if (intensity > 0.7) {
        if (roll < 0.15) return scramble_mut(free_perm);
        if (roll < 0.30) return block_swap_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.45) return multi_swap_mut(free_perm);
        if (roll < 0.55) return row_rot_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.65) return col_rot_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.80) return targeted_swap_mut_pinned(free_perm, labs, free_positions, cols, rows, pinned);
        return reverse_mut(free_perm);
    } else if (intensity > 0.3) {
        if (roll < 0.20) return nbr_swap_mut_pinned(free_perm, free_positions, cols, rows, pinned);
        if (roll < 0.35) return swap_mut(free_perm);
        if (roll < 0.50) return block_swap_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.60) return scramble_mut(free_perm);
        if (roll < 0.70) return targeted_swap_mut_pinned(free_perm, labs, free_positions, cols, rows, pinned);
        if (roll < 0.80) return row_rot_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.90) return col_rot_mut_pinned(free_perm, free_positions, cols, rows);
        return reverse_mut(free_perm);
    } else {
        if (roll < 0.30) return nbr_swap_mut_pinned(free_perm, free_positions, cols, rows, pinned);
        if (roll < 0.50) return swap_mut(free_perm);
        if (roll < 0.65) return targeted_swap_mut_pinned(free_perm, labs, free_positions, cols, rows, pinned);
        if (roll < 0.80) return row_rot_mut_pinned(free_perm, free_positions, cols, rows);
        if (roll < 0.90) return col_rot_mut_pinned(free_perm, free_positions, cols, rows);
        return reverse_mut(free_perm);
    }
}

// ============================================================
// Crossover — operates on free_perm
// ============================================================

function ox_crossover(p1, p2) {
    const n = p1.length, s = Math.floor(Math.random() * n), e = s + Math.floor(Math.random() * (n - s));
    const child = new Array(n).fill(-1), used = new Set();
    for (let i = s; i <= e; i++) { child[i] = p1[i]; used.add(p1[i]); }
    let pos = (e + 1) % n;
    for (let i = 0; i < n; i++) { const c = p2[(e + 1 + i) % n]; if (!used.has(c)) { child[pos] = c; pos = (pos + 1) % n; } }
    return child;
}

function pos_crossover(p1, p2) {
    const n = p1.length, child = new Array(n).fill(-1), used = new Set();
    const cnt = Math.floor(n * (0.3 + Math.random() * 0.4)), positions = new Set();
    while (positions.size < cnt) positions.add(Math.floor(Math.random() * n));
    for (const p of positions) { child[p] = p1[p]; used.add(p1[p]); }
    let fp = 0;
    for (let i = 0; i < n; i++) { if (!used.has(p2[i])) { while (child[fp] !== -1) fp++; child[fp] = p2[i]; } }
    return child;
}

function tournament(pop, fit, size) {
    let best = Math.floor(Math.random() * pop.length);
    for (let i = 1; i < size; i++) { const c = Math.floor(Math.random() * pop.length); if (fit[c] < fit[best]) best = c; }
    return pop[best];
}

// ============================================================
// Island GA with pinned support
// ============================================================

function run_island(labs, cols, rows, pinned_map, free_positions, free_color_indices, cfg) {
    const {
        pop_size = 250, gens = 5000, elite_frac = 0.05, base_mr = 0.2,
        tourn_size = 5, stag_limit = 800, cat_interval = 250,
        island_id = 0, log_interval = 500
    } = cfg;

    const n_free = free_color_indices.length;

    // Convert pinned_map to Map for build_full_arrangement
    const pinned = new Map(Object.entries(pinned_map).map(([k, v]) => [parseInt(k), v]));

    // Initialize population: random permutations of free color indices
    let pop = Array.from({ length: pop_size }, () => random_free_perm(free_color_indices));

    let fits = pop.map(p => pinned_fitness(p, labs, cols, rows, pinned, free_positions));
    let best_fit = Infinity, best_perm = null, stag = 0, cats = 0;

    const hof = [], HOF_MAX = 15;
    const hof_diverse = (a) => hof.every(h => {
        let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== h.perm[i]) d++;
        return d >= a.length * 0.12;
    });

    for (let gen = 0; gen < gens; gen++) {
        const idx = Array.from({ length: pop_size }, (_, i) => i);
        idx.sort((a, b) => fits[a] - fits[b]);
        const sp = idx.map(i => pop[i]), sf = idx.map(i => fits[i]);

        if (sf[0] < best_fit) {
            best_fit = sf[0]; best_perm = [...sp[0]]; stag = 0;
            if (hof_diverse(best_perm)) {
                hof.push({ perm: [...best_perm], fit: best_fit });
                hof.sort((a, b) => a.fit - b.fit);
                if (hof.length > HOF_MAX) hof.pop();
            }
        } else stag++;

        const stag_r = Math.min(stag / (stag_limit * 0.8), 1.0);
        const mr = base_mr + stag_r * (0.65 - base_mr);
        const intensity = stag_r;

        if (gen % log_interval === 0 && parentPort) {
            parentPort.postMessage({ type: 'progress', island_id, gen, best_fit, cur: sf[0], stag, mr: mr.toFixed(3), hof_n: hof.length, cats });
        }

        // Catastrophe
        if (stag > 0 && stag % cat_interval === 0) {
            cats++;
            const elite_n = Math.max(2, Math.floor(pop_size * elite_frac));
            for (let i = elite_n; i < pop_size; i++) {
                if (i < elite_n + hof.length) {
                    let m = [...hof[i - elite_n].perm];
                    for (let k = 0; k < 15; k++) m = apply_mut(m, free_positions, cols, rows, 1.0, labs, pinned);
                    sp[i] = m;
                } else sp[i] = random_free_perm(free_color_indices);
            }
        }

        if (stag >= stag_limit) break;

        const elite_n = Math.max(2, Math.floor(pop_size * elite_frac));
        const next = [];
        for (let i = 0; i < elite_n; i++) next.push([...sp[i]]);

        while (next.length < pop_size) {
            const p1 = tournament(sp, sf, tourn_size), p2 = tournament(sp, sf, tourn_size);
            let child = Math.random() < 0.65 ? ox_crossover(p1, p2) : pos_crossover(p1, p2);
            if (Math.random() < mr) child = apply_mut(child, free_positions, cols, rows, intensity, labs, pinned);
            if (Math.random() < 0.1) child = apply_mut(child, free_positions, cols, rows, Math.min(intensity + 0.3, 1.0), labs, pinned);
            next.push(child);
        }

        pop = next;
        fits = pop.map(p => pinned_fitness(p, labs, cols, rows, pinned, free_positions));
    }

    return { perm: best_perm, fit: best_fit, hof, cats, island_id };
}

// ============================================================
// Worker entry
// ============================================================

if (!isMainThread) {
    const { labs, cols, rows, pinned_map, free_positions, free_color_indices, cfg } = workerData;
    const result = run_island(labs, cols, rows, pinned_map, free_positions, free_color_indices, cfg);
    parentPort.postMessage({ type: 'done', result });
    process.exit(0);
}

// ============================================================
// Parallel coordinator
// ============================================================

function run_parallel(labs, cols, rows, pinned_map, free_positions, free_color_indices, opts = {}) {
    const {
        num_islands = 24, pop_per_island = 250, gens = 5000,
        base_mr = 0.2, stag_limit = 800, cat_interval = 250,
        log_interval = 500, label = ''
    } = opts;

    return new Promise((resolve, reject) => {
        console.log(`  Launching ${num_islands} islands (${pop_per_island} pop, ${gens} gens)...`);
        const results = []; let done = 0;

        for (let i = 0; i < num_islands; i++) {
            const cfg = {
                pop_size: pop_per_island,
                gens,
                elite_frac: 0.04 + (i % 4) * 0.02,
                base_mr: base_mr + (i % 5) * 0.04,
                tourn_size: 3 + (i % 5),
                stag_limit, cat_interval: cat_interval + (i % 4) * 60,
                island_id: i, log_interval
            };

            const w = new Worker(__filename, {
                workerData: { labs, cols, rows, pinned_map, free_positions, free_color_indices, cfg }
            });
            w.on('message', msg => {
                if (msg.type === 'progress' && msg.island_id === 0) {
                    process.stdout.write(`\r  [${label}] I0: gen=${msg.gen} best=${msg.best_fit.toFixed(1)} stag=${msg.stag} mr=${msg.mr} hof=${msg.hof_n} cat=${msg.cats}     `);
                } else if (msg.type === 'done') {
                    results.push(msg.result);
                    done++;
                    if (done === num_islands) {
                        results.sort((a, b) => a.fit - b.fit);
                        console.log(`\n  ✓ Best: ${results[0].fit.toFixed(1)} (island ${results[0].island_id})`);
                        console.log(`  Top 5: ${results.slice(0, 5).map(r => r.fit.toFixed(1)).join(', ')}`);

                        // Build full arrangement from best free perm
                        const pinned = new Map(Object.entries(pinned_map).map(([k, v]) => [parseInt(k), v]));
                        const full = build_full_arrangement(results[0].perm, pinned, free_positions);

                        resolve({ arr: full, fit: results[0].fit, all: results });
                    }
                }
            });
            w.on('error', reject);
        }
    });
}

// ============================================================
// Gap filler
// ============================================================

function find_gap_colors(existing_labs, count) {
    const candidates = [];
    for (let L = 12; L <= 92; L += 6) {
        for (let a = -80; a <= 80; a += 10) {
            for (let b = -80; b <= 80; b += 10) {
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);
                const check = rgb_to_lab(rgb);
                if (lab_distance(lab, check) < 4) candidates.push({ lab, rgb });
            }
        }
    }

    const min_d = candidates.map(c => {
        let m = Infinity;
        for (const el of existing_labs) { const d = lab_distance(c.lab, el); if (d < m) m = d; }
        return m;
    });

    const selected = [];
    for (let i = 0; i < count; i++) {
        let bi = 0, bd = -1;
        for (let j = 0; j < candidates.length; j++) if (min_d[j] > bd) { bd = min_d[j]; bi = j; }
        const ch = candidates[bi];
        const hex = rgb_to_hex(ch.rgb);
        const [L, ca, cb] = ch.lab;
        const ha = Math.atan2(cb, ca) * 180 / Math.PI;
        const chr = Math.sqrt(ca * ca + cb * cb);
        let hname;
        if (chr < 10) hname = L > 70 ? 'Light Gray' : L > 40 ? 'Mid Gray' : 'Dark Gray';
        else if (ha >= -22 && ha < 22) hname = 'Rose'; else if (ha >= 22 && ha < 60) hname = 'Orange';
        else if (ha >= 60 && ha < 105) hname = 'Yellow'; else if (ha >= 105 && ha < 150) hname = 'Chartreuse';
        else if (ha >= 150 || ha < -150) hname = 'Green'; else if (ha >= -150 && ha < -105) hname = 'Teal';
        else if (ha >= -105 && ha < -60) hname = 'Azure'; else hname = 'Violet';
        const ln = L > 70 ? 'Light' : L > 40 ? 'Medium' : 'Deep';
        selected.push({ hex, name: `${ln} ${hname} ${i + 1}`, rgb: `(${ch.rgb[0]}, ${ch.rgb[1]}, ${ch.rgb[2]})`, lab: ch.lab });
        console.log(`  [${i + 1}/${count}] ${selected[i].name}: ${hex} (gap: ${bd.toFixed(1)})`);

        for (let j = 0; j < candidates.length; j++) {
            const d = lab_distance(candidates[j].lab, ch.lab);
            if (d < min_d[j]) min_d[j] = d;
        }
        min_d[bi] = -1;
    }
    return selected;
}

function write_pal(fp, arr, varname, desc) {
    const items = arr.map(c => `    {"hex": "${c.hex}", "name": "${c.name}", "rgb": "${c.rgb}"}`);
    const content = `/**\n * ${desc}\n * \n * Generated by lab/optimize-palette-v4.js (Pinned White/Black Island GA)\n * Generated: ${new Date().toISOString()}\n */\n\nconst ${varname} = [\n${items.join(',\n')}\n];\n\nmodule.exports = ${varname};\n`;
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`  Written: ${fp} (${arr.length} colors)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    const cores = Math.min(os.cpus().length, 24);

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Palette Optimizer v4 — Pinned White/Black Corners   ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`  Cores: ${os.cpus().length} available, using ${cores} islands\n`);

    const pal = require('../html-core/arr_colors');
    console.log(`  Loaded ${pal.length} Crayola colors`);

    // Create the 144 set: 133 Crayola + White + Black + 9 gap colors
    const white = { hex: '#FFFFFF', name: 'White', rgb: '(255, 255, 255)' };
    const black = { hex: '#000000', name: 'Black', rgb: '(0, 0, 0)' };

    // Insert white and black first
    const base = [...pal, white, black]; // 135 colors
    const base_labs = base.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    // Find 9 more gap colors (144 - 135 = 9)
    console.log(`\n═══ Finding 9 gap-filling colors ═══`);
    const gap_colors = find_gap_colors(base_labs, 9);

    // Build full 144 set
    const all_colors = [...base, ...gap_colors];
    const all_labs = all_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n  Total: ${all_colors.length} colors`);

    // Identify white and black indices in the full array
    const white_idx = pal.length;     // index of white in all_colors
    const black_idx = pal.length + 1; // index of black in all_colors

    console.log(`  White: index ${white_idx} → pinned at position 0 (top-left)`);
    console.log(`  Black: index ${black_idx} → pinned at position 143 (bottom-right)`);

    // Pinned positions: grid_position → color_index
    const pinned_map = { 0: white_idx, 143: black_idx };

    // Free positions: all except pinned
    const free_positions = [];
    for (let i = 0; i < 144; i++) {
        if (!(i in pinned_map)) free_positions.push(i);
    }

    // Free color indices: all except white and black
    const free_color_indices = [];
    for (let i = 0; i < all_colors.length; i++) {
        if (i !== white_idx && i !== black_idx) free_color_indices.push(i);
    }

    console.log(`  Free positions: ${free_positions.length}`);
    console.log(`  Free colors: ${free_color_indices.length}\n`);

    console.log('═══ Optimizing with Pinned White/Black ═══');
    const t = Date.now();
    const result = await run_parallel(all_labs, 12, 12, pinned_map, free_positions, free_color_indices, {
        num_islands: cores,
        pop_per_island: 250,
        gens: 5000,
        base_mr: 0.2,
        stag_limit: 800,
        cat_interval: 250,
        log_interval: 500,
        label: 'Pinned-WB'
    });
    console.log(`  Time: ${((Date.now() - t) / 1000).toFixed(1)}s\n`);

    // Verify pins
    console.log(`  Verify: pos[0] = ${all_colors[result.arr[0]].name} (${all_colors[result.arr[0]].hex})`);
    console.log(`  Verify: pos[143] = ${all_colors[result.arr[143]].name} (${all_colors[result.arr[143]].hex})\n`);

    const sorted = result.arr.map(i => all_colors[i]);

    write_pal(
        path.join(__dirname, '..', 'html-core', 'pal_crayola_extended.js'),
        sorted, 'pal_crayola_extended',
        'Extended Crayola — 144 Colors (12×12)\n * White pinned at top-left, Black pinned at bottom-right.\n * 133 Crayola + White + Black + 9 gap colors, GA-sorted for smooth transitions.'
    );

    console.log('════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════');
    console.log(`  Cores:   ${cores}`);
    console.log(`  Fitness: ${result.fit.toFixed(1)}`);
    console.log(`  Top-left:     ${sorted[0].name} (${sorted[0].hex})`);
    console.log(`  Bottom-right: ${sorted[143].name} (${sorted[143].hex})`);
    console.log(`  Output: html-core/pal_crayola_extended.js`);
    console.log('  Done.\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
