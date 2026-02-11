/**
 * Palette Optimizer v5 — High-Quality Pinned White/Black
 * 
 * Key improvements over v4:
 *   1. Delta-fitness evaluation: O(1) swap scoring instead of full grid recalc
 *   2. Post-GA steepest-descent local search: exhaustive pairwise swap hill climbing
 *   3. Greedy multi-candidate targeted mutation: tries N positions, keeps best
 *   4. Larger populations (500/island), more generations (8000)
 *   5. Multi-phase: GA exploration → local search refinement → repeat
 * 
 * Usage:
 *   node lab/optimize-palette-v5.js
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
// Pre-computed distance matrix for fast lookup
// ============================================================

function build_distance_matrix(labs) {
    const n = labs.length;
    const dist = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const d = lab_distance(labs[i], labs[j]);
            dist[i * n + j] = d;
            dist[j * n + i] = d;
        }
    }
    return dist;
}

function get_dist(dist_matrix, n, i, j) {
    return dist_matrix[i * n + j];
}

// ============================================================
// Grid neighbor map (precomputed)
// ============================================================

function build_neighbor_map(cols, rows, total) {
    const neighbors = new Array(total);
    for (let i = 0; i < total; i++) {
        neighbors[i] = [];
        const x = i % cols, y = Math.floor(i / cols);
        if (x > 0) neighbors[i].push(i - 1);
        if (x < cols - 1 && i + 1 < total) neighbors[i].push(i + 1);
        if (y > 0) neighbors[i].push(i - cols);
        if (y + 1 < rows && i + cols < total) neighbors[i].push(i + cols);
    }
    return neighbors;
}

// ============================================================
// Fitness (full and delta)
// ============================================================

function grid_fitness_fast(full_arr, dist_matrix, n_colors, neighbors) {
    let total = 0;
    for (let i = 0; i < full_arr.length; i++) {
        const ci = full_arr[i];
        for (const j of neighbors[i]) {
            if (j > i) { // count each edge once
                total += get_dist(dist_matrix, n_colors, ci, full_arr[j]);
            }
        }
    }
    return total;
}

/**
 * Compute fitness delta if we swap positions p1 and p2 in full_arr.
 * Returns new_fitness - old_fitness (negative = improvement).
 */
function swap_delta(full_arr, p1, p2, dist_matrix, n_colors, neighbors) {
    const c1 = full_arr[p1], c2 = full_arr[p2];
    let old_cost = 0, new_cost = 0;

    // Cost of p1's edges (before swap, p1 has color c1)
    for (const nb of neighbors[p1]) {
        if (nb === p2) continue; // skip direct edge between p1-p2
        const cn = full_arr[nb];
        old_cost += get_dist(dist_matrix, n_colors, c1, cn);
        new_cost += get_dist(dist_matrix, n_colors, c2, cn);
    }

    // Cost of p2's edges (before swap, p2 has color c2)
    for (const nb of neighbors[p2]) {
        if (nb === p1) continue;
        const cn = full_arr[nb];
        old_cost += get_dist(dist_matrix, n_colors, c2, cn);
        new_cost += get_dist(dist_matrix, n_colors, c1, cn);
    }

    // Edge between p1 and p2 itself (stays the same distance)
    // It's counted once in neighbors; the distance is the same regardless of swap

    return new_cost - old_cost;
}

// ============================================================
// Arrangement helpers
// ============================================================

function build_full(free_perm, pinned, free_positions, total) {
    const full = new Array(total);
    for (const [pos, ci] of pinned) full[pos] = ci;
    for (let i = 0; i < free_perm.length; i++) full[free_positions[i]] = free_perm[i];
    return full;
}

// ============================================================
// Local Search — Steepest Descent with Delta Evaluation
// ============================================================

/**
 * Exhaustive pairwise swap hill climbing on the full arrangement.
 * Only swaps free positions. Uses delta evaluation for speed.
 * Returns improved full arrangement and fitness.
 */
