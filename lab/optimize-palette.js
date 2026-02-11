/**
 * Palette Arrangement Optimizer (Genetic Algorithm)
 * 
 * Rearranges color palettes so that neighboring cells in a 2D grid
 * have minimal perceptual color difference (measured in CIELAB space).
 * 
 * Produces:
 *   - html-core/pal_crayola_sorted.js  (full 133-color Crayola, optimized)
 *   - html-core/pal_pastels.js          (pastel subset, optimized)
 * 
 * Usage:
 *   node lab/optimize-palette.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// Color Space Conversions
// ============================================================

/** Parse hex string (#RRGGBB) to [R, G, B] in 0-255 */
function hex_to_rgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16)
    ];
}

/** Convert sRGB [0-255] to CIELAB [L*, a*, b*] */
function rgb_to_lab(rgb) {
    // sRGB → linear RGB
    let [r, g, b] = rgb.map(v => {
        v = v / 255;
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    });

    // Linear RGB → XYZ (D65 illuminant)
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    // Normalize by D65 white point
    x /= 0.95047;
    y /= 1.00000;
    z /= 1.08883;

    // XYZ → LAB
    const f = v => v > 0.008856 ? Math.pow(v, 1 / 3) : (7.787 * v) + (16 / 116);
    const fx = f(x), fy = f(y), fz = f(z);

    return [
        (116 * fy) - 16,      // L*
        500 * (fx - fy),      // a*
        200 * (fy - fz)       // b*
    ];
}

/** Euclidean distance in CIELAB space (ΔE*ab) */
function lab_distance(lab1, lab2) {
    const dL = lab1[0] - lab2[0];
    const da = lab1[1] - lab2[1];
    const db = lab1[2] - lab2[2];
    return Math.sqrt(dL * dL + da * da + db * db);
}

// ============================================================
// Grid Fitness
// ============================================================

/**
 * Calculate total neighbor distance for a 2D grid arrangement.
 * Lower is better — means neighboring colors are more similar.
 * 
 * @param {number[]} arrangement - Array of color indices (length = cols*rows)
 * @param {number[][]} lab_colors - LAB values for each color index
 * @param {number} cols - Grid columns
 * @param {number} rows - Grid rows
 * @returns {number} Total distance
 */
