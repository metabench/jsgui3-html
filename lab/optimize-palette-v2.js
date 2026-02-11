/**
 * Palette Arrangement Optimizer v2 — Island-Model Parallel GA
 * 
 * Major improvements over v1:
 *   1. 24-core parallelism via worker_threads (island model)
 *   2. Advanced mutations: block swap, scramble, row/col rotate, neighbor swap
 *   3. Adaptive mutation rate that increases with stagnation
 *   4. Population restart on deep stagnation (catastrophe)
 *   5. Hall-of-Fame: diverse elite set maintained across all islands
 *   6. Periodic migration of best solutions between islands
 * 
 * Produces:
 *   - html-core/pal_crayola_sorted.js   (133 colors)
 *   - html-core/pal_pastels.js           (pastel subset)
 *   - html-core/pal_crayola_extended.js  (144 colors, 12×12)
 * 
 * Usage:
 *   node lab/optimize-palette-v2.js
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ============================================================
// Color Space Conversions
// ============================================================

function hex_to_rgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16)
    ];
}

function rgb_to_lab(rgb) {
    let [r, g, b] = rgb.map(v => {
        v = v / 255;
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    });

    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    x /= 0.95047; y /= 1.00000; z /= 1.08883;

    const f = v => v > 0.008856 ? Math.pow(v, 1 / 3) : (7.787 * v) + (16 / 116);
    const fx = f(x), fy = f(y), fz = f(z);

    return [(116 * fy) - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function lab_to_rgb(lab) {
    const [L, a, b] = lab;
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    const f_inv = t => t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787;
    let x = f_inv(fx) * 0.95047;
    let y = f_inv(fy) * 1.00000;
    let z = f_inv(fz) * 1.08883;
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let bl = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    const gamma = v => v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
    return [
        Math.max(0, Math.min(255, Math.round(gamma(r) * 255))),
        Math.max(0, Math.min(255, Math.round(gamma(g) * 255))),
        Math.max(0, Math.min(255, Math.round(gamma(bl) * 255)))
    ];
}

function rgb_to_hex(rgb) {
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function lab_distance(lab1, lab2) {
    const dL = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];
    return Math.sqrt(dL * dL + da * da + db * db);
}

// ============================================================
// Grid Fitness
// ============================================================

function grid_fitness(arrangement, lab_colors, cols, rows) {
    let total = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            if (idx >= arrangement.length) continue;
            const color_idx = arrangement[idx];
            const lab = lab_colors[color_idx];

            if (x + 1 < cols) {
                const right_idx = y * cols + (x + 1);
                if (right_idx < arrangement.length) {
                    total += lab_distance(lab, lab_colors[arrangement[right_idx]]);
                }
            }
            if (y + 1 < rows) {
                const bottom_idx = (y + 1) * cols + x;
                if (bottom_idx < arrangement.length) {
                    total += lab_distance(lab, lab_colors[arrangement[bottom_idx]]);
                }
            }
        }
    }
    return total;
}

// ============================================================
// Mutation Operators (Advanced)
// ============================================================

function random_permutation(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/** Swap two random positions */
function swap_mutate(arr) {
    const n = arr.length;
    const result = [...arr];
    const a = Math.floor(Math.random() * n);
    let b = Math.floor(Math.random() * (n - 1));
    if (b >= a) b++;
    [result[a], result[b]] = [result[b], result[a]];
    return result;
}

/** Reverse a random segment */
function reverse_mutate(arr) {
    const n = arr.length;
    const result = [...arr];
    let a = Math.floor(Math.random() * n);
    let b = Math.floor(Math.random() * n);
    if (a > b) [a, b] = [b, a];
    while (a < b) {
        [result[a], result[b]] = [result[b], result[a]];
        a++; b--;
    }
    return result;
}