function local_search(full_arr, dist_matrix, n_colors, neighbors, free_positions, max_rounds = 50) {
    const arr = [...full_arr];
    let fitness = grid_fitness_fast(arr, dist_matrix, n_colors, neighbors);
    let improved = true;
    let round = 0;
    const n_free = free_positions.length;

    while (improved && round < max_rounds) {
        improved = false;
        round++;
        let round_improvements = 0;

        for (let a = 0; a < n_free - 1; a++) {
            for (let b = a + 1; b < n_free; b++) {
                const p1 = free_positions[a], p2 = free_positions[b];
                const delta = swap_delta(arr, p1, p2, dist_matrix, n_colors, neighbors);

                if (delta < -0.01) { // meaningful improvement
                    // Apply swap
                    [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
                    fitness += delta;
                    improved = true;
                    round_improvements++;
                }
            }
        }

        if (parentPort) {
            parentPort.postMessage({ type: 'local_search', round, fitness, improvements: round_improvements });
        }
    }

    return { arr, fitness, rounds: round };
}

// ============================================================
// Mutations
// ============================================================

function random_free_perm(free_color_indices) {
    const a = [...free_color_indices];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function swap_mut(a) {
    const r = [...a], i = Math.floor(Math.random() * a.length);
    let j = Math.floor(Math.random() * (a.length - 1)); if (j >= i) j++;
    [r[i], r[j]] = [r[j], r[i]]; return r;
}

function reverse_mut(a) {
    const r = [...a]; let s = Math.floor(Math.random() * a.length), e = Math.floor(Math.random() * a.length);
    if (s > e) [s, e] = [e, s]; while (s < e) { [r[s], r[e]] = [r[e], r[s]]; s++; e--; } return r;
}

function scramble_mut(a) {
    const r = [...a], len = 3 + Math.floor(Math.random() * Math.min(12, a.length / 3));
    const s = Math.floor(Math.random() * (a.length - len));
    for (let i = s + len - 1; i > s; i--) { const j = s + Math.floor(Math.random() * (i - s + 1));[r[i], r[j]] = [r[j], r[i]]; }
    return r;
}

function multi_swap_mut(a) {
    let r = [...a]; const cnt = 3 + Math.floor(Math.random() * 10);
    for (let i = 0; i < cnt; i++) { const x = Math.floor(Math.random() * r.length); let y = Math.floor(Math.random() * (r.length - 1)); if (y >= x) y++;[r[x], r[y]] = [r[y], r[x]]; }
    return r;
}

function nbr_swap_mut(free_perm, fp, cols, rows, pinned) {
    const r = [...free_perm];
    const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);
    const fi = Math.floor(Math.random() * fp.length);
    const pos = fp[fi], x = pos % cols, y = Math.floor(pos / cols);
    const nbs = [];
    if (x > 0) nbs.push(y * cols + x - 1);
    if (x < cols - 1) nbs.push(y * cols + x + 1);
    if (y > 0) nbs.push((y - 1) * cols + x);
    if (y < rows - 1) nbs.push((y + 1) * cols + x);
    const free_nbs = nbs.filter(p => p2f.has(p));
    if (!free_nbs.length) return r;
    const nb_fi = p2f.get(free_nbs[Math.floor(Math.random() * free_nbs.length)]);
    [r[fi], r[nb_fi]] = [r[nb_fi], r[fi]]; return r;
}

function block_swap_mut(free_perm, fp, cols, rows) {
    const r = [...free_perm];
    const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);
    const bw = 1 + Math.floor(Math.random() * Math.min(4, cols - 1)), bh = 1 + Math.floor(Math.random() * Math.min(4, rows - 1));
    const x1 = Math.floor(Math.random() * (cols - bw)), y1 = Math.floor(Math.random() * (rows - bh));
    let x2, y2, att = 0;
    do { x2 = Math.floor(Math.random() * (cols - bw)); y2 = Math.floor(Math.random() * (rows - bh)); att++; } while (Math.abs(x2 - x1) < bw && Math.abs(y2 - y1) < bh && att < 20);
    if (att >= 20) return swap_mut(r);
    for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) {
        const p1 = (y1 + dy) * cols + x1 + dx, p2 = (y2 + dy) * cols + x2 + dx;
        const f1 = p2f.get(p1), f2 = p2f.get(p2);
        if (f1 !== undefined && f2 !== undefined) [r[f1], r[f2]] = [r[f2], r[f1]];
    }
    return r;
}