function grid_fitness(arrangement, lab_colors, cols, rows) {
    let total = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            if (idx >= arrangement.length) continue;

            const color_idx = arrangement[idx];
            const lab = lab_colors[color_idx];

            // Right neighbor
            if (x + 1 < cols) {
                const right_idx = y * cols + (x + 1);
                if (right_idx < arrangement.length) {
                    total += lab_distance(lab, lab_colors[arrangement[right_idx]]);
                }
            }

            // Bottom neighbor
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
// Genetic Algorithm
// ============================================================

/** Create a random permutation of [0..n-1] */
function random_permutation(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/** Order Crossover (OX) — produces one child from two parents */
function order_crossover(parent1, parent2) {
    const n = parent1.length;
    const start = Math.floor(Math.random() * n);
    const end = start + Math.floor(Math.random() * (n - start));

    const child = new Array(n).fill(-1);
    const used = new Set();

    // Copy segment from parent1
    for (let i = start; i <= end; i++) {
        child[i] = parent1[i];
        used.add(parent1[i]);
    }

    // Fill remaining from parent2 in order
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

/** Swap mutation — swap two random positions */
function swap_mutate(arrangement) {
    const n = arrangement.length;
    const a = Math.floor(Math.random() * n);
    let b = Math.floor(Math.random() * (n - 1));
    if (b >= a) b++;
    const result = [...arrangement];
    [result[a], result[b]] = [result[b], result[a]];
    return result;
}

/** Segment reversal mutation — reverse a random segment */
function reverse_mutate(arrangement) {
    const n = arrangement.length;
    let a = Math.floor(Math.random() * n);
    let b = Math.floor(Math.random() * n);
    if (a > b) [a, b] = [b, a];
    const result = [...arrangement];
    while (a < b) {
        [result[a], result[b]] = [result[b], result[a]];
        a++;
        b--;
    }
    return result;
}

/** Tournament selection */
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

/**
 * Run the GA to optimize palette arrangement.
 * 
 * @param {number[][]} lab_colors - LAB values for each color
 * @param {number} cols - Grid columns
 * @param {number} rows - Grid rows
 * @param {Object} options
 * @returns {{arrangement: number[], fitness: number}}
 */
function optimize(lab_colors, cols, rows, options = {}) {
    const {
        population_size = 200,
        generations = 2000,
        elite_fraction = 0.05,
        mutation_rate = 0.2,
        tournament_size = 5,
        stagnation_limit = 300,
        log_interval = 100
    } = options;

    const n = lab_colors.length;
    const elite_count = Math.max(1, Math.floor(population_size * elite_fraction));

    // Initialize population
    let population = Array.from({ length: population_size }, () => random_permutation(n));
    let fitnesses = population.map(p => grid_fitness(p, lab_colors, cols, rows));

    let best_fitness = Infinity;
    let best_arrangement = null;
    let stagnation = 0;

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
        } else {
            stagnation++;
        }

        if (gen % log_interval === 0 || gen === generations - 1) {
            console.log(`  Gen ${gen.toString().padStart(4)}: best=${best_fitness.toFixed(1)}  current_best=${sorted_fit[0].toFixed(1)}  stagnation=${stagnation}`);
        }

        // Early stopping
        if (stagnation >= stagnation_limit) {
            console.log(`  Early stop at gen ${gen} (no improvement for ${stagnation_limit} gens)`);
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

            let child = order_crossover(parent1, parent2);

            if (Math.random() < mutation_rate) {
                child = Math.random() < 0.5 ? swap_mutate(child) : reverse_mutate(child);
            }

            // Additional random swap for diversity
            if (Math.random() < 0.05) {
                child = swap_mutate(child);
            }

            next_population.push(child);
        }

        population = next_population;
        fitnesses = population.map(p => grid_fitness(p, lab_colors, cols, rows));
    }

    return { arrangement: best_arrangement, fitness: best_fitness };
}

// ============================================================
// Palette Generation
// ============================================================

/**
 * Filter pastel colors from a palette.
 * Pastels have high lightness (L* > 70) and moderate chroma.
 */
function filter_pastels(colors, lab_colors) {
    const pastels = [];
    for (let i = 0; i < colors.length; i++) {
        const [L, a, b] = lab_colors[i];
        const chroma = Math.sqrt(a * a + b * b);
        // Pastel: high lightness, not too saturated
        if (L > 70 && chroma < 60) {
            pastels.push({ index: i, color: colors[i], lab: lab_colors[i] });
        }
    }
    return pastels;
}

/**
 * Convert CIELAB [L*, a*, b*] back to sRGB [0-255].
 * Clamps to valid sRGB range.
 */
function lab_to_rgb(lab) {
    const [L, a, b] = lab;

    // LAB → XYZ
    const fy = (L + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const f_inv = t => t > 0.206893 ? t * t * t : (t - 16 / 116) / 7.787;

    let x = f_inv(fx) * 0.95047;
    let y = f_inv(fy) * 1.00000;
    let z = f_inv(fz) * 1.08883;

    // XYZ → linear RGB
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let bl = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

    // Linear RGB → sRGB
    const gamma = v => v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;

    return [
        Math.max(0, Math.min(255, Math.round(gamma(r) * 255))),
        Math.max(0, Math.min(255, Math.round(gamma(g) * 255))),
        Math.max(0, Math.min(255, Math.round(gamma(bl) * 255)))
    ];
}

/** Convert [R,G,B] to #RRGGBB hex string */
function rgb_to_hex(rgb) {
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
}

/**
 * Find N colors that fill the biggest gaps in the existing palette.
 * 
 * Strategy: Sample the LAB color space densely, then greedily pick
 * the sample point most distant from all existing + already-picked colors.
 * This is a maximin approach that maximizes color space coverage.
 * 
 * @param {Object[]} existing_colors - Array of {hex, name, rgb} objects
 * @param {number[][]} existing_labs - LAB values for existing colors
 * @param {number} count - How many gap colors to find
 * @returns {Object[]} Array of {hex, name, rgb, lab} for the new colors
 */
function find_gap_colors(existing_colors, existing_labs, count) {
    console.log(`  Sampling LAB color space to find ${count} gap-filling colors...`);

    // Generate candidate colors by sampling LAB space
    // L*: 10-95, a*: -80 to 80, b*: -80 to 80
    const candidates = [];
    const step_L = 8;
    const step_ab = 12;

    for (let L = 15; L <= 90; L += step_L) {
        for (let a = -75; a <= 75; a += step_ab) {
            for (let b = -75; b <= 75; b += step_ab) {
                const lab = [L, a, b];
                const rgb = lab_to_rgb(lab);

                // Check if it's a valid sRGB color (not clamped)
                const lab_check = rgb_to_lab(rgb);
                const round_trip_error = lab_distance(lab, lab_check);
                if (round_trip_error < 5) {
                    candidates.push({ lab, rgb });
                }
            }
        }
    }

    console.log(`  Generated ${candidates.length} valid candidate colors`);

    // Pre-compute distance from each candidate to nearest existing color
    const min_distances = candidates.map(c => {
        let min_d = Infinity;
        for (const existing_lab of existing_labs) {
            const d = lab_distance(c.lab, existing_lab);
            if (d < min_d) min_d = d;
        }
        return min_d;
    });

    // Greedily pick the most distant candidates
    const selected = [];
    const selected_labs = [...existing_labs];

    // Descriptive naming based on LAB position
    const name_from_lab = (lab, idx) => {
        const [L, a, b] = lab;
        let hue_name;
        const hue_angle = Math.atan2(b, a) * 180 / Math.PI;
        const chroma = Math.sqrt(a * a + b * b);

        if (chroma < 10) {
            hue_name = L > 70 ? 'Light Gray' : L > 40 ? 'Medium Gray' : 'Dark Gray';
        } else if (hue_angle >= -22 && hue_angle < 22) hue_name = 'Rose';
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
        // Find the candidate with maximum minimum distance
        let best_idx = 0;
        let best_dist = -1;

        for (let j = 0; j < candidates.length; j++) {
            if (min_distances[j] > best_dist) {
                best_dist = min_distances[j];
                best_idx = j;
            }
        }

        const chosen = candidates[best_idx];
        const hex = rgb_to_hex(chosen.rgb);
        const name = name_from_lab(chosen.lab, i);
        const rgb_str = `(${chosen.rgb[0]}, ${chosen.rgb[1]}, ${chosen.rgb[2]})`;

        selected.push({
            hex,
            name,
            rgb: rgb_str,
            lab: chosen.lab
        });

        console.log(`  [${i + 1}/${count}] ${name}: ${hex} (gap distance: ${best_dist.toFixed(1)})`);

        // Update distances: new color reduces gaps
        selected_labs.push(chosen.lab);
        for (let j = 0; j < candidates.length; j++) {
            const d = lab_distance(candidates[j].lab, chosen.lab);
            if (d < min_distances[j]) {
                min_distances[j] = d;
            }
        }

        // Remove the chosen candidate to avoid duplicates
        min_distances[best_idx] = -1;
    }

    return selected;
}

/**
 * Write a palette array to a JS module file.
 */
function write_palette_module(filepath, palette_array, var_name, description) {
    const items = palette_array.map(c => {
        return `    {"hex": "${c.hex}", "name": "${c.name}", "rgb": "${c.rgb}"}`;
    });

    const content = `/**
 * ${description}
 * 
 * Generated by lab/optimize-palette.js using a Genetic Algorithm
 * to minimize perceptual color distance between neighboring cells.
 * Generated: ${new Date().toISOString()}
 */

const ${var_name} = [
${items.join(',\n')}
];

module.exports = ${var_name};
`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  Written: ${filepath} (${palette_array.length} colors)`);
}

// ============================================================
// Main
// ============================================================

function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Color Palette Arrangement Optimizer (GA)            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // Load colors
    const pal_crayola = require('../html-core/arr_colors');
    console.log(`Loaded ${pal_crayola.length} Crayola colors\n`);

    // Convert to LAB
    const lab_colors = pal_crayola.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    // --- 1. Calculate original fitness ---
    const original_arrangement = Array.from({ length: pal_crayola.length }, (_, i) => i);
    const original_cols = 12, original_rows = Math.ceil(pal_crayola.length / 12);
    const original_fitness = grid_fitness(original_arrangement, lab_colors, original_cols, original_rows);
    console.log(`Original Crayola fitness (alphabetical): ${original_fitness.toFixed(1)}\n`);

    // --- 2. Optimize full Crayola palette (133) ---
    console.log('═══ Optimizing Full Crayola Palette (133 colors, 12×12) ═══');
    const crayola_result = optimize(lab_colors, original_cols, original_rows, {
        population_size: 300,
        generations: 3000,
        mutation_rate: 0.25,
        stagnation_limit: 400,
        log_interval: 200
    });

    const improvement = ((1 - crayola_result.fitness / original_fitness) * 100).toFixed(1);
    console.log(`\n  ✓ Optimized fitness: ${crayola_result.fitness.toFixed(1)} (${improvement}% improvement)\n`);

    // Build sorted palette
    const sorted_crayola = crayola_result.arrangement.map(i => pal_crayola[i]);

    // --- 3. Extract and optimize pastels ---
    console.log('═══ Extracting Pastel Colors ═══');
    const pastels = filter_pastels(pal_crayola, lab_colors);
    console.log(`  Found ${pastels.length} pastel colors\n`);

    if (pastels.length > 0) {
        const pastel_cols = Math.ceil(Math.sqrt(pastels.length * 1.5)); // wider than tall
        const pastel_rows = Math.ceil(pastels.length / pastel_cols);
        console.log(`  Grid: ${pastel_cols}×${pastel_rows}\n`);

        const pastel_labs = pastels.map(p => p.lab);
        const pastel_original_fitness = grid_fitness(
            Array.from({ length: pastels.length }, (_, i) => i),
            pastel_labs, pastel_cols, pastel_rows
        );
        console.log(`  Original pastel fitness: ${pastel_original_fitness.toFixed(1)}`);

        console.log('\n═══ Optimizing Pastel Palette ═══');
        const pastel_result = optimize(pastel_labs, pastel_cols, pastel_rows, {
            population_size: 200,
            generations: 2000,
            mutation_rate: 0.2,
            stagnation_limit: 300,
            log_interval: 200
        });

        const pastel_improvement = ((1 - pastel_result.fitness / pastel_original_fitness) * 100).toFixed(1);
        console.log(`\n  ✓ Optimized pastel fitness: ${pastel_result.fitness.toFixed(1)} (${pastel_improvement}% improvement)\n`);

        // Build pastel palette
        const sorted_pastels = pastel_result.arrangement
            .filter(i => i < pastels.length)
            .map(i => pastels[i].color);

        // Write pastel palette
        const pastel_path = path.join(__dirname, '..', 'html-core', 'pal_pastels.js');
        write_palette_module(pastel_path, sorted_pastels, 'pal_pastels',
            `Pastel Color Palette (${sorted_pastels.length} colors)\n * Subset of Crayola with high lightness and low chroma.`);
    }

    // --- 4. Write optimized Crayola palette ---
    const sorted_path = path.join(__dirname, '..', 'html-core', 'pal_crayola_sorted.js');
    write_palette_module(sorted_path, sorted_crayola, 'pal_crayola_sorted',
        `Crayola Palette — Perceptually Sorted (${sorted_crayola.length} colors)\n * Full Crayola palette rearranged for smooth neighbor transitions.`);

    // --- 5. Extended palette: 144 colors (12×12, no gaps) ---
    console.log('\n═══ Creating Extended 144-Color Palette ═══');
    const target = 144;  // 12 × 12
    const gap_count = target - pal_crayola.length;
    console.log(`  Need ${gap_count} additional colors to fill 12×12 grid\n`);

    const gap_colors = find_gap_colors(pal_crayola, lab_colors, gap_count);

    // Combine original + gap colors
    const extended_colors = [...pal_crayola, ...gap_colors];
    const extended_labs = extended_colors.map(c => rgb_to_lab(hex_to_rgb(c.hex)));

    console.log(`\n═══ Optimizing Extended Palette (${extended_colors.length} colors, 12×12) ═══`);
    const extended_result = optimize(extended_labs, 12, 12, {
        population_size: 300,
        generations: 3000,
        mutation_rate: 0.25,
        stagnation_limit: 400,
        log_interval: 200
    });

    const extended_unsorted_fitness = grid_fitness(
        Array.from({ length: extended_colors.length }, (_, i) => i),
        extended_labs, 12, 12
    );
    const ext_improvement = ((1 - extended_result.fitness / extended_unsorted_fitness) * 100).toFixed(1);
    console.log(`\n  ✓ Extended fitness: ${extended_result.fitness.toFixed(1)} (${ext_improvement}% vs unsorted)\n`);

    const sorted_extended = extended_result.arrangement.map(i => extended_colors[i]);

    const extended_path = path.join(__dirname, '..', 'html-core', 'pal_crayola_extended.js');
    write_palette_module(extended_path, sorted_extended, 'pal_crayola_extended',
        `Extended Crayola Palette — 144 Colors (12×12, no empty cells)\n * 133 original Crayola + 11 gap-filling colors, GA-sorted for smooth transitions.`);

    // --- 6. Summary ---
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════');
    console.log(`  Full Crayola (133): ${original_fitness.toFixed(1)} → ${crayola_result.fitness.toFixed(1)} (${improvement}% better)`);
    console.log(`  Extended (144):     ${extended_unsorted_fitness.toFixed(1)} → ${extended_result.fitness.toFixed(1)} (${ext_improvement}% better)`);
    console.log(`  Gap colors added:   ${gap_colors.map(c => c.hex).join(', ')}`);
    console.log(`  Output: html-core/pal_crayola_sorted.js`);
    console.log(`  Output: html-core/pal_pastels.js`);
    console.log(`  Output: html-core/pal_crayola_extended.js`);
    console.log('  Done.\n');
}

main();