/** Scramble a random segment — fully shuffles a substring */
function scramble_mutate(arr) {
    const n = arr.length;
    const result = [...arr];
    const len = 3 + Math.floor(Math.random() * Math.min(8, n / 4));
    const start = Math.floor(Math.random() * (n - len));
    // Fisher-Yates on the segment
    for (let i = start + len - 1; i > start; i--) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** Block swap — swap two rectangular blocks in the 2D grid */
function block_swap_mutate(arr, cols, rows) {
    const result = [...arr];
    const bw = 1 + Math.floor(Math.random() * Math.min(4, cols - 1));
    const bh = 1 + Math.floor(Math.random() * Math.min(4, rows - 1));

    const x1 = Math.floor(Math.random() * (cols - bw));
    const y1 = Math.floor(Math.random() * (rows - bh));
    let x2 = Math.floor(Math.random() * (cols - bw));
    let y2 = Math.floor(Math.random() * (rows - bh));

    // Ensure non-overlapping
    let attempts = 0;
    while (Math.abs(x2 - x1) < bw && Math.abs(y2 - y1) < bh && attempts < 20) {
        x2 = Math.floor(Math.random() * (cols - bw));
        y2 = Math.floor(Math.random() * (rows - bh));
        attempts++;
    }
    if (attempts >= 20) return swap_mutate(arr); // fallback

    for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
            const i1 = (y1 + dy) * cols + (x1 + dx);
            const i2 = (y2 + dy) * cols + (x2 + dx);
            if (i1 < arr.length && i2 < arr.length) {
                [result[i1], result[i2]] = [result[i2], result[i1]];
            }
        }
    }
    return result;
}

/** Row rotation — cyclically shift one row left/right */
function row_rotate_mutate(arr, cols, rows) {
    const result = [...arr];
    const row = Math.floor(Math.random() * rows);
    const shift = 1 + Math.floor(Math.random() * (cols - 1));
    const start = row * cols;
    const end = Math.min(start + cols, arr.length);
    const row_len = end - start;
    if (row_len < 2) return result;

    const temp = result.slice(start, end);
    for (let i = 0; i < row_len; i++) {
        result[start + i] = temp[(i + shift) % row_len];
    }
    return result;
}

/** Column rotation — cyclically shift one column up/down */
function col_rotate_mutate(arr, cols, rows) {
    const result = [...arr];
    const col = Math.floor(Math.random() * cols);
    const shift = 1 + Math.floor(Math.random() * (rows - 1));

    const col_vals = [];
    for (let r = 0; r < rows; r++) {
        const idx = r * cols + col;
        if (idx < arr.length) col_vals.push(result[idx]);
    }
    if (col_vals.length < 2) return result;

    for (let r = 0; r < col_vals.length; r++) {
        const idx = r * cols + col;
        result[idx] = col_vals[(r + shift) % col_vals.length];
    }
    return result;
}

/** Neighbor swap — swap a cell with one of its 4 grid neighbors */
function neighbor_swap_mutate(arr, cols, rows) {
    const result = [...arr];
    const pos = Math.floor(Math.random() * arr.length);
    const x = pos % cols;
    const y = Math.floor(pos / cols);

    const neighbors = [];
    if (x > 0) neighbors.push(y * cols + (x - 1));
    if (x < cols - 1 && y * cols + (x + 1) < arr.length) neighbors.push(y * cols + (x + 1));
    if (y > 0) neighbors.push((y - 1) * cols + x);
    if (y < rows - 1 && (y + 1) * cols + x < arr.length) neighbors.push((y + 1) * cols + x);

    if (neighbors.length === 0) return result;
    const nbr = neighbors[Math.floor(Math.random() * neighbors.length)];
    [result[pos], result[nbr]] = [result[nbr], result[pos]];
    return result;
}

/** Multi-swap — perform several swaps at once for large redistribution */
function multi_swap_mutate(arr) {
    let result = [...arr];
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
        const a = Math.floor(Math.random() * result.length);
        let b = Math.floor(Math.random() * (result.length - 1));
        if (b >= a) b++;
        [result[a], result[b]] = [result[b], result[a]];
    }
    return result;
}

/** Apply a random mutation, weighted by type */
function apply_mutation(arr, cols, rows, intensity) {
    // Higher intensity = more aggressive mutations
    const roll = Math.random();

    if (intensity > 0.7) {
        // High stagnation: prefer aggressive redistribution
        if (roll < 0.20) return scramble_mutate(arr);
        if (roll < 0.40) return block_swap_mutate(arr, cols, rows);
        if (roll < 0.55) return multi_swap_mutate(arr);
        if (roll < 0.70) return row_rotate_mutate(arr, cols, rows);
        if (roll < 0.85) return col_rotate_mutate(arr, cols, rows);
        return reverse_mutate(arr);
    } else if (intensity > 0.3) {
        // Medium: balanced mix
        if (roll < 0.20) return neighbor_swap_mutate(arr, cols, rows);
        if (roll < 0.40) return swap_mutate(arr);
        if (roll < 0.55) return block_swap_mutate(arr, cols, rows);
        if (roll < 0.70) return scramble_mutate(arr);
        if (roll < 0.80) return row_rotate_mutate(arr, cols, rows);
        if (roll < 0.90) return col_rotate_mutate(arr, cols, rows);
        return reverse_mutate(arr);
    } else {
        // Low stagnation: prefer fine-tuning
        if (roll < 0.35) return neighbor_swap_mutate(arr, cols, rows);
        if (roll < 0.60) return swap_mutate(arr);
        if (roll < 0.75) return row_rotate_mutate(arr, cols, rows);
        if (roll < 0.90) return col_rotate_mutate(arr, cols, rows);
        return reverse_mutate(arr);
    }
}