function row_rot_mut(free_perm, fp, cols, rows) {
    const r = [...free_perm]; const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);
    const row = Math.floor(Math.random() * rows), fis = [];
    for (let x = 0; x < cols; x++) { const f = p2f.get(row * cols + x); if (f !== undefined) fis.push(f); }
    if (fis.length < 2) return r;
    const sh = 1 + Math.floor(Math.random() * (fis.length - 1)), vals = fis.map(f => r[f]);
    for (let i = 0; i < fis.length; i++) r[fis[i]] = vals[(i + sh) % fis.length];
    return r;
}

function col_rot_mut(free_perm, fp, cols, rows) {
    const r = [...free_perm]; const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);
    const col = Math.floor(Math.random() * cols), fis = [];
    for (let y = 0; y < rows; y++) { const f = p2f.get(y * cols + col); if (f !== undefined) fis.push(f); }
    if (fis.length < 2) return r;
    const sh = 1 + Math.floor(Math.random() * (fis.length - 1)), vals = fis.map(f => r[f]);
    for (let i = 0; i < fis.length; i++) r[fis[i]] = vals[(i + sh) % fis.length];
    return r;
}

/**
 * Greedy targeted mutation: find the worst edge, try N random swaps, keep best.
 */
function greedy_targeted_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total) {
    const full = build_full(free_perm, pinned, fp, total);
    const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);

    // Find the worst edge among free positions
    let worst_dist = 0, worst_pos = -1;
    for (let i = 0; i < fp.length; i++) {
        const pos = fp[i];
        for (const nb of neighbors[pos]) {
            const d = get_dist(dist_matrix, n_colors, full[pos], full[nb]);
            if (d > worst_dist) { worst_dist = d; worst_pos = i; }
        }
    }
    if (worst_pos < 0) return [...free_perm];

    // Try N random swaps for the worst cell, keep the best
    const r = [...free_perm];
    let best_delta = 0, best_swap = -1;
    const N_TRIES = 20;

    for (let t = 0; t < N_TRIES; t++) {
        const other = Math.floor(Math.random() * fp.length);
        if (other === worst_pos) continue;
        const delta = swap_delta(full, fp[worst_pos], fp[other], dist_matrix, n_colors, neighbors);
        if (delta < best_delta) { best_delta = delta; best_swap = other; }
    }

    if (best_swap >= 0) {
        [r[worst_pos], r[best_swap]] = [r[best_swap], r[worst_pos]];
    }
    return r;
}

/**
 * Region scramble: pick a random region and try multiple random arrangements,
 * keeping the best one.
 */
function region_scramble_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total, cols) {
    const r = [...free_perm];
    const p2f = new Map(); for (let i = 0; i < fp.length; i++) p2f.set(fp[i], i);

    // Pick a random 3x3 region
    const rx = Math.floor(Math.random() * (cols - 2)), ry = Math.floor(Math.random() * 10);
    const region_fis = [];
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
        const pos = (ry + dy) * cols + (rx + dx);
        const fi = p2f.get(pos);
        if (fi !== undefined) region_fis.push(fi);
    }
    if (region_fis.length < 3) return swap_mut(r);

    // Try N random permutations of this region, keep best
    const full = build_full(r, pinned, fp, total);
    const base_fitness = grid_fitness_fast(full, dist_matrix, n_colors, neighbors);
    let best_r = r, best_fit = base_fitness;

    for (let t = 0; t < 30; t++) {
        const trial = [...r];
        // Shuffle region indices
        const vals = region_fis.map(fi => trial[fi]);
        for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[vals[i], vals[j]] = [vals[j], vals[i]]; }
        for (let i = 0; i < region_fis.length; i++) trial[region_fis[i]] = vals[i];

        const trial_full = build_full(trial, pinned, fp, total);
        const trial_fit = grid_fitness_fast(trial_full, dist_matrix, n_colors, neighbors);
        if (trial_fit < best_fit) { best_fit = trial_fit; best_r = trial; }
    }
    return best_r;
}

