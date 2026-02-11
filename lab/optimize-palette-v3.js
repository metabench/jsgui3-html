/**
 * Palette Optimizer v3 — High-Quality 144-Color Palettes
 * 
 * Focused on producing two premium 12×12 palettes:
 *   1. Extended Crayola (133 + 11 gap-filling = 144)
 *   2. Pastel palette (144 colors sampled from pastel LAB region)
 * 
 * Uses the island-model parallel GA from v2 with aggressive settings.
 * 
 * Usage:
 *   node lab/optimize-palette-v3.js
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
// Fitness
// ============================================================

function grid_fitness(arr, labs, cols, rows) {
    let total = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (i >= arr.length) continue;
            const lab = labs[arr[i]];
            if (x + 1 < cols) { const ri = y * cols + x + 1; if (ri < arr.length) total += lab_distance(lab, labs[arr[ri]]); }
            if (y + 1 < rows) { const bi = (y + 1) * cols + x; if (bi < arr.length) total += lab_distance(lab, labs[arr[bi]]); }
        }
    }
    return total;
}

// ============================================================
// Mutations
// ============================================================

function random_perm(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function swap_mut(a) { const r = [...a], i = Math.floor(Math.random() * a.length); let j = Math.floor(Math.random() * (a.length - 1)); if (j >= i) j++;[r[i], r[j]] = [r[j], r[i]]; return r; }

function reverse_mut(a) {
    const r = [...a]; let s = Math.floor(Math.random() * a.length), e = Math.floor(Math.random() * a.length);
    if (s > e) [s, e] = [e, s]; while (s < e) { [r[s], r[e]] = [r[e], r[s]]; s++; e--; } return r;
}

function scramble_mut(a) {
    const r = [...a], len = 3 + Math.floor(Math.random() * Math.min(10, a.length / 3));
    const s = Math.floor(Math.random() * (a.length - len));
    for (let i = s + len - 1; i > s; i--) { const j = s + Math.floor(Math.random() * (i - s + 1));[r[i], r[j]] = [r[j], r[i]]; }
    return r;
}

function block_swap_mut(a, c, rw) {
    const r = [...a], bw = 1 + Math.floor(Math.random() * Math.min(4, c - 1)), bh = 1 + Math.floor(Math.random() * Math.min(4, rw - 1));
    const x1 = Math.floor(Math.random() * (c - bw)), y1 = Math.floor(Math.random() * (rw - bh));
    let x2, y2, att = 0;
    do { x2 = Math.floor(Math.random() * (c - bw)); y2 = Math.floor(Math.random() * (rw - bh)); att++; }
    while (Math.abs(x2 - x1) < bw && Math.abs(y2 - y1) < bh && att < 20);
    if (att >= 20) return swap_mut(a);
    for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) {
        const i1 = (y1 + dy) * c + x1 + dx, i2 = (y2 + dy) * c + x2 + dx;
        if (i1 < a.length && i2 < a.length) [r[i1], r[i2]] = [r[i2], r[i1]];
    }
    return r;
}

function row_rot_mut(a, c, rw) {
    const r = [...a], row = Math.floor(Math.random() * rw), sh = 1 + Math.floor(Math.random() * (c - 1));
    const s = row * c, e = Math.min(s + c, a.length), len = e - s;
    if (len < 2) return r;
    const t = r.slice(s, e);
    for (let i = 0; i < len; i++) r[s + i] = t[(i + sh) % len];
    return r;
}

function col_rot_mut(a, c, rw) {
    const r = [...a], col = Math.floor(Math.random() * c), sh = 1 + Math.floor(Math.random() * (rw - 1));
    const vals = [];
    for (let y = 0; y < rw; y++) { const i = y * c + col; if (i < a.length) vals.push(r[i]); }
    if (vals.length < 2) return r;
    for (let y = 0; y < vals.length; y++) r[y * c + col] = vals[(y + sh) % vals.length];
    return r;
}

function nbr_swap_mut(a, c, rw) {
    const r = [...a], p = Math.floor(Math.random() * a.length), x = p % c, y = Math.floor(p / c);
    const nb = [];
    if (x > 0) nb.push(y * c + x - 1);
    if (x < c - 1 && y * c + x + 1 < a.length) nb.push(y * c + x + 1);
    if (y > 0) nb.push((y - 1) * c + x);
    if (y < rw - 1 && (y + 1) * c + x < a.length) nb.push((y + 1) * c + x);
    if (!nb.length) return r;
    const n = nb[Math.floor(Math.random() * nb.length)];
    [r[p], r[n]] = [r[n], r[p]]; return r;
}

function multi_swap_mut(a) {
    let r = [...a]; const cnt = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < cnt; i++) { const x = Math.floor(Math.random() * r.length); let y = Math.floor(Math.random() * (r.length - 1)); if (y >= x) y++;[r[x], r[y]] = [r[y], r[x]]; }
    return r;
}

/** 2-opt inspired: pick a bad edge and try to fix it */
function targeted_swap_mut(a, labs, c, rw) {
    const r = [...a];
    // Find the worst neighbor pair
    let worst_dist = 0, worst_pos = 0;
    for (let y = 0; y < rw; y++) {
        for (let x = 0; x < c; x++) {
            const i = y * c + x;
            if (i >= a.length) continue;
            if (x + 1 < c && y * c + x + 1 < a.length) {
                const d = lab_distance(labs[r[i]], labs[r[y * c + x + 1]]);
                if (d > worst_dist) { worst_dist = d; worst_pos = i; }
            }
            if (y + 1 < rw && (y + 1) * c + x < a.length) {
                const d = lab_distance(labs[r[i]], labs[r[(y + 1) * c + x]]);
                if (d > worst_dist) { worst_dist = d; worst_pos = i; }
            }
        }
    }
    // Swap the worst cell with a random position
    const other = Math.floor(Math.random() * a.length);
    [r[worst_pos], r[other]] = [r[other], r[worst_pos]];
    return r;
}