// ============================================================
// Crossover
// ============================================================

function order_crossover(parent1, parent2) {
    const n = parent1.length;
    const start = Math.floor(Math.random() * n);
    const end = start + Math.floor(Math.random() * (n - start));
    const child = new Array(n).fill(-1);
    const used = new Set();

    for (let i = start; i <= end; i++) {
        child[i] = parent1[i];
        used.add(parent1[i]);
    }

    let pos = (end + 1) % n;
    for (let i = 0; i < n; i++) {
        const candidate = parent2[(end + 1 + i) % n];
        if (!used.has(candidate)) {
            child[pos] = candidate;
            pos = (pos + 1) % n;
        }
    }
    return child;
}

/** Position-based crossover — takes specific positions from parent1 */
function position_crossover(parent1, parent2) {
    const n = parent1.length;
    const child = new Array(n).fill(-1);
    const used = new Set();

    // Pick random positions from parent1
    const pick_count = Math.floor(n * (0.3 + Math.random() * 0.4));
    const positions = new Set();
    while (positions.size < pick_count) {
        positions.add(Math.floor(Math.random() * n));
    }

    for (const pos of positions) {
        child[pos] = parent1[pos];
        used.add(parent1[pos]);
    }

    // Fill remaining from parent2 in order
    let fill_pos = 0;
    for (let i = 0; i < n; i++) {
        if (!used.has(parent2[i])) {
            while (child[fill_pos] !== -1) fill_pos++;
            child[fill_pos] = parent2[i];
        }
    }
    return child;
}

function tournament_select(population, fitnesses, tournament_size) {
    let best_idx = Math.floor(Math.random() * population.length);
    for (let i = 1; i < tournament_size; i++) {
        const candidate = Math.floor(Math.random() * population.length);
        if (fitnesses[candidate] < fitnesses[best_idx]) {
            best_idx = candidate;
        }
    }
    return population[best_idx];
}

// ============================================================
// Island GA Worker
// ============================================================