function apply_mut(free_perm, fp, cols, rows, intensity, pinned, dist_matrix, n_colors, neighbors, total) {
    const roll = Math.random();
    if (intensity > 0.7) {
        if (roll < 0.12) return scramble_mut(free_perm);
        if (roll < 0.24) return block_swap_mut(free_perm, fp, cols, rows);
        if (roll < 0.36) return multi_swap_mut(free_perm);
        if (roll < 0.46) return row_rot_mut(free_perm, fp, cols, rows);
        if (roll < 0.56) return col_rot_mut(free_perm, fp, cols, rows);
        if (roll < 0.72) return greedy_targeted_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total);
        if (roll < 0.86) return region_scramble_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total, cols);
        return reverse_mut(free_perm);
    } else if (intensity > 0.3) {
        if (roll < 0.18) return nbr_swap_mut(free_perm, fp, cols, rows, pinned);
        if (roll < 0.30) return swap_mut(free_perm);
        if (roll < 0.42) return block_swap_mut(free_perm, fp, cols, rows);
        if (roll < 0.52) return scramble_mut(free_perm);
        if (roll < 0.65) return greedy_targeted_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total);
        if (roll < 0.75) return region_scramble_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total, cols);
        if (roll < 0.85) return row_rot_mut(free_perm, fp, cols, rows);
        if (roll < 0.93) return col_rot_mut(free_perm, fp, cols, rows);
        return reverse_mut(free_perm);
    } else {
        if (roll < 0.25) return nbr_swap_mut(free_perm, fp, cols, rows, pinned);
        if (roll < 0.40) return swap_mut(free_perm);
        if (roll < 0.55) return greedy_targeted_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total);
        if (roll < 0.70) return region_scramble_mut(free_perm, pinned, fp, dist_matrix, n_colors, neighbors, total, cols);
        if (roll < 0.82) return row_rot_mut(free_perm, fp, cols, rows);
        if (roll < 0.92) return col_rot_mut(free_perm, fp, cols, rows);
        return reverse_mut(free_perm);
    }
}

// ============================================================
// Crossover
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
// Island GA + Local Search
// ============================================================