function apply_mut(a, c, rw, intensity, labs) {
    const roll = Math.random();
    if (intensity > 0.7) {
        if (roll < 0.15) return scramble_mut(a);
        if (roll < 0.30) return block_swap_mut(a, c, rw);
        if (roll < 0.45) return multi_swap_mut(a);
        if (roll < 0.55) return row_rot_mut(a, c, rw);
        if (roll < 0.65) return col_rot_mut(a, c, rw);
        if (roll < 0.80) return targeted_swap_mut(a, labs, c, rw);
        return reverse_mut(a);
    } else if (intensity > 0.3) {
        if (roll < 0.20) return nbr_swap_mut(a, c, rw);
        if (roll < 0.35) return swap_mut(a);
        if (roll < 0.50) return block_swap_mut(a, c, rw);
        if (roll < 0.60) return scramble_mut(a);
        if (roll < 0.70) return targeted_swap_mut(a, labs, c, rw);
        if (roll < 0.80) return row_rot_mut(a, c, rw);
        if (roll < 0.90) return col_rot_mut(a, c, rw);
        return reverse_mut(a);
    } else {
        if (roll < 0.30) return nbr_swap_mut(a, c, rw);
        if (roll < 0.50) return swap_mut(a);
        if (roll < 0.65) return targeted_swap_mut(a, labs, c, rw);
        if (roll < 0.80) return row_rot_mut(a, c, rw);
        if (roll < 0.90) return col_rot_mut(a, c, rw);
        return reverse_mut(a);
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
// Island GA (Worker)
// ============================================================

function run_island(labs, cols, rows, cfg) {
    const {
        pop_size = 200, gens = 5000, elite_frac = 0.05, base_mr = 0.2,
        tourn_size = 5, stag_limit = 800, cat_interval = 250,
        island_id = 0, immigrants = [], log_interval = 500
    } = cfg;

    const n = labs.length;
    const elite_n = Math.max(2, Math.floor(pop_size * elite_frac));

    let pop = Array.from({ length: pop_size }, () => random_perm(n));
    for (let i = 0; i < Math.min(immigrants.length, Math.floor(pop_size * 0.1)); i++)
        pop[pop_size - 1 - i] = [...immigrants[i]];

    let fits = pop.map(p => grid_fitness(p, labs, cols, rows));
    let best_fit = Infinity, best_arr = null, stag = 0, cats = 0;

    const hof = [], HOF_MAX = 15;
    const hof_diverse = (a) => hof.every(h => {
        let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== h.arr[i]) d++;
        return d >= a.length * 0.12;
    });

    for (let gen = 0; gen < gens; gen++) {
        const idx = Array.from({ length: pop_size }, (_, i) => i);
        idx.sort((a, b) => fits[a] - fits[b]);
        const sp = idx.map(i => pop[i]), sf = idx.map(i => fits[i]);

        if (sf[0] < best_fit) {
            best_fit = sf[0]; best_arr = [...sp[0]]; stag = 0;
            if (hof_diverse(best_arr)) {
                hof.push({ arr: [...best_arr], fit: best_fit });
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
            for (let i = elite_n; i < pop_size; i++) {
                if (i < elite_n + hof.length) {
                    let m = [...hof[i - elite_n].arr];
                    for (let k = 0; k < 15; k++) m = apply_mut(m, cols, rows, 1.0, labs);
                    sp[i] = m;
                } else sp[i] = random_perm(n);
            }
        }

        if (stag >= stag_limit) break;

        const next = [];
        for (let i = 0; i < elite_n; i++) next.push([...sp[i]]);

        while (next.length < pop_size) {
            const p1 = tournament(sp, sf, tourn_size), p2 = tournament(sp, sf, tourn_size);
            let child = Math.random() < 0.65 ? ox_crossover(p1, p2) : pos_crossover(p1, p2);
            if (Math.random() < mr) child = apply_mut(child, cols, rows, intensity, labs);
            if (Math.random() < 0.1) child = apply_mut(child, cols, rows, Math.min(intensity + 0.3, 1.0), labs);
            next.push(child);
        }

        pop = next;
        fits = pop.map(p => grid_fitness(p, labs, cols, rows));
    }

    return { arr: best_arr, fit: best_fit, hof, cats, island_id };
}

// ============================================================
// Worker entry
// ============================================================

if (!isMainThread) {
    const { labs, cols, rows, cfg } = workerData;
    const result = run_island(labs, cols, rows, cfg);
    parentPort.postMessage({ type: 'done', result });
    process.exit(0);
}

// ============================================================
// Parallel coordinator
// ============================================================

function run_parallel(labs, cols, rows, opts = {}) {
    const {
        num_islands = 24, pop_per_island = 200, gens = 5000,
        base_mr = 0.2, stag_limit = 800, cat_interval = 250,
        log_interval = 500, label = ''
    } = opts;

    return new Promise((resolve, reject) => {
        console.log(`  Launching ${num_islands} islands (${pop_per_island} pop each, ${gens} gens max)...`);
        const results = []; let done = 0;

        for (let i = 0; i < num_islands; i++) {
            const cfg = {
                pop_size: pop_per_island,
                gens,
                elite_frac: 0.04 + (i % 4) * 0.02,
                base_mr: base_mr + (i % 5) * 0.04,
                tourn_size: 3 + (i % 5),
                stag_limit,
                cat_interval: cat_interval + (i % 4) * 60,
                island_id: i,
                immigrants: [],
                log_interval
            };

            const w = new Worker(__filename, { workerData: { labs, cols, rows, cfg } });
            w.on('message', msg => {
                if (msg.type === 'progress' && msg.island_id === 0) {
                    process.stdout.write(`\r  [${label}] I0: gen=${msg.gen} best=${msg.best_fit.toFixed(1)} stag=${msg.stag} mr=${msg.mr} hof=${msg.hof_n} cat=${msg.cats}     `);
                } else if (msg.type === 'done') {
                    results.push(msg.result);
                    done++;
                    if (done === num_islands) {
                        results.sort((a, b) => a.fit - b.fit);
                        const all_hof = [];
                        for (const r of results) for (const h of r.hof) all_hof.push(h);
                        all_hof.sort((a, b) => a.fit - b.fit);

                        const div_hof = [all_hof[0]];
                        for (let i = 1; i < all_hof.length && div_hof.length < 10; i++) {
                            let dominated = false;
                            for (const e of div_hof) {
                                let d = 0; for (let j = 0; j < all_hof[i].arr.length; j++) if (all_hof[i].arr[j] !== e.arr[j]) d++;
                                if (d < all_hof[i].arr.length * 0.12) { dominated = true; break; }
                            }
                            if (!dominated) div_hof.push(all_hof[i]);
                        }

                        console.log(`\n  ✓ Best: ${results[0].fit.toFixed(1)} (island ${results[0].island_id})`);
                        console.log(`  Top 5 islands: ${results.slice(0, 5).map(r => r.fit.toFixed(1)).join(', ')}`);
                        console.log(`  Diverse HOF: ${div_hof.length} entries (${div_hof.map(h => h.fit.toFixed(1)).join(', ')})`);

                        resolve({ arr: results[0].arr, fit: results[0].fit, all_results: results, hof: div_hof });
                    }
                }
            });
            w.on('error', reject);
        }
    });
}

// ============================================================
// Color generation
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
    console.log(`  ${candidates.length} valid candidates sampled`);

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
        const name = `${ln} ${hname} ${i + 1}`;

        selected.push({ hex, name, rgb: `(${ch.rgb[0]}, ${ch.rgb[1]}, ${ch.rgb[2]})`, lab: ch.lab });
        console.log(`  [${i + 1}/${count}] ${name}: ${hex} (gap: ${bd.toFixed(1)})`);

        for (let j = 0; j < candidates.length; j++) {
            const d = lab_distance(candidates[j].lab, ch.lab);
            if (d < min_d[j]) min_d[j] = d;
        }
        min_d[bi] = -1;
    }
    return selected;
}