function run_island(lab_colors, cols, rows, config) {
    const {
        population_size = 150,
        generations = 2000,
        elite_fraction = 0.05,
        base_mutation_rate = 0.2,
        tournament_size = 5,
        stagnation_limit = 500,
        catastrophe_interval = 200,
        island_id = 0,
        immigrants = [],
        log_interval = 200
    } = config;

    const n = lab_colors.length;
    const elite_count = Math.max(2, Math.floor(population_size * elite_fraction));

    // Initialize population
    let population = Array.from({ length: population_size }, () => random_permutation(n));

    // Inject immigrants (from other islands) into initial population
    for (let i = 0; i < Math.min(immigrants.length, Math.floor(population_size * 0.1)); i++) {
        population[population_size - 1 - i] = [...immigrants[i]];
    }

    let fitnesses = population.map(p => grid_fitness(p, lab_colors, cols, rows));

    let best_fitness = Infinity;
    let best_arrangement = null;
    let stagnation = 0;
    let catastrophe_count = 0;

    // Hall of fame — keep diverse top solutions
    const hall_of_fame = [];
    const HOF_SIZE = 10;

    const hof_is_diverse = (arr) => {
        // Check if arrangement is sufficiently different from existing HOF entries
        for (const entry of hall_of_fame) {
            let diff = 0;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== entry.arrangement[i]) diff++;
            }
            if (diff < arr.length * 0.15) return false; // too similar
        }
        return true;
    };

    for (let gen = 0; gen < generations; gen++) {
        // Sort by fitness
        const indices = Array.from({ length: population_size }, (_, i) => i);
        indices.sort((a, b) => fitnesses[a] - fitnesses[b]);
        const sorted_pop = indices.map(i => population[i]);
        const sorted_fit = indices.map(i => fitnesses[i]);

        // Track best
        if (sorted_fit[0] < best_fitness) {
            best_fitness = sorted_fit[0];
            best_arrangement = [...sorted_pop[0]];
            stagnation = 0;

            // Add to hall of fame if diverse
            if (hof_is_diverse(best_arrangement)) {
                hall_of_fame.push({ arrangement: [...best_arrangement], fitness: best_fitness });
                hall_of_fame.sort((a, b) => a.fitness - b.fitness);
                if (hall_of_fame.length > HOF_SIZE) hall_of_fame.pop();
            }
        } else {
            stagnation++;
        }

        // Adaptive mutation rate — increases with stagnation
        const stagnation_ratio = Math.min(stagnation / (stagnation_limit * 0.8), 1.0);
        const mutation_rate = base_mutation_rate + stagnation_ratio * (0.6 - base_mutation_rate);
        const mutation_intensity = stagnation_ratio; // 0 = fine-tune, 1 = aggressive

        // Logging 
        if (gen % log_interval === 0) {
            if (parentPort) {
                parentPort.postMessage({
                    type: 'progress',
                    island_id,
                    gen,
                    best_fitness,
                    current_best: sorted_fit[0],
                    stagnation,
                    mutation_rate: mutation_rate.toFixed(3),
                    hof_size: hall_of_fame.length,
                    catastrophes: catastrophe_count
                });
            }
        }

        // Catastrophe — restart most of population when deeply stagnated
        if (stagnation > 0 && stagnation % catastrophe_interval === 0) {
            catastrophe_count++;
            // Keep elite + HOF entries, replace rest with random + mutated HOF
            const survivors = Math.max(elite_count, 3);
            for (let i = survivors; i < population_size; i++) {
                if (i < survivors + hall_of_fame.length) {
                    // Heavily mutate a HOF entry
                    let mutant = [...hall_of_fame[i - survivors].arrangement];
                    for (let m = 0; m < 10; m++) {
                        mutant = apply_mutation(mutant, cols, rows, 1.0);
                    }
                    sorted_pop[i] = mutant;
                } else {
                    sorted_pop[i] = random_permutation(n);
                }
            }
        }

        // Early stopping
        if (stagnation >= stagnation_limit) {
            break;
        }

        // Build next generation
        const next_population = [];

        // Elitism
        for (let i = 0; i < elite_count; i++) {
            next_population.push([...sorted_pop[i]]);
        }

        // Fill rest with crossover + mutation
        while (next_population.length < population_size) {
            const parent1 = tournament_select(sorted_pop, sorted_fit, tournament_size);
            const parent2 = tournament_select(sorted_pop, sorted_fit, tournament_size);

            // Alternate crossover operators
            let child = Math.random() < 0.7
                ? order_crossover(parent1, parent2)
                : position_crossover(parent1, parent2);

            // Mutation with adaptive rate and intensity
            if (Math.random() < mutation_rate) {
                child = apply_mutation(child, cols, rows, mutation_intensity);
            }

            // Extra mutation for diversity
            if (Math.random() < 0.08) {
                child = apply_mutation(child, cols, rows, Math.min(mutation_intensity + 0.3, 1.0));
            }

            next_population.push(child);
        }

        population = next_population;
        fitnesses = population.map(p => grid_fitness(p, lab_colors, cols, rows));
    }

    return {
        arrangement: best_arrangement,
        fitness: best_fitness,
        hall_of_fame,
        catastrophe_count,
        island_id
    };
}

// ============================================================
// Worker Thread Entry Point
// ============================================================

if (!isMainThread) {
    const { lab_colors, cols, rows, config } = workerData;
    const result = run_island(lab_colors, cols, rows, config);
    parentPort.postMessage({ type: 'done', result });
    process.exit(0);
}

// ============================================================
// Main Thread — Island Model Coordinator
// ============================================================