function run_island(labs, cols, rows, pinned_entries, free_positions, free_ci, dist_matrix, cfg) {
    const {
        pop_size = 500, gens = 8000, elite_frac = 0.04, base_mr = 0.2,
        tourn_size = 5, stag_limit = 1000, cat_interval = 300,
        island_id = 0, log_interval = 500, local_search_gens = [2000, 4000, 6000]
    } = cfg;

    const n_colors = labs.length;
    const total = cols * rows;
    const pinned = new Map(pinned_entries);
    const neighbors = build_neighbor_map(cols, rows, total);
    const elite_n = Math.max(2, Math.floor(pop_size * elite_frac));

    // Fitness helper
    const eval_perm = (fp) => {
        const full = build_full(fp, pinned, free_positions, total);
        return grid_fitness_fast(full, dist_matrix, n_colors, neighbors);
    };

    let pop = Array.from({ length: pop_size }, () => random_free_perm(free_ci));
    let fits = pop.map(eval_perm);
    let best_fit = Infinity, best_perm = null, stag = 0, cats = 0;

    const hof = [], HOF_MAX = 20;
    const hof_diverse = (a) => hof.every(h => {
        let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== h.perm[i]) d++;
        return d >= a.length * 0.10;
    });

    const local_search_done = new Set();

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
        const mr = base_mr + stag_r * (0.7 - base_mr);
        const intensity = stag_r;

        if (gen % log_interval === 0 && parentPort) {
            parentPort.postMessage({ type: 'progress', island_id, gen, best_fit, cur: sf[0], stag, mr: mr.toFixed(3), hof_n: hof.length, cats });
        }

        // Periodic local search on the best individual
        if (local_search_gens.includes(gen) && !local_search_done.has(gen)) {
            local_search_done.add(gen);
            const full = build_full(best_perm, pinned, free_positions, total);
            const ls = local_search(full, dist_matrix, n_colors, neighbors, free_positions, 30);

            // Extract free perm from improved full arr
            const improved_perm = free_positions.map(pos => ls.arr[pos]);
            const improved_fit = ls.fitness;

            if (improved_fit < best_fit) {
                best_fit = improved_fit;
                best_perm = improved_perm;
                // Inject into population
                sp[pop_size - 1] = improved_perm;
                sf[pop_size - 1] = improved_fit;

                if (parentPort) {
                    parentPort.postMessage({ type: 'local_search_result', island_id, gen, old_fit: sf[0], new_fit: improved_fit, rounds: ls.rounds });
                }
            }
        }

        // Catastrophe
        if (stag > 0 && stag % cat_interval === 0) {
            cats++;
            for (let i = elite_n; i < pop_size; i++) {
                if (i < elite_n + hof.length) {
                    let m = [...hof[i - elite_n].perm];
                    for (let k = 0; k < 20; k++) m = apply_mut(m, free_positions, cols, rows, 1.0, pinned, dist_matrix, n_colors, neighbors, total);
                    sp[i] = m;
                } else sp[i] = random_free_perm(free_ci);
            }
        }

        if (stag >= stag_limit) break;

        const next = [];
        for (let i = 0; i < elite_n; i++) next.push([...sp[i]]);

        while (next.length < pop_size) {
            const p1 = tournament(sp, sf, tourn_size), p2 = tournament(sp, sf, tourn_size);
            let child = Math.random() < 0.6 ? ox_crossover(p1, p2) : pos_crossover(p1, p2);
            if (Math.random() < mr) child = apply_mut(child, free_positions, cols, rows, intensity, pinned, dist_matrix, n_colors, neighbors, total);
            if (Math.random() < 0.12) child = apply_mut(child, free_positions, cols, rows, Math.min(intensity + 0.3, 1.0), pinned, dist_matrix, n_colors, neighbors, total);
            next.push(child);
        }

        pop = next;
        fits = pop.map(eval_perm);
    }

    // Final local search on best
    {
        const full = build_full(best_perm, pinned, free_positions, total);
        const ls = local_search(full, dist_matrix, n_colors, neighbors, free_positions, 100);
        if (ls.fitness < best_fit) {
            best_perm = free_positions.map(pos => ls.arr[pos]);
            best_fit = ls.fitness;
        }
    }

    return { perm: best_perm, fit: best_fit, hof, cats, island_id };
}

// ============================================================
// Worker entry
// ============================================================

if (!isMainThread) {
    const { labs, cols, rows, pinned_entries, free_positions, free_ci, dist_flat, cfg } = workerData;
    // Reconstruct dist matrix as Float64Array
    const dist_matrix = new Float64Array(dist_flat);
    const result = run_island(labs, cols, rows, pinned_entries, free_positions, free_ci, dist_matrix, cfg);
    parentPort.postMessage({ type: 'done', result });
    process.exit(0);
}

// ============================================================
// Parallel coordinator
// ============================================================