/**
 * Generate 144 diverse pastel colors by sampling the high-L*, low-chroma
 * region of LAB space and using maximin selection.
 */
function generate_pastel_palette(count) {
    console.log(`  Sampling pastel LAB region for ${count} colors...`);

    // Dense sampling of the pastel region
    const candidates = [];
    // Pastels: L* from 65 to 95, chroma from 5 to 55
    for (let L = 65; L <= 95; L += 2) {
        for (let a = -55; a <= 55; a += 4) {
            for (let b = -55; b <= 55; b += 4) {
                const chroma = Math.sqrt(a * a + b * b);
                if (chroma < 5 || chroma > 55) continue;
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);
                // Verify round-trip accuracy
                const check = rgb_to_lab(rgb);
                if (lab_distance(lab, check) < 3) {
                    candidates.push({ lab, rgb });
                }
            }
        }
    }

    // Also add some very light near-whites for variety
    for (let L = 88; L <= 97; L += 3) {
        for (let a = -15; a <= 15; a += 5) {
            for (let b = -15; b <= 15; b += 5) {
                const chroma = Math.sqrt(a * a + b * b);
                if (chroma < 3 || chroma > 20) continue;
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);
                const check = rgb_to_lab(rgb);
                if (lab_distance(lab, check) < 3) {
                    candidates.push({ lab, rgb });
                }
            }
        }
    }

    console.log(`  ${candidates.length} valid pastel candidates`);

    // Maximin selection: pick colors that are maximally spread
    const selected = [];
    const min_d = new Float64Array(candidates.length).fill(Infinity);

    for (let i = 0; i < count; i++) {
        let bi = 0, bd = -1;

        if (i === 0) {
            // Start with the candidate nearest to "pastel center" L=80, a=0, b=0
            const center = [80, 0, 0];
            let best_center_d = Infinity;
            for (let j = 0; j < candidates.length; j++) {
                const d = lab_distance(candidates[j].lab, center);
                if (d < best_center_d) { best_center_d = d; bi = j; }
            }
            bd = best_center_d;
        } else {
            for (let j = 0; j < candidates.length; j++) if (min_d[j] > bd) { bd = min_d[j]; bi = j; }
        }

        const ch = candidates[bi];
        const hex = rgb_to_hex(ch.rgb);
        const [L, ca, cb] = ch.lab;
        const ha = Math.atan2(cb, ca) * 180 / Math.PI;
        const chr = Math.sqrt(ca * ca + cb * cb);

        let hname;
        if (chr < 8) hname = 'Mist';
        else if (ha >= -22 && ha < 22) hname = 'Blush';
        else if (ha >= 22 && ha < 60) hname = 'Peach';
        else if (ha >= 60 && ha < 105) hname = 'Buttercup';
        else if (ha >= 105 && ha < 150) hname = 'Pistachio';
        else if (ha >= 150 || ha < -150) hname = 'Mint';
        else if (ha >= -150 && ha < -105) hname = 'Sky';
        else if (ha >= -105 && ha < -60) hname = 'Periwinkle';
        else hname = 'Lavender';

        const ln = L > 85 ? 'Pale' : L > 75 ? 'Soft' : 'Dusty';
        const name = `${ln} ${hname} ${i + 1}`;

        selected.push({ hex, name, rgb: `(${ch.rgb[0]}, ${ch.rgb[1]}, ${ch.rgb[2]})`, lab: ch.lab });

        if (i < 5 || i === count - 1) console.log(`  [${i + 1}/${count}] ${name}: ${hex}`);
        else if (i === 5) console.log(`  ...`);

        // Update distances
        for (let j = 0; j < candidates.length; j++) {
            const d = lab_distance(candidates[j].lab, ch.lab);
            if (d < min_d[j]) min_d[j] = d;
        }
        min_d[bi] = -1;
    }

    return selected;
}