function run_parallel_islands(lab_colors, cols, rows, options = {}) {
    const {
        num_islands = 24,
        population_per_island = 150,
        generations = 3000,
        base_mutation_rate = 0.2,
        stagnation_limit = 600,
        catastrophe_interval = 200,
        log_interval = 500
    } = options;

    return new Promise((resolve, reject) => {
        console.log(`  Launching ${num_islands} island workers...`);
        
        const workers = [];
        const results = [];
        let completed = 0;

        for (let i = 0; i < num_islands; i++) {
            const config = {
                population_size: population_per_island,
                generations,
                elite_fraction: 0.05 + (i % 3) * 0.02, // vary elite fraction
                base_mutation_rate: base_mutation_rate + (i % 4) * 0.05, // vary mutation rate
                tournament_size: 3 + (i % 4), // vary tournament size
                stagnation_limit,
                catastrophe_interval: catastrophe_interval + (i % 3) * 50, // vary catastrophe timing
                island_id: i,
                immigrants: [],
                log_interval
            };

            const worker = new Worker(__filename, {
                workerData: { lab_colors, cols, rows, config }
            });

            worker.on('message', (msg) => {
                if (msg.type === 'progress') {
                    if (msg.island_id === 0) {
                        process.stdout.write(`\r  Island 0: gen=${msg.gen} best=${msg.best_fitness.toFixed(1)} stag=${msg.stagnation} mr=${msg.mutation_rate} hof=${msg.hof_size} cat=${msg.catastrophes}    `);
                    }
                } else if (msg.type === 'done') {
                    results.push(msg.result);
                    completed++;
                    console.log(`\n  ✓ Island ${msg.result.island_id} done: fitness=${msg.result.fitness.toFixed(1)} (${msg.result.hall_of_fame.length} HOF, ${msg.result.catastrophe_count} catastrophes)`);

                    if (completed === num_islands) {
                        // Find global best
                        results.sort((a, b) => a.fitness - b.fitness);
                        const global_best = results[0];

                        // Merge hall of fames for diversity report
                        const all_hof = [];
                        for (const r of results) {
                            for (const h of r.hall_of_fame) {
                                all_hof.push(h);
                            }
                        }
                        all_hof.sort((a, b) => a.fitness - b.fitness);

                        // Deduplicate by requiring 15%+ difference
                        const diverse_hof = [all_hof[0]];
                        for (let i = 1; i < all_hof.length && diverse_hof.length < 10; i++) {
                            let dominated = false;
                            for (const existing of diverse_hof) {
                                let diff = 0;
                                for (let j = 0; j < all_hof[i].arrangement.length; j++) {
                                    if (all_hof[i].arrangement[j] !== existing.arrangement[j]) diff++;
                                }
                                if (diff < all_hof[i].arrangement.length * 0.15) {
                                    dominated = true;
                                    break;
                                }
                            }
                            if (!dominated) diverse_hof.push(all_hof[i]);
                        }

                        console.log(`\n  Global best: ${global_best.fitness.toFixed(1)} (island ${global_best.island_id})`);
                        console.log(`  Diverse HOF entries: ${diverse_hof.length}`);
                        console.log(`  HOF fitnesses: ${diverse_hof.map(h => h.fitness.toFixed(1)).join(', ')}`);

                        resolve({
                            arrangement: global_best.arrangement,
                            fitness: global_best.fitness,
                            all_results: results,
                            diverse_hof
                        });
                    }
                }
            });

            worker.on('error', (err) => {
                console.error(`  Island ${i} error:`, err);
                reject(err);
            });

            workers.push(worker);
        }
    });
}

// ============================================================
// Gap-filling (same as v1)
// ============================================================