function run_parallel(labs, cols, rows, pinned_entries, free_positions, free_ci, dist_matrix, opts = {}) {
    const {
        num_islands = 24, pop_per_island = 500, gens = 8000,
        base_mr = 0.2, stag_limit = 1000, cat_interval = 300,
        log_interval = 1000, label = ''
    } = opts;

    const dist_flat = Array.from(dist_matrix); // Convert to regular array for transfer

    return new Promise((resolve, reject) => {
        console.log(`  Launching ${num_islands} islands (${pop_per_island} pop, ${gens} gens, + local search)...`);
        const results = []; let done = 0;

        for (let i = 0; i < num_islands; i++) {
            const cfg = {
                pop_size: pop_per_island,
                gens,
                elite_frac: 0.03 + (i % 5) * 0.015,
                base_mr: base_mr + (i % 6) * 0.04,
                tourn_size: 3 + (i % 6),
                stag_limit, cat_interval: cat_interval + (i % 5) * 80,
                island_id: i, log_interval,
                local_search_gens: [Math.floor(gens * 0.25), Math.floor(gens * 0.5), Math.floor(gens * 0.75)]
            };

            const w = new Worker(__filename, {
                workerData: { labs, cols, rows, pinned_entries, free_positions, free_ci, dist_flat, cfg }
            });
            w.on('message', msg => {
                if (msg.type === 'progress' && msg.island_id === 0) {
                    process.stdout.write(`\r  [${label}] I0: gen=${msg.gen} best=${msg.best_fit.toFixed(1)} stag=${msg.stag} mr=${msg.mr} hof=${msg.hof_n} cat=${msg.cats}     `);
                } else if (msg.type === 'local_search_result') {
                    console.log(`\n  🔍 Island ${msg.island_id} LS @gen=${msg.gen}: ${msg.old_fit.toFixed(1)} → ${msg.new_fit.toFixed(1)} (${msg.rounds} rounds)`);
                } else if (msg.type === 'done') {
                    results.push(msg.result);
                    done++;
                    console.log(`  ✓ Island ${msg.result.island_id}: ${msg.result.fit.toFixed(1)} (${msg.result.cats} cat)`);

                    if (done === num_islands) {
                        results.sort((a, b) => a.fit - b.fit);
                        console.log(`\n  🏆 Global best: ${results[0].fit.toFixed(1)} (island ${results[0].island_id})`);
                        console.log(`  Top 5: ${results.slice(0, 5).map(r => r.fit.toFixed(1)).join(', ')}`);

                        const pinned = new Map(pinned_entries);
                        const full = build_full(results[0].perm, pinned, free_positions, cols * rows);
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
    for (let L = 10; L <= 95; L += 5) {
        for (let a = -80; a <= 80; a += 8) {
            for (let b = -80; b <= 80; b += 8) {
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);
                const check = rgb_to_lab(rgb);
                if (lab_distance(lab, check) < 4) candidates.push({ lab, rgb });
            }
        }
    }
    console.log(`  ${candidates.length} valid candidates`);

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
        for (let j = 0; j < candidates.length; j++) { const d = lab_distance(candidates[j].lab, ch.lab); if (d < min_d[j]) min_d[j] = d; }
        min_d[bi] = -1;
    }
    return selected;
}

function write_pal(fp, arr, varname, desc) {
    const items = arr.map(c => `    {"hex": "${c.hex}", "name": "${c.name}", "rgb": "${c.rgb}"}`);
    fs.writeFileSync(fp, `/**\n * ${desc}\n * \n * Generated by optimize-palette-v5.js (GA + Local Search, 24 cores)\n * Generated: ${new Date().toISOString()}\n */\n\nconst ${varname} = [\n${items.join(',\n')}\n];\n\nmodule.exports = ${varname};\n`, 'utf8');
    console.log(`  Written: ${fp} (${arr.length} colors)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    const cores = Math.min(os.cpus().length, 24);
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Palette Optimizer v5 — GA + Local Search            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`  Cores: ${os.cpus().length} available, using ${cores} islands`);
    console.log(`  Population: 500/island  Generations: 8000 max`);
    console.log(`  Local search: steepest-descent at 25%, 50%, 75%, final\n`);

    const pal = require('../html-core/arr_colors');
    console.log(`  Loaded ${pal.length} Crayola colors`);

    // Find existing White and Black in the Crayola set
    let white_idx = pal.findIndex(c => c.hex === '#FFFFFF' || c.hex === '#ffffff');
    let black_idx = pal.findIndex(c => c.hex === '#000000');

    if (white_idx < 0) {
        console.log('  White not found in Crayola, adding it');
        pal.push({ hex: '#FFFFFF', name: 'White', rgb: '(255, 255, 255)' });
        white_idx = pal.length - 1;
    } else {
        console.log(`  White found at index ${white_idx}: ${pal[white_idx].name}`);
    }
    if (black_idx < 0) {
        console.log('  Black not found in Crayola, adding it');
        pal.push({ hex: '#000000', name: 'Black', rgb: '(0, 0, 0)' });
        black_idx = pal.length - 1;
    } else {
        console.log(`  Black found at index ${black_idx}: ${pal[black_idx].name}`);
    }

    const gap_needed = 144 - pal.length;
    const base_labs = pal.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n═══ Finding ${gap_needed} gap-filling colors ═══`);
    const gap_colors = find_gap_colors(base_labs, gap_needed);
    const all_colors = [...pal, ...gap_colors];
    const all_labs = all_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));
    const n_colors = all_colors.length;

    console.log(`\n  Total: ${n_colors} colors (${pal.length} Crayola + ${gap_needed} gap)`);
    console.log(`  Building ${n_colors}×${n_colors} distance matrix...`);
    const dist_matrix = build_distance_matrix(all_labs);
    console.log(`  Distance matrix ready (${(dist_matrix.byteLength / 1024 / 1024).toFixed(1)} MB)\n`);

    const pinned_entries = [[0, white_idx], [143, black_idx]];
    const free_positions = []; for (let i = 0; i < 144; i++) if (i !== 0 && i !== 143) free_positions.push(i);
    const free_ci = []; for (let i = 0; i < n_colors; i++) if (i !== white_idx && i !== black_idx) free_ci.push(i);

    console.log(`  Pinned: pos 0 = ${pal[white_idx].name} (idx ${white_idx}), pos 143 = ${pal[black_idx].name} (idx ${black_idx})`);
    console.log(`  Free: ${free_positions.length} positions, ${free_ci.length} colors\n`);

    console.log('═══ Optimizing (GA + Local Search) ═══');
    const t = Date.now();
    const result = await run_parallel(all_labs, 12, 12, pinned_entries, free_positions, free_ci, dist_matrix, {
        num_islands: cores,
        pop_per_island: 500,
        gens: 8000,
        base_mr: 0.2,
        stag_limit: 1000,
        cat_interval: 300,
        log_interval: 1000,
        label: 'WB-144'
    });
    const elapsed = ((Date.now() - t) / 1000).toFixed(1);
    console.log(`  Time: ${elapsed}s\n`);

    console.log(`  Verify: pos[0]   = ${all_colors[result.arr[0]].name} (${all_colors[result.arr[0]].hex})`);
    console.log(`  Verify: pos[143] = ${all_colors[result.arr[143]].name} (${all_colors[result.arr[143]].hex})\n`);

    const sorted = result.arr.map(i => all_colors[i]);
    write_pal(
        path.join(__dirname, '..', 'html-core', 'pal_crayola_extended.js'),
        sorted, 'pal_crayola_extended',
        'Extended Crayola — 144 Colors (12×12)\n * White pinned at top-left, Black pinned at bottom-right.\n * 133 Crayola + 11 gap colors, GA + local search optimized.'
    );

    console.log('\n════════════════════════════════════════════════════════');
    console.log(`  Fitness: ${result.fit.toFixed(1)}  |  Time: ${elapsed}s  |  Cores: ${cores}`);
    console.log(`  Top-left: ${sorted[0].name}  |  Bottom-right: ${sorted[143].name}`);
    console.log('════════════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