// ============================================================
// File output
// ============================================================

function write_pal(fp, arr, varname, desc) {
    const items = arr.map(c => `    {"hex": "${c.hex}", "name": "${c.name}", "rgb": "${c.rgb}"}`);
    const content = `/**\n * ${desc}\n * \n * Generated by lab/optimize-palette-v3.js (Island-Model Parallel GA, 24 cores)\n * Generated: ${new Date().toISOString()}\n */\n\nconst ${varname} = [\n${items.join(',\n')}\n];\n\nmodule.exports = ${varname};\n`;
    fs.writeFileSync(fp, content, 'utf8');
    console.log(`  Written: ${fp} (${arr.length} colors)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    const cores = Math.min(os.cpus().length, 24);

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Palette Optimizer v3 — High-Quality 144-Color       ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`  Cores: ${os.cpus().length} available, using ${cores} islands\n`);

    const pal = require('../html-core/arr_colors');
    const labs = pal.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    // ---------- 1. Extended Crayola 144 ----------
    console.log('═══ Step 1: Extend Crayola to 144 colors ═══');
    const gap_n = 144 - pal.length;
    console.log(`  Need ${gap_n} gap-filling colors\n`);
    const gap_colors = find_gap_colors(labs, gap_n);
    const ext_colors = [...pal, ...gap_colors];
    const ext_labs = ext_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n═══ Step 2: Optimize Extended Crayola (144, 12×12) ═══`);
    const t1 = Date.now();
    const ext_result = await run_parallel(ext_labs, 12, 12, {
        num_islands: cores,
        pop_per_island: 250,
        gens: 5000,
        base_mr: 0.2,
        stag_limit: 800,
        cat_interval: 250,
        log_interval: 500,
        label: 'Crayola-144'
    });
    console.log(`  Time: ${((Date.now() - t1) / 1000).toFixed(1)}s\n`);

    const sorted_ext = ext_result.arr.map(i => ext_colors[i]);
    write_pal(
        path.join(__dirname, '..', 'html-core', 'pal_crayola_extended.js'),
        sorted_ext, 'pal_crayola_extended',
        'Extended Crayola Palette — 144 Colors (12×12, no empty cells)\n * 133 original Crayola + 11 gap-filling colors, GA-sorted for smooth transitions.'
    );

    // Also write the 133 sorted
    console.log('\n═══ Step 3: Optimize Original 133 Crayola ═══');
    const t2 = Date.now();
    const crayola_result = await run_parallel(labs, 12, Math.ceil(pal.length / 12), {
        num_islands: cores,
        pop_per_island: 250,
        gens: 5000,
        base_mr: 0.2,
        stag_limit: 800,
        cat_interval: 250,
        log_interval: 500,
        label: 'Crayola-133'
    });
    console.log(`  Time: ${((Date.now() - t2) / 1000).toFixed(1)}s\n`);

    const sorted_133 = crayola_result.arr.map(i => pal[i]);
    write_pal(
        path.join(__dirname, '..', 'html-core', 'pal_crayola_sorted.js'),
        sorted_133, 'pal_crayola_sorted',
        `Crayola Palette — Perceptually Sorted (${sorted_133.length} colors)\n * Full Crayola palette rearranged for smooth neighbor transitions.`
    );

    // ---------- 2. Pastel 144 ----------
    console.log('\n═══ Step 4: Generate 144 Pastel Colors ═══');
    const pastel_colors = generate_pastel_palette(144);

    const pastel_labs = pastel_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n═══ Step 5: Optimize Pastel Palette (144, 12×12) ═══`);
    const t3 = Date.now();
    const pastel_result = await run_parallel(pastel_labs, 12, 12, {
        num_islands: cores,
        pop_per_island: 250,
        gens: 5000,
        base_mr: 0.2,
        stag_limit: 800,
        cat_interval: 250,
        log_interval: 500,
        label: 'Pastel-144'
    });
    console.log(`  Time: ${((Date.now() - t3) / 1000).toFixed(1)}s\n`);

    const sorted_pastels = pastel_result.arr.map(i => pastel_colors[i]);
    write_pal(
        path.join(__dirname, '..', 'html-core', 'pal_pastels.js'),
        sorted_pastels, 'pal_pastels',
        'Pastel Palette — 144 Colors (12×12)\n * 144 pastel colors (high lightness, low chroma) sampled from LAB space.\n * GA-sorted for smooth neighbor transitions.'
    );

    // ---------- Summary ----------
    const orig_fit = grid_fitness(Array.from({ length: pal.length }, (_, i) => i), labs, 12, Math.ceil(pal.length / 12));
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════');
    console.log(`  Cores:              ${cores}`);
    console.log(`  Crayola 133:        ${orig_fit.toFixed(1)} → ${crayola_result.fit.toFixed(1)} (${((1 - crayola_result.fit / orig_fit) * 100).toFixed(1)}%)`);
    console.log(`  Crayola Extended:   ${ext_result.fit.toFixed(1)}`);
    console.log(`  Pastels 144:        ${pastel_result.fit.toFixed(1)}`);
    console.log(`  Output: html-core/pal_crayola_sorted.js`);
    console.log(`  Output: html-core/pal_crayola_extended.js`);
    console.log(`  Output: html-core/pal_pastels.js`);
    console.log('  Done.\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