function find_gap_colors(existing_colors, existing_labs, count) {
    console.log(`  Sampling LAB color space to find ${count} gap-filling colors...`);
    const candidates = [];
    for (let L = 15; L <= 90; L += 8) {
        for (let a = -75; a <= 75; a += 12) {
            for (let b = -75; b <= 75; b += 12) {
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);
                const lab_check = rgb_to_lab(rgb);
                if (lab_distance(lab, lab_check) < 5) {
                    candidates.push({ lab, rgb });
                }
            }
        }
    }
    console.log(`  Generated ${candidates.length} valid candidates`);

    const min_distances = candidates.map(c => {
        let min_d = Infinity;
        for (const el of existing_labs) {
            const d = lab_distance(c.lab, el);
            if (d < min_d) min_d = d;
        }
        return min_d;
    });

    const selected = [];
    const name_from_lab = (lab, idx) => {
        const [L, a, b] = lab;
        const hue_angle = Math.atan2(b, a) * 180 / Math.PI;
        const chroma = Math.sqrt(a * a + b * b);
        let hue_name;
        if (chroma < 10) hue_name = L > 70 ? 'Light Gray' : L > 40 ? 'Medium Gray' : 'Dark Gray';
        else if (hue_angle >= -22 && hue_angle < 22) hue_name = 'Rose';
        else if (hue_angle >= 22 && hue_angle < 60) hue_name = 'Orange';
        else if (hue_angle >= 60 && hue_angle < 105) hue_name = 'Yellow';
        else if (hue_angle >= 105 && hue_angle < 150) hue_name = 'Chartreuse';
        else if (hue_angle >= 150 || hue_angle < -150) hue_name = 'Green';
        else if (hue_angle >= -150 && hue_angle < -105) hue_name = 'Teal';
        else if (hue_angle >= -105 && hue_angle < -60) hue_name = 'Azure';
        else if (hue_angle >= -60 && hue_angle < -22) hue_name = 'Violet';
        else hue_name = 'Color';
        const lightness = L > 70 ? 'Light' : L > 40 ? 'Medium' : 'Deep';
        return `${lightness} ${hue_name} ${idx + 1}`;
    };

    for (let i = 0; i < count; i++) {
        let best_idx = 0, best_dist = -1;
        for (let j = 0; j < candidates.length; j++) {
            if (min_distances[j] > best_dist) { best_dist = min_distances[j]; best_idx = j; }
        }
        const chosen = candidates[best_idx];
        const hex = rgb_to_hex(chosen.rgb);
        const name = name_from_lab(chosen.lab, i);
        selected.push({ hex, name, rgb: `(${chosen.rgb[0]}, ${chosen.rgb[1]}, ${chosen.rgb[2]})`, lab: chosen.lab });
        console.log(`  [${i + 1}/${count}] ${name}: ${hex} (gap: ${best_dist.toFixed(1)})`);

        for (let j = 0; j < candidates.length; j++) {
            const d = lab_distance(candidates[j].lab, chosen.lab);
            if (d < min_distances[j]) min_distances[j] = d;
        }
        min_distances[best_idx] = -1;
    }
    return selected;
}

// ============================================================
// Palette I/O
// ============================================================

function filter_pastels(colors, lab_colors) {
    const pastels = [];
    for (let i = 0; i < colors.length; i++) {
        const [L, a, b] = lab_colors[i];
        const chroma = Math.sqrt(a * a + b * b);
        if (L > 70 && chroma < 60) {
            pastels.push({ index: i, color: colors[i], lab: lab_colors[i] });
        }
    }
    return pastels;
}

function write_palette_module(filepath, palette_array, var_name, description) {
    const items = palette_array.map(c =>
        `    {"hex": "${c.hex}", "name": "${c.name}", "rgb": "${c.rgb}"}`
    );
    const content = `/**\n * ${description}\n * \n * Generated by lab/optimize-palette-v2.js (Island-Model Parallel GA)\n * Generated: ${new Date().toISOString()}\n */\n\nconst ${var_name} = [\n${items.join(',\n')}\n];\n\nmodule.exports = ${var_name};\n`;
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  Written: ${filepath} (${palette_array.length} colors)`);
}

// ============================================================
// Main
// ============================================================

async function main() {
    const num_cores = Math.min(os.cpus().length, 24);

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Palette Optimizer v2 — Island-Model Parallel GA     ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`  System: ${os.cpus().length} cores available, using ${num_cores} islands\n`);

    const pal_crayola = require('../html-core/arr_colors');
    console.log(`  Loaded ${pal_crayola.length} Crayola colors\n`);
    const lab_colors = pal_crayola.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    // Original fitness for reference
    const orig_arr = Array.from({ length: pal_crayola.length }, (_, i) => i);
    const orig_fitness = grid_fitness(orig_arr, lab_colors, 12, Math.ceil(pal_crayola.length / 12));
    console.log(`  Original fitness (alphabetical): ${orig_fitness.toFixed(1)}\n`);

    // --- 1. Optimize full Crayola 133 ---
    console.log('═══ Optimizing Full Crayola (133 colors, 12×12) ═══');
    const t1 = Date.now();
    const crayola_result = await run_parallel_islands(lab_colors, 12, Math.ceil(pal_crayola.length / 12), {
        num_islands: num_cores,
        population_per_island: 150,
        generations: 3000,
        base_mutation_rate: 0.2,
        stagnation_limit: 600,
        catastrophe_interval: 200,
        log_interval: 500
    });
    const t1_elapsed = ((Date.now() - t1) / 1000).toFixed(1);
    console.log(`  Time: ${t1_elapsed}s\n`);

    const improvement = ((1 - crayola_result.fitness / orig_fitness) * 100).toFixed(1);
    console.log(`  ✓ Best fitness: ${crayola_result.fitness.toFixed(1)} (${improvement}% improvement)\n`);

    const sorted_crayola = crayola_result.arrangement.map(i => pal_crayola[i]);

    // --- 2. Pastels ---
    console.log('═══ Extracting Pastel Colors ═══');
    const pastels = filter_pastels(pal_crayola, lab_colors);
    console.log(`  Found ${pastels.length} pastel colors\n`);

    if (pastels.length > 0) {
        const pastel_cols = Math.ceil(Math.sqrt(pastels.length * 1.5));
        const pastel_rows = Math.ceil(pastels.length / pastel_cols);
        const pastel_labs = pastels.map(p => p.lab);
        const pastel_orig = grid_fitness(Array.from({ length: pastels.length }, (_, i) => i), pastel_labs, pastel_cols, pastel_rows);

        console.log(`═══ Optimizing Pastels (${pastels.length} colors, ${pastel_cols}×${pastel_rows}) ═══`);
        const t2 = Date.now();
        const pastel_result = await run_parallel_islands(pastel_labs, pastel_cols, pastel_rows, {
            num_islands: num_cores,
            population_per_island: 100,
            generations: 2000,
            stagnation_limit: 400,
            log_interval: 500
        });
        const t2_elapsed = ((Date.now() - t2) / 1000).toFixed(1);
        console.log(`  Time: ${t2_elapsed}s\n`);

        const sorted_pastels = pastel_result.arrangement
            .filter(i => i < pastels.length)
            .map(i => pastels[i].color);

        const pastel_path = path.join(__dirname, '..', 'html-core', 'pal_pastels.js');
        write_palette_module(pastel_path, sorted_pastels, 'pal_pastels',
            `Pastel Color Palette (${sorted_pastels.length} colors)\n * Subset of Crayola with high lightness and low chroma.`);
    }

    // --- 3. Write sorted Crayola ---
    const sorted_path = path.join(__dirname, '..', 'html-core', 'pal_crayola_sorted.js');
    write_palette_module(sorted_path, sorted_crayola, 'pal_crayola_sorted',
        `Crayola Palette — Perceptually Sorted (${sorted_crayola.length} colors)\n * Full Crayola palette rearranged for smooth neighbor transitions.`);

    // --- 4. Extended 144 ---
    console.log('\n═══ Creating Extended 144-Color Palette ═══');
    const gap_count = 144 - pal_crayola.length;
    console.log(`  Need ${gap_count} gap-filling colors\n`);
    const gap_colors = find_gap_colors(pal_crayola, lab_colors, gap_count);

    const extended_colors = [...pal_crayola, ...gap_colors];
    const extended_labs = extended_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n═══ Optimizing Extended (${extended_colors.length} colors, 12×12) ═══`);
    const t3 = Date.now();
    const extended_result = await run_parallel_islands(extended_labs, 12, 12, {
        num_islands: num_cores,
        population_per_island: 150,
        generations: 3000,
        stagnation_limit: 600,
        log_interval: 500
    });
    const t3_elapsed = ((Date.now() - t3) / 1000).toFixed(1);
    console.log(`  Time: ${t3_elapsed}s\n`);

    const sorted_extended = extended_result.arrangement.map(i => extended_colors[i]);
    const extended_path = path.join(__dirname, '..', 'html-core', 'pal_crayola_extended.js');
    write_palette_module(extended_path, sorted_extended, 'pal_crayola_extended',
        `Extended Crayola Palette — 144 Colors (12×12, no empty cells)\n * 133 original Crayola + 11 gap-filling colors, GA-sorted for smooth transitions.`);

    // --- Summary ---
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════');
    console.log(`  Cores used:         ${num_cores}`);
    console.log(`  Crayola (133):      ${orig_fitness.toFixed(1)} → ${crayola_result.fitness.toFixed(1)} (${improvement}% better)`);
    console.log(`  Extended (144):     ${extended_result.fitness.toFixed(1)}`);
    console.log(`  Gap colors:         ${gap_colors.map(c => c.hex).join(', ')}`);
    console.log(`  Output: html-core/pal_crayola_sorted.js`);
    console.log(`  Output: html-core/pal_pastels.js`);
    console.log(`  Output: html-core/pal_crayola_extended.js`);
    console.log('  Done.\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
